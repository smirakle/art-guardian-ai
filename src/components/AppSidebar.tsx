import { Shield, Upload, Activity, Home, Users, Link2, UserCog, Mail, MessageSquare, LogIn, LogOut, Scale, Info, FileText, HelpCircle, Eye, Monitor, BarChart3, ShieldCheck, Settings, Search, Briefcase, UserCheck, Copyright, TrendingUp, Key, DollarSign, Send, Gavel, Zap, FileCheck, FileImage, FolderSearch, AlertTriangle, Lock as LockIcon, BookOpen, ShieldAlert, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TestPhasePopup } from "@/components/TestPhasePopup";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { user, role, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { interfaceMode } = useUserPreferences();
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Simplified navigation for beginner mode
  const beginnerNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "My Dashboard", icon: Home },
    { path: "/protection-hub", label: "Protect My Art", icon: Shield },
    { path: "/upload", label: "My Art", icon: FileImage },
    { path: "/monitoring-hub", label: "Find Copies", icon: Search },
    { path: "/simple-findings", label: "See Copies Found", icon: Eye },
    { path: "/dmca-center", label: "Alerts", icon: AlertTriangle },
    { path: "/legal-resources", label: "Legal Resources", icon: Scale },
    { path: "/support", label: "Support", icon: HelpCircle },
    { path: "/about-tsmo", label: "About TSMO", icon: Info },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const mainNavItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/dashboard", label: "Unified Dashboard", icon: Home },
    { path: "/protection-hub", label: "Protection Hub", icon: Shield },
    { path: "/aitpa-analysis", label: "AITPA Analysis", icon: ShieldAlert },
    { path: "/monitoring-hub", label: "Monitoring Hub", icon: Monitor },
    { path: "/findings", label: "My Findings", icon: FolderSearch },
    { path: "/upload", label: "Upload & Protect", icon: Upload },
    { path: "/deepfake-detection", label: "Deepfake Detection", icon: Eye },
    { path: "/forgery-detection", label: "Forgery Detection", icon: Search },
    { path: "/community", label: t('nav.community'), icon: Users },
    { path: "/dmca-center", label: "DMCA Center", icon: Gavel },
    { path: "/legal-resources", label: "Legal Resources", icon: Scale },
    { path: "/support", label: "Support", icon: HelpCircle },
    { path: "/roadmap", label: "Roadmap", icon: TrendingUp },
  ];

  const navItems = interfaceMode === 'beginner' ? beginnerNavItems : mainNavItems;

  // Advanced monitoring features (Phase 3-6)
  const advancedMonitoringItems = [
    { path: "/document-protection", label: "Document Protection", icon: Shield, requiresPlan: ['professional', 'enterprise'] },
    { path: "/portfolio-monitoring-advanced", label: "Advanced Portfolio", icon: FolderSearch, requiresPlan: ['starter', 'professional', 'enterprise'] },
    { path: "/threat-alerts", label: "Threat Alerts", icon: AlertTriangle, requiresPlan: ['professional', 'enterprise'] },
    { path: "/dmca-automation", label: "DMCA Automation", icon: FileCheck, requiresPlan: ['professional', 'enterprise'] },
  ];

  const adminOnlyItems = [
    { path: "/email-marketing", label: "Email Marketing", icon: Send },
    { path: "/tax-management", label: "Tax Management", icon: DollarSign },
    { path: "/marketing-flyer", label: "Marketing Flyer", icon: FileImage },
    { path: "/blog-management", label: "Blog Management", icon: BookOpen },
  ];

  const solutionsItems = [
    { path: "/protect-photos", label: "For Photographers", icon: Camera },
    { path: "/stop-art-theft", label: "Stop Art Theft", icon: Shield },
  ];

  const secondaryNavItems = [
    { path: "/admin", label: "Admin Panel", icon: UserCog },
    { path: "/about-tsmo", label: t('nav.about'), icon: Info },
    { path: "/contact", label: t('nav.contact'), icon: Mail },
    { path: "/terms-and-privacy", label: "Terms & Privacy", icon: Scale }
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-12 h-12 text-primary flex-shrink-0" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{interfaceMode === 'beginner' ? 'Menu' : 'Main Navigation'}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {/* Advanced mode additional items */}
                {interfaceMode === 'advanced' && (
                  <>
                    {/* Admin-only navigation items */}
                    {role === 'admin' && adminOnlyItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            onClick={() => navigate(item.path)}
                            isActive={isActive(item.path)}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-600"
                          >
                            <Icon className="w-4 h-4" />
                            {!collapsed && <span>{item.label}</span>}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                    
                    {/* SLA Status for Professional/Enterprise */}
                    {(subscription?.plan_id === 'professional' || subscription?.plan_id === 'enterprise') && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => navigate('/sla-status')}
                          isActive={isActive('/sla-status')}
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          {!collapsed && <span>SLA Status</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}

                    {/* Enterprise API Access */}
                    {subscription?.plan_id === 'enterprise' && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => navigate('/enterprise-api')}
                          isActive={isActive('/enterprise-api')}
                          className="flex items-center gap-2"
                        >
                          <Key className="w-4 h-4" />
                          {!collapsed && <span>Enterprise API</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}


                    {/* Investor Hub */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate('/investors')}
                        isActive={isActive('/investors')}
                        className="flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        {!collapsed && <span>Investor Hub</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Advanced Monitoring Features - Hidden in beginner mode */}
          {interfaceMode === 'advanced' && (
          <SidebarGroup>
            <SidebarGroupLabel>Advanced Monitoring</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {advancedMonitoringItems.map((item) => {
                  const Icon = item.icon;
                  const hasAccess = item.requiresPlan.includes(subscription?.plan_id || '');
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        className={`flex items-center gap-2 ${!hasAccess ? 'opacity-50' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                        {!collapsed && (
                          <span className="flex items-center gap-2">
                            {item.label}
                            {!hasAccess && <LockIcon className="w-3 h-3" />}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          )}

          {/* Solutions for specific audiences */}
          <SidebarGroup>
            <SidebarGroupLabel>Solutions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {solutionsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {interfaceMode === 'advanced' && (
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        className={`flex items-center gap-2 ${
                          item.label === "Admin Panel" 
                            ? "text-destructive hover:text-destructive" 
                            : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4 space-y-2">
          {!collapsed && <LanguageSwitcher />}
          
          <Button
            variant="outline"
            onClick={() => setShowFeedbackPopup(true)}
            className="flex items-center gap-2 w-full justify-start"
            size="sm"
          >
            <MessageSquare className="w-4 h-4" />
            {!collapsed && <span>Feedback</span>}
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2 w-full">
              <AccountMenu />
              {!collapsed && (
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="flex-1 flex items-center gap-2 justify-start"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 w-full justify-start"
              size="sm"
            >
              <LogIn className="w-4 h-4" />
              {!collapsed && <span>{t('nav.login')}</span>}
            </Button>
          )}
          
          {!collapsed && (
            <Button
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground w-full"
              onClick={() => {
                navigate('/');
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
          )}
        </SidebarFooter>
      </Sidebar>

      <TestPhasePopup 
        isOpen={showFeedbackPopup} 
        onOpenChange={setShowFeedbackPopup}
        autoShow={false}
      />
    </>
  );
}