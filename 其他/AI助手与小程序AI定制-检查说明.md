# AI 助手模块与小程序 AI / 定制联动检查说明

> 检查日期：2026-05-07  
> 范围：`RuoYi-Vue` 管理端智能助手、`AppAIController`、小程序 `APP-ai-chat`、`APP-custom`、`APP-ai-recommend`

---

## 一、管理端智能助手（`/system/assistant`）

### 已做得较好的部分

- **流式对话**：`AdminAssistantController.chatStream` 使用 SSE；默认配置 `ruoyi.llm.provider=openai-compatible` 时由 `OpenAiCompatibleLlmService.generateStream` 调 LM Studio（或同类 OpenAI 兼容服务）；若改为 `ollama` 则走 `OllamaService.generateStream`。与 `ruoyi-ui` 中 `fetch` + `TextDecoder` 消费方式匹配。
- **健康检查**：`index.vue` 在 `mounted` 中调用 `/system/assistant/health`，并每 30 秒轮询；离线时禁止发送，避免无效请求。
- **非流式对话**：`POST /system/assistant/chat` 走 `AdminAssistantService.chat`，会 **落库**（用户问 + AI 答）。
- **分析类接口**：订单 / 库存 / 商品建议等与 `handleAnalysis` 对接正常；若依 `request` 成功时返回的 `res.data` 为字符串时可正确展示。
- **清空历史**：后端已有 `DELETE /system/assistant/history/all`，与前端「清空所有历史」一致（此前文档里「缺接口」的条目在代码中已补齐）。

### 建议关注的问题

1. **流式对话不落库**  
   当前仅 `POST /chat` 会 `saveChat`；**主界面发送走的是流式 `/chat/stream`**，不会在 `cl_assistant_chat` 中写入本轮对话。结果是：**「对话历史」里看不到用流式聊过的内容**，与用户对「历史」的预期不一致。  
   **建议**：在流式 `onComplete` 后拼接全文，调用 `AdminAssistantService` 中已有逻辑写入 user/assistant 各一条（需生成或传入稳定 `sessionId`）；或文档中明确写「历史仅记录非流式/分析类操作」。

2. **删除单条历史与接口语义**  
   `DELETE /history/{sessionId}` 按 **会话** 删除。若列表按「条」展示同一 `sessionId` 下多条记录，点删一条会删掉 **整个会话**，前端仅按 `chatId` 删一行可能造成列表与库不一致。  
   **建议**：删除后按 `sessionId` 过滤掉列表中所有同行，或改为「删除本会话」文案。

3. **Ollama 配置与注释**  
   `OllamaService` 类注释仍写「Gemma3」，常量实际为 `gemma2:2b`。部署时以 `MODEL_NAME` 为准，避免按注释拉错模型。

4. **「清空对话」与「清空历史」**  
   输入区旁「清空对话」只清当前页 `messages`，**不删库**；与弹窗里「清空所有历史」不同，答辩时可一句话说明即可。

---

## 二、小程序 AI 对话（`/api/ai/*` + `APP-ai-chat`）

### 后端 `AppAIController`

- 全部为 **`@Anonymous` 关键字规则 + 固定示例**，无 Ollama，与说明书「C 端为模拟」一致。
- 返回体结构：`success` 里含 `reply`（聊天）、`topics`（推荐主题）等。

### 前端问题（已修复一项）

- **字段名不一致**：页面原先用 `res.content`，而后端为 `res.reply`，在 `request.js` 解包后 `res` 为 `data` 对象，导致 **`res.content` 恒为空**，界面几乎总是走本地 `generateAIResponse`。  
  **已在 `pages/APP-ai-chat/index.js` 中改为使用 `res.reply || res.content`。**

### 仍可改进点

1. **`generateCouplet` 未使用**：`ai.js` 与后端 `POST /api/ai/generate-couplet` 已实现，但对话页未调用；若要做「一键生成填入定制页」，需在定制页或对话页串联。
2. **`/api/ai/history`、`/api/ai/recommend`**：`APP-config` / `APP-ai-service.js` 有路径，但当前对话页主要用 `chat` + `recommend-topics`；无服务端会话历史时属预期，若要做跨端历史需新接口与鉴权。
3. **匿名接口**：`/api/ai` 全匿名，适合毕设演示；若上线需防刷与限流（网关或注解）。

---

## 三、小程序「AI + 定制」联动（`APP-custom`）

### 实际关系

- 定制页 **`navigateToAIChat`**：仅跳转到 AI 对话页，**没有把 AI 生成结果写回** `selectedOptions.shanglian / xialian / hengpi`。
- **`APP-ai-recommend` 组件**：`components/APP-components/APP-ai-recommend/index.js` 几乎为空壳，**未承担推荐或填表逻辑**。
- 定制正文能力主要在 **`submitCustomPlan` / `saveCustomPlan` + 选项与价格接口`**，与 AI 模块 **无数据流耦合**。

### 产品/论文表述建议

- 若标题强调「AI 定制」，建议在实现或论文中二选一写清：  
  - **「AI 辅助文案」**：对话生成后用户手动复制到定制页；或  
  - **「待实现」**：对话页「应用到定制」按钮 + 全局事件或路由参数回传。  

避免评审理解为「选完规格后由模型自动填联」而实际未实现。

---

## 四、与后台大模型助手的差异（答辩口径）

| 项目 | 管理端助手 | 小程序 AI |
| --- | --- | --- |
| 模型 | 默认 **LM Studio**（`ruoyi.openaiApi.baseUrl`，OpenAI 兼容）；可选 Ollama（`ruoyi.llm.provider=ollama`） | 无，规则/模拟（`ruoyi.app-ai.use-llm=false` 时） |
| 鉴权 | JWT + 权限字 | 匿名 |
| 落库 | 非流式 chat 落库；流式当前不落库 | 不落库 |
| 典型用途 | 运营分析、库存订单解读 | 春联话术、导流到定制页 |

---

## 五、建议优先级

| 优先级 | 项 |
| --- | --- |
| 高 | 流式对话是否落库（功能或文档二选一说清楚） |
| 高 | 小程序已修 `reply` 字段；联调一眼确认气泡文案来自后端 |
| 中 | 删除单条历史与 `sessionId` 语义、前端列表一致性 |
| 中 | AI 与定制联动：明确「跳转引导」或做「回填」小功能 |
| 低 | `OllamaService` 注释与 `MODEL_NAME` 一致；`APP-ai-recommend` 补全或移除 |

如需下一步在 **流式完成后写库** 或 **从 AI 页一键回填定制表单**，可指定优先级后改 Java + 小程序路由参数即可。
