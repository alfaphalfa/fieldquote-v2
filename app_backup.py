"""
Flask server for RestoreDoc - AI-Powered Restoration Estimation Platform
"""

import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import json
import base64
import logging
import socket
from datetime import datetime
from typing import Dict, Any, List, Optional
import traceback

# Print startup message
print("=" * 60)
print("RestoreDoc Flask Server - Starting up...")
print("Python version:", sys.version)
print("=" * 60)

try:
    from flask import Flask, request, jsonify, send_from_directory, render_template_string
    print("✓ Flask imported successfully")
except ImportError as e:
    print("✗ Failed to import Flask:", e)
    sys.exit(1)

try:
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
except ImportError as e:
    print("✗ Failed to import Flask-CORS:", e)
    sys.exit(1)

try:
    from dotenv import load_dotenv
    print("✓ python-dotenv imported successfully")
except ImportError as e:
    print("✗ Failed to import python-dotenv:", e)
    sys.exit(1)

try:
    import openai
    print("✓ OpenAI library imported successfully")
except ImportError as e:
    print("✗ Failed to import OpenAI:", e)
    print("  Install with: pip install openai")

try:
    from werkzeug.utils import secure_filename
    print("✓ Werkzeug imported successfully")
except ImportError as e:
    print("✗ Failed to import Werkzeug:", e)
    sys.exit(1)

try:
    from pdf_generator import PDFGenerator
    print("✓ PDF Generator imported successfully")
except ImportError as e:
    print("✗ Failed to import PDF Generator:", e)
    print("  PDF generation will not be available")

# Load environment variables
print("\n" + "-" * 40)
print("Loading environment variables...")
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"✓ Loaded .env file from: {env_path}")
else:
    print(f"✗ .env file not found at: {env_path}")
    print("  Using system environment variables only")

# Check for API keys
print("\n" + "-" * 40)
print("Checking configuration...")
openai_key = os.getenv('OPENAI_API_KEY')
if openai_key:
    masked_key = f"{openai_key[:7]}...{openai_key[-4:]}" if len(openai_key) > 11 else "***"
    print(f"✓ OpenAI API Key found: {masked_key}")
else:
    print("✗ OpenAI API Key not found")
    print("  The app will use mock data for analysis")

supabase_url = os.getenv('SUPABASE_URL')
if supabase_url:
    print(f"✓ Supabase URL found: {supabase_url}")
else:
    print("✗ Supabase URL not found")

supabase_key = os.getenv('SUPABASE_ANON_KEY')
if supabase_key:
    masked_key = f"{supabase_key[:7]}...{supabase_key[-4:]}" if len(supabase_key) > 11 else "***"
    print(f"✓ Supabase Anon Key found: {masked_key}")
else:
    print("✗ Supabase Anon Key not found")

# Configure logging
log_level = os.getenv('LOG_LEVEL', 'DEBUG')
logging.basicConfig(
    level=getattr(logging, log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info("Logging configured at %s level", log_level)

# Initialize Flask app
print("\n" + "-" * 40)
print("Initializing Flask application...")
try:
    app = Flask(__name__, static_folder='.', static_url_path='')
    app.config['DEBUG'] = os.getenv('FLASK_ENV', 'production') == 'development'  # Debug only in development
    print("✓ Flask app initialized")
except Exception as e:
    print(f"✗ Failed to initialize Flask app: {e}")
    traceback.print_exc()
    sys.exit(1)

# Configure CORS
try:
    # In production, you may want to restrict origins
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    cors_config = {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True,
        "max_age": 3600
    }
    CORS(app, resources={r"/api/*": cors_config})
    print(f"✓ CORS configured (origins: {allowed_origins})")
except Exception as e:
    print(f"✗ Failed to configure CORS: {e}")
    traceback.print_exc()

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB max file size
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Initialize OpenAI client
print("\n" + "-" * 40)
print("Initializing OpenAI client...")
try:
    if openai_key:
        openai.api_key = openai_key
        # Try to initialize the new client
        try:
            openai_client = openai.OpenAI(api_key=openai_key)
            print("✓ OpenAI client initialized (new SDK)")
        except:
            print("✓ OpenAI API key set (legacy SDK)")
    else:
        print("⚠ Skipping OpenAI initialization (no API key)")
except Exception as e:
    print(f"✗ Error initializing OpenAI: {e}")
    traceback.print_exc()

# Create upload folder if it doesn't exist
upload_path = app.config['UPLOAD_FOLDER']
if not os.path.exists(upload_path):
    try:
        os.makedirs(upload_path)
        print(f"✓ Created upload folder: {upload_path}")
    except Exception as e:
        print(f"✗ Failed to create upload folder: {e}")
else:
    print(f"✓ Upload folder exists: {upload_path}")

# Create generated_pdfs folder if it doesn't exist
pdf_path = 'generated_pdfs'
if not os.path.exists(pdf_path):
    try:
        os.makedirs(pdf_path)
        print(f"✓ Created PDF folder: {pdf_path}")
    except Exception as e:
        print(f"✗ Failed to create PDF folder: {e}")
else:
    print(f"✓ PDF folder exists: {pdf_path}")

print("-" * 40 + "\n")

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image(image_path: str) -> str:
    """Encode image to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def get_damage_analysis_prompt(damage_type: str) -> str:
    """Get the appropriate prompt based on damage type"""
    
    prompts = {
        'water': """
        Analyze this water damage photo and provide a detailed assessment following IICRC S500 standards.
        
        Return a JSON object with:
        {
            "damage_type": "water",
            "category": "1, 2, or 3",
            "class": "1, 2, 3, or 4",
            "affected_area_sqft": number,
            "severity": "minor/moderate/severe",
            "moisture_level": "low/medium/high",
            "standing_water": boolean,
            "affected_materials": ["list of materials"],
            "health_risk": "low/medium/high",
            "immediate_actions": ["list of actions"],
            "equipment_needed": [
                {"name": "Dehumidifier", "quantity": number, "days": number},
                {"name": "Air Mover", "quantity": number, "days": number}
            ],
            "line_items": [
                {"description": "Water extraction", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Mitigation"},
                {"description": "Antimicrobial treatment", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Treatment"}
            ],
            "estimated_days": number,
            "total_estimate": number,
            "confidence_percent": number
        }
        
        Base pricing on:
        - Category 1 (Clean): $3.00-4.00/sq ft
        - Category 2 (Gray): $4.50-5.50/sq ft
        - Category 3 (Black): $7.00-9.00/sq ft
        """,
        
        'fire': """
        Analyze this fire/smoke damage photo and provide a detailed assessment following IICRC S700 standards.
        
        Return a JSON object with:
        {
            "damage_type": "fire",
            "fire_class": "A/B/C/D/K",
            "smoke_type": "wet/dry/protein/fuel",
            "soot_level": "light/moderate/heavy",
            "affected_area_sqft": number,
            "severity": "minor/moderate/severe",
            "structural_damage": boolean,
            "odor_level": "low/medium/high",
            "affected_materials": ["list of materials"],
            "health_hazards": ["list of hazards"],
            "immediate_actions": ["list of actions"],
            "equipment_needed": [
                {"name": "Air Scrubber", "quantity": number, "days": number},
                {"name": "Hydroxyl Generator", "quantity": number, "days": number}
            ],
            "line_items": [
                {"description": "Soot removal", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Cleaning"},
                {"description": "Odor treatment", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Treatment"}
            ],
            "estimated_days": number,
            "total_estimate": number,
            "confidence_percent": number
        }
        
        Base pricing on:
        - Light Smoke: $3.00-5.00/sq ft
        - Heavy Smoke: $6.00-10.00/sq ft
        - Structural: $25.00-50.00/sq ft
        """,
        
        'mold': """
        Analyze this mold damage photo and provide a detailed assessment following IICRC S520 standards.
        
        Return a JSON object with:
        {
            "damage_type": "mold",
            "condition": "1, 2, or 3",
            "contamination_level": "1, 2, 3, or 4",
            "affected_area_sqft": number,
            "severity": "minor/moderate/severe",
            "mold_types_visible": ["list of types if identifiable"],
            "moisture_source": "description",
            "containment_required": boolean,
            "health_risk": "low/medium/high",
            "affected_materials": ["list of materials"],
            "immediate_actions": ["list of actions"],
            "equipment_needed": [
                {"name": "HEPA Air Scrubber", "quantity": number, "days": number},
                {"name": "Negative Air Machine", "quantity": number, "days": number}
            ],
            "line_items": [
                {"description": "Containment setup", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Setup"},
                {"description": "Mold remediation", "quantity": number, "unit": "sqft", "unitPrice": number, "category": "Remediation"}
            ],
            "requires_testing": boolean,
            "estimated_days": number,
            "total_estimate": number,
            "confidence_percent": number
        }
        
        Base pricing on:
        - Level 1 (<10 sq ft): $500-1,500
        - Level 2 (10-30 sq ft): $1,500-3,000
        - Level 3 (30-100 sq ft): $3,000-8,000
        - Level 4 (>100 sq ft): $8,000-20,000+
        """
    }
    
    return prompts.get(damage_type, prompts['water'])

@app.route('/')
def index():
    """Serve the main index-editable.html file"""
    logger.info("Serving index page")
    try:
        return send_from_directory('.', 'index-editable.html')
    except Exception as e:
        logger.error(f"Error serving index: {e}")
        return jsonify({"error": "File not found", "message": str(e)}), 404

@app.route('/test')
def test():
    """Serve the test page"""
    logger.info("Serving test page")
    try:
        return send_from_directory('.', 'test-editable-features.html')
    except Exception as e:
        logger.error(f"Error serving test page: {e}")
        return jsonify({"error": "File not found", "message": str(e)}), 404

@app.route('/test-connection')
def test_connection():
    """Test connection endpoint with detailed information"""
    logger.info("Test connection endpoint called")
    
    # Get current working directory
    cwd = os.getcwd()
    
    # List files in current directory
    files_in_dir = []
    try:
        files_in_dir = [f for f in os.listdir('.') if f.endswith('.html')][:10]
    except:
        pass
    
    # Check if required files exist
    required_files = {
        'index-editable.html': os.path.exists('index-editable.html'),
        'test-editable-features.html': os.path.exists('test-editable-features.html'),
        '.env': os.path.exists('.env'),
        'requirements.txt': os.path.exists('requirements.txt')
    }
    
    response = {
        "status": "connected",
        "timestamp": datetime.now().isoformat(),
        "server_info": {
            "python_version": sys.version,
            "flask_version": Flask.__version__ if hasattr(Flask, '__version__') else "unknown",
            "working_directory": cwd,
            "host": request.host,
            "url_root": request.url_root
        },
        "configuration": {
            "openai_configured": bool(os.getenv('OPENAI_API_KEY')),
            "openai_key_prefix": os.getenv('OPENAI_API_KEY', '')[:7] if os.getenv('OPENAI_API_KEY') else None,
            "supabase_configured": bool(os.getenv('SUPABASE_URL')),
            "supabase_url": os.getenv('SUPABASE_URL', 'Not configured'),
            "debug_mode": app.debug,
            "cors_enabled": True,
            "upload_folder": app.config.get('UPLOAD_FOLDER'),
            "max_content_length": app.config.get('MAX_CONTENT_LENGTH')
        },
        "files": {
            "required_files": required_files,
            "html_files_found": files_in_dir
        },
        "routes": [str(rule) for rule in app.url_map.iter_rules()][:20]  # Show first 20 routes
    }
    
    return jsonify(response)

@app.route('/health')
def health():
    """Health check endpoint"""
    logger.debug("Health check called")
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'environment': {
            'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
            'supabase_configured': bool(os.getenv('SUPABASE_URL'))
        }
    })

@app.route('/api/analyze-damage', methods=['POST'])
def analyze_damage():
    """
    Analyze damage from uploaded photos using OpenAI Vision API
    """
    try:
        # Check if OpenAI API key is configured
        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({
                'error': 'OpenAI API key not configured',
                'message': 'Please set OPENAI_API_KEY in your .env file'
            }), 500

        # Get damage type from request
        damage_type = request.form.get('damage_type', 'water')
        if damage_type not in ['water', 'fire', 'mold']:
            return jsonify({
                'error': 'Invalid damage type',
                'message': 'Damage type must be water, fire, or mold'
            }), 400

        # Check if photos were uploaded
        if 'photos' not in request.files:
            return jsonify({
                'error': 'No photos provided',
                'message': 'Please upload at least one photo'
            }), 400

        photos = request.files.getlist('photos')
        if not photos or len(photos) == 0:
            return jsonify({
                'error': 'No photos provided',
                'message': 'Please upload at least one photo'
            }), 400

        # Process and save uploaded photos
        image_paths = []
        base64_images = []
        
        for photo in photos:
            if photo and allowed_file(photo.filename):
                filename = secure_filename(photo.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                photo.save(filepath)
                image_paths.append(filepath)
                
                # Encode image to base64
                base64_image = encode_image(filepath)
                base64_images.append(base64_image)

        if not base64_images:
            return jsonify({
                'error': 'No valid images provided',
                'message': 'Please upload valid image files (jpg, png, webp)'
            }), 400

        # Prepare messages for OpenAI Vision API
        prompt = get_damage_analysis_prompt(damage_type)
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert restoration contractor specializing in damage assessment following IICRC standards. Analyze the provided images and return only valid JSON data."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
        
        # Add images to the message
        for base64_image in base64_images:
            messages[1]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                    "detail": "high"
                }
            })

        # Call OpenAI Vision API
        logger.info(f"Calling OpenAI Vision API for {damage_type} damage analysis")
        
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=2000,
            temperature=0.3
        )

        # Parse the response
        analysis_text = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Remove any markdown formatting
            analysis_text = analysis_text.replace('```json', '').replace('```', '').strip()
            analysis_json = json.loads(analysis_text)
        except json.JSONDecodeError:
            # If parsing fails, create a default response
            logger.error(f"Failed to parse OpenAI response as JSON: {analysis_text}")
            analysis_json = {
                "damage_type": damage_type,
                "error": "Failed to parse AI response",
                "raw_response": analysis_text,
                "affected_area_sqft": 500,
                "severity": "moderate",
                "total_estimate": 2500,
                "confidence_percent": 50,
                "line_items": [
                    {
                        "description": f"{damage_type.capitalize()} damage assessment - manual review required",
                        "quantity": 500,
                        "unit": "sqft",
                        "unitPrice": 5.00,
                        "category": "Assessment"
                    }
                ]
            }

        # Clean up temporary files
        for filepath in image_paths:
            try:
                os.remove(filepath)
            except:
                pass

        # Add metadata to response
        analysis_json['analysis_timestamp'] = datetime.now().isoformat()
        analysis_json['photo_count'] = len(photos)
        
        logger.info(f"Successfully analyzed {damage_type} damage")
        
        return jsonify({
            'success': True,
            'analysis': analysis_json
        })

    except openai.APIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return jsonify({
            'error': 'OpenAI API error',
            'message': str(e)
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in analyze_damage: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/mock-analyze', methods=['POST'])
def mock_analyze():
    """
    Mock analysis endpoint for testing without OpenAI API
    """
    damage_type = request.form.get('damage_type', 'water')
    
    mock_responses = {
        'water': {
            "damage_type": "water",
            "category": "2",
            "class": "3",
            "affected_area_sqft": 650,
            "severity": "moderate",
            "moisture_level": "high",
            "standing_water": True,
            "affected_materials": ["Drywall", "Carpet", "Baseboards"],
            "health_risk": "medium",
            "immediate_actions": ["Extract water", "Set up drying equipment", "Remove wet materials"],
            "equipment_needed": [
                {"name": "Dehumidifier", "quantity": 2, "days": 3},
                {"name": "Air Mover", "quantity": 6, "days": 3}
            ],
            "line_items": [
                {"description": "Water extraction", "quantity": 650, "unit": "sqft", "unitPrice": 1.50, "category": "Mitigation", "total": 975},
                {"description": "Antimicrobial treatment", "quantity": 650, "unit": "sqft", "unitPrice": 0.75, "category": "Treatment", "total": 487.50},
                {"description": "Drying equipment setup", "quantity": 4, "unit": "hour", "unitPrice": 125, "category": "Labor", "total": 500},
                {"description": "Dehumidifier rental", "quantity": 3, "unit": "day", "unitPrice": 85, "category": "Equipment", "total": 255},
                {"description": "Air mover rental", "quantity": 3, "unit": "day", "unitPrice": 45, "category": "Equipment", "total": 135}
            ],
            "estimated_days": 3,
            "total_estimate": 2352.50,
            "confidence_percent": 85
        },
        'fire': {
            "damage_type": "fire",
            "fire_class": "A",
            "smoke_type": "dry",
            "soot_level": "moderate",
            "affected_area_sqft": 1200,
            "severity": "moderate",
            "structural_damage": False,
            "odor_level": "high",
            "affected_materials": ["Walls", "Ceiling", "Contents"],
            "health_hazards": ["Smoke residue", "Particulates"],
            "immediate_actions": ["Ventilate area", "HEPA vacuum", "Seal HVAC"],
            "equipment_needed": [
                {"name": "Air Scrubber", "quantity": 3, "days": 5},
                {"name": "Hydroxyl Generator", "quantity": 2, "days": 5}
            ],
            "line_items": [
                {"description": "Soot removal from surfaces", "quantity": 1200, "unit": "sqft", "unitPrice": 2.50, "category": "Cleaning", "total": 3000},
                {"description": "HEPA vacuuming", "quantity": 1200, "unit": "sqft", "unitPrice": 0.75, "category": "Cleaning", "total": 900},
                {"description": "Thermal fogging", "quantity": 1200, "unit": "sqft", "unitPrice": 1.25, "category": "Treatment", "total": 1500},
                {"description": "Content cleaning", "quantity": 12, "unit": "hour", "unitPrice": 125, "category": "Labor", "total": 1500}
            ],
            "estimated_days": 5,
            "total_estimate": 6900,
            "confidence_percent": 80
        },
        'mold': {
            "damage_type": "mold",
            "condition": "2",
            "contamination_level": "3",
            "affected_area_sqft": 75,
            "severity": "moderate",
            "mold_types_visible": ["Black mold", "White fuzzy growth"],
            "moisture_source": "Leaking pipe behind wall",
            "containment_required": True,
            "health_risk": "high",
            "affected_materials": ["Drywall", "Insulation", "Wood framing"],
            "immediate_actions": ["Set up containment", "HEPA filtration", "Fix moisture source"],
            "equipment_needed": [
                {"name": "HEPA Air Scrubber", "quantity": 2, "days": 3},
                {"name": "Negative Air Machine", "quantity": 1, "days": 3}
            ],
            "line_items": [
                {"description": "Containment setup", "quantity": 150, "unit": "sqft", "unitPrice": 3.00, "category": "Setup", "total": 450},
                {"description": "Mold remediation", "quantity": 75, "unit": "sqft", "unitPrice": 8.00, "category": "Remediation", "total": 600},
                {"description": "HEPA vacuuming", "quantity": 150, "unit": "sqft", "unitPrice": 1.50, "category": "Cleaning", "total": 225},
                {"description": "Post-remediation testing", "quantity": 2, "unit": "test", "unitPrice": 350, "category": "Testing", "total": 700}
            ],
            "requires_testing": True,
            "estimated_days": 3,
            "total_estimate": 1975,
            "confidence_percent": 75
        }
    }
    
    analysis = mock_responses.get(damage_type, mock_responses['water'])
    analysis['analysis_timestamp'] = datetime.now().isoformat()
    analysis['is_mock'] = True
    
    return jsonify({
        'success': True,
        'analysis': analysis,
        'mock': True
    })

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Generate a PDF estimate from the provided data
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide estimate data'
            }), 400
        
        # Initialize PDF generator
        pdf_gen = PDFGenerator()
        
        # Generate the PDF
        pdf_data = pdf_gen.generate_estimate_pdf(data)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        customer_name = data.get('customer_name', 'customer').replace(' ', '_')
        filename = f"estimate_{customer_name}_{timestamp}.pdf"
        
        # Save PDF to file
        filepath = pdf_gen.save_pdf_to_file(pdf_data, filename)
        
        # Convert to base64 for response
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        logger.info(f"Successfully generated PDF: {filename}")
        
        return jsonify({
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'pdf_data': f"data:application/pdf;base64,{pdf_base64}",
            'message': 'PDF generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        return jsonify({
            'error': 'PDF generation failed',
            'message': str(e)
        }), 500

@app.route('/api/download-pdf/<filename>', methods=['GET'])
def download_pdf(filename):
    """
    Download a previously generated PDF
    """
    try:
        pdf_folder = 'generated_pdfs'
        # Ensure filename is secure
        safe_filename = secure_filename(filename)
        
        # Check if file exists
        filepath = os.path.join(pdf_folder, safe_filename)
        if not os.path.exists(filepath):
            return jsonify({
                'error': 'File not found',
                'message': f'PDF file {safe_filename} not found'
            }), 404
        
        return send_from_directory(pdf_folder, safe_filename, 
                                 mimetype='application/pdf',
                                 as_attachment=True,
                                 download_name=safe_filename)
        
    except Exception as e:
        logger.error(f"Error downloading PDF: {str(e)}")
        return jsonify({
            'error': 'Download failed',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    logger.error(f"404 error: {request.url}")
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found',
        'path': request.path
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"500 error: {str(error)}")
    # In production, don't expose internal error details
    if app.debug:
        return jsonify({
            'error': 'Internal server error',
            'message': str(error),
            'traceback': traceback.format_exc()
        }), 500
    else:
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please contact support if this persists.'
        }), 500

@app.errorhandler(Exception)
def handle_exception(error):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {str(error)}", exc_info=True)
    # In production, don't expose internal error details
    if app.debug:
        return jsonify({
            'error': 'Unexpected error',
            'message': str(error),
            'type': type(error).__name__
        }), 500
    else:
        return jsonify({
            'error': 'Unexpected error',
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500

def check_port(host, port):
    """Check if a port is available"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex((host, port))
    sock.close()
    return result != 0  # True if port is available

if __name__ == '__main__':
    # Get configuration from environment or use defaults
    host = '0.0.0.0'  # Required for Render deployment
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5000)))  # Use PORT env var for Render
    debug = os.getenv('FLASK_ENV', 'production') == 'development'  # Default to production
    
    print("\n" + "=" * 60)
    print("STARTING FLASK SERVER")
    print("=" * 60)
    
    # Check if port is available
    if not check_port('127.0.0.1', port):
        print(f"✗ Port {port} is already in use!")
        print("  Trying alternative ports...")
        
        # Try alternative ports
        alternative_ports = [8000, 8080, 8888, 5001, 5555, 3000]
        for alt_port in alternative_ports:
            if check_port('127.0.0.1', alt_port):
                port = alt_port
                print(f"✓ Using alternative port: {port}")
                break
        else:
            print("✗ No available ports found!")
            print("  Please stop the existing server or choose a different port")
            sys.exit(1)
    else:
        print(f"✓ Port {port} is available")
    
    print(f"\nServer Configuration:")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Debug: {debug}")
    print(f"  Working Directory: {os.getcwd()}")
    print(f"  Python: {sys.version}")
    
    print(f"\nAPI Configuration:")
    print(f"  OpenAI: {'✓ Configured' if os.getenv('OPENAI_API_KEY') else '✗ Not configured (using mock data)'}")
    print(f"  Supabase: {'✓ Configured' if os.getenv('SUPABASE_URL') else '✗ Not configured'}")
    
    print(f"\nAccess URLs:")
    print(f"  Local: http://localhost:{port}")
    print(f"  Network: http://{socket.gethostbyname(socket.gethostname())}:{port}")
    print(f"  Test Connection: http://localhost:{port}/test-connection")
    print(f"  Health Check: http://localhost:{port}/health")
    
    print("\n" + "=" * 60)
    print("Press CTRL+C to stop the server")
    print("=" * 60 + "\n")
    
    try:
        app.run(
            host='0.0.0.0',  # Required for production
            port=port,
            debug=False,  # Always False in production
            use_reloader=False  # Disable reloader to prevent duplicate startup messages
        )
    except Exception as e:
        print(f"\n✗ Failed to start server: {e}")
        traceback.print_exc()
        sys.exit(1)