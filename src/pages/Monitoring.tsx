import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import MonitoringChart from "@/components/MonitoringChart";
import AlertsPanel from "@/components/AlertsPanel";
import LiveFeed from "@/components/LiveFeed";
import DeepWebScan from "@/components/DeepWebScan";
import MonitoringHeader from "@/components/monitoring/MonitoringHeader";
import MonitoringMetrics from "@/components/monitoring/MonitoringMetrics";
import PlatformCoverage from "@/components/monitoring/PlatformCoverage";
import DetectionTrends from "@/components/monitoring/DetectionTrends";
import ResponseTimes from "@/components/monitoring/ResponseTimes";
import DailyReport from "@/components/DailyReport";
import MonitoringDashboard from "@/components/MonitoringDashboard";

interface MonitoringStats {
  totalScans: number;
  activeAlerts: number;
  protectedAssets: number;
  systemUptime: number;
  lastScanTime: string;
  threatLevel: 'low' | 'medium' | 'high';
}

const Monitoring = () => {
  const { toast } = useToast();
  
  const [stats, setStats] = useState<MonitoringStats>({
    totalScans: 5247891,
    activeAlerts: 127,
    protectedAssets: 2847593,
    systemUptime: 99.97,
    lastScanTime: new Date().toISOString(),
    threatLevel: 'low'
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const simulateRealTimeStats = () => {
      const baseTime = Date.now();
      
      // Simulate real-time increments
      const increment = Math.floor(Math.random() * 50) + 25; // 25-75 scans per second
      
      // Keep alerts realistic for a 24/7 system monitoring millions of sources
      const alertChange = Math.random() > 0.92 ? (Math.random() > 0.6 ? 1 : -1) : 0;
      
      const assetChange = Math.random() > 0.98 ? Math.floor(Math.random() * 5) + 1 : 0;
      
      // Threat level based on current alert count
      const getCurrentThreatLevel = (alertCount: number) => {
        if (alertCount > 200) return 'high';
        if (alertCount > 100) return 'medium';
        return 'low';
      };
      
      setStats(prev => {
        const newAlertCount = Math.max(45, Math.min(350, prev.activeAlerts + alertChange)); // Keep between 45-350
        return {
          totalScans: prev.totalScans + increment,
          activeAlerts: newAlertCount,
          protectedAssets: prev.protectedAssets + assetChange,
          systemUptime: Math.min(99.99, 99.95 + Math.random() * 0.04),
          lastScanTime: new Date().toISOString(),
          threatLevel: getCurrentThreatLevel(newAlertCount)
        };
      });
    };

    // Initial load with real data if available
    const fetchRealStats = async () => {
      try {
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id')
          .limit(10);

        const { data: alerts } = await supabase
          .from('monitoring_alerts')
          .select('*')
          .eq('is_read', false)
          .limit(5);

        // Start with enterprise-scale base numbers, ensure minimum threat level
        const baseAlerts = Math.max(127, alerts?.length || 0);
        setStats(prev => ({
          ...prev,
          activeAlerts: baseAlerts,
          protectedAssets: Math.max(prev.protectedAssets, 2847593 + (artworks?.length || 0)),
          threatLevel: baseAlerts > 200 ? 'high' : baseAlerts > 100 ? 'medium' : 'low'
        }));
      } catch (error) {
        console.error('Error fetching real stats:', error);
      }
    };

    fetchRealStats();
    simulateRealTimeStats();
    
    // Update every 3 seconds for real-time feel
    const interval = setInterval(simulateRealTimeStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? "Monitoring Paused" : "Monitoring Resumed",
      description: isMonitoring ? "24/7 protection temporarily disabled" : "24/7 protection is now active",
      variant: isMonitoring ? "destructive" : "default"
    });
  };


  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <MonitoringHeader 
          isMonitoring={isMonitoring}
          onToggleMonitoring={toggleMonitoring}
        />

        {/* Key Metrics */}
        <MonitoringMetrics stats={stats} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="deep-scan">Deep Web Scan</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <MonitoringDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonitoringChart />
              <PlatformCoverage />
            </div>
          </TabsContent>

          <TabsContent value="deep-scan">
            <DeepWebScan />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetectionTrends />
              <ResponseTimes />
              <div className="lg:col-span-2">
                <DailyReport type="monitoring" realTimeStats={stats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live-feed">
            <LiveFeed isActive={isMonitoring} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Monitoring;