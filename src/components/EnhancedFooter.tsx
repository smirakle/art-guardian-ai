import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Shield, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import tsmoLogo from '@/assets/tsmo-transparent-logo.png';

export const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('email_subscribers')
        .select('id, status')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        if (existing.status === 'subscribed') {
          toast({
            title: "Already subscribed!",
            description: "This email is already on our list.",
          });
        } else {
          // Reactivate subscription
          await supabase
            .from('email_subscribers')
            .update({ status: 'subscribed', updated_at: new Date().toISOString() })
            .eq('id', existing.id);
          
          setIsSubscribed(true);
          toast({
            title: "Welcome back!",
            description: "Your subscription has been reactivated.",
          });
        }
      } else {
        // Insert new subscriber
        const { error } = await supabase
          .from('email_subscribers')
          .insert([{
            email: email.toLowerCase(),
            status: 'subscribed',
            metadata: { source: 'footer_newsletter' }
          }]);

        if (error) throw error;

        setIsSubscribed(true);
        toast({
          title: "Subscribed!",
          description: "You'll receive our latest updates and tips.",
        });
      }
      
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Upload Artwork', href: '/upload' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
    resources: [
      { label: 'Help Center', href: '/help' },
      { label: 'Blog', href: '/blog' },
      { label: 'API Documentation', href: '/docs' },
      { label: 'Community', href: '/community' },
    ],
    legal: [
      { label: 'Terms & Privacy', href: '/terms-and-privacy' },
      { label: 'DMCA Center', href: '/dmca-center' },
      { label: 'Legal Contact', href: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/tsmowatch', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tsmo', label: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/tsmowatch', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/@tsmowatch', label: 'YouTube' },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border/50">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stay Protected & Informed</h3>
            <p className="text-muted-foreground mb-6">
              Get weekly tips on protecting your creative work, industry news, and platform updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" className="whitespace-nowrap" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Subscribed
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={tsmoLogo} alt="TSMO" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Your Art. Our Watch. AI-powered protection for creative professionals worldwide.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} TSMO Technology. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Protected by 256-bit SSL encryption</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <a href="mailto:shirleena.cunningham@tsmowatch.com" className="hover:text-foreground transition-colors">
              shirleena.cunningham@tsmowatch.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;