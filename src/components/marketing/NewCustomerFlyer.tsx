import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Gavel, CheckCircle, Printer, Download } from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

export const NewCustomerFlyer: React.FC = () => {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your flyer",
      });

      // Create PDF with text-based content (5x7 inches)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [5, 7]
      });

      // Add header with TSMO branding
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TSMO', 2.5, 0.7, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Art Guardian AI', 2.5, 1.1, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Protect Your Creative Work with AI', 2.5, 1.4, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('Advanced copyright protection powered by artificial intelligence', 0.5, 1.75, { maxWidth: 4, align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Features:', 0.5, 2.2);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('• AI-Powered Protection - Detect unauthorized use', 0.7, 2.6, { maxWidth: 3.8 });
      pdf.text('• 24/7 Monitoring - Real-time alerts', 0.7, 3.0, { maxWidth: 3.8 });
      pdf.text('• Legal Support - Automated DMCA filing', 0.7, 3.4, { maxWidth: 3.8 });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('What You Get:', 0.5, 4.0);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('✓ Unlimited artwork uploads', 0.7, 4.4);
      pdf.text('✓ Blockchain verification certificates', 0.7, 4.7);
      pdf.text('✓ Deepfake detection technology', 0.7, 5.0);
      pdf.text('✓ Priority customer support', 0.7, 5.3);
      pdf.text('✓ Mobile app access (iOS & Android)', 0.7, 5.6);
      
      pdf.setFillColor(255, 215, 0);
      pdf.rect(0.5, 5.9, 4, 0.6, 'F');
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LIMITED TIME: 50% OFF', 2.5, 6.3, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('artguardian.ai', 2.5, 6.7, { align: 'center' });
      
      pdf.save('art-guardian-ai-flyer.pdf');

      toast({
        title: "PDF Downloaded",
        description: "Your flyer has been saved successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Try printing instead.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Print controls - hidden during print */}
      <div className="mb-6 flex gap-4 justify-center print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Flyer
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* 5x7 inch flyer container (700px × 1000px at 100dpi for screen, adjusts for print) */}
      <div 
        className="flyer-container bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 shadow-2xl mx-auto relative overflow-hidden"
        style={{
          width: '700px',
          height: '1000px',
          aspectRatio: '5/7'
        }}
      >
        {/* Decorative background pattern with TSMO logos */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32">
            <img src={tsmoLogo} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute top-1/3 right-16 w-24 h-24 rotate-45">
            <img src={tsmoLogo} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-1/4 left-20 w-28 h-28 -rotate-12">
            <img src={tsmoLogo} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-32 right-12 w-20 h-20 rotate-[30deg]">
            <img src={tsmoLogo} alt="" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Header with creative gradient and logo */}
        <div className="relative bg-gradient-to-br from-primary via-purple-600 to-accent text-white px-8 pt-10 pb-16 overflow-hidden">
          {/* Animated circles background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute -top-10 -right-10 w-48 h-48 border-8 border-white rounded-full animate-pulse" />
            <div className="absolute top-1/2 -left-20 w-64 h-64 border-8 border-white rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>
          
          {/* Large TSMO logo as header centerpiece */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
              <img 
                src={tsmoLogo} 
                alt="TSMO Logo" 
                className="h-24 w-24 relative z-10 drop-shadow-2xl brightness-0 invert"
              />
            </div>
            
            <h1 className="text-5xl font-black mb-4 leading-tight tracking-tight drop-shadow-lg">
              Protect Your<br />Creative Work
            </h1>
            
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/40">
              <p className="text-lg font-bold">
                AI-Powered Copyright Protection
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 space-y-6">
          {/* Key features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">AI-Powered Protection</h3>
                <p className="text-sm text-gray-600">
                  Detect unauthorized use of your artwork across the web and AI training datasets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">24/7 Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Real-time alerts when your content is used without permission
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Gavel className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Legal Support</h3>
                <p className="text-sm text-gray-600">
                  Automated DMCA filing and access to copyright attorneys
                </p>
              </div>
            </div>
          </div>

          {/* What you get */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-xl mb-4 text-center">What You Get</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Unlimited artwork uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Blockchain verification certificates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Deepfake detection technology</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Priority customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">Mobile app access (iOS & Android)</span>
              </div>
            </div>
          </div>

          {/* Special offer */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              LIMITED TIME OFFER
            </p>
            <p className="text-4xl font-black text-gray-900 mb-2">
              50% OFF
            </p>
            <p className="text-sm font-medium text-gray-800">
              First 3 months for new customers
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img 
                src={tsmoLogo} 
                alt="TSMO" 
                className="h-8 w-8 brightness-0 invert"
              />
              <p className="text-3xl font-black tracking-tight">
                TSMO
              </p>
            </div>
            
            <p className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              artguardian.ai
            </p>
            
            <p className="text-sm opacity-90 mb-4">
              Join thousands of creators protecting their work
            </p>
            
            <div className="inline-block bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow">
              Get Started Today!
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .flyer-container, .flyer-container * {
            visibility: visible;
          }
          .flyer-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 5in;
            height: 7in;
            box-shadow: none;
          }
          @page {
            size: 5in 7in;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};
