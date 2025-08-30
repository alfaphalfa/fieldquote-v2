# RestoreDoc Flask Server Setup Guide

## 🚀 Quick Start

### Windows Users:
```powershell
# Option 1: Using PowerShell
.\run.ps1

# Option 2: Using Command Prompt
run.bat
```

### Mac/Linux Users:
```bash
chmod +x run.sh
./run.sh
```

The server will start at: **http://localhost:5000**

## 📋 Manual Setup

### 1. Install Python (3.8 or higher)
- Windows: Download from [python.org](https://www.python.org/downloads/)
- Mac: `brew install python3`
- Linux: `sudo apt-get install python3 python3-pip`

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
```

### 6. Run the Server
```bash
python app.py
```

## 🔑 API Keys Configuration

### OpenAI API Key (Required for AI Analysis)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-your-key-here`

### Supabase Configuration (Required for Database)
1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a project
3. Get your credentials from Settings → API
4. Add to `.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

## 📁 Project Structure

```
fieldquote-v2/
├── app.py                    # Flask server
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── run.sh                    # Unix/Linux/Mac startup script
├── run.bat                   # Windows batch startup script
├── run.ps1                   # PowerShell startup script
├── index-editable.html       # Main application
├── test-editable-features.html # Test page
├── database-schema.sql       # Supabase database schema
└── temp_uploads/             # Temporary photo storage
```

## 🌐 Available Endpoints

### Web Pages
- **Main App**: http://localhost:5000/
- **Test Page**: http://localhost:5000/test
- **Health Check**: http://localhost:5000/health

### API Endpoints

#### POST /api/analyze-damage
Analyze damage from photos using OpenAI Vision API

**Request:**
```javascript
const formData = new FormData();
formData.append('damage_type', 'water'); // water, fire, or mold
formData.append('photos', photoFile1);
formData.append('photos', photoFile2);

fetch('http://localhost:5000/api/analyze-damage', {
    method: 'POST',
    body: formData
})
```

**Response:**
```json
{
    "success": true,
    "analysis": {
        "damage_type": "water",
        "category": "2",
        "class": "3",
        "affected_area_sqft": 650,
        "severity": "moderate",
        "line_items": [...],
        "total_estimate": 2352.50,
        "confidence_percent": 85
    }
}
```

#### POST /api/mock-analyze
Test endpoint that returns mock data without calling OpenAI

**Request:**
```javascript
const formData = new FormData();
formData.append('damage_type', 'water');

fetch('http://localhost:5000/api/mock-analyze', {
    method: 'POST',
    body: formData
})
```

## 🧪 Testing

### 1. Test Health Check
```bash
curl http://localhost:5000/health
```

### 2. Test Mock Analysis
```bash
curl -X POST http://localhost:5000/api/mock-analyze \
  -F "damage_type=water"
```

### 3. Test with Real Photos
```bash
curl -X POST http://localhost:5000/api/analyze-damage \
  -F "damage_type=water" \
  -F "photos=@path/to/photo.jpg"
```

## 🔧 Troubleshooting

### Issue: "ModuleNotFoundError"
**Solution**: Install missing module
```bash
pip install [module-name]
```

### Issue: "OpenAI API key not configured"
**Solution**: Add your API key to `.env` file
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Issue: Port 5000 already in use
**Solution**: Change port in `.env` file
```
FLASK_PORT=5001
```

### Issue: CORS errors in browser
**Solution**: CORS is enabled by default. Check browser console for specific errors.

### Issue: File upload fails
**Solution**: Check file size (max 20MB) and format (jpg, png, webp)

## 🚀 Production Deployment

### Using Gunicorn (Recommended)
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production
```bash
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=generate-a-secure-random-key
```

## 📊 API Rate Limits

### OpenAI GPT-4 Vision
- Default: 500 requests per minute
- Cost: ~$0.01-0.03 per image analysis
- Monitor usage at: https://platform.openai.com/usage

### Recommendations
- Implement caching for repeated analyses
- Use mock endpoint for development/testing
- Consider batch processing for multiple photos

## 🔒 Security Best Practices

1. **Never commit `.env` file to git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific configurations**
   - Development: `.env.development`
   - Production: `.env.production`

3. **Validate file uploads**
   - Max size: 20MB
   - Allowed types: jpg, png, webp
   - Scan for malicious content

4. **Enable HTTPS in production**
   - Use SSL certificates
   - Redirect HTTP to HTTPS

5. **Implement rate limiting**
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app, key_func=get_remote_address)
   ```

## 📈 Monitoring

### Logging
Logs are written to console and optionally to file:
```python
# Configure in .env
LOG_LEVEL=INFO
LOG_FILE=restoredoc.log
```

### Health Checks
Monitor server health:
```bash
curl http://localhost:5000/health
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- New Relic for performance monitoring
- CloudWatch for AWS deployments

## 🤝 Support

### Common Issues
- Check [Troubleshooting](#-troubleshooting) section
- Review logs for detailed error messages
- Ensure all dependencies are installed

### Getting Help
- OpenAI API Docs: https://platform.openai.com/docs
- Flask Docs: https://flask.palletsprojects.com/
- Supabase Docs: https://supabase.com/docs

## 📝 License

This project is proprietary software for Major Restoration Services.

---

**Made with ❤️ for Major Restoration Services**