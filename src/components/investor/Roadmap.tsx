import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Roadmap: React.FC = () => {
  return (
    <section aria-label="TSMO Watch 2.0 Roadmap" className="space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">TSMO Watch 2.0 — Concept Roadmap</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A phased plan to deepen protection, scale globally, and set the standard for digital rights verification.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Phase 1 */}
        <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Phase 1</CardTitle>
              <Badge variant="secondary">Near-term</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Goal: Boost immediate protection depth & creator adoption</p>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <span className="font-medium">Faster Image & Text Crawling</span>
                <br />
                <span className="text-muted-foreground">Expand search to AI model repositories, NFT marketplaces, stock sites, and lesser-known social platforms.</span>
              </li>
              <li>
                <span className="font-medium">Automated DMCA Tools</span>
                <br />
                <span className="text-muted-foreground">One-click takedown request generation from the dashboard.</span>
              </li>
              <li>
                <span className="font-medium">Free Lite Plan Launch</span>
                <br />
                <span className="text-muted-foreground">Limited scans per month to attract small creators and increase brand reach.</span>
              </li>
              <li>
                <span className="font-medium">Real-Time Alerts</span>
                <br />
                <span className="text-muted-foreground">Push notifications for new matches found online.</span>
              </li>
              <li>
                <span className="font-medium">Education Hub</span>
                <br />
                <span className="text-muted-foreground">Guides, webinars, and quick legal tips for creators of all types.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 2 */}
        <Card className="bg-card/60 backdrop-blur-sm border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Phase 2</CardTitle>
              <Badge>Mid-term</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Goal: Make TSMO the most advanced creative protection platform</p>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <span className="font-medium">Invisible “Content DNA” Watermarking</span>
                <br />
                <span className="text-muted-foreground">Embed AI-detectable identifiers in files that survive cropping, filtering, and AI edits.</span>
              </li>
              <li>
                <span className="font-medium">Metadata Locking</span>
                <br />
                <span className="text-muted-foreground">A persistent file signature that stays intact through conversions.</span>
              </li>
              <li>
                <span className="font-medium">Audio & Video Fingerprinting</span>
                <br />
                <span className="text-muted-foreground">Extend beyond images to music, podcasts, and video content.</span>
              </li>
              <li>
                <span className="font-medium">Platform Partnerships</span>
                <br />
                <span className="text-muted-foreground">Deals with Etsy, YouTube, Redbubble, and Instagram for priority takedown processing.</span>
              </li>
              <li>
                <span className="font-medium">Multi-Language Support</span>
                <br />
                <span className="text-muted-foreground">Globalize with dashboards and alerts in top 10 creator languages.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Phase 3 */}
        <Card className="bg-card/60 backdrop-blur-sm border-secondary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Phase 3</CardTitle>
              <Badge variant="outline">Long-term</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Goal: Become the global standard for digital rights verification</p>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <span className="font-medium">Encrypted Creator Vault</span>
                <br />
                <span className="text-muted-foreground">Secure original work storage with blockchain timestamps for indisputable proof of ownership.</span>
              </li>
              <li>
                <span className="font-medium">Global Legal Network</span>
                <br />
                <span className="text-muted-foreground">In-app connection to vetted IP lawyers worldwide, with automated jurisdiction detection.</span>
              </li>
              <li>
                <span className="font-medium">Community Monitoring Network</span>
                <br />
                <span className="text-muted-foreground">Members can flag suspected theft and get credits or rewards for verified finds.</span>
              </li>
              <li>
                <span className="font-medium">AI Dataset Watchdog</span>
                <br />
                <span className="text-muted-foreground">Monitor AI training datasets for unauthorized works and initiate automatic removal requests.</span>
              </li>
              <li>
                <span className="font-medium">Enterprise API</span>
                <br />
                <span className="text-muted-foreground">Let large brands, agencies, and art marketplaces plug TSMO Watch protection directly into their platforms.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Roadmap;
