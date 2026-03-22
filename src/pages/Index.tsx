import React, { useState, useEffect, useRef } from "react";
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
import { Shield, Eye, Search, ArrowRight, Globe, Play, ChevronRight, Bell, Upload, BookOpen, Clock, Check, Zap, Lock, FileSearch, ArrowDown, Scale } from "lucide-react";
import tsmoLogo from "@/assets/tsmo_logo_vector_ready.jpg";
import { useQuery } from "@tanstack/react-query";
import bizWeeklyBanner from "@/assets/Biz_Weekly.png";
import caiLogo from "@/assets/CAI_Lockup_RGB_Black.png";
import DemoEnvironment from "@/components/investor/DemoEnvironment";
import { InstantProtectModal } from "@/components/InstantProtectModal";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ProtectionShowcase } from "@/components/ProtectionShowcase";

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

/* ─── Animated counter ─── */
const AnimatedCounter: React.FC<{ value: string; duration?: number }> = ({ value, duration = 2000 }) => {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const numMatch = value.match(/^([\d,]+)/);
        if (numMatch) {
          const target = parseInt(numMatch[1].replace(/,/g, ''));
          const suffix = value.slice(numMatch[1].length);
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            setDisplay(current.toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <div ref={ref}>{display}</div>;
};

/* ─── Orbiting ring ─── */
const OrbitRing: React.FC<{ size: number; duration: number; delay: number; opacity: number }> = ({ size, duration, delay, opacity }) => (
  <div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
    style={{
      width: size, height: size,
      animation: `spin ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      opacity,
    }}
  >
    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary/30" />
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
    { icon: Upload, title: "Upload", desc: "Drop your artwork into TSMO", num: "01" },
    { icon: Search, title: "We Scan", desc: "AI searches billions of pages", num: "02" },
    { icon: Bell, title: "Get Alerted", desc: "Instant notification of matches", num: "03" },
    { icon: Shield, title: "Take Action", desc: "One-click enforcement tools", num: "04" },
  ];

  const features = [
    { icon: Eye, title: "AI Training Resistance", desc: "Style cloaking technology makes your art unusable for AI model training while keeping it visually identical to humans." },
    { icon: Search, title: "Reverse Image Search", desc: "Continuously monitors millions of websites, marketplaces, and social platforms to detect unauthorized use of your work." },
    { icon: Globe, title: "24/7 Web Monitoring", desc: "Our AI agents scan the internet around the clock so you never miss an unauthorized copy of your artwork." },
    { icon: Zap, title: "Instant DMCA Takedowns", desc: "Generate and file legally-binding DMCA notices with a single click. Our system handles enforcement across all platforms." },
    { icon: FileSearch, title: "Provenance Tracking", desc: "Blockchain-backed ownership certificates with C2PA content credentials for irrefutable proof of original authorship." },
    { icon: Lock, title: "Forgery Detection", desc: "Advanced AI detects deepfakes, style mimicry, and unauthorized derivatives of your original artwork." },
  ];

  const stats = [
    { value: "2,400+", label: "Artworks Protected" },
    { value: "24/7", label: "AI Monitoring" },
    { value: "50+", label: "Platforms Scanned" },
    { value: "99.9%", label: "Detection Rate" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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

      {/* ══════════════════════════════════════════════════════
          HERO — Full-viewport cinematic
          ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">

        {/* Orbit rings */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <OrbitRing size={500} duration={30} delay={0} opacity={0.3} />
          <OrbitRing size={700} duration={45} delay={5} opacity={0.15} />
          <OrbitRing size={900} duration={60} delay={10} opacity={0.08} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo with glow */}
            <div className="mb-10 opacity-0 animate-stagger-fade-up" style={{ animationDelay: '0.1s' }}>
              <img src={tsmoLogo} alt="TSMO Logo" className="h-32 sm:h-40 lg:h-52 mx-auto object-contain" loading="eager" />
            </div>

            {/* Headline — dramatic staggered */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.95]">
              <span className="block opacity-0 animate-stagger-fade-up text-foreground" style={{ animationDelay: '0.3s' }}>
                Your Art Is
              </span>
              <span className="block opacity-0 animate-stagger-fade-up text-foreground" style={{ animationDelay: '0.45s' }}>
                Being Stolen.
              </span>
              <span className="block opacity-0 animate-stagger-fade-up mt-2" style={{ animationDelay: '0.6s' }}>
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                  We Stop It.
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed opacity-0 animate-stagger-fade-up" style={{ animationDelay: '0.75s' }}>
              AI-powered monitoring that scans the web 24/7 and alerts you when someone uses your work without permission.
            </p>

            {/* CTA — Single, bold, unmissable */}
            <div className="flex justify-center mb-8 opacity-0 animate-stagger-fade-up" style={{ animationDelay: '0.9s' }}>
              <Button
                size="lg"
                className="h-16 px-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 rounded-2xl glow-pulse"
                onClick={() => setShowInstantProtect(true)}
              >
                <Upload className="mr-3 h-5 w-5" />
                Scan Your Art Free
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground opacity-0 animate-stagger-fade-up" style={{ animationDelay: '1.05s' }}>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Instant results</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> 50 free scans</span>
            </div>

            {/* Demo link */}
            <div className="mt-10 opacity-0 animate-stagger-fade-up" style={{ animationDelay: '1.2s' }}>
              <button
                onClick={() => setShowLiveDemo(true)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </div>
                Watch 2-minute demo
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-stagger-fade-up" style={{ animationDelay: '1.5s' }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40 animate-bounce">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Legal disclaimers moved to CopyrightFooter */}

      {/* ══════════════════════════════════════════════════════
          ══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-20 border-y border-border/30 bg-muted/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {stats.map((stat, i) => (
                <RevealSection key={i} delay={i * 120}>
                  <div>
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold tabular-nums bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          CREDIBILITY — Logo Bar
          ══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-14 border-b border-border/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] mb-10">Trusted & Recognized</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
              <a href="https://bizweekly.com/suddenly-fighting-shadows-one-artists-mission-to-protect-creators-in-the-ai-age/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
                <img src={bizWeeklyBanner} alt="As seen on BizWeekly" className="h-10 md:h-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">Read the feature <ChevronRight className="w-3 h-3" /></span>
              </a>
              <div className="hidden md:block w-px h-12 bg-border/40" />
              <div className="flex flex-col items-center gap-3">
                <img src={caiLogo} alt="Content Authenticity Initiative" className="h-10 md:h-12 object-contain dark:invert opacity-60" />
                <span className="text-xs text-muted-foreground">CAI Member</span>
              </div>
              <div className="hidden md:block w-px h-12 bg-border/40" />
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-sm font-medium text-foreground/60">Harvard Innovation Labs</span>
                <span className="text-[10px] text-muted-foreground/50">Member · Not an endorsement</span>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — Numbered steps with connecting line
          ══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-28 lg:py-36 overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-20">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">How It Works</p>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight">
                Protection in four<br />simple steps
              </h2>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-border/30">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary origin-left animate-timeline-grow" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                {steps.map((step, i) => (
                  <RevealSection key={i} delay={i * 150}>
                    <div className="text-center group">
                      <div className="relative mx-auto mb-8">
                        <div className="w-24 h-24 rounded-3xl bg-card border-2 border-border/40 flex items-center justify-center mx-auto group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 group-hover:-translate-y-2">
                          <step.icon className="h-9 w-9 text-primary transition-transform group-hover:scale-110 duration-300" />
                        </div>
                        <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-lg">
                          {step.num}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          PROTECTION SHOWCASE — Interactive demo
          ══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-28 lg:py-36 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <ProtectionShowcase />
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          FEATURES — Alternating large/small bento
          ══════════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-muted/10 border-y border-border/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <RevealSection>
            <div className="text-center mb-20">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Features</p>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight">
                Everything you need to<br />protect your work
              </h2>
            </div>
          </RevealSection>

          {/* Row 1: hero feature + 2 stacked */}
          {(() => {
            const HeroIcon = features[0].icon;
            return (
            <div className="grid lg:grid-cols-5 gap-6 mb-6">
              <RevealSection className="lg:col-span-3">
                <div className="relative group rounded-3xl p-10 lg:p-12 h-full bg-card border border-border/40 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06),transparent)] rounded-full" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <HeroIcon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">{features[0].title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-md">{features[0].desc}</p>
                  </div>
                </div>
              </RevealSection>

            <div className="lg:col-span-2 grid gap-6">
              {features.slice(1, 3).map((f, i) => (
                <RevealSection key={i} delay={(i + 1) * 120}>
                  <div className="group rounded-3xl p-7 bg-card border border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 h-full">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
            );
          })()}

          {/* Row 2: 3 equal cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.slice(3).map((f, i) => (
              <RevealSection key={i} delay={(i + 3) * 120}>
                <div className="group rounded-3xl p-7 bg-card border border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof counter */}
      <RevealSection>
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Join <span className="text-primary">2,400+</span> creators protecting their art with TSMO
            </p>
            <p className="text-muted-foreground mt-4 text-lg">From independent artists to professional studios</p>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          BLOG — Editorial grid
          ══════════════════════════════════════════════════════ */}
      <RevealSection>
        <section className="py-24 lg:py-28 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Blog</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Latest insights</h2>
              </div>
              <Button variant="ghost" onClick={() => navigate("/blog")} className="hidden sm:flex text-muted-foreground hover:text-primary gap-1.5">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <RevealSection key={post.slug} delay={i * 120}>
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <article className="rounded-2xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-500 overflow-hidden h-full">
                      {/* Color accent bar */}
                      <div className={`h-1 ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-secondary'}`} />
                      <div className="p-7">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{post.category}</span>
                        <h3 className="text-lg font-bold mt-3 mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                          <span className="text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Read <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </RevealSection>
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" onClick={() => navigate("/blog")}>
                View All Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA — Dark cinematic with email capture
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 lg:py-40 bg-foreground text-background overflow-hidden">
        {/* Dramatic lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(var(--primary)/0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,hsl(var(--accent)/0.08),transparent)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container mx-auto px-4 max-w-2xl text-center relative z-10">
          <RevealSection>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight text-background leading-[1.05]">
              Ready to protect<br />your art?
            </h2>
            <p className="text-lg text-background/50 mb-12 max-w-md mx-auto">
              Join thousands of creators who sleep better knowing their work is monitored around the clock.
            </p>

            {/* Email capture */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex gap-3 p-2 rounded-2xl bg-background/10 backdrop-blur-sm border border-background/15">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-13 text-base bg-background text-foreground border-0 rounded-xl"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
                <Button
                  size="lg"
                  className="h-13 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/30"
                  onClick={() => navigate(`/auth?email=${encodeURIComponent(signupEmail)}&tab=signup`)}
                >
                  Get Started
                </Button>
              </div>
              <p className="text-xs text-background/30 mt-4">50 free protections · No credit card required</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="lg" onClick={() => navigate("/pricing")} className="text-background/50 hover:text-background hover:bg-background/10 rounded-xl">
                View Pricing
              </Button>
              <span className="text-background/20">·</span>
              <button onClick={() => setShowLiveDemo(true)} className="text-sm text-background/50 hover:text-background transition-colors inline-flex items-center gap-2">
                <Play className="w-3.5 h-3.5" /> Watch Demo
              </button>
            </div>
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
