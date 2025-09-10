import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "./UserManagement";
import SecurityAuditLog from "./SecurityAuditLog";
import AdminDashboard from "./AdminDashboard";
import DetailedSystemMetrics from "./DetailedSystemMetrics";
import LiveActivityFeed from "./LiveActivityFeed";
import NetworkMonitoring from "./NetworkMonitoring";
import ApiKeyTestingPanel from "./ApiKeyTestingPanel";
import GovernmentDefenseMonitoring from "./GovernmentDefenseMonitoring";

const AdminPanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="activity">Live Feed</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="gov-defense">Gov/Defense</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="metrics">
            <DetailedSystemMetrics />
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveActivityFeed />
              </div>
              <div className="space-y-6">
                <DetailedSystemMetrics />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="network">
            <NetworkMonitoring />
          </TabsContent>
          
          <TabsContent value="api-keys">
            <ApiKeyTestingPanel />
          </TabsContent>
          
          <TabsContent value="gov-defense">
            <GovernmentDefenseMonitoring />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;