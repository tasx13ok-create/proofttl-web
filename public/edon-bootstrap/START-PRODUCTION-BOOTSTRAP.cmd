@echo off
setlocal
cd /d "%~dp0"
echo Unified Entity v1 production bootstrap
echo.

echo Checking for Edon bootstrap updates...
if exist "%~dp0UPDATE-EDON-V2.ps1" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPDATE-EDON-V2.ps1"
  if errorlevel 1 (
    echo Update check failed; using the last known local bootstrap files.
  )
) else (
  echo Update channel v2 is not installed; using the last known local bootstrap files.
)
echo.

where xz.exe >nul 2>&1
if errorlevel 1 (
  if not exist "%~dp0.tools\xz\xz.exe" (
    echo XZ support is missing on this Windows install.
    echo Installing a local Edon copy automatically...
    echo.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0ENSURE-XZ.ps1"
    if errorlevel 1 (
      echo.
      echo Could not prepare XZ support.
      echo Send ChatGPT the error shown above.
      pause
      exit /b 1
    )
  )
)

if exist "%~dp0.tools\xz\xz.exe" set "PATH=%~dp0.tools\xz;%PATH%"

echo Starting Windows-safe production bootstrap...
echo This window will stay open when it finishes or if anything fails.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0RUN-PRODUCTION-BOOTSTRAP.ps1"
set "EXITCODE=%ERRORLEVEL%"
echo.
if not "%EXITCODE%"=="0" (
  echo ============================================================
  echo BOOTSTRAP FAILED - this is NOT a completed deployment.
  echo Copy the error above or send a screenshot to ChatGPT.
  echo A diagnostic log is also saved under LocalAppData\Edon.
  echo ============================================================
) else (
  echo ============================================================
  echo PRODUCTION BOOTSTRAP COMPLETED SUCCESSFULLY.
  echo Only trust this message if the output above also showed
  echo both a Worker URL and a Web URL.
  echo ============================================================
)
echo.
echo Press any key only when you are ready to close this window.
pause >nul
exit /b %EXITCODE%
