from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from datetime import datetime
import io
import base64
from PIL import Image as PILImage
import os

class PDFGenerator:
    def __init__(self):
        self.primary_color = colors.HexColor('#1e40af')  # Major's blue
        self.secondary_color = colors.HexColor('#6b7280')  # Gray
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the PDF"""
        self.styles.add(ParagraphStyle(
            name='CompanyHeader',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.primary_color,
            alignment=TA_CENTER,
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompanySubheader',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.secondary_color,
            alignment=TA_CENTER,
            spaceAfter=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.primary_color,
            spaceBefore=12,
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='InfoLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.secondary_color,
            alignment=TA_RIGHT
        ))
        
        self.styles.add(ParagraphStyle(
            name='InfoValue',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.black
        ))
        
        self.styles.add(ParagraphStyle(
            name='FooterText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=self.secondary_color,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='Badge',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=self.primary_color,
            alignment=TA_CENTER,
            borderColor=self.primary_color,
            borderWidth=1,
            borderPadding=3
        ))

    def _draw_header_footer(self, canvas, doc):
        """Draw header and footer on each page"""
        canvas.saveState()
        
        # Footer
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(self.secondary_color)
        footer_y = 0.5 * inch
        
        # Page number
        page_num = canvas.getPageNumber()
        canvas.drawCentredString(letter[0] / 2, footer_y, f"Page {page_num}")
        
        # Footer text
        canvas.drawString(inch, footer_y + 15, "24/7 Emergency Response | Insurance Approved | Certified IICRC Technicians")
        canvas.drawString(inch, footer_y, "Estimate valid for 30 days | All work compliant with insurance requirements")
        
        canvas.restoreState()

    def generate_estimate_pdf(self, estimate_data):
        """Generate a professional PDF estimate"""
        buffer = io.BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            topMargin=0.75*inch,
            bottomMargin=inch,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Company Header
        elements.append(Paragraph("<b>MAJOR RESTORATION SERVICES</b>", self.styles['CompanyHeader']))
        elements.append(Paragraph("Professional Restoration & Remediation", self.styles['CompanySubheader']))
        elements.append(Paragraph("717-855-2367 | 24/7 Emergency Response", self.styles['CompanySubheader']))
        elements.append(Spacer(1, 0.25*inch))
        
        # IICRC Compliance Badge
        elements.append(Paragraph("IICRC S500/S520/S700 COMPLIANT", self.styles['Badge']))
        elements.append(Spacer(1, 0.25*inch))
        
        # Job Information Box
        job_info_data = []
        job_info_data.append([
            Paragraph("<b>ESTIMATE</b>", self.styles['SectionHeader']),
            '',
            Paragraph(f"<b>Date:</b> {estimate_data.get('date', datetime.now().strftime('%m/%d/%Y'))}", self.styles['InfoValue'])
        ])
        job_info_data.append([
            Paragraph(f"<b>Customer:</b> {estimate_data.get('customer_name', 'N/A')}", self.styles['InfoValue']),
            '',
            Paragraph(f"<b>Job #:</b> {estimate_data.get('job_number', 'EST-' + datetime.now().strftime('%Y%m%d%H%M'))}", self.styles['InfoValue'])
        ])
        job_info_data.append([
            Paragraph(f"<b>Address:</b> {estimate_data.get('customer_address', 'N/A')}", self.styles['InfoValue']),
            '',
            ''
        ])
        
        job_info_table = Table(job_info_data, colWidths=[3*inch, 1*inch, 2.5*inch])
        job_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('BOX', (0, 0), (-1, -1), 1, self.secondary_color),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(job_info_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Damage Assessment Summary
        if estimate_data.get('assessment'):
            elements.append(Paragraph("<b>DAMAGE ASSESSMENT</b>", self.styles['SectionHeader']))
            
            assessment = estimate_data['assessment']
            assessment_data = []
            
            # Damage type and classification
            damage_type = assessment.get('damage_type', 'N/A')
            classification = assessment.get('classification', {})
            
            assessment_data.append(['Damage Type:', damage_type.upper()])
            
            if damage_type == 'water':
                assessment_data.append(['IICRC Category:', f"Category {classification.get('category', 'N/A')}"])
                assessment_data.append(['IICRC Class:', f"Class {classification.get('class', 'N/A')}"])
            elif damage_type == 'fire':
                assessment_data.append(['Damage Level:', classification.get('damage_level', 'N/A')])
                assessment_data.append(['Smoke Type:', classification.get('smoke_type', 'N/A')])
            elif damage_type == 'mold':
                assessment_data.append(['Condition Level:', f"Condition {classification.get('condition', 'N/A')}"])
                assessment_data.append(['Contamination:', classification.get('contamination_level', 'N/A')])
            
            assessment_data.append(['Affected Area:', f"{assessment.get('affected_area', 'N/A')} sq ft"])
            assessment_data.append(['Severity:', assessment.get('severity', 'N/A').upper()])
            
            assessment_table = Table(assessment_data, colWidths=[2*inch, 4.5*inch])
            assessment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (0, -1), self.secondary_color),
                ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
                ('FONT', (1, 0), (1, -1), 'Helvetica', 10),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(assessment_table)
            elements.append(Spacer(1, 0.25*inch))
        
        # Line Items Table
        elements.append(Paragraph("<b>RESTORATION SERVICES</b>", self.styles['SectionHeader']))
        
        # Prepare line items data
        line_items_data = [['Description', 'Quantity', 'Unit Price', 'Total']]
        
        subtotal = 0
        for item in estimate_data.get('line_items', []):
            quantity = float(item.get('quantity', 0))
            unit_price = float(item.get('unit_price', 0))
            total = quantity * unit_price
            subtotal += total
            
            line_items_data.append([
                item.get('description', ''),
                f"{quantity:.1f}" if quantity % 1 else str(int(quantity)),
                f"${unit_price:,.2f}",
                f"${total:,.2f}"
            ])
        
        # Add subtotal, markup, and total
        markup_percent = float(estimate_data.get('markup', 0))
        markup_amount = subtotal * (markup_percent / 100)
        grand_total = subtotal + markup_amount
        
        # Empty row for spacing
        line_items_data.append(['', '', '', ''])
        
        # Subtotal row
        line_items_data.append(['', '', 'Subtotal:', f"${subtotal:,.2f}"])
        
        # Markup row (if applicable)
        if markup_percent > 0:
            line_items_data.append(['', '', f'Markup ({markup_percent}%):', f"${markup_amount:,.2f}"])
        
        # Grand total row
        line_items_data.append(['', '', Paragraph('<b>TOTAL:</b>', self.styles['Normal']), 
                               Paragraph(f'<b>${grand_total:,.2f}</b>', self.styles['Normal'])])
        
        # Create the line items table
        line_items_table = Table(line_items_data, colWidths=[3.5*inch, 1*inch, 1*inch, 1*inch])
        
        # Determine the row indices for styling
        num_items = len(estimate_data.get('line_items', []))
        empty_row_idx = num_items + 2
        subtotal_row_idx = num_items + 3
        markup_row_idx = num_items + 4 if markup_percent > 0 else None
        total_row_idx = num_items + (5 if markup_percent > 0 else 4)
        
        table_style = [
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
            
            # All cells
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
            
            # Grid
            ('GRID', (0, 0), (-1, subtotal_row_idx-1), 0.5, colors.HexColor('#e5e7eb')),
            ('BOX', (0, 0), (-1, -1), 1, self.secondary_color),
            
            # Total section
            ('LINEABOVE', (2, subtotal_row_idx), (-1, subtotal_row_idx), 1, self.secondary_color),
            ('FONT', (2, total_row_idx), (-1, total_row_idx), 'Helvetica-Bold', 11),
            ('BACKGROUND', (2, total_row_idx), (-1, total_row_idx), colors.HexColor('#f3f4f6')),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]
        
        line_items_table.setStyle(TableStyle(table_style))
        elements.append(line_items_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Equipment List
        if estimate_data.get('equipment', []):
            elements.append(Paragraph("<b>EQUIPMENT DEPLOYMENT</b>", self.styles['SectionHeader']))
            
            equipment_data = [['Equipment', 'Quantity', 'Duration', 'Daily Rate', 'Total']]
            
            for equip in estimate_data['equipment']:
                quantity = int(equip.get('quantity', 0))
                days = int(equip.get('days', 0))
                daily_rate = float(equip.get('daily_rate', 0))
                total = quantity * days * daily_rate
                
                equipment_data.append([
                    equip.get('name', ''),
                    str(quantity),
                    f"{days} days",
                    f"${daily_rate:.2f}",
                    f"${total:,.2f}"
                ])
            
            equipment_table = Table(equipment_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            equipment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('BOX', (0, 0), (-1, -1), 1, self.secondary_color),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(equipment_table)
            elements.append(Spacer(1, 0.25*inch))
        
        # Photos Page (if photos are provided)
        if estimate_data.get('photos', []):
            elements.append(PageBreak())
            elements.append(Paragraph("<b>DOCUMENTATION PHOTOS</b>", self.styles['SectionHeader']))
            elements.append(Spacer(1, 0.25*inch))
            
            # Create a 2x3 grid for photos
            photo_data = []
            photo_row = []
            
            for i, photo in enumerate(estimate_data['photos'][:6]):  # Max 6 photos
                try:
                    # Handle base64 image data
                    if photo.get('data', '').startswith('data:image'):
                        # Extract base64 data
                        header, data = photo['data'].split(',', 1)
                        img_data = base64.b64decode(data)
                        img = PILImage.open(io.BytesIO(img_data))
                        
                        # Resize image to fit
                        img.thumbnail((250, 180), PILImage.Resampling.LANCZOS)
                        
                        # Convert to RGB if necessary
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        
                        # Save to buffer
                        img_buffer = io.BytesIO()
                        img.save(img_buffer, format='JPEG', quality=85)
                        img_buffer.seek(0)
                        
                        # Create reportlab Image
                        rl_img = Image(img_buffer, width=2.5*inch, height=1.8*inch)
                        
                        # Create cell with image and caption
                        cell_content = [
                            rl_img,
                            Spacer(1, 0.1*inch),
                            Paragraph(photo.get('caption', f'Photo {i+1}'), self.styles['FooterText'])
                        ]
                        
                        photo_row.append(cell_content)
                        
                        # Add row after 2 photos
                        if len(photo_row) == 2:
                            photo_data.append(photo_row)
                            photo_row = []
                    
                except Exception as e:
                    print(f"Error processing photo {i+1}: {e}")
                    continue
            
            # Add remaining photos
            if photo_row:
                while len(photo_row) < 2:
                    photo_row.append([''])  # Empty cell
                photo_data.append(photo_row)
            
            if photo_data:
                # Create nested tables for photos
                for row in photo_data:
                    row_elements = []
                    for cell in row:
                        if isinstance(cell, list) and cell:
                            cell_table = Table([[c] for c in cell], colWidths=[2.7*inch])
                            cell_table.setStyle(TableStyle([
                                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                            ]))
                            row_elements.append(cell_table)
                        else:
                            row_elements.append('')
                    
                    photo_table = Table([row_elements], colWidths=[3.25*inch, 3.25*inch])
                    photo_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 3),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
                        ('TOPPADDING', (0, 0), (-1, -1), 3),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                    ]))
                    elements.append(photo_table)
                    elements.append(Spacer(1, 0.15*inch))
        
        # Terms and Conditions
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph("<b>TERMS & CONDITIONS</b>", self.styles['SectionHeader']))
        
        terms = [
            "This estimate is valid for 30 days from the date above",
            "All work performed in compliance with IICRC standards and insurance requirements",
            "Payment terms: Net 30 days or as per insurance settlement",
            "Additional charges may apply for hazardous materials or unforeseen conditions",
            "24/7 Emergency Response Available"
        ]
        
        for term in terms:
            elements.append(Paragraph(f"• {term}", self.styles['FooterText']))
            elements.append(Spacer(1, 0.05*inch))
        
        # Build PDF
        doc.build(elements, onFirstPage=self._draw_header_footer, onLaterPages=self._draw_header_footer)
        
        # Get the PDF data
        buffer.seek(0)
        return buffer.getvalue()

    def save_pdf_to_file(self, pdf_data, filename):
        """Save PDF data to a file"""
        os.makedirs('generated_pdfs', exist_ok=True)
        filepath = os.path.join('generated_pdfs', filename)
        
        with open(filepath, 'wb') as f:
            f.write(pdf_data)
        
        return filepath