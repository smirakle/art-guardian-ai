import jsPDF from 'jspdf';

interface InvestorMetrics {
  company: {
    name: string;
    founded: string;
    headquarters: string;
    stage: string;
    seeking: string;
  };
  technology: {
    aiModels: number;
    blockchainNetworks: number;
    apiEndpoints: number;
    detectionAccuracy: string;
    uptime: string;
  };
  traction: {
    totalUsers: number;
    protectedAssets: number;
    violationsDetected: number;
    activeSubscriptions: number;
    legalActionsGenerated: number;
    conversionRate: string;
    averageDetectionTime: string;
    platformsCovered: number;
  };
  financials: {
    currentMRR: number;
    projectedARR: number;
    burnRate: number;
    runway: number;
    targetValuation: string;
  };
  legal: {
    patents: number;
    trademarks: number;
    complianceCertifications: number;
  };
}

export class FoundingPartnerBriefGenerator {
  static generateBrief(metrics: InvestorMetrics, generatedAt: string): Uint8Array {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Founding Partner Brief", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text("TSMO - The Smart Media Organization", 20, yPosition);
    yPosition += 20;

    // Confidentiality notice
    doc.setFontSize(10);
    doc.setTextColor(150, 0, 0);
    doc.text("CONFIDENTIAL - For Authorized Investors Only", 20, yPosition);
    yPosition += 15;

    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summary = [
      "TSMO is pioneering the next generation of AI-powered intellectual property protection.",
      "Our multi-modal detection system protects creative assets across 47+ platforms with",
      "94.7% accuracy, enabling automated legal action and blockchain verification.",
      "",
      "We're seeking $500K-$2M to accelerate growth and capture the $2.8B IP protection market."
    ];
    
    summary.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Company Overview
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Company Overview", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Founded: ${metrics.company.founded}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Stage: ${metrics.company.stage}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Headquarters: ${metrics.company.headquarters}`, 20, yPosition);
    yPosition += 15;

    // Technology Stack
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Technology Stack", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`• ${metrics.technology.aiModels} Advanced AI Detection Models`, 25, yPosition);
    yPosition += 6;
    doc.text(`• ${metrics.technology.blockchainNetworks} Blockchain Networks Integrated`, 25, yPosition);
    yPosition += 6;
    doc.text(`• ${metrics.technology.apiEndpoints} Enterprise API Endpoints`, 25, yPosition);
    yPosition += 6;
    doc.text(`• ${metrics.technology.detectionAccuracy} Detection Accuracy`, 25, yPosition);
    yPosition += 6;
    doc.text(`• ${metrics.technology.uptime} Platform Uptime`, 25, yPosition);
    yPosition += 15;

    // Live Traction Metrics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Live Traction Metrics", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Users: ${metrics.traction.totalUsers.toLocaleString()}`, 20, yPosition);
    doc.text(`Active Subscriptions: ${metrics.traction.activeSubscriptions}`, 110, yPosition);
    yPosition += 6;
    doc.text(`Protected Assets: ${metrics.traction.protectedAssets.toLocaleString()}`, 20, yPosition);
    doc.text(`Conversion Rate: ${metrics.traction.conversionRate}`, 110, yPosition);
    yPosition += 6;
    doc.text(`Violations Detected: ${metrics.traction.violationsDetected}`, 20, yPosition);
    doc.text(`Platforms Covered: ${metrics.traction.platformsCovered}`, 110, yPosition);
    yPosition += 6;
    doc.text(`Legal Actions Generated: ${metrics.traction.legalActionsGenerated}`, 20, yPosition);
    doc.text(`Avg Response Time: ${metrics.traction.averageDetectionTime}`, 110, yPosition);
    yPosition += 15;

    // Financial Overview
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Overview", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Current MRR: $${metrics.financials.currentMRR.toLocaleString()}`, 20, yPosition);
    doc.text(`Projected ARR: $${metrics.financials.projectedARR.toLocaleString()}`, 110, yPosition);
    yPosition += 6;
    doc.text(`Monthly Burn: $${metrics.financials.burnRate.toLocaleString()}`, 20, yPosition);
    doc.text(`Runway: ${metrics.financials.runway} months`, 110, yPosition);
    yPosition += 6;
    doc.text(`Target Valuation: $${metrics.financials.targetValuation}M`, 20, yPosition);
    yPosition += 15;

    // Add new page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // How It Works
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("How TSMO Works", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const howItWorks = [
      "1. Asset Upload & Fingerprinting",
      "   • Users upload creative assets (images, videos, audio)",
      "   • AI generates unique fingerprints using advanced perceptual hashing",
      "   • Blockchain verification creates immutable ownership records",
      "",
      "2. Multi-Platform Monitoring",
      "   • Real-time scanning across 47+ platforms (social media, marketplaces, AI training datasets)",
      "   • Advanced AI models detect derivative works and unauthorized usage",
      "   • Threat intelligence identifies emerging violation patterns",
      "",
      "3. Automated Legal Action",
      "   • One-click DMCA takedown generation",
      "   • Legal document templates with jurisdiction-specific compliance",
      "   • Automated filing and tracking of legal notices",
      "",
      "4. Enterprise Integration",
      "   • White-label solutions for agencies and enterprises",
      "   • API access for custom integrations",
      "   • Advanced analytics and reporting dashboards"
    ];

    howItWorks.forEach(line => {
      if (line.startsWith("   •") || line.startsWith("   ")) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      } else if (line.match(/^\d+\./)) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      }
      
      if (line.trim()) {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      } else {
        yPosition += 3;
      }
    });
    yPosition += 10;

    // Legal & IP Assets
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Legal & IP Assets", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Patents Filed: ${metrics.legal.patents}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Trademarks: ${metrics.legal.trademarks}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Compliance Certifications: ${metrics.legal.complianceCertifications}`, 20, yPosition);
    yPosition += 15;

    // Investment Opportunity
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Investment Opportunity", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const opportunity = [
      "• $2.8B IP protection market growing at 15% CAGR",
      "• First-mover advantage in AI-powered content protection",
      "• Scalable SaaS model with enterprise white-label potential",
      "• Strong defensible technology moat with blockchain integration",
      "• Clear path to profitability with existing traction"
    ];

    opportunity.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date(generatedAt).toLocaleString()}`, 20, yPosition);
    doc.text("Contact: investors@tsmo.com", 20, yPosition + 6);
    doc.text("This document contains forward-looking statements and proprietary information.", 20, yPosition + 12);

    return doc.output('arraybuffer') as Uint8Array;
  }

  static downloadBrief(blob: Uint8Array, filename: string = 'TSMO-Founding-Partner-Brief.pdf') {
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}