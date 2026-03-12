import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BugReportButton } from "@/components/BugReportButton";
import { Shield, Eye, Search, ArrowRight, Globe, Play, ChevronRight, Bell, Upload, BookOpen, Clock, Check, Star } from "lucide-react";
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";
import { useQuery } from "@tanstack/react-query";
import bizWeeklyBanner from "@/assets/Biz_Weekly.png";
import caiLogo from "@/assets/CAI_Lockup_RGB_Black.png";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import { InstantProtectModal } from "@/components/InstantProtectModal";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [signupEmail, setSignupEmail] = useState('');
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [showInstantProtect, setShowInstantProtect] = useState(false);
  const [showSalesDialog, setShowSalesDialog] = useState(false);
  const [salesFormData, setSalesFormData] = useState({ name: "", email: "", company: "", interestedPlan: "", message: "" });
  const [isSendingSales, setIsSendingSales] = useState(false);

  useEffect(() => {
    document.title = "TSMO | AI Art Protection & Forgery Detection";
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.name = name; document.head.appendChild(tag); }
      tag.content = content;
    };
    setMeta("description", "Stop online art theft. TSMO monitors the web 24/7 to find stolen artwork, proves ownership with timestamps, and helps you take action. Free to start.");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = `${window.location.origin}/`;
    let script = document.querySelector('script[data-ld="org"]') as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.setAttribute("data-ld", "org"); document.head.appendChild(script); }
    script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "TSMO", url: window.location.origin, logo: window.location.origin + "/favicon.ico" });
  }, []);

  const handleSalesInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingSales(true);
    try {
      const { error } = await supabase.functions.invoke("send-sales-inquiry", { body: salesFormData });
      if (error) throw error;
      toast({ title: "Sales Inquiry Sent!", description: "Our sales team will contact you within 24 hours." });
      setShowSalesDialog(false);
      setSalesFormData({ name: "", email: "", company: "", interestedPlan: "", message: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send. Please try again.", variant: "destructive" });
    } finally { setIsSendingSales(false); }
  };

  // Blog posts query
  const { data: dbPosts } = useQuery({
    queryKey: ['home-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_posts').select('id, title, slug, excerpt, tags, created_at').eq('status', 'published').order('published_at', { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    }
  });

  const fallbackPosts = [
    { slug: "how-to-find-if-your-art-is-being-stolen-online", title: "How to Find If Your Art Is Being Stolen Online", excerpt: "Learn the essential techniques to discover if your artwork is being used without permission.", category: "Protection", readTime: "8 min" },
    { slug: "ai-training-what-artists-need-to-know-2025", title: "AI Training: What Artists Need to Know in 2025", excerpt: "Understanding how AI companies use artwork for training and your rights.", category: "AI", readTime: "10 min" },
    { slug: "dmca-takedown-guide-digital-artists", title: "DMCA Takedown Guide for Digital Artists", excerpt: "A step-by-step guide to filing DMCA takedown notices.", category: "Legal", readTime: "12 min" },
  ];

  const posts = dbPosts?.length ? dbPosts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt || '', category: p.tags?.[0] || 'General', readTime: '5 min' })) : fallbackPosts;

  return (
    <div className="min-h-screen bg-background">
      <ExitIntentPopup />
      <InstantProtectModal open={showInstantProtect} onOpenChange={setShowInstantProtect} />
      
      {/* Live Demo Modal */}
      <Dialog open={showLiveDemo} onOpenChange={setShowLiveDemo}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Demo — TSMO Protection Platform</DialogTitle>
            <DialogDescription>Experience our IP protection platform in action.</DialogDescription>
          </DialogHeader>
          <DemoEnvironment />
        </DialogContent>
      </Dialog>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 lg:pt-36 pb-20 lg:pb-28 overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo mark */}
            <div className="mb-8">
              <img src={tsmoLogo} alt="TSMO Logo" className="h-28 sm:h-36 lg:h-44 mx-auto object-contain" loading="eager" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground leading-[1.1]">
              Your Art Is Being Stolen.<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">We Stop It.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Upload your work. We scan the web 24/7 and alert you when someone uses it without permission.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                size="lg"
                className="h-13 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                onClick={() => setShowInstantProtect(true)}
              >
                <Upload className="mr-2 h-5 w-5" />
                Scan Your Art Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base font-medium"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                Instant results
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                50 free scans
              </span>
            </div>

            {/* Demo link */}
            <button
              onClick={() => setShowLiveDemo(true)}
              className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Watch 2-minute demo
            </button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 lg:py-28 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Protection in four simple steps</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { icon: Upload, title: "Upload", desc: "Drop your artwork into TSMO" },
              { icon: Search, title: "We Scan", desc: "AI searches billions of pages" },
              { icon: Bell, title: "Get Alerted", desc: "Instant notification of matches" },
              { icon: Shield, title: "Take Action", desc: "One-click enforcement tools" },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="relative mx-auto mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES ===== */}
      <section className="py-20 lg:py-28 bg-muted/20 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Everything you need to protect your work</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: "AI Training Resistance", desc: "Style cloaking technology makes your art unusable for AI model training while keeping it visually identical to humans." },
              { icon: Search, title: "Reverse Image Search", desc: "Continuously monitors millions of websites, marketplaces, and social platforms to detect unauthorized use of your work." },
              { icon: Globe, title: "24/7 Web Monitoring", desc: "Our AI agents scan the internet around the clock so you never miss an unauthorized copy of your artwork." },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF — STATS ===== */}
      <section className="py-16 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,400+", label: "Scans this month" },
              { value: "24/7", label: "Monitoring" },
              { value: "50+", label: "Platforms scanned" },
              { value: "Free", label: "To start" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CREDIBILITY ===== */}
      <section className="py-20 lg:py-24 bg-muted/20 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Trusted & Recognized</p>
            <h2 className="text-3xl font-bold text-foreground">Built on credibility</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* BizWeekly */}
            <div className="p-8 rounded-2xl bg-background border border-border/50 text-center flex flex-col items-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">As Seen On</p>
              <a href="https://bizweekly.com/suddenly-fighting-shadows-one-artists-mission-to-protect-creators-in-the-ai-age/" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity mb-5">
                <img src={bizWeeklyBanner} alt="As seen on BizWeekly" className="w-full max-w-xs mx-auto h-auto object-contain" loading="lazy" />
              </a>
              <a href="https://bizweekly.com/suddenly-fighting-shadows-one-artists-mission-to-protect-creators-in-the-ai-age/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Read the feature <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Founder is a Harvard Innovation Labs member.<br />
                <span className="opacity-60">Harvard University does not endorse or sponsor TSMO.</span>
              </p>
            </div>

            {/* CAI */}
            <div className="p-8 rounded-2xl bg-background border border-border/50 text-center flex flex-col items-center justify-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">Official Member</p>
              <img src={caiLogo} alt="Content Authenticity Initiative" className="h-16 lg:h-20 object-contain dark:invert mb-5" />
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Proud member of the <strong className="text-foreground">Content Authenticity Initiative (CAI)</strong> — building trust through the C2PA open standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="py-20 lg:py-24 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-primary uppercase tracking-widest">From Our Blog</p>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Tips & guides for creators</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group block p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category}</span>
                <h3 className="text-lg font-semibold mt-2 mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => navigate("/blog")}>
              View All Articles <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
            Ready to protect your art?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who sleep better knowing their work is monitored 24/7.
          </p>

          {/* Email capture */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 text-base bg-background"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <Button
                size="lg"
                className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => navigate(`/auth?email=${encodeURIComponent(signupEmail)}&tab=signup`)}
              >
                Get Started
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">50 free protections. No credit card required.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
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
            <DialogDescription>Tell us about your needs and our sales team will contact you within 24 hours.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSalesInquiry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="name">Name *</Label><Input id="name" required value={salesFormData.name} onChange={(e) => setSalesFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" /></div>
              <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={salesFormData.email} onChange={(e) => setSalesFormData((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" /></div>
            </div>
            <div><Label htmlFor="company">Company</Label><Input id="company" value={salesFormData.company} onChange={(e) => setSalesFormData((p) => ({ ...p, company: e.target.value }))} placeholder="Optional" /></div>
            <div><Label htmlFor="message">Message *</Label><Textarea id="message" required rows={4} value={salesFormData.message} onChange={(e) => setSalesFormData((p) => ({ ...p, message: e.target.value }))} placeholder="Tell us about your requirements..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowSalesDialog(false)} disabled={isSendingSales}>Cancel</Button>
              <Button type="submit" disabled={isSendingSales}>{isSendingSales ? "Sending..." : "Send Inquiry"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BugReportButton />
    </div>
  );
};

export default Index;
