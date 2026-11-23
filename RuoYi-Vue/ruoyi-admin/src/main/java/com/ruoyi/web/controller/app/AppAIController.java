package com.ruoyi.web.controller.app;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.ClAppAiChat;
import com.ruoyi.system.service.IClAppAiChatService;
import com.ruoyi.web.service.LlmProviderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 小程序端 - AI 服务接口
 * <p>
 * 当 {@code ruoyi.app-ai.use-llm=true} 时，与管理端共用 {@link LlmProviderService}。
 * 对话按 {@code deviceId} + {@code sessionId} 写入 {@code cl_app_ai_chat}。
 */
@Anonymous
@RestController
@RequestMapping("/api/ai")
public class AppAIController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(AppAIController.class);

    private static final int DEVICE_ID_MAX = 64;
    private static final int SESSION_ID_MAX = 100;
    private static final int HISTORY_LIMIT_MAX = 200;

    private static final String CHAT_SYSTEM_PROMPT =
        "你是「春联定制」微信小程序里的 AI 助手，语气亲切简洁。"
            + "帮助用户了解春联/福字/定制流程、尺寸与价格区间、配送与订单查询方式。"
            + "不要编造具体订单号或用户隐私；若问题与业务无关，简短引导回春联与定制话题。"
            + "回答控制在约 400 字以内，用短句分点说明；若使用列表，优先用「1. 2. 3.」或「- 」开头，避免复杂 Markdown 表格与代码块。";

    private static final String COUPLET_SYSTEM_PREFIX =
        "你是中文春联助手。根据用户给出的主题或关键词，生成一副适合家庭张贴的春联。"
            + "要求：上下联字数相同（五言或七言），对仗工整，横批四字，内容吉祥、无违规表述。";

    @Autowired
    private LlmProviderService llmProviderService;

    @Autowired
    private IClAppAiChatService appAiChatService;

    @Value("${ruoyi.app-ai.use-llm:false}")
    private boolean appAiUseLlm;

    /**
     * AI 聊天（写入 cl_app_ai_chat）
     */
    @PostMapping("/chat")
    public AjaxResult chat(
        @RequestBody Map<String, Object> data,
        @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        String message = data.get("message") == null ? "" : String.valueOf(data.get("message")).trim();
        if (message.isEmpty()) {
            return error("消息不能为空");
        }

        String deviceId = resolveDeviceId(
            data.get("deviceId") == null ? null : String.valueOf(data.get("deviceId")),
            headerDeviceId);
        String sessionId = resolveSessionId(
            data.get("sessionId") == null ? null : String.valueOf(data.get("sessionId")));

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("timestamp", System.currentTimeMillis());
        result.put("deviceId", deviceId);
        result.put("sessionId", sessionId);

        try {
            appAiChatService.insertMessage(deviceId, sessionId, "user", message, false);
        } catch (Exception e) {
            log.warn("小程序 AI 保存用户消息失败: {}", e.getMessage());
        }

        long t0 = System.currentTimeMillis();
        String reply;
        boolean usedLlm = false;
        if (appAiUseLlm && llmProviderService.healthCheck()) {
            try {
                reply = llmProviderService.generate(message, CHAT_SYSTEM_PROMPT);
                if (reply != null && !reply.isEmpty() && !isLlmFailurePayload(reply)) {
                    usedLlm = true;
                } else {
                    reply = buildKeywordReply(message);
                }
            } catch (Exception e) {
                log.warn("小程序 AI 调用大模型失败，使用关键词回退: {}", e.getMessage());
                reply = buildKeywordReply(message);
            }
        } else {
            reply = buildKeywordReply(message);
        }

        try {
            appAiChatService.insertMessage(deviceId, sessionId, "assistant", reply, usedLlm);
        } catch (Exception e) {
            log.warn("小程序 AI 保存助手回复失败: {}", e.getMessage());
        }

        result.put("reply", reply);
        result.put("usedLlm", usedLlm);
        result.put("responseTimeMs", System.currentTimeMillis() - t0);
        return success(result);
    }

    private static boolean isLlmFailurePayload(String text) {
        if (text == null) {
            return true;
        }
        String t = text.trim();
        return t.startsWith("❌") || t.contains("AI 服务暂时不可用") || t.contains("AI 服务连接失败");
    }

    private static String resolveDeviceId(String bodyDevice, String headerDevice) {
        String d = StringUtils.isNotEmpty(bodyDevice) ? bodyDevice.trim() : null;
        if (d == null && StringUtils.isNotEmpty(headerDevice)) {
            d = headerDevice.trim();
        }
        if (d == null || d.isEmpty()) {
            return "miniapp-unknown";
        }
        return d.length() > DEVICE_ID_MAX ? d.substring(0, DEVICE_ID_MAX) : d;
    }

    private static String resolveSessionId(String sessionId) {
        if (StringUtils.isEmpty(sessionId)) {
            return UUID.randomUUID().toString();
        }
        String s = sessionId.trim();
        return s.length() > SESSION_ID_MAX ? s.substring(0, SESSION_ID_MAX) : s;
    }

    /**
     * 与原先逻辑一致的关键词回退（离线 / 模型不可用时）
     */
    private static String buildKeywordReply(String message) {
        if (message == null || message.isEmpty()) {
            return "您好！我是 AI 对联助手，很高兴为您服务。";
        }
        if (message.contains("春联") || message.contains("对联")) {
            return "春联是中国传统文化的重要组成部分，象征着吉祥如意。您可以选择定制春联，或者让我为您推荐一些经典春联。";
        }
        if (message.contains("福")) {
            return "福字象征着幸福和好运，是春节期间必不可少的装饰品。您可以选择不同尺寸和样式的福字。";
        }
        if (message.contains("价格")) {
            return "我们的定制春联价格根据尺寸和材质不同而有所差异，您可以在定制页面查看详细价格。";
        }
        if (message.contains("定制")) {
            return "您可以在定制页面选择春联的尺寸、材质等选项，还可以输入您喜欢的对联内容。";
        }
        return "您好！我是 AI 对联助手，很高兴为您服务。试试问我春联、福字、价格或定制流程吧。";
    }

    /**
     * 对话历史：按设备；可选 sessionId 仅拉本会话，否则为最近若干条（时间正序）
     */
    @GetMapping("/history")
    public AjaxResult getChatHistory(
        @RequestParam("deviceId") String deviceId,
        @RequestParam(value = "sessionId", required = false) String sessionId,
        @RequestParam(value = "limit", defaultValue = "50") int limit) {
        String dev = resolveDeviceId(deviceId, null);
        if ("miniapp-unknown".equals(dev)) {
            return error("请传入 deviceId（与发消息时一致）");
        }
        int lim = Math.min(Math.max(limit, 1), HISTORY_LIMIT_MAX);

        List<ClAppAiChat> rows;
        if (StringUtils.isNotEmpty(sessionId)) {
            String sid = sessionId.trim();
            sid = sid.length() > SESSION_ID_MAX ? sid.substring(0, SESSION_ID_MAX) : sid;
            rows = appAiChatService.listSession(dev, sid);
        } else {
            rows = appAiChatService.listRecentChronological(dev, lim);
        }

        List<Map<String, Object>> history = new ArrayList<>();
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        for (ClAppAiChat row : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", row.getChatId());
            m.put("sender", "assistant".equals(row.getRole()) ? "ai" : "user");
            m.put("role", row.getRole());
            m.put("message", row.getContent());
            m.put("content", row.getContent());
            m.put("sessionId", row.getSessionId());
            m.put("usedLlm", "1".equals(row.getUsedLlm()));
            if (row.getCreateTime() != null) {
                m.put("timestamp", row.getCreateTime().getTime());
                m.put("createTime", fmt.format(row.getCreateTime()));
            }
            history.add(m);
        }

        Map<String, Object> wrap = new HashMap<>();
        wrap.put("list", history);
        wrap.put("deviceId", dev);
        return success(wrap);
    }

    /**
     * 清空某设备下全部小程序 AI 记录
     */
    @DeleteMapping("/history")
    public AjaxResult clearHistory(@RequestParam("deviceId") String deviceId) {
        String dev = resolveDeviceId(deviceId, null);
        if ("miniapp-unknown".equals(dev)) {
            return error("请传入 deviceId");
        }
        int n = appAiChatService.clearDevice(dev);
        return success("已删除 " + n + " 条记录");
    }

    /**
     * 大模型/LM Studio 是否可用（与 {@code ruoyi.app-ai.use-llm} 配合使用）
     */
    @GetMapping("/health")
    public AjaxResult health() {
        boolean ok = llmProviderService.healthCheck();
        Map<String, Object> m = new HashMap<>();
        m.put("llmOnline", ok);
        m.put("appAiUseLlm", appAiUseLlm);
        if (ok) {
            return success(m);
        }
        m.put("hint", "请检查 LM Studio Local Server 或 ruoyi.openaiApi.baseUrl；未开启时仍可使用关键词模式。");
        return success(m);
    }

    @GetMapping("/recommend")
    public AjaxResult getRecommend() {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        Map<String, Object> recommend1 = new HashMap<>();
        recommend1.put("id", 1);
        recommend1.put("title", "吉星高照");
        recommend1.put("shanglian", "吉星高照全家福");
        recommend1.put("xialian", "福气临门满堂春");
        recommend1.put("hengpi", "吉星高照");
        recommend1.put("description", "经典春联，适合大多数家庭");
        recommendations.add(recommend1);

        Map<String, Object> recommend2 = new HashMap<>();
        recommend2.put("id", 2);
        recommend2.put("title", "万事如意");
        recommend2.put("shanglian", "万事如意展宏图");
        recommend2.put("xialian", "心想事成兴伟业");
        recommend2.put("hengpi", "万事如意");
        recommend2.put("description", "寓意吉祥，事业有成");
        recommendations.add(recommend2);

        Map<String, Object> recommend3 = new HashMap<>();
        recommend3.put("id", 3);
        recommend3.put("title", "财源广进");
        recommend3.put("shanglian", "财源广进达三江");
        recommend3.put("xialian", "生意兴隆通四海");
        recommend3.put("hengpi", "财源广进");
        recommend3.put("description", "适合商家店铺使用");
        recommendations.add(recommend3);

        return success(recommendations);
    }

    /**
     * 生成春联内容（可走大模型；失败时返回内置示例）
     */
    @PostMapping("/generate-couplet")
    public AjaxResult generateCouplet(@RequestBody Map<String, Object> data) {
        String theme = data.get("theme") != null ? String.valueOf(data.get("theme")).trim() : "";
        if (theme.isEmpty() && data.get("keyword") != null) {
            theme = String.valueOf(data.get("keyword")).trim();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);

        String shanglian = "春风得意财源广";
        String xialian = "吉星高照福寿长";
        String hengpi = "万事如意";
        boolean usedLlm = false;

        if (appAiUseLlm && llmProviderService.healthCheck() && !theme.isEmpty()) {
            try {
                String userPrompt =
                    "用户主题或关键词：" + theme + "\n"
                        + "请严格只输出一行 JSON，不要代码块、不要其它说明文字，格式如下：\n"
                        + "{\"shanglian\":\"七言上联\",\"xialian\":\"七言下联\",\"hengpi\":\"四字横批\"}";
                String raw = llmProviderService.generate(userPrompt, COUPLET_SYSTEM_PREFIX);
                if (raw != null && !isLlmFailurePayload(raw)) {
                    JSONObject obj = tryParseCoupletJson(raw);
                    if (obj != null) {
                        String s1 = obj.getString("shanglian");
                        String s2 = obj.getString("xialian");
                        String s3 = obj.getString("hengpi");
                        if (s1 != null && s2 != null && s3 != null
                            && !s1.isEmpty() && !s2.isEmpty() && !s3.isEmpty()) {
                            shanglian = s1;
                            xialian = s2;
                            hengpi = s3;
                            usedLlm = true;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("generate-couplet 调用大模型失败: {}", e.getMessage());
            }
        }

        result.put("content", "");
        result.put("shanglian", shanglian);
        result.put("xialian", xialian);
        result.put("hengpi", hengpi);
        result.put("usedLlm", usedLlm);
        return success(result);
    }

    private static JSONObject tryParseCoupletJson(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        int start = s.indexOf('{');
        int end = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parseObject(s.substring(start, end + 1));
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    @PostMapping("/recommend-topics")
    public AjaxResult getRecommendTopics() {
        Map<String, Object> result = new HashMap<>();
        List<String> topics = new ArrayList<>();
        topics.add("生意兴隆");
        topics.add("万事如意");
        topics.add("阖家欢乐");
        topics.add("四季平安");
        topics.add("财源广进");
        topics.add("吉星高照");

        result.put("success", true);
        result.put("topics", topics);

        return success(result);
    }
}
