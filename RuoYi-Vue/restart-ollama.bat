@echo off
REM Quick Restart Ollama with GPU Optimization

echo ========================================
echo Restarting Ollama Service
echo ========================================
echo.

REM Stop existing Ollama processes
echo [1/3] Stopping existing Ollama processes...
taskkill /F /IM ollama.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Clear GPU memory
echo [2/3] Clearing GPU memory...
timeout /t 1 /nobreak >nul

REM Start with optimized settings
echo [3/3] Starting Ollama with GPU optimization...
echo.
echo GPU Settings:
echo - Layers: 20 (partial offload)
echo - Max VRAM: 4GB
echo - Model: gemma2:2b
echo.

set OLLAMA_NUM_GPU=0
set CUDA_VISIBLE_DEVICES=
set OLLAMA_LLM_LIBRARY=cpu
set OLLAMA_NUM_THREAD=8
set OLLAMA_MAX_LOADED_MODELS=1

start "Ollama Service" ollama serve

echo.
echo [SUCCESS] Ollama service started in background
echo.
echo Next steps:
echo 1. Wait 5 seconds for service to initialize
echo 2. Test: curl http://localhost:11434/api/tags
echo 3. Or run your Spring Boot application
echo.
pause
