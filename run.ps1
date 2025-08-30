# RestoreDoc Flask Server Startup Script (PowerShell)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   RestoreDoc Flask Server Launcher" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created." -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install/upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "Please edit .env file and add your API keys:" -ForegroundColor Yellow
    Write-Host "  - OPENAI_API_KEY" -ForegroundColor White
    Write-Host "  - SUPABASE_URL" -ForegroundColor White
    Write-Host "  - SUPABASE_ANON_KEY" -ForegroundColor White
    Write-Host ""
}

# Check for OpenAI API key
$envContent = Get-Content ".env"
if ($envContent -match "sk-your-openai-api-key-here") {
    Write-Host "Warning: OpenAI API key not configured!" -ForegroundColor Red
    Write-Host "The app will use mock data for analysis." -ForegroundColor Yellow
    Write-Host ""
}

# Create temp uploads directory if it doesn't exist
if (-not (Test-Path "temp_uploads")) {
    New-Item -ItemType Directory -Path "temp_uploads" | Out-Null
}

# Start the Flask server
Write-Host "Starting Flask server..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Server running at: " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host "Main app: " -NoNewline
Write-Host "http://localhost:5000/" -ForegroundColor Green
Write-Host "Test page: " -NoNewline
Write-Host "http://localhost:5000/test" -ForegroundColor Green
Write-Host "Health check: " -NoNewline
Write-Host "http://localhost:5000/health" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Set Flask environment variables
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"

# Run Flask app
python app.py