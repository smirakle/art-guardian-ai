import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { 
  Shield, 
  Eye, 
  Activity, 
  Link2, 
  Search, 
  Check, 
  Star, 
  ArrowRight,
  Upload,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  Scale
} from 'lucide-react';

import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePricingPlan = (plan: string) => {
    toast({
      title: `${plan} Plan Selected`,
      description: "Redirecting to checkout...",
    });
    setTimeout(() => {
      navigate(`/checkout?plan=${plan.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            🔒 Trusted by 10,000+ Artists Worldwide
          </Badge>
          
          {/* TSMO Logo */}
          <div className="mb-8">
            <img 
              src={tsmoLogo} 
              alt="TSMO Multimedia Creative Protection Logo" 
              className="h-64 md:h-80 mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Protect Your Art.<br />
            <span className="text-slate-900">Own Your Future.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
            Complete Art Protection Suite with AI-powered monitoring, blockchain verification, 
            and legal support for digital creators.
          </p>
          
          <p className="text-base text-slate-500 mb-8 max-w-2xl mx-auto">
            Monitor 20M+ sources including social media, marketplaces, and the dark web. 
            Get instant alerts, automated DMCA filing, and comprehensive legal protection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              onClick={() => navigate("/upload")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate("/dashboard")}
            >
              <Activity className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="bg-muted/30 py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Detection</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$50M+</div>
              <div className="text-sm text-muted-foreground">Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Simplified */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Complete Art Protection Suite
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              Everything you need to protect your creative work
            </p>
            <p className="text-slate-500">
              Advanced AI monitoring across 20+ million sources worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload</h3>
              <p className="text-muted-foreground">
                Upload your artwork and we'll create a digital fingerprint
              </p>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Monitor</h3>
              <p className="text-muted-foreground">
                Our AI scans the web 24/7 looking for unauthorized use
              </p>
            </Card>
            
            <Card className="text-center p-6 border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Protect</h3>
              <p className="text-muted-foreground">
                Get instant alerts and legal support when theft is detected
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-slate-900">Starter</CardTitle>
                <div className="text-3xl font-bold text-slate-900">$29</div>
                <div className="text-slate-500">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">50 artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Basic monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Email alerts</span>
                  </div>
                </div>
                
                {/* Social Media Add-on */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Social Media Monitoring Add-on</h4>
                    <div className="text-sm text-slate-600 mb-2">
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className="font-semibold">+$99/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Setup Fee:</span>
                        <span className="font-semibold">$199</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Monitor unlimited social profiles for impersonation and unauthorized content</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePricingPlan("Starter")}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-slate-900 shadow-lg scale-105">
              <CardHeader className="text-center">
                <Badge className="mx-auto mb-2 bg-slate-900 text-white">Most Popular</Badge>
                <CardTitle className="text-slate-900">Pro</CardTitle>
                <div className="text-3xl font-bold text-slate-900">$99</div>
                <div className="text-slate-500">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">500 artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Advanced monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Legal assistance</span>
                  </div>
                </div>
                
                {/* Social Media Add-on */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Social Media Monitoring Add-on</h4>
                    <div className="text-sm text-slate-600 mb-2">
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className="font-semibold">+$99/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Setup Fee:</span>
                        <span className="font-semibold">$199</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Monitor unlimited social profiles for impersonation and unauthorized content</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePricingPlan("Pro")}>
                  Choose Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-slate-900">Enterprise</CardTitle>
                <div className="text-3xl font-bold text-slate-900">$299</div>
                <div className="text-slate-500">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Unlimited artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Custom features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-slate-700">Social Media Monitoring Included</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePricingPlan("Enterprise")}>
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of artists protecting their work with TSMO
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/upload")}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;