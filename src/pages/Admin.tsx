import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useMaintenanceMode } from "@/lib/maintenance";
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
  Search,
  Timer,
  Target,
  Radar,
  Save,
  Download
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

interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: 'Student' | 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  artworksProtected: number;
  threatsBlocked: number;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

interface SweepConfig {
  frequency: string;
  scope: string;
  deepScanEnabled: boolean;
  priorityTargets: string[];
  maxConcurrentScans: number;
  alertThreshold: number;
  autoResponse: boolean;
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

const mockUsers: UserAccount[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    plan: 'Professional',
    status: 'active',
    joinDate: '2023-11-15',
    lastActive: '2024-01-08T16:30:00Z',
    artworksProtected: 247,
    threatsBlocked: 12
  },
  {
    id: '2',
    name: 'Marcus Rivera',
    email: 'marcus.r@designstudio.co',
    plan: 'Enterprise',
    status: 'active',
    joinDate: '2023-08-22',
    lastActive: '2024-01-08T14:15:00Z',
    artworksProtected: 1834,
    threatsBlocked: 89
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma.t@student.edu',
    plan: 'Student',
    status: 'active',
    joinDate: '2024-01-05',
    lastActive: '2024-01-08T12:45:00Z',
    artworksProtected: 23,
    threatsBlocked: 3
  },
  {
    id: '4',
    name: 'Alex Johnson',
    email: 'alex.johnson@suspicious.net',
    plan: 'Starter',
    status: 'suspended',
    joinDate: '2023-12-20',
    lastActive: '2024-01-07T09:22:00Z',
    artworksProtected: 56,
    threatsBlocked: 0
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'User Account Suspended',
    user: 'admin@tsmo.com',
    timestamp: '2024-01-08T16:45:00Z',
    details: 'Suspended user alex.johnson@suspicious.net for suspicious activity',
    severity: 'warning'
  },
  {
    id: '2',
    action: 'System Configuration Changed',
    user: 'admin@tsmo.com',
    timestamp: '2024-01-08T15:20:00Z',
    details: 'Updated deep scan frequency from 6h to 4h',
    severity: 'info'
  },
  {
    id: '3',
    action: 'Emergency Shutdown Initiated',
    user: 'system',
    timestamp: '2024-01-08T14:10:00Z',
    details: 'Automatic shutdown triggered due to high system load (95%)',
    severity: 'error'
  },
  {
    id: '4',
    action: 'Bulk User Export',
    user: 'admin@tsmo.com',
    timestamp: '2024-01-08T13:35:00Z',
    details: 'Exported user data for 1,247 accounts for compliance audit',
    severity: 'info'
  }
];

const Admin = () => {
  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [alerts, setAlerts] = useState<ThreatAlert[]>(mockThreatAlerts);
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();
  const [autoScaling, setAutoScaling] = useState(true);
  const [sweepConfig, setSweepConfig] = useState<SweepConfig>({
    frequency: "hourly",
    scope: "comprehensive",
    deepScanEnabled: true,
    priorityTargets: ["dark-web", "social-media", "marketplaces"],
    maxConcurrentScans: 500,
    alertThreshold: 75,
    autoResponse: true
  });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

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

  const handleSaveConfig = () => {
    toast.success("Sweep configuration updated successfully");
    setConfigDialogOpen(false);
  };

  const handleStartSweep = () => {
    toast.success("Full network sweep initiated across 2,000+ sites");
  };

  const handleTargetedScan = () => {
    toast.success("Targeted high-risk scan initiated across 500 priority sites", {
      description: "Focusing on dark web marketplaces, underground forums, and known threat vectors"
    });
  };

  const handleDeepIntelligence = () => {
    toast.success("Deep Intelligence Analysis initiated", {
      description: "AI-powered behavioral pattern analysis and threat correlation across all monitored networks"
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
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
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="monitoring">Advanced Monitoring</TabsTrigger>
              <TabsTrigger value="deep-scan">Deep Scan Control</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Analytics</TabsTrigger>
              <TabsTrigger value="security">Security & Audit</TabsTrigger>
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

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">User Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</div>
                        <div className="text-sm text-muted-foreground">Suspended</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500" />
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.artworksProtected, 0)}</div>
                        <div className="text-sm text-muted-foreground">Total Protected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}>
                            {user.plan}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <div className="text-right">
                            <div>{user.artworksProtected} protected</div>
                            <div className="text-muted-foreground">
                              Last: {new Date(user.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className={user.status === 'suspended' ? 'text-green-600' : 'text-red-600'}>
                              {user.status === 'suspended' ? 'Restore' : 'Suspend'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  Administrator deep scan provides comprehensive monitoring across 2,000+ dark web marketplaces, forums, and underground networks with advanced AI-powered threat detection.
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
                       <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleStartSweep}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Full Network Sweep (2,000+ sites)
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleTargetedScan}>
                        <Eye className="w-4 h-4 mr-2" />
                        Targeted High-Risk Scan (500 sites)
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleDeepIntelligence}>
                        <Database className="w-4 h-4 mr-2" />
                        Deep Intelligence Analysis
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Wifi className="w-4 h-4 mr-2" />
                        Real-time Monitoring (24/7)
                      </Button>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>Network Coverage:</span>
                        <span className="font-medium">2,147 endpoints</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Full Sweep:</span>
                        <span>47 minutes ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Monitors:</span>
                        <span>1,847 concurrent</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Confidence:</span>
                        <span className="font-medium text-green-600">98.7%</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Network Penetration</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Advanced Threat Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded bg-destructive/5">
                        <div className="text-2xl font-bold text-destructive">127</div>
                        <div className="text-xs text-muted-foreground">Critical Alerts</div>
                      </div>
                      <div className="text-center p-3 border rounded bg-secondary/5">
                        <div className="text-2xl font-bold text-secondary">456</div>
                        <div className="text-xs text-muted-foreground">High Priority</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">2,847</div>
                        <div className="text-xs text-muted-foreground">Under Review</div>
                      </div>
                      <div className="text-center p-3 border rounded bg-green-50">
                        <div className="text-2xl font-bold text-green-600">12,934</div>
                        <div className="text-xs text-muted-foreground">Resolved</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>New Marketplaces:</span>
                        <span className="font-medium text-red-600">34 this week</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deep Web Coverage:</span>
                        <span className="font-medium">89.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>False Positives:</span>
                        <span className="font-medium">0.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">&lt; 15 minutes</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="destructive" size="sm" className="text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        Emergency Alert
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Network Coverage Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Global Network Coverage (2,147 Active Endpoints)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Dark Web Marketplaces</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tor Hidden Services</span>
                          <span className="font-medium">847</span>
                        </div>
                        <div className="flex justify-between">
                          <span>I2P Networks</span>
                          <span className="font-medium">312</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Freenet Sites</span>
                          <span className="font-medium">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Private Forums</span>
                          <span className="font-medium">423</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Surface Web Monitoring</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Social Media</span>
                          <span className="font-medium">278</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Sharing</span>
                          <span className="font-medium">89</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Art Platforms</span>
                          <span className="font-medium">134</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Underground Blogs</span>
                          <span className="font-medium">67</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Real-time Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Online</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="font-medium">1,923</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Offline</span>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span className="font-medium">187</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Scanning</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-yellow-500" />
                            <span className="font-medium">37</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime</span>
                          <span className="font-medium text-green-600">89.6%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Last comprehensive sweep completed 47 minutes ago
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure Sweep
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Settings className="w-5 h-5" />
                              Sweep Configuration
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="frequency">Scan Frequency</Label>
                                <Select value={sweepConfig.frequency} onValueChange={(value) => setSweepConfig({...sweepConfig, frequency: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="continuous">Continuous</SelectItem>
                                    <SelectItem value="hourly">Every Hour</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="scope">Scan Scope</Label>
                                <Select value={sweepConfig.scope} onValueChange={(value) => setSweepConfig({...sweepConfig, scope: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="comprehensive">Comprehensive (2000+ sites)</SelectItem>
                                    <SelectItem value="targeted">Targeted (500 sites)</SelectItem>
                                    <SelectItem value="priority">Priority Only (100 sites)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label>Deep Scan Analysis</Label>
                                  <p className="text-sm text-muted-foreground">Enable AI-powered deep threat analysis</p>
                                </div>
                                <Switch 
                                  checked={sweepConfig.deepScanEnabled} 
                                  onCheckedChange={(checked) => setSweepConfig({...sweepConfig, deepScanEnabled: checked})}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label>Auto Response</Label>
                                  <p className="text-sm text-muted-foreground">Automatically respond to detected threats</p>
                                </div>
                                <Switch 
                                  checked={sweepConfig.autoResponse} 
                                  onCheckedChange={(checked) => setSweepConfig({...sweepConfig, autoResponse: checked})}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Max Concurrent Scans: {sweepConfig.maxConcurrentScans}</Label>
                              <Slider
                                value={[sweepConfig.maxConcurrentScans]}
                                onValueChange={(value) => setSweepConfig({...sweepConfig, maxConcurrentScans: value[0]})}
                                max={1000}
                                min={50}
                                step={50}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Alert Threshold: {sweepConfig.alertThreshold}%</Label>
                              <Slider
                                value={[sweepConfig.alertThreshold]}
                                onValueChange={(value) => setSweepConfig({...sweepConfig, alertThreshold: value[0]})}
                                max={100}
                                min={25}
                                step={5}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveConfig}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Configuration
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

            <TabsContent value="security" className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Security and audit management for comprehensive system oversight and compliance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      System Audit Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={log.severity === 'error' ? 'destructive' : log.severity === 'warning' ? 'secondary' : 'default'}>
                              {log.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-medium text-sm mb-1">{log.action}</div>
                          <div className="text-xs text-muted-foreground mb-1">User: {log.user}</div>
                          <div className="text-xs">{log.details}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">Require 2FA for all admin accounts</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">IP Whitelist</div>
                        <div className="text-sm text-muted-foreground">Restrict admin access to specific IPs</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-Lockout</div>
                        <div className="text-sm text-muted-foreground">Lock accounts after failed attempts</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Session Timeout</div>
                        <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15m</SelectItem>
                          <SelectItem value="30">30m</SelectItem>
                          <SelectItem value="60">1h</SelectItem>
                          <SelectItem value="120">2h</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Button className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Audit Logs
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        Backup Configuration
                      </Button>
                      <Button className="w-full" variant="destructive">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Emergency Shutdown
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">✅ System backup completed successfully</span>
                      <span className="text-xs text-muted-foreground">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">⚠️ Failed login attempt from 192.168.1.100</span>
                      <span className="text-xs text-muted-foreground">15 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm">ℹ️ Admin session started from 10.0.0.50</span>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm">🚨 Suspicious API activity detected</span>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;