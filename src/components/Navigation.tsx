import { Button } from "@/components/ui/button";
import { Shield, Upload, Activity, Home, Users, Link2, UserCog, Mail, MessageSquare, LogIn, LogOut, Scale, Info, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TestPhasePopup } from "@/components/TestPhasePopup";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { user, role, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // All navigation items - available to everyone
  const allNavItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/upload", label: "Protect Art", icon: Upload },
    { path: "/monitoring", label: "Monitoring", icon: Activity },
    { path: "/community", label: t('nav.community'), icon: Users },
    { path: "/legal-templates", label: "Legal Templates", icon: FileText },
    { path: "/admin", label: "Admin Panel", icon: UserCog },
    { path: "/about-tsmo", label: t('nav.about'), icon: Info },
    { path: "/contact", label: t('nav.contact'), icon: Mail }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-[50vw] md:max-w-none scrollbar-hide">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <div key={item.path} className="relative">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-1 md:gap-2 min-w-max px-2 md:px-3 text-xs md:text-sm ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : item.label === "Admin Panel"
                        ? "hover:bg-destructive/20 text-destructive hover:text-destructive"
                        : "hover:bg-secondary/50"
                    } ${item.label === "Admin Panel" ? "border border-destructive/30" : ""}`}
                    size="sm"
                  >
                    <Icon className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <Button
              variant="outline"
              onClick={() => setShowFeedbackPopup(true)}
              className="flex items-center gap-2 text-xs md:text-sm"
              size="sm"
            >
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
            
            {user ? (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs md:text-sm"
                size="sm"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 text-xs md:text-sm"
                size="sm"
              >
                <LogIn className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </Button>
            )}
            
            <Button
              className="hidden md:flex bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-sm"
              onClick={() => {
                navigate('/');
                // Scroll to pricing section after navigation
                setTimeout(() => {
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              size="sm"
            >
              Get Protected
            </Button>
          </div>
        </div>
      </div>
      
      {/* Test Phase Popup */}
      <TestPhasePopup 
        isOpen={showFeedbackPopup} 
        onOpenChange={setShowFeedbackPopup}
        autoShow={false}
      />
    </nav>
  );
};

export default Navigation;