import jsPDF from 'jspdf';

interface LegalDocumentData {
  templateId: string;
  templateTitle: string;
  content: string;
  metadata: {
    caseReference: string;
    documentHash: string;
    jurisdiction: string;
    complianceLevel: string;
    generatedDate: string;
    authorizedBy: string;
  };
  customFields: Record<string, string>;
}

interface ComplianceSettings {
  jurisdiction: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  pageSize: [number, number];
  includeWatermark: boolean;
  includeBlockchainHash: boolean;
}

class LegalPDFGenerator {
  private doc: jsPDF;
  private settings: ComplianceSettings;
  private currentPage: number = 1;
  private pageHeight: number = 0;
  private currentY: number = 0;

  constructor(settings?: Partial<ComplianceSettings>) {
    this.settings = {
      jurisdiction: 'US',
      fontFamily: 'times',
      fontSize: 12,
      lineHeight: 1.5,
      margins: {
        top: 72, // 1 inch = 72 points
        bottom: 72,
        left: 72,
        right: 72
      },
      pageSize: [612, 792], // Letter size in points
      includeWatermark: true,
      includeBlockchainHash: true,
      ...settings
    };

    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: this.settings.pageSize
    });

    this.pageHeight = this.settings.pageSize[1];
    this.currentY = this.settings.margins.top;
  }

  public generateLegalDocument(data: LegalDocumentData): Uint8Array {
    this.setupDocument();
    this.addHeader(data);
    this.addContent(data.content);
    this.addFooter(data);
    this.addComplianceInfo(data);
    this.addWatermark();
    
    return this.doc.output('arraybuffer') as Uint8Array;
  }

  private setupDocument(): void {
    this.doc.setFont(this.settings.fontFamily);
    this.doc.setFontSize(this.settings.fontSize);
    this.doc.setLineHeightFactor(this.settings.lineHeight);
  }

  private addHeader(data: LegalDocumentData): void {
    const pageWidth = this.settings.pageSize[0];
    const centerX = pageWidth / 2;

    // Legal document header with compliance markings
    this.doc.setFontSize(16);
    this.doc.setFont(this.settings.fontFamily, 'bold');
    
    // Centered title
    const titleLines = this.doc.splitTextToSize(data.templateTitle.toUpperCase(), pageWidth - 2 * this.settings.margins.left);
    titleLines.forEach((line: string, index: number) => {
      this.doc.text(line, centerX, this.currentY + (index * 20), { align: 'center' });
    });
    this.currentY += titleLines.length * 20 + 20;

    // Jurisdiction and compliance markings
    this.doc.setFontSize(10);
    this.doc.setFont(this.settings.fontFamily, 'normal');
    this.doc.text(`JURISDICTION: ${data.metadata.jurisdiction}`, this.settings.margins.left, this.currentY);
    this.doc.text(`COMPLIANCE LEVEL: ${data.metadata.complianceLevel.toUpperCase()}`, pageWidth - this.settings.margins.right, this.currentY, { align: 'right' });
    this.currentY += 15;

    // Case reference and date
    this.doc.text(`CASE REF: ${data.metadata.caseReference}`, this.settings.margins.left, this.currentY);
    this.doc.text(`DATE: ${data.metadata.generatedDate}`, pageWidth - this.settings.margins.right, this.currentY, { align: 'right' });
    this.currentY += 30;

    // Horizontal line separator
    this.doc.setLineWidth(1);
    this.doc.line(this.settings.margins.left, this.currentY, pageWidth - this.settings.margins.right, this.currentY);
    this.currentY += 20;
  }

  private addContent(content: string): void {
    this.doc.setFontSize(this.settings.fontSize);
    this.doc.setFont(this.settings.fontFamily, 'normal');

    // Process content in paragraphs for better formatting
    const paragraphs = content.split('\n\n');
    const pageWidth = this.settings.pageSize[0];
    const textWidth = pageWidth - 2 * this.settings.margins.left;

    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        // Handle special formatting for legal sections
        let formattedParagraph = this.formatLegalText(paragraph.trim());
        
        // Split text to fit page width
        const lines = this.doc.splitTextToSize(formattedParagraph, textWidth);
        
        // Check if we need a new page
        if (this.currentY + (lines.length * this.settings.fontSize * this.settings.lineHeight) > 
            this.pageHeight - this.settings.margins.bottom) {
          this.addNewPage();
        }

        // Add paragraph
        lines.forEach((line: string, lineIndex: number) => {
          this.doc.text(line, this.settings.margins.left, this.currentY);
          this.currentY += this.settings.fontSize * this.settings.lineHeight;
        });

        // Add spacing between paragraphs
        this.currentY += this.settings.fontSize * 0.5;
      }
    });
  }

  private formatLegalText(text: string): string {
    // Enhanced legal formatting
    let formatted = text;

    // Format section headers (all caps lines)
    if (/^[A-Z\s\d:.-]+$/.test(text) && text.length < 100) {
      formatted = text;
    }

    // Format numbered sections
    formatted = formatted.replace(/^(\d+)\.\s+([A-Z\s]+)$/gm, '$1. $2');

    // Format signature blocks
    formatted = formatted.replace(/^\/s\/\s+(.+)$/gm, '/s/ $1');

    // Format legal citations
    formatted = formatted.replace(/\[([^\]]+)\]/g, '[$1]');

    return formatted;
  }

  private addFooter(data: LegalDocumentData): void {
    const pageWidth = this.settings.pageSize[0];
    const footerY = this.pageHeight - this.settings.margins.bottom + 20;

    this.doc.setFontSize(8);
    this.doc.setFont(this.settings.fontFamily, 'normal');

    // Document authenticity footer
    const footerText = `Generated by TSMO Watch Legal System • Document Hash: ${data.metadata.documentHash.substring(0, 16)}...`;
    this.doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

    // Page number
    this.doc.text(`Page ${this.currentPage}`, pageWidth - this.settings.margins.right, footerY, { align: 'right' });
  }

  private addComplianceInfo(data: LegalDocumentData): void {
    this.addNewPage();
    
    const pageWidth = this.settings.pageSize[0];
    this.currentY = this.settings.margins.top;

    // Compliance and verification page
    this.doc.setFontSize(14);
    this.doc.setFont(this.settings.fontFamily, 'bold');
    this.doc.text('DOCUMENT VERIFICATION & COMPLIANCE', pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 30;

    this.doc.setFontSize(10);
    this.doc.setFont(this.settings.fontFamily, 'normal');

    const complianceInfo = [
      `Document Hash: ${data.metadata.documentHash}`,
      `Generated: ${data.metadata.generatedDate}`,
      `Authorized By: ${data.metadata.authorizedBy}`,
      `Jurisdiction: ${data.metadata.jurisdiction}`,
      `Compliance Level: ${data.metadata.complianceLevel}`,
      '',
      'LEGAL DISCLAIMER:',
      'This document was generated using TSMO Watch Legal Templates.',
      'It has been reviewed for compliance with applicable laws and regulations.',
      'For legal advice specific to your situation, consult with a qualified attorney.',
      '',
      'VERIFICATION METHODS:',
      '• Digital signature verification available',
      '• Blockchain hash registration (if enabled)',
      '• Document integrity verification via hash',
      '',
      'TSMO Watch Legal System',
      'https://tsmowatch.com/legal-templates',
      `Generated on: ${new Date().toISOString()}`
    ];

    complianceInfo.forEach(line => {
      if (line.startsWith('LEGAL DISCLAIMER:') || line.startsWith('VERIFICATION METHODS:')) {
        this.doc.setFont(this.settings.fontFamily, 'bold');
      } else {
        this.doc.setFont(this.settings.fontFamily, 'normal');
      }
      
      this.doc.text(line, this.settings.margins.left, this.currentY);
      this.currentY += 15;
    });
  }

  private addWatermark(): void {
    if (!this.settings.includeWatermark) return;

    const pageWidth = this.settings.pageSize[0];
    const pageHeight = this.settings.pageSize[1];

    // Add watermark to all pages
    for (let page = 1; page <= this.currentPage; page++) {
      this.doc.setPage(page);
      
      // Save current graphics state
      this.doc.saveGraphicsState();
      
      // Set transparency
      this.doc.setGState({
        opacity: 0.1
      });
      
      // Rotate and add watermark text
      this.doc.setFontSize(48);
      this.doc.setFont(this.settings.fontFamily, 'bold');
      this.doc.setTextColor(128, 128, 128);
      
      // Center and rotate watermark
      this.doc.text('TSMO WATCH LEGAL', pageWidth / 2, pageHeight / 2, {
        angle: 45,
        align: 'center'
      });
      
      // Restore graphics state
      this.doc.restoreGraphicsState();
    }
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentPage++;
    this.currentY = this.settings.margins.top;
  }
}

export const generateLegalPDF = (data: LegalDocumentData, settings?: Partial<ComplianceSettings>): Uint8Array => {
  const generator = new LegalPDFGenerator(settings);
  return generator.generateLegalDocument(data);
};

export const downloadLegalPDF = (data: LegalDocumentData, filename?: string): void => {
  const pdfBytes = generateLegalPDF(data);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.templateTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export type { LegalDocumentData, ComplianceSettings };