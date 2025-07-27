import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  Upload, 
  Activity, 
  Home, 
  Users, 
  FileText, 
  HelpCircle,
  UserCog, 
  Mail, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  Info,
  Menu,
  ChevronDown,
  Star,
  Crown,
  Zap
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TestPhasePopup } from "@/components/TestPhasePopup";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const ImprovedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, role, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Core navigation items
  const coreNavItems = [
    { path: "/", label: t('nav.home'), icon: Home, description: "Welcome & Overview" },
    { path: "/upload", label: "Upload & Protect", icon: Upload, description: "Secure your artwork", badge: "Start Here" },
    { path: "/dashboard", label: "Dashboard", icon: Activity, description: "Monitor & manage", requiresAuth: true },
    { path: "/monitoring", label: "Live Monitoring", icon: Activity, description: "Real-time protection", requiresAuth: true, badge: "Live" }
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { path: "/community", label: t('nav.community'), icon: Users, description: "Connect with artists" },
    { path: "/legal-templates", label: "Legal Templates", icon: FileText, description: "Professional documents", badge: "New" },
    { path: "/faq", label: "Help & FAQ", icon: HelpCircle, description: "Get support" },
    { path: "/about-tsmo", label: t('nav.about'), icon: Info, description: "About TSMO" },
    { path: "/contact", label: t('nav.contact'), icon: Mail, description: "Contact support" }
  ];

  // Admin items
  const adminNavItems = [
    { path: "/admin", label: "Admin Panel", icon: UserCog, description: "System management", adminOnly: true }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => currentPath === path;

  const NavButton = ({ item, compact = false }: { item: any, compact?: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    if (compact) {
      return (
        <Button
          variant={active ? "default" : "ghost"}
          onClick={() => handleNavigation(item.path)}
          className={`relative ${active ? "bg-primary text-primary-foreground" : ""}`}
          size="sm"
        >
          <Icon className="w-4 h-4" />
          {item.badge && (
            <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1">
              {item.badge}
            </Badge>
          )}
        </Button>
      );
    }

    return (
      <Button
        variant={active ? "default" : "ghost"}
        onClick={() => handleNavigation(item.path)}
        className={`w-full justify-start gap-3 h-auto p-3 ${
          active ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50"
        }`}
      >
        <Icon className="w-5 h-5" />
        <div className="flex-1 text-left">
          <div className="font-medium flex items-center gap-2">
            {item.label}
            {item.badge && (
              <Badge variant={active ? "secondary" : "outline"} className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <div className="text-xs opacity-70 mt-1">
            {item.description}
          </div>
        </div>
      </Button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <Shield className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Art Protection</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Core Actions - Always Visible */}
            {coreNavItems
              .filter(item => !item.requiresAuth || user)
              .map((item) => (
                <NavButton key={item.path} item={item} compact />
              ))}

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Secondary Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  More
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                {role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    {adminNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className="flex items-center gap-3 p-3 cursor-pointer text-destructive"
                        >
                          <Icon className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    TSMO Navigation
                  </SheetTitle>
                  <SheetDescription>
                    Protect and monitor your creative work
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Core Actions */}
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Quick Actions</h3>
                    <div className="space-y-1">
                      {coreNavItems
                        .filter(item => !item.requiresAuth || user)
                        .map((item) => (
                          <NavButton key={item.path} item={item} />
                        ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Secondary Navigation */}
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Resources</h3>
                    <div className="space-y-1">
                      {secondaryNavItems.map((item) => (
                        <NavButton key={item.path} item={item} />
                      ))}
                    </div>
                  </div>

                  {/* Admin Section */}
                  {role === 'admin' && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Administration</h3>
                        <div className="space-y-1">
                          {adminNavItems.map((item) => (
                            <NavButton key={item.path} item={item} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            <Button
              variant="outline"
              onClick={() => setShowFeedbackPopup(true)}
              size="sm"
              className="hidden sm:flex"
            >
              <MessageSquare className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Activity className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard?tab=settings')}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
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

export default ImprovedNavigation;