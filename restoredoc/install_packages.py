#!/usr/bin/env python
"""
Install required packages for Flask server
"""

import subprocess
import sys
import os

print("=" * 60)
print("Flask Package Installer")
print("=" * 60)
print()

def install_package(package_name):
    """Install a Python package using pip"""
    try:
        print(f"Installing {package_name}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        print(f"✓ {package_name} installed successfully")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Failed to install {package_name}")
        return False
    except Exception as e:
        print(f"✗ Error installing {package_name}: {e}")
        return False

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name.replace("-", "_")
    
    try:
        __import__(import_name)
        return True
    except ImportError:
        return False

print("1. Checking Python version...")
print(f"Python {sys.version}")
print()

print("2. Upgrading pip...")
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip", "--quiet"])
    print("✓ pip upgraded")
except:
    print("⚠ Could not upgrade pip (may need admin rights)")
print()

# List of required packages
packages = [
    ("flask", "flask"),
    ("flask-cors", "flask_cors"),
    ("python-dotenv", "dotenv"),
    ("requests", "requests"),
    ("openai", "openai")  # Optional but recommended
]

print("3. Checking and installing packages...")
print("-" * 40)

failed = []
for package_name, import_name in packages:
    if check_package(package_name, import_name):
        print(f"✓ {package_name} already installed")
    else:
        print(f"✗ {package_name} not found, installing...")
        if not install_package(package_name):
            failed.append(package_name)

print()
print("=" * 60)

if failed:
    print("⚠ Some packages failed to install:")
    for pkg in failed:
        print(f"  - {pkg}")
    print()
    print("Try installing manually with admin rights:")
    print(f"  {sys.executable} -m pip install {' '.join(failed)}")
    print()
    print("Or try with --user flag:")
    print(f"  {sys.executable} -m pip install --user {' '.join(failed)}")
else:
    print("✓ All packages installed successfully!")
    print()
    print("You can now run:")
    print("  python flask_app.py")
    print()
    print("Or check the setup:")
    print("  python debug_flask.py")

print("=" * 60)
print()

# Quick test
print("Testing Flask import...")
try:
    import flask
    print(f"✓ Flask {flask.__version__} is working!")
    
    # Create a minimal test
    print()
    print("Testing Flask app creation...")
    app = flask.Flask(__name__)
    print("✓ Flask app created successfully!")
    
except ImportError as e:
    print(f"✗ Flask still not working: {e}")
    print()
    print("Please try:")
    print("1. Close this terminal")
    print("2. Open a new terminal")
    print("3. Run: python -m pip install flask --user")
except Exception as e:
    print(f"✗ Error: {e}")

input("\nPress Enter to exit...")