# AI 助手功能配置指南

## 概述
本项目集成了 Ollama 本地 AI 服务，为管理员提供智能对话、数据分析等功能。

## 前置要求

### 1. 安装 Ollama
- 访问 [Ollama 官网](https://ollama.ai) 下载安装程序
- 支持 Windows、macOS、Linux

### 2. 启动 Ollama 服务

#### Windows
```bash
# 安装后，Ollama 会自动启动
# 如果需要手动启动，运行：
ollama serve
```

#### macOS/Linux
```bash
ollama serve
```

服务默认运行在 `http://localhost:11434`

### 3. 下载模型

打开新的终端窗口，运行：

```bash
# 下载 Gemma3 模型（推荐，4B 版本较轻量）
ollama pull gemma3:4b

# 或下载其他模型
ollama pull qwen2.5:4b
ollama pull mistral:7b
```

查看已安装的模型：
```bash
ollama list
```

## 项目配置

### 1. Ollama（本机，默认）

编辑 `ruoyi-admin/src/main/resources/application.yml` 中的 `ruoyi.ollama`：

- `base-url`：与 `ollama serve` 一致（勿尾随 `/`）
- `model`：与 `ollama list` 中的名称一致（如 `gemma2:2b`）

### 2. 使用开源/云端大模型 API（OpenAI 兼容协议）

当本机 Ollama 不稳定或不想本地跑模型时，可改用任意 **Chat Completions** 兼容接口（如 **DeepSeek**、**Groq**、**硅基流动 SiliconFlow**、**OpenRouter**、官方 OpenAI 等）。

1. 在服务商控制台创建 API Key。  
2. 设置环境变量（推荐，避免密钥进仓库）：

```bash
# Windows CMD 示例
set RUOYI_OPENAI_API_KEY=sk-你的密钥
```

3. 编辑 `application.yml`：

```yaml
ruoyi:
  llm:
    provider: openai-compatible   # 改为 openai-compatible
  openaiApi:
    baseUrl: https://api.deepseek.com/v1   # 按服务商文档填写，需含 /v1
    apiKey: ${RUOYI_OPENAI_API_KEY:}
    model: deepseek-chat            # 以服务商文档为准
    maxTokens: 1024
```

4. 重启 `ruoyi-admin`。管理端「智能助手」的健康检查会请求 `GET {baseUrl}/models`（需该接口可用且 Key 有效）。

仍使用 Ollama 时保持 `ruoyi.llm.provider: ollama` 即可。

## 测试 AI 服务

### 方法 1：使用 API 端点

```bash
# 健康检查
curl http://localhost:8080/system/assistant/health

# 返回示例：
# {"msg":"AI 服务正常运行","code":0}
```

### 方法 2：在前端测试

1. 登录管理后台
2. 进入 AI 助手模块
3. 发送测试消息

## 常见问题

### Q1: 提示 "AI 服务不可用"

**原因：**
- Ollama 服务未启动
- 模型未下载
- 网络连接问题

**解决方案：**
```bash
# 1. 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 2. 如果返回 404，启动 Ollama
ollama serve

# 3. 检查模型是否存在
ollama list

# 4. 如果模型不存在，下载
ollama pull gemma3:4b
```

### Q2: 响应很慢

**原因：**
- 模型较大，首次加载需要时间
- 系统资源不足
- 网络延迟

**解决方案：**
- 使用更小的模型（如 2B 版本）
- 增加系统内存
- 检查网络连接

### Q3: 出现 "未结束的字符串文字" 错误

**原因：** 代码中有语法错误

**解决方案：**
- 重新编译项目：`mvn clean compile`
- 检查 OllamaService.java 文件

### Q4: SSE 流式响应异常

**原因：** 异常处理器与 SSE Content-Type 冲突

**解决方案：**
- 已在最新版本中修复
- 确保使用最新的 AdminAssistantController.java

## 功能说明

### 1. 智能对话（流式）
- **端点：** `POST /system/assistant/chat/stream`
- **特点：** 实时流式输出，使用 Server-Sent Events (SSE)
- **请求体：**
```json
{
  "message": "今天的订单情况怎么样？"
}
```

### 2. 智能对话（普通）
- **端点：** `POST /system/assistant/chat`
- **特点：** 一次性返回完整回复
- **请求体：**
```json
{
  "message": "今天的订单情况怎么样？",
  "sessionId": "可选的会话ID"
}
```

### 3. 订单分析
- **端点：** `GET /system/assistant/analyze/orders`
- **功能：** 分析订单数据并提供建议

### 4. 库存分析
- **端点：** `GET /system/assistant/analyze/inventory`
- **功能：** 分析库存情况并提供补货建议

### 5. 商品优化
- **端点：** `GET /system/assistant/suggest/goods`
- **功能：** 提供商品优化建议

### 6. 数据概览
- **端点：** `GET /system/assistant/overview`
- **功能：** 快速获取数据概览

### 7. 健康检查
- **端点：** `GET /system/assistant/health`
- **功能：** 检查 AI 服务是否可用

## 性能优化建议

### 1. 选择合适的模型

| 模型 | 大小 | 速度 | 质量 | 推荐场景 |
|------|------|------|------|---------|
| gemma:2b | ~1.5GB | 快 | 一般 | 轻量级应用 |
| gemma3:4b | ~2.5GB | 中等 | 良好 | 推荐 |
| qwen2.5:4b | ~2.5GB | 中等 | 良好 | 替代方案 |
| qwen2.5:7b | ~4.5GB | 慢 | 优秀 | 高质量需求 |

### 2. 调整超时时间

编辑 OllamaService.java：

```java
this.client = new OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)   // 连接超时
        .readTimeout(120, TimeUnit.SECONDS)     // 读取超时（可调整）
        .writeTimeout(10, TimeUnit.SECONDS)     // 写入超时
        .build();
```

### 3. 调整生成参数

编辑 OllamaService.java 中的 `generateWithRetry` 方法：

```java
Map<String, Object> options = new HashMap<>();
options.put("temperature", 0.7);      // 创造性（0-1，越高越创意）
options.put("top_p", 0.9);            // 多样性（0-1）
options.put("num_predict", 500);      // 最大生成长度
```

## 日志查看

### 查看 Ollama 日志

```bash
# Windows
# 查看 Ollama 安装目录的日志

# macOS/Linux
tail -f ~/.ollama/logs/server.log
```

### 查看应用日志

```bash
# 查看 Spring Boot 应用日志
tail -f logs/ruoyi.log
```

## 故障排查

### 步骤 1：检查 Ollama 服务

```bash
curl -v http://localhost:11434/api/tags
```

预期响应：
```json
{
  "models": [
    {
      "name": "qwen2.5:4b",
      "modified_at": "2024-01-01T00:00:00Z",
      "size": 2500000000,
      "digest": "..."
    }
  ]
}
```

### 步骤 2：检查应用连接

访问：`http://localhost:8080/system/assistant/health`

预期响应：
```json
{
  "msg": "AI 服务正常运行",
  "code": 0
}
```

### 步骤 3：查看详细日志

在应用日志中搜索 "OllamaService" 或 "AI"，查看详细错误信息。

## 更多资源

- [Ollama 官网](https://ollama.ai)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [模型库](https://ollama.ai/library)
- [API 文档](https://github.com/ollama/ollama/blob/main/docs/api.md)

## 支持

如有问题，请：
1. 查看本文档的常见问题部分
2. 检查应用日志
3. 查看 Ollama 日志
4. 联系技术支持
