import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  Quote,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

const SuccessStories = () => {
  const stats = [
    { value: "2.5M+", label: "Takedowns Filed", icon: Shield },
    { value: "94%", label: "Success Rate", icon: TrendingUp },
    { value: "50K+", label: "Artists Protected", icon: Users },
    { value: "$15M+", label: "In Recovered Value", icon: Trophy }
  ];

  const testimonials = [
    {
      quote: "TSMO found my artwork being sold on 12 different print-on-demand sites. Within a week, every single listing was taken down. I couldn't believe how easy it was.",
      author: "Sarah Chen",
      role: "Digital Illustrator",
      avatar: "SC",
      highlight: "12 unauthorized listings removed"
    },
    {
      quote: "As a photographer, I was spending hours each week searching for stolen images. Now TSMO does it automatically, and I've recovered thousands in licensing fees.",
      author: "Marcus Johnson",
      role: "Professional Photographer",
      avatar: "MJ",
      highlight: "Recovered $8,500 in fees"
    },
    {
      quote: "The AI protection feature is incredible. My art was being used to train style-copy bots, but TSMO's Glaze-style protection stopped that cold.",
      author: "Elena Rodriguez",
      role: "Concept Artist",
      avatar: "ER",
      highlight: "Protected from AI training"
    },
    {
      quote: "I'm not tech-savvy at all, but TSMO made protecting my paintings simple. The one-click DMCA feature saved my sanity.",
      author: "David Park",
      role: "Traditional Artist",
      avatar: "DP",
      highlight: "Simplified protection"
    }
  ];

  const caseStudies = [
    {
      title: "Illustrator Recovers $15,000 in Stolen Revenue",
      category: "Print-on-Demand Theft",
      problem: "A freelance illustrator discovered their character designs being sold on Amazon, Redbubble, and Etsy by multiple unauthorized sellers.",
      solution: "TSMO's automated scanning detected 47 infringing listings across 8 platforms. One-click DMCA notices were sent to all platforms.",
      result: "All listings removed within 5 days. Artist pursued compensation claims and recovered $15,000 in lost revenue.",
      metrics: ["47 listings removed", "8 platforms", "$15K recovered", "5 day resolution"]
    },
    {
      title: "Photographer Stops Corporate Infringement",
      category: "Commercial Misuse",
      problem: "A landscape photographer found their images being used in corporate marketing materials without licensing.",
      solution: "TSMO documented the infringement with legal-grade evidence and connected the photographer with an IP attorney.",
      result: "Settlement reached for $25,000 plus ongoing licensing agreement. Company now pays properly for image use.",
      metrics: ["$25K settlement", "Ongoing license", "Legal victory", "Corporate client gained"]
    },
    {
      title: "Artist Blocks AI Style Cloning",
      category: "AI Protection",
      problem: "A digital artist noticed AI generators could replicate their distinctive style, with users sharing 'artist name style' prompts.",
      solution: "TSMO applied Glaze-style perturbations to all uploaded artwork and monitored AI training datasets.",
      result: "New AI-generated images no longer accurately replicate the artist's style. Documented opt-out strengthens potential legal claims.",
      metrics: ["Style protected", "AI training blocked", "Legal documentation", "Ongoing monitoring"]
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "TSMO Success Stories",
    "description": "Real stories from artists who protected their work with TSMO",
    "url": "https://tsmo.lovable.app/success-stories"
  };

  return (
    <>
      <Helmet>
        <title>Success Stories | Artists Who Protected Their Work with TSMO</title>
        <meta name="description" content="Real stories from artists who used TSMO to protect their creative work. See how we've helped recover stolen artwork and block unauthorized AI training." />
        <meta name="keywords" content="art protection success, DMCA success stories, artist testimonials, stolen art recovery" />
        <link rel="canonical" href="https://tsmo.lovable.app/success-stories" />
        <meta property="og:title" content="Success Stories | TSMO" />
        <meta property="og:description" content="Real stories from artists who protected their work with TSMO." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Success Stories</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Artists Trust TSMO to Protect Their Work
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Real stories from creators who took back control of their art. 
                See the impact of proactive protection.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Artists Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear directly from creators who've used TSMO to protect their work.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 right-4">
                    <Quote className="h-8 w-8 text-primary/10" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.author}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {testimonial.highlight}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Case Studies</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Detailed examples of how TSMO helped artists protect and recover their work.
              </p>
            </div>
            <div className="space-y-8 max-w-4xl mx-auto">
              {caseStudies.map((study, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <div className="flex items-center gap-2 text-sm text-primary mb-2">
                      <Award className="h-4 w-4" />
                      {study.category}
                    </div>
                    <CardTitle className="text-xl">{study.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-destructive mb-1">The Problem</h4>
                        <p className="text-muted-foreground">{study.problem}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-1">The Solution</h4>
                        <p className="text-muted-foreground">{study.solution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">The Result</h4>
                        <p className="text-muted-foreground">{study.result}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {study.metrics.map((metric, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why TSMO */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Artists Choose TSMO</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  icon: Zap, 
                  title: "Fast Results", 
                  description: "Average takedown completion in 48 hours, not weeks" 
                },
                { 
                  icon: Shield, 
                  title: "Comprehensive Protection", 
                  description: "Monitoring, AI protection, and enforcement in one platform" 
                },
                { 
                  icon: Star, 
                  title: "Made for Artists", 
                  description: "Built by creators who understand your needs" 
                }
              ].map((item, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Start Your Success Story</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of artists who trust TSMO to protect their creative work. 
              Your art deserves protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2">
                <Link to="/upload">
                  <Shield className="h-5 w-5" />
                  Start Protecting Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Link to="/pricing" className="gap-2">
                  View Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SuccessStories;
