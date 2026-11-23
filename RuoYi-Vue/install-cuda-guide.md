# CUDA Toolkit 安装指南

## 问题诊断
- ✅ NVIDIA驱动已安装（566.07，支持CUDA 12.7）
- ❌ CUDA Toolkit未安装（缺少运行时库）
- 结果：Ollama无法使用GPU，报"unable to allocate CUDA0 buffer"错误

## 解决方案

### 方案A：安装CUDA Toolkit（推荐用GPU）

1. **下载CUDA Toolkit 12.7**
   - 官网：https://developer.nvidia.com/cuda-downloads
   - 选择：Windows > x86_64 > 11 > exe(local)
   - 大小：约3GB

2. **安装步骤**
   ```
   - 运行下载的安装程序
   - 选择"自定义安装"
   - 至少勾选：
     ✓ CUDA Runtime
     ✓ CUDA Libraries
     ✓ CUDA Development (可选)
   - 安装路径：默认即可
   ```

3. **验证安装**
   ```bash
   # 重启命令行后执行
   nvcc --version
   
   # 应该看到：
   # Cuda compilation tools, release 12.7, V12.7.xxx
   ```

4. **重启Ollama**
   ```bash
   restart-ollama.bat
   ```

### 方案B：继续使用CPU模式（当前配置）

**优点：**
- 无需安装任何东西
- 稳定可靠，不会有显存问题
- gemma2:2b模型在CPU上也能跑

**缺点：**
- 速度较慢（10-30秒响应）
- CPU占用较高

**当前已配置为CPU模式，可以直接使用！**

## 性能对比

| 模式 | 响应时间 | 稳定性 | 需要安装 |
|------|---------|--------|---------|
| GPU  | 2-5秒   | 中等（显存问题） | CUDA Toolkit (3GB) |
| CPU  | 10-30秒 | 很好   | 无 |

## 推荐

1. **如果你经常使用AI功能** → 安装CUDA Toolkit，用GPU加速
2. **如果偶尔使用** → 继续用CPU模式，已经配置好了

## 当前状态

✅ 已配置为CPU模式
✅ 可以立即测试使用
✅ 无需额外安装

## 测试命令

```bash
# 启动Ollama（CPU模式）
restart-ollama.bat

# 等待5秒后测试
curl -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d "{\"model\":\"gemma2:2b\",\"prompt\":\"你好\",\"stream\":false}"
```
