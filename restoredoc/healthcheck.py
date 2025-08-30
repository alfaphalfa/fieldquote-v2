#!/usr/bin/env python
"""Simple healthcheck to verify the app can start"""

import sys

try:
    from app import app
    print("✓ App imported successfully")
    print(f"✓ Flask app name: {app.name}")
    print("✓ Healthcheck passed")
    sys.exit(0)
except Exception as e:
    print(f"✗ Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)