import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Globe, 
  Clock,
  Server,
  Users,
  Activity,
  Zap,
  Database,
  Network,
  Lock,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  FileText,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Search
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeScans: number;
  systemLoad: number;
  threatsBlocked: number;
  uptime: number;
  databaseSize: string;
  networkTraffic: string;
  lastBackup: string;
}

interface ThreatAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved';
}

const mockAdminStats: AdminStats = {
  totalUsers: 15847,
  activeScans: 342,
  systemLoad: 67,
  threatsBlocked: 1203,
  uptime: 99.97,
  databaseSize: "2.4 TB",
  networkTraffic: "847 GB/day",
  lastBackup: "2024-01-08T14:30:00Z"
};

const mockThreatAlerts: ThreatAlert[] = [
  {
    id: '1',
    severity: 'critical',
    type: 'Mass Copyright Infringement',
    description: 'Large scale artwork theft detected across 15 dark web marketplaces',
    timestamp: '2024-01-08T15:45:00Z',
    source: 'Deep Web Scanner',
    status: 'active'
  },
  {
    id: '2',
    severity: 'high',
    type: 'Blockchain Anomaly',
    description: 'Suspicious NFT minting patterns detected on Ethereum network',
    timestamp: '2024-01-08T14:32:00Z',
    source: 'Blockchain Monitor',
    status: 'investigating'
  },
  {
    id: '3',
    severity: 'medium',
    type: 'API Rate Limit Exceeded',
    description: 'Unusual API usage patterns from IP range 203.45.67.0/24',
    timestamp: '2024-01-08T13:15:00Z',
    source: 'Security Monitor',
    status: 'resolved'
  }
];

const Admin = () => {
  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [alerts, setAlerts] = useState<ThreatAlert[]>(mockThreatAlerts);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [autoScaling, setAutoScaling] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeScans: prev.activeScans + Math.floor(Math.random() * 10) - 5,
        systemLoad: Math.max(10, Math.min(95, prev.systemLoad + Math.floor(Math.random() * 10) - 5)),
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
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

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Administrator Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Advanced system monitoring and threat management
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isMaintenanceMode} 
                    onCheckedChange={setIsMaintenanceMode}
                  />
                  <span className="text-sm">Maintenance Mode</span>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="monitoring">Advanced Monitoring</TabsTrigger>
              <TabsTrigger value="deep-scan">Deep Scan Control</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +127 new this week
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
                      Across all platforms
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
                    <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
                    <Shield className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{stats.threatsBlocked}</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span className="text-sm">Database Size</span>
                      <span className="text-sm font-medium">{stats.databaseSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Network Traffic</span>
                      <span className="text-sm font-medium">{stats.networkTraffic}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm font-medium">
                        {new Date(stats.lastBackup).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto Scaling</span>
                      <Switch checked={autoScaling} onCheckedChange={setAutoScaling} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alerts.slice(0, 3).map((alert) => (
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
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Advanced monitoring provides real-time insights across all platform activities and user behaviors.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Real-time Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>API Requests/min</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <Progress value={72} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Error Rate</span>
                        <span className="font-medium text-destructive">0.3%</span>
                      </div>
                      <Progress value={0.3} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span className="font-medium">124ms</span>
                      </div>
                      <Progress value={31} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CDN Status</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Load Balancer</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Cluster</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup Systems</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Synced</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Firewall</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Protected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL Certificates</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Valid</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DDoS Protection</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intrusion Detection</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Investigating</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deep-scan" className="space-y-6">
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  Administrator deep scan provides comprehensive monitoring across 500+ dark web marketplaces with advanced threat detection.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Enhanced Scan Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button className="w-full" size="lg">
                        <Globe className="w-4 h-4 mr-2" />
                        Full Network Sweep (500+ sites)
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Targeted High-Risk Scan
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Database className="w-4 h-4 mr-2" />
                        Database Correlation Analysis
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Wifi className="w-4 h-4 mr-2" />
                        Real-time Monitoring (24/7)
                      </Button>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>Last Full Scan:</span>
                        <span>2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Monitors:</span>
                        <span>847 endpoints</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threat Intelligence:</span>
                        <span>Live feeds active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Threat Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-destructive">47</div>
                        <div className="text-xs text-muted-foreground">Critical Alerts</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-secondary">183</div>
                        <div className="text-xs text-muted-foreground">High Priority</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">1,247</div>
                        <div className="text-xs text-muted-foreground">Under Review</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-green-600">2,934</div>
                        <div className="text-xs text-muted-foreground">Resolved</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>New Marketplaces:</span>
                        <span className="font-medium">12 this week</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Confidence:</span>
                        <span className="font-medium">97.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>False Positives:</span>
                        <span className="font-medium">0.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Advanced blockchain analytics provides deep insights into NFT transactions, smart contract behavior, and copyright verification across multiple networks.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Network Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Ethereum</span>
                        <span className="font-medium">15,847 NFTs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Polygon</span>
                        <span className="font-medium">8,293 NFTs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Solana</span>
                        <span className="font-medium">4,156 NFTs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Arbitrum</span>
                        <span className="font-medium">2,874 NFTs</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-center">
                      <div className="text-2xl font-bold">31,170</div>
                      <div className="text-xs text-muted-foreground">Total Monitored NFTs</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Verified Authentic</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">29,847</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Under Review</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">1,143</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Copyright Issues</span>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium">180</span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">95.8%</div>
                      <div className="text-xs text-muted-foreground">Verification Rate</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Live Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>New Mints (24h)</span>
                        <span className="font-medium text-green-600">+437</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transfers (24h)</span>
                        <span className="font-medium">2,847</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Smart Contracts</span>
                        <span className="font-medium">1,293</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Gas Used (ETH)</span>
                        <span className="font-medium">47.3</span>
                      </div>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;