package com.ruoyi.web.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.ruoyi.common.utils.StringUtils;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 调用兼容 OpenAI Chat Completions 的 HTTP API（DeepSeek、Groq、SiliconFlow、OpenRouter、官方 OpenAI 等）。
 * <p>
 * 配置项见 {@code ruoyi.openaiApi.*}，需在 {@code ruoyi.llm.provider=openai-compatible} 时生效。
 */
@Service
public class OpenAiCompatibleLlmService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleLlmService.class);

    @Value("${ruoyi.openaiApi.baseUrl:}")
    private String baseUrl;

    @Value("${ruoyi.openaiApi.apiKey:}")
    private String apiKey;

    @Value("${ruoyi.openaiApi.model:}")
    private String model;

    /** 非流式/流式请求最大生成 token，可按费用调小 */
    @Value("${ruoyi.openaiApi.maxTokens:1024}")
    private int maxTokens;

    /** OpenRouter 等建议的调用来源（可选） */
    @Value("${ruoyi.openaiApi.httpReferer:http://localhost:8080}")
    private String httpReferer;

    /** OpenRouter 等建议的应用标题（可选） */
    @Value("${ruoyi.openaiApi.appTitle:RuoYi-Admin-Assistant}")
    private String appTitle;

    /** 主模型失败（5xx 等）时改用的模型 id，空则不重试 */
    @Value("${ruoyi.openaiApi.fallback-model:}")
    private String fallbackModel;

    /** 为 true 时 generateStream 只调非流式接口一次（适合 OpenRouter 免费档流式易 500） */
    @Value("${ruoyi.openaiApi.prefer-non-stream:false}")
    private boolean preferNonStream;

    private String normalizedV1Base;
    private OkHttpClient client;

    @PostConstruct
    public void init() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(180, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        this.normalizedV1Base = normalizeV1Base(baseUrl);
        if (StringUtils.isBlank(this.model)) {
            String inferred = tryInferLocalDefaultModelId();
            if (StringUtils.isNotEmpty(inferred)) {
                this.model = inferred;
                log.info("ruoyi.openaiApi.model 未配置，已自动选用本机模型: {}", inferred);
            }
        }
        log.info("OpenAiCompatibleLlmService 初始化: baseUrl={}, model={}, fallback={}, preferNonStream={}",
                normalizedV1Base, model,
                StringUtils.isEmpty(fallbackModel) ? "(none)" : fallbackModel.trim(),
                preferNonStream);
    }

    /** 本机且 model 为空时，从 GET /v1/models 取第一个 id */
    private String tryInferLocalDefaultModelId() {
        if (!isLikelyLocalInferenceServer() || StringUtils.isEmpty(normalizedV1Base)) {
            return null;
        }
        String token = bearerToken();
        if (StringUtils.isEmpty(token)) {
            return null;
        }
        Request request = new Request.Builder()
                .url(modelsUrl())
                .header("Authorization", "Bearer " + token)
                .get()
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
                return null;
            }
            JSONObject root = JSON.parseObject(response.body().string());
            if (root == null || !root.containsKey("data")) {
                return null;
            }
            JSONArray data = root.getJSONArray("data");
            if (data == null || data.isEmpty()) {
                return null;
            }
            JSONObject first = data.getJSONObject(0);
            return first == null ? null : first.getString("id");
        } catch (Exception e) {
            log.warn("自动探测本机模型 id 失败: {}", e.getMessage());
            return null;
        }
    }

    private static String normalizeV1Base(String raw) {
        if (StringUtils.isEmpty(raw)) {
            return "";
        }
        String b = raw.trim();
        while (b.endsWith("/")) {
            b = b.substring(0, b.length() - 1);
        }
        if (!b.endsWith("/v1")) {
            b = b + "/v1";
        }
        return b;
    }

    private String chatCompletionsUrl() {
        return normalizedV1Base + "/chat/completions";
    }

    private String modelsUrl() {
        return normalizedV1Base + "/models";
    }

    private boolean isOpenRouter() {
        return normalizedV1Base != null && normalizedV1Base.contains("openrouter.ai");
    }

    /** 本机 OpenAI 兼容服务（LM Studio、本地 llama.cpp 等），未配置 apiKey 时仍可用占位 Bearer */
    private boolean isLikelyLocalInferenceServer() {
        if (StringUtils.isEmpty(normalizedV1Base)) {
            return false;
        }
        String b = normalizedV1Base.toLowerCase();
        return b.contains("127.0.0.1") || b.contains("localhost")
                || b.contains("192.168.") || b.contains(":1234");
    }

    private String bearerToken() {
        if (StringUtils.isNotEmpty(apiKey)) {
            return apiKey.trim();
        }
        if (isLikelyLocalInferenceServer()) {
            return "lm-studio";
        }
        return "";
    }

    /** OpenRouter 文档建议的标识头；流式请求增加 Accept */
    private void applyProviderHeaders(Request.Builder builder, boolean streaming) {
        if (streaming) {
            builder.header("Accept", "text/event-stream");
        }
        if (isOpenRouter()) {
            if (StringUtils.isNotEmpty(httpReferer)) {
                builder.header("HTTP-Referer", httpReferer.trim());
            }
            if (StringUtils.isNotEmpty(appTitle)) {
                builder.header("X-Title", appTitle.trim());
                builder.header("X-OpenRouter-Title", appTitle.trim());
            }
        }
    }

    public boolean healthCheck() {
        if (StringUtils.isEmpty(normalizedV1Base) || StringUtils.isEmpty(bearerToken())) {
            return false;
        }
        Request.Builder rb = new Request.Builder()
                .url(modelsUrl())
                .header("Authorization", "Bearer " + bearerToken());
        applyProviderHeaders(rb, false);
        Request request = rb.get().build();
        try (Response response = client.newCall(request).execute()) {
            boolean ok = response.isSuccessful();
            if (!ok) {
                log.warn("OpenAI 兼容 API /models 状态码: {}", response.code());
            }
            return ok;
        } catch (Exception e) {
            log.warn("OpenAI 兼容 API 健康检查失败: {}", e.getMessage());
            return false;
        }
    }

    public String generate(String userPrompt, String systemPrompt) {
        if (StringUtils.isEmpty(normalizedV1Base) || StringUtils.isEmpty(bearerToken())) {
            return buildMissingConfigMessage();
        }
        String primary = nonStreamChat(model, userPrompt, systemPrompt);
        if (shouldTryFallback(primary)) {
            String fb = fallbackModel == null ? "" : fallbackModel.trim();
            if (StringUtils.isNotEmpty(fb) && !fb.equals(StringUtils.trimToEmpty(model))) {
                log.warn("主模型请求失败，尝试备用模型: {}", fb);
                String second = nonStreamChat(fb, userPrompt, systemPrompt);
                if (!shouldTryFallback(second)) {
                    return second;
                }
            }
        }
        return primary;
    }

    private static boolean shouldTryFallback(String result) {
        return result != null && result.startsWith("❌");
    }

    /**
     * 非流式 Chat Completions，指定 model id（与 OpenRouter 模型页一致）。
     * 对 HTTP 429 按上游 Retry-After / metadata 等待后自动再请求一次。
     */
    private String nonStreamChat(String modelId, String userPrompt, String systemPrompt) {
        final int maxAttempts = 2;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            Map<String, Object> body = buildChatBody(userPrompt, systemPrompt, false, modelId);
            String json = JSON.toJSONString(body);
            RequestBody reqBody = RequestBody.create(json, MediaType.parse("application/json; charset=utf-8"));
            Request.Builder reqBuilder = new Request.Builder()
                    .url(chatCompletionsUrl())
                    .header("Authorization", "Bearer " + bearerToken())
                    .header("Content-Type", "application/json; charset=utf-8");
            applyProviderHeaders(reqBuilder, false);
            Request request = reqBuilder.post(reqBody).build();
            try (Response response = client.newCall(request).execute()) {
                String respStr = response.body() != null ? response.body().string() : "";
                int code = response.code();
                if (code == 429 && attempt < maxAttempts - 1) {
                    long waitSec = parseRetryAfterSeconds(respStr, response);
                    waitSec = Math.min(Math.max(waitSec, 3L), 60L);
                    log.warn("HTTP 429 上游限流 model={}，等待 {} 秒后自动重试（{}/{}）",
                            modelId, waitSec, attempt + 1, maxAttempts);
                    try {
                        Thread.sleep(waitSec * 1000L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return "❌ 请求已中断";
                    }
                    continue;
                }
                if (!response.isSuccessful()) {
                    log.error("Chat Completions 失败 model={} code={}, body={}", modelId, code, respStr);
                    return "❌ 云端模型请求失败（HTTP " + code + "）\n" + shortErrorFromBody(respStr);
                }
                JSONObject root = JSON.parseObject(respStr);
                if (root == null) {
                    return "❌ 响应解析失败";
                }
                if (root.containsKey("error")) {
                    JSONObject err = root.getJSONObject("error");
                    return "❌ " + (err != null ? err.getString("message") : "未知错误");
                }
                JSONArray choices = root.getJSONArray("choices");
                if (choices == null || choices.isEmpty()) {
                    return "❌ 响应中无 choices 字段";
                }
                JSONObject message = choices.getJSONObject(0).getJSONObject("message");
                String content = message == null ? null : message.getString("content");
                return content != null ? content.trim() : "❌ 空内容";
            } catch (IOException e) {
                log.error("Chat Completions IO 异常", e);
                return "❌ 网络错误：" + e.getMessage();
            }
        }
        return "❌ 云端模型请求失败（HTTP 429，限流重试后仍失败）\n"
                + "免费模型共用额度，请稍后再试或在 OpenRouter 绑定自有模型 Key 提升限额：https://openrouter.ai/settings/integrations";
    }

    /** OpenRouter 等在 JSON 或 Header 中给出的等待秒数 */
    private static long parseRetryAfterSeconds(String respStr, Response response) {
        try {
            JSONObject o = JSON.parseObject(respStr);
            if (o != null && o.containsKey("error")) {
                JSONObject err = o.getJSONObject("error");
                if (err != null && err.containsKey("metadata")) {
                    JSONObject meta = err.getJSONObject("metadata");
                    if (meta != null) {
                        if (meta.containsKey("retry_after_seconds")) {
                            return Math.round(meta.getDouble("retry_after_seconds"));
                        }
                        if (meta.containsKey("retry_after_seconds_raw")) {
                            return Math.round(meta.getDouble("retry_after_seconds_raw"));
                        }
                    }
                }
            }
        } catch (Exception ignored) {
            // ignore
        }
        String h = response.header("Retry-After");
        if (StringUtils.isNotEmpty(h)) {
            try {
                return Long.parseLong(h.trim());
            } catch (NumberFormatException ignored) {
                // ignore
            }
        }
        return 25L;
    }

    public void generateStream(String userPrompt, String systemPrompt, LlmStreamCallback callback) {
        if (StringUtils.isEmpty(normalizedV1Base) || StringUtils.isEmpty(bearerToken())) {
            callback.onError(buildMissingConfigMessage());
            return;
        }
        if (preferNonStream) {
            String text = generate(userPrompt, systemPrompt);
            if (text != null && text.startsWith("❌")) {
                callback.onError(text);
                return;
            }
            if (StringUtils.isNotEmpty(text)) {
                callback.onChunk(text);
            }
            callback.onComplete();
            return;
        }
        Map<String, Object> body = buildChatBody(userPrompt, systemPrompt, true, null);
        String json = JSON.toJSONString(body);
        RequestBody reqBody = RequestBody.create(json, MediaType.parse("application/json; charset=utf-8"));
        Request.Builder streamBuilder = new Request.Builder()
                .url(chatCompletionsUrl())
                .header("Authorization", "Bearer " + bearerToken())
                .header("Content-Type", "application/json; charset=utf-8");
        applyProviderHeaders(streamBuilder, true);
        Request request = streamBuilder.post(reqBody).build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String err = response.body() != null ? response.body().string() : "";
                int code = response.code();
                log.error("流式 Chat Completions 失败 code={}, body={}", code, err);
                // 部分免费模型/上游对流式返回 5xx，非流式仍可用
                if (code >= 500 && code <= 599) {
                    log.warn("流式接口返回 5xx，尝试非流式 Chat Completions 一次");
                    String text = generate(userPrompt, systemPrompt);
                    if (StringUtils.isNotEmpty(text) && !text.startsWith("❌")) {
                        callback.onChunk(text);
                        callback.onComplete();
                        return;
                    }
                    if (StringUtils.isNotEmpty(text)) {
                        callback.onError(text);
                        return;
                    }
                }
                callback.onError("云端模型请求失败（HTTP " + code + "）\n" + shortErrorFromBody(err));
                return;
            }
            ResponseBody rb = response.body();
            if (rb == null) {
                callback.onError("响应体为空");
                return;
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(rb.byteStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isEmpty()) {
                        continue;
                    }
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String data = line.substring(5).trim();
                    if ("[DONE]".equals(data)) {
                        callback.onComplete();
                        return;
                    }
                    try {
                        JSONObject obj = JSON.parseObject(data);
                        if (obj.containsKey("error")) {
                            JSONObject err = obj.getJSONObject("error");
                            callback.onError(err != null ? err.getString("message") : "未知错误");
                            return;
                        }
                        JSONArray choices = obj.getJSONArray("choices");
                        if (choices != null && !choices.isEmpty()) {
                            JSONObject choice0 = choices.getJSONObject(0);
                            JSONObject delta = choice0.getJSONObject("delta");
                            if (delta != null) {
                                String piece = delta.getString("content");
                                if (StringUtils.isNotEmpty(piece)) {
                                    callback.onChunk(piece);
                                }
                            }
                        }
                    } catch (Exception parseEx) {
                        log.debug("跳过无法解析的 SSE 行: {}", line);
                    }
                }
            }
            callback.onComplete();
        } catch (IOException e) {
            log.error("流式请求 IO 异常", e);
            callback.onError("网络错误：" + e.getMessage());
        }
    }

    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean available = healthCheck();
        status.put("available", available);
        status.put("url", chatCompletionsUrl());
        status.put("model", model);
        status.put("provider", "openai-compatible");
        status.put("message", available ? "OpenAI 兼容 API 可用" : "不可用：请检查 baseUrl、密钥（本地 LM Studio 可不配）及 GET /v1/models");
        return status;
    }

    private Map<String, Object> buildChatBody(String userPrompt, String systemPrompt, boolean stream, String modelOverride) {
        Map<String, Object> body = new HashMap<>();
        String mid = StringUtils.isNotEmpty(modelOverride) ? modelOverride.trim() : (model == null ? "" : model.trim());
        body.put("model", mid);
        body.put("stream", stream);
        body.put("temperature", 0.7);
        body.put("max_tokens", maxTokens);
        JSONArray messages = new JSONArray();
        if (StringUtils.isNotEmpty(systemPrompt)) {
            JSONObject sys = new JSONObject();
            sys.put("role", "system");
            sys.put("content", systemPrompt);
            messages.add(sys);
        }
        JSONObject user = new JSONObject();
        user.put("role", "user");
        user.put("content", userPrompt == null ? "" : userPrompt);
        messages.add(user);
        body.put("messages", messages);
        return body;
    }

    private String buildMissingConfigMessage() {
        return "❌ 未配置 LM Studio（或 OpenAI 兼容）接口\n\n"
                + "请设置 ruoyi.openaiApi.baseUrl（默认 http://127.0.0.1:1234/v1），并启动 LM Studio Local Server。\n"
                + "本机可不填 apiKey；须 ruoyi.llm.provider=openai-compatible，model 留空时会自动探测 /v1/models。\n";
    }

    private String shortErrorFromBody(String body) {
        if (StringUtils.isEmpty(body)) {
            return "";
        }
        if (body.length() > 1200) {
            return body.substring(0, 1200) + "...";
        }
        try {
            JSONObject o = JSON.parseObject(body);
            if (o != null && o.containsKey("error")) {
                JSONObject err = o.getJSONObject("error");
                if (err == null) {
                    return body;
                }
                String msg = err.getString("message");
                if (err.containsKey("metadata")) {
                    JSONObject meta = err.getJSONObject("metadata");
                    if (meta != null && meta.containsKey("raw")) {
                        String raw = meta.getString("raw");
                        if (StringUtils.isNotEmpty(raw)) {
                            return (msg != null ? msg : "error") + "\n" + raw;
                        }
                    }
                }
                return msg != null ? msg : body;
            }
        } catch (Exception ignored) {
            // ignore
        }
        return body;
    }
}
