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

interface AlertItem {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  platform: string;
  url: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'investigating';
  artworkId: string;
}

const AlertsPanel = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'high',
      title: 'Unauthorized Commercial Use Detected',
      description: 'Your artwork "Digital Sunset" is being sold without permission on a marketplace',
      platform: 'Etsy',
      url: 'https://etsy.com/example-listing',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'active',
      artworkId: 'ART-2023-001'
    },
    {
      id: '2',
      type: 'medium',
      title: 'Social Media Repost Without Credit',
      description: 'Your illustration has been reposted without attribution',
      platform: 'Instagram',
      url: 'https://instagram.com/example-post',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'investigating',
      artworkId: 'ART-2023-002'
    },
    {
      id: '3',
      type: 'low',
      title: 'Potential Fair Use',
      description: 'Your artwork appears in a blog post - requires manual review',
      platform: 'Blog',
      url: 'https://example-blog.com/post',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'active',
      artworkId: 'ART-2023-003'
    }
  ]);

  useEffect(() => {
    // Simulate new alerts coming in
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: AlertItem = {
          id: Date.now().toString(),
          type: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
          title: [
            'Potential Copyright Violation',
            'Unauthorized Distribution Detected',
            'Watermark Removal Detected',
            'License Violation Alert'
          ][Math.floor(Math.random() * 4)],
          description: [
            'Your artwork has been used without proper licensing',
            'Possible commercial use without permission detected',
            'Content appears to be modified from original',
            'Usage exceeds permitted scope'
          ][Math.floor(Math.random() * 4)],
          platform: ['Instagram', 'Pinterest', 'Etsy', 'DeviantArt', 'Twitter'][Math.floor(Math.random() * 5)],
          url: 'https://example.com/detected-usage',
          timestamp: new Date(),
          status: 'active',
          artworkId: `ART-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only 10 most recent
        
        toast({
          title: "New Alert",
          description: newAlert.title,
          variant: "destructive"
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [toast]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    
    toast({
      title: "Alert Resolved",
      description: "The copyright issue has been marked as resolved",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been removed from your dashboard",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="secondary">Investigating</Badge>;
      default:
        return <Badge variant="destructive">Active</Badge>;
    }
  };

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
            alerts.map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="opacity-50 hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Platform: {alert.platform}</span>
                      <span>•</span>
                      <span>Artwork ID: {alert.artworkId}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getAlertVariant(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        {getStatusBadge(alert.status)}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(alert.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {alert.status === 'active' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;