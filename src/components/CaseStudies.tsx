import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, Palette, PenTool, Shield, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const caseStudies = [
  {
    id: 1,
    title: "Blueprint Protection",
    creatorName: "Michael Torres",
    creatorRole: "Architectural Designer",
    location: "Austin, TX",
    icon: Compass,
    problem: "Michael discovered his custom CAD blueprints for a residential project were being sold on 3 unauthorized online marketplaces without his knowledge or consent.",
    solution: "After uploading his portfolio to TSMO, our AI monitoring system detected 23 unauthorized listings across multiple platforms within just 48 hours.",
    result: "All 23 listings were successfully removed within 72 hours through automated DMCA notices. Michael prevented an estimated $15,000 in potential losses from stolen designs.",
    metrics: { 
      found: "23 violations", 
      resolved: "72 hours", 
      saved: "$15,000" 
    },
    quote: "I had no idea my blueprints were being sold on multiple sites until TSMO alerted me. The automated takedown process saved me weeks of legal headaches."
  },
  {
    id: 2,
    title: "Portfolio Misuse",
    creatorName: "Sarah Chen",
    creatorRole: "UI/UX Designer",
    location: "San Francisco, CA",
    icon: Palette,
    problem: "Sarah found that a competitor design agency was claiming her portfolio pieces as their own work on their website and client presentations.",
    solution: "TSMO's blockchain timestamping provided irrefutable proof of original ownership, while our monitoring caught the misuse within days of it appearing online.",
    result: "The agency was forced to remove all stolen work and publicly credit Sarah. She also received a settlement for unauthorized commercial use of her designs.",
    metrics: { 
      found: "8 stolen works", 
      resolved: "2 weeks", 
      saved: "$25,000" 
    },
    quote: "The blockchain certificate was the key evidence that proved I was the original creator. Without TSMO, it would have been my word against theirs."
  },
  {
    id: 3,
    title: "Merchandise Theft",
    creatorName: "Jordan Williams",
    creatorRole: "Freelance Illustrator",
    location: "Brooklyn, NY",
    icon: PenTool,
    problem: "Jordan's original character illustrations were discovered printed on t-shirts, phone cases, and stickers sold through multiple print-on-demand sites without any licensing agreement.",
    solution: "TSMO's real-time monitoring triggered immediate alerts when the artwork appeared on e-commerce platforms. Our system identified 47 unauthorized product listings across 6 different vendors.",
    result: "Automated DMCA takedowns removed all infringing products within 5 days. Jordan negotiated a licensing deal with one vendor and received $8,500 in back-royalties from another.",
    metrics: { 
      found: "47 products", 
      resolved: "5 days", 
      saved: "$12,000" 
    },
    quote: "Someone was literally making money off my characters while I struggled to pay rent. TSMO helped me take back control and even turn it into a revenue stream."
  }
];

const CaseStudies = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Real Stories, Real Results
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Creator Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how TSMO has helped artists, designers, and creators protect their work and recover from intellectual property theft.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {caseStudies.map((study) => {
            const IconComponent = study.icon;
            return (
              <Card key={study.id} className="bg-card border-border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{study.title}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold">
                      {study.creatorName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{study.creatorName}</p>
                      <p className="text-sm text-muted-foreground">{study.creatorRole}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">The Problem</p>
                    <p className="text-sm text-muted-foreground">{study.problem}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">How TSMO Helped</p>
                    <p className="text-sm text-muted-foreground">{study.solution}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">The Result</p>
                    <p className="text-sm text-muted-foreground">{study.result}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Shield className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold">{study.metrics.found}</p>
                      <p className="text-xs text-muted-foreground">Found</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold">{study.metrics.resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-semibold">{study.metrics.saved}</p>
                      <p className="text-xs text-muted-foreground">Protected</p>
                    </div>
                  </div>

                  <blockquote className="pt-4 border-t border-border">
                    <p className="text-sm italic text-muted-foreground">"{study.quote}"</p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Verified TSMO User</span>
                    </div>
                  </blockquote>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Join thousands of creators who trust TSMO to protect their intellectual property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/upload">Start Protecting Your Work</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/pricing">View All Features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
