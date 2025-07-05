import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  TrendingUp,
  Activity,
  Server,
  Globe,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MonitoringChart from "@/components/MonitoringChart";
import AlertsPanel from "@/components/AlertsPanel";
import LiveFeed from "@/components/LiveFeed";

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
    totalScans: 1247,
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
        totalScans: prev.totalScans + Math.floor(Math.random() * 5) + 1,
        activeAlerts: Math.max(0, prev.activeAlerts + (Math.random() > 0.8 ? 1 : -1)),
        lastScanTime: new Date().toISOString(),
        systemUptime: Math.max(95, prev.systemUptime + (Math.random() - 0.5) * 0.1)
      }));
    }, 3000);

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

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              24/7 Monitoring Platform
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time protection and threat detection for your creative assets
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isMonitoring ? "default" : "destructive"} className="px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              {isMonitoring ? "ACTIVE" : "PAUSED"}
            </Badge>
            <Button 
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? "Pause Monitoring" : "Resume Monitoring"}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />
                Last scan: {new Date(stats.lastScanTime).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Threat Level: 
                <Badge variant={getStatusColor(stats.threatLevel)} className="ml-2 text-xs">
                  {stats.threatLevel.toUpperCase()}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.protectedAssets}</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.systemUptime.toFixed(1)}%</div>
              <Progress value={stats.systemUptime} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="live-feed">Live Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonitoringChart />
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Platform Coverage
                  </CardTitle>
                  <CardDescription>
                    Monitoring across major platforms and marketplaces
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Instagram", coverage: 98, scans: 1247 },
                    { name: "Pinterest", coverage: 95, scans: 892 },
                    { name: "Etsy", coverage: 91, scans: 654 },
                    { name: "DeviantArt", coverage: 88, scans: 423 },
                    { name: "Behance", coverage: 85, scans: 321 }
                  ].map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{platform.name}</span>
                        <span className="text-sm text-muted-foreground">{platform.scans} scans</span>
                      </div>
                      <Progress value={platform.coverage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Detection Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Copyright Violations</span>
                      <Badge variant="destructive">+12%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Unauthorized Usage</span>
                      <Badge variant="secondary">+8%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>License Breaches</span>
                      <Badge variant="default">-3%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Detection</span>
                      <span className="font-mono">2.3s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Alert Generation</span>
                      <span className="font-mono">0.8s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Takedown Request</span>
                      <span className="font-mono">14.2s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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