import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InvestorPitchDeck from '@/components/InvestorPitchDeck';
import ExecutiveSummary from '@/components/investor/ExecutiveSummary';
import InvestorDataRoom from '@/components/investor/InvestorDataRoom';
import DemoEnvironment from '@/components/investor/DemoEnvironment';
import Roadmap from '@/components/investor/Roadmap';
import FoundingPartnerBriefDownload from '@/components/investor/FoundingPartnerBriefDownload';
import { 
  Users, 
  FileText, 
  Database, 
  Monitor,
  Shield,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import ComprehensiveAPIDocumentation from '@/components/enterprise/ComprehensiveAPIDocumentation';
import AdminProtectedPatentDocs from '@/components/AdminProtectedPatentDocs';
import AITPAPatentDocument from '@/components/patent/AITPAPatentDocument';
import AdminOnly from '@/components/AdminOnly';

const InvestorHub = () => {
  useEffect(() => {
    const title = 'TSMO Investor Hub | Digital IP Protection';
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta('description', 'Investor materials, pitch deck, roadmap, and data room for TSMO.');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/investors`;
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            TSMO Investor Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive investment materials for qualified investors and strategic partners
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm text-green-800 font-medium">
              ✅ LIVE PRODUCTION SYSTEM: Real algorithms, active monitoring, measurable performance metrics from deployed infrastructure.
            </p>
          </div>
        </div>
          
          <div className="flex justify-center gap-3">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Request Access
            </Button>
          </div>
        </div>

        {/* Product Updates */}
        <Card className="mb-4 border-accent/30 bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Product Update: Image Forgery Detection</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                We launched a new Image Forgery Detection tool with ELA, metadata, invisible watermark checks, and AI tamper assessment.
              </p>
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => window.open('/forgery-detection', '_blank')}>
              <Shield className="h-4 w-4" />
              View Feature
            </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investment Highlights */}
        <Card className="mb-4 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Investment Opportunity Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">$100K</div>
                <div className="text-xs text-muted-foreground">Seed Round Target</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">$500K-$2M</div>
                <div className="text-xs text-muted-foreground">Pre-Money Valuation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">$15.7B</div>
                <div className="text-xs text-muted-foreground">Total Addressable Market</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-xs text-muted-foreground">Current Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Founding Partner Brief Download */}
        <Card className="mb-4 border-accent/30 bg-gradient-to-r from-accent/10 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Founding Partner Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Comprehensive brief with live metrics, technology overview, and investment details for qualified founding partners.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center py-3">
                <div>
                  <div className="text-lg font-bold text-accent">Live Data</div>
                  <div className="text-xs text-muted-foreground">Real-time metrics</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">Tech Stack</div>
                  <div className="text-xs text-muted-foreground">Full architecture</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">Financials</div>
                  <div className="text-xs text-muted-foreground">Current traction</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">Legal IP</div>
                  <div className="text-xs text-muted-foreground">Patents & assets</div>
                </div>
              </div>
              <FoundingPartnerBriefDownload />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 border-primary/30 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Enterprise Pricing Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Student</h4>
                <p className="text-xs text-muted-foreground mb-1">$19/month</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>1,000 artworks protected</li>
                  <li>Basic AI monitoring</li>
                  <li>5 portfolios</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Starter</h4>
                <p className="text-xs text-muted-foreground mb-1">$29/month</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>3,500 artworks protected</li>
                  <li>Advanced AI monitoring</li>
                  <li>10 portfolios</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Professional</h4>
                <p className="text-xs text-muted-foreground mb-1">$79/month</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Pro creators/agencies</li>
                  <li>Advanced monitoring</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Enterprise</h4>
                <p className="text-xs text-muted-foreground mb-1">$299-$599/month</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Business/legal needs</li>
                  <li>Custom integrations</li>
                  <li>24/7 support</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="font-semibold mb-1 text-sm">Key Features Across All Plans</h5>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Real-time monitoring</li>
                  <li>Deepfake detection</li>
                  <li>Blockchain verification</li>
                  <li>Legal template generator</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-1 text-sm">Enterprise Add-ons</h5>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>White-label solution</li>
                  <li>Custom integrations</li>
                  <li>Dedicated support</li>
                  <li>SLA guarantees</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <Button className="gap-2" onClick={() => window.open('/pricing', '_blank')}>
                View Full Pricing
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => window.open('/contact', '_blank')}>
                <Users className="h-4 w-4" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="pitch" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Pitch Deck
            </TabsTrigger>
            <TabsTrigger value="patents" className="gap-2">
              <Shield className="h-4 w-4" />
              Patent Docs
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="demo" className="gap-2">
              <Monitor className="h-4 w-4" />
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="dataroom" className="gap-2">
              <Database className="h-4 w-4" />
              Data Room
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Shield className="h-4 w-4" />
              Partner API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <ExecutiveSummary />
          </TabsContent>

          <TabsContent value="pitch">
            <InvestorPitchDeck />
          </TabsContent>

          <TabsContent value="patents">
            <AdminOnly 
              fallbackTitle="Patent Documentation Access Restricted" 
              fallbackDescription="Patent documentation contains confidential intellectual property information and filing strategies. Access is restricted to administrators only."
            >
              <div className="space-y-6">
                <AITPAPatentDocument />
                <AdminProtectedPatentDocs />
              </div>
            </AdminOnly>
          </TabsContent>

          <TabsContent value="roadmap">
            <Roadmap />
          </TabsContent>

          <TabsContent value="demo">
            <DemoEnvironment />
          </TabsContent>

          <TabsContent value="dataroom">
            <AdminOnly 
              fallbackTitle="Data Room Access Restricted" 
              fallbackDescription="The data room contains confidential financial, legal, and technical documents intended for qualified investors and administrators only."
            >
              <InvestorDataRoom />
            </AdminOnly>
          </TabsContent>

          <TabsContent value="api">
            <ComprehensiveAPIDocumentation />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold">Ready to Join the IP Protection Revolution?</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            TSMO is positioned to capture significant market share in the rapidly growing IP protection space. 
            Join us as we build the future of digital rights management.
          </p>
          <div className="flex justify-center gap-3">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              shirleena.cunningham@tsmowatch.com
            </Button>
            <Button variant="outline">
              Request Data Room Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorHub;