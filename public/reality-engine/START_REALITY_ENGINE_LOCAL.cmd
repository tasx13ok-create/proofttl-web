@echo off
setlocal
chcp 65001 >nul
set "ROOT=%LOCALAPPDATA%\RealityEngine"
set "BRIDGE=%ROOT%\bridge.cjs"
set "SOURCE=https://proofttl-web.vercel.app/reality-engine/bridge.cjs"
set "SITE=https://proofttl-web.vercel.app/reality-engine/"

title Reality Engine Local Runtime
if not exist "%ROOT%" mkdir "%ROOT%"

echo.
echo ============================================================
echo   REALITY ENGINE - LOCAL QWEN RUNTIME
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is required for the secure local bridge.
  echo Install Node.js LTS from https://nodejs.org/ then run this launcher again.
  pause
  exit /b 1
)

where ollama >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Ollama was not found.
  echo Install Ollama from https://ollama.com/download/windows then run this launcher again.
  pause
  exit /b 1
)

echo [1/4] Checking Qwen3 4B...
ollama list | findstr /I /C:"qwen3:4b" >nul
if errorlevel 1 (
  echo Qwen3 4B is missing. Downloading it now...
  ollama pull qwen3:4b
  if errorlevel 1 (
    echo [ERROR] Could not download qwen3:4b.
    pause
    exit /b 1
  )
) else (
  echo Qwen3 4B found.
)

echo [2/4] Updating Reality Engine bridge...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing '%SOURCE%' -OutFile '%BRIDGE%'; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 (
  echo [ERROR] Could not download the latest bridge from Reality Engine.
  pause
  exit /b 1
)

echo [3/4] Starting local runtime...
start "" "%SITE%"
echo [4/4] Ready. Keep this window open.
echo.
node "%BRIDGE%"

echo.
echo Local runtime stopped.
pause
