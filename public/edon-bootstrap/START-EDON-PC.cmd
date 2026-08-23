@echo off
setlocal
cd /d "%~dp0"
echo Starting Edon PC control...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START-EDON-PC.ps1"
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" echo Edon PC control stopped with exit code %CODE%.
echo Press any key to close.
pause >nul
exit /b %CODE%
