@echo off
REM Start Ollama AI Service (Windows)

echo ========================================
echo Ollama AI Service Startup Script
echo ========================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama not found. Please install Ollama first.
    echo Download: https://ollama.ai
    pause
    exit /b 1
)

echo [INFO] Checking Ollama service status...
timeout /t 2 /nobreak

REM Force CPU mode to avoid CUDA memory allocation issues
echo [INFO] Using CPU mode (stable, no GPU memory issues)...
set OLLAMA_NUM_GPU=0
set CUDA_VISIBLE_DEVICES=
set OLLAMA_LLM_LIBRARY=cpu

REM Performance optimization for CPU
set OLLAMA_NUM_THREAD=8
set OLLAMA_MAX_LOADED_MODELS=1

REM Start Ollama service
echo [INFO] Starting Ollama service (CPU mode)...
echo [INFO] Note: CPU mode is slower but very stable
echo [INFO] gemma2:2b model should respond in 10-30 seconds
ollama serve

REM If service startup fails
if %errorlevel% neq 0 (
    echo [ERROR] Ollama service startup failed
    pause
    exit /b 1
)

pause
