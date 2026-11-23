#!/bin/bash
# 模型下载脚本（macOS/Linux）

echo "========================================"
echo "Ollama 模型下载脚本"
echo "========================================"
echo ""

# 检查 Ollama 是否已安装
if ! command -v ollama &> /dev/null; then
    echo "[错误] 未找到 Ollama，请先安装 Ollama"
    echo "下载地址: https://ollama.ai"
    exit 1
fi

echo "[信息] 可用的模型："
echo "1. gemma:2b     (轻量级，~1.5GB)"
echo "2. gemma3:4b    (推荐，~2.5GB)"
echo "3. qwen2.5:4b   (替代方案，~2.5GB)"
echo "4. qwen2.5:7b   (高质量，~4.5GB)"
echo "5. mistral:7b   (高质量，~4GB)"
echo ""

read -p "请选择要下载的模型 (1-5): " choice

case $choice in
    1)
        model="gemma:2b"
        ;;
    2)
        model="gemma3:4b"
        ;;
    3)
        model="qwen2.5:4b"
        ;;
    4)
        model="qwen2.5:7b"
        ;;
    5)
        model="mistral:7b"
        ;;
    *)
        echo "[错误] 无效的选择"
        exit 1
        ;;
esac

echo ""
echo "[信息] 开始下载模型: $model"
echo "[提示] 这可能需要几分钟，请耐心等待..."
echo ""

ollama pull $model

if [ $? -eq 0 ]; then
    echo ""
    echo "[成功] 模型下载完成！"
    echo "[提示] 现在可以启动 Ollama 服务了"
    echo "运行: ./start-ollama.sh"
else
    echo ""
    echo "[错误] 模型下载失败"
    exit 1
fi
