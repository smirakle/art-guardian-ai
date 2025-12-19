import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ContextualHelp from "@/components/help-system/ContextualHelp";
import { BugReportButton } from "@/components/BugReportButton";
import { Shield, Eye, Search, ArrowRight, Zap, Globe, FileText, Play, ChevronRight, Scale, Bell } from "lucide-react";
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import bizWeeklyBanner from "@/assets/Biz_Weekly.png";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import ProtectionComparisonShowcase from "@/components/ProtectionComparisonShowcase";
import TrustBadges from "@/components/TrustBadges";
import { InstantProtectModal } from "@/components/InstantProtectModal";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [signupEmail, setSignupEmail] = useState('');
  
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
    setMeta("description", "Stop online art theft. TSMO monitors the web 24/7 to find stolen artwork, proves ownership with timestamps, and helps you take action. Free to start.");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/`;

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

  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [showInstantProtect, setShowInstantProtect] = useState(false);
  const [showSalesDialog, setShowSalesDialog] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    name: "",
    email: "",
    company: "",
    interestedPlan: "",
    message: ""
  });
  const [isSendingSales, setIsSendingSales] = useState(false);

  const handleSalesInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingSales(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sales-inquiry", {
        body: salesFormData
      });
      if (error) throw error;
      toast({
        title: "Sales Inquiry Sent!",
        description: "Thank you for your interest. Our sales team will contact you within 24 hours."
      });
      setShowSalesDialog(false);
      setSalesFormData({ name: "", email: "", company: "", interestedPlan: "", message: "" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ContextualHelp />
      <InstantProtectModal open={showInstantProtect} onOpenChange={setShowInstantProtect} />
      
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

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-6">
            <img src={tsmoLogo} alt="TSMO Logo" className="h-[10.5rem] sm:h-[14rem] md:h-[17.5rem] mx-auto object-contain" loading="eager" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Stop Online Art Theft. Protect Your Portfolio.
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto italic font-sans text-center font-light">
            For working artists who can't afford art theft: protect your portfolio with monitoring, alerts, and ownership proof.
          </p>

          {/* Primary Sign-Up CTA */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-12 text-base" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <Button 
                size="lg" 
                className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 whitespace-nowrap" 
                onClick={() => navigate(`/auth?email=${encodeURIComponent(signupEmail)}&tab=signup`)}
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">No credit card required</p>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button variant="outline" size="lg" onClick={() => setShowLiveDemo(true)}>
              <Play className="mr-2 h-4 w-4" />
              Watch Live Demo
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90" onClick={() => navigate('/demo/visual')}>
              <Zap className="mr-2 h-4 w-4" />
              2-Min Visual Demo
            </Button>
          </div>

          {/* Try It Now - Guest Mode CTA */}
          <div className="border-t border-border/30 pt-6 mb-8">
            <p className="text-sm text-muted-foreground mb-3">Want to see it work first?</p>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/40 hover:border-emerald-500/60 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              onClick={() => setShowInstantProtect(true)}
            >
              <Shield className="mr-2 h-4 w-4" />
              Try It Now — No Signup Required
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Protect 1 image instantly • See results in seconds
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary mb-1" />
              <div className="text-xs sm:text-sm text-muted-foreground">Reverse Image Search</div>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary mb-1" />
              <div className="text-xs sm:text-sm text-muted-foreground">Ownership Timestamps</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">Not a crypto product</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* As Seen On Banner */}
      <section className="py-6 px-4 bg-background">
        <div className="container mx-auto max-w-2xl">
          <img 
            src={bizWeeklyBanner} 
            alt="As seen on BizWeekly" 
            className="w-full max-w-sm mx-auto h-auto object-contain"
            loading="lazy"
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Keep Your Art Safe</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We watch the internet for copies of your art. If someone steals it, we'll tell you and help you stop them.
            </p>
          </div>

          {/* Simple 4-Step Process */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
              <h3 className="text-xl font-semibold mb-3">Add Your Art</h3>
              <p className="text-muted-foreground">Just drag and drop your image. We'll remember what it looks like.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
              <h3 className="text-xl font-semibold mb-3">We Watch the Internet</h3>
              <p className="text-muted-foreground">We check thousands of websites every day, looking for copies of your art.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
              <h3 className="text-xl font-semibold mb-3">We Alert You</h3>
              <p className="text-muted-foreground">Found a copy? We'll email you right away with a screenshot and link.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">4</div>
              <h3 className="text-xl font-semibold mb-3">We Help You Stop It</h3>
              <p className="text-muted-foreground">Click one button to send a "take it down" notice. No lawyer needed.</p>
            </div>
          </div>

          {/* Benefit-Focused Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span>🔍</span> Find Stolen Art
                </CardTitle>
                <CardDescription>
                  We recognize your art even if someone changes the colors, crops it, or adds filters.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span>👁️</span> Always Watching
                </CardTitle>
                <CardDescription>
                  We never sleep. We're checking the internet for your art right now.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span>📜</span> Prove It's Yours
                </CardTitle>
                <CardDescription>
                  Get a digital certificate that proves you created it first.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span>⚡</span> Stop Thieves Fast
                </CardTitle>
                <CardDescription>
                  Most artists find stolen art and get it removed within 48 hours.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Additional Capabilities */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">📧 Email & Phone Alerts</h3>
              <p className="text-sm text-muted-foreground">We text you when something urgent happens</p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">⚖️ Legal Help When Needed</h3>
              <p className="text-sm text-muted-foreground">Talk to a real copyright lawyer if things get serious</p>
            </div>

            <div className="text-center p-6 bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">🌍 Works Everywhere</h3>
              <p className="text-sm text-muted-foreground">We check websites in every country, in every language</p>
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

      {/* Protection Comparison Showcase */}
      <ProtectionComparisonShowcase />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Final CTA */}
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
                  onChange={e => setSalesFormData(prev => ({ ...prev, name: e.target.value }))} 
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
                  onChange={e => setSalesFormData(prev => ({ ...prev, email: e.target.value }))} 
                  placeholder="your@email.com" 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={salesFormData.company} 
                onChange={e => setSalesFormData(prev => ({ ...prev, company: e.target.value }))} 
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
                onChange={e => setSalesFormData(prev => ({ ...prev, message: e.target.value }))} 
                placeholder="Tell us about your requirements..." 
              />
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

      <BugReportButton />
    </div>
  );
};

export default Index;
