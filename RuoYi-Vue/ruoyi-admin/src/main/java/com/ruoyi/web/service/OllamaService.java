package com.ruoyi.web.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Ollama 本地 AI 服务（优化版）
 * 
 * 调用本地运行的 Ollama 服务（默认 127.0.0.1:11434；需在配置中提供 ruoyi.ollama.* 且 llm.provider=ollama 时启用）
 * 
 * 优化内容：
 * - 增强错误诊断和日志
 * - 添加服务健康检查和状态缓存
 * - 改进重试机制（指数退避）
 * - 提供详细的错误提示
 */
@Service
public class OllamaService {

    private static final Logger log = LoggerFactory.getLogger(OllamaService.class);

    /** 与 ollama serve 一致，勿尾随 / */
    @Value("${ruoyi.ollama.base-url:http://127.0.0.1:11434}")
    private String ollamaBaseUrl;

    /** 须已通过 ollama pull 下载，名称与 ollama list 一致 */
    @Value("${ruoyi.ollama.model:gemma2:2b}")
    private String modelName;

    /**
     * KV 缓存上下文长度；过大易触发 Ollama「memory layout cannot be allocated」。
     * 机器内存/显存紧张时请保持 512～1024。
     */
    @Value("${ruoyi.ollama.num-ctx:1024}")
    private int ollamaNumCtx;

    /**
     * 放入 GPU 的层数策略：-1 表示不在请求里指定（交给 Ollama 默认）；
     * 0 表示全部在 CPU，可缓解显存不足或部分驱动的分配失败。
     */
    @Value("${ruoyi.ollama.num-gpu:-1}")
    private int ollamaNumGpu;

    private String ollamaGenerateUrl;
    private String ollamaTagsUrl;

    private final OkHttpClient client;
    
    // 服务状态缓存
    private volatile Boolean serviceAvailable = null;
    private volatile long lastHealthCheckTime = 0;
    private static final long HEALTH_CHECK_INTERVAL = 60000; // 1分钟

    public OllamaService() {
        // 创建 HTTP 客户端，设置超时时间
        this.client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)  // 连接超时
                .readTimeout(120, TimeUnit.SECONDS)    // 读取超时（AI 生成需要时间）
                .writeTimeout(10, TimeUnit.SECONDS)    // 写入超时
                .build();
        
    }

    @PostConstruct
    public void initOllamaEndpoints() {
        String base = ollamaBaseUrl == null ? "http://127.0.0.1:11434" : ollamaBaseUrl.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        this.ollamaBaseUrl = base;
        this.ollamaGenerateUrl = base + "/api/generate";
        this.ollamaTagsUrl = base + "/api/tags";
        log.info("OllamaService 初始化: baseUrl={}, model={}, numCtx={}, numGpu={}, generateUrl={}",
                base, modelName, ollamaNumCtx, ollamaNumGpu, ollamaGenerateUrl);
        checkServiceAvailability();
    }

    /**
     * 检查服务可用性
     */
    private boolean checkServiceAvailability() {
        long now = System.currentTimeMillis();
        
        // 如果最近检查过且服务可用，直接返回缓存结果
        if (serviceAvailable != null && serviceAvailable && 
            (now - lastHealthCheckTime) < HEALTH_CHECK_INTERVAL) {
            return true;
        }
        
        try {
            Request request = new Request.Builder()
                    .url(ollamaTagsUrl)
                    .get()
                    .build();
            
            try (Response response = client.newCall(request).execute()) {
                serviceAvailable = response.isSuccessful();
                lastHealthCheckTime = now;
                
                if (serviceAvailable) {
                    log.info("✅ Ollama 服务可用，配置模型: {}", modelName);
                } else {
                    log.warn("⚠️ Ollama 服务响应异常，状态码: {}", response.code());
                }
                
                return serviceAvailable;
            }
        } catch (Exception e) {
            log.error("❌ Ollama 服务连接失败: {}", e.getMessage());
            serviceAvailable = false;
            lastHealthCheckTime = now;
            return false;
        }
    }

    /**
     * 调用 Ollama 生成回复
     * 
     * @param prompt 用户输入的提示词
     * @return AI 生成的回复
     */
    public String generate(String prompt) {
        return generate(prompt, null);
    }

    /**
     * 调用 Ollama 生成回复（带系统提示）
     * 
     * @param prompt 用户输入
     * @param systemPrompt 系统提示（可选）
     * @return AI 生成的回复
     */
    public String generate(String prompt, String systemPrompt) {
        // 先检查服务可用性
        if (!checkServiceAvailability()) {
            return buildServiceUnavailableMessage();
        }
        
        return generateWithRetry(prompt, systemPrompt, 2);
    }

    /**
     * 带重试机制的生成方法（指数退避）
     * 
     * @param prompt 用户输入
     * @param systemPrompt 系统提示
     * @param maxRetries 最大重试次数
     * @return AI 生成的回复
     */
    private String generateWithRetry(String prompt, String systemPrompt, int maxRetries) {
        int retryCount = 0;
        Exception lastException = null;

        while (retryCount < maxRetries) {
            try {
                log.info("🤖 调用 Ollama API (尝试 {}/{}), prompt 长度: {}", 
                        retryCount + 1, maxRetries, prompt.length());
                
                // 如果有系统提示，组合到 prompt 中
                String fullPrompt = buildFullPrompt(prompt, systemPrompt);
                
                // 构建请求体
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);
                requestBody.put("prompt", fullPrompt);
                requestBody.put("stream", false);
                requestBody.put("options", buildOllamaOptions());
                
                String jsonBody = JSON.toJSONString(requestBody);
                
                // 创建 HTTP 请求
                RequestBody body = RequestBody.create(
                    jsonBody, 
                    MediaType.parse("application/json; charset=utf-8")
                );
                
                Request request = new Request.Builder()
                        .url(ollamaGenerateUrl)
                        .post(body)
                        .build();
                
                // 发送请求并获取响应
                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        String errorBody = response.body() != null ? response.body().string() : "无响应体";
                        log.error("❌ Ollama API 调用失败 - 状态码: {}, 响应: {}", response.code(), errorBody);
                        throw new IOException("HTTP 错误 " + response.code() + ": " + extractOllamaErrorJson(errorBody));
                    }
                    
                    String responseBody = response.body().string();
                    log.debug("📦 响应体长度: {}", responseBody.length());
                    
                    JSONObject jsonResponse = JSON.parseObject(responseBody);
                    String aiReply = jsonResponse.getString("response");
                    
                    if (aiReply == null || aiReply.trim().isEmpty()) {
                        log.warn("⚠️ AI 返回空响应，完整响应: {}", responseBody);
                        throw new RuntimeException("AI 返回空响应");
                    }
                    
                    log.info("✅ AI 回复成功，长度: {}", aiReply.length());
                    
                    // 标记服务可用
                    serviceAvailable = true;
                    lastHealthCheckTime = System.currentTimeMillis();
                    
                    return aiReply.trim();
                }
                
            } catch (IOException e) {
                lastException = e;
                log.warn("⚠️ 连接 Ollama 服务失败 (尝试 {}/{}): {}", retryCount + 1, maxRetries, e.getMessage());
                retryCount++;
                
                // 标记服务不可用
                serviceAvailable = false;
                
                if (retryCount < maxRetries) {
                    try {
                        // 指数退避：1秒、2秒
                        long sleepTime = 1000L * retryCount;
                        log.info("⏳ 等待 {} 毫秒后重试...", sleepTime);
                        Thread.sleep(sleepTime);
                    } catch (InterruptedException ie) {
             Thread.currentThread().interrupt();
                        break;
                    }
                }
            } catch (Exception e) {
                lastException = e;
                log.error("❌ AI 处理出错 (尝试 {}/{})", retryCount + 1, maxRetries, e);
                retryCount++;
                
                if (retryCount < maxRetries) {
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        
        // 所有重试都失败
        log.error("❌ AI 服务调用失败，已重试 {} 次", maxRetries);
        return buildErrorMessage(lastException);
    }

    /** 与 /api/generate 的 options 字段一致（蛇形命名） */
    private Map<String, Object> buildOllamaOptions() {
        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.7);
        options.put("top_p", 0.9);
        options.put("num_predict", 500);
        if (ollamaNumCtx > 0) {
            options.put("num_ctx", ollamaNumCtx);
        }
        if (ollamaNumGpu >= 0) {
            options.put("num_gpu", ollamaNumGpu);
        }
        return options;
    }

    private static String extractOllamaErrorJson(String errorBody) {
        if (errorBody == null || errorBody.isEmpty()) {
            return errorBody;
        }
        try {
            JSONObject o = JSON.parseObject(errorBody);
            if (o != null && o.containsKey("error")) {
                return o.getString("error");
            }
        } catch (Exception ignored) {
            // 保留原文
        }
        return errorBody;
    }

    /**
     * 构建完整的提示词
     */
    private String buildFullPrompt(String prompt, String systemPrompt) {
        if (systemPrompt == null || systemPrompt.isEmpty()) {
            return prompt;
        }
        
        // 使用更清晰的格式
        return String.format(
            "【系统角色】\n%s\n\n【用户问题】\n%s\n\n【回答要求】\n" +
            "1. 用简洁专业的语言回答\n" +
            "2. 提供具体可执行的建议\n" +
            "3. 如果涉及数据，要给出明确的数字\n" +
            "4. 回答要有条理，使用序号或分点\n\n请回答：",
            systemPrompt, prompt
        );
    }

    /**
     * 构建服务不可用消息
     */
    private String buildServiceUnavailableMessage() {
        return "❌ AI 服务暂时不可用\n\n" +
               "可能的原因：\n" +
               "1. Ollama 服务未启动\n" +
               "2. 模型 " + modelName + " 未下载\n" +
               "3. 网络连接问题\n\n" +
               "解决方法：\n" +
               "• 启动 Ollama：ollama serve\n" +
               "• 下载模型：ollama pull " + modelName + "\n" +
               "• 检查服务：curl " + ollamaBaseUrl + "/api/tags\n" +
               "• 查看详细配置：AI_ASSISTANT_SETUP.md";
    }

    /**
     * 构建友好的错误消息
     */
    private String buildErrorMessage(Exception e) {
        if (e instanceof IOException) {
            return "❌ AI 服务连接失败\n\n" +
                   "错误详情：" + e.getMessage() + "\n\n" +
                   "可能的原因：\n" +
                   "1. Ollama 服务未响应\n" +
                   "2. 网络连接超时\n" +
                   "3. 服务端口被占用\n\n" +
                   "解决方法：\n" +
                   "• 检查 Ollama 服务状态\n" +
                   "• 运行: curl " + ollamaBaseUrl + "/api/tags\n" +
                   "• 查看后台日志获取详细信息";
        } else if (e != null && e.getMessage() != null && e.getMessage().contains("空响应")) {
            return "❌ AI 返回了空响应\n\n" +
                   "可能的原因：\n" +
                   "1. 模型 " + modelName + " 加载未完成\n" +
                   "2. 问题过于复杂\n" +
                   "3. 服务资源不足\n\n" +
                   "建议：\n" +
                   "• 稍等片刻后重试\n" +
                   "• 简化您的问题\n" +
                   "• 运行: ollama list 检查模型状态";
        } else {
            return "❌ AI 处理出错\n\n" +
                   "错误信息：" + (e != null ? e.getMessage() : "未知错误") + "\n\n" +
                   "建议：\n" +
                   "• 刷新页面后重试\n" +
                   "• 检查后台日志\n" +
                   "• 如问题持续，请联系技术支持";
        }
    }

    /**
     * 流式生成回复（带系统提示）
     * 
     * @param prompt 用户输入
     * @param systemPrompt 系统提示（可选）
     * @param callback 回调函数，每次接收到新内容时调用
     */
    public void generateStream(String prompt, String systemPrompt, LlmStreamCallback callback) {
        // 先检查服务可用性
        if (!checkServiceAvailability()) {
            callback.onError(buildServiceUnavailableMessage());
            return;
        }
        
        try {
            log.info("🤖 调用 Ollama 流式 API，prompt 长度: {}", prompt.length());
            
            // 如果有系统提示，组合到 prompt 中
            String fullPrompt = buildFullPrompt(prompt, systemPrompt);
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("prompt", fullPrompt);
            requestBody.put("stream", true); // 启用流式输出
            requestBody.put("options", buildOllamaOptions());
            
            String jsonBody = JSON.toJSONString(requestBody);
            
            // 创建 HTTP 请求
            RequestBody body = RequestBody.create(
                jsonBody, 
                MediaType.parse("application/json; charset=utf-8")
            );
            
            Request request = new Request.Builder()
                    .url(ollamaGenerateUrl)
                    .post(body)
                    .build();
            
            // 发送请求并处理流式响应
            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "无响应体";
                    String detail = extractOllamaErrorJson(errorBody);
                    log.error("❌ Ollama 流式 API 调用失败 - 状态码: {}, 响应: {}", response.code(), errorBody);
                    callback.onError("AI 服务异常（" + response.code() + "）: " + detail);
                    return;
                }
                
                // 逐行读取流式响应（使用UTF-8编码）
                ResponseBody responseBody = response.body();
                if (responseBody == null) {
                    callback.onError("响应体为空");
                    return;
                }
                
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(responseBody.byteStream(), java.nio.charset.StandardCharsets.UTF_8)
                );
                
                String line;
                int chunkCount = 0;
                while ((line = reader.readLine()) != null) {
                    if (line.trim().isEmpty()) {
                        continue;
                    }
                    
                    try {
                        JSONObject jsonLine = JSON.parseObject(line);
                        String chunk = jsonLine.getString("response");
                        boolean done = jsonLine.getBooleanValue("done");
                        
                        if (chunk != null && !chunk.isEmpty()) {
                            callback.onChunk(chunk);
                            chunkCount++;
                        }
                        
                        if (done) {
                            log.info("✅ 流式响应完成，共 {} 个块", chunkCount);
                            callback.onComplete();
                            
                            // 标记服务可用
                            serviceAvailable = true;
                            lastHealthCheckTime = System.currentTimeMillis();
                            break;
                        }
                    } catch (Exception e) {
                        log.warn("⚠️ 解析流式响应行失败: {}", line, e);
                    }
                }
                
            }
            
        } catch (IOException e) {
            log.error("❌ 连接 Ollama 服务失败", e);
            serviceAvailable = false;
            callback.onError("AI 服务连接失败：" + e.getMessage());
        } catch (Exception e) {
            log.error("❌ AI 处理出错", e);
            callback.onError("AI 处理出错：" + e.getMessage());
        }
    }

    /**
     * 智能推荐春联商品
     * 
     * @param userInput 用户需求描述
     * @param goodsList 商品列表（JSON 格式）
     * @return 推荐结果
     */
    public String recommendGoods(String userInput, String goodsList) {
        String systemPrompt = "你是一个专业的春联推荐专家，精通中国传统文化。" +
                "请根据用户需求，从提供的商品列表中推荐最合适的1-3个商品。" +
                "回复要简洁、专业，突出推荐理由。";
        
        String prompt = String.format(
            "用户需求：%s\n\n" +
            "可选商品列表：\n%s\n\n" +
            "请推荐最合适的商品，格式如下：\n" +
            "推荐商品：[商品名称]\n" +
            "理由：[简要说明为什么推荐这个商品]\n" +
            "价格：[商品价格]",
            userInput, goodsList
        );
        
        return generate(prompt, systemPrompt);
    }

    /**
     * 生成春联内容
     * 
     * @param theme 主题（如：新年、生意兴隆等）
     * @param style 风格（如：传统、现代等）
     * @return 生成的春联
     */
    public String generateCouplet(String theme, String style) {
        String systemPrompt = "你是一个精通中国传统文化的春联创作大师。" +
                "请根据主题和风格创作一副对仗工整、寓意吉祥的春联。";
        
        String prompt = String.format(
            "请创作一副春联：\n" +
            "主题：%s\n" +
            "风格：%s\n\n" +
            "请按以下格式输出：\n" +
            "上联：[上联内容]\n" +
            "下联：[下联内容]\n" +
            "横批：[横批内容]\n" +
            "寓意：[简要说明寓意]",
            theme, style
        );
        
        return generate(prompt, systemPrompt);
    }

    /**
     * 解释春联文化
     * 
     * @param question 用户问题
     * @return 文化解释
     */
    public String explainCulture(String question) {
        String systemPrompt = "你是一个中国传统文化专家，擅长解释春联相关的文化知识。" +
                "回答要准确、通俗易懂，适合普通用户理解。";
        
        return generate(question, systemPrompt);
    }

    /**
     * 健康检查 - 测试 Ollama 服务是否可用
     * 
     * @return 是否可用
     */
    public boolean healthCheck() {
        return checkServiceAvailability();
    }
    
    /**
     * 获取服务状态信息
     * 
     * @return 状态信息
     */
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean available = checkServiceAvailability();
        
        status.put("available", available);
        status.put("url", ollamaGenerateUrl);
        status.put("model", modelName);
        status.put("lastCheckTime", lastHealthCheckTime);
        
        if (available) {
            status.put("message", "服务正常运行");
        } else {
            status.put("message", "服务不可用，请检查 Ollama 是否启动");
        }
        
        return status;
    }
}
