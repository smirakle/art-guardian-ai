import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity, AlertTriangle, FileText, Users, Brain } from "lucide-react";
import CopyrightMatches from "@/components/monitoring/CopyrightMatches";
import AlertsPanel from "@/components/AlertsPanel";
import RealTimeMonitoring from "@/components/RealTimeMonitoring";
import SocialMediaMonitoringResults from "@/components/monitoring/SocialMediaMonitoringResults";
import FakeAccountDetector from "@/components/FakeAccountDetector";
import SocialMediaAccountManager from "@/components/SocialMediaAccountManager";

export const MonitoringWidget = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Copyright Monitoring Dashboard
          </CardTitle>
          <CardDescription>
            Monitor your artwork across the web and take action against copyright infringement
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <Activity className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Copyright</span>
            <span className="sm:hidden">Copyright</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Social Media</span>
            <span className="sm:hidden">Social</span>
          </TabsTrigger>
          <TabsTrigger value="deepfakes" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <Brain className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Deepfakes</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="dmca" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-2 md:px-3">
            <FileText className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">DMCA</span>
            <span className="sm:hidden">DMCA</span>
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
          <AlertsPanel />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialMediaAccountManager />
          <SocialMediaMonitoringResults />
        </TabsContent>

        <TabsContent value="deepfakes" className="space-y-6">
          <FakeAccountDetector />
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
  );
};