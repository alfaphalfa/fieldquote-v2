@echo off
echo Installing Flask and dependencies...
python -m pip install flask flask-cors python-dotenv requests --user
echo.
echo Testing Flask...
python -c "import flask; print('Flask', flask.__version__, 'installed successfully!')"
pause