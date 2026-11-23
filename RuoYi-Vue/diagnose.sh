#!/bin/bash
# AI 助手诊断脚本（macOS/Linux）

echo "========================================"
echo "AI 助手诊断工具"
echo "========================================"
echo ""

echo "[1/4] 检查 Ollama 安装..."
if command -v ollama &> /dev/null; then
    echo "[✓] Ollama 已安装"
    echo "    版本: $(ollama --version)"
else
    echo "[✗] Ollama 未安装"
    echo "    请访问 https://ollama.ai 下载安装"
fi

echo ""
echo "[2/4] 检查 Ollama 服务..."
sleep 1
if curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "[✓] Ollama 服务运行中"
    echo "    地址: http://localhost:11434"
else
    echo "[✗] Ollama 服务未运行"
    echo "    请运行: ./start-ollama.sh"
fi

echo ""
echo "[3/4] 检查已安装的模型..."
if command -v ollama &> /dev/null; then
    echo "[✓] 获取模型列表..."
    ollama list
else
    echo "[✗] 无法获取模型列表"
fi

echo ""
echo "[4/4] 检查应用服务..."
sleep 1
if curl -s http://localhost:8080/system/assistant/health &> /dev/null; then
    echo "[✓] 应用服务运行中"
    echo "    地址: http://localhost:8080"
else
    echo "[✗] 应用服务未运行"
    echo "    请启动 Spring Boot 应用"
fi

echo ""
echo "========================================"
echo "诊断完成"
echo "========================================"
echo ""
echo "如有问题，请查看 AI_ASSISTANT_SETUP.md 文档"
echo ""
