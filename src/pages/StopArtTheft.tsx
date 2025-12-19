import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Ban,
  Scale,
  Gavel,
  TrendingUp
} from "lucide-react";

const StopArtTheft = () => {
  const protectionMethods = [
    {
      icon: Shield,
      title: "Invisible Watermarking",
      description: "Embed invisible, forensic watermarks that survive cropping, compression, and color changes. Prove ownership in any dispute."
    },
    {
      icon: Lock,
      title: "Blockchain Registration",
      description: "Create an immutable timestamp of your work on the blockchain. Legal-grade proof of creation date and ownership."
    },
    {
      icon: AlertTriangle,
      title: "Real-Time Monitoring",
      description: "24/7 scanning across 50+ platforms. Get instant alerts when your art appears anywhere online."
    },
    {
      icon: Gavel,
      title: "One-Click DMCA",
      description: "File takedown notices in seconds, not hours. Our legal templates are pre-approved by IP attorneys."
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Takedowns Filed" },
    { value: "94%", label: "Success Rate" },
    { value: "48hr", label: "Avg. Removal Time" },
    { value: "50+", label: "Platforms Monitored" }
  ];

  const faqs = [
    {
      question: "What should I do if someone steals my artwork?",
      answer: "First, document the infringement with screenshots including timestamps. Then, use TSMO to file a DMCA takedown notice. If the infringer doesn't comply, we provide legal escalation options including connecting you with IP attorneys."
    },
    {
      question: "How can I prevent my art from being stolen?",
      answer: "Prevention involves multiple layers: invisible watermarking, blockchain registration for proof of ownership, disabling right-click saves (limited effectiveness), and continuous monitoring to catch theft early."
    },
    {
      question: "Can I protect my art from AI training?",
      answer: "Yes! TSMO applies Glaze and Nightshade-style perturbations that confuse AI models while remaining invisible to human viewers. We also add machine-readable tags asserting your copyright."
    },
    {
      question: "What if the thief is in another country?",
      answer: "DMCA applies to any platform with US users or servers. For international platforms, we guide you through their specific takedown processes. Our success rate remains above 90% globally."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TSMO Art Theft Protection",
    "applicationCategory": "SecurityApplication",
    "description": "Stop people from stealing your art online with AI-powered protection, monitoring, and legal enforcement tools",
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
        <title>Stop Art Theft Online | Protect Your Creative Work | TSMO</title>
        <meta name="description" content="Protect your art from being stolen online. TSMO provides invisible watermarking, blockchain proof, real-time monitoring, and one-click DMCA takedowns." />
        <meta name="keywords" content="stop art theft, protect my art online, stop people stealing my art, image theft protection, artwork copyright" />
        <link rel="canonical" href="https://tsmo.lovable.app/stop-art-theft" />
        <meta property="og:title" content="Stop Art Theft Online | TSMO" />
        <meta property="og:description" content="Protect your art from being stolen with AI-powered protection and enforcement." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-6">
                <Ban className="h-4 w-4" />
                <span className="text-sm font-medium">Art Theft Prevention</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Stop People From Stealing Your Art
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Don't let thieves profit from your creativity. TSMO provides military-grade protection, 
                24/7 monitoring, and legal tools to defend your work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/upload">
                    <Shield className="h-5 w-5" />
                    Protect My Art Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Art Theft Is an Epidemic</h2>
              <p className="text-lg text-muted-foreground">
                Every day, thousands of artists discover their work being sold on print-on-demand sites, 
                used in ads without permission, or fed to AI models without consent.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-destructive/5 border-destructive/20">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-destructive mb-2" />
                  <CardTitle>300% Increase</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Art theft cases have tripled since 2020, fueled by print-on-demand and AI tools.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-destructive/5 border-destructive/20">
                <CardHeader>
                  <Scale className="h-8 w-8 text-destructive mb-2" />
                  <CardTitle>$12.5 Billion</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Annual losses to creators from unauthorized use of their digital content.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-destructive/5 border-destructive/20">
                <CardHeader>
                  <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                  <CardTitle>85% Undetected</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Most stolen artwork is never discovered by the original creator.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Protection Methods */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How TSMO Protects Your Art</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A complete defense system that prevents theft, detects infringement, and enforces your rights.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {protectionMethods.map((method, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{method.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">TSMO vs. Doing Nothing</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive">Without TSMO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Thieves sell your art without consequence",
                      "Hours wasted filing DMCA notices manually",
                      "No proof of ownership in disputes",
                      "Art ends up in AI training datasets",
                      "Lost revenue and reputation damage"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Ban className="h-4 w-4 text-destructive shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary">With TSMO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "24/7 monitoring catches theft early",
                      "One-click DMCA takedowns in seconds",
                      "Blockchain-verified ownership proof",
                      "AI training protection built-in",
                      "Legal support and escalation options"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
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
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't Wait Until It's Too Late</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Protect your art today. Once it's stolen and spread across the internet, recovery becomes exponentially harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link to="/upload">
                  <Shield className="h-5 w-5" />
                  Start Protecting Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Link to="/success-stories" className="gap-2">
                  See Success Stories <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StopArtTheft;
