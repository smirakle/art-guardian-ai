import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Gavel, CheckCircle, Printer, Download } from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

export const NewCustomerFlyer: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    window.print();
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
        className="flyer-container bg-white text-gray-900 shadow-2xl mx-auto relative overflow-hidden"
        style={{
          width: '700px',
          height: '1000px',
          aspectRatio: '5/7'
        }}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-8 pb-12">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute bottom-4 left-4 w-24 h-24 border-4 border-white rounded-full" />
          </div>
          
          <div className="relative z-10">
            <img 
              src={tsmoLogo} 
              alt="TSMO Logo" 
              className="h-16 mb-4 brightness-0 invert"
            />
            
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              Protect Your Creative Work with AI
            </h1>
            
            <p className="text-xl font-medium opacity-95">
              Advanced copyright protection powered by artificial intelligence
            </p>
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
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white p-6 text-center">
          <p className="text-2xl font-bold mb-2">
            artguardian.ai
          </p>
          <p className="text-sm opacity-75 mb-3">
            Join thousands of creators protecting their work
          </p>
          <div className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-bold">
            Sign up today!
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
