#!/usr/bin/env python
"""
Flask Setup Diagnostic Script for RestoreDoc
Helps diagnose issues with Flask server setup
"""

import os
import sys
import subprocess
from pathlib import Path

print("=" * 70)
print("RestoreDoc Flask Diagnostics")
print("=" * 70)
print()

# Get directories
current_dir = Path.cwd()
parent_dir = current_dir.parent
script_dir = Path(__file__).parent

print("1. DIRECTORY INFORMATION")
print("-" * 40)
print(f"Current directory: {current_dir}")
print(f"Script directory: {script_dir}")
print(f"Parent directory: {parent_dir}")
print(f"Python executable: {sys.executable}")
print()

# Check for Flask files in different locations
print("2. FLASK FILES LOCATION")
print("-" * 40)
print("\nIn parent directory (C:\\Users\\kevin\\fieldquote-v2):")
parent_files = {
    'app.py': parent_dir / 'app.py',
    'requirements.txt': parent_dir / 'requirements.txt',
    'index-editable.html': parent_dir / 'index-editable.html',
    '.env': parent_dir / '.env',
    '.env.example': parent_dir / '.env.example',
    'run.bat': parent_dir / 'run.bat',
    'debug.py': parent_dir / 'debug.py'
}

for name, path in parent_files.items():
    exists = "✓" if path.exists() else "✗"
    print(f"  {exists} {name}: {path}")

print("\nIn current directory (restoredoc):")
local_files = {
    'flask_app.py': current_dir / 'flask_app.py',
    'server.py': current_dir / 'server.py',
    'package.json': current_dir / 'package.json',
    '.env': current_dir / '.env'
}

for name, path in local_files.items():
    exists = "✓" if path.exists() else "✗"
    print(f"  {exists} {name}")
print()

# Check Python packages
print("3. PYTHON PACKAGES")
print("-" * 40)

packages = ['flask', 'flask_cors', 'dotenv', 'openai', 'requests']
missing = []

for pkg in packages:
    try:
        __import__(pkg)
        print(f"  ✓ {pkg} installed")
    except ImportError:
        print(f"  ✗ {pkg} NOT installed")
        missing.append(pkg)

if missing:
    print(f"\nTo install missing packages:")
    print(f"  pip install {' '.join(missing)}")
print()

# Check environment variables
print("4. ENVIRONMENT VARIABLES")
print("-" * 40)

# Try to load .env
env_locations = [
    parent_dir / '.env',
    current_dir / '.env'
]

env_loaded = False
for env_path in env_locations:
    if env_path.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(env_path)
            print(f"✓ Loaded .env from: {env_path}")
            env_loaded = True
            break
        except ImportError:
            print(f"⚠ Found .env at {env_path} but python-dotenv not installed")

if not env_loaded:
    print("✗ No .env file found or loaded")

# Check key environment variables
env_vars = {
    'OPENAI_API_KEY': 'OpenAI API',
    'SUPABASE_URL': 'Supabase URL',
    'FLASK_PORT': 'Flask Port'
}

print("\nConfiguration:")
for var, name in env_vars.items():
    value = os.getenv(var)
    if value:
        if 'KEY' in var:
            masked = f"{value[:7]}...{value[-4:]}" if len(value) > 11 else "***"
            print(f"  ✓ {name}: {masked}")
        else:
            print(f"  ✓ {name}: {value}")
    else:
        print(f"  ✗ {name}: Not set")
print()

# Provide instructions
print("5. HOW TO RUN THE FLASK SERVER")
print("-" * 40)
print("\nYou have two Flask setups available:\n")

print("Option 1: Main Flask app (in parent directory)")
print("  This serves the HTML files and has full OpenAI integration")
print("  To run:")
print(f"    cd {parent_dir}")
print("    python app.py")
print("  OR")
print("    run.bat (Windows)")
print("    ./run.sh (Mac/Linux)")
print()

print("Option 2: Flask API for Next.js (in restoredoc)")
print("  This is a simple API server for the Next.js app")
print("  To run:")
print(f"    cd {current_dir}")
print("    python flask_app.py")
print()

print("Option 3: Simple HTTP server (in restoredoc)")
print("  Basic file server with CORS")
print("  To run:")
print(f"    cd {current_dir}")
print("    python server.py")
print()

# Test imports
print("6. TESTING FLASK IMPORT")
print("-" * 40)
try:
    # Add parent to path
    sys.path.insert(0, str(parent_dir))
    
    # Try to import the main app
    try:
        import app
        print("✓ Parent app.py imports successfully")
    except ImportError as e:
        print(f"✗ Cannot import parent app.py: {e}")
    
    # Try to import local flask_app
    try:
        import flask_app
        print("✓ Local flask_app.py imports successfully")
    except ImportError as e:
        print(f"✗ Cannot import flask_app.py: {e}")
        
except Exception as e:
    print(f"Error during import test: {e}")
print()

# Quick test option
print("7. QUICK TEST")
print("-" * 40)
print("Would you like to start a Flask server now? (y/n): ", end="")
response = input().strip().lower()

if response == 'y':
    print("\nWhich server to start?")
    print("1. Main Flask app (parent directory)")
    print("2. Flask API (restoredoc)")
    print("3. Simple HTTP server (restoredoc)")
    print("Choice (1/2/3): ", end="")
    
    choice = input().strip()
    
    if choice == '1':
        os.chdir(parent_dir)
        print(f"\nStarting main Flask app from {parent_dir}")
        subprocess.run([sys.executable, 'app.py'])
    elif choice == '2':
        print(f"\nStarting Flask API from {current_dir}")
        subprocess.run([sys.executable, 'flask_app.py'])
    elif choice == '3':
        print(f"\nStarting simple HTTP server from {current_dir}")
        subprocess.run([sys.executable, 'server.py'])
    else:
        print("Invalid choice")
else:
    print("\nDiagnostics complete!")
    print("\nTo start the server manually, use one of the options shown above.")

print("\n" + "=" * 70)
print("End of Diagnostics")
print("=" * 70)