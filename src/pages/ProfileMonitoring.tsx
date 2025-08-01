import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, AlertTriangle, BarChart3, Users, Globe } from 'lucide-react';
import { ProfileMonitoringDashboard } from '@/components/profile-monitoring/ProfileMonitoringDashboard';
import { ProfileTargetManager } from '@/components/profile-monitoring/ProfileTargetManager';
import { MultiPlatformScanner } from '@/components/profile-monitoring/MultiPlatformScanner';
import { ImpersonationAlerts } from '@/components/profile-monitoring/ImpersonationAlerts';
import { ProfileRiskAnalyzer } from '@/components/profile-monitoring/ProfileRiskAnalyzer';
import { ComingSoon } from '@/components/ComingSoon';

export default function ProfileMonitoring() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Monitoring</h1>
            <p className="text-muted-foreground">
              Comprehensive identity protection across all platforms
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Targets
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ProfileMonitoringDashboard />
          </TabsContent>

          <TabsContent value="targets">
            <ProfileTargetManager />
          </TabsContent>

          <TabsContent value="scanner">
            <MultiPlatformScanner />
          </TabsContent>

          <TabsContent value="alerts">
            <ImpersonationAlerts />
          </TabsContent>

          <TabsContent value="risk">
            <ProfileRiskAnalyzer />
          </TabsContent>

          <TabsContent value="reports">
            <ComingSoon 
              title="Monitoring Reports" 
              description="Comprehensive reports and analytics on your profile monitoring activities."
              icon={<Globe className="w-12 h-12 text-muted-foreground" />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}