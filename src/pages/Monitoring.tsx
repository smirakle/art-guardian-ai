import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
    totalScans: 52000,
    activeAlerts: 3,
    protectedAssets: 156,
    systemUptime: 99.8,
    lastScanTime: new Date().toISOString(),
    threatLevel: 'low'
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + Math.floor(Math.random() * 50) + 25,
        activeAlerts: Math.max(0, prev.activeAlerts + (Math.random() > 0.8 ? 1 : -1)),
        lastScanTime: new Date().toISOString(),
        systemUptime: Math.max(95, prev.systemUptime + (Math.random() - 0.5) * 0.1)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

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