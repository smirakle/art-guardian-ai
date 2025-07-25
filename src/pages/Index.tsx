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
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Protect Your Art.<br />
            <span className="text-foreground">Own Your Future.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered protection for digital artists. Monitor, verify, and secure your creative work 
            with real-time threat detection.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How We Protect Your Art
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to complete protection
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
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <CardTitle>Starter</CardTitle>
                <div className="text-3xl font-bold">$29</div>
                <div className="text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">50 artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email alerts</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePricingPlan("Starter")}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-lg scale-105">
              <CardHeader className="text-center">
                <Badge className="mx-auto mb-2 bg-primary">Most Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">$99</div>
                <div className="text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">500 artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Legal assistance</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePricingPlan("Pro")}>
                  Choose Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold">$299</div>
                <div className="text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited artworks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dedicated support</span>
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