import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  ArrowRight,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Shield,
  Loader2,
} from 'lucide-react';

const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.12);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', { body: data });
      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `Thanks ${data.firstName}! We'll get back to you within 24 hours.`,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "shirleena.cunningham@tsmowatch.com", href: "mailto:shirleena.cunningham@tsmowatch.com" },
    { icon: MapPin, label: "Location", value: "Cambridge, MA", href: undefined },
    { icon: Clock, label: "Response Time", value: "Within 24 hours", href: undefined },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight leading-[1.1]">
              Let's talk about<br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">protecting your work</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Whether you have questions, need a demo, or want to discuss enterprise solutions — we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content: Form + Info ── */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Form — 3 cols */}
            <RevealSection className="lg:col-span-3">
              <div className="rounded-2xl border border-border/40 bg-card p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Send us a message</h2>
                  <p className="text-sm text-muted-foreground">Fill out the form and we'll get back to you promptly.</p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input id="firstName" name="firstName" placeholder="Jane" required className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="jane@example.com" required className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <Input id="subject" name="subject" placeholder="How can we help?" required className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                    <Textarea id="message" name="message" placeholder="Tell us more about what you need..." rows={5} required className="rounded-xl resize-none" />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Send Message</>
                    )}
                  </Button>
                </form>
              </div>
            </RevealSection>

            {/* Contact Info — 2 cols */}
            <RevealSection className="lg:col-span-2" delay={200}>
              <div className="space-y-8">
                {/* Info cards */}
                <div className="space-y-4">
                  {contactInfo.map((info, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{info.label}</p>
                        {info.href ? (
                          <a href={info.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all">
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick links */}
                <div className="rounded-2xl border border-border/40 bg-muted/30 p-6">
                  <h3 className="text-sm font-bold text-foreground mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Help Center / FAQ", to: "/faq" },
                      { label: "View Pricing Plans", to: "/pricing" },
                      { label: "Join Community", to: "/community" },
                    ].map((link, i) => (
                      <Link key={i} to={link.to} className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors group">
                        {link.label}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Enterprise callout */}
                <div className="relative rounded-2xl overflow-hidden bg-foreground text-background p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,hsl(var(--primary)/0.2),transparent)]" />
                  <div className="relative">
                    <Shield className="w-6 h-6 text-secondary mb-3" />
                    <h3 className="text-base font-bold text-background mb-2">Enterprise Solutions</h3>
                    <p className="text-xs text-background/60 mb-4 leading-relaxed">
                      Custom deployment, dedicated support, and SLA guarantees for teams.
                    </p>
                    <Button size="sm" className="bg-background text-foreground hover:bg-background/90 rounded-lg text-xs font-bold h-9 px-4" asChild>
                      <Link to="/pricing">Learn More →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <RevealSection>
        <section className="pb-28">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="relative rounded-3xl overflow-hidden bg-foreground text-background">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_-20%,hsl(var(--primary)/0.25),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,hsl(var(--accent)/0.1),transparent)]" />
              <div className="relative px-10 py-16 md:px-16 md:py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
                  Ready to start protecting your art?
                </h2>
                <p className="text-background/60 mb-8 max-w-md mx-auto">
                  Upload your first artwork and get scanning in under 60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="h-13 px-10 rounded-xl bg-background text-foreground hover:bg-background/90 font-bold shadow-xl" asChild>
                    <Link to="/upload">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="h-13 px-10 rounded-xl text-background/70 hover:text-background hover:bg-background/10" asChild>
                    <Link to="/pricing">View Plans</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </div>
  );
};

export default Contact;
