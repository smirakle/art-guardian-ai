import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { AlertCircle, Bell, CheckCircle, Play, Shield, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RealtimeThreatAlertsDashboard = () => {
  const { alerts, loading, stats, acknowledgeAlert, resolveAlert, startMonitoring } = useRealtimeAlerts();

  const getSeverityColor = (severity: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <Bell className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Threat Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">Loading alerts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-3xl text-destructive">{stats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unacknowledged</CardDescription>
            <CardTitle className="text-3xl">{stats.unacknowledged}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unresolved</CardDescription>
            <CardTitle className="text-3xl">{stats.unresolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Alert Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Real-Time Threat Monitoring
              </CardTitle>
              <CardDescription>
                Live threat detection and alerting system
              </CardDescription>
            </div>
            <Button onClick={startMonitoring} className="gap-2">
              <Play className="h-4 w-4" />
              Start Monitoring
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active alerts. Click "Start Monitoring" to begin real-time threat detection.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4" style={{
                    borderLeftColor: alert.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                    alert.severity === 'warning' ? 'hsl(var(--warning))' : 
                                    'hsl(var(--primary))'
                  }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base">{alert.title}</CardTitle>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              {alert.is_escalated && (
                                <Badge variant="destructive">
                                  Escalated (Level {alert.escalation_level})
                                </Badge>
                              )}
                              {alert.acknowledged_at && (
                                <Badge variant="outline">
                                  Acknowledged
                                </Badge>
                              )}
                              {alert.resolved_at && (
                                <Badge variant="secondary">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{alert.message}</CardDescription>
                            <div className="text-xs text-muted-foreground pt-2">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {alert.source_data && Object.keys(alert.source_data).length > 0 && (
                      <CardContent className="pt-0 pb-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="font-medium mb-2">Source Details:</div>
                          <div className="space-y-1 text-muted-foreground">
                            {Object.entries(alert.source_data).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="font-mono text-xs">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}

                    <CardContent className="pt-0 flex gap-2">
                      {!alert.acknowledged_at && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {!alert.resolved_at && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
