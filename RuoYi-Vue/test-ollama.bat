@echo off
chcp 65001 >nul
echo Testing Ollama AI Generation...
echo.

curl -X POST http://localhost:11434/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"gemma2:2b\",\"prompt\":\"你好，请用一句话介绍你自己\",\"stream\":false}"

echo.
echo.
echo Test completed!
pause
