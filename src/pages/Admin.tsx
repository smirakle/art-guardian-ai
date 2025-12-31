import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import MonitoringReadiness from "@/components/admin/MonitoringReadiness";
import AITPReadiness from "@/components/admin/AITPReadiness";
import GovernmentDefenseMonitoring from "@/components/admin/GovernmentDefenseMonitoring";
import GovernmentApiPanel from "@/components/admin/GovernmentApiPanel";
import AdminMFAEnforcement from "@/components/security/AdminMFAEnforcement";
import EnhancedSecurityDashboard from "@/components/security/EnhancedSecurityDashboard";
import AdminLiveChatDashboard from "@/components/admin/AdminLiveChatDashboard";
import AllUploadsAndScans from "@/components/admin/AllUploadsAndScans";
import GuestUploadsTracking from "@/components/admin/GuestUploadsTracking";
import BlogManagement from "@/components/admin/BlogManagement";
import { RetentionDashboard } from "@/components/admin/RetentionDashboard";

const Admin = () => {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState("dashboard");
   const [isMonitoring, setIsMonitoring] = useState(true);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Quick Links */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quick Links:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/partnerships")}
                className="gap-2"
              >
                <Handshake className="h-4 w-4" />
                Partnerships
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              <TabsList className="flex w-max min-w-full gap-2 px-4 py-2 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
                <TabsTrigger value="dashboard" className="px-4 py-2 text-sm font-medium">Dashboard</TabsTrigger>
                <TabsTrigger value="users" className="px-4 py-2 text-sm font-medium">Users</TabsTrigger>
                <TabsTrigger value="enhanced-users" className="px-4 py-2 text-sm font-medium">Enhanced Users</TabsTrigger>
                <TabsTrigger value="realtime" className="px-4 py-2 text-sm font-medium">Real-Time</TabsTrigger>
                <TabsTrigger value="data" className="px-4 py-2 text-sm font-medium">Data Export</TabsTrigger>
                <TabsTrigger value="monitoring" className="px-4 py-2 text-sm font-medium">Monitoring</TabsTrigger>
                <TabsTrigger value="analytics" className="px-4 py-2 text-sm font-medium">Analytics</TabsTrigger>
                <TabsTrigger value="security" className="px-4 py-2 text-sm font-medium">Security</TabsTrigger>
                <TabsTrigger value="gov-defense" className="px-4 py-2 text-sm font-medium bg-primary/10 border border-primary/20">Gov/Defense</TabsTrigger>
                <TabsTrigger value="gov-api" className="px-4 py-2 text-sm font-medium">Gov API</TabsTrigger>
                <TabsTrigger value="system" className="px-4 py-2 text-sm font-medium">System</TabsTrigger>
                <TabsTrigger value="ai-training" className="px-4 py-2 text-sm font-medium">AI Training</TabsTrigger>
                <TabsTrigger value="live-support" className="px-4 py-2 text-sm font-medium bg-green-500/10 border border-green-500/20">Live Support</TabsTrigger>
                <TabsTrigger value="live-feed" className="px-4 py-2 text-sm font-medium">Live Feed</TabsTrigger>
                <TabsTrigger value="uploads-scans" className="px-4 py-2 text-sm font-medium">Uploads & Scans</TabsTrigger>
                <TabsTrigger value="guest-uploads" className="px-4 py-2 text-sm font-medium">Guest Uploads</TabsTrigger>
                <TabsTrigger value="retention" className="px-4 py-2 text-sm font-medium bg-blue-500/10 border border-blue-500/20">Retention</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="enhanced-users" className="space-y-6">
              <EnhancedUserManagement />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-6">
              <RealTimeDataMonitoring />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <RealTimeMonitoring />
              <MonitoringReadiness />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <MonitoringDashboard />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <AdminMFAEnforcement />
              <EnhancedSecurityDashboard />
            </TabsContent>

            <TabsContent value="gov-defense" className="space-y-6">
              <GovernmentDefenseMonitoring />
            </TabsContent>

            <TabsContent value="gov-api" className="space-y-6">
              <GovernmentApiPanel />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <DataExportPanel />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <SystemManagement />
            </TabsContent>

            <TabsContent value="ai-training" className="space-y-6">
              <AITPReadiness />
            </TabsContent>

            <TabsContent value="live-support" className="space-y-6">
              <AdminLiveChatDashboard />
            </TabsContent>
 
            <TabsContent value="live-feed" className="space-y-6">
              <LiveFeed isActive={isMonitoring} />
            </TabsContent>

            <TabsContent value="uploads-scans" className="space-y-6">
              <AllUploadsAndScans />
            </TabsContent>

            <TabsContent value="guest-uploads" className="space-y-6">
              <GuestUploadsTracking />
            </TabsContent>

            <TabsContent value="retention" className="space-y-6">
              <RetentionDashboard />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;