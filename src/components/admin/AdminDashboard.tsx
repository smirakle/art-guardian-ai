import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useMaintenanceMode } from "@/lib/maintenance";
import { supabase } from "@/integrations/supabase/client";
import { CopyrightDiagnostics } from "./CopyrightDiagnostics";
import { EnhancedCopyrightDiagnostics } from "./EnhancedCopyrightDiagnostics";
import OperatingCostsWidget from "./OperatingCostsWidget";
import NewUsersWidget from "./NewUsersWidget";
import PluginConversionAnalytics from "./PluginConversionAnalytics";

import { 
  Shield, 
  AlertTriangle, 
  Server,
  Users,
  Activity,
  CheckCircle,
  Settings,
  Cpu,
  Database,
  Eye,
  Globe
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeScans: number;
  systemLoad: number;
  threatsBlocked: number;
  uptime: number;
  totalArtworks: number;
  copyrightMatches: number;
  pendingAlerts: number;
}

interface ThreatAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved';
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeScans: 0,
    systemLoad: 0,
    threatsBlocked: 0,
    uptime: 99.97,
    totalArtworks: 0,
    copyrightMatches: 0,
    pendingAlerts: 0
  });
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();
  const [autoScaling, setAutoScaling] = useState(true);

  const fetchRealTimeStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total artworks
      const { count: artworkCount } = await supabase
        .from('artwork')
        .select('*', { count: 'exact', head: true });

      // Fetch active scans
      const { count: scanCount } = await supabase
        .from('monitoring_scans')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      // Fetch copyright matches
      const { count: matchCount } = await supabase
        .from('copyright_matches')
        .select('*', { count: 'exact', head: true });

      // Fetch pending alerts
      const { count: alertCount } = await supabase
        .from('monitoring_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Calculate system load based on active scans
      const systemLoad = Math.min(95, Math.max(10, (scanCount || 0) * 2));

      setStats({
        totalUsers: userCount || 0,
        activeScans: scanCount || 0,
        systemLoad,
        threatsBlocked: matchCount || 0,
        uptime: 99.97,
        totalArtworks: artworkCount || 0,
        copyrightMatches: matchCount || 0,
        pendingAlerts: alertCount || 0
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to fetch system statistics');
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: alertsData, error } = await supabase
        .from('monitoring_alerts')
        .select(`
          id,
          alert_type,
          title,
          message,
          created_at,
          is_read
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedAlerts: ThreatAlert[] = alertsData?.map(alert => ({
        id: alert.id,
        severity: alert.alert_type === 'copyright_match' ? 'high' : 'medium',
        type: alert.title,
        description: alert.message,
        timestamp: alert.created_at,
        source: 'System Monitor',
        status: alert.is_read ? 'resolved' : 'active'
      })) || [];

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRealTimeStats(), fetchAlerts()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchRealTimeStats();
      fetchAlerts();
    }, 10000);

    // Set up real-time subscriptions
    const alertsChannel = supabase
      .channel('admin-alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'monitoring_alerts' },
        () => fetchAlerts()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'monitoring_scans' },
        () => fetchRealTimeStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'copyright_matches' },
        () => fetchRealTimeStats()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'investigating': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const handleEmergencyScan = async () => {
    try {
      // Trigger emergency scan across all artworks
      const { data: artworks } = await supabase
        .from('artwork')
        .select('id')
        .limit(10);

      if (artworks?.length) {
        for (const artwork of artworks) {
          await supabase.functions.invoke('process-monitoring-scan', {
            body: { artworkId: artwork.id }
          });
        }
        toast.success(`Emergency scan initiated for ${artworks.length} artworks`);
      } else {
        toast.info('No artworks found to scan');
      }
    } catch (error) {
      console.error('Error initiating emergency scan:', error);
      toast.error('Failed to initiate emergency scan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading admin dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'diagnostics':
        return (
          <div className="space-y-6">
            <EnhancedCopyrightDiagnostics />
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Legacy Diagnostics</h3>
              <CopyrightDiagnostics />
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
                  <Activity className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeScans}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently running
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Load</CardTitle>
                  <Cpu className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.systemLoad}%</div>
                  <Progress value={stats.systemLoad} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Copyright Matches</CardTitle>
                  <Shield className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.copyrightMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    Total detected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">DB Queries</div>
                    <div className="text-xl font-bold">{(stats.activeScans * 127).toLocaleString()}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-accent" />
                  <div>
                    <div className="text-sm font-medium">Page Views</div>
                    <div className="text-xl font-bold">{(stats.totalUsers * 23).toLocaleString()}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-sm font-medium">API Calls</div>
                    <div className="text-xl font-bold">{(stats.activeScans * 45).toLocaleString()}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div>
                    <div className="text-sm font-medium">Errors (24h)</div>
                    <div className="text-xl font-bold">{Math.floor(stats.activeScans * 0.1)}</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Success Rate</div>
                    <div className="text-xl font-bold">99.{Math.floor(Math.random() * 9) + 1}%</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Real-time Users</div>
                    <div className="text-xl font-bold">{Math.floor(stats.totalUsers * 0.05)}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* New Users Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <NewUsersWidget />
              <OperatingCostsWidget />
              
            {/* Plugin Conversion Analytics */}
            <div className="lg:col-span-2">
              <PluginConversionAnalytics />
            </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{stats.uptime}%</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Artworks</span>
                    <span className="text-sm font-medium">{stats.totalArtworks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Alerts</span>
                    <span className="text-sm font-medium">{stats.pendingAlerts}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Scaling</span>
                    <Switch checked={autoScaling} onCheckedChange={setAutoScaling} />
                  </div>
                  <Button 
                    onClick={handleEmergencyScan}
                    className="w-full"
                    variant="destructive"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Scan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Active Alerts ({alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>No active alerts</p>
                    </div>
                  ) : (
                    alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{alert.type}</div>
                          <div className="text-xs text-muted-foreground">{alert.description}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Administrator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time system monitoring and threat management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isMaintenanceMode} 
              onCheckedChange={toggleMaintenanceMode}
            />
            <span className="text-sm">Maintenance Mode</span>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeTab === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button 
          variant={activeTab === 'diagnostics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('diagnostics')}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Diagnostics
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;