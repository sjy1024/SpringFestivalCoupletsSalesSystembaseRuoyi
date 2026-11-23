@echo off
REM Force CPU Mode for Ollama (Reliable Version)

echo ========================================
echo Ollama CPU Mode Startup
echo ========================================
echo.

REM Kill any existing Ollama processes
echo [1/4] Stopping existing Ollama processes...
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM ollama_llama_server.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Set environment variables BEFORE starting
echo [2/4] Configuring CPU mode environment...
set OLLAMA_NUM_GPU=0
set OLLAMA_LLM_LIBRARY=cpu
set CUDA_VISIBLE_DEVICES=
set OLLAMA_NUM_THREAD=8
set OLLAMA_MAX_LOADED_MODELS=1

REM Display configuration
echo.
echo Configuration:
echo - GPU Layers: 0 (CPU only)
echo - CPU Threads: 8
echo - Model: gemma2:2b
echo.

REM Start Ollama in background
echo [3/4] Starting Ollama service...
start "Ollama CPU Service" /MIN cmd /c "set OLLAMA_NUM_GPU=0 && set OLLAMA_LLM_LIBRARY=cpu && set CUDA_VISIBLE_DEVICES= && ollama serve"

REM Wait for service to start (CPU 冷启动常需 15~45 秒，原脚本只等 5 秒易误报 WARNING)
echo [4/4] Waiting for Ollama to accept connections...
for /L %%i in (1,1,15) do (
  curl -s -f http://127.0.0.1:11434/api/tags >nul 2>&1
  if not errorlevel 1 goto :ollama_ready
  echo   ... attempt %%i/15, waiting 3s
  timeout /t 3 /nobreak >nul
)

echo.
echo [FAIL] Ollama did not respond on http://127.0.0.1:11434/api/tags
echo.
echo Try in a new CMD window:
echo   ollama serve
echo   ollama pull gemma2:2b
echo   curl http://127.0.0.1:11434/api/tags
echo.
echo If the window titled "Ollama CPU Service" closed immediately, run ollama serve in foreground to see errors.
echo If Java still cannot connect: edit ruoyi.ollama.base-url in ruoyi-admin application.yml
echo.
goto :ollama_done

:ollama_ready
echo.
echo ========================================
echo [SUCCESS] Ollama is running in CPU mode
echo ========================================
echo.
echo Service URL: http://127.0.0.1:11434
echo Model: gemma2:2b  (run: ollama pull gemma2:2b  if not installed^)
echo Mode: CPU (first chat may take 10-60s^)
echo.
echo You can now start your Spring Boot application!
echo.

:ollama_done

pause
