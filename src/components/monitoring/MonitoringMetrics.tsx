import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  AlertTriangle, 
  Shield, 
  Server,
  Clock,
  CheckCircle
} from "lucide-react";

interface MonitoringStats {
  totalScans: number;
  activeAlerts: number;
  protectedAssets: number;
  systemUptime: number;
  lastScanTime: string;
  threatLevel: 'low' | 'medium' | 'high';
}

interface MonitoringMetricsProps {
  stats: MonitoringStats;
}

const MonitoringMetrics = ({ stats }: MonitoringMetricsProps) => {
  const getStatusColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
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
          <div className="text-xs text-muted-foreground flex items-center">
            Threat Level: 
            <Badge variant={getStatusColor(stats.threatLevel)} className="ml-2 text-xs">
              {stats.threatLevel.toUpperCase()}
            </Badge>
          </div>
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
  );
};

export default MonitoringMetrics;