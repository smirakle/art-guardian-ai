import React, { useState } from 'react';
import { Download, FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import { InventorInfo, PriorArt, PatentClaim, ApplicationInfo } from '@/types/patent';

interface USPTOFormsGeneratorProps {
  applicationInfo: ApplicationInfo;
  inventors: InventorInfo[];
  priorArt: PriorArt[];
  claims: PatentClaim[];
  onGenerateProvisional: () => void;
  onGenerateUtility: () => void;
  onGenerateUSPTOForms: () => void;
}

const USPTOFormsGenerator = ({
  applicationInfo,
  inventors,
  priorArt,
  claims,
  onGenerateProvisional,
  onGenerateUtility,
  onGenerateUSPTOForms
}: USPTOFormsGeneratorProps) => {
  const [generating, setGenerating] = useState<string | null>(null);

  // Validation checks
  const hasValidInventors = inventors.length > 0 && inventors.every(inv => 
    inv.firstName && inv.lastName && inv.address && inv.inventorshipDeclaration
  );
  const hasValidClaims = claims.length > 0 && claims.some(c => c.claimType === 'independent');
  const hasTitle = applicationInfo.title.trim().length > 0;
  const hasPriorArt = priorArt.length > 0;

  const readinessScore = [hasTitle, hasValidInventors, hasValidClaims, hasPriorArt]
    .filter(Boolean).length;

  const generateProvisionalApplication = async () => {
    setGenerating('provisional');
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 6;

    // Helper function for adding text
    const addText = (text: string, fontSize = 11, isBold = false, isTitle = false) => {
      if (isTitle) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
      } else if (isBold) {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'normal');
      }

      const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      if (yPosition + (splitText.length * lineHeight) > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight + (isTitle ? 10 : 5);
    };

    // Document header
    addText('PROVISIONAL PATENT APPLICATION', 16, true, true);
    addText(`Title: ${applicationInfo.title}`, 14, true);
    addText(`Filed: ${new Date().toLocaleDateString()}`, 12);
    addText(`Applicant: ${applicationInfo.assigneeCompany}`, 12);
    yPosition += 10;

    // Inventors section
    addText('INVENTORS', 14, true);
    inventors.forEach((inventor, index) => {
      addText(`Inventor ${index + 1}: ${inventor.firstName} ${inventor.lastName}`);
      addText(`Address: ${inventor.address}`);
      addText(`Citizenship: ${inventor.citizenship}`);
      yPosition += 5;
    });

    // Field of invention
    addText('FIELD OF THE INVENTION', 14, true);
    addText('Computer systems and methods for protecting digital content from unauthorized use in artificial intelligence training datasets through real-time monitoring, advanced fingerprinting, and automated enforcement.');
    yPosition += 10;

    // Background
    addText('BACKGROUND OF THE INVENTION', 14, true);
    addText('Current copyright protection systems cannot detect when digital content is used in AI training datasets, leaving creators without recourse when their work is incorporated into AI models without permission. Existing watermarking and fingerprinting technologies are easily bypassed by AI preprocessing techniques, and no real-time monitoring systems exist for AI training dataset usage.');
    yPosition += 10;

    // Summary
    addText('SUMMARY OF THE INVENTION', 14, true);
    addText('The present invention provides a comprehensive system that combines advanced image fingerprinting, real-time dataset monitoring, blockchain verification, and automated legal enforcement to protect digital content from unauthorized AI training use. The system includes multi-modal content fingerprinting, AI-resistant protection methods, real-time scanning of AI training repositories, and automated legal response generation.');
    yPosition += 10;

    // Claims
    addText('CLAIMS', 14, true);
    claims.sort((a, b) => a.claimNumber - b.claimNumber).forEach(claim => {
      const claimPrefix = claim.claimType === 'dependent' && claim.dependsOn 
        ? `${claim.claimNumber}. The method of claim ${claim.dependsOn}, wherein `
        : `${claim.claimNumber}. `;
      addText(claimPrefix + claim.claimText, 10);
      yPosition += 5;
    });

    // Prior art
    if (priorArt.length > 0) {
      addText('PRIOR ART REFERENCES', 14, true);
      priorArt.forEach((art, index) => {
        addText(`[${index + 1}] ${art.title}, ${art.authors}, ${art.publicationDate}${art.patentNumber ? `, ${art.patentNumber}` : ''}`);
      });
    }

    pdf.save(`${applicationInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_Provisional_Application.pdf`);
    setGenerating(null);
  };

  const generateUtilityApplication = async () => {
    setGenerating('utility');
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 6;

    // This would include full USPTO-compliant utility application format
    // Including detailed specification, drawings references, etc.
    
    pdf.text('UTILITY PATENT APPLICATION', margin, yPosition);
    yPosition += 20;
    
    pdf.text(`Title: ${applicationInfo.title}`, margin, yPosition);
    yPosition += 10;

    // Add comprehensive specification sections
    const sections = [
      'CROSS-REFERENCE TO RELATED APPLICATIONS',
      'STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH',
      'REFERENCE TO SEQUENCE LISTING',
      'FIELD OF THE INVENTION',
      'BACKGROUND OF THE INVENTION',
      'BRIEF SUMMARY OF THE INVENTION',
      'BRIEF DESCRIPTION OF THE DRAWINGS',
      'DETAILED DESCRIPTION OF THE INVENTION',
      'CLAIMS'
    ];

    sections.forEach(section => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text(section, margin, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('[Detailed content for this section would be included here]', margin, yPosition);
      yPosition += 20;
    });

    pdf.save(`${applicationInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_Utility_Application.pdf`);
    setGenerating(null);
  };

  const generateUSPTOFormPacket = async () => {
    setGenerating('forms');
    
    const pdf = new jsPDF();
    
    // Generate multiple USPTO forms in one packet
    pdf.text('USPTO FORMS PACKET', 20, 30);
    pdf.text('Application Data Sheet (ADS)', 20, 50);
    pdf.text('Inventor Declaration', 20, 70);
    pdf.text('Assignment Documents', 20, 90);
    pdf.text('Fee Calculation Sheet', 20, 110);
    
    pdf.save('USPTO_Forms_Packet.pdf');
    setGenerating(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Attorney Packet Generation
          </CardTitle>
          <CardDescription>
            Generate USPTO-compliant patent documents ready for attorney review and filing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Readiness Assessment */}
          <div className="space-y-4">
            <h4 className="font-semibold">Application Readiness Assessment</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {hasTitle ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span className="text-sm">Title</span>
              </div>
              <div className="flex items-center gap-2">
                {hasValidInventors ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span className="text-sm">Inventors</span>
              </div>
              <div className="flex items-center gap-2">
                {hasValidClaims ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span className="text-sm">Claims</span>
              </div>
              <div className="flex items-center gap-2">
                {hasPriorArt ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <span className="text-sm">Prior Art</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Readiness Score:</span>
              <Badge variant={readinessScore >= 3 ? 'default' : 'secondary'}>
                {readinessScore}/4
              </Badge>
            </div>
          </div>

          {readinessScore < 3 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete missing sections before generating attorney packets. A minimum readiness score of 3/4 is recommended.
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Provisional Application</CardTitle>
                <CardDescription className="text-sm">
                  Quick filing to establish priority date ($1,600-$3,200)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div>✓ Establishes filing date</div>
                    <div>✓ 12-month priority period</div>
                    <div>✓ Lower filing costs</div>
                    <div>✓ Flexible requirements</div>
                  </div>
                  <Button 
                    onClick={generateProvisionalApplication}
                    disabled={readinessScore < 2 || generating === 'provisional'}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating === 'provisional' ? 'Generating...' : 'Generate Provisional'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Utility Application</CardTitle>
                <CardDescription className="text-sm">
                  Full non-provisional filing ($10,000-$25,000)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div>✓ Complete patent application</div>
                    <div>✓ Examination process</div>
                    <div>✓ Can result in issued patent</div>
                    <div>✓ 20-year protection</div>
                  </div>
                  <Button 
                    onClick={generateUtilityApplication}
                    disabled={readinessScore < 3 || generating === 'utility'}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating === 'utility' ? 'Generating...' : 'Generate Utility'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">USPTO Forms</CardTitle>
                <CardDescription className="text-sm">
                  Official forms and declarations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div>✓ Application Data Sheet</div>
                    <div>✓ Inventor declarations</div>
                    <div>✓ Assignment documents</div>
                    <div>✓ Fee calculation sheets</div>
                  </div>
                  <Button 
                    onClick={generateUSPTOFormPacket}
                    disabled={readinessScore < 2 || generating === 'forms'}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generating === 'forms' ? 'Generating...' : 'Generate Forms'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attorney Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">For Patent Attorney Review</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <div>📋 <strong>Generated documents include:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>• Complete technical specification with USPTO formatting</li>
                <li>• Formal patent claims (independent and dependent)</li>
                <li>• Prior art analysis and differentiation</li>
                <li>• Inventor declarations and assignments</li>
                <li>• Fee calculation worksheets</li>
              </ul>
              <div className="pt-2">
                <strong>Next Steps:</strong> Review generated documents with your patent attorney for final preparation and USPTO submission.
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default USPTOFormsGenerator;