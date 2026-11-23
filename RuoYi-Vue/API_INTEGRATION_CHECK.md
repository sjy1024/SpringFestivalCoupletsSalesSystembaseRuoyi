# 前后端接口对接检查

## 接口对比表

| 功能 | 前端调用 | 后端接口 | 状态 | 说明 |
|------|---------|---------|------|------|
| 流式对话 | POST `/system/assistant/chat/stream` | ✅ `@PostMapping("/chat/stream")` | ✅ 完全匹配 | SSE流式输出 |
| 订单分析 | GET `/system/assistant/analyze/orders` | ✅ `@GetMapping("/analyze/orders")` | ✅ 完全匹配 | 需要权限 |
| 库存分析 | GET `/system/assistant/analyze/inventory` | ✅ `@GetMapping("/analyze/inventory")` | ✅ 完全匹配 | 无权限要求 |
| 商品建议 | GET `/system/assistant/suggest/goods` | ✅ `@GetMapping("/suggest/goods")` | ✅ 完全匹配 | 需要权限 |
| 对话历史 | GET `/system/assistant/recent?limit=100` | ✅ `@GetMapping("/recent")` | ✅ 完全匹配 | 支持limit参数 |

## 未使用的后端接口

以下后端接口已实现但前端未调用：

1. **普通对话接口**
   - 接口：`POST /system/assistant/chat`
   - 说明：非流式对话，返回完整响应
   - 建议：保留作为备用，流式失败时可降级使用

2. **会话历史查询**
   - 接口：`GET /system/assistant/history/{sessionId}`
   - 说明：根据会话ID查询历史
   - 建议：前端可添加"查看完整会话"功能

3. **删除会话历史**
   - 接口：`DELETE /system/assistant/history/{sessionId}`
   - 说明：删除指定会话
   - 建议：前端历史列表可添加"删除"按钮

4. **数据概览**
   - 接口：`GET /system/assistant/overview`
   - 说明：快速数据概览
   - 建议：可作为欢迎页的数据展示

5. **健康检查**
   - 接口：`GET /system/assistant/health`
   - 说明：检查AI服务状态
   - 建议：用于动态更新"AI服务在线"状态

## 需要完善的地方

### 1. 前端缺少的功能

#### ❌ 健康检查状态更新
**问题：** 前端显示"AI 服务在线"是静态的，没有实际检查

**解决方案：**
```javascript
// 在 mounted 钩子中添加
async mounted() {
  await this.checkAIServiceStatus()
  // 每30秒检查一次
  this.healthCheckTimer = setInterval(() => {
    this.checkAIServiceStatus()
  }, 30000)
},

methods: {
  async checkAIServiceStatus() {
    try {
      const response = await request({
        url: '/system/assistant/health',
        method: 'get'
      })
      this.aiServiceOnline = response.code === 200
    } catch (error) {
      this.aiServiceOnline = false
    }
  }
}
```

#### ❌ 删除单条历史记录
**问题：** 前端只能清空所有历史，不能删除单条

**解决方案：** 在历史记录项添加删除按钮

#### ❌ 查看完整会话
**问题：** 历史记录是平铺的，无法按会话分组查看

**解决方案：** 添加会话分组视图

### 2. 后端需要添加的接口

#### ❌ 批量删除历史记录
**问题：** 前端"清空所有历史"功能没有对应的后端接口

**需要添加：**
```java
@DeleteMapping("/history/all")
public AjaxResult deleteAllHistory() {
    try {
        Long userId = SecurityUtils.getUserId();
        chatService.deleteAllChatsByUserId(userId);
        return success("删除成功");
    } catch (Exception e) {
        return error("删除失败：" + e.getMessage());
    }
}
```

### 3. 数据格式问题

#### ⚠️ 历史记录返回格式
**当前：** `/recent` 接口返回格式不确定

**需要确认：**
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "chatId": 1,
      "sessionId": "xxx",
      "userId": 1,
      "userName": "admin",
      "role": "user",
      "content": "你好",
      "questionType": "general",
      "responseTime": 1500,
      "createTime": "2026-03-06 17:28:00"
    }
  ],
  "total": 100
}
```

## 权限配置检查

### 需要的权限标识

| 权限标识 | 说明 | 使用位置 |
|---------|------|---------|
| `system:assistant:view` | 查看权限 | 历史记录、概览 |
| `system:assistant:chat` | 对话权限 | 发送消息、流式对话 |
| `system:assistant:analyze` | 分析权限 | 订单分析、商品建议 |
| `system:assistant:delete` | 删除权限 | 删除历史记录 |

### 特殊说明

- 库存分析接口 `/analyze/inventory` 没有权限要求（已注释）
- 健康检查接口 `/health` 没有权限要求

## 编码配置检查

### ✅ 已配置的地方

1. **后端 Controller**
   ```java
   produces = "text/event-stream;charset=UTF-8"
   ```

2. **后端 OllamaService**
   ```java
   new InputStreamReader(responseBody.byteStream(), StandardCharsets.UTF_8)
   ```

3. **后端 application.yml**
   ```yaml
   spring:
     http:
       encoding:
         charset: UTF-8
         enabled: true
         force: true
   ```

4. **前端 Vue**
   ```javascript
   const decoder = new TextDecoder('utf-8')
   'Content-Type': 'application/json;charset=UTF-8'
   ```

## 测试清单

### 基础功能测试

- [ ] 1. 启动 Ollama 服务（CPU模式）
- [ ] 2. 启动 Spring Boot 后端
- [ ] 3. 启动 Vue 前端
- [ ] 4. 登录系统，进入智能助手页面
- [ ] 5. 测试发送消息"你好"
- [ ] 6. 检查是否有乱码
- [ ] 7. 测试快捷提问按钮
- [ ] 8. 测试智能分析按钮
- [ ] 9. 测试对话历史功能
- [ ] 10. 测试历史记录搜索和筛选

### 权限测试

- [ ] 1. 创建测试用户，不分配任何权限
- [ ] 2. 登录后检查是否能访问智能助手
- [ ] 3. 逐个分配权限，测试功能是否可用

### 性能测试

- [ ] 1. 发送长文本消息（500字以上）
- [ ] 2. 连续发送多条消息
- [ ] 3. 查看大量历史记录（100+条）
- [ ] 4. 监控内存占用

### 异常测试

- [ ] 1. 关闭 Ollama 服务，测试错误提示
- [ ] 2. 网络断开，测试超时处理
- [ ] 3. 发送空消息，测试验证
- [ ] 4. 快速连续点击发送按钮

## 建议的改进

### 短期改进（必要）

1. **添加健康检查状态更新**
   - 动态显示AI服务状态
   - 服务离线时禁用发送按钮

2. **完善历史记录功能**
   - 添加删除单条记录
   - 添加会话分组视图
   - 添加导出功能

3. **添加批量删除接口**
   - 后端实现批量删除
   - 前端对接清空功能

### 中期改进（优化）

1. **添加数据概览面板**
   - 在欢迎页显示快速数据
   - 使用 `/overview` 接口

2. **优化流式输出体验**
   - 添加打字机效果
   - 添加停止生成按钮

3. **添加会话管理**
   - 会话列表
   - 会话重命名
   - 会话导出

### 长期改进（增强）

1. **添加语音输入**
   - 使用浏览器语音识别API
   - 支持语音转文字

2. **添加图表生成**
   - 数据分析结果可视化
   - 使用 ECharts 生成图表

3. **添加多模型支持**
   - 支持切换不同AI模型
   - 支持自定义模型参数

## 总结

### ✅ 已完成
- 核心对话功能（流式输出）
- 智能分析功能（订单、库存、商品）
- 对话历史展示
- 编码配置完善

### ⚠️ 需要完善
- 健康检查状态更新
- 批量删除历史记录接口
- 删除单条历史记录功能
- 会话分组视图

### 📝 建议优化
- 数据概览面板
- 打字机效果
- 会话管理功能
- 语音输入支持

## 下一步行动

1. **立即执行**
   - 添加健康检查状态更新（前端）
   - 添加批量删除接口（后端）
   - 测试所有功能

2. **本周完成**
   - 完善历史记录功能
   - 优化用户体验
   - 性能测试和优化

3. **后续规划**
   - 添加高级功能
   - 用户反馈收集
   - 持续优化改进
