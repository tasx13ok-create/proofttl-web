@echo off
setlocal
cd /d "%~dp0"
echo Starting Edon Night Owl camera bridge...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START-NIGHTOWL-BRIDGE.ps1"
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" echo Night Owl bridge stopped with exit code %CODE%.
echo Press any key to close.
pause >nul
exit /b %CODE%
