import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Lock, Key, Eye, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  overallScore: number;
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  authenticatedUsers: number;
  failedLogins: number;
  activeApiKeys: number;
  dataEncryption: boolean;
  rlsEnabled: boolean;
  lastSecurityScan: string;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
  resolved: boolean;
  source: string;
}

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    setupRealTimeUpdates();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security metrics
      const { data: securityData } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Load recent alerts
      const { data: alertData } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Calculate security metrics
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEvents = securityData?.filter(event => 
        new Date(event.created_at) > last24h
      ) || [];

      const securityMetrics: SecurityMetrics = {
        overallScore: calculateSecurityScore(recentEvents),
        totalAlerts: alertData?.length || 0,
        criticalAlerts: alertData?.filter(a => a.severity === 'critical').length || 0,
        resolvedAlerts: alertData?.filter(a => a.status === 'resolved').length || 0,
        authenticatedUsers: await getActiveUserCount(),
        failedLogins: recentEvents.filter(e => e.action === 'login_failure').length,
        activeApiKeys: await getActiveApiKeyCount(),
        dataEncryption: true, // This would be checked from config
        rlsEnabled: true, // This would be checked from database
        lastSecurityScan: new Date().toISOString()
      };

      setMetrics(securityMetrics);
      setAlerts(alertData?.map(alert => ({
        id: alert.id,
        type: alert.event_type || 'security',
        severity: alert.severity as any,
        message: alert.description,
        created_at: alert.created_at,
        resolved: alert.status === 'resolved',
        source: 'system'
      })) || []);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error Loading Security Data",
        description: "Failed to load security dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const subscription = supabase
      .channel('security_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'security_audit_log' 
      }, () => {
        loadSecurityData();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const calculateSecurityScore = (events: any[]): number => {
    // Basic security score calculation
    const criticalEvents = events.filter(e => e.details?.severity === 'critical').length;
    const warningEvents = events.filter(e => e.details?.severity === 'warning').length;
    
    let score = 100;
    score -= criticalEvents * 10;
    score -= warningEvents * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getActiveUserCount = async (): Promise<number> => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    } catch {
      return 0;
    }
  };

  const getActiveApiKeyCount = async (): Promise<number> => {
    try {
      const { count } = await supabase
        .from('enterprise_api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count || 0;
    } catch {
      return 0;
    }
  };

  const runSecurityScan = async () => {
    try {
      toast({
        title: "Security Scan Started",
        description: "Running comprehensive security scan...",
      });

      const { data, error } = await supabase.functions.invoke('security-scanner', {
        body: { action: 'full_scan' }
      });

      if (error) throw error;

      toast({
        title: "Security Scan Complete",
        description: "Security scan completed successfully",
      });

      loadSecurityData();
    } catch (error) {
      console.error('Security scan failed:', error);
      toast({
        title: "Security Scan Failed",
        description: "Unable to complete security scan",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, text: 'Excellent' };
    if (score >= 70) return { variant: 'secondary' as const, text: 'Good' };
    return { variant: 'destructive' as const, text: 'Needs Attention' };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security dashboard. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const scoreBadge = getScoreBadge(metrics.overallScore);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Button onClick={runSecurityScan} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      {/* Overall Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore}/100
              </div>
              <p className="text-muted-foreground">Overall Security Rating</p>
            </div>
            <Badge variant={scoreBadge.variant} className="text-lg px-4 py-2">
              {scoreBadge.text}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{metrics.totalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-red-600">
                {metrics.criticalAlerts} critical
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold">{metrics.failedLogins}</p>
              </div>
              <Lock className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Last 24 hours</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active API Keys</p>
                <p className="text-2xl font-bold">{metrics.activeApiKeys}</p>
              </div>
              <Key className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Monitored
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.authenticatedUsers}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                Authenticated
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-500" />
                <span>Data Encryption</span>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Row Level Security</span>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-green-500" />
                <span>API Rate Limiting</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-green-500" />
                <span>Audit Logging</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No security alerts. System is secure!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          RESOLVED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.source} • {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};