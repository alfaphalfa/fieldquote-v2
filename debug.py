#!/usr/bin/env python
"""
RestoreDoc Flask Server Debug Script
This script helps diagnose common issues with the Flask server setup
"""

import os
import sys
import socket
import json
import subprocess
from pathlib import Path

print("=" * 70)
print("RestoreDoc Flask Server Diagnostics")
print("=" * 70)
print()

# 1. Check Python Version
print("1. PYTHON ENVIRONMENT")
print("-" * 40)
print(f"Python Version: {sys.version}")
print(f"Python Executable: {sys.executable}")
print(f"Python Path: {sys.path[0]}")
print()

# 2. Check Current Directory
print("2. WORKING DIRECTORY")
print("-" * 40)
cwd = os.getcwd()
print(f"Current Directory: {cwd}")
print(f"Script Directory: {os.path.dirname(os.path.abspath(__file__))}")

# List important files
important_files = [
    'app.py',
    'requirements.txt',
    '.env',
    '.env.example',
    'index-editable.html',
    'test-editable-features.html',
    'run.bat',
    'run.sh',
    'run.ps1'
]

print("\nFile Check:")
for file in important_files:
    exists = "✓" if os.path.exists(file) else "✗"
    size = f"({os.path.getsize(file)} bytes)" if os.path.exists(file) else ""
    print(f"  {exists} {file} {size}")
print()

# 3. Check Dependencies
print("3. DEPENDENCIES CHECK")
print("-" * 40)

required_packages = {
    'flask': 'Flask',
    'flask_cors': 'flask-cors',
    'dotenv': 'python-dotenv',
    'openai': 'openai',
    'werkzeug': 'Werkzeug'
}

missing_packages = []
for module, package in required_packages.items():
    try:
        __import__(module)
        print(f"  ✓ {package} is installed")
    except ImportError:
        print(f"  ✗ {package} is NOT installed")
        missing_packages.append(package)

if missing_packages:
    print(f"\nTo install missing packages, run:")
    print(f"  pip install {' '.join(missing_packages)}")
print()

# 4. Check Environment Variables
print("4. ENVIRONMENT VARIABLES")
print("-" * 40)

# Try to load .env file
env_loaded = False
if os.path.exists('.env'):
    try:
        from dotenv import load_dotenv
        load_dotenv()
        env_loaded = True
        print("✓ .env file loaded successfully")
    except ImportError:
        print("✗ Could not load .env (python-dotenv not installed)")
else:
    print("✗ .env file not found")
    if os.path.exists('.env.example'):
        print("  ℹ .env.example exists - copy it to .env and add your keys")

print("\nConfiguration Status:")
env_vars = {
    'OPENAI_API_KEY': 'OpenAI API',
    'SUPABASE_URL': 'Supabase URL',
    'SUPABASE_ANON_KEY': 'Supabase Key',
    'FLASK_HOST': 'Flask Host',
    'FLASK_PORT': 'Flask Port',
    'FLASK_ENV': 'Flask Environment'
}

for var, name in env_vars.items():
    value = os.getenv(var)
    if value:
        if 'KEY' in var or 'key' in var.lower():
            # Mask sensitive values
            masked = f"{value[:7]}...{value[-4:]}" if len(value) > 11 else "***"
            print(f"  ✓ {name}: {masked}")
        else:
            print(f"  ✓ {name}: {value}")
    else:
        print(f"  ✗ {name}: Not set")
print()

# 5. Check Port Availability
print("5. PORT AVAILABILITY")
print("-" * 40)

def check_port(port):
    """Check if a port is available"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    try:
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result != 0  # True if available
    except:
        sock.close()
        return False

ports_to_check = [5000, 8000, 8080, 3000, 5001]
available_ports = []

for port in ports_to_check:
    if check_port(port):
        print(f"  ✓ Port {port} is available")
        available_ports.append(port)
    else:
        print(f"  ✗ Port {port} is in use")

if available_ports:
    print(f"\nRecommended port: {available_ports[0]}")
else:
    print("\n⚠ All common ports are in use!")
print()

# 6. Network Connectivity
print("6. NETWORK CONNECTIVITY")
print("-" * 40)

# Get local IP
try:
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"  Hostname: {hostname}")
    print(f"  Local IP: {local_ip}")
except:
    print("  ✗ Could not determine local IP")

# Check internet connectivity
def check_connection(host="8.8.8.8", port=53, timeout=3):
    """Check internet connectivity"""
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except:
        return False

if check_connection():
    print("  ✓ Internet connection available")
else:
    print("  ✗ No internet connection")
print()

# 7. Test Flask Import
print("7. FLASK SERVER TEST")
print("-" * 40)

try:
    # Try to import the app
    sys.path.insert(0, os.getcwd())
    import app
    print("  ✓ app.py imports successfully")
    
    # Check if Flask app exists
    if hasattr(app, 'app'):
        print("  ✓ Flask app object found")
        
        # List routes
        with app.app.app_context():
            routes = []
            for rule in app.app.url_map.iter_rules():
                routes.append(str(rule))
            print(f"  ✓ {len(routes)} routes registered")
            print("    Sample routes:", ', '.join(routes[:5]))
    else:
        print("  ✗ Flask app object not found in app.py")
        
except ImportError as e:
    print(f"  ✗ Failed to import app.py: {e}")
except Exception as e:
    print(f"  ✗ Error testing Flask app: {e}")
print()

# 8. Recommendations
print("8. RECOMMENDATIONS")
print("-" * 40)

issues = []
if missing_packages:
    issues.append("Install missing packages: pip install -r requirements.txt")
if not os.path.exists('.env'):
    issues.append("Create .env file: copy .env.example .env")
if not os.getenv('OPENAI_API_KEY'):
    issues.append("Add OpenAI API key to .env file")
if not available_ports:
    issues.append("All common ports are in use - stop other servers")

if issues:
    print("To fix issues:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
else:
    print("  ✓ Everything looks good!")
    print("\nTo start the server, run:")
    if sys.platform == 'win32':
        print("  run.bat")
    else:
        print("  ./run.sh")
print()

# 9. Quick Server Test
print("9. QUICK SERVER TEST")
print("-" * 40)
print("Would you like to try starting the server now? (y/n): ", end="")
response = input().strip().lower()

if response == 'y':
    print("\nAttempting to start Flask server...")
    print("Press Ctrl+C to stop\n")
    
    # Set minimal environment variables
    os.environ['FLASK_APP'] = 'app.py'
    os.environ['FLASK_ENV'] = 'development'
    
    if available_ports:
        os.environ['FLASK_PORT'] = str(available_ports[0])
    
    try:
        # Try to run the app directly
        subprocess.run([sys.executable, 'app.py'])
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\nFailed to start server: {e}")
else:
    print("\nDebug complete. Run the server manually when ready.")

print("\n" + "=" * 70)
print("Diagnostics Complete")
print("=" * 70)