# RestoreDoc Server Setup Guide

## 📁 Project Structure

You have **TWO** directories with different purposes:

### 1. Main Directory: `C:\Users\kevin\fieldquote-v2\`
- **Purpose**: Standalone Flask server for HTML-based app
- **Key Files**:
  - `app.py` - Main Flask server
  - `index-editable.html` - Main application
  - `requirements.txt` - Python dependencies
  - `.env` - Configuration (create from .env.example)

### 2. Next.js Directory: `C:\Users\kevin\fieldquote-v2\restoredoc\`
- **Purpose**: Next.js application with React components
- **Key Files**:
  - `flask_app.py` - Flask API server for Next.js
  - `server.py` - Simple HTTP server
  - Next.js app files (app/, components/, etc.)

## 🚀 Quick Start Options

### Option 1: Run Main Flask Server (Recommended)
```cmd
cd C:\Users\kevin\fieldquote-v2
run.bat
```
- Serves at: http://localhost:5000
- Full OpenAI integration
- Serves HTML files directly

### Option 2: Run Flask API in RestoreDoc
```cmd
cd C:\Users\kevin\fieldquote-v2\restoredoc
python flask_app.py
```
- Serves at: http://localhost:5000 (or 8001 if busy)
- API endpoints for Next.js app
- Lighter weight API server

### Option 3: Run Simple HTTP Server
```cmd
cd C:\Users\kevin\fieldquote-v2\restoredoc
python server.py
```
- Serves at: http://localhost:8000
- Basic file server with CORS
- No API functionality

### Option 4: Run Next.js Development Server
```cmd
cd C:\Users\kevin\fieldquote-v2\restoredoc
npm run dev
```
- Serves at: http://localhost:3000
- Full Next.js application
- Requires Node.js

## 🔍 Diagnostics

### Check Main Flask Setup
```cmd
cd C:\Users\kevin\fieldquote-v2
python debug.py
```

### Check RestoreDoc Flask Setup
```cmd
cd C:\Users\kevin\fieldquote-v2\restoredoc
python debug_flask.py
```

## 🧪 Test Server Connection

### Test Main Flask Server
```cmd
cd C:\Users\kevin\fieldquote-v2
python test_server.py
```

### Test with curl
```cmd
# Main Flask server
curl http://localhost:5000/health
curl http://localhost:5000/test-connection

# RestoreDoc Flask API
curl http://localhost:5000/api/test
curl http://localhost:5000/api/config
```

## 📋 Setup Checklist

### For Main Flask Server:
- [ ] Navigate to: `C:\Users\kevin\fieldquote-v2`
- [ ] Create .env file: `copy .env.example .env`
- [ ] Add OpenAI API key to .env
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run: `run.bat` or `python app.py`

### For RestoreDoc Flask API:
- [ ] Navigate to: `C:\Users\kevin\fieldquote-v2\restoredoc`
- [ ] Ensure parent .env exists
- [ ] Install Flask: `pip install flask flask-cors python-dotenv`
- [ ] Run: `python flask_app.py`

## 🔧 Common Issues

### "Cannot find app.py"
You're in the wrong directory. The main Flask app is in the parent directory:
```cmd
cd C:\Users\kevin\fieldquote-v2
dir app.py
```

### "Cannot find debug.py"
Same issue - navigate to parent:
```cmd
cd C:\Users\kevin\fieldquote-v2
python debug.py
```

### "Port already in use"
The servers will auto-detect and use alternative ports:
- Main Flask: 5000, 8000, 8080, 8888, 5001
- RestoreDoc API: 5000, 8001, 8002, 5001
- Simple server: 8000 (fixed)

### "ModuleNotFoundError: flask"
Install required packages:
```cmd
pip install flask flask-cors python-dotenv openai
```

## 📝 File Locations Summary

```
C:\Users\kevin\fieldquote-v2\
│
├── app.py                 ← Main Flask server
├── debug.py               ← Diagnostics script
├── test_server.py         ← Server tester
├── requirements.txt       ← Python dependencies
├── .env                   ← Configuration (create this)
├── .env.example           ← Template
├── index-editable.html    ← Main HTML app
├── run.bat                ← Windows starter
│
└── restoredoc\
    ├── flask_app.py       ← Flask API for Next.js
    ├── debug_flask.py     ← API diagnostics
    ├── server.py          ← Simple HTTP server
    ├── run_flask.bat      ← API starter
    └── [Next.js files]    ← React application

```

## ✅ Verification Steps

1. **Check you're in the right directory:**
   ```cmd
   echo %cd%
   ```

2. **Verify files exist:**
   ```cmd
   dir *.py
   dir *.html
   ```

3. **Run diagnostics:**
   ```cmd
   python debug.py        # If in main directory
   python debug_flask.py  # If in restoredoc
   ```

4. **Start appropriate server:**
   - For HTML app: Use main Flask server
   - For Next.js: Use RestoreDoc Flask API
   - For testing: Use simple HTTP server

## 💡 Pro Tips

1. **Always check your current directory first**
2. **The main Flask app is in the PARENT directory, not restoredoc**
3. **Use `debug.py` to diagnose issues automatically**
4. **The servers will find available ports automatically**
5. **Create .env from .env.example before running**

## 🆘 Still Having Issues?

Run this diagnostic command and share the output:
```cmd
cd C:\Users\kevin\fieldquote-v2
python debug.py > diagnostic_output.txt
type diagnostic_output.txt
```