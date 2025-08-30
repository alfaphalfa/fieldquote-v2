#!/usr/bin/env python
"""
Minimal Flask test - verifies Flask is installed and working
"""

import sys

print("Testing Flask installation...")
print("-" * 40)

try:
    # Test Flask import
    import flask
    print(f"✓ Flask {flask.__version__} imported successfully")
    
    # Test Flask-CORS
    try:
        import flask_cors
        print("✓ Flask-CORS imported successfully")
    except ImportError:
        print("⚠ Flask-CORS not installed (optional)")
    
    # Test creating a simple app
    app = flask.Flask(__name__)
    print("✓ Flask app created successfully")
    
    # Add a test route
    @app.route('/')
    def hello():
        return {'message': 'Flask is working!'}
    
    @app.route('/test')
    def test():
        return flask.jsonify({
            'status': 'success',
            'flask_version': flask.__version__,
            'python_version': sys.version
        })
    
    print("✓ Routes registered successfully")
    
    print()
    print("=" * 40)
    print("SUCCESS! Flask is working properly")
    print("=" * 40)
    print()
    print("To start the Flask server, run:")
    print("  python flask_app.py")
    print()
    print("The server will be available at:")
    print("  http://localhost:5000")
    
except ImportError as e:
    print(f"✗ Flask is not installed: {e}")
    print()
    print("To install Flask, run ONE of these commands:")
    print()
    print("Option 1 (Recommended):")
    print("  python -m pip install flask")
    print()
    print("Option 2 (If permission denied):")
    print("  python -m pip install flask --user")
    print()
    print("Option 3 (Using requirements file):")
    print("  python -m pip install -r requirements.txt")
    print()
    print("Option 4 (Quick install batch file):")
    print("  quick_install.bat")
    
except Exception as e:
    print(f"✗ Error: {e}")

input("\nPress Enter to exit...")