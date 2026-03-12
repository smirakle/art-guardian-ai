import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, LogIn, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";


const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/pricing", label: "Pricing" },
    { path: "/blog", label: "Blog" },
    { path: "/about-tsmo", label: "About" },
    { path: "/faq", label: "FAQ" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <Shield className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TSMO
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <Button
              onClick={() => navigate('/auth')}
              variant="ghost"
              className="hidden sm:flex text-sm font-medium"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>

            <Button
              onClick={() => navigate('/auth?tab=signup')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5"
              size="sm"
            >
              Get Started Free
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-t border-border/50 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <Button
                onClick={() => { navigate('/auth'); setMobileOpen(false); }}
                variant="outline"
                className="w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={() => { navigate('/auth?tab=signup'); setMobileOpen(false); }}
                className="w-full bg-primary"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
