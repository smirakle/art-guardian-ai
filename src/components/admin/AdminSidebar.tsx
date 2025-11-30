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
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

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
      <SidebarHeader className="border-b px-4 py-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Management Console</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mx-auto">
            <Shield className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2">
        {menuSections.map((section, idx) => (
          <SidebarGroup key={section.label} className={idx > 0 ? "mt-4" : ""}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={isActive}
                        className={`
                          transition-all duration-200 rounded-md
                          ${isActive ? "bg-primary/10 text-primary font-medium shadow-sm" : "hover:bg-muted/50"}
                          ${item.highlight === "primary" && isActive ? "border-l-2 border-primary" : ""}
                          ${item.highlight === "accent" && isActive ? "bg-accent/50" : ""}
                        `}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        {!isCollapsed && (
                          <span className="flex-1">{item.label}</span>
                        )}
                        {!isCollapsed && item.highlight === "primary" && (
                          <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
                            Gov
                          </Badge>
                        )}
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
