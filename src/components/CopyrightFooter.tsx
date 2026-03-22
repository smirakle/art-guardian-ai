import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Linkedin, Mail, MapPin, Building2 } from 'lucide-react';

export const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, url: 'https://x.com/TsmoWatch', label: 'X (Twitter)' },
    { icon: Instagram, url: 'https://www.instagram.com/tsmo_watch_art__guardian_/', label: 'Instagram' },
    { icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61584194224810', label: 'Facebook' },
    { icon: Linkedin, url: 'https://www.linkedin.com/company/tsmo-watch/?viewAsMember=true', label: 'LinkedIn' },
  ];

  const legalLinks = [
    { to: '/terms-and-privacy', label: 'Terms of Service' },
    { to: '/terms-and-privacy', label: 'Privacy Policy' },
    { to: '/refund-policy', label: 'Refund Policy' },
    { to: '/contact', label: 'Support' },
    { to: '/dmca-center', label: 'DMCA' },
  ];

  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        {/* Company Identity Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              TSMO Technology Inc.
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Founded by Shirleena Cunningham</p>
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Cambridge, MA
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <a href="mailto:shirleena.cunningham@tsmowatch.com" className="hover:text-foreground transition-colors">
                  shirleena.cunningham@tsmowatch.com
                </a>
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Connect With Us</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Questions? Email us at{' '}
              <a href="mailto:shirleena.cunningham@tsmowatch.com" className="underline hover:text-foreground">
                shirleena.cunningham@tsmowatch.com
              </a>
            </p>
          </div>
        </div>

        {/* Legal Disclaimers */}
        <div className="border-t pt-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">Legal Disclaimer</p>
              <p>TSMO is not a law firm and does not provide legal advice. Artists should always consult a qualified attorney before pursuing any legal action.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">You Own Your Work</p>
              <p>All artists retain full ownership of their work. TSMO does not claim any rights, licenses, or ownership over content uploaded to our platform.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© {currentYear} TSMO Technology Inc. All rights reserved.</p>
              <p className="text-xs mt-1">Proprietary & Confidential • Protected by Copyright Law</p>
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right max-w-md">
              For licensing inquiries:{' '}
              <a href="mailto:shirleena.cunningham@tsmowatch.com" className="hover:text-foreground transition-colors underline">
                shirleena.cunningham@tsmowatch.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};