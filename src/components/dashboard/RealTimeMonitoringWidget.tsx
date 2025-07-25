import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Eye, 
  Globe, 
  Shield, 
  Brain,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MonitoringStats {
  sources_scanned: number;
  deepfakes_detected: number;
  surface_web_scans: number;
  dark_web_scans: number;
  high_threat_count: number;
  medium_threat_count: number;
  low_threat_count: number;
  timestamp: string;
}

interface ArtworkData {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  file_paths: string[];
}

interface ScanData {
  id: string;
  artwork_id: string;
  scan_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  matches_found: number;
  scanned_sources: number;
  total_sources: number;
}

export const RealTimeMonitoringWidget = () => {
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
      // Load latest monitoring stats
      const { data: statsData } = await supabase
        .from('realtime_monitoring_stats')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Load user's artworks
      if (user) {
        const { data: artworkData } = await supabase
          .from('artwork')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (artworkData) {
          setArtworks(artworkData);
        }

        // Load recent scans
        const { data: scanData } = await supabase
          .from('monitoring_scans')
          .select('*')
          .in('artwork_id', artworkData?.map(a => a.id) || [])
          .order('started_at', { ascending: false })
          .limit(10);

        if (scanData) {
          setScans(scanData);
        }
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to monitoring stats updates
    const statsChannel = supabase
      .channel('dashboard-stats-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'realtime_monitoring_stats' },
        (payload) => {
          setStats(payload.new as MonitoringStats);
          toast({
            title: "🔄 Monitoring Update",
            description: `Scanned ${payload.new.sources_scanned} sources, detected ${payload.new.deepfakes_detected} threats`,
          });
        }
      )
      .subscribe();

    // Subscribe to new scan results
    if (user) {
      const scanChannel = supabase
        .channel('dashboard-scans-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'monitoring_scans' },
          () => loadData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(statsChannel);
        supabase.removeChannel(scanChannel);
      };
    }

    return () => {
      supabase.removeChannel(statsChannel);
    };
  };

  const startRealTimeMonitoring = async () => {
    setIsMonitoring(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('real-web-deepfake-scan', {
        body: { 
          enable_realtime: true,
          scan_depth: 'comprehensive'
        }
      });

      if (error) throw error;

      toast({
        title: "🚀 Real-Time Monitoring Started",
        description: "Now scanning web sources for deepfakes and copyright violations",
      });
    } catch (error) {
      console.error('Error starting monitoring:', error);
      setIsMonitoring(false);
      toast({
        title: "Error",
        description: "Failed to start real-time monitoring",
        variant: "destructive"
      });
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring Stopped",
      description: "Real-time scanning has been paused",
    });
  };

  const totalThreats = stats ? stats.high_threat_count + stats.medium_threat_count + stats.low_threat_count : 0;
  const completedScans = scans.filter(scan => scan.status === 'completed').length;
  const activeScans = scans.filter(scan => scan.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Real-Time Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Real-Time AI Monitoring
          </CardTitle>
          <CardDescription>
            Live monitoring of your protected content across the web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Active Monitoring' : 'Monitoring Inactive'}
              </span>
            </div>
            <Button
              onClick={isMonitoring ? stopMonitoring : startRealTimeMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
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
                <p className="text-xs text-muted-foreground">Threats Found</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Artworks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artworks.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently protected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeScans}</div>
            <p className="text-xs text-muted-foreground">
              {completedScans} completed today
            </p>
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
            <p className="text-xs text-muted-foreground">
              Threat detection rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {scans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scan Activity</CardTitle>
            <CardDescription>Latest monitoring scans and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      scan.status === 'completed' ? 'bg-green-500' :
                      scan.status === 'running' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {scan.scan_type.replace('_', ' ').toUpperCase()} Scan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.scanned_sources} sources • {scan.matches_found} matches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      scan.status === 'completed' ? 'default' :
                      scan.status === 'running' ? 'secondary' :
                      'outline'
                    }>
                      {scan.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.started_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};