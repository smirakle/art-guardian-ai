import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const [stats, setStats] = useState<MonitoringStats>({
    totalScans: 0,
    activeAlerts: 0,
    protectedAssets: 0,
    systemUptime: 99.8,
    lastScanTime: new Date().toISOString(),
    threatLevel: 'low'
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRealStats = async () => {
      try {
        // Get user's artwork count
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id')
          .eq('user_id', user.id);

        const artworkIds = artworks?.map(a => a.id) || [];
        
        // Get total scans
        const { data: scans } = await supabase
          .from('monitoring_scans')
          .select('*')
          .in('artwork_id', artworkIds);

        // Get active alerts
        const { data: alerts } = await supabase
          .from('monitoring_alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', false);

        // Get copyright matches for threat level
        const { data: matches } = await supabase
          .from('copyright_matches')
          .select('threat_level')
          .in('artwork_id', artworkIds);

        const totalScannedSources = scans?.reduce((sum, scan) => sum + (scan.scanned_sources || 0), 0) || 0;
        const highThreatMatches = matches?.filter(m => m.threat_level === 'high' || m.threat_level === 'critical').length || 0;
        const latestScan = scans?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        setStats({
          totalScans: totalScannedSources,
          activeAlerts: alerts?.length || 0,
          protectedAssets: artworks?.length || 0,
          systemUptime: 99.8,
          lastScanTime: latestScan?.created_at || new Date().toISOString(),
          threatLevel: highThreatMatches > 3 ? 'high' : highThreatMatches > 0 ? 'medium' : 'low'
        });
      } catch (error) {
        console.error('Error fetching real stats:', error);
      }
    };

    fetchRealStats();
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
                <DailyReport type="monitoring" />
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