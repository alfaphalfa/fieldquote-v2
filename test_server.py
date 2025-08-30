#!/usr/bin/env python
"""
Simple test script to verify Flask server is running
"""

import sys
import time
import json

try:
    import requests
except ImportError:
    print("Installing requests library...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

def test_server(base_url="http://localhost:5000"):
    """Test various server endpoints"""
    
    print("=" * 60)
    print(f"Testing Flask Server at {base_url}")
    print("=" * 60)
    print()
    
    endpoints = [
        ("/health", "Health Check"),
        ("/test-connection", "Connection Test"),
        ("/", "Main Page"),
        ("/test", "Test Page"),
        ("/api/mock-analyze", "Mock Analysis API")
    ]
    
    results = []
    
    for endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"Testing {description}...")
        print(f"  URL: {url}")
        
        try:
            if endpoint == "/api/mock-analyze":
                # POST request for API endpoint
                response = requests.post(url, data={"damage_type": "water"}, timeout=5)
            else:
                # GET request for other endpoints
                response = requests.get(url, timeout=5)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"  ✓ Success")
                
                # Show response details for JSON endpoints
                if endpoint in ["/health", "/test-connection", "/api/mock-analyze"]:
                    try:
                        data = response.json()
                        if endpoint == "/test-connection":
                            # Show detailed connection info
                            print(f"  Server Info:")
                            print(f"    - Python: {data.get('server_info', {}).get('python_version', 'Unknown')[:40]}...")
                            print(f"    - Directory: {data.get('server_info', {}).get('working_directory', 'Unknown')}")
                            print(f"    - OpenAI: {'✓' if data.get('configuration', {}).get('openai_configured') else '✗'}")
                            print(f"    - Supabase: {'✓' if data.get('configuration', {}).get('supabase_configured') else '✗'}")
                        elif endpoint == "/health":
                            print(f"  Status: {data.get('status', 'Unknown')}")
                        elif endpoint == "/api/mock-analyze":
                            print(f"  Mock data returned: {data.get('mock', False)}")
                    except:
                        pass
                
                results.append((description, True))
            else:
                print(f"  ✗ Failed with status {response.status_code}")
                results.append((description, False))
                
        except requests.exceptions.ConnectionError:
            print(f"  ✗ Connection failed - server may not be running")
            results.append((description, False))
        except requests.exceptions.Timeout:
            print(f"  ✗ Request timed out")
            results.append((description, False))
        except Exception as e:
            print(f"  ✗ Error: {e}")
            results.append((description, False))
        
        print()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for description, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"  {status}: {description}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == 0:
        print("\n⚠ Server appears to be down or not accessible")
        print("Make sure the server is running:")
        print("  Windows: run.bat")
        print("  Mac/Linux: ./run.sh")
    elif passed < total:
        print("\n⚠ Some endpoints are not working correctly")
    else:
        print("\n✓ All tests passed! Server is working correctly")
    
    return passed == total

def main():
    """Main function"""
    # Check if custom port is provided
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except:
            print(f"Invalid port: {sys.argv[1]}")
            print("Usage: python test_server.py [port]")
            sys.exit(1)
    
    base_url = f"http://localhost:{port}"
    
    # Try different ports if default fails
    ports_to_try = [port] if port != 5000 else [5000, 8000, 8080, 3000, 5001]
    
    for test_port in ports_to_try:
        test_url = f"http://localhost:{test_port}"
        print(f"\nTrying port {test_port}...")
        
        try:
            # Quick connection test
            response = requests.get(f"{test_url}/health", timeout=1)
            if response.status_code == 200:
                print(f"✓ Server found on port {test_port}")
                test_server(test_url)
                break
        except:
            if test_port == ports_to_try[-1]:
                print(f"✗ No server found on ports: {ports_to_try}")
                print("\nPlease start the server first:")
                print("  Windows: run.bat")
                print("  Mac/Linux: ./run.sh")
            continue

if __name__ == "__main__":
    main()