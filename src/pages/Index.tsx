import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';


import { 
  Shield, 
  Eye, 
  Activity, 
  Link2, 
  Search, 
  Check, 
  Star, 
  ArrowRight,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  FileImage,
  Upload,
  Scan,
  Bot,
  Play,
  ChevronRight,
  FileText,
  Scale,
  Building,
  Heart,
  ExternalLink,
  UserX,
  Calendar,
  DollarSign,
  Target,
  Brain,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { ShieldCheck, EyeOff, Fingerprint, Code2, BadgeCheck } from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import MonitoringFlow from "@/components/MonitoringFlow";
import LoadingSpinner from "@/components/LoadingSpinner";
import InvestorPitchDeck from "@/components/InvestorPitchDeck";
import OnboardingTour from "@/components/OnboardingTour";
import DemoEnvironment from "@/components/investor/DemoEnvironment";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const title = 'TSMO | AI Art Protection & Forgery Detection';
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

    setMeta('description', 'Protect your art with AI monitoring, blockchain verification, and image forgery detection.');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/`;

    // Organization structured data
    let script = document.querySelector('script[data-ld="org"]') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-ld', 'org');
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TSMO',
      url: window.location.origin,
      logo: window.location.origin + '/favicon.ico'
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
      setSalesFormData(prev => ({ ...prev, interestedPlan: "Enterprise" }));
      setShowSalesDialog(true);
    } else {
      toast({
        title: `${plan} Plan Selected`,
        description: "Redirecting to checkout...",
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
      const { data, error } = await supabase.functions.invoke('send-sales-inquiry', {
        body: salesFormData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sales Inquiry Sent!",
        description: "Thank you for your interest. Our sales team will contact you within 24 hours.",
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
      console.error('Error sending sales inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to send sales inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingSales(false);
    }
  };

  const handleFreeTrial = (plan: string) => {
    toast({
      title: "Free Trial Started!",
      description: `Your 5-day ${plan} trial is now active. Check your email for setup instructions.`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {showOnboardingTour && (
        <OnboardingTour startOpen onClose={() => setShowOnboardingTour(false)} />
      )}
      
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

      {/* Navigation Menu - Quick Access */}
      <div className="fixed top-20 right-4 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
            How It Works
          </Button>
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('beta-status')?.scrollIntoView({ behavior: 'smooth' })}>
            Beta Status
          </Button>
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            Pricing
          </Button>
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('investor-info')?.scrollIntoView({ behavior: 'smooth' })}>
            Investor Info
          </Button>
        </div>
      </div>

      {/* Hero Section - Simplified */}
      <section className="pt-24 sm:pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm animate-pulse">
            💰 Stop Losing Money to Content Thieves
          </Badge>
          
          {/* TSMO Logo - Reduced Size */}
          <div className="mb-8">
            <img 
              src={tsmoLogo} 
              alt="TSMO Multimedia Creative Protection Logo" 
              className="h-48 sm:h-64 md:h-80 mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Protect Your Art.<br />
            <span className="text-foreground">Keep What's Yours.</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered protection for digital artists. Monitor, verify, and secure your creative work with blockchain technology and&nbsp;real-time&nbsp;threat&nbsp;detection.
          </p>

          <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-primary font-semibold text-lg">Join 15,000+ creators who watch their art 24/7 and get thieves removed instantly.</p>
          </div>

          {/* Action Buttons - Simplified */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-10 py-5 text-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/upload")}
            >
              Start Free Protection
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-10 py-5 text-xl border-2 border-primary hover:bg-primary/10"
              onClick={() => setShowLiveDemo(true)}
            >
              <Activity className="mr-2 h-6 w-6" />
              See Live Demo
            </Button>
          </div>

          {/* Social Proof - Enhanced */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="p-4 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-1">15K+</div>
              <div className="text-sm text-muted-foreground">Creators Protected</div>
            </Card>
            <Card className="p-4 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-1">$2.4M</div>
              <div className="text-sm text-muted-foreground">Revenue Recovered</div>
            </Card>
            <Card className="p-4 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Violations Detected</div>
            </Card>
            <Card className="p-4 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </Card>
          </div>

          {/* Problem Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="h-6 w-6 text-red-600" />
                <span className="font-semibold text-red-700">AI Art Theft</span>
              </div>
              <p className="text-sm text-red-600">AI models stealing your style without permission</p>
            </Card>
            <Card className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <FileImage className="h-6 w-6 text-red-600" />
                <span className="font-semibold text-red-700">Fake Products</span>
              </div>
              <p className="text-sm text-red-600">Unauthorized merchandise using your artwork</p>
            </Card>
            <Card className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-6 w-6 text-red-600" />
                <span className="font-semibold text-red-700">Art Copying</span>
              </div>
              <p className="text-sm text-red-600">Direct copying and unauthorized distribution</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Clearer Process */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Protect You</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive protection system combines AI technology, blockchain verification, and legal automation to safeguard your creative work.
            </p>
          </div>

          {/* Step-by-step Process */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload & Protect</h3>
              <p className="text-muted-foreground">Upload your artwork and apply our invisible protection layers that don't affect image quality</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 AI Monitoring</h3>
              <p className="text-muted-foreground">Our AI continuously scans the internet, social media, and marketplaces for unauthorized use</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Detection</h3>
              <p className="text-muted-foreground">Get notified immediately when violations are found, with detailed evidence and location data</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Response</h3>
              <p className="text-muted-foreground">Automatic takedown notices and legal documentation to protect your rights</p>
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
                  Invisible protection that prevents AI from learning your artistic style while keeping your artwork visually unchanged.
                </p>
                <Badge variant="secondary">StyleCloak Technology</Badge>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-800">
              Platform Development Status
            </h2>
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
                      <Globe className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Real-time Scanning</span>
                    </div>
                    <p className="text-sm text-orange-700">Instant detection across all platforms</p>
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
                      <Bot className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">AI Training Protection</span>
                    </div>
                    <p className="text-sm text-orange-700">StyleCloak anti-training technology</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 px-8"
                onClick={() => navigate("/roadmap")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                View Development Roadmap
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 px-8"
                onClick={() => navigate("/contact")}
              >
                <Mail className="mr-2 h-5 w-5" />
                Report Issues & Feedback
              </Button>
            </div>
            <p className="mt-6 text-sm text-yellow-700 max-w-2xl mx-auto">
              <strong>Beta Testers Get:</strong> Lifetime 50% discount on all plans, priority support, and direct input on feature development.
            </p>
          </div>
        </div>
      </section>

      {/* Investor Pitch Deck Section */}
      <InvestorPitchDeck />

      {/* Creator Problems & Solution */}
      <section className="bg-red-50 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-800">
              Stop Losing Money to Content Thieves
            </h2>
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
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
                  onClick={() => navigate("/upload")}
                >
                  Start Protection - FREE Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary text-primary hover:bg-primary/10 px-6 py-3"
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const pricingSection = document.getElementById('pricing');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  See Pricing: $19/month
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Complete Art Protection Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered visual recognition to blockchain verification, 
              we provide end-to-end protection for your digital artwork.
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
                <p className="text-sm text-muted-foreground">Get notified immediately when your art is detected online</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Global Coverage</h3>
                <p className="text-sm text-muted-foreground">Monitor across all major platforms and marketplaces worldwide</p>
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
                <p className="text-sm text-muted-foreground">AI-powered trademark monitoring and legal automation across global jurisdictions</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Four-Layer Defense System
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive protection across AI training datasets, social media profiles, 
              entire creative portfolios, and trademark intelligence with real-time monitoring and automated response.
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
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                    onClick={() => navigate("/ai-protection")}
                  >
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
                  Monitor for fake accounts, impersonation, and unauthorized use of your identity across social platforms.
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
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                    onClick={() => navigate("/profile-monitoring")}
                  >
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
                  Comprehensive protection for your entire creative portfolio with multi-platform scanning and analytics.
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
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    onClick={() => navigate("/portfolio-monitoring")}
                  >
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
                  AI-powered trademark monitoring and legal automation across global jurisdictions for comprehensive IP protection.
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
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    onClick={() => navigate("/trademark-monitoring")}
                  >
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
                <p className="text-sm text-muted-foreground">Upload your creative work and apply our multi-layer protection</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-2">24/7 Scanning</h4>
                <p className="text-sm text-muted-foreground">Our AI continuously monitors the web for unauthorized usage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-2">Instant Alerts</h4>
                <p className="text-sm text-muted-foreground">Get notified immediately when potential theft is detected</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-2">Take Action</h4>
                <p className="text-sm text-muted-foreground">Automated DMCA filing and legal support to protect your rights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Resources Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Legal Resources & Support
            </h2>
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
                <Button 
                  size="sm"
                  className="w-full" 
                  onClick={() => navigate("/legal-templates")}
                >
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
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/lawyers")}
                >
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
                  <a 
                    href="https://www.copyright.gov" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    US Copyright Office <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a 
                    href="https://www.wipo.int" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    WIPO <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a 
                    href="https://euipo.europa.eu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
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
                  <a 
                    href="https://www.vlaa.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Volunteer Lawyers for the Arts <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a 
                    href="https://www.cala.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    California Lawyers for the Arts <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <a 
                    href="https://www.legalaidnyc.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Legal Aid Society <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Protection Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive art protection with industry-leading features. 
              Choose the plan that fits your creative journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Student Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-blue-600">24% OFF</Badge>
                <CardTitle className="text-center">Student</CardTitle>
                <CardDescription className="text-center text-sm">
                  Perfect for students and emerging artists
                </CardDescription>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground line-through">$25</div>
                  <div className="text-4xl font-bold">$19</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 50 artworks protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic AI monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Portfolio monitoring (up to 5)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Educational resources</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Community support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Mobile app access</span>
                  </div>
                </div>
                
                {/* Add-ons */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">Available Add-ons:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                      <span>Social Media Monitoring</span>
                      <div className="text-right">
                        <div className="font-semibold">$100/month</div>
                        <div className="text-xs text-muted-foreground">$199 startup fee</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded">
                      <span>Deepfake Scanning</span>
                      <div className="font-semibold">$49/month</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <div>• Limited to personal use</div>
                  <div>• Standard response time (48hrs)</div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handlePricingPlan("Student")}
                >
                  Choose Student Plan
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-green-600">25% OFF • POPULAR</Badge>
                <CardTitle className="text-center">Starter</CardTitle>
                <CardDescription className="text-center text-sm">
                  Ideal for freelancers and small creators
                </CardDescription>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground line-through">$39</div>
                  <div className="text-4xl font-bold">$29</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 150 artworks protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced AI monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Portfolio monitoring (up to 10)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Scheduled portfolio scans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Watermark protection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                
                {/* Add-ons */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">Available Add-ons:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                      <span>Social Media Monitoring</span>
                      <div className="text-right">
                        <div className="font-semibold">$100/month</div>
                        <div className="text-xs text-muted-foreground">$199 startup fee</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded">
                      <span>Deepfake Scanning</span>
                      <div className="font-semibold">$49/month</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  <div>• Commercial use allowed</div>
                  <div>• Standard takedown assistance</div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePricingPlan("Starter")}
                >
                  Choose Starter Plan
                </Button>
              </CardContent>
            </Card>
            
            {/* Professional Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-orange-600">20% OFF</Badge>
                <CardTitle className="text-center">Professional</CardTitle>
                <CardDescription className="text-center text-sm">
                  Complete art protection suite for established artists
                </CardDescription>
                <div className="text-center">
                <div className="text-sm text-muted-foreground line-through">$249</div>
                <div className="text-4xl font-bold">$199</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 1,000 artworks protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Premium AI monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Portfolio monitoring (up to 50)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced portfolio analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Scheduled & automated scans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Instant alerts & notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced watermarking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time deepfake detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Blockchain verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">White-label options</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dedicated account manager</span>
                  </div>
                </div>
                
                {/* Add-ons */}
                <div className="border-t pt-4 space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">Available Add-ons:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                      <span>Social Media Monitoring</span>
                      <div className="text-right">
                        <div className="font-semibold">$100/month</div>
                        <div className="text-xs text-muted-foreground">$199 startup fee</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded">
                      <span>Deepfake Scanning</span>
                      <div className="font-semibold">$49/month</div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handlePricingPlan("Professional")}
                >
                  Choose Professional Plan
                </Button>
              </CardContent>
            </Card>
            
            {/* Enterprise Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Badge className="mx-auto mb-4 bg-purple-600">CUSTOM</Badge>
                <CardTitle className="text-center">Enterprise Custom</CardTitle>
                <CardDescription className="text-center text-sm">
                  Tailored solutions for large organizations
                </CardDescription>
                <div className="text-center">
                  <div className="text-4xl font-bold">Custom</div>
                  <div className="text-muted-foreground">Contact us</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited artworks protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited portfolio monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Enterprise portfolio management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom AI model training</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24/7 monitoring & support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced deepfake detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced blockchain integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Enterprise SSO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">SLA guarantees</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handlePricingPlan("Contact Sales")}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-8">
              All plans include our core protection features. Upgrade or downgrade anytime.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Industry-leading security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Global monitoring network</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>99.9% threat detection rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Investor Information Section */}
      <section id="investor-info" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-lg border-blue-300 text-blue-700">
              💼 Investment Opportunity - Series A Ready
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              TSMO Investment Overview
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Revolutionary AI-powered intellectual property protection platform targeting the $15.7B creative industry market. 
              Patent-pending technology with proven traction and clear path to profitability.
            </p>
          </div>

          {/* Investment Highlights Banner */}
          <div className="grid lg:grid-cols-4 gap-6 mb-16">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-3xl font-bold mb-2">$100K</div>
                <div className="text-sm opacity-90">Seed Funding Target</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-3xl font-bold mb-2">$1M</div>
                <div className="text-sm opacity-90">Pre-money Valuation</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-3xl font-bold mb-2">15K+</div>
                <div className="text-sm opacity-90">Beta Users (94% retention)</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-3xl font-bold mb-2">39x</div>
                <div className="text-sm opacity-90">LTV/CAC Ratio</div>
              </CardContent>
            </Card>
          </div>

          {/* Market Opportunity & Business Model */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Market Opportunity
              </h3>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-2">$15.7B</div>
                    <p className="text-muted-foreground">Total Addressable Market</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Digital Content Creators</span>
                      <span className="font-bold text-green-600">$8.2B (52%)</span>
                    </div>
                    <Progress value={52} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Enterprise IP Management</span>
                      <span className="font-bold text-blue-600">$4.7B (30%)</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Legal Technology</span>
                      <span className="font-bold text-purple-600">$2.8B (18%)</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold mb-3 text-sm">Market Drivers:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span>Creator economy +23% annually</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-3 w-3 text-blue-600" />
                        <span>AI adoption accelerating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-purple-600" />
                        <span>Regulatory pressure rising</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-orange-600" />
                        <span>Global IP demand growing</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                Business Model & Unit Economics
              </h3>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Revenue Streams</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">SaaS Subscriptions (70%)</span>
                          <span className="font-bold">$19-5,000/month</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Transaction Fees (20%)</span>
                          <span className="font-bold">15-20% commission</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Enterprise Solutions (10%)</span>
                          <span className="font-bold">$10K-250K/year</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3">Proven Unit Economics</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-green-600">$15</div>
                          <div className="text-xs text-green-700">Blended CAC</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">$583</div>
                          <div className="text-xs text-green-700">Customer LTV</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">39x</div>
                          <div className="text-xs text-green-700">LTV/CAC Ratio</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">0.4mo</div>
                          <div className="text-xs text-green-700">Payback Period</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Traction & Competitive Advantages */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Current Traction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">$200</div>
                    <div className="text-xs text-green-700">MRR (+45% MoM)</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">15K+</div>
                    <div className="text-xs text-blue-700">Active Users</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">500+</div>
                    <div className="text-xs text-purple-700">Protected Works</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">94%</div>
                    <div className="text-xs text-orange-700">Satisfaction</div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Monthly Retention:</span>
                      <span className="font-semibold text-green-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detection Accuracy:</span>
                      <span className="font-semibold text-blue-600">95%+</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Competitive Edge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Patent Pending</Badge>
                    <span className="text-sm">StyleCloak AI Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Proprietary</Badge>
                    <span className="text-sm">Multi-Modal Detection AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">First-to-Market</Badge>
                    <span className="text-sm">Blockchain IP Registry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Automated</Badge>
                    <span className="text-sm">Legal Workflow Engine</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="font-semibold text-blue-800 text-sm">$24.3B Problem</div>
                  <div className="text-xs text-blue-600">AI-era IP theft requires new solutions</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Use of Funds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Product Development</span>
                      <span className="font-bold">$50K (50%)</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Customer Acquisition</span>
                      <span className="font-bold">$30K (30%)</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Operations & Legal</span>
                      <span className="font-bold">$15K (15%)</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Working Capital</span>
                      <span className="font-bold">$5K (5%)</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Projections */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Financial Projections & Milestones</h3>
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Metric</th>
                        <th className="text-center p-3 font-semibold">Year 1</th>
                        <th className="text-center p-3 font-semibold">Year 2</th>
                        <th className="text-center p-3 font-semibold">Year 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Customers</td>
                        <td className="p-3 text-center">120</td>
                        <td className="p-3 text-center">350</td>
                        <td className="p-3 text-center text-primary font-bold">750</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Monthly Recurring Revenue</td>
                        <td className="p-3 text-center">$4.2K</td>
                        <td className="p-3 text-center">$15K</td>
                        <td className="p-3 text-center text-primary font-bold">$42K</td>
                      </tr>
                      <tr className="border-b bg-primary/5">
                        <td className="p-3 font-bold">Annual Revenue</td>
                        <td className="p-3 text-center font-bold">$50K</td>
                        <td className="p-3 text-center font-bold">$180K</td>
                        <td className="p-3 text-center font-bold text-primary text-lg">$500K</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 text-center">18-Month Milestones</h4>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">250</div>
                      <div className="text-sm text-muted-foreground">Customers (6 months)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$4.2K</div>
                      <div className="text-sm text-muted-foreground">MRR (12 months)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$50K</div>
                      <div className="text-sm text-muted-foreground">ARR → Series A Ready</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Ready to Protect the Creator Economy?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join us in revolutionizing IP protection with patent-pending AI technology. 
              Strong traction, proven economics, clear path to Series A.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8"
                onClick={() => window.open('/investor-hub', '_blank')}
              >
                <Building className="mr-2 h-5 w-5" />
                View Full Pitch Deck
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8"
                onClick={() => setShowSalesDialog(true)}
              >
                <Mail className="mr-2 h-5 w-5" />
                shirleena.cunningham@tsmowatch.com
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Seeking $100K seed funding at $1M pre-money valuation.</strong> Accredited investors and strategic partners welcome.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Protect Your Creative Work?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of artists who trust TSMO to safeguard their digital creations. 
            Start your protection journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => navigate("/upload")}
            >
              Start Protecting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate("/pricing")}
            >
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
                <Input
                  id="name"
                  required
                  value={salesFormData.name}
                  onChange={(e) => setSalesFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={salesFormData.email}
                  onChange={(e) => setSalesFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={salesFormData.company}
                onChange={(e) => setSalesFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Your company name (optional)"
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                required
                rows={4}
                value={salesFormData.message}
                onChange={(e) => setSalesFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your requirements and how many artworks you need to protect..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSalesDialog(false)}
                disabled={isSendingSales}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingSales}>
                {isSendingSales ? "Sending..." : "Send Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Creator Testimonials Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trusted by Creators Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how TSMO has helped creators recover revenue and protect their work
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-primary/20 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Maya Chen</div>
                    <div className="text-sm text-muted-foreground">Digital Artist</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">
                  "TSMO recovered $8,400 from unauthorized print sales in just 3 months. The AI detection caught violations I never would have found manually."
                </p>
                <div className="text-sm font-semibold text-green-600">💰 $8,400 recovered</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Jennifer Liu</div>
                    <div className="text-sm text-muted-foreground">Content Creator</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">
                  "Finally have control over my content! TSMO blocked my artwork from being used in AI training models. Peace of mind is priceless."
                </p>
                <div className="text-sm font-semibold text-blue-600">🛡️ 247 violations blocked</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Alex Thompson</div>
                    <div className="text-sm text-muted-foreground">Photographer</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">
                  "Automated DMCA takedowns saved me 20+ hours per week. My photos are finally protected from theft across all platforms."
                </p>
                <div className="text-sm font-semibold text-purple-600">⏱️ 20+ hours saved weekly</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15,000+</div>
                <div className="text-sm text-muted-foreground">Happy Creators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.4M</div>
                <div className="text-sm text-muted-foreground">Revenue Recovered</div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => navigate("/community")}
            >
              Read More Success Stories
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;