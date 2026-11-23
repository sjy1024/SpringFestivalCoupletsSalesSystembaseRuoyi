@echo off
REM Ollama Low Memory Mode (for systems with limited RAM)

echo ========================================
echo Ollama Low Memory Mode
echo ========================================
echo.

REM Kill existing processes
echo [1/4] Stopping existing Ollama...
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM ollama_llama_server.exe >nul 2>&1
timeout /t 3 /nobreak >nul

REM Low memory configuration
echo [2/4] Configuring low memory mode...
set OLLAMA_NUM_GPU=0
set OLLAMA_LLM_LIBRARY=cpu
set CUDA_VISIBLE_DEVICES=
set OLLAMA_NUM_THREAD=4
set OLLAMA_MAX_LOADED_MODELS=1
set OLLAMA_KEEP_ALIVE=1m
set OLLAMA_NUM_PARALLEL=1

REM Critical: Reduce context size to save memory
set OLLAMA_NUM_CTX=2048

echo.
echo Configuration:
echo - Mode: CPU only
echo - Context Size: 2048 (reduced from 4096 to save ~200MB RAM)
echo - Threads: 4
echo - Keep Alive: 1 minute (auto-unload to free memory)
echo.
echo Memory Requirements:
echo - Model: ~1.5GB
echo - KV Cache: ~200MB (reduced)
echo - Total: ~1.7GB
echo.

REM Start service
echo [3/4] Starting Ollama...
start "Ollama Low Memory" /MIN cmd /c "set OLLAMA_NUM_GPU=0 && set OLLAMA_LLM_LIBRARY=cpu && set CUDA_VISIBLE_DEVICES= && set OLLAMA_NUM_CTX=2048 && set OLLAMA_NUM_THREAD=4 && set OLLAMA_KEEP_ALIVE=1m && ollama serve"

REM Wait and test
echo [4/4] Waiting for initialization...
timeout /t 8 /nobreak >nul

echo.
echo Testing service...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Ollama running in low memory mode
    echo ========================================
    echo.
    echo IMPORTANT NOTES:
    echo 1. Context size reduced to 2048 tokens (shorter conversations)
    echo 2. Model auto-unloads after 1 minute of inactivity
    echo 3. Close other programs to free more RAM
    echo 4. Response time: 15-40 seconds
    echo.
    echo Recommendation: Close Chrome/Edge/other heavy apps
    echo.
) else (
    echo.
    echo [INFO] Service starting, wait 10 more seconds...
    echo.
)

pause
