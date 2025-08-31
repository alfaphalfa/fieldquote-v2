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

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """Generate PDF from estimate data"""
    try:
        data = request.json
        
        # Check if PDF generator is available
        if not HAS_PDF:
            # If no PDF generator, return a simple HTML response
            return jsonify({
                'error': 'PDF generation not available',
                'message': 'PDF library not installed'
            }), 501
        
        # Extract data from request
        analysis = data.get('analysis', {})
        line_items = data.get('lineItems', [])
        customer_info = data.get('customerInfo', {})
        total_amount = data.get('totalAmount', 0)
        
        # Prepare data for PDF generator
        estimate_data = {
            'date': datetime.now().strftime('%m/%d/%Y'),
            'customer_name': customer_info.get('name', 'N/A'),
            'customer_address': customer_info.get('address', 'N/A'),
            'customer_phone': customer_info.get('phone', 'N/A'),
            'customer_email': customer_info.get('email', 'N/A'),
            'assessment': {
                'damage_type': analysis.get('damage_type', 'N/A'),
                'severity': analysis.get('severity', 'N/A'),
                'affected_area': analysis.get('affected_area_sqft', 0),
                'classification': analysis.get('classification', {})
            },
            'line_items': [
                {
                    'description': item.get('description', ''),
                    'quantity': item.get('quantity', 1),
                    'unit_price': item.get('unitPrice', item.get('total', 0)),
                    'total': item.get('total', 0)
                }
                for item in line_items
            ],
            'markup': data.get('markup', 0),
            'equipment': data.get('equipment', []),
            'photos': data.get('photos', [])
        }
        
        # Generate PDF
        pdf_gen = PDFGenerator()
        pdf_bytes = pdf_gen.generate_estimate_pdf(estimate_data)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"estimate_{timestamp}.pdf"
        
        return pdf_bytes, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename={filename}'
        }
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)