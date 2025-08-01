import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, Clock, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MetricData {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metadata: any;
  recorded_at: string;
}

export const PortfolioMonitoringMetrics = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('portfolio_monitoring_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadMetrics();
  };

  useEffect(() => {
    loadMetrics();

    // Set up real-time subscription
    const channel = supabase
      .channel('portfolio-monitoring-metrics')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_monitoring_metrics'
        },
        (payload) => {
          const newMetric = payload.new as MetricData;
          setMetrics(prev => [newMetric, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'usage': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMetricVariant = (type: string) => {
    switch (type) {
      case 'performance': return 'default';
      case 'security': return 'destructive';
      case 'usage': return 'secondary';
      default: return 'outline';
    }
  };

  const formatMetricValue = (value: number, name: string) => {
    if (name.includes('time') || name.includes('duration')) {
      return `${value}ms`;
    }
    if (name.includes('rate') || name.includes('percentage')) {
      return `${value}%`;
    }
    if (name.includes('count') || name.includes('total')) {
      return value.toLocaleString();
    }
    return value.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Real-time monitoring performance and usage statistics
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No metrics available yet</p>
            <p className="text-sm">Metrics will appear as you use the monitoring system</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getMetricIcon(metric.metric_type)}
                  <div>
                    <div className="font-medium">{metric.metric_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(metric.recorded_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatMetricValue(metric.metric_value, metric.metric_name)}
                  </span>
                  <Badge variant={getMetricVariant(metric.metric_type)}>
                    {metric.metric_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};