import React from 'react';
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
    const content = `TSMO - Executive Summary
Investment Opportunity

Company: TSMO (AI-Powered IP Protection Platform)
Seeking: $100K Seed Funding
Pre-Money Valuation: $1M
Industry: LegalTech / AI / Intellectual Property

THE OPPORTUNITY
The digital creative industry faces a $24.3B annual loss due to IP theft, accelerated by AI training on copyrighted content without permission. Current solutions are reactive, expensive, and don't address AI-era threats.

OUR SOLUTION
TSMO's revolutionary Four-Layer Defense System™:
• AI Training Protection - Patent-pending fingerprinting technology
• Comprehensive Monitoring - 70+ platforms, 95%+ accuracy
• Instant Response - Automated DMCA, blockchain verification
• Legal Enforcement - Expert network integration

MARKET & TRACTION
• Total Addressable Market: $15.7B
• Monthly Recurring Revenue: $200 (+45% MoM)
• Active Users: 50+
• Protected Artworks: 500+
• Exceptional Unit Economics: LTV/CAC = 39x

COMPETITIVE ADVANTAGE
• First-mover in AI protection technology
• Patent portfolio (4 filed, 12 pending)
• Proven technology stack
• Strong early customer adoption

INVESTMENT TERMS
• Seeking: $100K
• Valuation: $1M pre-money
• Security: Convertible Note or Equity
• Use of Funds: 40% Product Development, 30% Team Expansion, 20% Marketing, 10% Operations

TEAM
Experienced leadership with expertise in AI, legal technology, and enterprise software.

CONTACT
investors@tsmo.com
+1 (555) 123-4567

Schedule a demo: calendly.com/tsmo-investors

© 2025 TSMO. Confidential & Proprietary.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TSMO-Executive-Summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <Badge variant="secondary" className="text-xs mt-1">+45% MoM</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <Badge variant="secondary" className="text-xs mt-1">Growing</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Protected Artworks</div>
              <Badge variant="secondary" className="text-xs mt-1">Monitored 24/7</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">25+</div>
              <div className="text-sm text-muted-foreground">DMCA Filed</div>
              <Badge variant="secondary" className="text-xs mt-1">85% Success</Badge>
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
            investors@tsmo.com • +1 (555) 123-4567
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveSummary;