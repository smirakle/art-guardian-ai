import { Shield, Upload, Activity, Home, Users, Link2, UserCog, Mail, MessageSquare, LogIn, LogOut, Scale, Info, FileText, HelpCircle, Eye, Monitor, BarChart3, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TestPhasePopup } from "@/components/TestPhasePopup";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
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
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const mainNavItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/upload", label: "Image Monitoring Systems", icon: Monitor },
    { path: "/community", label: t('nav.community'), icon: Users },
    { path: "/legal-templates", label: "Legal Templates", icon: FileText },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
  ];

  const secondaryNavItems = [
    { path: "/admin", label: "Admin Panel", icon: UserCog },
    { path: "/about-tsmo", label: t('nav.about'), icon: Info },
    { path: "/contact", label: t('nav.contact'), icon: Mail }
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
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => {
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

                {/* AI Protection Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/ai-protection-settings')}
                    isActive={isActive('/ai-protection-settings')}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {!collapsed && <span>AI Protection</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

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
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full justify-start"
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
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