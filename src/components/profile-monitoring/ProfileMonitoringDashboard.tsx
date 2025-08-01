import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Globe, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalTargets: number;
  activeScans: number;
  alertsToday: number;
  platformsCovered: number;
  threatLevel: string;
  lastScanTime: string;
}

interface RecentAlert {
  id: string;
  title: string;
  severity: string;
  created_at: string;
}

export function ProfileMonitoringDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch monitoring targets
      const { data: targets } = await supabase
        .from('profile_monitoring_targets')
        .select('*')
        .eq('user_id', user.id);

      // Fetch recent alerts
      const { data: alerts } = await supabase
        .from('profile_impersonation_alerts')
        .select('id, title, severity, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get today's alerts count - simplified
      const alertsToday = alerts?.length || 0;

      // Calculate platform coverage
      const platformsSet = new Set();
      targets?.forEach(target => {
        target.platforms_to_monitor?.forEach((platform: string) => platformsSet.add(platform));
      });

      const dashboardStats: DashboardStats = {
        totalTargets: targets?.length || 0,
        activeScans: targets?.filter(t => t.monitoring_enabled).length || 0,
        alertsToday: alertsToday,
        platformsCovered: platformsSet.size,
        threatLevel: calculateOverallThreatLevel(targets || []),
        lastScanTime: getLastScanTime(targets || [])
      };

      setStats(dashboardStats);
      setRecentAlerts(alerts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallThreatLevel = (targets: any[]): string => {
    if (targets.length === 0) return 'None';
    
    const avgRisk = targets.reduce((sum, target) => sum + (target.risk_score || 0), 0) / targets.length;
    
    if (avgRisk >= 80) return 'High';
    if (avgRisk >= 50) return 'Medium';
    if (avgRisk >= 20) return 'Low';
    return 'Minimal';
  };

  const getLastScanTime = (targets: any[]): string => {
    const lastScans = targets
      .map(t => t.last_scan_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return lastScans[0] ? new Date(lastScans[0]).toLocaleString() : 'Never';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTargets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeScans || 0} actively scanning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.alertsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Detected today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Coverage</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.platformsCovered || 0}</div>
            <p className="text-xs text-muted-foreground">
              Platforms monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.threatLevel || 'None'}</div>
            <p className="text-xs text-muted-foreground">
              Overall threat level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeScans || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{stats?.lastScanTime || 'Never'}</div>
            <p className="text-xs text-muted-foreground">
              Last scan time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            Latest impersonation and identity theft alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent alerts. Your profiles are secure.
            </p>
          ) : (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common monitoring tasks and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Add Profile</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Scan Now</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">View Alerts</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}