import { Shield, Upload, Home, LogIn, LogOut, Monitor, Settings, FolderSearch, Gavel, MessageSquare, ChevronDown, UserCog, Send, DollarSign, FileImage, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TestPhasePopup } from "@/components/TestPhasePopup";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

const coreNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/upload", label: "Upload & Protect", icon: Upload },
  { path: "/monitoring-hub", label: "Monitor", icon: Monitor },
  { path: "/threat-alerts", label: "Alerts", icon: FolderSearch },
  { path: "/dmca-center", label: "Legal & DMCA", icon: Gavel },
  { path: "/settings", label: "Settings", icon: Settings },
];

const adminOnlyItems = [
  { path: "/admin", label: "Admin Panel", icon: UserCog },
  { path: "/email-marketing", label: "Email Marketing", icon: Send },
  { path: "/tax-management", label: "Tax Management", icon: DollarSign },
  { path: "/marketing-flyer", label: "Marketing Flyer", icon: FileImage },
  { path: "/blog-management", label: "Blog Management", icon: BookOpen },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { user, role, signOut } = useAuth();
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-12 h-12 text-primary flex-shrink-0" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TSMO
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Core Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {coreNavItems.map((item) => {
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
