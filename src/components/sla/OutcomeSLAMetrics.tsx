import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

export function OutcomeSLAMetrics({ periodDays = 30 }: { periodDays?: number }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    period_days: number;
    total_detected: number;
    resolved_count: number;
    takedown_success_rate: number;
    avg_time_to_resolve_minutes: number | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sla-metrics', {
          body: { periodDays },
        });
        if (error) throw error;
        setMetrics(data.metrics);
      } catch (e) {
        console.error('Failed to load SLA metrics', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [periodDays]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outcome SLA Metrics</CardTitle>
          <CardDescription>Measuring results, not just uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome SLA Metrics</CardTitle>
        <CardDescription>Last {metrics?.period_days} days</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Violations Detected</div>
          <div className="text-2xl font-semibold">{metrics?.total_detected ?? 0}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="text-2xl font-semibold">{metrics?.resolved_count ?? 0}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Takedown Success</div>
          <div className="text-2xl font-semibold">{metrics?.takedown_success_rate ?? 0}%</div>
          <Progress value={metrics?.takedown_success_rate ?? 0} className="mt-1" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Avg Time to Resolve</div>
          <div className="text-2xl font-semibold">{metrics?.avg_time_to_resolve_minutes ?? '-'} min</div>
        </div>
        <div className="md:col-span-4 text-xs text-muted-foreground">
          Beta disclosure: Outcome metrics are approximate and depend on platform response. Legal timelines vary by jurisdiction.
        </div>
      </CardContent>
    </Card>
  );
}
