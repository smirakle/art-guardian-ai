import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Shield, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImpersonationAlert {
  id: string;
  target_id: string;
  scan_result_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  recommended_actions: string[];
  is_acknowledged: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  target: {
    target_name: string;
  };
  scan_result: {
    platform: string;
    profile_url: string;
    profile_username: string;
    confidence_score: number;
    similarity_score: number;
  };
}

export const ImpersonationAlerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ImpersonationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'resolved'>('all');

  useEffect(() => {
    if (user) {
      loadAlerts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_impersonation_alerts')
        .select(`
          *,
          target:profile_monitoring_targets(target_name),
          scan_result:profile_scan_results(
            platform,
            profile_url,
            profile_username,
            confidence_score,
            similarity_score
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('profile_impersonation_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_impersonation_alerts',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadAlerts();
          toast.info('New impersonation alert received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('profile_impersonation_alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;
      
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('profile_impersonation_alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      
      toast.success('Alert resolved');
      loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
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

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'impersonation':
        return <AlertTriangle className="w-4 h-4" />;
      case 'identity_theft':
        return <Shield className="w-4 h-4" />;
      case 'fake_profile':
        return <Eye className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.is_acknowledged;
      case 'high':
        return alert.severity === 'high';
      case 'resolved':
        return alert.is_resolved;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Impersonation Alerts</h2>
        <p className="text-muted-foreground">Monitor and respond to potential identity threats</p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({alerts.filter(a => !a.is_acknowledged).length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High Priority ({alerts.filter(a => a.severity === 'high').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({alerts.filter(a => a.is_resolved).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No alerts found' : `No ${filter} alerts`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your monitored profiles are secure
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.is_acknowledged ? 'border-l-4 border-l-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {!alert.is_acknowledged && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {alert.is_resolved && (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{alert.description}</CardDescription>
                      <div className="text-sm text-muted-foreground">
                        Target: <strong>{alert.target?.target_name}</strong> • 
                        Platform: <strong>{alert.scan_result?.platform}</strong> • 
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!alert.is_acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      )}
                      {!alert.is_resolved && (
                        <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      {alert.scan_result?.profile_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={alert.scan_result.profile_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Alert Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Profile URL:</strong><br />
                        <a 
                          href={alert.scan_result?.profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {alert.scan_result?.profile_username || 'View Profile'}
                        </a>
                      </div>
                      <div>
                        <strong>Confidence Score:</strong><br />
                        {Math.round(alert.scan_result?.confidence_score || 0)}%
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    {alert.recommended_actions.length > 0 && (
                      <div>
                        <strong className="text-sm">Recommended Actions:</strong>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {alert.recommended_actions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};