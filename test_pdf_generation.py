import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import requests
import json
import base64
from datetime import datetime

# Test PDF generation endpoint
def test_pdf_generation():
    url = "http://localhost:5000/api/generate-pdf"
    
    # Create sample estimate data
    estimate_data = {
        "customer_name": "John Smith",
        "customer_address": "123 Main Street, Lancaster, PA 17601",
        "date": datetime.now().strftime("%m/%d/%Y"),
        "job_number": f"EST-{datetime.now().strftime('%Y%m%d%H%M')}",
        "assessment": {
            "damage_type": "water",
            "classification": {
                "category": "2",
                "class": "3"
            },
            "affected_area": 650,
            "severity": "moderate"
        },
        "line_items": [
            {
                "description": "Water extraction",
                "quantity": 650,
                "unit_price": 1.50
            },
            {
                "description": "Antimicrobial treatment",
                "quantity": 650,
                "unit_price": 0.75
            },
            {
                "description": "Drying equipment setup",
                "quantity": 4,
                "unit_price": 125.00
            },
            {
                "description": "Dehumidifier rental (3 days)",
                "quantity": 3,
                "unit_price": 85.00
            },
            {
                "description": "Air mover rental (3 days)",
                "quantity": 3,
                "unit_price": 45.00
            }
        ],
        "markup": 10,
        "equipment": [
            {
                "name": "Dehumidifier",
                "quantity": 2,
                "days": 3,
                "daily_rate": 85.00
            },
            {
                "name": "Air Mover",
                "quantity": 6,
                "days": 3,
                "daily_rate": 45.00
            }
        ],
        "photos": []  # No photos for this test
    }
    
    # Send request
    response = requests.post(url, json=estimate_data)
    
    if response.status_code == 200:
        result = response.json()
        if result.get("success"):
            print(f"✓ PDF generated successfully!")
            print(f"  Filename: {result.get('filename')}")
            print(f"  Filepath: {result.get('filepath')}")
            
            # Save PDF locally for verification
            if result.get("pdf_data"):
                # Extract base64 data
                pdf_base64 = result["pdf_data"].split(",")[1] if "," in result["pdf_data"] else result["pdf_data"]
                pdf_bytes = base64.b64decode(pdf_base64)
                
                # Save to file
                test_filename = f"test_water_damage_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                with open(test_filename, "wb") as f:
                    f.write(pdf_bytes)
                print(f"  PDF saved locally as: {test_filename}")
                print(f"\n✓ Open {test_filename} to verify the PDF looks professional")
            
            return True
        else:
            print(f"✗ PDF generation failed: {result.get('message')}")
            return False
    else:
        print(f"✗ Request failed with status {response.status_code}")
        print(f"  Response: {response.text}")
        return False

if __name__ == "__main__":
    print("Testing PDF Generation...")
    print("-" * 40)
    
    # Test water damage estimate
    if test_pdf_generation():
        print("\n" + "=" * 40)
        print("TEST PASSED: PDF generation is working!")
        print("=" * 40)
    else:
        print("\n" + "=" * 40)
        print("TEST FAILED: Check the error messages above")
        print("=" * 40)