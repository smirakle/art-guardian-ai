import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Plus, Activity, BarChart3, AlertTriangle, Settings } from 'lucide-react';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { PortfolioManager } from '@/components/portfolio/PortfolioManager';
import { PortfolioMonitoring as PortfolioMonitoringComponent } from '@/components/portfolio/PortfolioMonitoring';
import { PortfolioAnalytics } from '@/components/portfolio/PortfolioAnalytics';
import { PortfolioAlerts } from '@/components/portfolio/PortfolioAlerts';
import { PortfolioSettings } from '@/components/portfolio/PortfolioSettings';

export default function PortfolioMonitoring() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor and protect your artwork portfolios across all platforms
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
            <TabsTrigger value="portfolios" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PortfolioDashboard />
          </TabsContent>

          <TabsContent value="portfolios">
            <PortfolioManager />
          </TabsContent>

          <TabsContent value="monitoring">
            <PortfolioMonitoringComponent />
          </TabsContent>

          <TabsContent value="analytics">
            <PortfolioAnalytics />
          </TabsContent>

          <TabsContent value="alerts">
            <PortfolioAlerts />
          </TabsContent>

          <TabsContent value="settings">
            <PortfolioSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}