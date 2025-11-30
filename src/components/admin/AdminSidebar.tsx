import { 
  LayoutDashboard, Users, UserCog, Activity, Database, 
  BarChart3, Shield, Globe, Settings, Blocks, Brain,
  Headphones, Radio, Upload, UserPlus
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuSections = [
  {
    label: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "users", label: "Users", icon: Users },
      { id: "enhanced-users", label: "Enhanced Users", icon: UserCog },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { id: "realtime", label: "Real-Time", icon: Activity },
      { id: "monitoring", label: "Dashboard", icon: BarChart3 },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "live-feed", label: "Live Feed", icon: Radio },
    ],
  },
  {
    label: "Data & Security",
    items: [
      { id: "uploads-scans", label: "Uploads & Scans", icon: Upload },
      { id: "guest-uploads", label: "Guest Uploads", icon: UserPlus },
      { id: "data", label: "Data Export", icon: Database },
      { id: "security", label: "Security", icon: Shield },
    ],
  },
  {
    label: "Advanced",
    items: [
      { id: "blockchain", label: "Blockchain", icon: Blocks },
      { id: "ai-training", label: "AI Training", icon: Brain },
      { id: "system", label: "System", icon: Settings },
    ],
  },
  {
    label: "Government & Support",
    items: [
      { id: "gov-defense", label: "Gov/Defense", icon: Globe, highlight: "primary" },
      { id: "gov-api", label: "Gov API", icon: Globe },
      { id: "live-support", label: "Live Support", icon: Headphones, highlight: "accent" },
    ],
  },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            {!isCollapsed && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={isActive}
                        className={
                          item.highlight === "primary"
                            ? "data-[active=true]:bg-primary/10 data-[active=true]:border-l-2 data-[active=true]:border-primary"
                            : item.highlight === "accent"
                            ? "data-[active=true]:bg-accent/50"
                            : ""
                        }
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
