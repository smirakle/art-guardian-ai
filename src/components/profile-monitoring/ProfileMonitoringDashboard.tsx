import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Search, Users, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DashboardStats {
  totalTargets: number;
  activeScans: number;
  totalAlerts: number;
  unreadAlerts: number;
  riskProfiles: number;
  platformsCovered: number;
}

interface RecentAlert {
  id: string;
  title: string;
  severity: string;
  created_at: string;
  platform: string;
}

export const ProfileMonitoringDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTargets: 0,
    activeScans: 0,
    totalAlerts: 0,
    unreadAlerts: 0,
    riskProfiles: 0,
    platformsCovered: 0
  });
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load targets
      const { data: targets } = await supabase
        .from('profile_monitoring_targets')
        .select('*')
        .eq('user_id', user?.id);

      // Load alerts
      const { data: alerts } = await supabase
        .from('profile_impersonation_alerts')
        .select('*')
        .eq('user_id', user?.id);

      // Load recent scan results for active scans count
      const { data: scanResults } = await supabase
        .from('profile_scan_results')
        .select('*, profile_monitoring_targets!inner(*)')
        .eq('profile_monitoring_targets.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load platforms
      const { data: platforms } = await supabase
        .from('monitored_platforms')
        .select('*')
        .eq('is_enabled', true);

      setStats({
        totalTargets: targets?.length || 0,
        activeScans: scanResults?.length || 0,
        totalAlerts: alerts?.length || 0,
        unreadAlerts: alerts?.filter(alert => !alert.is_acknowledged).length || 0,
        riskProfiles: targets?.filter(target => target.risk_score > 50).length || 0,
        platformsCovered: platforms?.length || 0
      });

      // Set recent alerts
      const recentAlertsData = alerts
        ?.slice(0, 5)
        .map(alert => ({
          id: alert.id,
          title: alert.title,
          severity: alert.severity,
          created_at: alert.created_at,
          platform: 'Unknown' // We'll need to join with scan results to get platform
        })) || [];

      setRecentAlerts(recentAlertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const riskPercentage = stats.totalTargets > 0 ? (stats.riskProfiles / stats.totalTargets) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTargets}</div>
            <p className="text-xs text-muted-foreground">
              Total identity profiles being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.unreadAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAlerts} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Coverage</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.platformsCovered}</div>
            <p className="text-xs text-muted-foreground">
              Platforms actively monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.riskProfiles}</div>
            <p className="text-xs text-muted-foreground">
              High-risk profiles detected
            </p>
            <Progress value={riskPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeScans}</div>
            <p className="text-xs text-muted-foreground">
              Scans completed this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {riskPercentage > 30 ? 'High' : riskPercentage > 10 ? 'Medium' : 'Low'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall risk assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest impersonation and security alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent alerts</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common monitoring tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Start New Profile Scan
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Add Monitoring Target
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Review Pending Alerts
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Generate Risk Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};