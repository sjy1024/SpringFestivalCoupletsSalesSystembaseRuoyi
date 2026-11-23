package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.system.domain.ClAssistantChat;
import com.ruoyi.web.service.AdminAssistantService;
import com.ruoyi.web.service.LlmProviderService;
import com.ruoyi.web.service.LlmStreamCallback;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 管理员智能助手控制器
 * 
 * 为后台管理员提供 AI 辅助功能
 * 
 * @author ruoyi
 */
@RestController
@RequestMapping("/system/assistant")
public class AdminAssistantController extends BaseController {

    @Autowired
    private AdminAssistantService assistantService;

    @Autowired
    private LlmProviderService llmProviderService;

    // 线程池用于异步处理流式响应
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    /**
     * 智能对话（流式输出）
     * POST /system/assistant/chat/stream
     * 
     * 使用 Server-Sent Events (SSE) 实现流式响应
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:chat')")
    @PostMapping(value = "/chat/stream", produces = "text/event-stream;charset=UTF-8")
    public SseEmitter chatStream(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String sessionId = request.get("sessionId");

        if (message == null || message.trim().isEmpty()) {
            SseEmitter emitter = new SseEmitter();
            try {
                emitter.send(SseEmitter.event()
                    .name("error")
                    .data("消息不能为空"));
                emitter.complete();
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        final String userMessage = message.trim();
        sessionId = assistantService.resolveSessionId(sessionId == null ? "" : sessionId.trim());
        final String finalSessionId = sessionId;
        final long streamStartMs = System.currentTimeMillis();
        final Long captUserId = SecurityUtils.getUserId();
        final String captUserName = SecurityUtils.getUsername();

        // 创建 SSE 发射器，设置超时时间为 5 分钟
        SseEmitter emitter = new SseEmitter(300000L);

        // 异步处理
        executorService.execute(() -> {
            final StringBuilder assistantBuffer = new StringBuilder();
            final AtomicReference<Boolean> assistantSaved = new AtomicReference<>(false);
            try {
                emitter.send(SseEmitter.event().name("session").data(finalSessionId));

                assistantService.persistStreamUserMessage(finalSessionId, userMessage, captUserId, captUserName);

                // 从数据库构建实时业务快照，并注入 LLM 提示词
                String dataContext = assistantService.buildDataContextForQuestion(userMessage);
                String systemPrompt = assistantService.getSystemPromptForQuestion(userMessage);
                String enrichedMessage = assistantService.buildEnrichedUserMessage(userMessage, dataContext);

                if (dataContext != null && !dataContext.isEmpty()) {
                    emitter.send(SseEmitter.event()
                        .name("data")
                        .data(dataContext));
                }

                // 调用流式 API（携带真实数据库上下文）
                llmProviderService.generateStream(enrichedMessage, systemPrompt, new LlmStreamCallback() {
                    @Override
                    public void onChunk(String chunk) {
                        try {
                            if (chunk != null) {
                                assistantBuffer.append(chunk);
                            }
                            emitter.send(SseEmitter.event()
                                .name("message")
                                .data(chunk != null ? chunk : ""));
                        } catch (IOException e) {
                            logger.error("发送流式数据失败", e);
                            emitter.completeWithError(e);
                        }
                    }

                    @Override
                    public void onComplete() {
                        try {
                            if (assistantSaved.compareAndSet(false, true)) {
                                assistantService.persistStreamAssistantMessage(
                                    finalSessionId, assistantBuffer.toString(), userMessage, streamStartMs, captUserId, captUserName);
                            }
                            emitter.send(SseEmitter.event()
                                .name("done")
                                .data("[DONE]"));
                            emitter.complete();
                        } catch (IOException e) {
                            emitter.completeWithError(e);
                        }
                    }

                    @Override
                    public void onError(String error) {
                        try {
                            if (assistantSaved.compareAndSet(false, true)) {
                                String errText = assistantBuffer.length() > 0
                                    ? assistantBuffer + "\n\n[错误] " + error
                                    : "[错误] " + error;
                                assistantService.persistStreamAssistantMessage(
                                    finalSessionId, errText, userMessage, streamStartMs, captUserId, captUserName);
                            }
                            emitter.send(SseEmitter.event()
                                .name("error")
                                .data(error));
                            emitter.complete();
                        } catch (IOException e) {
                            logger.error("发送错误信息失败", e);
                            emitter.completeWithError(e);
                        }
                    }
                });

            } catch (Exception e) {
                logger.error("流式对话失败", e);
                try {
                    emitter.send(SseEmitter.event()
                        .name("error")
                        .data("AI 处理失败：" + e.getMessage()));
                    emitter.complete();
                } catch (IOException ex) {
                    logger.error("发送错误信息失败", ex);
                    emitter.completeWithError(ex);
                }
            }
        });

        return emitter;
    }

    /**
     * 智能对话
     * POST /system/assistant/chat
     * 
     * 请求体示例：
     * {
     *   "message": "今天的订单情况怎么样？",
     *   "sessionId": "可选的会话ID"
     * }
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:chat')")
    @PostMapping("/chat")
    public AjaxResult chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String sessionId = request.get("sessionId");

        if (message == null || message.trim().isEmpty()) {
            return error("消息不能为空");
        }

        try {
            sessionId = assistantService.resolveSessionId(sessionId == null ? "" : sessionId.trim());
            String reply = assistantService.chat(message, sessionId);

            Map<String, Object> result = new HashMap<>();
            result.put("message", message);
            result.put("reply", reply);
            result.put("sessionId", sessionId);
            result.put("timestamp", System.currentTimeMillis());

            return success(result);

        } catch (Exception e) {
            logger.error("AI 对话失败", e);
            return error("AI 处理失败：" + e.getMessage());
        }
    }

    /**
     * 获取对话历史
     * GET /system/assistant/history/{sessionId}
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:view')")
    @GetMapping("/history/{sessionId}")
    public AjaxResult getChatHistory(@PathVariable String sessionId) {
        try {
            List<ClAssistantChat> history = assistantService.getChatHistory(sessionId);
            return success(history);
        } catch (Exception e) {
            logger.error("获取对话历史失败", e);
            return error("获取对话历史失败：" + e.getMessage());
        }
    }

    /**
     * 获取最近对话记录
     * GET /system/assistant/recent?limit=20
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:view')")
    @GetMapping("/recent")
    public AjaxResult getRecentChats(@RequestParam(defaultValue = "20") int limit) {
        try {
            List<ClAssistantChat> recentChats = assistantService.getRecentChats(limit);
            return success(recentChats);
        } catch (Exception e) {
            logger.error("获取最近对话失败", e);
            return error("获取最近对话失败：" + e.getMessage());
        }
    }

    /**
     * 删除会话历史
     * DELETE /system/assistant/history/{sessionId}
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:delete')")
    @DeleteMapping("/history/{sessionId}")
    public AjaxResult deleteChatHistory(@PathVariable String sessionId) {
        try {
            boolean success = assistantService.deleteChatHistory(sessionId);
            if (success) {
                return success("删除成功");
            } else {
                return error("删除失败");
            }
        } catch (Exception e) {
            logger.error("删除会话历史失败", e);
            return error("删除会话历史失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除当前用户的所有历史记录
     * DELETE /system/assistant/history/all
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:delete')")
    @DeleteMapping("/history/all")
    public AjaxResult deleteAllHistory() {
        try {
            boolean success = assistantService.deleteAllUserHistory();
            if (success) {
                return success("已清空所有历史记录");
            } else {
                return error("清空失败");
            }
        } catch (Exception e) {
            logger.error("清空历史记录失败", e);
            return error("清空历史记录失败：" + e.getMessage());
        }
    }

    /**
     * 订单数据分析
     * GET /system/assistant/analyze/orders?sessionId=可选
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:analyze')")
    @GetMapping("/analyze/orders")
    public AjaxResult analyzeOrders(@RequestParam(value = "sessionId", required = false) String sessionId) {
        long t0 = System.currentTimeMillis();
        try {
            String analysis = assistantService.analyzeOrders();
            long rt = System.currentTimeMillis() - t0;
            sessionId = assistantService.persistToolChatExchange(sessionId, "订单分析", analysis, "order", rt);
            return success(buildAnalysisPayload(analysis, sessionId));
        } catch (Exception e) {
            logger.error("订单分析失败", e);
            return error("订单分析失败：" + e.getMessage());
        }
    }

    /**
     * 库存预警分析
     * GET /system/assistant/analyze/inventory?sessionId=可选
     */
    // @PreAuthorize("@ss.hasPermi('system:assistant:analyze')")
    @GetMapping("/analyze/inventory")
    public AjaxResult analyzeInventory(@RequestParam(value = "sessionId", required = false) String sessionId) {
        long t0 = System.currentTimeMillis();
        try {
            String analysis = assistantService.analyzeInventory();
            long rt = System.currentTimeMillis() - t0;
            sessionId = assistantService.persistToolChatExchange(sessionId, "库存分析", analysis, "goods", rt);
            return success(buildAnalysisPayload(analysis, sessionId));
        } catch (Exception e) {
            logger.error("库存分析失败", e);
            return error("库存分析失败：" + e.getMessage());
        }
    }

    /**
     * 商品优化建议
     * GET /system/assistant/suggest/goods?sessionId=可选
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:analyze')")
    @GetMapping("/suggest/goods")
    public AjaxResult suggestGoods(@RequestParam(value = "sessionId", required = false) String sessionId) {
        long t0 = System.currentTimeMillis();
        try {
            String suggestion = assistantService.suggestGoodsOptimization();
            long rt = System.currentTimeMillis() - t0;
            sessionId = assistantService.persistToolChatExchange(sessionId, "商品优化建议", suggestion, "goods", rt);
            return success(buildAnalysisPayload(suggestion, sessionId));
        } catch (Exception e) {
            logger.error("商品优化建议失败", e);
            return error("商品优化建议失败：" + e.getMessage());
        }
    }

    private static Map<String, Object> buildAnalysisPayload(String content, String sessionId) {
        Map<String, Object> m = new HashMap<>(4);
        m.put("content", content);
        m.put("sessionId", sessionId);
        return m;
    }

    /**
     * 快速数据概览
     * GET /system/assistant/overview
     */
    @PreAuthorize("@ss.hasPermi('system:assistant:view')")
    @GetMapping("/overview")
    public AjaxResult getOverview() {
        try {
            String overview = assistantService.getQuickOverview();
            return success(overview);
        } catch (Exception e) {
            logger.error("获取数据概览失败", e);
            return error("获取数据概览失败：" + e.getMessage());
        }
    }

    /**
     * 健康检查 - 测试 AI 服务是否可用
     * GET /system/assistant/health
     */
    @GetMapping("/health")
    public AjaxResult healthCheck() {
        try {
            boolean isHealthy = llmProviderService.healthCheck();
            
            if (isHealthy) {
                return success("AI 服务正常运行");
            } else {
                return error("AI 服务不可用：请检查 LM Studio 是否已开启 Local Server，或 ruoyi.openaiApi.baseUrl 是否正确");
            }
        } catch (Exception e) {
            logger.error("健康检查失败", e);
            return error("健康检查失败：" + e.getMessage());
        }
    }
}
