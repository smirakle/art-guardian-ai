import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Eye, CheckCircle, Clock, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioAlert {
  id: string;
  portfolio_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  portfolio_name?: string;
}

export function PortfolioAlerts() {
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [activeTab, setActiveTab] = useState('unread');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscriptions for alerts
    const channel = supabase
      .channel('portfolio-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_alerts'
        },
        (payload) => {
          console.log('New portfolio alert:', payload);
          const newAlert = {
            ...payload.new,
            metadata: payload.new.metadata as Record<string, any> || {},
            portfolio_name: 'Portfolio'
          } as PortfolioAlert;
          
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show notification for new high priority alerts
          if (payload.new.severity === 'high') {
            toast({
              title: "High Priority Alert",
              description: payload.new.title,
              variant: "destructive",
            });
          } else {
            toast({
              title: "New Alert",
              description: payload.new.title,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'portfolio_alerts'
        },
        (payload) => {
          console.log('Portfolio alert updated:', payload);
          const updatedAlert = {
            ...payload.new,
            metadata: payload.new.metadata as Record<string, any> || {},
            portfolio_name: 'Portfolio'
          } as PortfolioAlert;
          
          setAlerts(prev => 
            prev.map(alert => 
              alert.id === payload.new.id ? updatedAlert : alert
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedAlerts = data?.map(alert => ({
        ...alert,
        metadata: alert.metadata as Record<string, any> || {},
        portfolio_name: 'Portfolio'
      })) || [];

      setAlerts(processedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      });
    }
  };

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_alerts')
        .update({ is_resolved: true, is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_resolved: true, is_read: true } : alert
      ));

      toast({
        title: "Success",
        description: "Alert marked as resolved",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlertIds = alerts.filter(alert => !alert.is_read).map(alert => alert.id);
      
      if (unreadAlertIds.length === 0) return;

      const { error } = await supabase
        .from('portfolio_alerts')
        .update({ is_read: true })
        .in('id', unreadAlertIds);

      if (error) throw error;

      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
      
      toast({
        title: "Success",
        description: "All alerts marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark alerts as read",
        variant: "destructive",
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filterAlerts = (alerts: PortfolioAlert[], filter: string) => {
    switch (filter) {
      case 'unread':
        return alerts.filter(alert => !alert.is_read);
      case 'high':
        return alerts.filter(alert => alert.severity === 'high');
      case 'resolved':
        return alerts.filter(alert => alert.is_resolved);
      default:
        return alerts;
    }
  };

  const filteredAlerts = filterAlerts(alerts, activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Alerts</h2>
          <p className="text-muted-foreground">Monitor and manage security alerts for your portfolios</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Alert Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            All ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Unread ({alerts.filter(a => !a.is_read).length})
          </TabsTrigger>
          <TabsTrigger value="high" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            High Priority ({alerts.filter(a => a.severity === 'high').length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Resolved ({alerts.filter(a => a.is_resolved).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.is_read ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{alert.portfolio_name}</span>
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity} priority
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="outline">Unread</Badge>
                          )}
                          {alert.is_resolved && (
                            <Badge variant="default">Resolved</Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{alert.message}</p>
                  
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Details:</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(alert.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!alert.is_read && (
                      <Button variant="outline" size="sm" onClick={() => markAsRead(alert.id)}>
                        <Eye className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    {!alert.is_resolved && (
                      <Button variant="outline" size="sm" onClick={() => markAsResolved(alert.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'unread' && 'All caught up! No unread alerts.'}
                    {activeTab === 'high' && 'No high priority alerts at the moment.'}
                    {activeTab === 'resolved' && 'No resolved alerts to show.'}
                    {activeTab === 'all' && 'No alerts have been generated yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}