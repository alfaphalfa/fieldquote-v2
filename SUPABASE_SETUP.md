# Supabase Setup Guide for FieldQuote V2

## Overview
This guide will help you set up Supabase for the FieldQuote editable estimates feature.

## Prerequisites
- Supabase account (free tier is sufficient for development)
- Access to Supabase dashboard

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Enter project details:
   - Name: `fieldquote-v2`
   - Database Password: (choose a strong password)
   - Region: Select closest to your location

## Step 2: Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema.sql`
3. Paste into SQL editor
4. Click **Run** to create all tables and relationships

## Step 3: Configure Storage Bucket

1. Go to **Storage** in the sidebar
2. Click **Create Bucket**
3. Name it: `damage-photos`
4. Set to **Public** (for easy access to photos)
5. Click **Create**

## Step 4: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

## Step 5: Update Your HTML Files

1. Open `index-editable.html`
2. Find these lines (around line 850):
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
3. Replace with your actual values:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...your-actual-key...';
```

## Step 6: Enable Row Level Security (Optional but Recommended)

For production use, you should:
1. Enable Authentication
2. Configure Row Level Security policies
3. Update the RLS policies in the schema to match your auth setup

## Step 7: Test the Integration

1. Open `index-editable.html` in your browser
2. Fill in customer information
3. Select a damage type
4. Generate an estimate
5. Toggle edit mode and make changes
6. Click "Save Estimate to Database"
7. Check Supabase dashboard → **Table Editor** to see saved data

## Using Supabase MCP (Model Context Protocol)

If you're using Claude Desktop with MCP:

1. Install the Supabase MCP server:
```bash
npm install -g @modelcontextprotocol/server-supabase
```

2. Add to your Claude Desktop config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-supabase",
        "--url", "https://YOUR_PROJECT.supabase.co",
        "--key", "YOUR_SERVICE_KEY"
      ]
    }
  }
}
```

3. Use Claude to directly interact with your database:
   - Query data
   - Insert records
   - Update estimates
   - Generate reports

## API Endpoints (for Advanced Integration)

Your Supabase project provides REST APIs automatically:

### Get all jobs:
```
GET https://YOUR_PROJECT.supabase.co/rest/v1/jobs
Headers: 
  apikey: YOUR_ANON_KEY
  Authorization: Bearer YOUR_ANON_KEY
```

### Create new estimate:
```
POST https://YOUR_PROJECT.supabase.co/rest/v1/estimates
Headers: 
  apikey: YOUR_ANON_KEY
  Authorization: Bearer YOUR_ANON_KEY
  Content-Type: application/json
Body: {
  "job_id": "uuid",
  "line_items": {...},
  "original_total": 1500.00,
  "adjusted_total": 1650.00
}
```

## Troubleshooting

### Issue: "Database not configured" error
- Solution: Make sure you've updated the SUPABASE_URL and SUPABASE_ANON_KEY in the HTML file

### Issue: Cannot save estimates
- Check browser console for errors
- Verify your Supabase project is running
- Check that tables were created successfully

### Issue: Photos not uploading
- Ensure `damage-photos` bucket exists and is public
- Check file size (Supabase free tier has limits)

## Next Steps

1. **Authentication**: Add user login/signup
2. **PDF Generation**: Integrate PDF export functionality
3. **Email Notifications**: Send estimates to customers
4. **Dashboard**: Build contractor dashboard for managing estimates
5. **Mobile App**: Create React Native version

## Security Best Practices

1. **Never expose service keys** in frontend code
2. **Enable RLS** for production
3. **Use environment variables** for API keys
4. **Implement proper authentication** before going live
5. **Regular backups** of your database

## Support

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- FieldQuote Issues: Create issue in your repository