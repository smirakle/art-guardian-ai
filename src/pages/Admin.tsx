import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SecurityAuditLog from "@/components/admin/SecurityAuditLog";
import UserManagement from "@/components/admin/UserManagement";
import RealTimeMonitoring from "@/components/RealTimeMonitoring";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import LiveFeed from "@/components/LiveFeed";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMonitoring, setIsMonitoring] = useState(true);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Security Audit</TabsTrigger>
              <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <RealTimeMonitoring />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <MonitoringDashboard />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecurityAuditLog />
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