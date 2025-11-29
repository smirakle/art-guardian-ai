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
import MonitoringFlow from "@/components/MonitoringFlow";
import LoadingSpinner from "@/components/LoadingSpinner";
import OnboardingTour from "@/components/OnboardingTour";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import MobileAppCTA from "@/components/MobileAppCTA";
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
            <img 
              src={tsmoLogo} 
              alt="TSMO Logo" 
              className="h-24 sm:h-32 md:h-40 mx-auto object-contain" 
              loading="eager"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Protect Your Art from AI Training & Theft
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            24/7 automated monitoring finds unauthorized use of your artwork across the internet
          </p>

          {/* Primary Sign-Up CTA */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 h-12 text-base"
              />
              <Button 
                size="lg" 
                className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 whitespace-nowrap"
                onClick={() => navigate("/upload")}
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No credit card required • Join 15,000+ protected artists
            </p>
          </div>

          {/* Secondary CTA */}
          <Button 
            variant="outline" 
            size="lg" 
            className="mb-8"
            onClick={() => setShowLiveDemo(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Watch 2-Min Demo
          </Button>

          {/* Simplified Stats - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">15K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Protected Artists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Violations Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Clearer Process */}
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

          {/* Protection Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Invisible Art Shield</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Market-ready invisible protection that prevents AI from learning your artistic style while keeping
                  your artwork visually unchanged.
                </p>
                <Badge variant="default" className="bg-green-600 text-white">
                  StyleCloak - Market Ready
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Detection</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Advanced AI finds copies of your art anywhere online, even when modified, cropped, or filtered.
                </p>
                <Badge variant="secondary">Multi-Modal AI</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Blockchain Proof</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Immutable blockchain certificates that prove ownership and creation date for legal disputes.
                </p>
                <Badge variant="secondary">Permanent Record</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Legal Automation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Automated DMCA notices and takedown requests using lawyer-approved templates and documentation.
                </p>
                <Badge variant="secondary">Legal-Grade</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Real-Time Alerts</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Instant notifications when violations are detected, with detailed reports and evidence packages.
                </p>
                <Badge variant="secondary">24/7 Monitoring</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Global Coverage</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Monitor across all major platforms, marketplaces, social media, and websites worldwide.
                </p>
                <Badge variant="secondary">Worldwide Scan</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="px-10 py-4 text-lg" onClick={() => navigate("/upload")}>
              Start Protecting Your Art Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beta Testing Status - Enhanced */}
      <section id="beta-status" className="py-16 px-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-y border-yellow-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-yellow-700 border-yellow-300 mb-6 px-4 py-2 text-lg">
              🚀 Beta Testing Phase - Join Early Access
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-800">Platform Development Status</h2>
            <p className="text-xl text-yellow-700 max-w-3xl mx-auto">
              Core protection features are live and working. Advanced automation features are being rolled out weekly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-green-800">✅ Active & Working</CardTitle>
                <CardDescription className="text-green-700">Ready to use right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Image Protection</span>
                    </div>
                    <p className="text-sm text-green-700">Upload and analyze artwork with AI protection layers</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Monitoring System</span>
                    </div>
                    <p className="text-sm text-green-700">Track violations across major platforms</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Legal Templates</span>
                    </div>
                    <p className="text-sm text-green-700">DMCA and takedown notice templates</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Portfolio Management</span>
                    </div>
                    <p className="text-sm text-green-700">Organize and manage your protected works</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">AI Training Protection</span>
                    </div>
                    <p className="text-sm text-green-700">StyleCloak anti-training technology - Market Ready</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Real-time Scanning</span>
                    </div>
                    <p className="text-sm text-green-700">Instant detection across all platforms - Market Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-orange-800">🔧 Coming Soon</CardTitle>
                <CardDescription className="text-orange-700">Rolling out in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Auto Takedowns</span>
                    </div>
                    <p className="text-sm text-orange-700">Automated DMCA filing and platform reporting</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Enterprise Dashboard</span>
                    </div>
                    <p className="text-sm text-orange-700">Advanced analytics and team management tools</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Blockchain Registry</span>
                    </div>
                    <p className="text-sm text-orange-700">Immutable ownership certificates</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Advanced Legal Tools</span>
                    </div>
                    <p className="text-sm text-orange-700">Enhanced DMCA and international takedown support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 px-8" onClick={() => navigate("/roadmap")}>
                <Calendar className="mr-2 h-5 w-5" />
                View Development Roadmap
              </Button>
              <Button variant="outline" size="lg" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 px-8" onClick={() => navigate("/contact")}>
                <Mail className="mr-2 h-5 w-5" />
                Report Issues & Feedback
              </Button>
            </div>
            <p className="mt-6 text-sm text-yellow-700 max-w-2xl mx-auto">
              <strong>Beta Testers Get:</strong> Extended free trial, priority support, and direct input
              on feature development.
            </p>
          </div>
        </div>
      </section>

      {/* Creator Problems & Solution */}
      <section className="bg-red-50 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-800">Stop Losing Money to Content Thieves</h2>
            <p className="text-base text-red-700 max-w-2xl mx-auto">
              Every minute your content isn't protected, you're losing revenue. Here's what's happening to creators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">$3,200</div>
                <p className="text-sm text-gray-700">
                  Average revenue lost per creator annually to unauthorized use and theft.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">AI Training Theft</div>
                <p className="text-sm text-gray-700">
                  Your content trains AI models worth billions, but you receive $0 in compensation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">Merch Thieves</div>
                <p className="text-sm text-gray-700">
                  Print-on-demand sites profit from your stolen designs while you get nothing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">Impossible to Track</div>
                <p className="text-sm text-gray-700">
                  Manual monitoring takes 10+ hours weekly and still misses 90% of violations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">Legal Costs</div>
                <p className="text-sm text-gray-700">
                  Lawyers charge $300+/hour for takedown notices you could automate.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <div className="text-sm font-bold text-red-600 mb-1">Time = Money</div>
                <p className="text-xs text-gray-700">
                  Every day without protection costs you potential licensing deals and royalties.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6 space-y-4">
            <div className="bg-white rounded-lg p-6 border-2 border-primary max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-primary mb-2">The Solution: TSMO Protection</h3>
              <p className="text-gray-700 mb-4">
                Automated monitoring + AI detection + legal automation = Your content protected 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 py-3" onClick={() => navigate("/upload")}>
                  Start Protection - FREE Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-6 py-3" onClick={() => {
                navigate("/");
                setTimeout(() => {
                  const freeTrialSection = document.getElementById("free-trial");
                  if (freeTrialSection) {
                    freeTrialSection.scrollIntoView({
                      behavior: "smooth"
                    });
                  }
                }, 100);
              }}>
                  Start Your Free Trial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Detection Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Protected Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$50M+</div>
              <div className="text-sm text-muted-foreground">Art Value Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Complete Art Protection Suite</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered visual recognition to blockchain verification, we provide end-to-end protection for your
              digital artwork.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when your art is detected online
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Global Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor across all major platforms and marketplaces worldwide
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Support</h3>
                <p className="text-sm text-muted-foreground">Automated DMCA filing and legal assistance when needed</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Scale className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Trademark Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered trademark monitoring and legal automation across global jurisdictions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial CTA Section */}
      <section id="free-trial" className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <Badge variant="secondary" className="px-6 py-2 text-base">
                <Shield className="h-5 w-5 mr-2" />
                No Credit Card Required
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Start Your Free Trial Now
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Protect your creative work with AI-powered monitoring. Get started in minutes.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto py-8">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">14-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">Full access to all features</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg">No Credit Card</h3>
                <p className="text-sm text-muted-foreground">Zero commitment required</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Instant Setup</h3>
                <p className="text-sm text-muted-foreground">Start protecting in 2 minutes</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="h-14 px-12 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => navigate("/upload")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-12 text-lg"
                onClick={() => navigate("/pricing")}
              >
                View Pricing Plans
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 flex flex-wrap justify-center gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>15,000+ Protected Artists</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>50,000+ Violations Found</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Protection Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              🛡️ Advanced Protection Suite
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Four-Layer Defense System</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive protection across AI training datasets, social media profiles, entire creative portfolios,
              and trademark intelligence with real-time monitoring and automated response.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* AI Training Protection */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center mb-4">AI Training Protection</CardTitle>
                <CardDescription className="text-center text-base">
                  Prevent unauthorized use of your creative work in AI training datasets and generative models.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Real-time AI scraping detection across major platforms</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Watermarking technology invisible to humans but detectable by AI</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Automated DMCA notices to AI training companies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Legal certificate of protection for court cases</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700" onClick={() => navigate("/ai-protection")}>
                    Protect from AI Training
                    <Shield className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Monitoring */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <UserX className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center mb-4">Profile Monitoring</CardTitle>
                <CardDescription className="text-center text-base">
                  Monitor for fake accounts, impersonation, and unauthorized use of your identity across social
                  platforms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Scan Instagram, Twitter, TikTok, Facebook for fake profiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Identity theft and impersonation detection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Automated reporting to platform abuse teams</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Risk assessment and threat level analysis</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700" onClick={() => navigate("/profile-monitoring")}>
                    Monitor Your Profile
                    <Users className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Monitoring */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <FileImage className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center mb-4">Portfolio Monitoring</CardTitle>
                <CardDescription className="text-center text-base">
                  Comprehensive protection for your entire creative portfolio with multi-platform scanning and
                  analytics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Bulk monitoring of unlimited artworks and projects</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Cross-platform detection: marketplaces, social media, websites</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Scheduled scans and automated monitoring workflows</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Detailed analytics and threat intelligence reports</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700" onClick={() => navigate("/portfolio-monitoring")}>
                    Monitor Portfolio
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trademark Intelligence */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center mb-4">Trademark Intelligence</CardTitle>
                <CardDescription className="text-center text-base">
                  AI-powered trademark monitoring and legal automation across global jurisdictions for comprehensive IP
                  protection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Multi-jurisdiction trademark similarity analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Real-time monitoring across USPTO and international databases</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Automated legal workflow and document generation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced analytics and portfolio management</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" onClick={() => navigate("/trademark-monitoring")}>
                    Monitor Trademarks
                    <Scale className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Protection Process */}
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-2">Upload & Protect</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your creative work and apply our multi-layer protection
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">24/7 Scanning</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI continuously monitors the web for unauthorized usage
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Instant Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when potential theft is detected
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-2">Take Action</h4>
                <p className="text-sm text-muted-foreground">
                  Automated DMCA filing and legal support to protect your rights
                </p>
              </div>
            </div>
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


      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Protect Your Creative Work?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of artists who trust TSMO to safeguard their digital creations. Start your protection journey
            today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" onClick={() => navigate("/upload")}>
              Start Protecting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg" onClick={() => navigate("/pricing")}>
              View Pricing Plans
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Advanced Protection</div>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Real-time Monitoring</div>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Blockchain Security</div>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">Expert Support</div>
            </div>
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

      {/* Leave a Review Section */}
      <LeaveReview />

      {/* Bug Report Button */}
      <BugReportButton />
    </div>;
};
export default Index;