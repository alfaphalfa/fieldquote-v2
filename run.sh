#!/bin/bash

# RestoreDoc Flask Server Startup Script (Unix/Linux/Mac)

echo "========================================="
echo "   RestoreDoc Flask Server Launcher"
echo "========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created."
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "Please edit .env file and add your API keys:"
    echo "  - OPENAI_API_KEY"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo ""
fi

# Check for OpenAI API key
if grep -q "sk-your-openai-api-key-here" .env; then
    echo "⚠️  Warning: OpenAI API key not configured!"
    echo "The app will use mock data for analysis."
    echo ""
fi

# Create temp uploads directory if it doesn't exist
mkdir -p temp_uploads

# Start the Flask server
echo "Starting Flask server..."
echo "========================================="
echo "Server running at: http://localhost:5000"
echo "Main app: http://localhost:5000/"
echo "Test page: http://localhost:5000/test"
echo "Health check: http://localhost:5000/health"
echo "========================================="
echo "Press Ctrl+C to stop the server"
echo ""

# Run Flask app
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py