import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// You can use various email services here:
// - SendGrid: npm install @sendgrid/mail
// - Resend: npm install resend
// - Nodemailer: npm install nodemailer
// For this example, I'll show structure with Resend (most modern option)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message, pdfUrl, estimateId } = body;

    // Validate input
    if (!to || !subject || !message || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get estimate details from database
    const supabase = createClient();
    const { data: estimate } = await supabase
      .from('estimates')
      .select('*, jobs(*)')
      .eq('id', estimateId)
      .single();

    // Option 1: Using Resend (recommended for modern apps)
    // First install: npm install resend
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'Major Restoration <noreply@majorrestoration.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Major Restoration Services</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p style="white-space: pre-wrap;">${message}</p>
            <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px;">
              <h2 style="color: #1e40af;">Estimate Summary</h2>
              <p><strong>Property:</strong> ${estimate?.jobs?.address}</p>
              <p><strong>Damage Type:</strong> ${estimate?.jobs?.damage_type}</p>
              <p><strong>Total:</strong> $${estimate?.adjusted_total?.toFixed(2)}</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${pdfUrl}" 
                 style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View PDF Estimate
              </a>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Major Restoration Services | 24/7 Emergency Response</p>
            <p>100 Main Street, York, PA 17401 | (717) 555-0100</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `estimate_${estimateId}.pdf`,
          path: pdfUrl,
        },
      ],
    });
    */

    // Option 2: Using SendGrid
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    
    const msg = {
      to: to,
      from: 'noreply@majorrestoration.com',
      subject: subject,
      text: message,
      html: `<html body here>`,
      attachments: [
        {
          content: pdfBase64, // You'd need to fetch and convert PDF to base64
          filename: `estimate_${estimateId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };
    
    await sgMail.send(msg);
    */

    // Option 3: Using Nodemailer (for custom SMTP)
    /*
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.sendMail({
      from: '"Major Restoration" <noreply@majorrestoration.com>',
      to: to,
      subject: subject,
      text: message,
      html: `<html body here>`,
      attachments: [
        {
          filename: `estimate_${estimateId}.pdf`,
          path: pdfUrl,
        },
      ],
    });
    */

    // For demo purposes, we'll simulate success
    // In production, uncomment one of the above options
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('PDF URL:', pdfUrl);

    // Log email activity
    await supabase
      .from('email_logs')
      .insert({
        estimate_id: estimateId,
        recipient: to,
        subject: subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}