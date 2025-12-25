import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Search, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  ImageIcon,
  Eye,
  FileSearch,
  AlertTriangle
} from "lucide-react";

const ReverseImageSearch = () => {
  const features = [
    {
      icon: Globe,
      title: "Search Across 50+ Platforms",
      description: "Our AI scans social media, stock sites, e-commerce platforms, and the dark web to find where your images appear."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive scan results in minutes, not hours. Real-time monitoring keeps you informed 24/7."
    },
    {
      icon: Shield,
      title: "Legal-Ready Evidence",
      description: "Every match includes timestamped screenshots and metadata for DMCA takedowns and legal proceedings."
    },
    {
      icon: Eye,
      title: "Visual Similarity Detection",
      description: "Detect cropped, edited, filtered, and AI-modified versions of your original work."
    }
  ];

  const faqs = [
    {
      question: "How does reverse image search work?",
      answer: "Our AI analyzes your image's unique visual fingerprint and compares it against billions of indexed images across the web, including social media, stock photo sites, and e-commerce platforms."
    },
    {
      question: "Can you find images that have been edited or cropped?",
      answer: "Yes! Our advanced perceptual hashing technology can identify images even when they've been cropped, color-adjusted, filtered, or partially modified."
    },
    {
      question: "How is this different from Google Image Search?",
      answer: "Unlike Google, TSMO specializes in creator protection. We scan platforms Google doesn't index (like Instagram, TikTok, and certain marketplaces), provide legal-ready documentation, and offer one-click DMCA takedown filing."
    },
    {
      question: "How often do you scan for my images?",
      answer: "Depending on your plan, we scan continuously (every hour), daily, or weekly. You'll receive instant alerts when matches are found."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TSMO Reverse Image Search",
    "applicationCategory": "SecurityApplication",
    "description": "Find where your images are being used online with AI-powered reverse image search technology",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "operatingSystem": "Web",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2500"
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
        <title>Reverse Image Search for Artists | Find Where Your Art Is Used | TSMO</title>
        <meta name="description" content="Find exactly where your images are being used online. TSMO's AI-powered reverse image search scans 50+ platforms to detect unauthorized use of your artwork." />
        <meta name="keywords" content="reverse image search, find where image is used, who is using my photo, image theft detection, stolen art finder" />
        <link rel="canonical" href="https://tsmo.lovable.app/reverse-image-search" />
        <meta property="og:title" content="Reverse Image Search for Artists | TSMO" />
        <meta property="og:description" content="Find exactly where your images are being used online with AI-powered detection." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Image Search</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Find Where Your Images Are Being Used Online
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Stop image theft before it hurts your business. Our AI scans 50+ platforms to find unauthorized use of your artwork, photos, and designs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/upload">
                    <ImageIcon className="h-5 w-5" />
                    Start Free Scan
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <CardTitle className="text-destructive">The Hidden Problem</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    <strong>85% of stolen artwork goes undetected.</strong> Right now, your images could be on print-on-demand sites, 
                    AI training datasets, or competitor websites—and you'd never know. Traditional reverse image search only scratches the surface.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How TSMO Finds Your Stolen Images</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our proprietary AI goes beyond basic reverse image search to detect even modified versions of your work.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Three Steps to Protection</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: 1, title: "Upload Your Work", description: "Drop your images into TSMO. We support all major formats including PSD, RAW, and more." },
                  { step: 2, title: "AI Scans the Web", description: "Our AI searches across social media, stock sites, marketplaces, and even the dark web." },
                  { step: 3, title: "Take Action", description: "Review matches and file DMCA takedowns with one click. We handle the paperwork." }
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
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

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-primary mt-0.5 shrink-0" />
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

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Protecting Your Work Today</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join artists, photographers, and designers protecting their creative work with TSMO.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link to="/upload">
                  <CheckCircle2 className="h-5 w-5" />
                  Try Free Scan
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Link to="/pricing" className="gap-2">
                  See Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReverseImageSearch;
