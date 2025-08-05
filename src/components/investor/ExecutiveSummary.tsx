import React from 'react';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  DollarSign, 
  Users, 
  Zap,
  Award,
  Globe,
  Download,
  ExternalLink
} from 'lucide-react';

const ExecutiveSummary = () => {
  const handleDownloadSummary = () => {
    const pdf = new jsPDF();
    
    // Add content to PDF
    pdf.setFontSize(20);
    pdf.text('TSMO - Executive Summary', 20, 30);
    pdf.text('Investment Opportunity', 20, 45);
    
    pdf.setFontSize(12);
    pdf.text('Company: TSMO (AI-Powered IP Protection Platform)', 20, 65);
    pdf.text('Seeking: $100K Seed Funding', 20, 75);
    pdf.text('Pre-Money Valuation: $1M', 20, 85);
    pdf.text('Industry: LegalTech / AI / Intellectual Property', 20, 95);
    
    pdf.setFontSize(14);
    pdf.text('THE OPPORTUNITY', 20, 115);
    pdf.setFontSize(10);
    pdf.text('The digital creative industry faces a $24.3B annual loss due to IP theft,', 20, 125);
    pdf.text('accelerated by AI training on copyrighted content without permission.', 20, 135);
    pdf.text('Current solutions are reactive, expensive, and don\'t address AI-era threats.', 20, 145);
    
    pdf.setFontSize(14);
    pdf.text('OUR SOLUTION', 20, 165);
    pdf.setFontSize(10);
    pdf.text('TSMO\'s revolutionary Four-Layer Defense System™:', 20, 175);
    pdf.text('• AI Training Protection - Patent-pending fingerprinting technology', 20, 185);
    pdf.text('• Comprehensive Monitoring - 70+ platforms, 95%+ accuracy', 20, 195);
    pdf.text('• Instant Response - Automated DMCA, blockchain verification', 20, 205);
    pdf.text('• Legal Enforcement - Expert network integration', 20, 215);
    
    pdf.text('MARKET & TRACTION (PROJECTED)', 20, 235);
    pdf.setFontSize(10);
    pdf.text('• Total Addressable Market: $15.7B', 20, 245);
    pdf.text('• Monthly Recurring Revenue: $200 (Projected)', 20, 255);
    pdf.text('• Active Users: 50+ (Projected)', 20, 265);
    pdf.text('• Protected Artworks: 500+ (Projected)', 20, 275);
    pdf.text('• Exceptional Unit Economics: LTV/CAC = 39x (Projected)', 20, 285);
    
    pdf.setFontSize(8);
    pdf.text('⚠️ Beta Testing Phase: This information is purely projected.', 20, 300);
    pdf.text('No current users at this time. Currently in Beta Testing phase.', 20, 310);
    
    pdf.text('CONTACT', 20, 320);
    pdf.text('shirleena.cunningham@tsmowatch.com', 20, 330);
    pdf.text('Schedule a demo: calendly.com/tsmo-investors', 20, 340);
    
    pdf.text('© 2025 TSMO. Confidential & Proprietary.', 20, 360);
    
    pdf.save('TSMO-Executive-Summary.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-sm">
          Confidential Investment Opportunity
        </Badge>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TSMO Executive Summary
        </h1>
        <p className="text-xl text-muted-foreground">
          AI-Powered Intellectual Property Protection Platform
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Beta Testing Phase: This information is purely projected. No current users at this time. 
            Currently in Beta Testing phase.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownloadSummary} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Schedule Demo
          </Button>
        </div>
      </div>

      {/* Investment Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Investment Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Funding Seeking</span>
                <span className="text-lg font-bold text-primary">$100K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pre-Money Valuation</span>
                <span className="text-lg font-bold text-primary">$1M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Addressable Market</span>
                <span className="text-lg font-bold text-primary">$15.7B</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current MRR</span>
                <span className="text-lg font-bold text-green-600">$200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LTV/CAC Ratio</span>
                <span className="text-lg font-bold text-green-600">39x</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Patent Portfolio</span>
                <span className="text-lg font-bold text-blue-600">16 Total</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem & Solution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Target className="h-5 w-5" />
              The Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">$24.3B</div>
              <div className="text-sm text-red-700">Annual IP theft losses</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">400%</div>
              <div className="text-sm text-red-700">Increase in infringement</div>
            </div>
            <p className="text-sm text-red-700">
              AI training on copyrighted content accelerates theft. Current solutions are reactive and expensive.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              Our Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">95%+</div>
              <div className="text-sm text-green-700">Detection accuracy</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">70+</div>
              <div className="text-sm text-green-700">Platforms monitored</div>
            </div>
            <p className="text-sm text-green-700">
              Four-Layer Defense System™ with AI training protection, monitoring, instant response, and legal enforcement.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Subscription Revenue (70%)</span>
              <div className="flex items-center gap-2">
                <Progress value={70} className="w-20" />
                <span className="text-sm font-medium">$19.99 - $5,000/mo</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Transaction Fees (20%)</span>
              <div className="flex items-center gap-2">
                <Progress value={20} className="w-20" />
                <span className="text-sm font-medium">15-20% commission</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Enterprise Solutions (10%)</span>
              <div className="flex items-center gap-2">
                <Progress value={10} className="w-20" />
                <span className="text-sm font-medium">$10K - $250K/year</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Traction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Traction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">$200</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
              <Badge variant="secondary" className="text-xs mt-1">Projected</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <Badge variant="secondary" className="text-xs mt-1">Projected</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Protected Artworks</div>
              <Badge variant="secondary" className="text-xs mt-1">Projected</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">25+</div>
              <div className="text-sm text-muted-foreground">DMCA Filed</div>
              <Badge variant="secondary" className="text-xs mt-1">Projected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use of Funds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Use of Funds ($100K)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Product Development & R&D</span>
              <div className="flex items-center gap-2">
                <Progress value={40} className="w-24" />
                <span className="font-medium">$40K (40%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Team Expansion</span>
              <div className="flex items-center gap-2">
                <Progress value={30} className="w-24" />
                <span className="font-medium">$30K (30%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Sales & Marketing</span>
              <div className="flex items-center gap-2">
                <Progress value={20} className="w-24" />
                <span className="font-medium">$20K (20%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Operations & Legal</span>
              <div className="flex items-center gap-2">
                <Progress value={10} className="w-24" />
                <span className="font-medium">$10K (10%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Immediate Milestones (6 months)</h3>
              <ul className="space-y-2 text-sm">
                <li>• Scale to $5K MRR</li>
                <li>• Expand team to 5 members</li>
                <li>• Launch enterprise pilot program</li>
                <li>• File additional patents</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Long-term Vision (18 months)</h3>
              <ul className="space-y-2 text-sm">
                <li>• $50K MRR, Series A ready</li>
                <li>• International market expansion</li>
                <li>• Platform API ecosystem</li>
                <li>• Strategic partnerships</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Ready to Join the IP Protection Revolution?</h3>
          <div className="flex justify-center gap-4">
            <Button size="lg">
              <Users className="h-4 w-4 mr-2" />
              Schedule Investor Meeting
            </Button>
            <Button variant="outline" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Pitch Deck
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            shirleena.cunningham@tsmowatch.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummary;