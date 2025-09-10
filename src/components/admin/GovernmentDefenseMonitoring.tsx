import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Eye, Clock, Activity, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringSession {
  id: string;
  user_id: string;
  session_type: 'threat_intelligence' | 'ip_monitoring';
  targets?: string[];
  ip_assets?: any[];
  classification_level?: string;
  priority?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

const GovernmentDefenseMonitoring: React.FC = () => {
  const [sessions, setSessions] = useState<MonitoringSession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    session_type: 'threat_intelligence' as 'threat_intelligence' | 'ip_monitoring',
    targets: '',
    classification_level: 'unclassified',
    priority: 'medium',
    monitoring_duration_hours: 24
  });

  useEffect(() => {
    fetchMonitoringSessions();
    fetchSecurityAlerts();
  }, []);

  const fetchMonitoringSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('gov_defense_monitoring_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching monitoring sessions:', error);
      toast.error('Failed to fetch monitoring sessions');
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('gov_defense_security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      toast.error('Failed to fetch security alerts');
    } finally {
      setLoading(false);
    }
  };

  const createMonitoringSession = async () => {
    try {
      const sessionData = {
        session_type: newSession.session_type,
        targets: newSession.targets.split('\n').filter(t => t.trim()),
        classification_level: newSession.classification_level,
        priority: newSession.priority,
        monitoring_duration_hours: newSession.monitoring_duration_hours,
        status: 'active'
      };

      const { error } = await supabase
        .from('gov_defense_monitoring_sessions')
        .insert(sessionData);

      if (error) throw error;

      toast.success('Monitoring session created successfully');
      fetchMonitoringSessions();
      setNewSession({
        session_type: 'threat_intelligence',
        targets: '',
        classification_level: 'unclassified',
        priority: 'medium',
        monitoring_duration_hours: 24
      });
    } catch (error) {
      console.error('Error creating monitoring session:', error);
      toast.error('Failed to create monitoring session');
    }
  };

  const getClassificationBadgeColor = (level: string) => {
    switch (level) {
      case 'secret': return 'bg-red-500';
      case 'confidential': return 'bg-orange-500';
      case 'cui': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Government & Defense Monitoring</h1>
          <p className="text-muted-foreground">Cybersecurity and IP monitoring for government and defense entities</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-amber-200 text-amber-800">
            <Shield className="h-3 w-3 mr-1" />
            CLASSIFIED SYSTEM
          </Badge>
          <Badge variant="outline" className="border-blue-200 text-blue-800">
            <Eye className="h-3 w-3 mr-1" />
            {sessions.filter(s => s.status === 'active').length} Active Sessions
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Monitoring Sessions</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="create">Create Session</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{sessions.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                    <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'active').length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                    <p className="text-2xl font-bold">{alerts.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                    <p className="text-2xl font-bold">{alerts.filter(a => a.severity === 'critical').length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${session.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <div>
                        <p className="font-medium">{session.session_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getClassificationBadgeColor(session.classification_level || 'unclassified')}>
                        {session.classification_level?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{session.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getClassificationBadgeColor(session.classification_level || 'unclassified')}>
                          {session.classification_level?.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold">
                          {session.session_type.replace('_', ' ').toUpperCase()}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        <Badge variant="outline">
                          {session.priority?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Session ID: {session.id}</p>
                      <p>Created: {new Date(session.created_at).toLocaleString()}</p>
                      {session.targets && (
                        <p>Targets: {session.targets.length} items</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge className={getSeverityBadgeColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Alert Type: {alert.alert_type}</p>
                      <p>Created: {new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Monitoring Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session-type">Session Type</Label>
                <Select
                  value={newSession.session_type}
                  onValueChange={(value: 'threat_intelligence' | 'ip_monitoring') => 
                    setNewSession(prev => ({ ...prev, session_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="threat_intelligence">Threat Intelligence</SelectItem>
                    <SelectItem value="ip_monitoring">IP Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targets">Targets (one per line)</Label>
                <Textarea
                  id="targets"
                  placeholder="Enter URLs, domains, or IP addresses..."
                  value={newSession.targets}
                  onChange={(e) => setNewSession(prev => ({ ...prev, targets: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="classification">Classification Level</Label>
                  <Select
                    value={newSession.classification_level}
                    onValueChange={(value) => setNewSession(prev => ({ ...prev, classification_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unclassified">Unclassified</SelectItem>
                      <SelectItem value="cui">CUI</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="secret">Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newSession.priority}
                    onValueChange={(value) => setNewSession(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Monitoring Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="168"
                  value={newSession.monitoring_duration_hours}
                  onChange={(e) => setNewSession(prev => ({ ...prev, monitoring_duration_hours: parseInt(e.target.value) }))}
                />
              </div>

              <Button onClick={createMonitoringSession} className="w-full">
                Create Monitoring Session
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">ITAR Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      International Traffic in Arms Regulations monitoring and compliance
                    </p>
                    <Badge className="mt-2 bg-green-500">Active</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">EAR Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Export Administration Regulations monitoring
                    </p>
                    <Badge className="mt-2 bg-green-500">Active</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">DFARS Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Defense Federal Acquisition Regulation Supplement
                    </p>
                    <Badge className="mt-2 bg-green-500">Active</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">CFIUS Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Committee on Foreign Investment monitoring
                    </p>
                    <Badge className="mt-2 bg-green-500">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernmentDefenseMonitoring;