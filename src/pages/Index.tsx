import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LeaveReview from "@/components/LeaveReview";
import ContextualHelp from "@/components/help-system/ContextualHelp";
import { BugReportButton } from "@/components/BugReportButton";
import { UserGuide } from "@/components/UserGuide";
import { homeGuide } from "@/data/userGuides";
import { Shield, Eye, Activity, Link2, Search, Check, Star, ArrowRight, Zap, Globe, Lock, TrendingUp, Users, Mail, Phone, MapPin, FileImage, Upload, Scan, Bot, Play, ChevronRight, FileText, Scale, Building, Heart, ExternalLink, UserX, Calendar, Info } from "lucide-react";
import { ShieldCheck, EyeOff, Fingerprint, Code2, BadgeCheck } from "lucide-react";
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import bizWeeklyBanner from "@/assets/biz-weekly-banner.png";
import MonitoringFlow from "@/components/MonitoringFlow";
import LoadingSpinner from "@/components/LoadingSpinner";
import OnboardingTour from "@/components/OnboardingTour";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import MobileAppCTA from "@/components/MobileAppCTA";
import ProtectionComparisonShowcase from "@/components/ProtectionComparisonShowcase";
import TrustBadges from "@/components/TrustBadges";
import { ProblemToSolutionTransition } from "@/components/ProblemToSolutionTransition";
const Index = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  useEffect(() => {
    const title = "TSMO | AI Art Protection & Forgery Detection";
    document.title = title;
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta("description", "Protect your art with AI monitoring, blockchain verification, and image forgery detection.");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/`;

    // Organization structured data
    let script = document.querySelector('script[data-ld="org"]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-ld", "org");
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TSMO",
      url: window.location.origin,
      logo: window.location.origin + "/favicon.ico"
    });
  }, []);
  const [demoStep, setDemoStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSalesDialog, setShowSalesDialog] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    name: "",
    email: "",
    company: "",
    interestedPlan: "",
    message: ""
  });
  const [isSendingSales, setIsSendingSales] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [showSolutionsDialog, setShowSolutionsDialog] = useState(false);
  const startDemo = () => {
    setIsAnalyzing(true);
    setDemoStep(1);

    // Simulate analysis steps
    setTimeout(() => setDemoStep(2), 2000);
    setTimeout(() => setDemoStep(3), 4000);
    setTimeout(() => setDemoStep(4), 6000);
    setTimeout(() => {
      setDemoStep(5);
      setIsAnalyzing(false);
    }, 8000);
  };
  const resetDemo = () => {
    setDemoStep(0);
    setIsAnalyzing(false);
  };
  const handlePricingPlan = (plan: string) => {
    if (plan === "Contact Sales") {
      setSalesFormData(prev => ({
        ...prev,
        interestedPlan: "Enterprise"
      }));
      setShowSalesDialog(true);
    } else {
      toast({
        title: `${plan} Plan Selected`,
        description: "Redirecting to checkout..."
      });
      // Navigate to checkout
      setTimeout(() => {
        navigate(`/checkout?plan=${plan.toLowerCase()}`);
      }, 1500);
    }
  };
  const handleSalesInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingSales(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("send-sales-inquiry", {
        body: salesFormData
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Sales Inquiry Sent!",
        description: "Thank you for your interest. Our sales team will contact you within 24 hours."
      });
      setShowSalesDialog(false);
      setSalesFormData({
        name: "",
        email: "",
        company: "",
        interestedPlan: "",
        message: ""
      });
    } catch (error) {
      console.error("Error sending sales inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send sales inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingSales(false);
    }
  };
  const handleFreeTrial = (plan: string) => {
    toast({
      title: "Free Trial Started!",
      description: `Your 5-day ${plan} trial is now active. Check your email for setup instructions.`
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* User Experience Enhancements */}
      <ContextualHelp />

      {/* Live Demo Modal */}
      <Dialog open={showLiveDemo} onOpenChange={setShowLiveDemo}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Demo - TSMO Protection Platform</DialogTitle>
            <DialogDescription>
              Experience our IP protection platform in action with real-time monitoring simulation.
            </DialogDescription>
          </DialogHeader>
          <DemoEnvironment />
        </DialogContent>
      </Dialog>

      {/* Removed floating navigation for cleaner mobile experience */}


      {/* Hero Section - Simplified for Conversion */}
      <section className="pt-16 sm:pt-20 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          {/* TSMO Logo - Dramatically Reduced */}
          <div className="mb-6">
            <img src={tsmoLogo} alt="TSMO Logo" className="h-[10.5rem] sm:h-[14rem] md:h-[17.5rem] mx-auto object-contain" loading="eager" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">Protect Your Art
Own Your Future</h1>

          
          
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto italic font-sans text-center font-light">"TSMO was created for Independent artists, designers, musicians, small-to-mid-size creative brands" - Shirleena Cunningham, Founder and CEO</p>

          {/* Primary Sign-Up CTA */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="email" placeholder="Enter your email" className="flex-1 h-12 text-base" />
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 whitespace-nowrap" onClick={() => navigate("/upload")}>
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No credit card required
            </p>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button variant="outline" size="lg" onClick={() => setShowLiveDemo(true)}>
              <Play className="mr-2 h-4 w-4" />
              Watch Live Demo
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90" onClick={() => navigate('/demo/visual')}>
              <Zap className="mr-2 h-4 w-4" />
              2-Min Visual Demo
            </Button>
          </div>

          {/* Key Features - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Reverse Image Search</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                <Link2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Blockchain Certificates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* As Seen On Banner */}
      <section className="py-8 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <img 
            src={bizWeeklyBanner} 
            alt="As seen on BizWeekly" 
            className="w-full max-w-xl mx-auto h-auto object-contain"
            loading="lazy"
          />
        </div>
      </section>

      {/* STEP 2: Industry Challenge - The Problem */}
      <section className="bg-gradient-to-b from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 py-12 px-4 border-y border-amber-200/50 dark:border-amber-800/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50">
              <Info className="w-3 h-3 mr-1" />
              Industry Challenge
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-amber-900 dark:text-amber-100">
              The Hidden Cost of Unprotected Content
            </h2>
            <p className="text-base text-amber-800/80 dark:text-amber-200/80 max-w-2xl mx-auto">
              Understanding the challenges helps you make informed decisions about protecting your creative work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-amber-200/60 dark:border-amber-700/40 bg-card/90 backdrop-blur-sm hover-lift">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-2">~50%</div>
                <p className="text-sm text-muted-foreground">
                  Of creators have had their content stolen or used without permission by brands
                </p>
                <a 
                  href="https://massive.io/newsroom/2024-survey-finds-creator-user-generated-content-stole-by-brands/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/70 hover:text-amber-600 mt-2 inline-flex items-center gap-1 transition-colors"
                >
                  Source: MASV / Dynata 2024 →
                </a>
              </CardContent>
            </Card>

            <Card className="border-amber-200/60 dark:border-amber-700/40 bg-card/90 backdrop-blur-sm hover-lift">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-2">57%</div>
                <p className="text-sm text-muted-foreground">
                  Of US artists worry about financial vulnerability including food, housing & medical care
                </p>
                <a 
                  href="https://www.mellon.org/news/new-national-study-offers-fresh-insight-lives-livelihoods-us-artists" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/70 hover:text-amber-600 mt-2 inline-flex items-center gap-1 transition-colors"
                >
                  Source: Mellon Foundation 2025 →
                </a>
              </CardContent>
            </Card>

            <Card className="border-amber-200/60 dark:border-amber-700/40 bg-card/90 backdrop-blur-sm hover-lift">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-2">71%</div>
                <p className="text-sm text-muted-foreground">
                  Of US independent creators earn less than $30,000 annually from creative work
                </p>
                <a 
                  href="https://www.mbopartners.com/state-of-independence/creator-economy-report/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/70 hover:text-amber-600 mt-2 inline-flex items-center gap-1 transition-colors"
                >
                  Source: MBO Partners 2023 →
                </a>
              </CardContent>
            </Card>

            <Card className="border-amber-200/60 dark:border-amber-700/40 bg-card/90 backdrop-blur-sm hover-lift">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-2">34%</div>
                <p className="text-sm text-muted-foreground">
                  Less likely to survive 5 years if your intellectual property rights are infringed
                </p>
                <a 
                  href="https://www.oecd.org/en/publications/risks-of-illicit-trade-in-counterfeits-to-small-and-medium-sized-firms_fa6d5089-en.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/70 hover:text-amber-600 mt-2 inline-flex items-center gap-1 transition-colors"
                >
                  Source: OECD / EUIPO 2023 →
                </a>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/50"
              onClick={() => setShowSolutionsDialog(true)}
            >
              See How We Solve This
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Solutions Dialog */}
          <Dialog open={showSolutionsDialog} onOpenChange={setShowSolutionsDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">How TSMO Protects Creators</DialogTitle>
                <DialogDescription>
                  Our platform directly addresses the challenges independent creators face with comprehensive protection tools.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-700">Problem: ~50% stolen</Badge>
                        <h4 className="font-semibold text-base">24/7 AI Monitoring & Detection</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Our AI continuously scans platforms, marketplaces, and social media—detecting unauthorized use of your work within hours, not months.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Real-time platform monitoring</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Visual fingerprint matching</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Instant theft alerts</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-700">Problem: 57% financial worry</Badge>
                        <h4 className="font-semibold text-base">Automated DMCA & Legal Support</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Free takedown notices, legal templates, and IP lawyer access help creators recover lost income from infringement quickly and affordably.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> One-click DMCA notices</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Legal template library</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> IP attorney network</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-700">Problem: 71% earn &lt;$30K</Badge>
                        <h4 className="font-semibold text-base">Proof of Ownership & Licensing</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Blockchain verification and licensing tools help you monetize your work and prove ownership for brand partnerships and commercial opportunities.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Blockchain certificates</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Commercial licensing tools</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Ownership verification</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-700">Problem: 34% survival risk</Badge>
                        <h4 className="font-semibold text-base">Proactive IP Protection</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Invisible watermarking, AI training detection, and real-time alerts prevent infringement before it damages your business and reputation.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Invisible watermarks</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> AI training detection</li>
                      <li className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /> Preventive protection</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="mt-6 flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setShowSolutionsDialog(false)}>
                  Close
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  onClick={() => {
                    setShowSolutionsDialog(false);
                    navigate("/upload");
                  }}
                >
                  Start Protecting Your Work
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* STEP 3: Problem to Solution Transition */}
      <ProblemToSolutionTransition />

      {/* STEP 4: How It Works & Features - The Solution */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Protect You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive protection system combines AI technology, blockchain verification, and legal automation
              to safeguard your creative work.
            </p>
          </div>

          {/* Step-by-step Process */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload & Protect</h3>
              <p className="text-muted-foreground">
                Upload your artwork and apply our invisible protection layers that don't affect image quality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 AI Monitoring</h3>
              <p className="text-muted-foreground">
                Our AI continuously scans the internet, social media, and marketplaces for unauthorized use
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Detection</h3>
              <p className="text-muted-foreground">
                Get notified immediately when violations are found, with detailed evidence and location data
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Response</h3>
              <p className="text-muted-foreground">
                Automatic takedown notices and legal documentation to protect your rights
              </p>
            </div>
          </div>

          {/* Core Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual Recognition</CardTitle>
                <CardDescription>
                  Advanced AI analyzes your artwork and detects unauthorized usage across the web
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  24/7 surveillance across platforms, marketplaces, and social media networks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Blockchain Verification</CardTitle>
                <CardDescription>
                  Immutable proof of creation and ownership through blockchain technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Deep Web Scanning</CardTitle>
                <CardDescription>
                  Advanced dark web monitoring and threat detection for comprehensive protection
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Additional Capabilities */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Instant Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Immediate notifications with detailed evidence packages
              </p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Automated legal evidence preparation
              </p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Legal Support</h3>
              <p className="text-sm text-muted-foreground">
                Access to IP lawyers and DMCA assistance
              </p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Track protection status and violation trends
              </p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Artist Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect and share protection strategies
              </p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Global Coverage</h3>
              <p className="text-sm text-muted-foreground">
                International monitoring and enforcement
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="px-8 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" onClick={() => navigate("/upload")}>
              Start Protecting Your Art
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* STEP 5: Protection Comparison Showcase - Proof */}
      <ProtectionComparisonShowcase />

      {/* STEP 6: Trust Badges - Social Proof */}
      <TrustBadges />

      {/* STEP 7: Mid-Page CTA - Conversion */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Your Creative Work?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of artists who trust TSMO to safeguard their digital creations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" onClick={() => navigate("/upload")}>
              Start Protecting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 h-12" onClick={() => navigate("/pricing")}>
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Legal Resources Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Legal Resources & Support</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access professional legal templates and connect with IP specialists to protect your creative work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Legal Templates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Professional legal documents ready to download and customize.
                </p>
                <div className="text-xs text-muted-foreground mb-4">
                  <div>$2.99 with membership</div>
                  <div>$9.99 without membership</div>
                </div>
                <Button size="sm" className="w-full" onClick={() => navigate("/legal-templates")}>
                  Browse Templates
                </Button>
              </div>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">IP Lawyers Directory</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with verified intellectual property attorneys.
                </p>
                <div className="text-xs text-muted-foreground mb-4">
                  <div>Verified specialists</div>
                  <div>Free consultations available</div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/lawyers")}>
                  Find a Lawyer
                </Button>
              </div>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Official Authorities</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Government copyright offices and intellectual property organizations.
                </p>
                <div className="space-y-2">
                  <a href="https://www.copyright.gov" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    US Copyright Office <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    WIPO <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a href="https://euipo.europa.eu" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    EU Copyright <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Legal Support Network</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Organizations providing legal aid and support for artists.
                </p>
                <div className="space-y-2">
                  <a href="https://www.vlaa.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    Volunteer Lawyers for the Arts <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a href="https://www.cala.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    California Lawyers for the Arts <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a href="https://www.legalaidnyc.org" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors">
                    Legal Aid Society <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>


      {/* Sales Dialog */}
      <Dialog open={showSalesDialog} onOpenChange={setShowSalesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Sales Team</DialogTitle>
            <DialogDescription>
              Tell us about your needs and our sales team will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSalesInquiry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required value={salesFormData.name} onChange={e => setSalesFormData(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Your full name" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={salesFormData.email} onChange={e => setSalesFormData(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={salesFormData.company} onChange={e => setSalesFormData(prev => ({
              ...prev,
              company: e.target.value
            }))} placeholder="Your company name (optional)" />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" required rows={4} value={salesFormData.message} onChange={e => setSalesFormData(prev => ({
              ...prev,
              message: e.target.value
            }))} placeholder="Tell us about your requirements and how many artworks you need to protect..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSalesDialog(false)} disabled={isSendingSales}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingSales}>
                {isSendingSales ? "Sending..." : "Send Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Platform Status Banner */}
      <section className="py-4 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium text-yellow-800">
                Platform Status: Live & Active
              </span>
              <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                Beta
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-yellow-700">
                Core features ready • Updates weekly
              </span>
              <Button variant="ghost" size="sm" className="text-yellow-700 hover:bg-yellow-100 h-8 text-xs" onClick={() => navigate("/press-kit")}>
                Press Kit
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="text-yellow-700 hover:bg-yellow-100 h-8 text-xs" onClick={() => navigate("/roadmap")}>
                Roadmap
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Leave a Review Section */}
      <LeaveReview />

      {/* Bug Report Button */}
      <BugReportButton />
    </div>;
};
export default Index;