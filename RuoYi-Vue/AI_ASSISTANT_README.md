# AI 助手功能 - 快速开始指南

## 📋 概述

本项目已集成 Ollama 本地 AI 服务，为管理员提供以下功能：

- ✅ 智能对话（流式和普通模式）
- ✅ 订单数据分析
- ✅ 库存预警分析
- ✅ 商品优化建议
- ✅ 数据概览

## 🚀 快速开始（3 步）

### 第 1 步：安装 Ollama

访问 [Ollama 官网](https://ollama.ai) 下载并安装

### 第 2 步：下载模型

**Windows 用户：**
```bash
download-model.bat
```

**macOS/Linux 用户：**
```bash
chmod +x download-model.sh
./download-model.sh
```

或手动下载：
```bash
ollama pull gemma3:4b
```

### 第 3 步：启动服务

**Windows 用户：**
```bash
start-ollama.bat
```

**macOS/Linux 用户：**
```bash
chmod +x start-ollama.sh
./start-ollama.sh
```

或手动启动：
```bash
ollama serve
```

## ✅ 验证安装

运行诊断脚本：

**Windows：**
```bash
diagnose.bat
```

**macOS/Linux：**
```bash
chmod +x diagnose.sh
./diagnose.sh
```

或访问健康检查端点：
```bash
curl http://localhost:8080/system/assistant/health
```

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `AI_ASSISTANT_SETUP.md` | 详细配置指南 |
| `start-ollama.bat` | Windows Ollama 启动脚本 |
| `start-ollama.sh` | macOS/Linux Ollama 启动脚本 |
| `download-model.bat` | Windows 模型下载脚本 |
| `download-model.sh` | macOS/Linux 模型下载脚本 |
| `diagnose.bat` | Windows 诊断脚本 |
| `diagnose.sh` | macOS/Linux 诊断脚本 |

## 🔧 代码改进

### 1. 异常处理优化
- ✅ 修复 SSE 流式响应的异常处理
- ✅ 避免在流式响应中触发全局异常处理器
- ✅ 改进错误消息提示

### 2. 错误诊断
- ✅ 更清晰的错误提示
- ✅ 包含解决方案的错误消息
- ✅ 详细的日志记录

### 3. 服务健康检查
- ✅ 自动检查 Ollama 服务可用性
- ✅ 缓存检查结果（1 分钟）
- ✅ 提供健康检查 API 端点

## 📊 API 端点

### 1. 流式对话
```
POST /system/assistant/chat/stream
Content-Type: application/json

{
  "message": "今天的订单情况怎么样？"
}

响应: Server-Sent Events (SSE)
```

### 2. 普通对话
```
POST /system/assistant/chat
Content-Type: application/json

{
  "message": "今天的订单情况怎么样？",
  "sessionId": "可选"
}

响应: JSON
```

### 3. 健康检查
```
GET /system/assistant/health

响应:
{
  "msg": "AI 服务正常运行",
  "code": 0
}
```

### 4. 订单分析
```
GET /system/assistant/analyze/orders
```

### 5. 库存分析
```
GET /system/assistant/analyze/inventory
```

### 6. 商品优化
```
GET /system/assistant/suggest/goods
```

### 7. 数据概览
```
GET /system/assistant/overview
```

## 🐛 常见问题

### Q: 提示 "AI 服务不可用"

**A:** 运行诊断脚本检查：
```bash
# Windows
diagnose.bat

# macOS/Linux
./diagnose.sh
```

### Q: 模型下载很慢

**A:** 这是正常的，取决于网络速度和模型大小。可以选择更小的模型：
```bash
ollama pull gemma:2b  # 更小，更快
```

### Q: 响应很慢

**A:** 
- 首次加载模型需要时间
- 可以选择更小的模型
- 检查系统资源是否充足

### Q: 出现编译错误

**A:** 重新编译项目：
```bash
mvn clean compile -DskipTests
```

## 📚 详细文档

查看 `AI_ASSISTANT_SETUP.md` 获取：
- 详细的安装步骤
- 模型选择指南
- 性能优化建议
- 故障排查步骤
- 日志查看方法

## 🎯 下一步

1. ✅ 安装 Ollama
2. ✅ 下载模型
3. ✅ 启动服务
4. ✅ 验证安装
5. ✅ 在前端测试 AI 助手功能

## 💡 提示

- 首次使用时，模型加载可能需要 30-60 秒
- 建议使用 `gemma3:4b` 模型，平衡质量和速度
- 保持 Ollama 服务持续运行以获得最佳体验
- 查看应用日志了解详细的错误信息

## 📞 支持

如有问题：
1. 查看本文档和 `AI_ASSISTANT_SETUP.md`
2. 运行诊断脚本
3. 检查应用日志
4. 查看 Ollama 日志

---

**祝您使用愉快！** 🎉
