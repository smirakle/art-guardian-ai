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
  TrendingUp
} from 'lucide-react';

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

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="pitch" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Pitch Deck
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
          </TabsList>

          <TabsContent value="summary">
            <ExecutiveSummary />
          </TabsContent>

          <TabsContent value="pitch">
            <InvestorPitchDeck />
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