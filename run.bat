@echo off
REM RestoreDoc Flask Server Startup Script (Windows)

echo =========================================
echo    RestoreDoc Flask Server Launcher
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Python found:
python --version
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created.
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install/upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found!
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Failed to install requirements
    echo Try running: pip install -r requirements.txt
    pause
    exit /b 1
)
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file and add your API keys:
    echo   - OPENAI_API_KEY
    echo   - SUPABASE_URL
    echo   - SUPABASE_ANON_KEY
    echo.
)

REM Check for OpenAI API key
findstr /C:"sk-your-openai-api-key-here" .env >nul
if %errorlevel%==0 (
    echo Warning: OpenAI API key not configured!
    echo The app will use mock data for analysis.
    echo.
)

REM Create temp uploads directory if it doesn't exist
if not exist "temp_uploads" mkdir temp_uploads

REM Start the Flask server
echo Starting Flask server...
echo =========================================
echo Server running at: http://localhost:5000
echo Main app: http://localhost:5000/
echo Test page: http://localhost:5000/test
echo Health check: http://localhost:5000/health
echo =========================================
echo Press Ctrl+C to stop the server
echo.

REM Set Flask environment variables
set FLASK_APP=app.py
set FLASK_ENV=development

REM Run Flask app
python app.py