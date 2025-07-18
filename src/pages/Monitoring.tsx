import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Activity, AlertTriangle, FileText } from "lucide-react";
import CopyrightMatches from "@/components/monitoring/CopyrightMatches";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import MonitoringChart from "@/components/MonitoringChart";
import AlertsPanel from "@/components/AlertsPanel";
import RealTimeMonitoring from "@/components/RealTimeMonitoring";

export default function Monitoring() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Copyright Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your artwork across the web and take action against copyright infringement
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Copyright Matches
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="dmca" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              DMCA History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Copyright Matches Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CopyrightMatches />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Monitoring Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dmca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  DMCA Takedown History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your DMCA takedown notices and their status will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}