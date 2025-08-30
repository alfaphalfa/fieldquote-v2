# RestoreDoc - AI-Powered Restoration Estimation Platform

## Overview
RestoreDoc is a Next.js application designed for restoration contractors to create AI-powered damage estimates from photos. Built specifically for Major Restoration Services in York, PA, this platform streamlines the estimation process for water, fire, and mold damage restoration projects.

## Core Features
- **AI Photo Analysis**: Uses OpenAI Vision API to analyze damage photos
- **Three Damage Types**: Water, Fire, and Mold damage assessment
- **Insurance-Compliant Reports**: Generates professional PDF reports that meet insurance requirements
- **Real-time Estimation**: Instant damage assessment and cost calculation
- **Multi-photo Support**: Analyze multiple photos per project
- **Client Management**: Track estimates by property and client

## Tech Stack
- **Frontend**: Next.js 15.5 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI Vision API for damage analysis
- **PDF Generation**: React-PDF for report creation
- **Authentication**: Supabase Auth with SSR support

## Project Structure
```
/app
  /dashboard     - Main contractor dashboard
  /estimates     - Estimate creation and management
  /auth         - Authentication flows
/components
  /ui           - shadcn/ui components
  /estimates    - Estimate-specific components
  /photos       - Photo upload and analysis
  /reports      - PDF report generation
/lib
  - Utilities and helpers
  - Supabase client configuration
  - API integrations
/types
  - TypeScript type definitions
/hooks
  - Custom React hooks
```

## Business Context

### Target User
**Major Restoration Services**
- Location: York, PA
- Services: Water, Fire, and Mold damage restoration
- Needs: Fast, accurate estimates for insurance claims

### Pricing Guidelines (York, PA Regional)
**Water Damage**:
- Category 1 (Clean): $3.00-4.00/sq ft
- Category 2 (Gray): $4.50-5.50/sq ft
- Category 3 (Black): $7.00-9.00/sq ft

**Fire Damage**:
- Light Smoke: $3.00-5.00/sq ft
- Heavy Smoke: $6.00-10.00/sq ft
- Structural: $25.00-50.00/sq ft

**Mold Remediation**:
- Level 1 (<10 sq ft): $500-1,500
- Level 2 (10-30 sq ft): $1,500-3,000
- Level 3 (30-100 sq ft): $3,000-8,000
- Level 4 (>100 sq ft): $8,000-20,000+

## IICRC Standards Compliance
The app follows industry standards:
- **S500**: Water damage restoration
- **S520**: Mold remediation
- **S700**: Fire and smoke restoration

## Key Features to Implement

### 1. Photo Analysis Pipeline
- Upload photos via drag-and-drop
- Send to OpenAI Vision API
- Parse damage assessment response
- Calculate affected area and severity

### 2. Estimate Generation
- Apply regional pricing matrices
- Include equipment costs (dehumidifiers, air scrubbers)
- Calculate labor hours
- Add material costs

### 3. Report Generation
- Company branding header
- Photo documentation
- Detailed line-item breakdown
- Scope of work description
- Terms and conditions

### 4. Database Schema (Supabase)
```sql
-- Core tables needed:
- users (contractors)
- projects (restoration jobs)
- estimates
- photos
- line_items
- clients
- templates (estimate templates)
```

## API Integration Points

### OpenAI Vision API
- Analyze damage type and severity
- Estimate affected square footage
- Identify required restoration steps
- Detect safety hazards

### Supabase
- User authentication
- File storage for photos
- Database for estimates
- Real-time updates

## Development Guidelines

### Code Standards
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Implement proper error handling
- Use React Server Components where possible
- Optimize images with Next.js Image component

### UI/UX Principles
- Mobile-responsive design
- Fast load times (target < 2s)
- Intuitive photo upload
- Clear estimate presentation
- Professional report output

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anonymous key
OPENAI_API_KEY=                 # OpenAI API key for Vision
```

## Security Considerations
- Secure photo storage in Supabase
- Row Level Security (RLS) policies
- API key protection
- Input validation
- XSS prevention

## Performance Targets
- Photo upload: < 3 seconds
- AI analysis: < 5 seconds
- PDF generation: < 2 seconds
- Dashboard load: < 1 second

## Future Enhancements
- Mobile app version
- Xactimate integration
- Customer portal
- Team collaboration features
- Advanced reporting analytics
- Automated follow-ups
- Integration with QuickBooks