#!/bin/bash
# Ollama 启动脚本（macOS/Linux）

echo "========================================"
echo "Ollama AI 服务启动脚本"
echo "========================================"
echo ""

# 检查 Ollama 是否已安装
if ! command -v ollama &> /dev/null; then
    echo "[错误] 未找到 Ollama，请先安装 Ollama"
    echo "下载地址: https://ollama.ai"
    exit 1
fi

echo "[信息] 检查 Ollama 服务状态..."
sleep 2

# 启动 Ollama 服务
echo "[信息] 启动 Ollama 服务..."
ollama serve

# 如果服务启动失败
if [ $? -ne 0 ]; then
    echo "[错误] Ollama 服务启动失败"
    exit 1
fi
