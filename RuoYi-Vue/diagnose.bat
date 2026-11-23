@echo off
REM AI 助手诊断脚本（Windows）

echo ========================================
echo AI 助手诊断工具
echo ========================================
echo.

echo [1/4] 检查 Ollama 安装...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Ollama 已安装
    for /f "tokens=*" %%i in ('ollama --version') do echo    版本: %%i
) else (
    echo [✗] Ollama 未安装
    echo    请访问 https://ollama.ai 下载安装
)

echo.
echo [2/4] 检查 Ollama 服务...
timeout /t 1 /nobreak >nul
curl -s http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Ollama 服务运行中
    echo    地址: http://localhost:11434
) else (
    echo [✗] Ollama 服务未运行
    echo    请运行: start-ollama.bat
)

echo.
echo [3/4] 检查已安装的模型...
if %errorlevel% equ 0 (
    echo [✓] 获取模型列表...
    ollama list
) else (
    echo [✗] 无法获取模型列表
)

echo.
echo [4/4] 检查应用服务...
timeout /t 1 /nobreak >nul
curl -s http://localhost:8080/system/assistant/health >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] 应用服务运行中
    echo    地址: http://localhost:8080
) else (
    echo [✗] 应用服务未运行
    echo    请启动 Spring Boot 应用
)

echo.
echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 如有问题，请查看 AI_ASSISTANT_SETUP.md 文档
echo.

pause
