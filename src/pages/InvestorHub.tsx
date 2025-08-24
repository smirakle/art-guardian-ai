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
import ComprehensivePatentDocument from '@/components/ComprehensivePatentDocument';

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
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            TSMO Investor Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive investment materials for qualified investors and strategic partners
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Beta Testing Phase: All metrics shown are projected. No current users at this time.
            </p>
          </div>
        </div>
          
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              Schedule Meeting
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Shield className="h-5 w-5" />
              Request Access
            </Button>
          </div>
        </div>

        {/* Product Updates */}
        <Card className="mb-8 border-accent/30 bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Product Update: Image Forgery Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground">
                We launched a new Image Forgery Detection tool with ELA, metadata, invisible watermark checks, and AI tamper assessment.
              </p>
              <Button variant="secondary" className="gap-2" onClick={() => (window.location.href = '/forgery-detection')}>
                <Shield className="h-4 w-4" />
                View Feature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investment Highlights */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Investment Opportunity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">$100K</div>
                <div className="text-sm text-muted-foreground">Seeking Seed Funding</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">$1M</div>
                <div className="text-sm text-muted-foreground">Pre-Money Valuation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">$15.7B</div>
                <div className="text-sm text-muted-foreground">Total Addressable Market</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">39x</div>
                <div className="text-sm text-muted-foreground">LTV/CAC Ratio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Enterprise Pricing Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-lg border p-4 bg-background/60">
                <h4 className="font-semibold mb-1">Growth</h4>
                <p className="text-sm text-muted-foreground mb-2">$2k–$5k/mo</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Up to 25 seats</li>
                  <li>10k assets monitored</li>
                  <li>Email support</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 bg-background/60">
                <h4 className="font-semibold mb-1">Scale</h4>
                <p className="text-sm text-muted-foreground mb-2">$6k–$12k/mo</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Up to 100 seats</li>
                  <li>100k assets monitored</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 bg-background/60">
                <h4 className="font-semibold mb-1">Enterprise</h4>
                <p className="text-sm text-muted-foreground mb-2">$15k–$30k+/mo</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Unlimited seats & assets</li>
                  <li>SAML SSO, audit logs</li>
                  <li>24/7 SLA</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h5 className="font-semibold mb-2">Setup & Discounts</h5>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>$5k–$20k one-time setup</li>
                  <li>15–25% off annual prepay</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Add‑ons</h5>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>$0.005–$0.02 per web scan</li>
                  <li>$0.10–$0.50 per video minute (deepfake)</li>
                  <li>$2–$5 per 1k API calls</li>
                  <li>$50–$200 per legal notice (DMCA)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" className="gap-2" onClick={() => (window.location.href = '/contact')}>
                Contact Sales
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => (window.location.href = '/investors#schedule')}>
                <Users className="h-5 w-5" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
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
            <ComprehensivePatentDocument />
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
        <div className="mt-16 text-center space-y-4 p-8 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-semibold">Ready to Join the IP Protection Revolution?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TSMO is positioned to capture significant market share in the rapidly growing IP protection space. 
            Join us as we build the future of digital rights management.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              shirleena.cunningham@tsmowatch.com
            </Button>
            <Button variant="outline" size="lg">
              Request Data Room Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorHub;