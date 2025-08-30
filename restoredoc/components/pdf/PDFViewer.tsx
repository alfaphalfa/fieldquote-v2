'use client';

import React, { useState } from 'react';
import { PDFDownloadLink, BlobProvider, pdf } from '@react-pdf/renderer';
import EstimateReport from './EstimateReport';
import { Button } from '@/components/ui/button';
import { Download, Mail, Share2, Eye, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PDFViewerProps {
  estimateData: any;
  estimateId: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ estimateData, estimateId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState(
    `Dear ${estimateData.customer.name},\n\nPlease find attached the restoration estimate for your property at ${estimateData.customer.address}.\n\nWe are ready to begin work as soon as you approve this estimate. If you have any questions, please don't hesitate to contact us.\n\nBest regards,\nMajor Restoration Services`
  );
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  // Format estimate data for PDF
  const formatDataForPDF = () => {
    return {
      jobNumber: `MRS-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      customer: estimateData.customer,
      damageType: estimateData.damageType,
      assessment: {
        category: estimateData.assessment?.category || 'Category 2',
        class: estimateData.assessment?.class || 'Class 2',
        level: estimateData.assessment?.level || 'Level 2',
        squareFootage: estimateData.assessment?.squareFootage || 500,
        severity: estimateData.assessment?.severity || 'Moderate',
        iicrcClassification: estimateData.assessment?.iicrcClassification,
      },
      lineItems: estimateData.lineItems || [],
      equipment: estimateData.equipment,
      subtotal: estimateData.subtotal || estimateData.originalTotal,
      markup: estimateData.markupPercent || 0,
      total: estimateData.total || estimateData.adjustedTotal,
      photos: estimateData.photos,
      notes: estimateData.notes,
    };
  };

  // Generate and upload PDF to Supabase
  const generateAndUploadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdfData = formatDataForPDF();
      const doc = <EstimateReport data={pdfData} />;
      
      // Generate PDF blob
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      
      // Upload to Supabase Storage
      const fileName = `estimate_${estimateId}_${Date.now()}.pdf`;
      const { data, error } = await supabase.storage
        .from('estimates')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('estimates')
        .getPublicUrl(fileName);

      setPdfUrl(publicUrl);

      // Update estimate record with PDF URL
      await supabase
        .from('estimates')
        .update({ pdf_url: publicUrl })
        .eq('id', estimateId);

      return publicUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open PDF in new tab
  const handleViewPDF = async () => {
    const url = pdfUrl || (await generateAndUploadPDF());
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Copy share link
  const handleCopyShareLink = async () => {
    const url = pdfUrl || (await generateAndUploadPDF());
    if (url) {
      const shareUrl = `${window.location.origin}/estimates/${estimateId}/view`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  // Send email with PDF
  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const url = pdfUrl || (await generateAndUploadPDF());
      if (!url) throw new Error('Failed to generate PDF');

      // Send email via API
      const response = await fetch('/api/estimates/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Restoration Estimate - ${estimateData.customer.address}`,
          message: emailMessage,
          pdfUrl: url,
          estimateId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      alert('Email sent successfully!');
      setShowEmailModal(false);
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const pdfData = formatDataForPDF();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Generate PDF Button */}
        <Button
          onClick={handleViewPDF}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              View PDF
            </>
          )}
        </Button>

        {/* Download PDF Button */}
        <BlobProvider document={<EstimateReport data={pdfData} />}>
          {({ blob, url, loading }) => (
            <Button
              disabled={loading}
              onClick={() => {
                if (url) {
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `estimate_${estimateData.customer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                  link.click();
                }
              }}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          )}
        </BlobProvider>

        {/* Email to Customer Button */}
        <Button
          onClick={() => setShowEmailModal(true)}
          variant="outline"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email to Customer
        </Button>

        {/* Copy Share Link Button */}
        <Button
          onClick={handleCopyShareLink}
          variant="outline"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Copy Share Link
        </Button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Email Estimate to Customer</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={estimateData.customer.email || 'customer@email.com'}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowEmailModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending || !email}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Email'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;