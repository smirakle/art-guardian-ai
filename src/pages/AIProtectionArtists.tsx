import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Bot, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Ban,
  Eye,
  Code,
  Fingerprint,
  Cpu,
  Lock,
  ExternalLink,
  Scale,
  HelpCircle,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AICompanyPolicy {
  id: string;
  company_name: string;
  company_slug: string;
  respects_robots_txt: boolean | null;
  has_opt_out_program: boolean | null;
  opt_out_url: string | null;
  opt_out_effectiveness: string | null;
  crawler_name: string | null;
  last_verified: string;
  policy_sources: unknown;
  legal_cases: unknown;
  notes: string | null;
}

const AIProtectionArtists = () => {
  // Fetch real AI company policies from database
  const { data: aiCompanies, isLoading } = useQuery({
    queryKey: ['ai-company-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_company_policies')
        .select('*')
        .eq('is_active', true)
        .order('company_name');
      
      if (error) throw error;
      return data as AICompanyPolicy[];
    }
  });

  const protectionLayers = [
    {
      icon: Fingerprint,
      title: "Glaze-Style Perturbation",
      description: "Apply invisible pixel modifications that confuse AI models during training, making your style harder to clone.",
      limitation: "Effectiveness varies by AI model. Not guaranteed against all future training methods."
    },
    {
      icon: Code,
      title: "Machine-Readable Tags",
      description: "Embed C2PA and IPTC metadata that signals opt-out preference to compliant AI crawlers.",
      limitation: "Only effective if AI companies choose to respect these tags."
    },
    {
      icon: Eye,
      title: "AI Dataset Monitoring",
      description: "Scan known AI training datasets like LAION to detect if your work has been included.",
      limitation: "Cannot scan proprietary/private datasets. Detection is based on fingerprint matching."
    },
    {
      icon: Lock,
      title: "Robots.txt Evidence",
      description: "Generate timestamped proof of your opt-out requests for potential legal claims.",
      limitation: "Legal enforceability of robots.txt for AI training is still being tested in courts."
    }
  ];

  // Updated FAQs with more honest, nuanced answers
  const faqs = [
    {
      question: "Can I completely stop AI from using my art?",
      answer: "Unfortunately, no single solution can guarantee complete protection. TSMO provides multiple layers of defense that make unauthorized use harder and create evidence for legal claims, but determined bad actors or companies that don't respect opt-outs may still access your work. The legal landscape is still evolving."
    },
    {
      question: "How effective is Glaze-style protection?",
      answer: "Research shows Glaze-style perturbations can reduce style mimicry by AI models, but effectiveness varies. Newer AI models may learn to work around these protections. We recommend using multiple protection layers together rather than relying on any single method."
    },
    {
      question: "Do AI companies actually respect opt-out requests?",
      answer: "Some do, many don't. Google and Adobe have documented opt-out programs. OpenAI's GPTBot respects robots.txt but offers no retroactive removal. Midjourney has no known opt-out program. We track each company's actual behavior based on public documentation and legal filings."
    },
    {
      question: "What legal recourse do I have?",
      answer: "Several major lawsuits (NYT v. OpenAI, Getty v. Stability AI, Andersen v. Midjourney) are testing whether AI training on copyrighted work constitutes infringement. Results are pending. TSMO helps you document your opt-out attempts, which may support future legal claims."
    },
    {
      question: "What if my art is already in AI datasets?",
      answer: "For LAION-5B, you can check and request removal via haveibeentrained.com. However, if your work was used to train existing models, removal from the dataset doesn't 'untrain' those models. Prevention is more effective than retroactive removal."
    }
  ];

  const getEffectivenessColor = (effectiveness: string | null) => {
    switch (effectiveness) {
      case 'effective': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'ineffective': 
      case 'none': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getEffectivenessIcon = (effectiveness: string | null) => {
    switch (effectiveness) {
      case 'effective': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial': return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      case 'ineffective':
      case 'none': return <Ban className="h-5 w-5 text-destructive" />;
      default: return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEffectivenessLabel = (effectiveness: string | null) => {
    switch (effectiveness) {
      case 'effective': return 'Effective Opt-Out';
      case 'partial': return 'Partial Opt-Out';
      case 'ineffective': return 'Ineffective';
      case 'none': return 'No Opt-Out';
      default: return 'Unknown';
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TSMO AI Protection for Artists",
    "applicationCategory": "SecurityApplication",
    "description": "Tools to help protect your art from AI training with perturbations, opt-out tags, and dataset monitoring. Effectiveness varies by method and AI company.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Protect Your Art From AI Training | AI Opt-Out Tools | TSMO</title>
        <meta name="description" content="Tools to help protect your art from AI training. TSMO provides perturbation protection, dataset monitoring, and opt-out documentation. Effectiveness varies." />
        <meta name="keywords" content="protect art from AI, AI training opt out, stop AI from using my art, Glaze protection, AI art theft" />
        <link rel="canonical" href="https://tsmo.lovable.app/ai-protection-artists" />
        <meta property="og:title" content="Protect Your Art From AI Training | TSMO" />
        <meta property="og:description" content="Tools to help protect your art from AI training with perturbation protection and dataset monitoring." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-6">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">AI Protection Tools</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Fight Back Against Unauthorized AI Training
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI companies scrape your art without permission. While no solution is perfect, 
                TSMO provides multiple protection layers and documents your opt-out attempts for potential legal action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/upload">
                    <Shield className="h-5 w-5" />
                    Start Protecting My Art
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-16 bg-destructive/5 border-y border-destructive/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Your Art May Already Be in AI Training Data</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Datasets like LAION-5B contain over 5 billion images scraped from the web. 
                AI companies use this data to train models that can imitate artistic styles.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">5B+</div>
                  <div className="text-sm text-muted-foreground">Images in LAION-5B</div>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">$0</div>
                  <div className="text-sm text-muted-foreground">Paid to Artists</div>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">3+</div>
                  <div className="text-sm text-muted-foreground">Active Lawsuits</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Layers - With Honest Limitations */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Multi-Layer Protection Approach</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No single method is foolproof. We combine multiple approaches to maximize protection and create documentation for legal claims.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {protectionLayers.map((layer, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                      <layer.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle className="text-lg">{layer.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-base">{layer.description}</CardDescription>
                    <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{layer.limitation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Company Policy Tracking - Real Data */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI Company Opt-Out Policy Tracker</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We research and document each AI company's actual opt-out policies based on public information, legal filings, and documented behavior.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading policy data...</div>
                  ) : (
                    <div className="space-y-4">
                      {aiCompanies?.map((company) => (
                        <TooltipProvider key={company.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 gap-3">
                            <div className="flex items-center gap-3">
                              <Cpu className="h-5 w-5 text-muted-foreground shrink-0" />
                              <div>
                              <span className="font-medium">{company.company_name}</span>
                                {company.crawler_name && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({company.crawler_name})
                                  </span>
                                )}
                                {company.legal_cases && Array.isArray(company.legal_cases) && company.legal_cases.length > 0 && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    <Scale className="h-3 w-3 mr-1" />
                                    Active Lawsuit
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-8 sm:ml-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={`flex items-center gap-1.5 text-sm ${getEffectivenessColor(company.opt_out_effectiveness)}`}>
                                    {getEffectivenessIcon(company.opt_out_effectiveness)}
                                    <span className="hidden sm:inline">{getEffectivenessLabel(company.opt_out_effectiveness)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-medium mb-1">{company.company_name}</p>
                                  <p className="text-sm">{company.notes}</p>
                                  {company.opt_out_url && (
                                    <a 
                                      href={company.opt_out_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                                    >
                                      Opt-out link <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                              {company.respects_robots_txt && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">
                                      robots.txt ✓
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Respects robots.txt disallow directives
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <Info className="h-4 w-4 inline mr-1" />
                  Policy data sourced from official documentation, legal filings, and verified reports. 
                  Last updated: {aiCompanies?.[0]?.last_verified ? format(new Date(aiCompanies[0].last_verified), 'MMMM yyyy') : 'Recently'}.
                  <br />
                  <span className="text-xs">Hover/tap on each company for details and sources.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How TSMO Protection Works</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: 1, title: "Upload Your Art", description: "Upload your images. We analyze them and prepare multiple protection layers." },
                  { step: 2, title: "Apply Protections", description: "We apply perturbations and embed opt-out metadata. You download the protected files." },
                  { step: 3, title: "Monitor & Document", description: "Optional: Monitor known datasets for your work. Generate evidence for legal claims." }
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Honest Answers */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Honest Answers About AI Protection</h2>
              <p className="text-muted-foreground">We believe in transparency about what protection can and can't do.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Take Action to Protect Your Art</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              While no protection is perfect, doing nothing guarantees your work remains accessible for AI training. 
              Start building your defense today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link to="/upload">
                  <Shield className="h-5 w-5" />
                  Protect My Art Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/20 hover:bg-white/10 text-white">
                <Link to="/blog" className="gap-2">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AIProtectionArtists;
