import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus,
  TrendingDown,
  Users
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  description: string;
  started_at: string;
  resolved_at?: string;
  mttr?: number; // Mean Time To Recovery in minutes
  affected_services: string[];
  assigned_to?: string;
  root_cause?: string;
  resolution_steps?: string;
  postmortem?: string;
}

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('advanced_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform alerts into incidents format
      const transformedIncidents: Incident[] = (data || []).map(alert => ({
        id: alert.id,
        title: alert.title,
        severity: mapSeverityToPriority(alert.severity),
        status: alert.is_escalated ? 'investigating' : alert.acknowledged_at ? 'monitoring' : 'identified',
        description: alert.message,
        started_at: alert.created_at,
        resolved_at: alert.resolved_at,
        mttr: alert.resolved_at ? 
          Math.floor((new Date(alert.resolved_at).getTime() - new Date(alert.created_at).getTime()) / 60000) : 
          undefined,
        affected_services: [alert.alert_type],
        assigned_to: alert.acknowledged_by,
      }));

      setIncidents(transformedIncidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast({
        title: 'Error loading incidents',
        description: 'Failed to fetch incident data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P0': return 'destructive';
      case 'P1': return 'destructive';
      case 'P2': return 'secondary';
      case 'P3': return 'default';
      case 'P4': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'destructive';
      case 'identified': return 'secondary';
      case 'monitoring': return 'default';
      case 'resolved': return 'outline';
      default: return 'default';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
  const avgMTTR = resolvedIncidents.length > 0
    ? Math.floor(resolvedIncidents.reduce((sum, i) => sum + (i.mttr || 0), 0) / resolvedIncidents.length)
    : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-10 w-10 text-primary" />
              Incident Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Track and resolve production incidents
            </p>
          </div>
          <Button onClick={() => setShowNewIncident(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeIncidents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolved (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resolvedIncidents.filter(i => 
                  new Date(i.resolved_at!).getTime() > Date.now() - 86400000
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg MTTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMTTR}m</div>
              <p className="text-xs text-muted-foreground">Mean Time To Recovery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Severity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="destructive">P0: {incidents.filter(i => i.severity === 'P0').length}</Badge>
                <Badge variant="secondary">P1: {incidents.filter(i => i.severity === 'P1').length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeIncidents.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedIncidents.length})</TabsTrigger>
            <TabsTrigger value="postmortems">Postmortems</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading incidents...
                </CardContent>
              </Card>
            ) : activeIncidents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active incidents. System operating normally.
                </CardContent>
              </Card>
            ) : (
              activeIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <CardTitle>{incident.title}</CardTitle>
                        <CardDescription>{incident.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Started: {new Date(incident.started_at).toLocaleString()}</div>
                        <div>Duration: {Math.floor((Date.now() - new Date(incident.started_at).getTime()) / 60000)}m</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>Affected Services: {incident.affected_services.join(', ')}</span>
                      </div>
                      {incident.assigned_to && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>Assigned to: {incident.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedIncidents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resolved incidents yet.
                </CardContent>
              </Card>
            ) : (
              resolvedIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">Resolved</Badge>
                          {incident.mttr && (
                            <Badge variant="secondary">MTTR: {incident.mttr}m</Badge>
                          )}
                        </div>
                        <CardTitle>{incident.title}</CardTitle>
                        <CardDescription>{incident.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="postmortems" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Post-Incident Analysis
                </CardTitle>
                <CardDescription>
                  Blameless postmortems and lessons learned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No postmortems available yet. Create postmortems after resolving incidents to document learnings and prevent future occurrences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function mapSeverityToPriority(severity: string): 'P0' | 'P1' | 'P2' | 'P3' | 'P4' {
  switch (severity) {
    case 'critical': return 'P0';
    case 'error': return 'P1';
    case 'warning': return 'P2';
    case 'info': return 'P3';
    default: return 'P4';
  }
}
