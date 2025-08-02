import React, { useState } from 'react';
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
  UserX
} from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import MonitoringFlow from "@/components/MonitoringFlow";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge variant="secondary" className="mb-6 px-3 sm:px-4 py-2 text-xs sm:text-sm">
            🔒 Trusted by 10,000+ Artists Worldwide
          </Badge>
          
          {/* TSMO Logo */}
          <div className="mb-6 sm:mb-8">
            <img 
              src={tsmoLogo} 
              alt="TSMO Multimedia Creative Protection Logo" 
              className="h-48 sm:h-64 md:h-96 lg:h-112 mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
            Protect Your Art.<br />
            <span className="text-foreground">Own Your Future.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Advanced AI-powered protection for all creators: writers, filmmakers, social media influencers, photographers, painters, animators, and anyone who has created and published online content.<br />
            We can protect it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
            {/* Main action buttons */}
            <>
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => navigate("/upload")}
              >
                Upload & Protect Your Art
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
                onClick={() => navigate("/monitoring")}
              >
                <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View Dashboard
              </Button>
            </>
          </div>
          
        </div>
      </section>

      {/* Beta Testing Disclaimer */}
      <section className="bg-gradient-to-r from-orange-50 to-yellow-50 border-y border-orange-200 py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm font-semibold">
              BETA TESTING
            </Badge>
            <Bot className="h-6 w-6 text-orange-600" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-orange-800">
            Beta Version - Testing in Progress
          </h2>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-orange-200 max-w-3xl mx-auto">
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              <strong>Important Notice:</strong> This application is currently in beta testing phase. 
              While the user interface and core functionality are fully operational, some advanced features 
              may have limited functionality during this testing period.
            </p>
            
            <div className="text-left space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>User interface and navigation - Fully functional</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>File uploads and basic protection - Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>User accounts and authentication - Working</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>Advanced copyright detection - In testing phase</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>Real-time monitoring alerts - Limited during beta</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 italic">
              We appreciate your participation in our beta testing program. Your feedback helps us 
              improve the platform for all creators.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => navigate("/contact")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Report Issues
            </Button>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => navigate("/upload")}
            >
              Try Beta Version
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Art Theft Facts Section */}
      <section className="bg-red-50 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-800">
              The Reality of Art Theft
            </h2>
            <p className="text-base text-red-700 max-w-2xl mx-auto">
              Every day, artists lose control of their work. Here's what you need to know.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">85%</div>
                <p className="text-sm text-gray-700">
                  Over 85% of artists have had their work stolen or reposted online without permission.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">NFTs & Merch</div>
                <p className="text-sm text-gray-700">
                  Stolen digital art is frequently sold as NFTs or printed merchandise, often without the artist's knowledge.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">AI Scraping</div>
                <p className="text-sm text-gray-700">
                  AI image generators scrape millions of artworks from the web without credit, royalties, or consent.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">Hard to Track</div>
                <p className="text-sm text-gray-700">
                  Most stolen art is found on social media and e-commerce sites, where tracking violations is difficult.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-red-600 mb-2">$1000s Lost</div>
                <p className="text-sm text-gray-700">
                  Artists lose thousands in revenue annually because of unauthorized reproductions and sales.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <div className="text-sm font-bold text-red-600 mb-1">Act Now</div>
                <p className="text-xs text-gray-700">
                  Protecting your work is essential—copyright alone isn't enough to stop theft online.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-4">
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
              onClick={() => navigate("/upload")}
            >
              Protect Your Art Now
              <Shield className="ml-2 h-4 w-4" />
            </Button>
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

    </div>
  );
};

export default Index;