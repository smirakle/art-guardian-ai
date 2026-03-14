import React from 'react';
import tsmoLogo from "@/assets/tsmo_logo_vector_ready.jpg";
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Zap, Heart, ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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

const AboutTsmo = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Shield, title: "Creator-First", desc: "Every feature exists to serve artists, photographers, designers, and musicians." },
    { icon: Eye, title: "Relentless Vigilance", desc: "Our AI never sleeps — scanning billions of pages around the clock." },
    { icon: Zap, title: "Instant Action", desc: "From detection to DMCA filing in a single click." },
    { icon: Heart, title: "Community Driven", desc: "Built by a creator, shaped by thousands of creators worldwide." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,hsl(var(--accent)/0.06),transparent)]" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="flex flex-col items-center text-center">
            <img
              src={tsmoLogo}
              alt="TSMO Logo"
              className="h-36 sm:h-44 lg:h-56 object-contain mix-blend-multiply dark:brightness-110 dark:contrast-105 mb-8"
              loading="eager"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight leading-[1.1]">
              Born from frustration.<br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Built for protection.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              TSMO was created by an artist who got tired of watching her work get stolen — and decided to do something about it.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Story — Editorial long-form ── */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <RevealSection>
            <div className="space-y-8 text-foreground/85 text-lg leading-[1.85]">
              <p className="text-xl text-foreground font-medium leading-[1.7]">
                After graduating from art school, I was eager to share my work with the world. I uploaded my digital illustrations, photography, and mixed media pieces onto platforms meant to connect creatives with clients. At first, the responses were encouraging.
              </p>

              {/* Pull quote */}
              <div className="relative my-14 py-10 px-8 md:px-12">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary rounded-full" />
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-snug tracking-tight">
                  The excitement quickly turned into frustration.
                </p>
              </div>

              <p>
                I began to notice my artwork popping up in unexpected places — blogs, online stores, social media accounts, even merchandise sites — without my name, credit, or permission. Strangers were reposting, reselling, and in some cases, even claiming to be the original artists.
              </p>

              <p>
                I tried reporting stolen content, but the process was tedious and inconsistent. Some platforms took down the art; others ignored me. Worst of all, I realized that even when I found unauthorized uses, I had no real way to track the full scope of the theft. <span className="font-semibold text-foreground">It felt like fighting shadows.</span>
              </p>

              <p>
                That experience was a turning point. I realized I wasn't alone — this is a problem faced by countless creators in every field: artists, photographers, designers, animators, musicians. The digital world makes sharing easy, but it also makes stealing effortless.
              </p>

              {/* Second pull quote */}
              <div className="relative my-14 py-10 px-8 md:px-12">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-secondary rounded-full" />
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-snug tracking-tight">
                  That's why I started TSMO.
                </p>
              </div>

              <p>
                TSMO is an AI-powered platform built specifically to help artists protect their intellectual property online. It scans the internet for unauthorized use of your work, sends you alerts when your images appear elsewhere, and helps you take action — whether that's filing takedown notices, requesting credit, or seeking legal support.
              </p>

              <p>
                But more than just a tool, TSMO is a movement. It's a response to the exploitation of creative labor. It's a declaration that <span className="font-semibold text-foreground">artists deserve respect, recognition, and protection</span> in a digital economy that too often undervalues original work.
              </p>

              <p>
                We want creators to feel safe sharing their work, knowing that someone has their back. Because when you spend your life creating something unique, you shouldn't have to worry about it being stolen — you should be able to focus on making more of what only you can make.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Values Grid ── */}
      <RevealSection>
        <section className="py-20 lg:py-28 border-t border-border/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.15em] mb-3">Our Values</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">What drives everything we build</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <RevealSection key={i} delay={i * 100}>
                  <div className="text-center p-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <v.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── Founder Section — Dark dramatic ── */}
      <RevealSection>
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="relative rounded-3xl overflow-hidden bg-foreground text-background">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_-20%,hsl(var(--primary)/0.25),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,hsl(var(--accent)/0.1),transparent)]" />
              
              <div className="relative px-10 py-16 md:px-16 md:py-20 text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-background/10 border border-background/20 flex items-center justify-center mx-auto mb-8">
                  <span className="text-2xl font-bold text-background/80">SC</span>
                </div>
                <p className="text-lg md:text-xl text-background/70 leading-relaxed mb-8">
                  "TSMO Watch was created to help creators protect their portfolios in the AI era. Every artist deserves to feel safe sharing their work."
                </p>
                <div>
                  <p className="text-lg font-bold text-background">Shirleena Cunningham</p>
                  <p className="text-sm text-background/50">Founder & CEO · Harvard Innovation Labs Member</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── CTA ── */}
      <RevealSection>
        <section className="pb-28 pt-8">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
              Ready to protect your art?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of creators who trust TSMO to keep their work safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-13 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20" asChild>
                <Link to="/upload">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-10 rounded-xl" asChild>
                <Link to="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
};

export default AboutTsmo;
