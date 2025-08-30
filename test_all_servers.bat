@echo off
echo =========================================
echo    Testing All Server Options
echo =========================================
echo.

echo Current Directory: %cd%
echo.

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not installed!
    pause
    exit /b 1
)
echo.

echo =========================================
echo    Available Server Options
echo =========================================
echo.

echo 1. Main Flask Server
if exist "app.py" (
    echo    Status: FOUND - app.py exists
    echo    Location: %cd%\app.py
    echo    Run with: python app.py or run.bat
) else (
    echo    Status: NOT FOUND in current directory
)
echo.

echo 2. RestoreDoc Flask API
if exist "restoredoc\flask_app.py" (
    echo    Status: FOUND - restoredoc\flask_app.py exists
    echo    Run with: cd restoredoc ^& python flask_app.py
) else (
    echo    Status: NOT FOUND
)
echo.

echo 3. Simple HTTP Server
if exist "restoredoc\server.py" (
    echo    Status: FOUND - restoredoc\server.py exists
    echo    Run with: cd restoredoc ^& python server.py
) else (
    echo    Status: NOT FOUND
)
echo.

echo 4. Debug Script
if exist "debug.py" (
    echo    Status: FOUND - debug.py exists
    echo    Run with: python debug.py
) else (
    echo    Status: NOT FOUND
)
echo.

echo =========================================
echo    Choose Server to Start
echo =========================================
echo.
echo 1. Main Flask Server (app.py)
echo 2. RestoreDoc Flask API (restoredoc\flask_app.py)
echo 3. Simple HTTP Server (restoredoc\server.py)
echo 4. Run Diagnostics (debug.py)
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting Main Flask Server...
    if exist "app.py" (
        python app.py
    ) else (
        echo ERROR: app.py not found in current directory!
        echo Make sure you're in C:\Users\kevin\fieldquote-v2
    )
) else if "%choice%"=="2" (
    echo.
    echo Starting RestoreDoc Flask API...
    if exist "restoredoc\flask_app.py" (
        cd restoredoc
        python flask_app.py
    ) else (
        echo ERROR: restoredoc\flask_app.py not found!
    )
) else if "%choice%"=="3" (
    echo.
    echo Starting Simple HTTP Server...
    if exist "restoredoc\server.py" (
        cd restoredoc
        python server.py
    ) else (
        echo ERROR: restoredoc\server.py not found!
    )
) else if "%choice%"=="4" (
    echo.
    echo Running Diagnostics...
    if exist "debug.py" (
        python debug.py
    ) else if exist "restoredoc\debug_flask.py" (
        cd restoredoc
        python debug_flask.py
    ) else (
        echo ERROR: No debug script found!
    )
) else if "%choice%"=="5" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice!
)

echo.
pause