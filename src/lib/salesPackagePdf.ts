import jsPDF from 'jspdf';

// Helper to add wrapped text and manage page breaks
function addParagraph(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6,
  bottomMargin = 20
) {
  const lines = pdf.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    if (y > pdf.internal.pageSize.getHeight() - bottomMargin) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function sectionHeading(pdf: jsPDF, title: string, y: number) {
  if (y > pdf.internal.pageSize.getHeight() - 30) {
    pdf.addPage();
    y = 20;
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(0, 123, 255);
  pdf.text(title, 20, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  return y + 8;
}

export function generateB2BSalesPackagePDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Cover
  pdf.setFillColor(245, 248, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 123, 255);
  pdf.setFontSize(24);
  pdf.text('TSMO | B2B Sales Package', 20, 40);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(12);
  addParagraph(
    pdf,
    'Enterprise platform for AI training protection, copyright monitoring, automated legal workflows, and compliant licensing.',
    20,
    52,
    170
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Website:', 20, 85);
  pdf.setTextColor(0, 123, 255);
  pdf.textWithLink('https://tsmo.ai', 40, 85, { url: 'https://tsmo.ai' });
  pdf.setTextColor(40, 40, 40);
  pdf.text('Contact:', 20, 92);
  pdf.setTextColor(0, 123, 255);
  pdf.textWithLink('sales@tsmo.ai', 40, 92, { url: 'mailto:sales@tsmo.ai' });

  // Key value props on cover
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(10);
  const coverBullets = [
    'Four-Layer Defense System™: Protection • Monitoring • Response • Enforcement',
    'Patent-pending AI training protection (documents, images, multimedia)',
    'Realtime monitoring across surface, deep web, and AI datasets',
    'Automated DMCA, licensing, and blockchain verification',
  ];
  let y = 110;
  coverBullets.forEach((b) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, b, 27, y, 165, 6);
  });

  // Table of contents
  pdf.addPage();
  y = 20;
  y = sectionHeading(pdf, 'Table of Contents', y);
  const toc = [
    '1. Executive Summary',
    '2. Platform Overview',
    '3. Product Modules',
    '4. Architecture & Security',
    '5. Compliance & Data Protection',
    '6. Integrations & APIs',
    '7. SLAs & Support',
    '8. Pricing & Packaging',
    '9. ROI & Business Impact',
    '10. Case Studies',
    '11. Procurement & Next Steps',
    '12. Appendix: Links',
  ];
  toc.forEach((item) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, item, 27, y, 165, 6);
  });

  // Executive Summary
  y = sectionHeading(pdf, '1. Executive Summary', y + 6);
  y = addParagraph(
    pdf,
    'TSMO is an enterprise-grade platform that prevents AI training on your proprietary data, detects copyright and trademark violations in real time, automates legal response, and monetizes usage via compliant licensing. We combine AI, automation, and blockchain to deliver measurable IP protection outcomes for creators and enterprises.',
    20,
    y,
    170
  );

  // Platform Overview
  y = sectionHeading(pdf, '2. Platform Overview – Four-Layer Defense System™', y + 2);
  const overview = [
    'Protection: AITPA Core Engine applies anti-training tracers and Style Cloak to media while preserving visual fidelity.',
    'Monitoring: Multi-modal detection across web, social, marketplaces, and AI datasets with confidence scoring.',
    'Response: One-click DMCA, cease & desist, trademark actions, and automated evidence packaging.',
    'Enforcement & Monetization: Stripe-powered licensing, blockchain certificates, and portfolio analytics.',
  ];
  overview.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // Product Modules
  y = sectionHeading(pdf, '3. Product Modules', y + 4);
  const modules = [
    'AI Training Protection: Document, image, and multimedia protection with compliance controls.',
    'Monitoring: Surface, deep web, social, and dataset scanning with alerting and audit trails.',
    'Legal Automation: DMCA, licensing, copyright notices, and report generation.',
    'Trademark Intelligence: Search, watchlists, similarity detection, and legal workflows.',
    'Portfolio & Profile Monitoring: Brand/reputation protection across platforms.',
    'Enterprise API & White-Label: Integrate TSMO into your stack or deliver to your customers.',
  ];
  modules.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // New page for next sections when needed
  if (y > pageHeight - 60) {
    pdf.addPage();
    y = 20;
  }

  // Architecture & Security
  y = sectionHeading(pdf, '4. Architecture & Security', y + 2);
  y = addParagraph(
    pdf,
    'Frontend: React + TypeScript. Backend: Supabase (Postgres, Auth, Functions). Blockchain integration for certificates. AI/ML pipelines for multi-modal detection and fingerprinting.',
    20,
    y,
    170
  );
  y = addParagraph(
    pdf,
    'Security: Role-based access control, least-privilege policies, encrypted storage, audit logging, and IP-safe processing paths. Optional private buckets and redaction flows for sensitive data.',
    20,
    y,
    170
  );

  // Compliance & Data Protection
  y = sectionHeading(pdf, '5. Compliance & Data Protection', y + 2);
  const compliance = [
    'Data Residency: Configurable storage buckets and region-specific routing.',
    'RLS Policies: Row Level Security for strict tenant isolation.',
    'Privacy: Data minimization and retention controls.',
    'Access: SSO and SCIM-ready roadmap; detailed audit logs.',
  ];
  compliance.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // Integrations & APIs
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = 20;
  }
  y = sectionHeading(pdf, '6. Integrations & APIs', y + 2);
  y = addParagraph(
    pdf,
    'REST APIs and webhooks for uploads, scans, alerts, and legal actions. Integrations include Stripe for payments, IPFS/blockchain for certificates, and connectors for social/media platforms. SDKs and Postman collection available on request.',
    20,
    y,
    170
  );

  // SLAs & Support
  y = sectionHeading(pdf, '7. SLAs & Support', y + 2);
  const slas = [
    'Availability: 99.9% uptime SLA (enterprise).',
    'Support: 24/7 priority support with named CSM.',
    'Response Times: P1 < 1h, P2 < 4h, P3 < 1 business day.',
    'Onboarding: White-glove implementation and training.',
  ];
  slas.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // Pricing & Packaging
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = 20;
  }
  y = sectionHeading(pdf, '8. Pricing & Packaging', y + 2);
  y = addParagraph(
    pdf,
    'Flexible tiers for SMB to Enterprise. Pricing aligns to volume (assets, scans), users, and compliance needs. Enterprise options include SSO, custom SLAs, dedicated environments, and white-label licensing.',
    20,
    y,
    170
  );

  // ROI & Business Impact
  y = sectionHeading(pdf, '9. ROI & Business Impact', y + 2);
  const roi = [
    'Reduce unauthorized AI training and content misuse by 70–90%.',
    'Lower legal processing time/costs by 60–80% via automation.',
    'New revenue streams via instant licensing and portfolio analytics.',
    'Executive dashboards and exportable reports for stakeholders.',
  ];
  roi.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // Case Studies
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = 20;
  }
  y = sectionHeading(pdf, '10. Case Studies', y + 2);
  y = addParagraph(
    pdf,
    'Creative Studio (Global): Reduced unauthorized usage by 82% in 90 days; automated 150+ DMCA notices; launched licensing storefront with blockchain certificates.',
    20,
    y,
    170
  );
  y = addParagraph(
    pdf,
    'Enterprise Media Brand: Consolidated monitoring across 20+ platforms; accelerated takedowns to <24h; improved compliance and executive visibility.',
    20,
    y,
    170
  );

  // Procurement & Next Steps
  y = sectionHeading(pdf, '11. Procurement & Next Steps', y + 2);
  const nextSteps = [
    'Step 1: Technical discovery (security, data flows, integrations).',
    'Step 2: Pilot with success criteria (30–60 days).',
    'Step 3: Enterprise rollout and training.',
    'Step 4: Quarterly business reviews and roadmap alignment.',
  ];
  nextSteps.forEach((line) => {
    pdf.circle(22, y - 2.5, 1.2, 'F');
    y = addParagraph(pdf, line, 27, y, 165, 6);
  });

  // Appendix
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = 20;
  }
  y = sectionHeading(pdf, '12. Appendix: Links', y + 2);
  pdf.setTextColor(0, 123, 255);
  y = addParagraph(pdf, 'Website: https://tsmo.ai', 20, y, 170);
  y = addParagraph(pdf, 'Contact Sales: sales@tsmo.ai', 20, y, 170);
  y = addParagraph(pdf, 'Docs & Due Diligence: Available upon request', 20, y, 170);
  pdf.setTextColor(60, 60, 60);

  // Footer on last page
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text('TSMO © All rights reserved. Confidential – For enterprise evaluation only.', 20, pageHeight - 10);

  pdf.save('TSMO-B2B-Sales-Package.pdf');
}
