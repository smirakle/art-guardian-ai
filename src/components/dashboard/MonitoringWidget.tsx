import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, AlertTriangle, FileText, Users, Brain, Eye, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CopyrightMatches from "@/components/monitoring/CopyrightMatches";
import AlertsPanel from "@/components/AlertsPanel";
import RealTimeMonitoring from "@/components/RealTimeMonitoring";
import SocialMediaMonitoringResults from "@/components/monitoring/SocialMediaMonitoringResults";
import FakeAccountDetector from "@/components/FakeAccountDetector";
import SocialMediaAccountManager from "@/components/SocialMediaAccountManager";

interface MonitoringStats {
  sources_scanned: number;
  deepfakes_detected: number;
  surface_web_scans: number;
  dark_web_scans: number;
  high_threat_count: number;
  medium_threat_count: number;
  low_threat_count: number;
}

interface ArtworkData {
  id: string;
  title: string;
  status: string;
}

interface ScanData {
  id: string;
  scan_type: string;
  status: string;
  started_at: string;
  scanned_sources: number;
  matches_found: number;
}

export const MonitoringWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      setupRealTimeSubscriptions();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const { data: statsData } = await supabase
        .from('realtime_monitoring_stats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (statsData) setStats(statsData);

      if (user) {
        const { data: artworkData } = await supabase
          .from('artwork')
          .select('id, title, status')
          .eq('user_id', user.id);

        if (artworkData) setArtworks(artworkData);

        const { data: scanData } = await supabase
          .from('monitoring_scans')
          .select('*')
          .in('artwork_id', artworkData?.map(a => a.id) || [])
          .order('started_at', { ascending: false })
          .limit(10);

        if (scanData) setScans(scanData);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    const statsChannel = supabase
      .channel('monitoring-stats')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'realtime_monitoring_stats' },
        (payload) => {
          setStats(payload.new as MonitoringStats);
          toast({
            title: "Monitoring Update",
            description: `Scanned ${payload.new.sources_scanned} sources`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
    };
  };

  const startMonitoring = async () => {
    setIsMonitoring(true);
    try {
      await supabase.functions.invoke('real-web-deepfake-scan', {
        body: { enable_realtime: true, scan_depth: 'comprehensive' }
      });
      toast({
        title: "Monitoring Started",
        description: "Scanning web sources for threats",
      });
    } catch (error) {
      setIsMonitoring(false);
      toast({
        title: "Error",
        description: "Failed to start monitoring",
        variant: "destructive"
      });
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "Scanning has been paused",
    });
  };

  const totalThreats = stats ? stats.high_threat_count + stats.medium_threat_count + stats.low_threat_count : 0;
  const activeScans = scans.filter(s => s.status === 'running').length;

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
          {/* Real-Time Monitoring Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Real-Time Monitoring
              </CardTitle>
              <CardDescription>
                Live monitoring across the web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                >
                  {isMonitoring ? 'Stop' : 'Start'}
                </Button>
              </div>

              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.sources_scanned}</div>
                    <p className="text-xs text-muted-foreground">Sources Scanned</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{stats.surface_web_scans}</div>
                    <p className="text-xs text-muted-foreground">Surface Web</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{stats.dark_web_scans}</div>
                    <p className="text-xs text-muted-foreground">Dark Web</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{totalThreats}</div>
                    <p className="text-xs text-muted-foreground">Threats</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Protected Items</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{artworks.length}</div>
                <p className="text-xs text-muted-foreground">Currently protected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeScans}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? Math.round((totalThreats / Math.max(stats.sources_scanned, 1)) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Threat detection</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Scans */}
          {scans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          scan.status === 'completed' ? 'bg-green-500' :
                          scan.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {scan.scan_type.replace('-', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {scan.scanned_sources} sources • {scan.matches_found} matches
                          </p>
                        </div>
                      </div>
                      <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                        {scan.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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