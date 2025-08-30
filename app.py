"""
Flask server for RestoreDoc - AI-Powered Restoration Estimation Platform
"""

import os
import sys
import json
import base64
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')
app.config['DEBUG'] = os.getenv('FLASK_ENV', 'production') == 'development'

# Configure CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB max file size
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Try to import optional dependencies
try:
    import openai
    openai.api_key = os.getenv('OPENAI_API_KEY')
    HAS_OPENAI = bool(os.getenv('OPENAI_API_KEY'))
except ImportError:
    HAS_OPENAI = False
    logger.warning("OpenAI not available")

try:
    from pdf_generator import PDFGenerator
    HAS_PDF = True
except ImportError:
    HAS_PDF = False
    logger.warning("PDF generation not available")

# Create required directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('generated_pdfs', exist_ok=True)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main index file"""
    try:
        return send_from_directory('.', 'index-editable.html')
    except:
        return jsonify({"status": "ok", "message": "RestoreDoc API"}), 200

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'environment': {
            'openai_configured': HAS_OPENAI,
            'pdf_configured': HAS_PDF
        }
    })

@app.route('/test-connection')
def test_connection():
    """Test connection endpoint"""
    return jsonify({
        "status": "connected",
        "timestamp": datetime.now().isoformat(),
        "configuration": {
            "openai_configured": HAS_OPENAI,
            "pdf_configured": HAS_PDF,
            "debug_mode": app.debug
        }
    })

@app.route('/api/mock-analyze', methods=['POST'])
def mock_analyze():
    """Mock analysis endpoint for testing"""
    damage_type = request.form.get('damage_type', 'water')
    
    return jsonify({
        'success': True,
        'analysis': {
            "damage_type": damage_type,
            "severity": "moderate",
            "affected_area_sqft": 500,
            "total_estimate": 2500,
            "confidence_percent": 75,
            "is_mock": True
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)