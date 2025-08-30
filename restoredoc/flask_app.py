"""
Flask API Server for RestoreDoc Next.js Application
This serves as a Python backend for AI analysis features
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# Add parent directory to path to access the main Flask app
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

print("=" * 60)
print("RestoreDoc Flask API Server")
print("=" * 60)
print(f"Current directory: {os.getcwd()}")
print(f"Parent directory: {parent_dir}")
print(f"Python version: {sys.version}")
print()

# Check for required modules
try:
    from flask import Flask, request, jsonify, send_from_directory
    print("✓ Flask imported successfully")
except ImportError as e:
    print(f"✗ Flask not installed: {e}")
    print("Install with: pip install flask")
    sys.exit(1)

try:
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
except ImportError as e:
    print(f"✗ Flask-CORS not installed: {e}")
    print("Install with: pip install flask-cors")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    print("✓ python-dotenv imported successfully")
    
    # Try to load .env from parent directory
    parent_env = parent_dir / '.env'
    local_env = Path('.env')
    
    if parent_env.exists():
        load_dotenv(parent_env)
        print(f"✓ Loaded .env from parent: {parent_env}")
    elif local_env.exists():
        load_dotenv(local_env)
        print(f"✓ Loaded .env from local: {local_env}")
    else:
        print("⚠ No .env file found")
except ImportError:
    print("⚠ python-dotenv not installed")

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['DEBUG'] = True

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("\n" + "-" * 40)
print("API Configuration:")
openai_key = os.getenv('OPENAI_API_KEY')
if openai_key:
    print(f"✓ OpenAI API Key found: {openai_key[:7]}...{openai_key[-4:]}")
else:
    print("✗ OpenAI API Key not found")

supabase_url = os.getenv('SUPABASE_URL')
if supabase_url:
    print(f"✓ Supabase URL: {supabase_url}")
else:
    print("✗ Supabase URL not found")
print("-" * 40 + "\n")

# ============== ROUTES ==============

@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        "service": "RestoreDoc Flask API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/": "This help message",
            "/health": "Health check",
            "/api/test": "Test endpoint",
            "/api/analyze": "Damage analysis (POST)",
            "/api/config": "Configuration status"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "directory": os.getcwd(),
        "python_version": sys.version
    })

@app.route('/api/test')
def test_api():
    """Test API endpoint"""
    return jsonify({
        "message": "Flask API is working!",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/config')
def config():
    """Configuration status endpoint"""
    return jsonify({
        "openai_configured": bool(os.getenv('OPENAI_API_KEY')),
        "supabase_configured": bool(os.getenv('SUPABASE_URL')),
        "environment": os.getenv('FLASK_ENV', 'production'),
        "debug": app.debug,
        "working_directory": os.getcwd(),
        "parent_directory": str(parent_dir),
        "env_file_locations_checked": [
            str(parent_dir / '.env'),
            '.env'
        ]
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Damage analysis endpoint (mock for testing)"""
    try:
        data = request.get_json()
        damage_type = data.get('damage_type', 'water')
        
        # Mock response for testing
        mock_response = {
            "success": True,
            "damage_type": damage_type,
            "analysis": {
                "severity": "moderate",
                "affected_area_sqft": 500,
                "estimated_cost": 2500,
                "confidence": 85
            },
            "timestamp": datetime.now().isoformat(),
            "mock": True
        }
        
        return jsonify(mock_response)
    except Exception as e:
        logger.error(f"Error in analyze: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found", "status": 404}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "status": 500}), 500

# ============== MAIN ==============

if __name__ == '__main__':
    import socket
    
    # Get host and port
    host = '0.0.0.0'
    port = int(os.getenv('FLASK_PORT', 5000))
    
    # Check if port is available
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    port_available = sock.connect_ex(('127.0.0.1', port)) != 0
    sock.close()
    
    if not port_available:
        print(f"⚠ Port {port} is in use, trying alternatives...")
        for alt_port in [8001, 8002, 5001, 5002, 3001]:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            if sock.connect_ex(('127.0.0.1', alt_port)) != 0:
                port = alt_port
                print(f"✓ Using port {port}")
                break
            sock.close()
    
    print("\n" + "=" * 60)
    print("Starting Flask API Server")
    print("=" * 60)
    print(f"Access URLs:")
    print(f"  Local: http://localhost:{port}")
    print(f"  API Root: http://localhost:{port}/")
    print(f"  Health: http://localhost:{port}/health")
    print(f"  Config: http://localhost:{port}/api/config")
    print(f"  Test: http://localhost:{port}/api/test")
    print("=" * 60)
    print("Press CTRL+C to stop\n")
    
    try:
        app.run(host=host, port=port, debug=True, use_reloader=False)
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)