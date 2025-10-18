import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MonitoringWrapper } from '@/components/MonitoringWrapper';

interface RealtimeMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  created_at: string;
  metadata?: any;
}

interface AlertData {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export const RealTimeMonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [webVitals, setWebVitals] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    loadMetrics();
    loadAlerts();

    // Set up real-time subscriptions
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'production_metrics'
        },
        (payload) => {
          const newMetric = payload.new as RealtimeMetric;
          setMetrics(prev => [newMetric, ...prev].slice(0, 50));
          
          // Update web vitals if it's a web_vital metric
          if (newMetric.metric_type === 'web_vital') {
            setWebVitals(prev => ({
              ...prev,
              [newMetric.metric_name]: newMetric.metric_value
            }));
          }
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'advanced_alerts'
        },
        (payload) => {
          const newAlert = payload.new as AlertData;
          setAlerts(prev => [newAlert, ...prev].slice(0, 20));
          
          // Show toast for critical alerts
          if (newAlert.severity === 'critical' || newAlert.severity === 'error') {
            toast({
              title: newAlert.title,
              description: newAlert.message,
              variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [toast]);

  const loadMetrics = async () => {
    const { data, error } = await supabase
      .from('production_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setMetrics(data);
      
      // Extract web vitals
      const vitals = data
        .filter(m => m.metric_type === 'web_vital')
        .reduce((acc, m) => ({ ...acc, [m.metric_name]: m.metric_value }), {});
      setWebVitals(vitals);
    }
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('advanced_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      // Map the data to match AlertData interface
      const mappedAlerts: AlertData[] = data.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity as 'info' | 'warning' | 'error' | 'critical',
        created_at: alert.created_at
      }));
      setAlerts(mappedAlerts);
    }
  };

  const getWebVitalRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      INP: [200, 500],
      LCP: [2500, 4000],
      FCP: [1800, 3000],
      TTFB: [800, 1800],
    };

    const [good, poor] = thresholds[name] || [1000, 3000];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'error': return 'text-orange-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MonitoringWrapper componentName="RealTimeMonitoringDashboard">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              Real-Time Monitoring
            </h1>
            <p className="text-muted-foreground">Live performance and alert tracking</p>
          </div>
          <Badge variant="outline" className="text-green-500 border-green-500">
            <Activity className="h-4 w-4 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>

        {/* Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(webVitals).map(([name, value]) => {
            const rating = getWebVitalRating(name, value);
            return (
              <Card key={name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(value)}</div>
                  <Badge className={getRatingColor(rating) + ' text-white mt-2'}>
                    {rating}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Real-time system and performance alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>No alerts - system is healthy!</AlertDescription>
                </Alert>
              ) : (
                alerts.map((alert) => (
                  <Alert key={alert.id}>
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{alert.title}</span>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Metrics
            </CardTitle>
            <CardDescription>Latest performance and system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.slice(0, 10).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{metric.metric_name}</p>
                      <p className="text-xs text-muted-foreground">{metric.metric_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{Math.round(metric.metric_value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(metric.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MonitoringWrapper>
  );
};

export default RealTimeMonitoringDashboard;
