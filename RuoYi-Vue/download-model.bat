@echo off
REM 模型下载脚本（Windows）

echo ========================================
echo Ollama 模型下载脚本
echo ========================================
echo.

REM 检查 Ollama 是否已安装
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Ollama，请先安装 Ollama
    echo 下载地址: https://ollama.ai
    pause
    exit /b 1
)

echo [信息] 可用的模型：
echo 1. gemma:2b     (轻量级，~1.5GB)
echo 2. gemma3:4b    (推荐，~2.5GB)
echo 3. qwen2.5:4b   (替代方案，~2.5GB)
echo 4. qwen2.5:7b   (高质量，~4.5GB)
echo 5. mistral:7b   (高质量，~4GB)
echo.

set /p choice="请选择要下载的模型 (1-5): "

if "%choice%"=="1" (
    set model=gemma:2b
) else if "%choice%"=="2" (
    set model=gemma3:4b
) else if "%choice%"=="3" (
    set model=qwen2.5:4b
) else if "%choice%"=="4" (
    set model=qwen2.5:7b
) else if "%choice%"=="5" (
    set model=mistral:7b
) else (
    echo [错误] 无效的选择
    pause
    exit /b 1
)

echo.
echo [信息] 开始下载模型: %model%
echo [提示] 这可能需要几分钟，请耐心等待...
echo.

ollama pull %model%

if %errorlevel% equ 0 (
    echo.
    echo [成功] 模型下载完成！
    echo [提示] 现在可以启动 Ollama 服务了
    echo 运行: start-ollama.bat
) else (
    echo.
    echo [错误] 模型下载失败
)

pause
