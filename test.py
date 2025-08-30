print("Python test starting")
print("Testing imports...")
try:
    from app import app
    print("SUCCESS: App imported")
except Exception as e:
    print(f"ERROR: {e}")
print("Test complete")