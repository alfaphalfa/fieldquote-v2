# RestoreDoc - AI-Powered Restoration Estimation Platform

RestoreDoc is an intelligent damage assessment and restoration estimation platform that leverages AI vision technology to analyze property damage photos and generate professional estimates following IICRC standards.

## Features

- **AI-Powered Damage Analysis**: Upload photos and get instant damage assessments using OpenAI's Vision API
- **Multi-Damage Type Support**: 
  - Water damage (IICRC S500 compliant)
  - Fire/smoke damage (IICRC S700 compliant)
  - Mold remediation (IICRC S520 compliant)
- **Professional PDF Estimates**: Generate detailed, itemized estimates with line items and pricing
- **Real-time Analysis**: Get immediate feedback on damage severity, affected areas, and required equipment
- **Industry Standards Compliance**: All assessments follow IICRC restoration standards

## Technology Stack

- **Backend**: Flask (Python 3.8+)
- **AI Integration**: OpenAI GPT-4 Vision API
- **PDF Generation**: ReportLab
- **Database**: Supabase (optional)
- **Deployment**: Render (with MCP support)

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- OpenAI API key (for AI analysis)
- Supabase credentials (optional, for data persistence)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restoredoc.git
   cd restoredoc
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Server Configuration
   PORT=5000
   FLASK_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
   ```

5. **Run the application**
   ```bash
   python app.py
   ```
   
   The server will start at `http://localhost:5000`

### Quick Start Scripts

- **Windows**: `run.bat` or `run.ps1`
- **Mac/Linux**: `run.sh`

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status and configuration state.

### Test Connection
```
GET /test-connection
```
Detailed connection test with server information, configuration status, and available routes.

### Analyze Damage
```
POST /api/analyze-damage
Content-Type: multipart/form-data

Parameters:
- damage_type: string (water|fire|mold)
- photos: file[] (image files)

Response:
{
  "success": true,
  "analysis": {
    "damage_type": "water",
    "severity": "moderate",
    "affected_area_sqft": 650,
    "total_estimate": 2352.50,
    "line_items": [...],
    "equipment_needed": [...],
    // Additional fields based on damage type
  }
}
```

### Mock Analysis (Testing)
```
POST /api/mock-analyze

Parameters:
- damage_type: string (water|fire|mold)

Response: Mock analysis data for testing without API calls
```

### Generate PDF
```
POST /api/generate-pdf
Content-Type: application/json

Body:
{
  "customer_name": "John Doe",
  "property_address": "123 Main St",
  "damage_type": "water",
  "line_items": [...],
  "total_estimate": 2352.50
}

Response:
{
  "success": true,
  "filename": "estimate_john_doe_20240101_120000.pdf",
  "pdf_data": "data:application/pdf;base64,..."
}
```

### Download PDF
```
GET /api/download-pdf/<filename>
```
Downloads a previously generated PDF estimate.

## Deployment on Render

### Automatic Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

3. **Configure Environment Variables**
   
   In Render Dashboard, add:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUPABASE_URL`: Your Supabase project URL (optional)
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key (optional)
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

4. **Deploy**
   
   Render will automatically:
   - Install dependencies from `requirements.txt`
   - Start the Gunicorn server
   - Bind to the correct port
   - Handle SSL/HTTPS

### Manual Deployment

If you prefer manual configuration:

1. Create a new Web Service on Render
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
4. Add environment variables as above

## MCP Integration (Future Enhancement)

Render's Model Context Protocol (MCP) support opens possibilities for enhanced database operations and AI model management:

### Potential MCP Integrations

1. **Database Operations**
   - Direct Supabase integration through MCP
   - Real-time data synchronization
   - Automated backup and recovery

2. **AI Model Management**
   - Model versioning and rollback
   - A/B testing different AI models
   - Performance monitoring and optimization

3. **Enhanced Analytics**
   - Usage tracking and reporting
   - Cost optimization insights
   - Customer behavior analysis

To enable MCP features when available:
```python
# Future implementation in app.py
from render_mcp import MCPClient

mcp = MCPClient()
mcp.connect_database('supabase')
mcp.enable_analytics()
```

## Testing

### Run Tests
```bash
# Run all tests
pytest

# Test specific damage types
python test_all_damage_types.py

# Test PDF generation
python test_pdf_generation.py

# Test server endpoints
python test_server.py
```

### Test Coverage
```bash
pytest --cov=app --cov-report=html
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - The app automatically tries alternative ports (8000, 8080, 8888, 5001, 5555, 3000)
   - Or manually specify: `PORT=8080 python app.py`

2. **OpenAI API Errors**
   - Verify your API key is correct
   - Check API rate limits and quotas
   - Use `/api/mock-analyze` for testing without API calls

3. **CORS Issues**
   - Update `ALLOWED_ORIGINS` in `.env`
   - For development, use `ALLOWED_ORIGINS=*`

4. **PDF Generation Failures**
   - Ensure ReportLab is installed: `pip install reportlab`
   - Check write permissions for `generated_pdfs/` directory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or support:
- Create an issue on GitHub
- Contact: support@restoredoc.com

## Acknowledgments

- IICRC for restoration industry standards
- OpenAI for Vision API capabilities
- Render for deployment platform with MCP support