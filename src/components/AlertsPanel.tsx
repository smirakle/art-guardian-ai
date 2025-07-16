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
      // Demo mode - show sample alerts
      const demoAlerts: AlertItem[] = [
        {
          id: 'demo-alert-1',
          user_id: 'demo-user',
          match_id: 'demo-match-1',
          alert_type: 'high',
          title: 'High-Risk Copyright Match Detected',
          message: 'Your artwork has been found on an unauthorized marketplace with 94% similarity',
          created_at: new Date().toISOString(),
          is_read: false,
          copyright_matches: {
            id: 'demo-match-1',
            artwork_id: 'demo-artwork-1',
            scan_id: 'demo-scan-1',
            source_url: 'https://example-marketplace.com/unauthorized-copy',
            source_domain: 'example-marketplace.com',
            source_title: 'Unauthorized Copy of Your Art',
            match_confidence: 94.5,
            match_type: 'exact',
            threat_level: 'high',
            detected_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            is_authorized: false,
            is_reviewed: false,
            description: 'Exact copy found on marketplace',
            context: 'Commercial marketplace',
            image_url: null,
            thumbnail_url: null,
            artwork: {
              id: 'demo-artwork-1',
              user_id: 'demo-user',
              title: 'Demo Artwork',
              description: 'This is a demo artwork',
              category: 'digital',
              file_paths: [],
              tags: [],
              status: 'active',
              license_type: 'all-rights-reserved',
              enable_watermark: true,
              enable_blockchain: false,
              blockchain_hash: null,
              blockchain_certificate_id: null,
              blockchain_registered_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        }
      ];

      setAlerts(demoAlerts);
    } catch (error) {
      console.error('Error loading demo alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = async () => {
    // Demo mode - no real-time subscription needed
    return () => {};
  };

  const markAsRead = async (alertId: string) => {
    // Demo mode - just update local state
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
    
    toast({
      title: "Alert Marked as Read",
      description: "Demo mode - alert marked as read locally",
    });
  };

  const deleteAlert = async (alertId: string) => {
    // Demo mode - just remove from local state
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Deleted",
      description: "Demo mode - alert removed locally",
    });
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