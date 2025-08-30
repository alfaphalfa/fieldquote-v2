@echo off
REM Quick Flask Server Starter with Diagnostics

echo =========================================
echo    RestoreDoc Flask Server
echo    Quick Start with Diagnostics
echo =========================================
echo.

REM First run diagnostics
echo Running diagnostics...
echo.
python debug.py
if errorlevel 1 (
    echo.
    echo Diagnostics failed. Please fix issues above.
    pause
    exit /b 1
)

echo.
echo =========================================
echo    Starting Flask Server
echo =========================================
echo.

REM Now start the server
call run.bat