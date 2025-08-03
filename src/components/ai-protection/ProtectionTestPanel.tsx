import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, Upload, Download, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { enhancedRealWorldProtection } from "@/lib/enhancedRealWorldProtection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';

export const ProtectionTestPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const createTestFile = () => {
    // Create a small test file
    const testContent = "TSMO AI Protection Test File - " + new Date().toISOString();
    const blob = new Blob([testContent], { type: 'text/plain' });
    return new File([blob], 'test-protection.txt', { type: 'text/plain' });
  };

  const runProtectionTest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test protection functionality.",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const testFile = createTestFile();
      
      toast({
        title: "Testing Protection",
        description: "Applying all 6 protection methods to test file...",
      });

      const result = await enhancedRealWorldProtection.protectFileWithDatabase(testFile, {
        enableAdversarialNoise: true,
        enableRightsMetadata: true,
        enableCrawlerBlocking: true,
        enableInvisibleWatermark: true,
        enableBlockchainRegistration: true,
        enableLikenessProtection: true,
        protectionLevel: 'maximum',
        copyrightInfo: {
          owner: 'TSMO Test User',
          year: new Date().getFullYear(),
          rights: 'All Rights Reserved - Test File'
        },
        userId: user.id,
        fileName: testFile.name
      });

      setTestResults(result);

      if (result.success) {
        toast({
          title: "Protection Test Successful!",
          description: `File protected with ${result.protectionMethods.length} methods and saved to storage.`,
        });
      } else {
        toast({
          title: "Protection Test Failed",
          description: result.errors?.join(', ') || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Protection test failed:', error);
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Test failed unexpectedly",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const downloadTestFile = async () => {
    if (!testResults?.storagePath) {
      toast({
        title: "No File to Download",
        description: "Run the protection test first to create a protected file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('ai-protected-files')
        .download(testResults.storagePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'protected-test-file.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "Protected test file downloaded successfully.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Download failed unexpectedly",
        variant: "destructive"
      });
    }
  };

  const generateTestReportPDF = async () => {
    if (!testResults) {
      toast({
        title: "No Test Results",
        description: "Run the protection test first to generate a report.",
        variant: "destructive"
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header with TSMO branding
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TSMO', margin, yPosition);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI Training Protection System', margin + 50, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.text('Advanced Protection Against Unauthorized AI Training', margin, yPosition);

      // Add line separator
      yPosition += 15;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Protection Test Report', margin, yPosition);
      yPosition += 20;

      // Test Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Test Overview', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const testInfo = [
        `Test Date: ${new Date().toLocaleString()}`,
        `Test Status: ${testResults.success ? 'PASSED' : 'FAILED'}`,
        `Protection ID: ${testResults.protectionId || 'N/A'}`,
        `Protection Level: ${testResults.protectionLevel || 'N/A'}`,
        `Storage Path: ${testResults.storagePath || 'N/A'}`,
        `Record ID: ${testResults.recordId || 'N/A'}`,
        `Methods Applied: ${testResults.protectionMethods?.length || 0}/6`
      ];

      testInfo.forEach(info => {
        pdf.text(info, margin, yPosition);
        yPosition += 12;
      });

      yPosition += 10;

      // Protection Methods Section
      if (testResults.protectionMethods && testResults.protectionMethods.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Applied Protection Methods', margin, yPosition);
        yPosition += 15;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        testResults.protectionMethods.forEach((method: string, index: number) => {
          pdf.text(`✓ ${method.replace(/_/g, ' ').toUpperCase()}`, margin + 10, yPosition);
          yPosition += 12;
        });

        yPosition += 10;
      }

      // Errors Section (if any)
      if (testResults.errors && testResults.errors.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Errors Encountered', margin, yPosition);
        yPosition += 15;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        testResults.errors.forEach((error: string) => {
          pdf.text(`× ${error}`, margin + 10, yPosition);
          yPosition += 12;
        });

        yPosition += 10;
      }

      // Technical Details
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Technical Specifications', margin, yPosition);
      yPosition += 15;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const technicalDetails = [
        'Expected Protection Methods:',
        '• Adversarial Noise - Prevents neural network recognition',
        '• Rights Metadata - Embeds copyright information',
        '• Crawler Blocking - Blocks automated data harvesting',
        '• Invisible Watermark - Hidden ownership markers',
        '• Blockchain Registration - Immutable proof of ownership',
        '• Likeness Protection - Protects against deepfake creation',
        '• Advanced Fingerprinting - Unique content identification',
        '• Maximum Obfuscation - Advanced anti-AI techniques'
      ];

      technicalDetails.forEach(detail => {
        pdf.text(detail, margin, yPosition);
        yPosition += 12;
      });

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 30;
      pdf.line(margin, footerY, pageWidth - margin, footerY);
      
      pdf.setFontSize(8);
      pdf.text('TSMO - AI Training Protection System', margin, footerY + 10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY + 20);
      pdf.text('© 2024 TSMO. All rights reserved.', pageWidth - margin - 60, footerY + 10);

      // Save the PDF
      pdf.save(`TSMO-AI-Protection-Test-Report-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "PDF Generated",
        description: "AI Protection test report has been downloaded as PDF.",
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          AI Protection Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Test the complete AI protection pipeline: create file → apply all 6 protection methods → save to storage → download
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runProtectionTest}
            disabled={testing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {testing ? 'Testing...' : 'Run Protection Test'}
          </Button>

          {testResults?.success && (
            <>
              <Button 
                onClick={downloadTestFile}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Test File
              </Button>
              
              <Button 
                onClick={generateTestReportPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate PDF Report
              </Button>
            </>
          )}
        </div>

        {testResults && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Test {testResults.success ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Protection ID:</strong> {testResults.protectionId || 'N/A'}
              </div>
              <div>
                <strong>Storage Path:</strong> {testResults.storagePath || 'N/A'}
              </div>
              <div>
                <strong>Protection Level:</strong> {testResults.protectionLevel || 'N/A'}
              </div>
              <div>
                <strong>Record ID:</strong> {testResults.recordId || 'N/A'}
              </div>
              
              {testResults.protectionMethods && testResults.protectionMethods.length > 0 && (
                <div>
                  <strong>Applied Methods ({testResults.protectionMethods.length}/6):</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {testResults.protectionMethods.map((method: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {testResults.errors && testResults.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside text-red-600">
                    {testResults.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Expected Methods:</strong> adversarial_noise, rights_metadata, crawler_blocking, 
          invisible_watermark, blockchain_registration, likeness_protection, advanced_fingerprinting, maximum_obfuscation
        </div>
      </CardContent>
    </Card>
  );
};