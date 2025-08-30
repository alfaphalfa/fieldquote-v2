@echo off
echo =========================================
echo    RestoreDoc Flask API Server
echo =========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Python found:
python --version
echo.

REM Install required packages if needed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing Flask...
    pip install flask flask-cors python-dotenv
)

REM Check for .env in parent directory
if not exist "..\\.env" (
    echo.
    echo WARNING: No .env file found in parent directory
    echo The server will run but OpenAI features won't work
    echo.
    echo To fix: Copy ..\.env.example to ..\.env and add your API keys
    echo.
)

REM Run the Flask API
echo Starting Flask API server...
echo.
python flask_app.py

pause