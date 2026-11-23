package com.ruoyi.web.service;

import com.ruoyi.system.domain.ClGoods;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClAssistantChat;
import com.ruoyi.system.service.IClGoodsService;
import com.ruoyi.system.service.IClOrderService;
import com.ruoyi.system.service.IClAssistantChatService;
import com.ruoyi.system.service.IDashboardService;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 管理员智能助手服务
 * 
 * 为后台管理员提供 AI 辅助功能：
 * - 订单数据分析
 * - 库存预警提醒
 * - 商品推荐建议
 * - 经营数据解读
 */
@Service
public class AdminAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AdminAssistantService.class);

    /** 送入云端模型的单品名最多条数，避免 prompt 过长导致 OpenRouter 等返回 5xx */
    private static final int LLM_GOODS_NAME_LIST_MAX = 40;

    @Autowired
    private LlmProviderService llmProviderService;

    @Autowired
    private IClOrderService orderService;

    @Autowired
    private IClGoodsService goodsService;

    @Autowired
    private IClAssistantChatService chatService;

    @Autowired
    private IDashboardService dashboardService;

    private static final DateTimeFormatter DATA_TIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 智能对话 - 回答管理员问题（带历史记录）
     * 
     * @param question 管理员的问题
     * @param sessionId 会话ID（可选）
     * @return AI 回复
     */
    public String chat(String question, String sessionId) {
        log.info("管理员提问: {}", question);
        
        long startTime = System.currentTimeMillis();
        
        sessionId = resolveSessionId(sessionId == null ? "" : sessionId);

        // 保存用户问题到历史记录
        saveChat(sessionId, "user", question, null, null);
        
        String reply;
        String questionType = detectQuestionType(question);
        
        // 判断问题类型，提供针对性回答
        if (isOrderRelated(question)) {
            reply = handleOrderQuestion(question);
        } else if (isGoodsRelated(question)) {
            reply = handleGoodsQuestion(question);
        } else if (isDataAnalysisRelated(question)) {
            reply = handleDataAnalysisQuestion(question);
        } else {
            // 通用问题：注入实时数据库快照后调用 AI
            String dataContext = buildDataContextForQuestion(question);
            String enriched = buildEnrichedUserMessage(question, dataContext);
            String systemPrompt = getSystemPromptForQuestion(question);
            reply = llmProviderService.generate(enriched, systemPrompt);
        }
        
        // 计算响应时间
        long responseTime = System.currentTimeMillis() - startTime;
        
        // 保存AI回复到历史记录
        saveChat(sessionId, "assistant", reply, questionType, responseTime);
        
        return reply;
    }

    /**
     * 智能对话 - 回答管理员问题（兼容旧版本）
     * 
     * @param question 管理员的问题
     * @return AI 回复
     */
    public String chat(String question) {
        return chat(question, null);
    }

    /**
     * 无会话 ID 时生成 UUID（与流式接口、前端多轮对齐）
     */
    public String resolveSessionId(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return UUID.randomUUID().toString();
        }
        return sessionId;
    }

    /**
     * 流式对话在用户线程外执行，须传入登录用户，避免异步线程取不到 SecurityContext。
     */
    public void persistStreamUserMessage(String sessionId, String userContent, Long userId, String userName) {
        saveChat(sessionId, "user", userContent, null, null, userId, userName);
    }

    public void persistStreamAssistantMessage(String sessionId, String assistantContent, String userQuestion,
                                              long startedAtMs, Long userId, String userName) {
        long responseTime = System.currentTimeMillis() - startedAtMs;
        saveChat(sessionId, "assistant", assistantContent, detectQuestionType(userQuestion), responseTime, userId, userName);
    }

    /**
     * 将「智能分析」等工具的一次调用写入对话历史（可与当前流式会话共用 sessionId）。
     *
     * @param sessionId      可选；空则新建会话
     * @param userPrompt     记为 user 消息，如「订单分析」
     * @param assistantReply 完整结果文本
     * @param questionType   建议 order / goods / data，与历史筛选一致；空则按 userPrompt 推断
     * @param responseTimeMs 助手响应耗时，可空
     * @return 实际使用的 sessionId
     */
    public String persistToolChatExchange(String sessionId, String userPrompt, String assistantReply,
                                          String questionType, Long responseTimeMs) {
        String sid = resolveSessionId(sessionId == null ? "" : sessionId.trim());
        saveChat(sid, "user", userPrompt, null, null);
        String qt = StringUtils.isEmpty(questionType) ? detectQuestionType(userPrompt) : questionType;
        String body = assistantReply == null ? "" : assistantReply;
        saveChat(sid, "assistant", body, qt, responseTimeMs);
        return sid;
    }

    /**
     * 保存对话记录
     */
    private void saveChat(String sessionId, String role, String content, String questionType, Long responseTime) {
        saveChat(sessionId, role, content, questionType, responseTime, null, null);
    }

    private void saveChat(String sessionId, String role, String content, String questionType, Long responseTime,
                          Long userIdOverride, String userNameOverride) {
        try {
            ClAssistantChat chat = new ClAssistantChat();
            chat.setSessionId(sessionId);
            if (userIdOverride != null) {
                chat.setUserId(userIdOverride);
                chat.setUserName(userNameOverride != null ? userNameOverride : "");
            } else {
                chat.setUserId(SecurityUtils.getUserId());
                chat.setUserName(SecurityUtils.getUsername());
            }
            chat.setRole(role);
            chat.setContent(content);
            chat.setQuestionType(questionType);
            chat.setResponseTime(responseTime);

            chatService.insertClAssistantChat(chat);
        } catch (Exception e) {
            log.error("保存对话记录失败", e);
            // 不影响主流程，只记录日志
        }
    }

    /**
     * 检测问题类型
     */
    private String detectQuestionType(String question) {
        if (isOrderRelated(question)) {
            return "order";
        } else if (isGoodsRelated(question)) {
            return "goods";
        } else if (isDataAnalysisRelated(question)) {
            return "data";
        } else {
            return "general";
        }
    }

    /**
     * 获取用户的对话历史
     * 
     * @param sessionId 会话ID
     * @return 对话历史列表
     */
    public List<ClAssistantChat> getChatHistory(String sessionId) {
        return chatService.selectChatsBySessionId(sessionId);
    }

    /**
     * 获取用户的最近会话列表
     * 
     * @param limit 限制数量
     * @return 最近对话记录
     */
    public List<ClAssistantChat> getRecentChats(int limit) {
        try {
            Long userId = SecurityUtils.getUserId();
            return chatService.selectRecentChatsByUserId(userId, limit);
        } catch (Exception e) {
            log.error("获取最近对话失败", e);
            return Collections.emptyList();
        }
    }

    /**
     * 删除会话历史
     * 
     * @param sessionId 会话ID
     * @return 是否成功
     */
    public boolean deleteChatHistory(String sessionId) {
        try {
            chatService.deleteClAssistantChatBySessionId(sessionId);
            return true;
        } catch (Exception e) {
            log.error("删除会话历史失败", e);
            return false;
        }
    }

    /**
     * 删除当前用户的所有历史记录
     * 
     * @return 是否成功
     */
    public boolean deleteAllUserHistory() {
        try {
            Long userId = SecurityUtils.getUserId();
            chatService.deleteAllChatsByUserId(userId);
            log.info("用户 {} 清空了所有对话历史", userId);
            return true;
        } catch (Exception e) {
            log.error("删除所有历史记录失败", e);
            return false;
        }
    }

    /**
     * 订单数据分析
     * 
     * @return 分析报告
     */
    public String analyzeOrders() {
        log.info("开始分析订单数据");

        try {
            String dataSummary = collectOrderDataSummary();
            if (dataSummary.startsWith("当前还没有")) {
                return dataSummary;
            }

            String prompt = dataSummary + "\n\n请分析以上订单数据，给出3-5条经营建议。";
            String systemPrompt = "你是一个专业的电商数据分析师，擅长从订单数据中发现问题和机会。" +
                    "请提供简洁、可执行的建议。";

            String aiAnalysis = llmProviderService.generate(prompt, systemPrompt);
            return dataSummary + "\n\n📊 AI 分析建议：\n" + aiAnalysis;

        } catch (Exception e) {
            log.error("订单分析失败", e);
            return "订单数据分析失败：" + e.getMessage();
        }
    }

    /**
     * 收集订单原始数据（不含 AI 解读）
     */
    public String collectOrderDataSummary() {
        ClOrder query = new ClOrder();
        List<ClOrder> orders = orderService.selectClOrderList(query);

        if (orders.isEmpty()) {
            return "当前还没有订单数据。建议：\n" +
                    "1. 检查商品是否已上架\n" +
                    "2. 确认小程序是否正常运行\n" +
                    "3. 考虑进行营销推广";
        }

        int totalOrders = orders.size();
        int todayOrders = orderService.getTodayOrderCount();

        long pendingPayment = orders.stream().filter(o -> "0".equals(o.getStatus())).count();
        long paid = orders.stream().filter(o -> "1".equals(o.getStatus())).count();
        long inProduction = orders.stream().filter(o -> "2".equals(o.getStatus())).count();
        long completed = orders.stream().filter(o -> "3".equals(o.getStatus())).count();
        long cancelled = orders.stream().filter(o -> "4".equals(o.getStatus())).count();

        BigDecimal totalAmount = orders.stream()
                .map(ClOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> overview = dashboardService.getHomeOverview();
        String todaySalesStr = String.valueOf(overview.getOrDefault("todaySales", "0"));

        return String.format(
                "订单数据统计：\n" +
                "- 总订单数：%d 单\n" +
                "- 今日订单：%d 单\n" +
                "- 今日销售额：%s 元\n" +
                "- 订单总额：%.2f 元\n" +
                "- 待支付：%d 单\n" +
                "- 已支付：%d 单\n" +
                "- 制作中：%d 单\n" +
                "- 已完成：%d 单\n" +
                "- 已取消：%d 单",
                totalOrders, todayOrders, todaySalesStr, totalAmount,
                pendingPayment, paid, inProduction, completed, cancelled
        );
    }

    /**
     * 库存预警分析
     * 
     * @return 预警报告
     */
    public String analyzeInventory() {
        log.info("开始分析库存数据");

        try {
            // 获取所有商品
            ClGoods query = new ClGoods();
            query.setStatus("0"); // 只看上架商品
            List<ClGoods> goodsList = goodsService.selectClGoodsList(query);

            if (goodsList.isEmpty()) {
                return "当前没有上架商品。请先添加商品。";
            }

            // 统计库存情况
            int totalGoods = goodsList.size();
            List<ClGoods> lowStock = goodsList.stream()
                    .filter(g -> g.getStock() != null && g.getStock() < 10)
                    .collect(Collectors.toList());
            
            List<ClGoods> outOfStock = goodsList.stream()
                    .filter(g -> g.getStock() != null && g.getStock() == 0)
                    .collect(Collectors.toList());

            // 构建库存摘要
            StringBuilder summary = new StringBuilder();
            summary.append("📦 库存数据统计：\n");
            summary.append(String.format("- 上架商品数：%d 个\n", totalGoods));
            summary.append(String.format("- 库存不足（<10）：%d 个\n", lowStock.size()));
            summary.append(String.format("- 已售罄：%d 个\n", outOfStock.size()));

            if (!outOfStock.isEmpty()) {
                summary.append("\n⚠️ 已售罄商品：\n");
                int n = 0;
                for (ClGoods goods : outOfStock) {
                    if (n >= LLM_GOODS_NAME_LIST_MAX) {
                        break;
                    }
                    summary.append(String.format("  - %s\n", goods.getGoodsName()));
                    n++;
                }
                if (outOfStock.size() > LLM_GOODS_NAME_LIST_MAX) {
                    summary.append(String.format("  … 另有 %d 件已售罄未列出\n",
                            outOfStock.size() - LLM_GOODS_NAME_LIST_MAX));
                }
            }

            if (!lowStock.isEmpty()) {
                summary.append("\n⚠️ 库存不足商品：\n");
                int n = 0;
                for (ClGoods goods : lowStock) {
                    if (n >= LLM_GOODS_NAME_LIST_MAX) {
                        break;
                    }
                    summary.append(String.format("  - %s (剩余 %d)\n",
                            goods.getGoodsName(), goods.getStock()));
                    n++;
                }
                if (lowStock.size() > LLM_GOODS_NAME_LIST_MAX) {
                    summary.append(String.format("  … 另有 %d 件库存不足未列出\n",
                            lowStock.size() - LLM_GOODS_NAME_LIST_MAX));
                }
            }

            // 让 AI 给出补货建议
            if (!lowStock.isEmpty() || !outOfStock.isEmpty()) {
                String prompt = summary.toString() + "\n\n请给出补货建议和优先级。";
                String systemPrompt = "你是一个专业的库存管理顾问，帮助商家优化库存。";
                String aiAdvice = llmProviderService.generate(prompt, systemPrompt);
                summary.append("\n\n💡 AI 补货建议：\n").append(aiAdvice);
            } else {
                summary.append("\n\n✅ 库存充足，无需补货。");
            }

            return summary.toString();

        } catch (Exception e) {
            log.error("库存分析失败", e);
            return "库存数据分析失败：" + e.getMessage();
        }
    }

    /**
     * 商品优化建议
     * 
     * @return 优化建议
     */
    public String suggestGoodsOptimization() {
        log.info("开始分析商品优化建议");

        try {
            ClGoods query = new ClGoods();
            List<ClGoods> goodsList = goodsService.selectClGoodsList(query);

            if (goodsList.isEmpty()) {
                return "当前没有商品数据。";
            }

            // 统计商品情况
            long onShelf = goodsList.stream().filter(g -> "0".equals(g.getStatus())).count();
            long offShelf = goodsList.stream().filter(g -> "1".equals(g.getStatus())).count();

            // 价格分析
            double avgPrice = goodsList.stream()
                    .filter(g -> g.getGoodsPrice() != null)
                    .mapToDouble(g -> g.getGoodsPrice().doubleValue())
                    .average()
                    .orElse(0.0);

            String dataSummary = String.format(
                    "商品数据统计：\n" +
                    "- 总商品数：%d 个\n" +
                    "- 已上架：%d 个\n" +
                    "- 已下架：%d 个\n" +
                    "- 平均价格：%.2f 元",
                    goodsList.size(), onShelf, offShelf, avgPrice
            );

            // 让 AI 给出优化建议
            String prompt = dataSummary + "\n\n这是一个春联售卖平台，请给出商品优化建议。";
            String systemPrompt = "你是一个专业的电商运营顾问，擅长商品规划和定价策略。";

            String aiSuggestion = llmProviderService.generate(prompt, systemPrompt);

            return dataSummary + "\n\n💡 AI 优化建议：\n" + aiSuggestion;

        } catch (Exception e) {
            log.error("商品优化分析失败", e);
            return "商品优化分析失败：" + e.getMessage();
        }
    }

    /**
     * 快速数据概览
     * 
     * @return 数据概览
     */
    public String getQuickOverview() {
        try {
            Map<String, Object> overview = dashboardService.getHomeOverview();
            List<Map<String, Object>> alerts = dashboardService.getStockAlerts();

            return String.format(
                    "📊 今日数据概览\n\n" +
                    "订单情况：\n" +
                    "- 今日订单：%d 单\n" +
                    "- 总订单数：%s 单\n" +
                    "- 今日销售额：%s 元\n" +
                    "- 待处理订单：%s 单\n\n" +
                    "商品情况：\n" +
                    "- 在售商品：%s 个\n" +
                    "- 库存预警：%d 个\n\n" +
                    "💡 输入问题获取详细分析和建议",
                    orderService.getTodayOrderCount(),
                    overview.getOrDefault("totalOrders", 0),
                    overview.get("todaySales"),
                    overview.getOrDefault("pendingOrders", 0),
                    overview.getOrDefault("totalGoods", 0),
                    alerts.size()
            );

        } catch (Exception e) {
            log.error("获取数据概览失败", e);
            return "数据获取失败：" + e.getMessage();
        }
    }

    /**
     * 根据用户问题构建实时数据库上下文（供流式/非流式对话注入 LLM）
     */
    public String buildDataContextForQuestion(String question) {
        String q = question == null ? "" : question.trim();
        StringBuilder ctx = new StringBuilder();
        ctx.append("【春联商城实时数据库快照】\n");
        ctx.append("查询时间：").append(LocalDateTime.now().format(DATA_TIME_FMT)).append("\n\n");

        appendSectionOverview(ctx);

        boolean orderRelated = isOrderRelated(q);
        boolean goodsRelated = isGoodsRelated(q);
        boolean dataRelated = isDataAnalysisRelated(q);

        if (orderRelated || dataRelated || q.contains("趋势") || q.contains("最近")) {
            appendSectionOrderStatus(ctx);
            appendSectionWeeklySales(ctx);
            appendSectionRecentOrders(ctx, 5);
        }

        if (goodsRelated || dataRelated || q.contains("热销") || q.contains("卖得好")) {
            appendSectionStockAlerts(ctx);
            appendSectionHotGoods(ctx, 5);
        }

        if (dataRelated || q.contains("定制")) {
            appendSectionCustomOrders(ctx);
        }

        if (!orderRelated && !goodsRelated && !dataRelated) {
            appendSectionOrderStatus(ctx);
            appendSectionStockAlerts(ctx);
        }

        return ctx.toString();
    }

    /**
     * 将数据库快照与用户问题合并为 LLM 用户消息
     */
    public String buildEnrichedUserMessage(String question, String dataContext) {
        if (StringUtils.isEmpty(dataContext)) {
            return question;
        }
        return "以下是系统从 MySQL 业务库（cl_order、cl_goods、cl_custom_order 等）实时查询的数据。"
                + "请严格基于这些数据回答，不得编造未出现的数字；若某项数据为空请如实说明。\n\n"
                + dataContext
                + "\n\n---\n用户问题：" + question;
    }

    /**
     * 获取带数据约束的系统提示词
     */
    public String getSystemPromptForQuestion(String question) {
        if (isOrderRelated(question)) {
            return "你是春联商城的订单数据分析专家。必须仅根据用户消息中的【实时数据库快照】作答，用中文给出数据解读和经营建议。";
        }
        if (isGoodsRelated(question)) {
            return "你是春联商城的商品与库存顾问。必须仅根据用户消息中的【实时数据库快照】作答，用中文给出补货与定价建议。";
        }
        if (isDataAnalysisRelated(question)) {
            return "你是春联商城的数据分析师。必须仅根据用户消息中的【实时数据库快照】作答，用中文输出结构化分析结论。";
        }
        return "你是春联商城管理后台的 AI 助手。用户消息中已附带【实时数据库快照】，请基于真实数据用中文回答，不要声称无法访问数据库。";
    }

    private void appendSectionOverview(StringBuilder ctx) {
        Map<String, Object> overview = dashboardService.getHomeOverview();
        ctx.append("## 经营概览\n");
        ctx.append("- 上架商品数：").append(overview.getOrDefault("totalGoods", 0)).append("\n");
        ctx.append("- 订单总数：").append(overview.getOrDefault("totalOrders", 0)).append("\n");
        ctx.append("- 今日销售额：").append(overview.getOrDefault("todaySales", 0)).append(" 元\n");
        ctx.append("- 待处理订单：").append(overview.getOrDefault("pendingOrders", 0)).append(" 单\n\n");
    }

    private void appendSectionOrderStatus(StringBuilder ctx) {
        List<Map<String, Object>> distribution = dashboardService.getOrderStatusDistribution();
        ctx.append("## 近30天订单状态分布\n");
        if (distribution == null || distribution.isEmpty()) {
            ctx.append("- 暂无订单记录\n\n");
            return;
        }
        for (Map<String, Object> item : distribution) {
            ctx.append("- ").append(item.get("status_name"))
                    .append("：").append(item.get("count")).append(" 单\n");
        }
        ctx.append("\n");
    }

    private void appendSectionWeeklySales(StringBuilder ctx) {
        List<Map<String, Object>> weeklySales = dashboardService.getWeeklySales();
        ctx.append("## 近7天销售趋势\n");
        if (weeklySales == null || weeklySales.isEmpty()) {
            ctx.append("- 近7天暂无成交记录\n\n");
            return;
        }
        for (Map<String, Object> item : weeklySales) {
            ctx.append("- ").append(item.get("date"))
                    .append("：订单 ").append(item.get("order_count"))
                    .append(" 单，销售额 ").append(item.get("sales_amount")).append(" 元\n");
        }
        ctx.append("\n");
    }

    private void appendSectionRecentOrders(StringBuilder ctx, int limit) {
        List<Map<String, Object>> orders = dashboardService.getRecentOrders();
        ctx.append("## 最近订单（最多").append(limit).append(" 条）\n");
        if (orders == null || orders.isEmpty()) {
            ctx.append("- 暂无订单\n\n");
            return;
        }
        int count = 0;
        for (Map<String, Object> order : orders) {
            if (count >= limit) {
                break;
            }
            ctx.append("- ").append(order.get("orderNo"))
                    .append(" | 金额 ").append(order.get("amount"))
                    .append(" 元 | 状态 ").append(order.get("status"));
            if (order.get("createTime") != null) {
                ctx.append(" | ").append(order.get("createTime"));
            }
            ctx.append("\n");
            count++;
        }
        ctx.append("\n");
    }

    private void appendSectionStockAlerts(StringBuilder ctx) {
        List<Map<String, Object>> alerts = dashboardService.getStockAlerts();
        ctx.append("## 库存预警（库存 < 10）\n");
        if (alerts == null || alerts.isEmpty()) {
            ctx.append("- 当前无库存预警\n\n");
            return;
        }
        int n = 0;
        for (Map<String, Object> item : alerts) {
            if (n >= LLM_GOODS_NAME_LIST_MAX) {
                break;
            }
            ctx.append("- ").append(item.get("name"))
                    .append("：剩余 ").append(item.get("stock")).append("\n");
            n++;
        }
        ctx.append("\n");
    }

    private void appendSectionHotGoods(StringBuilder ctx, int limit) {
        List<Map<String, Object>> hotGoods = dashboardService.getHotGoodsRanking();
        ctx.append("## 热销商品（近30天）\n");
        if (hotGoods == null || hotGoods.isEmpty()) {
            ctx.append("- 暂无销量数据\n\n");
            return;
        }
        int count = 0;
        for (Map<String, Object> item : hotGoods) {
            if (count >= limit) {
                break;
            }
            ctx.append("- ").append(item.get("name"))
                    .append("：销量 ").append(item.get("sales_count")).append("\n");
            count++;
        }
        ctx.append("\n");
    }

    private void appendSectionCustomOrders(StringBuilder ctx) {
        Map<String, Object> stats = dashboardService.getCustomOrderStats();
        ctx.append("## 定制订单（近30天）\n");
        if (stats == null || stats.isEmpty()) {
            ctx.append("- 暂无定制订单\n\n");
            return;
        }
        ctx.append("- 总数：").append(stats.getOrDefault("total_count", 0)).append("\n");
        ctx.append("- 待接单：").append(stats.getOrDefault("pending_count", 0)).append("\n");
        ctx.append("- 制作中：").append(stats.getOrDefault("processing_count", 0)).append("\n");
        ctx.append("- 已完成：").append(stats.getOrDefault("completed_count", 0)).append("\n\n");
    }

    // ========== 私有辅助方法 ==========

    /**
     * 判断是否是订单相关问题
     */
    private boolean isOrderRelated(String question) {
        return question.contains("订单") || question.contains("销售") || 
               question.contains("营业额") || question.contains("今天");
    }

    /**
     * 判断是否是商品相关问题
     */
    private boolean isGoodsRelated(String question) {
        return question.contains("商品") || question.contains("库存") || 
               question.contains("补货") || question.contains("价格");
    }

    /**
     * 判断是否是数据分析相关问题
     */
    private boolean isDataAnalysisRelated(String question) {
        return question.contains("分析") || question.contains("统计") || 
               question.contains("报表") || question.contains("数据");
    }

    /**
     * 处理订单相关问题
     */
    private String handleOrderQuestion(String question) {
        String dataContext = buildDataContextForQuestion(question);
        String enriched = buildEnrichedUserMessage(question, dataContext);
        return llmProviderService.generate(enriched, getSystemPromptForQuestion(question));
    }

    /**
     * 处理商品相关问题
     */
    private String handleGoodsQuestion(String question) {
        String dataContext = buildDataContextForQuestion(question);
        String enriched = buildEnrichedUserMessage(question, dataContext);
        return llmProviderService.generate(enriched, getSystemPromptForQuestion(question));
    }

    /**
     * 处理数据分析相关问题
     */
    private String handleDataAnalysisQuestion(String question) {
        String dataContext = buildDataContextForQuestion(question);
        String enriched = buildEnrichedUserMessage(question, dataContext);
        return llmProviderService.generate(enriched, getSystemPromptForQuestion(question));
    }
}
