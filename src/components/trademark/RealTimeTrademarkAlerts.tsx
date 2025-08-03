import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, Bell, Clock, Shield, Globe, Eye, 
  FileText, Download, ExternalLink, ChevronRight,
  Zap, Brain, Target, TrendingUp, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TrademarkAlert {
  id: string;
  trademark_id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source_url?: string;
  source_domain?: string;
  confidence_score?: number;
  status: string;
  auto_resolved: boolean;
  evidence_data: any;
  geographic_data: any;
  created_at: string;
  resolved_at?: string;
  trademark?: {
    trademark_name: string;
    jurisdiction: string;
  };
}

interface LiveFeedItem {
  id: string;
  type: 'threat' | 'registration' | 'domain' | 'social' | 'marketplace';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;
  timestamp: string;
  source: string;
  actionable: boolean;
}

const mockLiveFeed: LiveFeedItem[] = [
  {
    id: '1',
    type: 'threat',
    title: 'High similarity trademark application detected',
    description: 'New USPTO application for "TechNova Solutions" filed - 95% similarity match',
    severity: 'critical',
    confidence: 95,
    timestamp: '2 minutes ago',
    source: 'USPTO',
    actionable: true
  },
  {
    id: '2',
    type: 'domain',
    title: 'Domain registration alert',
    description: 'technova-solutions.com registered by unknown entity',
    severity: 'high',
    confidence: 87,
    timestamp: '15 minutes ago',
    source: 'Domain Monitor',
    actionable: true
  },
  {
    id: '3',
    type: 'social',
    title: 'Social media account created',
    description: '@TechNovaOfficial Instagram account created with similar branding',
    severity: 'medium',
    confidence: 72,
    timestamp: '1 hour ago',
    source: 'Social Monitor',
    actionable: false
  }
];

export const RealTimeTrademarkAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<TrademarkAlert[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(mockLiveFeed);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAlerts();
      // Set up real-time subscription
      const channel = supabase
        .channel('trademark-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trademark_alerts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newAlert = payload.new as TrademarkAlert;
            setAlerts(prev => [newAlert, ...prev]);
            
            // Show toast notification for critical alerts
            if (newAlert.severity === 'critical' || newAlert.severity === 'high') {
              toast({
                title: "New Trademark Alert",
                description: newAlert.title,
                variant: newAlert.severity === 'critical' ? "destructive" : "default"
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  useEffect(() => {
    // Simulate live feed updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new item every 10 seconds
        const newItem: LiveFeedItem = {
          id: Date.now().toString(),
          type: ['threat', 'registration', 'domain', 'social', 'marketplace'][Math.floor(Math.random() * 5)] as any,
          title: 'Real-time monitoring detected new activity',
          description: 'Automated system found potential trademark conflict',
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          confidence: Math.floor(Math.random() * 30) + 70,
          timestamp: 'just now',
          source: 'AI Monitor',
          actionable: Math.random() > 0.5
        };
        setLiveFeed(prev => [newItem, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('trademark_alerts')
        .select(`
          *,
          trademarks (
            trademark_name,
            jurisdiction
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('trademark_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved', resolved_at: new Date().toISOString() }
          : alert
      ));

      toast({
        title: "Success",
        description: "Alert marked as resolved"
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="h-4 w-4" />;
      case 'registration': return <FileText className="h-4 w-4" />;
      case 'domain': return <Globe className="h-4 w-4" />;
      case 'social': return <Bell className="h-4 w-4" />;
      case 'marketplace': return <Target className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filterSeverity);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'critical' && a.status === 'pending').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.severity === 'high' && a.status === 'pending').length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold text-green-600">24/7</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">2.3m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="alerts">All Alerts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                Real-Time Monitoring Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${getSeverityColor(item.severity)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.source}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.confidence}% confidence
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          </div>
                        </div>
                        {item.actionable && (
                          <Button variant="outline" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Alerts</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No alerts found</p>
                  <p className="text-sm text-muted-foreground">
                    Your trademarks are being monitored 24/7 for potential conflicts
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.filter(alert => alert.status === 'pending').map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.confidence_score && (
                                <Badge variant="outline">
                                  {Math.round(alert.confidence_score * 100)}% match
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Alert Type: {alert.alert_type}</span>
                              {alert.source_domain && (
                                <span>Source: {alert.source_domain}</span>
                              )}
                              <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>

                            {alert.source_url && (
                              <div className="mt-2">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={alert.source_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View Source
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAsResolved(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.filter(alert => alert.status === 'resolved').map((alert) => (
                  <Card key={alert.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant="outline">Resolved</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>Resolved: {alert.resolved_at ? new Date(alert.resolved_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeTrademarkAlerts;