import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Server, 
  Database, 
  Cpu,
  HardDrive,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Shield,
  Clock,
  BarChart3
} from "lucide-react";

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  dbConnections: number;
  cacheHitRate: number;
  errorRate: number;
  uptime: string;
  lastBackup: string;
  pendingJobs: number;
}

const SystemManagement = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    dbConnections: 0,
    cacheHitRate: 0,
    errorRate: 0,
    uptime: '0d 0h 0m',
    lastBackup: 'Never',
    pendingJobs: 0
  });
  
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    monitoring: 'healthy',
    backup: 'healthy'
  });

  const [autoMaintenance, setAutoMaintenance] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSystemMetrics = async () => {
    try {
      // Simulate system metrics (in a real app, these would come from system monitoring APIs)
      setMetrics({
        cpuUsage: Math.random() * 80 + 10,
        memoryUsage: Math.random() * 70 + 15,
        diskUsage: Math.random() * 60 + 20,
        networkLatency: Math.random() * 50 + 10,
        dbConnections: Math.floor(Math.random() * 100) + 50,
        cacheHitRate: Math.random() * 20 + 80,
        errorRate: Math.random() * 2,
        uptime: '15d 6h 23m',
        lastBackup: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        pendingJobs: Math.floor(Math.random() * 20)
      });

      // Check database health
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      setSystemStatus(prev => ({
        ...prev,
        database: dbError ? 'error' : 'healthy'
      }));

    } catch (error) {
      console.error('Error fetching system metrics:', error);
      toast.error('Failed to fetch system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSystemAction = async (action: string) => {
    try {
      switch (action) {
        case 'restart':
          toast.info('System restart initiated - this may take a few minutes');
          break;
        case 'backup':
          toast.info('Backup process started');
          break;
        case 'cleanup':
          // Simulate cleanup
          const { error } = await supabase.rpc('trigger_scheduled_scans');
          if (error) throw error;
          toast.success('System cleanup completed');
          break;
        case 'optimize':
          toast.info('Database optimization started');
          break;
        default:
          toast.info(`${action} action triggered`);
      }
      fetchSystemMetrics();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to perform ${action}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading system metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            System Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage system performance and health
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoMaintenance} 
              onCheckedChange={setAutoMaintenance}
            />
            <span className="text-sm">Auto Maintenance</span>
          </div>
          <Button onClick={() => fetchSystemMetrics()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(systemStatus).map(([service, status]) => {
          const StatusIcon = getStatusIcon(status);
          return (
            <Card key={service}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{service}</p>
                    <p className={`text-xs ${getStatusColor(status)}`}>
                      {status}
                    </p>
                  </div>
                  <StatusIcon className={`w-6 h-6 ${getStatusColor(status)}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
            <Progress value={metrics.cpuUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <Progress value={metrics.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.diskUsage.toFixed(1)}%</div>
            <Progress value={metrics.diskUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
            <Progress value={metrics.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Network Latency</span>
              <Badge variant="outline">{metrics.networkLatency.toFixed(0)}ms</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">DB Connections</span>
              <Badge variant="outline">{metrics.dbConnections}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Error Rate</span>
              <Badge variant={metrics.errorRate > 1 ? "destructive" : "secondary"}>
                {metrics.errorRate.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Jobs</span>
              <Badge variant={metrics.pendingJobs > 10 ? "destructive" : "secondary"}>
                {metrics.pendingJobs}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">System Uptime</span>
              <Badge variant="outline">{metrics.uptime}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <Badge variant="outline">{metrics.lastBackup}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Maintenance</span>
              <Badge variant={autoMaintenance ? "secondary" : "outline"}>
                {autoMaintenance ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleSystemAction('backup')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Database className="w-6 h-6" />
              <span className="text-sm">Create Backup</span>
            </Button>
            
            <Button
              onClick={() => handleSystemAction('cleanup')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-sm">System Cleanup</span>
            </Button>
            
            <Button
              onClick={() => handleSystemAction('optimize')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Optimize DB</span>
            </Button>
            
            <Button
              onClick={() => handleSystemAction('restart')}
              variant="destructive"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <RefreshCw className="w-6 h-6" />
              <span className="text-sm">Restart System</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemManagement;