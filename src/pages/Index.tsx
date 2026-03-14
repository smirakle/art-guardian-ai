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
import { Shield, Eye, Search, ArrowRight, Globe, Play, ChevronRight, Bell, Upload, BookOpen, Clock, Check, Star, Zap, Lock, FileSearch } from "lucide-react";
import tsmoLogo from "@/assets/tsmo_logo_vector_ready.jpg";
import { useQuery } from "@tanstack/react-query";
import bizWeeklyBanner from "@/assets/Biz_Weekly.png";
import caiLogo from "@/assets/CAI_Lockup_RGB_Black.png";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import { InstantProtectModal } from "@/components/InstantProtectModal";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─── Scroll-reveal wrapper ─── */
const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ─── Floating particles for hero ─── */
const HeroParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(14)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-primary/20 animate-float-particle"
        style={{
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${4 + Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

/* ─── Floating 3D artwork cards ─── */
const FloatingCards = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
    {/* Card 1 - top left */}
    <div
      className="absolute top-24 left-[8%] w-32 h-40 rounded-2xl glass-bento shadow-xl animate-float-card opacity-40"
      style={{ animationDelay: "0s", perspective: "800px" }}
    >
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
        <Shield className="w-8 h-8 text-primary/50" />
      </div>
    </div>
    {/* Card 2 - top right */}
    <div
      className="absolute top-32 right-[10%] w-28 h-36 rounded-2xl glass-bento shadow-xl animate-float-card opacity-30"
      style={{ animationDelay: "2s" }}
    >
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
        <Eye className="w-7 h-7 text-secondary/50" />
      </div>
    </div>
    {/* Card 3 - bottom right */}
    <div
      className="absolute bottom-28 right-[15%] w-24 h-32 rounded-2xl glass-bento shadow-xl animate-float-card opacity-25"
      style={{ animationDelay: "1s" }}
    >
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-accent/50" />
      </div>
    </div>
  </div>
);

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

  const steps = [
    { icon: Upload, title: "Upload", desc: "Drop your artwork into TSMO" },
    { icon: Search, title: "We Scan", desc: "AI searches billions of pages" },
    { icon: Bell, title: "Get Alerted", desc: "Instant notification of matches" },
    { icon: Shield, title: "Take Action", desc: "One-click enforcement tools" },
  ];

  const features = [
    { icon: Eye, title: "AI Training Resistance", desc: "Style cloaking technology makes your art unusable for AI model training while keeping it visually identical to humans.", large: true },
    { icon: Search, title: "Reverse Image Search", desc: "Continuously monitors millions of websites, marketplaces, and social platforms to detect unauthorized use of your work." },
    { icon: Globe, title: "24/7 Web Monitoring", desc: "Our AI agents scan the internet around the clock so you never miss an unauthorized copy of your artwork." },
    { icon: Zap, title: "Instant DMCA Takedowns", desc: "Generate and file legally-binding DMCA notices with a single click. Our system handles enforcement across all platforms." },
    { icon: FileSearch, title: "Provenance Tracking", desc: "Blockchain-backed ownership certificates with C2PA content credentials for irrefutable proof of original authorship." },
  ];

  const stats = [
    { value: "2,400+", label: "Scans this month" },
    { value: "24/7", label: "Monitoring" },
    { value: "50+", label: "Platforms scanned" },
    { value: "Free", label: "To start" },
  ];

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

      {/* ══════════════════════════════════════════
          HERO — Cinematic & Immersive
          ══════════════════════════════════════════ */}
      <section className="relative pt-28 lg:pt-40 pb-24 lg:pb-36 overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 hero-mesh" />
        <HeroParticles />
        <FloatingCards />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 opacity-0 animate-stagger-fade-up stagger-1">
              <img src={tsmoLogo} alt="TSMO Logo" className="h-28 sm:h-36 lg:h-44 mx-auto object-contain drop-shadow-lg" loading="eager" />
            </div>

            {/* Headline — staggered reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]">
              <span className="block opacity-0 animate-stagger-fade-up stagger-2 text-foreground">
                Your Art Is Being Stolen.
              </span>
              <span className="block opacity-0 animate-stagger-fade-up stagger-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                We Stop It.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed opacity-0 animate-stagger-fade-up stagger-4">
              Upload your work. We scan the web 24/7 and alert you when someone uses it without permission.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 opacity-0 animate-stagger-fade-up stagger-5">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 glow-pulse"
                onClick={() => setShowInstantProtect(true)}
              >
                <Upload className="mr-2 h-5 w-5" />
                Scan Your Art Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-medium border-border/60 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground opacity-0 animate-stagger-fade-up" style={{ animationDelay: "0.6s" }}>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> Instant results
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> 50 free scans
              </span>
            </div>

            {/* Demo link */}
            <button
              onClick={() => setShowLiveDemo(true)}
              className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="w-3.5 h-3.5 text-primary" />
              </div>
              Watch 2-minute demo
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CREDIBILITY — Clean Logo Bar
          ══════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-14 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-10">Trusted & Recognized</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
              {/* BizWeekly */}
              <a
                href="https://bizweekly.com/suddenly-fighting-shadows-one-artists-mission-to-protect-creators-in-the-ai-age/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 group"
              >
                <img src={bizWeeklyBanner} alt="As seen on BizWeekly" className="h-10 md:h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity" loading="lazy" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  Read the feature <ChevronRight className="w-3 h-3" />
                </span>
              </a>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border/50" />

              {/* CAI */}
              <div className="flex flex-col items-center gap-3">
                <img src={caiLogo} alt="Content Authenticity Initiative" className="h-10 md:h-12 object-contain dark:invert opacity-70" />
                <span className="text-xs text-muted-foreground">CAI Member</span>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-border/50" />

              {/* Harvard */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-foreground/70">Harvard Innovation Labs</span>
                <span className="text-[10px] text-muted-foreground/60">Member · Not an endorsement</span>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — Animated Timeline
          ══════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-24 lg:py-32 bg-muted/20 border-t border-border/30 overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">How It Works</p>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground">Protection in four simple steps</h2>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Connecting line — desktop only */}
              <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-border/40">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary origin-left animate-timeline-grow" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {steps.map((step, i) => (
                  <RevealSection key={i} delay={i * 150}>
                    <div className="text-center group relative">
                      <div className="relative mx-auto mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-background border-2 border-border/50 flex items-center justify-center mx-auto group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500">
                          <step.icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110 duration-300" />
                        </div>
                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1.5 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════
          FEATURES — Bento Grid with Glassmorphism
          ══════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-24 lg:py-32 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">Features</p>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground">Everything you need to<br />protect your work</h2>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <RevealSection key={i} delay={i * 100} className={feature.large ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
                  <div className={`relative group rounded-2xl p-8 glass-bento hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 h-full ${feature.large ? "gradient-border" : "border border-border/30 hover:border-primary/30"}`}>
                    <div className="relative z-10">
                      <div className={`rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors ${feature.large ? "w-14 h-14" : "w-12 h-12"}`}>
                        <feature.icon className={`text-primary ${feature.large ? "h-7 w-7" : "h-6 w-6"}`} />
                      </div>
                      <h3 className={`font-bold mb-3 text-foreground ${feature.large ? "text-2xl" : "text-xl"}`}>{feature.title}</h3>
                      <p className={`text-muted-foreground leading-relaxed ${feature.large ? "text-base max-w-lg" : "text-sm"}`}>{feature.desc}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════
          STATS — Gradient Numbers
          ══════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-20 bg-muted/20 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <RevealSection key={i} delay={i * 100}>
                  <div className="relative">
                    <div className="text-4xl lg:text-5xl font-bold tabular-nums bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════
          BLOG — Magazine Layout
          ══════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-24 lg:py-28 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em]">From Our Blog</p>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Tips & guides for creators</h2>
            </div>

            {/* Magazine grid: first post large, rest side-by-side */}
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              {posts.map((post, i) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className={`group block rounded-2xl bg-card border border-border/30 hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden ${i === 0 ? "md:col-span-2" : ""}`}
                >
                  <div className={`p-8 ${i === 0 ? "lg:p-10" : ""}`}>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{post.category}</span>
                    <h3 className={`font-bold mt-3 mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2 ${i === 0 ? "text-2xl lg:text-3xl" : "text-lg"}`}>
                      {post.title}
                    </h3>
                    <p className={`text-muted-foreground line-clamp-2 mb-4 ${i === 0 ? "text-base" : "text-sm"}`}>{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                      <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Read more <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" size="lg" onClick={() => navigate("/blog")} className="group">
                View All Articles <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════
          FINAL CTA — Dark Cinematic Section
          ══════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 bg-foreground text-background overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 radial-glow opacity-60" />
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/10 animate-float-particle"
              style={{
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${5 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
          <RevealSection>
            <h2 className="text-3xl lg:text-5xl font-bold mb-5">
              Ready to protect your art?
            </h2>
            <p className="text-lg opacity-70 mb-10 max-w-lg mx-auto">
              Join thousands of creators who sleep better knowing their work is monitored 24/7.
            </p>

            {/* Email capture with animated border */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-3 p-1.5 rounded-xl bg-background/10 backdrop-blur-sm border border-background/20">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 text-base bg-background text-foreground border-0"
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
              <p className="text-xs opacity-50 mt-3">50 free protections. No credit card required.</p>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/pricing")}
              className="border-background/20 text-background hover:bg-background/10"
            >
              View Pricing Plans
            </Button>
          </RevealSection>
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
