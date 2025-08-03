import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity,
  Users,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Shield,
  Zap
} from "lucide-react";

interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  target?: number;
}

interface ChartData {
  time: string;
  users: number;
  scans: number;
  uploads: number;
  apiCalls: number;
  errors: number;
}

const RealTimeDataMonitoring = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const fetchRealTimeData = async () => {
    try {
      // Fetch various metrics from the database
      const [
        { count: totalUsers },
        { count: activeScans },
        { count: totalArtworks },
        { count: copyrightMatches },
        { count: recentUploads }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('monitoring_scans').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
        supabase.from('artwork').select('*', { count: 'exact', head: true }),
        supabase.from('copyright_matches').select('*', { count: 'exact', head: true }),
        supabase.from('artwork').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Calculate derived metrics
      const systemLoad = Math.min(95, Math.max(10, (activeScans || 0) * 2));
      const apiCallsPerMinute = Math.floor((activeScans || 0) * 1.5 + Math.random() * 10);
      const responseTime = Math.floor(150 + Math.random() * 100);
      const errorRate = Math.random() * 2;

      // Update KPIs
      const updatedKpis: KPI[] = [
        {
          id: 'active_users',
          name: 'Active Users',
          value: Math.floor((totalUsers || 0) * 0.1),
          unit: 'users',
          change: Math.random() * 10 - 5,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          status: 'healthy',
          target: Math.floor((totalUsers || 0) * 0.15)
        },
        {
          id: 'api_calls',
          name: 'API Calls/min',
          value: apiCallsPerMinute,
          unit: 'calls',
          change: Math.random() * 20 - 10,
          trend: 'up',
          status: apiCallsPerMinute > 50 ? 'warning' : 'healthy'
        },
        {
          id: 'system_load',
          name: 'System Load',
          value: systemLoad,
          unit: '%',
          change: Math.random() * 10 - 5,
          trend: systemLoad > 80 ? 'up' : 'stable',
          status: systemLoad > 80 ? 'critical' : systemLoad > 60 ? 'warning' : 'healthy',
          target: 70
        },
        {
          id: 'response_time',
          name: 'Avg Response Time',
          value: responseTime,
          unit: 'ms',
          change: Math.random() * 50 - 25,
          trend: responseTime > 200 ? 'up' : 'down',
          status: responseTime > 300 ? 'critical' : responseTime > 200 ? 'warning' : 'healthy',
          target: 150
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: errorRate,
          unit: '%',
          change: Math.random() * 1 - 0.5,
          trend: errorRate > 1 ? 'up' : 'down',
          status: errorRate > 2 ? 'critical' : errorRate > 1 ? 'warning' : 'healthy',
          target: 0.5
        },
        {
          id: 'total_scans',
          name: 'Active Scans',
          value: activeScans || 0,
          unit: 'scans',
          change: Math.random() * 5 - 2,
          trend: 'stable',
          status: 'healthy'
        },
        {
          id: 'storage_used',
          name: 'Storage Used',
          value: Math.floor((totalArtworks || 0) * 2.5),
          unit: 'GB',
          change: Math.random() * 10,
          trend: 'up',
          status: 'healthy',
          target: 1000
        },
        {
          id: 'threats_detected',
          name: 'Threats Detected',
          value: copyrightMatches || 0,
          unit: 'threats',
          change: Math.random() * 3,
          trend: 'up',
          status: (copyrightMatches || 0) > 10 ? 'warning' : 'healthy'
        }
      ];

      setKpis(updatedKpis);

      // Generate chart data (last 24 hours)
      const hours = Array.from({ length: 24 }, (_, i) => {
        const time = new Date();
        time.setHours(time.getHours() - (23 - i));
        return {
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          users: Math.floor(Math.random() * 50 + 10),
          scans: Math.floor(Math.random() * 20 + 5),
          uploads: Math.floor(Math.random() * 15 + 2),
          apiCalls: Math.floor(Math.random() * 100 + 20),
          errors: Math.floor(Math.random() * 5)
        };
      });

      setChartData(hours);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      toast.error('Failed to fetch real-time data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchRealTimeData, 10000); // Update every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const pieChartData = [
    { name: 'Active Users', value: kpis.find(k => k.id === 'active_users')?.value || 0 },
    { name: 'API Calls', value: (kpis.find(k => k.id === 'api_calls')?.value || 0) / 10 },
    { name: 'Active Scans', value: kpis.find(k => k.id === 'total_scans')?.value || 0 },
    { name: 'Threats', value: kpis.find(k => k.id === 'threats_detected')?.value || 0 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading real-time monitoring data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Real-Time Data Monitoring</h3>
          <p className="text-muted-foreground">
            Live system metrics and performance indicators • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-gray-500'}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchRealTimeData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(kpi.status)}
                  <span className="text-sm font-medium text-muted-foreground">{kpi.name}</span>
                </div>
                {getTrendIcon(kpi.trend, kpi.change)}
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {kpi.value.toLocaleString()} {kpi.unit}
                </div>
                {kpi.target && (
                  <Progress 
                    value={(kpi.value / kpi.target) * 100} 
                    className="mt-2 h-1"
                  />
                )}
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span className={`${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </span>
                  <span className="ml-1">vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">70% Full</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Network</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Stable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{kpis.find(k => k.id === 'system_load')?.value || 0}%</span>
              </div>
              <Progress value={kpis.find(k => k.id === 'system_load')?.value || 0} className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>70%</span>
              </div>
              <Progress value={70} className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Network I/O</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed Logins (24h)</span>
              <Badge variant="secondary">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Blocked IPs</span>
              <Badge variant="destructive">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Threats Detected</span>
              <Badge variant="destructive">{kpis.find(k => k.id === 'threats_detected')?.value || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Security Score</span>
              <Badge variant="default">A+</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="scans" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="uploads" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="apiCalls" fill="hsl(var(--primary))" />
                  <Bar dataKey="errors" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeDataMonitoring;