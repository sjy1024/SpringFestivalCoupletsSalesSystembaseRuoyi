# 内存优化指南

## 当前内存使用情况

总内存：15.6GB
空闲内存：2.1GB ⚠️ **太少了！**

### 主要内存占用：
- Java (Spring Boot): 870MB
- Chrome浏览器: 688MB
- Node.js: 565MB
- Windows系统: 1.6GB+

## Ollama内存需求

gemma2:2b模型需要：
- 标准模式：1.9GB (模型1.5GB + KV缓存416MB)
- 低内存模式：1.7GB (模型1.5GB + KV缓存200MB)

## 解决方案

### 方案1：释放内存（推荐）

**立即执行：**
1. 关闭Chrome浏览器 → 释放约700MB
2. 关闭不需要的Node.js进程 → 释放约565MB
3. 关闭其他不必要的程序

**释放后可用内存：**
- 当前：2.1GB
- 关闭Chrome：2.8GB
- 关闭Node.js：3.4GB ✅ **足够运行Ollama**

### 方案2：使用低内存模式

已创建 `start-ollama-lowmem.bat` 脚本：
- 减少上下文大小（2048 tokens）
- 模型1分钟不用自动卸载
- 需要约1.7GB内存

### 方案3：增加虚拟内存

如果经常遇到内存不足：
1. 右键"此电脑" → 属性
2. 高级系统设置 → 性能设置
3. 高级 → 虚拟内存 → 更改
4. 设置为：初始大小 8192MB，最大 16384MB

## 推荐操作步骤

```bash
# 1. 关闭Chrome和其他程序

# 2. 启动低内存模式Ollama
start-ollama-lowmem.bat

# 3. 等待10秒后启动Spring Boot
cd ruoyi-admin
mvn spring-boot:run
```

## 性能预期

低内存模式下：
- ✅ 可以正常运行
- ⚠️ 响应时间：15-40秒
- ⚠️ 对话长度受限（2048 tokens）
- ✅ 稳定性好

## 长期建议

如果经常使用AI功能，考虑：
1. 升级内存到32GB
2. 或使用云端AI服务（OpenAI API）
3. 或使用更小的模型（但gemma2:2b已经是很小的了）
