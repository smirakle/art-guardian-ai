import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import UserManagement from "@/components/admin/UserManagement";
import EnhancedUserManagement from "@/components/admin/EnhancedUserManagement";
import RealTimeDataMonitoring from "@/components/admin/RealTimeDataMonitoring";
import DataExportPanel from "@/components/admin/DataExportPanel";
import SystemManagement from "@/components/admin/SystemManagement";
import RealTimeMonitoring from "@/components/RealTimeMonitoring";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import LiveFeed from "@/components/LiveFeed";
import BlockchainReadiness from "@/components/admin/BlockchainReadiness";
import MonitoringReadiness from "@/components/admin/MonitoringReadiness";
import AITPReadiness from "@/components/admin/AITPReadiness";
import GovernmentDefenseMonitoring from "@/components/admin/GovernmentDefenseMonitoring";
import GovernmentApiPanel from "@/components/admin/GovernmentApiPanel";
import AdminMFAEnforcement from "@/components/security/AdminMFAEnforcement";
import EnhancedSecurityDashboard from "@/components/security/EnhancedSecurityDashboard";
import AdminLiveChatDashboard from "@/components/admin/AdminLiveChatDashboard";
import AllUploadsAndScans from "@/components/admin/AllUploadsAndScans";
import GuestUploadsTracking from "@/components/admin/GuestUploadsTracking";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMonitoring, setIsMonitoring] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UserManagement />;
      case "enhanced-users":
        return <EnhancedUserManagement />;
      case "realtime":
        return <RealTimeDataMonitoring />;
      case "monitoring":
        return (
          <>
            <RealTimeMonitoring />
            <MonitoringReadiness />
          </>
        );
      case "analytics":
        return <MonitoringDashboard />;
      case "security":
        return (
          <>
            <AdminMFAEnforcement />
            <EnhancedSecurityDashboard />
          </>
        );
      case "gov-defense":
        return <GovernmentDefenseMonitoring />;
      case "gov-api":
        return <GovernmentApiPanel />;
      case "data":
        return <DataExportPanel />;
      case "system":
        return <SystemManagement />;
      case "blockchain":
        return <BlockchainReadiness />;
      case "ai-training":
        return <AITPReadiness />;
      case "live-support":
        return <AdminLiveChatDashboard />;
      case "live-feed":
        return <LiveFeed isActive={isMonitoring} />;
      case "uploads-scans":
        return <AllUploadsAndScans />;
      case "guest-uploads":
        return <GuestUploadsTracking />;
      default:
        return <AdminDashboard />;
    }
  };

  const sectionDescriptions: Record<string, string> = {
    dashboard: "Overview of system status and key metrics",
    users: "Manage user accounts and permissions",
    "enhanced-users": "Advanced user management with detailed insights",
    realtime: "Monitor real-time data and system activity",
    monitoring: "System monitoring dashboard and metrics",
    analytics: "Comprehensive analytics and reporting",
    security: "Security settings and audit logs",
    "gov-defense": "Government and defense sector management",
    "gov-api": "Government API integration settings",
    data: "Export and manage system data",
    system: "System configuration and settings",
    blockchain: "Blockchain integration and management",
    "ai-training": "AI training and model management",
    "live-support": "Live customer support dashboard",
    "live-feed": "Real-time activity feed",
    "uploads-scans": "Manage uploads and security scans",
    "guest-uploads": "Track uploads from guest users",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background pt-16">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-10 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">
                {activeTab.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {sectionDescriptions[activeTab]}
              </p>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="container max-w-7xl mx-auto px-6 py-8">
              <div className="space-y-6">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;