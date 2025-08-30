# Flask Server Troubleshooting Guide

## 🔧 Quick Diagnostics

Run the diagnostic script to check your setup:
```bash
python debug.py
```

This will check:
- Python installation
- Required packages
- Environment variables
- Port availability
- Network connectivity

## 🚨 Common Issues and Solutions

### Issue: "Flask server isn't connecting"

**Solution 1: Check if server is running**
```bash
# Test the server
python test_server.py

# If not running, start it:
run.bat  # Windows
./run.sh  # Mac/Linux
```

**Solution 2: Check port availability**
```bash
# Windows - Check what's using port 5000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

**Solution 3: Try a different port**
Edit `.env` file:
```
FLASK_PORT=8000
```

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Make sure you're in virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install requirements
pip install -r requirements.txt
```

### Issue: "No .env file found"

**Solution:**
```bash
# Create from template
copy .env.example .env  # Windows
cp .env.example .env  # Mac/Linux

# Edit .env and add your keys
notepad .env  # Windows
nano .env  # Mac/Linux
```

### Issue: "OpenAI API key not configured"

**Solution:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Issue: "Port 5000 already in use"

**Solution 1: Kill the process**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Solution 2: Use different port**
The server will automatically try ports: 8000, 8080, 8888, 5001, 5555, 3000

### Issue: "Connection refused" or "ERR_CONNECTION_REFUSED"

**Solutions:**
1. Check Windows Firewall - allow Python through firewall
2. Check antivirus software - may be blocking connections
3. Try accessing via `127.0.0.1` instead of `localhost`
4. Ensure server is actually running (check console output)

### Issue: "CORS error in browser"

**Solution:**
CORS is already enabled in app.py. If still getting errors:
1. Clear browser cache
2. Try incognito/private mode
3. Check browser console for specific error

### Issue: "File not found - index-editable.html"

**Solution:**
Ensure you're running from the correct directory:
```bash
cd C:\Users\kevin\fieldquote-v2
dir *.html  # Should show HTML files
python app.py
```

## 📊 Testing Endpoints

### Manual Testing with curl

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test connection details
curl http://localhost:5000/test-connection

# Test mock analysis
curl -X POST http://localhost:5000/api/mock-analyze -d "damage_type=water"
```

### Browser Testing

Open in browser:
- http://localhost:5000/ - Main app
- http://localhost:5000/test - Test page
- http://localhost:5000/test-connection - Connection info (JSON)
- http://localhost:5000/health - Health check (JSON)

## 🔍 Debug Mode

### Enable Maximum Debugging

1. Edit `.env`:
```
FLASK_ENV=development
FLASK_DEBUG=true
LOG_LEVEL=DEBUG
```

2. Run with verbose output:
```bash
python app.py
```

### Check Console Output

Look for these startup messages:
```
✓ Flask imported successfully
✓ Flask-CORS imported successfully
✓ Loaded .env file from: C:\Users\kevin\fieldquote-v2\.env
✓ OpenAI API Key found: sk-proj...xxxx
✓ Port 5000 is available
```

## 🛠️ Advanced Troubleshooting

### 1. Complete Reset
```bash
# Remove virtual environment
rmdir /s venv  # Windows
rm -rf venv  # Mac/Linux

# Recreate and install
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate
pip install -r requirements.txt
```

### 2. Test Individual Components
```python
# Test Flask import
python -c "import flask; print('Flask OK')"

# Test OpenAI import
python -c "import openai; print('OpenAI OK')"

# Test .env loading
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(f'API Key: {bool(os.getenv(\"OPENAI_API_KEY\"))}')"
```

### 3. Network Diagnostics
```bash
# Check network interfaces
ipconfig /all  # Windows
ifconfig  # Mac/Linux

# Test localhost
ping 127.0.0.1

# Check DNS
nslookup localhost
```

### 4. Python Path Issues
```python
# Check Python path
python -c "import sys; print('\n'.join(sys.path))"

# Add current directory to path
set PYTHONPATH=%cd%  # Windows
export PYTHONPATH=$PWD  # Mac/Linux
```

## 💡 Quick Fixes

### Windows Quick Fix
```batch
@echo off
REM Quick fix script for Windows
pip uninstall flask flask-cors -y
pip install flask flask-cors
copy .env.example .env
python debug.py
pause
```

### Mac/Linux Quick Fix
```bash
#!/bin/bash
# Quick fix script for Unix
pip uninstall flask flask-cors -y
pip install flask flask-cors
cp .env.example .env
python debug.py
```

## 📞 Getting Help

If none of the above solutions work:

1. **Run full diagnostics:**
   ```bash
   python debug.py > diagnostics.txt
   ```

2. **Check the log output** for specific error messages

3. **Common error codes:**
   - `[Errno 10048]` - Port already in use (Windows)
   - `[Errno 48]` - Port already in use (Mac)
   - `[Errno 98]` - Port already in use (Linux)
   - `[Errno 10061]` - Connection refused (Windows)
   - `[Errno 111]` - Connection refused (Linux)

4. **Environment details to provide:**
   - Operating System version
   - Python version (`python --version`)
   - Error messages from console
   - Output from `python debug.py`

## ✅ When Everything Works

You should see:
```
============================================================
STARTING FLASK SERVER
============================================================
✓ Port 5000 is available

Server Configuration:
  Host: 0.0.0.0
  Port: 5000
  Debug: True

Access URLs:
  Local: http://localhost:5000
  Network: http://192.168.x.x:5000
  Test Connection: http://localhost:5000/test-connection
  Health Check: http://localhost:5000/health

============================================================
Press CTRL+C to stop the server
============================================================

 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

Then navigate to http://localhost:5000 in your browser!