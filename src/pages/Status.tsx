import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  details?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  checks: ServiceCheck[];
}

export default function Status() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) throw error;
      
      setHealthStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check health:', error);
      setHealthStatus({
        status: 'down',
        timestamp: new Date().toISOString(),
        checks: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'degraded' | 'down') => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getOverallStatusColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">System Status</h1>
          </div>
          <p className="text-muted-foreground">
            Real-time monitoring of all ArtSentry services
          </p>
        </div>

        {/* Overall Status */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {healthStatus && getStatusIcon(healthStatus.status)}
                <div>
                  <CardTitle className={getOverallStatusColor(healthStatus?.status || 'down')}>
                    {healthStatus?.status === 'healthy' && 'All Systems Operational'}
                    {healthStatus?.status === 'degraded' && 'Partial System Outage'}
                    {healthStatus?.status === 'down' && 'System Down'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </CardDescription>
                </div>
              </div>
              {healthStatus && getStatusBadge(healthStatus.status)}
            </div>
          </CardHeader>
        </Card>

        {/* Service Status */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Service Details</h2>
          <div className="grid gap-4">
            {healthStatus?.checks.map((check) => (
              <Card key={check.service}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h3 className="font-semibold capitalize">{check.service}</h3>
                        <p className="text-sm text-muted-foreground">
                          {check.details || 'No additional details'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(check.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.response_time_ms}ms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle>About This Page</CardTitle>
            <CardDescription>
              This page automatically refreshes every 30 seconds to provide real-time system status.
              For historical uptime data and incident reports, please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
