import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SLAStatusWidget } from "@/components/sla/SLAStatusWidget";
import { SLAGuarantees } from "@/components/sla/SLAGuarantees";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ArrowLeft, Download, RefreshCw, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IncidentHistory {
  id: string;
  date: string;
  type: 'outage' | 'degradation' | 'maintenance';
  duration: string;
  affected_services: string[];
  status: 'resolved' | 'investigating' | 'monitoring';
  description: string;
}

export default function SLAStatus() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [incidents, setIncidents] = useState<IncidentHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const userPlan = subscription?.plan_id as 'professional' | 'enterprise' | undefined;
  const hasAccess = userPlan === 'professional' || userPlan === 'enterprise';

  useEffect(() => {
    // Simulate incident history data
    const mockIncidents: IncidentHistory[] = [
      {
        id: '1',
        date: '2024-01-15',
        type: 'maintenance',
        duration: '2 hours',
        affected_services: ['API', 'Dashboard'],
        status: 'resolved',
        description: 'Scheduled maintenance for database optimization'
      },
      {
        id: '2',
        date: '2024-01-08',
        type: 'degradation',
        duration: '45 minutes',
        affected_services: ['Monitoring'],
        status: 'resolved',
        description: 'Temporary slowdown in scan processing due to high load'
      },
      {
        id: '3',
        date: '2023-12-20',
        type: 'outage',
        duration: '1.5 hours',
        affected_services: ['Dashboard', 'API'],
        status: 'resolved',
        description: 'Service interruption due to network provider issues'
      }
    ];
    
    setIncidents(mockIncidents);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const downloadSLAReport = () => {
    // In a real app, this would generate and download an actual SLA report
    const reportData = {
      period: "January 2024",
      plan: userPlan,
      uptime: userPlan === 'enterprise' ? '99.95%' : '99.7%',
      incidents: incidents.length,
      credits_applied: 0
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sla-report-${new Date().toISOString().slice(0, 7)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case 'outage': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'degradation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>SLA Dashboard Access Required</CardTitle>
              <CardDescription>
                Access to SLA guarantees and monitoring is available for Professional and Enterprise plans only.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/pricing')}>
                Upgrade Your Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">SLA Dashboard</h1>
              <p className="text-muted-foreground">
                Service Level Agreement monitoring for {userPlan} plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSLAReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current SLA Status */}
          <div className="lg:col-span-2">
            <SLAStatusWidget plan={userPlan!} />
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <Badge variant="secondary">
                      {userPlan === 'enterprise' ? '99.95%' : '99.7%'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Incidents</span>
                    <Badge variant="outline">{incidents.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Credits Applied</span>
                    <Badge variant="outline">$0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+0.1%</div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SLA Guarantees */}
        <div className="mb-8">
          <SLAGuarantees showComparison={false} plan={userPlan} />
        </div>

        {/* Incident History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Incidents & Maintenance
            </CardTitle>
            <CardDescription>
              History of service incidents and scheduled maintenance events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getIncidentTypeColor(incident.type)}>
                        {incident.type}
                      </Badge>
                      <span className="font-medium">{incident.description}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{incident.date}</span>
                    <span>Duration: {incident.duration}</span>
                    <span>Affected: {incident.affected_services.join(', ')}</span>
                  </div>
                </div>
              ))}
              
              {incidents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No incidents recorded this period</p>
                  <p className="text-sm">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}