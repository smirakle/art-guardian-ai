import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InvestorPitchDeck from '@/components/InvestorPitchDeck';
import ExecutiveSummary from '@/components/investor/ExecutiveSummary';
import InvestorDataRoom from '@/components/investor/InvestorDataRoom';
import DemoEnvironment from '@/components/investor/DemoEnvironment';
import Roadmap from '@/components/investor/Roadmap';
import { 
  Users, 
  FileText, 
  Database, 
  Monitor,
  Shield,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import IPGuardrailDocumentation from '@/components/enterprise/IPGuardrailDocumentation';
import AdminProtectedPatentDocs from '@/components/AdminProtectedPatentDocs';

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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Beta Testing Phase: All metrics shown are projected. No current users at this time.
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
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => (window.location.href = '/forgery-detection')}>
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
                <div className="text-xs text-muted-foreground">Seeking Seed Funding</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">$1M</div>
                <div className="text-xs text-muted-foreground">Pre-Money Valuation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">$15.7B</div>
                <div className="text-xs text-muted-foreground">Total Addressable Market</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">39x</div>
                <div className="text-xs text-muted-foreground">LTV/CAC Ratio</div>
              </div>
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
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Growth</h4>
                <p className="text-xs text-muted-foreground mb-1">$2k–$5k/mo</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Up to 25 seats</li>
                  <li>10k assets monitored</li>
                  <li>Email support</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Scale</h4>
                <p className="text-xs text-muted-foreground mb-1">$6k–$12k/mo</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Up to 100 seats</li>
                  <li>100k assets monitored</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3 bg-background/60">
                <h4 className="font-semibold mb-1 text-sm">Enterprise</h4>
                <p className="text-xs text-muted-foreground mb-1">$15k–$30k+/mo</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Unlimited seats & assets</li>
                  <li>SAML SSO, audit logs</li>
                  <li>24/7 SLA</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="font-semibold mb-1 text-sm">Setup & Discounts</h5>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>$5k–$20k one-time setup</li>
                  <li>15–25% off annual prepay</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-1 text-sm">Add‑ons</h5>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>$0.005–$0.02 per web scan</li>
                  <li>$0.10–$0.50 per video minute (deepfake)</li>
                  <li>$2–$5 per 1k API calls</li>
                  <li>$50–$200 per legal notice (DMCA)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <Button className="gap-2" onClick={() => (window.location.href = '/contact')}>
                Contact Sales
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => (window.location.href = '/investors#schedule')}>
                <Users className="h-4 w-4" />
                Schedule Meeting
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
            <AdminProtectedPatentDocs />
          </TabsContent>

          <TabsContent value="roadmap">
            <Roadmap />
          </TabsContent>

          <TabsContent value="demo">
            <DemoEnvironment />
          </TabsContent>

          <TabsContent value="dataroom">
            <InvestorDataRoom />
          </TabsContent>

          <TabsContent value="api">
            <IPGuardrailDocumentation />
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