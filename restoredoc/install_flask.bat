@echo off
echo =========================================
echo    Installing Flask and Dependencies
echo =========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Python found:
python --version
echo.

echo =========================================
echo    Installing Required Packages
echo =========================================
echo.

REM Upgrade pip first
echo 1. Upgrading pip...
python -m pip install --upgrade pip

echo.
echo 2. Installing Flask...
python -m pip install flask

echo.
echo 3. Installing Flask-CORS...
python -m pip install flask-cors

echo.
echo 4. Installing python-dotenv...
python -m pip install python-dotenv

echo.
echo 5. Installing OpenAI (optional)...
python -m pip install openai

echo.
echo 6. Installing requests...
python -m pip install requests

echo.
echo =========================================
echo    Verifying Installation
echo =========================================
echo.

python -c "import flask; print('✓ Flask version:', flask.__version__)"
if errorlevel 1 (
    echo ✗ Flask installation failed!
    echo.
    echo Try running manually:
    echo   python -m pip install flask --user
    pause
    exit /b 1
)

python -c "import flask_cors; print('✓ Flask-CORS installed')"
if errorlevel 1 echo ⚠ Flask-CORS not installed

python -c "import dotenv; print('✓ python-dotenv installed')"
if errorlevel 1 echo ⚠ python-dotenv not installed

python -c "import openai; print('✓ OpenAI installed')"
if errorlevel 1 echo ⚠ OpenAI not installed (optional)

echo.
echo =========================================
echo    Installation Complete!
echo =========================================
echo.
echo You can now run the Flask server:
echo   python flask_app.py
echo.
echo Or run diagnostics:
echo   python debug_flask.py
echo.

pause