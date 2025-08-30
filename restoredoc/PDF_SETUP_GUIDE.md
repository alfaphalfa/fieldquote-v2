# PDF Report Generation Setup Guide

## Overview
Professional PDF report generation for RestoreDoc using React PDF renderer.

## Installation Complete ✅
The following packages have been installed:
- `@react-pdf/renderer` - Core PDF generation library
- `@react-pdf/font` - Font management for PDFs

## Components Created

### 1. EstimateReport Component (`/components/pdf/EstimateReport.tsx`)
Professional multi-page PDF layout including:
- Company header with Major Restoration Services branding
- Job information section
- IICRC-compliant damage assessment summary
- Detailed line items table with subtotals
- Equipment list page
- Photo documentation page (4-6 photos per page)
- Terms & conditions with insurance disclaimers
- 30-day validity notice

### 2. PDFViewer Component (`/components/pdf/PDFViewer.tsx`)
Interactive PDF management with:
- Generate PDF button
- Download PDF locally
- Email to customer with modal
- Copy shareable link
- Upload to Supabase storage

### 3. Estimate View Page (`/app/estimates/[id]/view/page.tsx`)
Read-only estimate display with:
- Customer information
- Damage assessment details
- Line items breakdown
- PDF generation controls
- Status tracking
- Photo gallery

### 4. Estimate Edit Page (`/app/estimates/[id]/edit/page.tsx`)
Full editing capabilities:
- Quick adjustment controls (labor rate, equipment days, markup)
- Inline quantity/price editing
- Add/remove line items
- Real-time total calculation
- Save changes to database

### 5. Test Page (`/app/test-pdf/page.tsx`)
Testing interface with sample data for:
- Water damage estimates
- Fire damage estimates
- Mold remediation estimates

## Testing the PDF Generation

1. **Start the development server:**
   ```bash
   cd restoredoc
   npm run dev
   ```

2. **Navigate to test page:**
   ```
   http://localhost:3000/test-pdf
   ```

3. **Test each damage type:**
   - Click Water, Fire, or Mold buttons
   - Click "Show PDF Viewer" to preview
   - Click "Download PDF" to save locally

## Email Configuration

To enable email functionality, choose one of these options:

### Option 1: Resend (Recommended)
```bash
npm install resend
```

Add to `.env.local`:
```
RESEND_API_KEY=your_api_key_here
```

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```
SENDGRID_API_KEY=your_api_key_here
```

### Option 3: Custom SMTP
```bash
npm install nodemailer
```

Add to `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Supabase Storage Setup

1. **Create storage bucket:**
   - Go to Supabase Dashboard → Storage
   - Create bucket named "estimates"
   - Set to Public

2. **Update RLS policies:**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload estimates"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'estimates');

   -- Allow public read access
   CREATE POLICY "Public can view estimates"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'estimates');
   ```

## Customization

### Company Branding
Edit in `/components/pdf/EstimateReport.tsx`:
```typescript
// Line 97-102
<Text style={styles.companyName}>Major Restoration Services</Text>
<Text style={styles.companyInfo}>24/7 Emergency Response</Text>
<Text style={styles.companyInfo}>License #RES2024PA</Text>
```

### Colors
Modify the color scheme:
```typescript
// Primary color (blue)
backgroundColor: '#1e40af'
// Secondary color (purple gradient)
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

### Terms & Conditions
Update in `/components/pdf/EstimateReport.tsx`:
```typescript
// Line 425-435
<Text style={styles.termsList}>
  1. This estimate is based on visible damage only...
  // Add your custom terms
</Text>
```

## Professional Styling Applied

✅ **Major Restoration branding colors** (blue/gray)
✅ **IICRC standards** referenced (S500, S700, S520)
✅ **Insurance disclaimers** included
✅ **30-day validity notice** prominent
✅ **Professional table formatting** with alternating rows
✅ **Signature lines** for approval
✅ **Page numbers** on all pages

## Troubleshooting

### Issue: PDF not generating
- Check console for errors
- Ensure all required data fields are present
- Verify Supabase storage bucket exists

### Issue: Fonts not loading
- Custom fonts require hosting
- Use system fonts as fallback
- Consider using base64 embedded fonts

### Issue: Email not sending
- Verify API keys in `.env.local`
- Check email service configuration
- Test with console.log first

## Production Checklist

Before deploying to production:

- [ ] Configure email service (Resend/SendGrid/SMTP)
- [ ] Set up Supabase storage bucket
- [ ] Update company information
- [ ] Customize terms & conditions
- [ ] Add company logo image
- [ ] Test all damage types
- [ ] Verify PDF formatting on different devices
- [ ] Test email delivery
- [ ] Configure proper error handling
- [ ] Add logging for troubleshooting

## Next Steps

1. **Add company logo:**
   - Upload logo to `/public/logo.png`
   - Update EstimateReport component

2. **Implement email service:**
   - Choose provider (Resend recommended)
   - Update `/app/api/estimates/email/route.ts`

3. **Add more customization:**
   - Custom fonts
   - Additional photo pages
   - QR codes for digital signatures
   - Insurance carrier specific formats

## Support

For issues or questions:
- Check React PDF docs: https://react-pdf.org/
- Supabase docs: https://supabase.com/docs
- Create issue in repository