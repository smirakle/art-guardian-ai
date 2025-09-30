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

      {/* 5x7 inch flyer container with graffiti brick wall style */}
      <div 
        className="flyer-container relative shadow-2xl mx-auto overflow-hidden"
        style={{
          width: '700px',
          height: '1000px',
          aspectRatio: '5/7',
          background: 'linear-gradient(135deg, #1a0933 0%, #2d1055 25%, #0f3460 50%, #5c2a9d 75%, #1a0933 100%)'
        }}
      >
        {/* Brick wall texture overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 35px,
              rgba(0,0,0,0.3) 35px,
              rgba(0,0,0,0.3) 38px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 60px,
              rgba(0,0,0,0.3) 60px,
              rgba(0,0,0,0.3) 63px
            )`,
            backgroundSize: '100% 38px, 63px 100%'
          }}
        />
        
        {/* Grunge texture and paint splatters */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-20 w-32 h-32 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute top-40 left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-16 w-36 h-36 bg-pink-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-24 w-28 h-28 bg-blue-400 rounded-full blur-3xl" />
        </div>

        {/* Paint drips */}
        <div className="absolute top-0 left-1/4 w-2 h-32 bg-cyan-400 opacity-60 blur-sm" />
        <div className="absolute top-0 right-1/3 w-3 h-40 bg-pink-500 opacity-50 blur-sm" />
        
        {/* TSMO logo watermarks */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <img src={tsmoLogo} alt="" className="absolute top-20 left-16 w-28 h-28 object-contain -rotate-12" />
          <img src={tsmoLogo} alt="" className="absolute top-1/2 right-12 w-32 h-32 object-contain rotate-45" />
          <img src={tsmoLogo} alt="" className="absolute bottom-32 left-20 w-24 h-24 object-contain rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Attention-grabbing headline */}
          <div className="px-6 pt-8 pb-4">
            <h1 
              className="text-5xl font-black leading-tight mb-4 tracking-tight"
              style={{
                color: '#FFB800',
                textShadow: '4px 4px 0px rgba(0,0,0,0.5), -2px -2px 0px rgba(255,255,255,0.1)',
                transform: 'rotate(-2deg)',
                letterSpacing: '0.02em'
              }}
            >
              DID SOMEONE
              <br />
              STEAL YOUR
              <br />
              ART?
            </h1>
          </div>

          {/* Visual icons for stolen art */}
          <div className="px-6 flex justify-center gap-6 mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg p-3 flex items-center justify-center border-4 border-black shadow-2xl transform -rotate-3">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg p-3 flex items-center justify-center border-4 border-black shadow-2xl transform rotate-2">
              <Eye className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Main CTA */}
          <div className="px-6 text-center mb-4">
            <p className="text-2xl font-bold text-cyan-300 mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              PROTECT IT WITH
            </p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src={tsmoLogo} alt="TSMO" className="h-12 w-12 brightness-0 invert drop-shadow-2xl" />
              <h2 
                className="text-4xl font-black text-white"
                style={{ 
                  textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                  letterSpacing: '0.05em'
                }}
              >
                TSMO WATCH
              </h2>
            </div>
          </div>

          {/* What You Get - Production Ready Features */}
          <div className="px-6 mb-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border-4 border-cyan-400/50">
              <h3 className="text-xl font-black text-yellow-400 mb-3 text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                FULLY MARKET & PRODUCTION READY
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs">AI Training Dataset Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs">Advanced Image Protection System</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs">Real-Time Scanning & Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs">Legal Templates & DMCA Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs">24/7 Automated Monitoring System</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-auto px-6 pb-6 text-center">
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-4 border-4 border-white/20">
              <p 
                className="text-3xl font-black text-white mb-1"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              >
                TSMOWATCH.COM
              </p>
              <p 
                className="text-xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
              >
                YOUR ART. OUR WATCH.
              </p>
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
