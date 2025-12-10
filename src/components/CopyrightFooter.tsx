import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';

export const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Twitter, url: 'https://x.com/TsmoWatch', label: 'X (Twitter)' },
    { icon: Instagram, url: 'https://www.instagram.com/tsmo_watch_art__guardian_/', label: 'Instagram' },
    { icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61584194224810', label: 'Facebook' },
    { icon: Linkedin, url: 'https://www.linkedin.com/company/tsmo-watch/?viewAsMember=true', label: 'LinkedIn' },
  ];

  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-muted-foreground">
              © {currentYear} TSMO Technology. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Proprietary & Confidential</span>
              <span>•</span>
              <span>Protected by Copyright Law</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Social Media Links */}
            <div className="flex items-center space-x-3 mr-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Link 
              to="/terms-and-privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms & Privacy
            </Link>
            <Link 
              to="/dmca-center" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              DMCA
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Legal Contact
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            This software is proprietary to TSMO Technology. Unauthorized reproduction, distribution, or use is strictly prohibited.
            <br />
            For licensing inquiries: <a href="mailto:shirleena.cunningham@tsmowatch.com" className="hover:text-foreground transition-colors">shirleena.cunningham@tsmowatch.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};