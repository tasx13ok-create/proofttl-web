@echo off
setlocal
chcp 65001 >nul
set "ROOT=%LOCALAPPDATA%\RealityEngine"
set "BRIDGE=%ROOT%\bridge-local.cjs"
set "INDEX=%ROOT%\index.html"
set "SCRIPT=%ROOT%\release.js"
set "STYLE=%ROOT%\release.css"
set "BASE=https://proofttl-web.vercel.app/reality-engine"
set "LOCAL=http://127.0.0.1:4317/"

title Reality Engine Installer
if not exist "%ROOT%" mkdir "%ROOT%"

echo.
echo ============================================================
echo   REALITY ENGINE - LOCAL QWEN RUNTIME RC3
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js 18 or newer is required.
  echo Install Node.js LTS from https://nodejs.org/ then run this launcher again.
  pause
  exit /b 1
)
node -e "if (typeof fetch !== 'function') process.exit(1)" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Your Node.js is too old. Reality Engine needs Node.js 18 or newer.
  echo Install the current Node.js LTS from https://nodejs.org/ and run this launcher again.
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

echo [2/4] Installing the latest local Reality Engine...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -UseBasicParsing '%BASE%/bridge-local.cjs' -OutFile '%BRIDGE%'; Invoke-WebRequest -UseBasicParsing '%BASE%/index.html' -OutFile '%INDEX%'; Invoke-WebRequest -UseBasicParsing '%BASE%/release.js' -OutFile '%SCRIPT%'; Invoke-WebRequest -UseBasicParsing '%BASE%/release.css' -OutFile '%STYLE%'"
if errorlevel 1 (
  echo [ERROR] Could not download the latest Reality Engine files.
  pause
  exit /b 1
)

for /f %%V in ('powershell -NoProfile -Command "try { (Invoke-RestMethod -TimeoutSec 1 'http://127.0.0.1:4317/health').bridge } catch { '' }"') do set "RUNNING_VERSION=%%V"
if defined RUNNING_VERSION (
  if /I "%RUNNING_VERSION%"=="0.3.0-rc3" (
    echo [3/4] Reality Engine RC3 is already running.
    echo [4/4] Opening the local app...
    start "" "%LOCAL%"
    exit /b 0
  ) else (
    echo [ERROR] An older Reality Engine runtime is already using port 4317.
    echo Close the older Reality Engine Local Runtime window, then run this launcher again.
    pause
    exit /b 2
  )
)

echo [3/4] Starting the same-origin local runtime...
start "Reality Engine Local Runtime" cmd /k "set REALITY_ENGINE_ASSET_DIR=%ROOT%&& node "%BRIDGE%""

echo [4/4] Waiting for health check...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; 1..20 | ForEach-Object { try { $h=Invoke-RestMethod -TimeoutSec 1 'http://127.0.0.1:4317/health'; if($h.ok){$ok=$true; break} } catch {}; Start-Sleep -Milliseconds 500 }; if(-not $ok){exit 1}"
if errorlevel 1 (
  echo [ERROR] Local runtime did not become healthy.
  echo Read the separate "Reality Engine Local Runtime" window for the exact error.
  pause
  exit /b 3
)

start "" "%LOCAL%"
echo.
echo Ready. Reality Engine is opening locally at:
echo   %LOCAL%
echo.
echo Keep the "Reality Engine Local Runtime" window open while you use the app.
timeout /t 3 >nul
exit /b 0
