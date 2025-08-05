import React, { useState } from 'react';
import jsPDF from 'jspdf';
import AIProtectionTechnicalDoc from './AIProtectionTechnicalDoc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Shield, 
  BarChart3, 
  Users, 
  Briefcase,
  ExternalLink,
  Lock,
  CheckCircle
} from 'lucide-react';

const InvestorDataRoom = () => {
  const [accessGranted, setAccessGranted] = useState(false);

  const documents = {
    financial: [
      { name: 'Financial Model & Projections (3-Year)', type: 'Excel', size: '2.4 MB', status: 'ready' },
      { name: 'Unit Economics Analysis', type: 'PDF', size: '1.8 MB', status: 'ready' },
      { name: 'Revenue Model Deep Dive', type: 'PDF', size: '3.2 MB', status: 'ready' },
      { name: 'CAC/LTV Analysis by Channel', type: 'Excel', size: '1.5 MB', status: 'ready' }
    ],
    legal: [
      { name: 'Patent Portfolio (4 Filed, 12 Pending)', type: 'PDF', size: '15.7 MB', status: 'ready' },
      { name: 'Trademark Registrations', type: 'PDF', size: '5.3 MB', status: 'ready' },
      { name: 'Corporate Structure & Cap Table', type: 'PDF', size: '2.1 MB', status: 'ready' },
      { name: 'Terms of Service & Privacy Policy', type: 'PDF', size: '1.9 MB', status: 'ready' }
    ],
    technical: [
      { name: 'Technical Architecture Overview', type: 'PDF', size: '8.4 MB', status: 'ready' },
      { name: 'AI Training Protection System - Full Technical Guide', type: 'PDF', size: '12.6 MB', status: 'ready' },
      { name: 'AI Training Protection Algorithm', type: 'PDF', size: '12.6 MB', status: 'confidential' },
      { name: 'Security & Compliance Report', type: 'PDF', size: '4.7 MB', status: 'ready' },
      { name: 'Scalability Analysis', type: 'PDF', size: '3.8 MB', status: 'ready' }
    ],
    market: [
      { name: 'Market Research & Sizing', type: 'PDF', size: '6.2 MB', status: 'ready' },
      { name: 'Competitive Analysis Matrix', type: 'Excel', size: '2.9 MB', status: 'ready' },
      { name: 'Customer Research & Testimonials', type: 'PDF', size: '4.1 MB', status: 'ready' },
      { name: 'Go-to-Market Strategy', type: 'PDF', size: '5.5 MB', status: 'ready' }
    ]
  };

  const metrics = {
    mrr: '$200',
    users: '50+',
    artworks: '500+',
    dmcaFiled: '25+',
    churn: '2.5%',
    nps: '72'
  };

  const handleDocumentDownload = (docName: string) => {
    // Special handling for AI Protection Technical Guide
    if (docName === 'AI Training Protection System - Full Technical Guide') {
      generateAIProtectionTechnicalPDF();
      return;
    }
    
    const pdf = new jsPDF();
    
    // Add header
    pdf.setFontSize(16);
    pdf.text(`TSMO - ${docName}`, 20, 30);
    
    pdf.setFontSize(12);
    pdf.text('Comprehensive investment documentation for TSMO\'s investor data room.', 20, 50);
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 70);
    pdf.text('Confidential & Proprietary Information', 20, 80);
    
    // Add content based on document type
    pdf.setFontSize(12);
    pdf.text('Document Contents:', 20, 100);
    pdf.setFontSize(10);
    pdf.text('This document contains detailed information about TSMO\'s business model,', 20, 120);
    pdf.text('financial projections, technical architecture, and market opportunity.', 20, 130);
    pdf.text('For full access to this document, please contact our investor relations team.', 20, 140);
    
    // Footer
    pdf.text('For more information, contact:', 20, 200);
    pdf.text('shirleena.cunningham@tsmowatch.com', 20, 210);
    pdf.text('© 2025 TSMO. All rights reserved.', 20, 240);
    
    pdf.save(`TSMO-${docName.replace(/\s+/g, '-')}.pdf`);
  };

  const generateAIProtectionTechnicalPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 30;
    const lineHeight = 10;
    const pageHeight = 280;
    
    // Helper function to add new page if needed
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight) {
        pdf.addPage();
        yPosition = 30;
      }
    };
    
    // Header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text('TSMO AI Training Protection System', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(14);
    pdf.text('Technical Architecture & Implementation Guide', 20, yPosition);
    yPosition += lineHeight + 10;
    
    // Document info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Confidential & Proprietary Information - TSMO', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Executive Summary
    checkAndAddPage(60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('1. EXECUTIVE SUMMARY', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('TSMO\'s AI Training Protection system represents a breakthrough in intellectual', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('property protection, specifically designed to combat unauthorized AI training on', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('copyrighted content. Our patent-pending technology creates unique digital', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('fingerprints and employs advanced detection algorithms to identify when', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('protected content is being used for AI model training without permission.', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Core Technology
    checkAndAddPage(80);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('2. CORE TECHNOLOGY ARCHITECTURE', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('2.1 Multi-Modal Fingerprinting Engine', 20, yPosition);
    yPosition += lineHeight + 3;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Our proprietary fingerprinting engine creates unique digital signatures for:', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('• Visual Content: Advanced perceptual hashing algorithms', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• Text Content: Semantic and structural fingerprints', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• Audio Content: Spectral and temporal signatures', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• Video Content: Frame-by-frame and motion analysis', 25, yPosition);
    yPosition += lineHeight + 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('2.2 AI Training Detection Matrix', 20, yPosition);
    yPosition += lineHeight + 3;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Real-time monitoring system that identifies:', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('• Data scraping patterns indicative of training data collection', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• AI model training signatures and computational patterns', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• Unauthorized derivative content generation', 25, yPosition);
    yPosition += lineHeight;
    pdf.text('• Model fine-tuning activities using protected content', 25, yPosition);
    yPosition += lineHeight + 15;
    
    // Performance Metrics
    checkAndAddPage(60);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('3. PERFORMANCE METRICS & CAPABILITIES', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Detection Accuracy: 95%+ true positive rate', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('False Positive Rate: <5% across all content types', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Processing Speed: Real-time fingerprint generation (<2 seconds)', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Platform Coverage: 70+ monitored platforms and repositories', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('Response Time: Automated alerts within 2 hours of detection', 20, yPosition);
    yPosition += lineHeight + 15;
    
    // Beta Disclaimer
    checkAndAddPage(30);
    pdf.setFontSize(8);
    pdf.text('⚠️ Beta Testing Phase: This information is purely projected.', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('No current users at this time. Currently in Beta Testing phase.', 20, yPosition);
    yPosition += lineHeight + 10;
    
    // Contact & Footer
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text('CONTACT INFORMATION', 20, yPosition);
    yPosition += lineHeight + 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text('Technical Inquiries: shirleena.cunningham@tsmowatch.com', 20, yPosition);
    yPosition += lineHeight + 10;
    
    pdf.setFontSize(8);
    pdf.text('© 2025 TSMO. All rights reserved. This document contains confidential', 20, yPosition);
    yPosition += lineHeight;
    pdf.text('and proprietary information. Unauthorized distribution is prohibited.', 20, yPosition);
    
    pdf.save('TSMO-AI-Training-Protection-Technical-Documentation.pdf');
  };

  if (!accessGranted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">TSMO Investor Data Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Access to this data room is restricted to verified investors only.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => setAccessGranted(true)}
                size="lg"
                className="w-full max-w-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Request Access
              </Button>
              <p className="text-sm text-muted-foreground">
                By requesting access, you agree to maintain confidentiality of all materials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">TSMO Investor Data Room</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive due diligence materials for qualified investors
        </p>
        <Badge variant="secondary" className="text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Access Granted - Confidential Materials
        </Badge>
      </div>

      {/* Key Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.mrr}</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.users}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.artworks}</div>
              <div className="text-sm text-muted-foreground">Protected Artworks</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.dmcaFiled}</div>
              <div className="text-sm text-muted-foreground">DMCA Filed</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.churn}</div>
              <div className="text-sm text-muted-foreground">Monthly Churn</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.nps}</div>
              <div className="text-sm text-muted-foreground">Net Promoter Score</div>
              <Badge variant="outline" className="text-xs mt-1">Projected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Library */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        {Object.entries(documents).map(([category, docs]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{category} Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'confidential' && (
                          <Badge variant="destructive" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Confidential
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentDownload(doc.name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Investor Relations Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Primary Contact</h3>
            <p className="text-sm text-muted-foreground mb-1">shirleena.cunningham@tsmowatch.com</p>
            <p className="text-sm text-muted-foreground mb-4"></p>
            
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Schedule Due Diligence Call
            </Button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Additional Resources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Live Product Demo</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Customer Reference Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Technical Deep Dive Sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorDataRoom;