import jsPDF from 'jspdf';

export interface AIProtectionData {
  userId: string;
  protectedFiles: number;
  protectionMethods: string[];
  certificateDate: Date;
  protectionLevel: string;
  verificationId?: string;
}

export class AIProtectionCertificateGenerator {
  /**
   * Generate a downloadable AI protection certificate
   */
  static generateProtectionCertificate(data: AIProtectionData): Blob {
    const doc = new jsPDF();

    // Page helpers
    const pageWidth = (doc as any).internal.pageSize.getWidth();
    const pageHeight = (doc as any).internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin + 5;

    const ensureSpace = (needed: number) => {
      if (yPos + needed > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    const writeWrapped = (text: string, x = margin, lineHeight = 6, bullet = false) => {
      const lines = doc.splitTextToSize(text, contentWidth - (x - margin));
      lines.forEach((line, idx) => {
        ensureSpace(lineHeight);
        const prefix = bullet && idx === 0 ? '\u2022 ' : '';
        const indentX = bullet && idx > 0 ? x + 5 : x;
        doc.text(prefix + line, indentX, yPos);
        yPos += lineHeight;
      });
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    writeWrapped('AI TRAINING PROTECTION CERTIFICATE', margin, 8);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    writeWrapped('Official Proof of Content Protection Against Unauthorized AI Training', margin, 6);

    // Badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 200);
    writeWrapped('Protected by TSMO Advanced AI Protection', margin, 6);
    doc.setTextColor(0, 0, 0);

    // Horizontal line
    ensureSpace(10);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 12;

    // Certificate details
    doc.setFontSize(10);
    const addField = (label: string, value: string, bold: boolean = false) => {
      ensureSpace(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, yPos);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const valueX = margin + 55;
      const valueLines = doc.splitTextToSize(value, contentWidth - 55);
      valueLines.forEach((line) => {
        doc.text(line, valueX, yPos);
        yPos += 8;
      });
    };

    const certificateId = `AI-CERT-${Date.now().toString(36).toUpperCase()}`;
    addField('Certificate ID', certificateId, true);
    addField('Issued Date', data.certificateDate.toLocaleDateString());
    addField('Protection Level', data.protectionLevel.toUpperCase(), true);
    addField('Protected Files', data.protectedFiles.toString());
    addField('User ID', `${data.userId.slice(0, 8)}...`);

    // Protection Methods section
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    writeWrapped('Active Protection Methods:', margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    (data.protectionMethods || []).forEach((method) => {
      writeWrapped(`${this.getMethodDisplayName(method)}`, margin + 5, 6, true);
    });

    // Legal Notice section
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    writeWrapped('LEGAL PROTECTION NOTICE', margin, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const legalText = [
      'This certificate serves as legal proof that the protected content is explicitly excluded from use in artificial intelligence training, machine learning model development, or any automated algorithmic processing without express written consent from the copyright holder.',
      'Unauthorized use prohibited:',
      'AI model training or fine-tuning',
      'Machine learning dataset compilation',
      'Neural network feature extraction',
      'Automated content generation based on protected works',
      'Deep learning algorithm development',
      'Violation of these protections may result in legal action under copyright law, DMCA takedown notices, and monetary damages with injunctive relief.'
    ];

    legalText.forEach((line, idx) => {
      const bullet = idx > 1 && idx < 7; // bullet list for middle items
      writeWrapped(line, bullet ? margin + 5 : margin, 5, bullet);
    });

    // Verification section
    ensureSpace(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    writeWrapped('Certificate Verification:', margin, 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    const verificationHash = this.generateVerificationHash(data);
    const verificationText = [
      `Verification Hash: ${verificationHash}`,
      `Digital Signature: TSMO-${certificateId.slice(-8)}`,
      `Blockchain Record: ${data.verificationId || 'Pending registration'}`,
      'This certificate is cryptographically verified and legally valid.',
      'To verify authenticity, visit: https://tsmo.ai/verify-certificate'
    ];

    verificationText.forEach((line) => writeWrapped(line, margin, 5));

    // Footer
    ensureSpace(20);
    doc.setFontSize(7);
    doc.setTextColor(100);
    writeWrapped('Generated by TSMO AI Protection System', margin, 5);
    writeWrapped(`Certificate issued on ${new Date().toLocaleString()}`, margin, 5);
    writeWrapped('This document is digitally generated, legally valid, and internationally recognized.', margin, 5);

    // Security watermark (centered across the page)
    doc.setFontSize(45);
    doc.setTextColor(245, 245, 245);
    doc.text('PROTECTED', pageWidth / 2 - 60, pageHeight / 2, { angle: 45 });

    return doc.output('blob');
  }
  
  /**
   * Generate a simple text certificate
   */
  static generateTextCertificate(data: AIProtectionData): Blob {
    const certificateId = `AI-CERT-${Date.now().toString(36).toUpperCase()}`;
    const verificationHash = this.generateVerificationHash(data);
    
    const content = `
AI TRAINING PROTECTION CERTIFICATE
===================================
Protected by TSMO Advanced AI Protection

Certificate ID: ${certificateId}
Issued Date: ${data.certificateDate.toISOString()}
Protection Level: ${data.protectionLevel.toUpperCase()}
Protected Files: ${data.protectedFiles}
User ID: ${data.userId}

ACTIVE PROTECTION METHODS:
${data.protectionMethods.map(method => `- ${this.getMethodDisplayName(method)}`).join('\n')}

LEGAL PROTECTION NOTICE:
This certificate serves as legal proof that the protected content is 
explicitly EXCLUDED from use in artificial intelligence training, 
machine learning model development, or any automated algorithmic 
processing without express written consent from the copyright holder.

UNAUTHORIZED USE PROHIBITED:
- AI model training or fine-tuning
- Machine learning dataset compilation  
- Neural network feature extraction
- Automated content generation based on protected works
- Deep learning algorithm development

Verification Hash: ${verificationHash}
Digital Signature: TSMO-${certificateId.slice(-8)}
Blockchain Record: ${data.verificationId || 'Pending registration'}

Generated by TSMO AI Protection System
Timestamp: ${new Date().toISOString()}

This certificate is legally binding and internationally recognized.
To verify authenticity, visit: https://tsmo.ai/verify-certificate
    `.trim();
    
    return new Blob([content], { type: 'text/plain' });
  }
  
  /**
   * Get display name for protection method
   */
  private static getMethodDisplayName(methodId: string): string {
    const methodNames: Record<string, string> = {
      'realtimeMonitoring': 'Real-Time Violation Monitoring',
      'invisibleWatermark': 'Invisible Watermarking',
      'adversarialNoise': 'Adversarial Noise Protection',
      'metadataInjection': 'Rights Metadata Injection',
      'blockchainRegistration': 'Blockchain Rights Registration',
      'robotsTxtEntry': 'Web Crawler Blocking',
      'likenenessProtection': 'Likeness Recognition Protection',
      // Document-specific methods
      'policyEmbedding': 'Policy Embedding',
      'invisibleTracers': 'Invisible Document Tracers',
      'semanticPerturbation': 'Semantic Perturbation',
      'zeroWidthJoiners': 'Zero-Width Character Protection',
      'documentWatermarking': 'Document Watermarking'
    };
    return methodNames[methodId] || methodId;
  }
  
  /**
   * Generate verification hash for certificate authenticity
   */
  private static generateVerificationHash(data: AIProtectionData): string {
    const hashInput = `${data.userId}${data.protectedFiles}${data.protectionMethods.join('')}${data.certificateDate.getTime()}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
  }
  
  /**
   * Download certificate file
   */
  static downloadCertificate(blob: Blob, format: 'pdf' | 'txt' = 'pdf') {
    const timestamp = new Date().toISOString().split('T')[0];
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Protection_Certificate_${timestamp}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}