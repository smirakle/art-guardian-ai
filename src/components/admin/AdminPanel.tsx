import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Handshake, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserManagement from "./UserManagement";
import SecurityAuditLog from "./SecurityAuditLog";
import AdminDashboard from "./AdminDashboard";
import DetailedSystemMetrics from "./DetailedSystemMetrics";
import LiveActivityFeed from "./LiveActivityFeed";
import NetworkMonitoring from "./NetworkMonitoring";
import ApiKeyTestingPanel from "./ApiKeyTestingPanel";
import GovernmentDefenseMonitoring from "./GovernmentDefenseMonitoring";
import GovernmentApiPanel from "./GovernmentApiPanel";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Quick Links Bar */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground mr-2">Quick Links:</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/partnerships')}
            className="gap-2"
          >
            <Handshake className="h-4 w-4" />
            Partnerships
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/marketing-assets')}
            className="gap-2"
          >
            <Image className="h-4 w-4" />
            Marketing Assets
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="activity">Live Feed</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="gov-defense">Gov/Defense</TabsTrigger>
            <TabsTrigger value="gov-api">Gov API</TabsTrigger>
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
          
          <TabsContent value="gov-api">
            <GovernmentApiPanel />
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