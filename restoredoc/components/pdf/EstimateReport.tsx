import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register fonts for professional appearance
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/fonts/helvetica.ttf', fontWeight: 'normal' },
    { src: '/fonts/helvetica-bold.ttf', fontWeight: 'bold' },
  ],
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '2px solid #1e40af',
    paddingBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
    color: '#4b5563',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoBox: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  infoLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 'bold',
  },
  assessmentBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #1e40af',
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
  },
  assessmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  assessmentItem: {
    flex: 1,
    minWidth: '30%',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  descriptionCell: {
    flex: 3,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  unitCell: {
    flex: 1,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalCell: {
    flex: 1,
    textAlign: 'right',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTop: '1px solid #6b7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  photoContainer: {
    width: '48%',
    marginBottom: 10,
  },
  photo: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderRadius: 4,
  },
  photoCaption: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 9,
    color: '#6b7280',
  },
  termsSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsList: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#991b1b',
    fontStyle: 'italic',
  },
  validityNotice: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    textAlign: 'center',
  },
  validityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
  },
});

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  category?: string;
}

interface EstimateData {
  jobNumber: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  damageType: 'water' | 'fire' | 'mold';
  assessment: {
    category?: string;
    class?: string;
    level?: string;
    squareFootage: number;
    severity: string;
    iicrcClassification?: string;
  };
  lineItems: LineItem[];
  equipment?: Array<{
    name: string;
    quantity: number;
    days: number;
    dailyRate: number;
  }>;
  subtotal: number;
  markup: number;
  total: number;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  notes?: string;
}

interface EstimateReportProps {
  data: EstimateData;
}

const EstimateReport: React.FC<EstimateReportProps> = ({ data }) => {
  const getDamageTypeLabel = (type: string) => {
    switch (type) {
      case 'water':
        return 'Water Damage Restoration';
      case 'fire':
        return 'Fire & Smoke Restoration';
      case 'mold':
        return 'Mold Remediation';
      default:
        return 'Damage Restoration';
    }
  };

  const getIICRCStandard = (type: string) => {
    switch (type) {
      case 'water':
        return 'IICRC S500';
      case 'fire':
        return 'IICRC S700';
      case 'mold':
        return 'IICRC S520';
      default:
        return 'IICRC Standards';
    }
  };

  return (
    <Document>
      {/* Page 1: Main Estimate */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Major Restoration Services</Text>
            <Text style={styles.companyInfo}>24/7 Emergency Response</Text>
            <Text style={styles.companyInfo}>License #RES2024PA</Text>
            <Text style={styles.companyInfo}>Insurance: GL2M/WC1M</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>100 Main Street</Text>
            <Text>York, PA 17401</Text>
            <Text>(717) 555-0100</Text>
            <Text>info@majorrestoration.com</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>RESTORATION ESTIMATE</Text>

        {/* Job Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>JOB NUMBER</Text>
              <Text style={styles.infoValue}>{data.jobNumber}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>DATE</Text>
              <Text style={styles.infoValue}>{data.date}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>CUSTOMER</Text>
              <Text style={styles.infoValue}>{data.customer.name}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>PROPERTY ADDRESS</Text>
              <Text style={styles.infoValue}>
                {data.customer.address}, {data.customer.city}, {data.customer.state} {data.customer.zip}
              </Text>
            </View>
          </View>
        </View>

        {/* Damage Assessment */}
        <View style={styles.assessmentBox}>
          <Text style={styles.assessmentTitle}>
            {getDamageTypeLabel(data.damageType)} Assessment
          </Text>
          <View style={styles.assessmentGrid}>
            <View style={styles.assessmentItem}>
              <Text style={styles.infoLabel}>TYPE</Text>
              <Text style={styles.infoValue}>{getDamageTypeLabel(data.damageType)}</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.infoLabel}>AFFECTED AREA</Text>
              <Text style={styles.infoValue}>{data.assessment.squareFootage} sq ft</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.infoLabel}>STANDARD</Text>
              <Text style={styles.infoValue}>{getIICRCStandard(data.damageType)}</Text>
            </View>
            {data.assessment.category && (
              <View style={styles.assessmentItem}>
                <Text style={styles.infoLabel}>CATEGORY</Text>
                <Text style={styles.infoValue}>{data.assessment.category}</Text>
              </View>
            )}
            {data.assessment.class && (
              <View style={styles.assessmentItem}>
                <Text style={styles.infoLabel}>CLASS</Text>
                <Text style={styles.infoValue}>{data.assessment.class}</Text>
              </View>
            )}
            {data.assessment.level && (
              <View style={styles.assessmentItem}>
                <Text style={styles.infoLabel}>LEVEL</Text>
                <Text style={styles.infoValue}>{data.assessment.level}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Estimate Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Estimate</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>Description</Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>Qty</Text>
              <Text style={[styles.tableCell, styles.unitCell]}>Unit</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>Price</Text>
              <Text style={[styles.tableCell, styles.totalCell]}>Total</Text>
            </View>

            {/* Table Rows */}
            {data.lineItems.map((item, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <Text style={[styles.tableCell, styles.descriptionCell]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, styles.quantityCell]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.unitCell]}>{item.unit}</Text>
                <Text style={[styles.tableCell, styles.priceCell]}>
                  ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, styles.totalCell]}>
                  ${item.total.toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Subtotal */}
            <View style={styles.subtotalRow}>
              <Text style={{ marginRight: 20 }}>Subtotal:</Text>
              <Text>${data.subtotal.toFixed(2)}</Text>
            </View>

            {/* Markup if applicable */}
            {data.markup > 0 && (
              <View style={styles.subtotalRow}>
                <Text style={{ marginRight: 20 }}>Markup ({data.markup}%):</Text>
                <Text>${((data.subtotal * data.markup) / 100).toFixed(2)}</Text>
              </View>
            )}

            {/* Grand Total */}
            <View style={styles.totalRow}>
              <Text style={{ marginRight: 20 }}>TOTAL:</Text>
              <Text>${data.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Validity Notice */}
        <View style={styles.validityNotice}>
          <Text style={styles.validityText}>This estimate is valid for 30 days from the date above</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>

      {/* Page 2: Equipment List (if applicable) */}
      {data.equipment && data.equipment.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment List</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.descriptionCell]}>Equipment</Text>
                <Text style={[styles.tableCell, styles.quantityCell]}>Qty</Text>
                <Text style={[styles.tableCell, styles.unitCell]}>Days</Text>
                <Text style={[styles.tableCell, styles.priceCell]}>Daily Rate</Text>
                <Text style={[styles.tableCell, styles.totalCell]}>Total</Text>
              </View>
              {data.equipment.map((item, index) => (
                <View
                  key={index}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, styles.descriptionCell]}>{item.name}</Text>
                  <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
                  <Text style={[styles.tableCell, styles.unitCell]}>{item.days}</Text>
                  <Text style={[styles.tableCell, styles.priceCell]}>
                    ${item.dailyRate.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.totalCell]}>
                    ${(item.quantity * item.days * item.dailyRate).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Page Number */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </Page>
      )}

      {/* Page 3: Photo Documentation */}
      {data.photos && data.photos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Documentation</Text>
            <View style={styles.photoGrid}>
              {data.photos.slice(0, 6).map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image style={styles.photo} src={photo.url} />
                  {photo.caption && (
                    <Text style={styles.photoCaption}>{photo.caption}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Page Number */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </Page>
      )}

      {/* Last Page: Terms & Conditions */}
      <Page size="A4" style={styles.page}>
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsList}>
            1. This estimate is based on visible damage only. Additional damage may be discovered during restoration.
            {'\n'}
            2. Payment is due upon completion unless prior arrangements have been made.
            {'\n'}
            3. Insurance: We will work directly with your insurance company.
            {'\n'}
            4. Warranty: All work is guaranteed for one year from completion date.
            {'\n'}
            5. Change Orders: Any changes to the scope of work will be documented and approved in writing.
            {'\n'}
            6. Emergency Services: Emergency mitigation services will begin immediately to prevent further damage.
            {'\n'}
            7. Personal Property: We are not responsible for personal property unless specifically included in the estimate.
            {'\n'}
            8. Access: Customer agrees to provide necessary access to the property for completion of work.
          </Text>
        </View>

        {/* Insurance Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            IMPORTANT: This estimate is prepared for insurance claim purposes. Final costs may vary based on 
            insurance adjuster assessment and approval. We will work directly with your insurance company to ensure 
            proper coverage of all necessary restoration work in accordance with your policy.
          </Text>
        </View>

        {/* Notes Section */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={{ fontSize: 10, color: '#4b5563' }}>{data.notes}</Text>
          </View>
        )}

        {/* Signature Lines */}
        <View style={{ marginTop: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '45%' }}>
              <Text style={{ borderTop: '1px solid #000', paddingTop: 5, fontSize: 10 }}>
                Customer Signature
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
                Date: _________________
              </Text>
            </View>
            <View style={{ width: '45%' }}>
              <Text style={{ borderTop: '1px solid #000', paddingTop: 5, fontSize: 10 }}>
                Estimator Signature
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
                Date: _________________
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Major Restoration Services | Licensed & Insured | 24/7 Emergency Response</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

export default EstimateReport;