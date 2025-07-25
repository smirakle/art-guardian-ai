import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  NetworkIcon,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface NetworkMetrics {
  bandwidth: {
    incoming: number;
    outgoing: number;
    peak: number;
  };
  serverHealth: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
  };
  networkStatus: {
    latency: number;
    packetLoss: number;
    connections: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  apiEndpoints: Array<{
    endpoint: string;
    status: 'online' | 'slow' | 'offline';
    responseTime: number;
    requests: number;
  }>;
  edgeFunctions: Array<{
    name: string;
    invocations: number;
    avgDuration: number;
    errorRate: number;
    status: 'healthy' | 'warning' | 'error';
  }>;
}

const NetworkMonitoring = () => {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    bandwidth: { incoming: 0, outgoing: 0, peak: 0 },
    serverHealth: { cpu: 0, memory: 0, disk: 0, uptime: '0d 0h 0m' },
    networkStatus: { latency: 0, packetLoss: 0, connections: 0, status: 'healthy' },
    apiEndpoints: [],
    edgeFunctions: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchNetworkMetrics = async () => {
    try {
      // Simulate real-time network metrics
      const networkMetrics: NetworkMetrics = {
        bandwidth: {
          incoming: Math.floor(Math.random() * 100) + 50,
          outgoing: Math.floor(Math.random() * 80) + 30,
          peak: 150
        },
        serverHealth: {
          cpu: Math.floor(Math.random() * 40) + 20,
          memory: Math.floor(Math.random() * 30) + 45,
          disk: Math.floor(Math.random() * 20) + 65,
          uptime: '15d 7h 23m'
        },
        networkStatus: {
          latency: Math.floor(Math.random() * 50) + 10,
          packetLoss: Math.random() * 0.5,
          connections: Math.floor(Math.random() * 100) + 200,
          status: Math.random() > 0.8 ? 'warning' : 'healthy'
        },
        apiEndpoints: [
          {
            endpoint: '/api/users',
            status: 'online',
            responseTime: Math.floor(Math.random() * 100) + 50,
            requests: Math.floor(Math.random() * 1000) + 500
          },
          {
            endpoint: '/api/artwork',
            status: 'online',
            responseTime: Math.floor(Math.random() * 150) + 80,
            requests: Math.floor(Math.random() * 800) + 300
          },
          {
            endpoint: '/api/monitoring',
            status: Math.random() > 0.9 ? 'slow' : 'online',
            responseTime: Math.floor(Math.random() * 200) + 100,
            requests: Math.floor(Math.random() * 600) + 200
          },
          {
            endpoint: '/api/auth',
            status: 'online',
            responseTime: Math.floor(Math.random() * 80) + 40,
            requests: Math.floor(Math.random() * 1200) + 800
          }
        ],
        edgeFunctions: [
          {
            name: 'real-image-search',
            invocations: Math.floor(Math.random() * 500) + 200,
            avgDuration: Math.floor(Math.random() * 2000) + 500,
            errorRate: Math.random() * 2,
            status: 'healthy'
          },
          {
            name: 'deepfake-detector',
            invocations: Math.floor(Math.random() * 300) + 100,
            avgDuration: Math.floor(Math.random() * 3000) + 1000,
            errorRate: Math.random() * 3,
            status: Math.random() > 0.8 ? 'warning' : 'healthy'
          },
          {
            name: 'process-monitoring-scan',
            invocations: Math.floor(Math.random() * 400) + 150,
            avgDuration: Math.floor(Math.random() * 1500) + 300,
            errorRate: Math.random() * 1.5,
            status: 'healthy'
          },
          {
            name: 'send-contact-email',
            invocations: Math.floor(Math.random() * 100) + 20,
            avgDuration: Math.floor(Math.random() * 800) + 200,
            errorRate: Math.random() * 1,
            status: 'healthy'
          }
        ]
      };

      setMetrics(networkMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching network metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkMetrics();
    
    // Update every 5 seconds for real-time monitoring
    const interval = setInterval(fetchNetworkMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'default';
      case 'warning':
      case 'slow':
        return 'secondary';
      case 'critical':
      case 'error':
      case 'offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'slow':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
      case 'error':
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-muted rounded mb-2"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Network Monitoring</h3>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchNetworkMetrics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Server Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.serverHealth.cpu}%</div>
            <Progress value={metrics.serverHealth.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <MemoryStick className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.serverHealth.memory}%</div>
            <Progress value={metrics.serverHealth.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.serverHealth.disk}%</div>
            <Progress value={metrics.serverHealth.disk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{metrics.serverHealth.uptime}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Stable
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Status and Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NetworkIcon className="w-5 h-5" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(metrics.networkStatus.status)}
                <Badge variant={getStatusColor(metrics.networkStatus.status)}>
                  {metrics.networkStatus.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Latency</span>
              <span className="text-sm font-medium">{metrics.networkStatus.latency}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Packet Loss</span>
              <span className="text-sm font-medium">{metrics.networkStatus.packetLoss.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Connections</span>
              <span className="text-sm font-medium">{metrics.networkStatus.connections}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Bandwidth Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Incoming</span>
                <span className="text-sm font-medium">{metrics.bandwidth.incoming} Mbps</span>
              </div>
              <Progress value={(metrics.bandwidth.incoming / metrics.bandwidth.peak) * 100} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Outgoing</span>
                <span className="text-sm font-medium">{metrics.bandwidth.outgoing} Mbps</span>
              </div>
              <Progress value={(metrics.bandwidth.outgoing / metrics.bandwidth.peak) * 100} />
            </div>
            <div className="text-xs text-muted-foreground">
              Peak: {metrics.bandwidth.peak} Mbps
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Endpoints and Edge Functions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.apiEndpoints.map((endpoint) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <div className="font-medium text-sm">{endpoint.endpoint}</div>
                    <div className="text-xs text-muted-foreground">
                      {endpoint.requests} requests
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(endpoint.status)} className="mb-1">
                    {endpoint.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {endpoint.responseTime}ms
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.edgeFunctions.map((func) => (
              <div key={func.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(func.status)}
                  <div>
                    <div className="font-medium text-sm">{func.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {func.invocations} invocations
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">
                    {func.avgDuration}ms avg
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {func.errorRate.toFixed(1)}% errors
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitoring;