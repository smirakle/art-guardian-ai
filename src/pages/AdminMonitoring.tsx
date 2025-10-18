import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductionHealth } from '@/hooks/useProductionHealth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Database, 
  TrendingUp,
  Users,
  Zap,
  XCircle,
  Server
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack?: string;
  created_at: string;
  severity: string;
  user_id?: string;
}

interface PerformanceData {
  timestamp: string;
  value: number;
  metric_name: string;
}

export default function AdminMonitoring() {
  const { healthStatus, performanceMetrics, loading, runHealthCheck, isHealthy, hasCriticalIssues } = useProductionHealth();
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRecentErrors();
    loadActiveUsers();
    loadPerformanceHistory();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      runHealthCheck();
      loadRecentErrors();
      loadActiveUsers();
      loadPerformanceHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, [runHealthCheck]);

  const loadRecentErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentErrors(data || []);
    } catch (error) {
      console.error('Failed to load errors:', error);
    }
  };

  const loadActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_monitoring_agents')
        .select('user_id', { count: 'exact', head: false })
        .gte('last_scan', new Date(Date.now() - 3600000).toISOString()); // Last hour

      if (error) throw error;
      
      const uniqueUsers = new Set(data?.map(d => d.user_id) || []);
      setActiveUsers(uniqueUsers.size);
    } catch (error) {
      console.error('Failed to load active users:', error);
    }
  };

  const loadPerformanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('production_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedData = (data || []).map(d => ({
        timestamp: new Date(d.created_at).toLocaleTimeString(),
        value: Number(d.metric_value),
        metric_name: d.metric_name
      })).reverse();

      setPerformanceHistory(formattedData);
    } catch (error) {
      console.error('Failed to load performance history:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Server className="h-10 w-10 text-primary" />
              Production Monitoring
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time system health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isHealthy ? 'Operational' : hasCriticalIssues ? 'Critical' : 'Degraded'}
                </div>
                {healthStatus && getStatusIcon(healthStatus.status)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceMetrics?.avg_response_time?.toFixed(0) || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">All endpoints</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentErrors.length}</div>
              <p className="text-xs text-muted-foreground">Last 10 errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time health check results</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Activity className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : healthStatus ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">Healthy Services</div>
                        <div className="text-2xl font-bold text-success">
                          {healthStatus.summary?.healthy_services || 0}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">Warnings</div>
                        <div className="text-2xl font-bold text-warning">
                          {healthStatus.summary?.warning_services || 0}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">Critical</div>
                        <div className="text-2xl font-bold text-destructive">
                          {healthStatus.summary?.critical_services || 0}
                        </div>
                      </div>
                    </div>

                    {/* System Stats */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-4">System Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Users</div>
                          <div className="text-xl font-bold">{healthStatus.system_stats?.total_users || 0}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Subscriptions</div>
                          <div className="text-xl font-bold">{healthStatus.system_stats?.active_subscriptions || 0}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Artwork</div>
                          <div className="text-xl font-bold">{healthStatus.system_stats?.total_artwork || 0}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Matches</div>
                          <div className="text-xl font-bold">{healthStatus.system_stats?.total_matches || 0}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-sm text-muted-foreground">Daily Uploads</div>
                          <div className="text-xl font-bold">{healthStatus.system_stats?.daily_uploads || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No health data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Health Checks</CardTitle>
                <CardDescription>Individual service status and response times</CardDescription>
              </CardHeader>
              <CardContent>
                {healthStatus?.health_checks && healthStatus.health_checks.length > 0 ? (
                  <div className="space-y-3">
                    {healthStatus.health_checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <div className="font-semibold capitalize">{check.service}</div>
                            <div className="text-sm text-muted-foreground">
                              Response: {check.response_time_ms}ms
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No service checks available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Response time history</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No performance data available</p>
                )}
              </CardContent>
            </Card>

            {performanceMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-success/10">
                      <div className="text-sm text-muted-foreground">Excellent</div>
                      <div className="text-2xl font-bold text-success">
                        {performanceMetrics.performance_summary?.excellent || 0}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-warning/10">
                      <div className="text-sm text-muted-foreground">Good</div>
                      <div className="text-2xl font-bold text-warning">
                        {performanceMetrics.performance_summary?.good || 0}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-destructive/10">
                      <div className="text-sm text-muted-foreground">Poor</div>
                      <div className="text-2xl font-bold text-destructive">
                        {performanceMetrics.performance_summary?.poor || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Last 10 error logs</CardDescription>
              </CardHeader>
              <CardContent>
                {recentErrors.length > 0 ? (
                  <div className="space-y-3">
                    {recentErrors.map((error) => (
                      <div key={error.id} className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`font-semibold ${getSeverityColor(error.severity)}`}>
                            {error.error_message}
                          </div>
                          <Badge variant="outline">
                            {new Date(error.created_at).toLocaleString()}
                          </Badge>
                        </div>
                        {error.error_stack && (
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer hover:text-foreground">
                              View stack trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                              {error.error_stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No recent errors</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
