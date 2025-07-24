import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "./UserManagement";
import SecurityAuditLog from "./SecurityAuditLog";
import AdminDashboard from "./AdminDashboard";

const AdminPanel: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security Audit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="monitoring">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Monitoring dashboard coming soon...</p>
            </div>
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