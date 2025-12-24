import { Shield, Upload, Home, Users, UserCog, Mail, MessageSquare, LogIn, LogOut, Scale, Info, HelpCircle, Eye, Monitor, BarChart3, Settings, Search, TrendingUp, Key, DollarSign, Send, Gavel, FileCheck, FileImage, FolderSearch, AlertTriangle, Lock as LockIcon, BookOpen, ShieldAlert, Camera, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

  // Grouped navigation for cleaner sidebar
  const protectItems = [
    { path: "/upload", label: "Upload & Protect", icon: Upload },
    { path: "/protection-hub", label: "Style Cloak", icon: Shield },
  ];

  const monitorItems = [
    { path: "/monitoring-hub", label: "Monitoring Hub", icon: Monitor },
    { path: interfaceMode === 'beginner' ? "/simple-findings" : "/findings", label: "My Findings", icon: FolderSearch },
    { path: "/dmca-center", label: "Alerts", icon: AlertTriangle },
  ];

  const verifyItems = [
    { path: "/deepfake-detection", label: "Deepfake Detection", icon: Eye },
    { path: "/forgery-detection", label: "Forgery Detection", icon: Search },
    { path: "/aitpa-analysis", label: "AITPA Analysis", icon: ShieldAlert },
  ];

  const enforceItems = [
    { path: "/dmca-center", label: "DMCA Center", icon: Gavel },
    { path: "/legal-resources", label: "Legal Resources", icon: Scale },
  ];

  const supportItems = [
    { path: "/support", label: "Support", icon: HelpCircle },
    { path: "/community", label: "Community", icon: Users },
    { path: "/about-tsmo", label: "About TSMO", icon: Info },
  ];

  // Admin-only items
  const adminOnlyItems = [
    { path: "/email-marketing", label: "Email Marketing", icon: Send },
    { path: "/tax-management", label: "Tax Management", icon: DollarSign },
    { path: "/marketing-flyer", label: "Marketing Flyer", icon: FileImage },
    { path: "/blog-management", label: "Blog Management", icon: BookOpen },
  ];

  // Solutions for specific audiences
  const solutionsItems = [
    { path: "/protect-photos", label: "For Photographers", icon: Camera },
    { path: "/stop-art-theft", label: "Stop Art Theft", icon: Shield },
  ];

  // Advanced monitoring features (Phase 3-6)
  const advancedMonitoringItems = [
    { path: "/document-protection", label: "Document Protection", icon: Shield, requiresPlan: ['professional', 'enterprise'] },
    { path: "/portfolio-monitoring-advanced", label: "Advanced Portfolio", icon: FolderSearch, requiresPlan: ['starter', 'professional', 'enterprise'] },
    { path: "/threat-alerts", label: "Threat Alerts", icon: AlertTriangle, requiresPlan: ['professional', 'enterprise'] },
    { path: "/dmca-automation", label: "DMCA Automation", icon: FileCheck, requiresPlan: ['professional', 'enterprise'] },
  ];

  const secondaryNavItems = [
    { path: "/admin", label: "Admin Panel", icon: UserCog },
    { path: "/contact", label: t('nav.contact'), icon: Mail },
    { path: "/terms-and-privacy", label: "Terms & Privacy", icon: Scale },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  // Helper to render nav items
  const renderNavItems = (items: typeof protectItems) => (
    <SidebarMenu>
      {items.map((item) => {
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
  );

  // Collapsible group component
  const CollapsibleNavGroup = ({ 
    label, 
    items, 
    icon: GroupIcon,
    defaultOpen = false 
  }: { 
    label: string; 
    items: typeof protectItems; 
    icon: typeof Shield;
    defaultOpen?: boolean;
  }) => {
    const hasActiveItem = items.some(item => isActive(item.path));
    
    return (
      <Collapsible defaultOpen={defaultOpen || hasActiveItem} className="group/collapsible">
        <SidebarGroup>
          <CollapsibleTrigger className="w-full">
            <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1">
              <div className="flex items-center gap-2">
                <GroupIcon className="w-4 h-4" />
                {!collapsed && <span>{label}</span>}
              </div>
              {!collapsed && (
                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              )}
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarGroupContent className="pl-2">
              {renderNavItems(items)}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

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
          {/* Home & Dashboard - Always visible */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/')}
                    isActive={isActive('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    {!collapsed && <span>Home</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/dashboard')}
                    isActive={isActive('/dashboard')}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    {!collapsed && <span>{interfaceMode === 'beginner' ? 'My Dashboard' : 'Dashboard'}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Protect Group */}
          <CollapsibleNavGroup 
            label="Protect" 
            items={protectItems} 
            icon={Shield}
            defaultOpen={true}
          />

          {/* Monitor Group */}
          <CollapsibleNavGroup 
            label="Monitor" 
            items={monitorItems} 
            icon={Monitor}
            defaultOpen={true}
          />

          {/* Verify Group - Advanced mode only */}
          {interfaceMode === 'advanced' && (
            <CollapsibleNavGroup 
              label="Verify" 
              items={verifyItems} 
              icon={Eye}
            />
          )}

          {/* Enforce Group */}
          <CollapsibleNavGroup 
            label="Enforce" 
            items={enforceItems} 
            icon={Gavel}
          />

          {/* Support Group */}
          <CollapsibleNavGroup 
            label="Support" 
            items={supportItems} 
            icon={HelpCircle}
          />

          {/* Solutions - Collapsed */}
          <CollapsibleNavGroup 
            label="Solutions" 
            items={solutionsItems} 
            icon={Camera}
          />

          {/* Advanced Monitoring - Advanced mode only */}
          {interfaceMode === 'advanced' && (
            <SidebarGroup>
              <SidebarGroupLabel>Advanced</SidebarGroupLabel>
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin-only items */}
          {role === 'admin' && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-orange-600">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminOnlyItems.map((item) => {
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
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate('/admin')}
                      isActive={isActive('/admin')}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <UserCog className="w-4 h-4" />
                      {!collapsed && <span>Admin Panel</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Settings & Other */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings')}
                    isActive={isActive('/settings')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {!collapsed && <span>Settings</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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