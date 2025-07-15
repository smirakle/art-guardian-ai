import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Shield,
  X,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AlertItem = Tables<'monitoring_alerts'> & {
  copyright_matches?: Tables<'copyright_matches'> & {
    artwork?: Tables<'artwork'>
  }
}

const AlertsPanel = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    setupRealTimeSubscription();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('monitoring_alerts')
        .select(`
          *,
          copyright_matches:match_id (
            *,
            artwork:artwork_id (*)
          )
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading alerts:', error);
        return;
      }

      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('monitoring_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'monitoring_alerts',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Load the full alert with relations
          const { data } = await supabase
            .from('monitoring_alerts')
            .select(`
              *,
              copyright_matches:match_id (
                *,
                artwork:artwork_id (*)
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setAlerts(prev => [data, ...prev]);
            toast({
              title: "New Alert",
              description: data.title,
              variant: "destructive"
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'monitoring_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setAlerts(prev => prev.map(alert => 
            alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'monitoring_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('monitoring_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return;
      }

      toast({
        title: "Alert Marked as Read",
        description: "The alert has been marked as read",
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('monitoring_alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        return;
      }

      toast({
        title: "Alert Deleted",
        description: "The alert has been removed from your dashboard",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Eye className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusBadge = (isRead: boolean) => {
    if (isRead) {
      return <Badge variant="secondary">Read</Badge>;
    }
    return <Badge variant="destructive">New</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Active Security Alerts
            </CardTitle>
            <CardDescription>
              Loading alerts...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Active Security Alerts
          </CardTitle>
          <CardDescription>
            Real-time notifications about potential IP violations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No active alerts at this time</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const match = alert.copyright_matches;
              const artwork = match?.artwork;
              
              return (
                <Alert key={alert.id} className={`relative ${!alert.is_read ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="opacity-50 hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {match?.source_domain && (
                          <>
                            <span>Platform: {match.source_domain}</span>
                            <span>•</span>
                          </>
                        )}
                        {artwork && (
                          <>
                            <span>Artwork: {artwork.title}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getAlertVariant(alert.alert_type)}>
                            {alert.alert_type.toUpperCase()}
                          </Badge>
                          {getStatusBadge(alert.is_read || false)}
                        </div>
                        
                        <div className="flex gap-2">
                          {match?.source_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(match.source_url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Source
                            </Button>
                          )}
                          {!alert.is_read && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;