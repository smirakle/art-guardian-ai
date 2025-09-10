import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
 const Admin = () => {
   const [activeTab, setActiveTab] = useState("dashboard");
   const [isMonitoring, setIsMonitoring] = useState(true);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-13 overflow-x-auto whitespace-nowrap gap-1">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="enhanced-users">Enhanced Users</TabsTrigger>
              <TabsTrigger value="realtime">Real-Time</TabsTrigger>
              <TabsTrigger value="data">Data Export</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="gov-defense">Gov/Defense</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              <TabsTrigger value="ai-training">AI Training</TabsTrigger>
              <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
            </TabsList>

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
              <SecurityAuditLog />
            </TabsContent>

            <TabsContent value="gov-defense" className="space-y-6">
              <GovernmentDefenseMonitoring />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <DataExportPanel />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <SystemManagement />
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <BlockchainReadiness />
            </TabsContent>

            <TabsContent value="ai-training" className="space-y-6">
              <AITPReadiness />
            </TabsContent>
 
            <TabsContent value="live-feed" className="space-y-6">
              <LiveFeed isActive={isMonitoring} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;