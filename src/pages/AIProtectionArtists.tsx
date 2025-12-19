import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
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
  Lock
} from "lucide-react";

const AIProtectionArtists = () => {
  const protectionLayers = [
    {
      icon: Fingerprint,
      title: "Glaze-Style Perturbation",
      description: "Apply invisible pixel modifications that confuse AI models during training, making your style unclonable."
    },
    {
      icon: Code,
      title: "Machine-Readable Tags",
      description: "Embed C2PA and IPTC metadata that tells AI crawlers to opt-out of training datasets."
    },
    {
      icon: Eye,
      title: "AI Dataset Monitoring",
      description: "Scan major AI training datasets like LAION to detect if your work has been scraped without permission."
    },
    {
      icon: Lock,
      title: "Robots.txt Enforcement",
      description: "Track which AI companies respect your opt-out requests and generate legal evidence when they don't."
    }
  ];

  const aiCompanies = [
    { name: "OpenAI", status: "Monitored", respects: true },
    { name: "Midjourney", status: "Monitored", respects: false },
    { name: "Stability AI", status: "Monitored", respects: true },
    { name: "Google", status: "Monitored", respects: true },
    { name: "Meta AI", status: "Monitored", respects: false },
    { name: "Adobe Firefly", status: "Monitored", respects: true }
  ];

  const faqs = [
    {
      question: "How do I stop AI from using my art?",
      answer: "TSMO applies multiple protection layers: Glaze-style perturbations that confuse AI models, C2PA/IPTC metadata tags for opt-out, and continuous monitoring of AI training datasets to catch unauthorized use."
    },
    {
      question: "What is Glaze and how does it work?",
      answer: "Glaze adds invisible perturbations to your images that look normal to humans but confuse AI models. When AI tries to learn your style, it instead learns 'noise' that makes cloning your work impossible."
    },
    {
      question: "Can AI companies legally use my art for training?",
      answer: "This is a gray area being tested in courts. Artists like Sarah Andersen are suing AI companies for copyright infringement. TSMO documents your opt-out attempts to support potential legal claims."
    },
    {
      question: "Do these protections affect image quality?",
      answer: "No! Our perturbations are designed to be imperceptible to human viewers while remaining effective against AI. Your images look exactly the same to your audience."
    },
    {
      question: "What if my art is already in AI datasets?",
      answer: "We can detect if your work is in known datasets and help you file removal requests. For new uploads, we apply protection before any AI can scrape them."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TSMO AI Protection for Artists",
    "applicationCategory": "SecurityApplication",
    "description": "Protect your art from AI training with Glaze-style perturbations, opt-out tags, and dataset monitoring",
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
        <title>Protect Your Art From AI Training | AI Opt-Out for Artists | TSMO</title>
        <meta name="description" content="Stop AI from stealing your art style. TSMO applies Glaze-style protection, monitors AI datasets, and helps you opt-out of AI training." />
        <meta name="keywords" content="protect art from AI, AI training opt out, stop AI from using my art, Glaze protection, AI art theft" />
        <link rel="canonical" href="https://tsmo.lovable.app/ai-protection-artists" />
        <meta property="og:title" content="Protect Your Art From AI Training | TSMO" />
        <meta property="og:description" content="Stop AI from stealing your art style with Glaze-style protection and dataset monitoring." />
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
                <span className="text-sm font-medium">AI Protection Technology</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Stop AI From Stealing Your Art Style
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                AI companies scrape your art to train their models without permission or payment. 
                TSMO fights back with cutting-edge protection technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/upload">
                    <Shield className="h-5 w-5" />
                    Protect My Art From AI
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
              <h2 className="text-2xl font-bold mb-4">Your Art Is Feeding AI Models Right Now</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Datasets like LAION-5B contain over 5 billion images scraped from the web—likely including yours. 
                AI companies use this data to train models that can clone your unique style in seconds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">5B+</div>
                  <div className="text-sm text-muted-foreground">Images in LAION</div>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">0%</div>
                  <div className="text-sm text-muted-foreground">Artists Compensated</div>
                </div>
                <div className="px-4 py-2 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-destructive">∞</div>
                  <div className="text-sm text-muted-foreground">Copies Generated</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Layers */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Multi-Layer AI Protection</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive defense system that prevents AI from learning your style and detects unauthorized training.
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
                  <CardContent>
                    <CardDescription className="text-base">{layer.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Company Tracking */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">We Track AI Companies</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Monitor which companies respect your opt-out requests and generate evidence for legal action when they don't.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {aiCompanies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{company.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{company.status}</span>
                          {company.respects ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Ban className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-sm text-muted-foreground mt-4">
                * Based on publicly available information about opt-out policies
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Protection in 3 Steps</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: 1, title: "Upload Your Art", description: "Upload your images. We analyze them and prepare multiple protection layers." },
                  { step: 2, title: "Apply AI Shield", description: "We apply Glaze-style perturbations and embed opt-out metadata invisibly." },
                  { step: 3, title: "Monitor & Enforce", description: "Continuous scanning of AI datasets. Alerts when your work is detected." }
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
            <h2 className="text-3xl font-bold mb-4">Take Back Control of Your Art</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Don't let AI companies profit from your creativity without permission. 
              Start protecting your work today.
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
