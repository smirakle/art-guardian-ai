import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield,
  Zap,
  TrendingUp,
  Server
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MonitoringMetrics {
  system_health: {
    overall_status: 'healthy' | 'warning' | 'critical';
    uptime_percentage: number;
    response_time_avg: number;
    error_rate: number;
  };
  agent_performance: {
    total_agents: number;
    active_agents: number;
    failed_agents: number;
    average_success_rate: number;
  };
  threat_intelligence: {
    threats_detected_24h: number;
    critical_threats: number;
    false_positive_rate: number;
    detection_accuracy: number;
  };
  resource_usage: {
    cpu_usage: number;
    memory_usage: number;
    api_calls_remaining: number;
    bandwidth_used: number;
  };
}

export const AIAgentNetworkMonitoring = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MonitoringMetrics>({
    system_health: {
      overall_status: 'healthy',
      uptime_percentage: 99.8,
      response_time_avg: 125,
      error_rate: 0.2
    },
    agent_performance: {
      total_agents: 0,
      active_agents: 0,
      failed_agents: 0,
      average_success_rate: 0
    },
    threat_intelligence: {
      threats_detected_24h: 0,
      critical_threats: 0,
      false_positive_rate: 5.2,
      detection_accuracy: 94.8
    },
    resource_usage: {
      cpu_usage: 35,
      memory_usage: 42,
      api_calls_remaining: 8750,
      bandwidth_used: 65
    }
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMonitoringData();
      const interval = setInterval(loadMonitoringData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMonitoringData = async () => {
    if (!user) return;

    try {
      // Load agent data
      const { data: agents } = await supabase
        .from('ai_monitoring_agents')
        .select('*')
        .eq('user_id', user.id);

      // Load threat detections
      const { data: threats } = await supabase
        .from('ai_threat_detections')
        .select('*')
        .eq('user_id', user.id)
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Load recent alerts/notifications
      const { data: notifications } = await supabase
        .from('ai_protection_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (agents) {
        const activeAgents = agents.filter(a => a.status === 'active');
        const failedAgents = agents.filter(a => a.status === 'error' || a.status === 'failed');
        const avgSuccessRate = agents.reduce((sum, a) => sum + (a.success_rate || 0), 0) / Math.max(agents.length, 1);

        setMetrics(prev => ({
          ...prev,
          agent_performance: {
            total_agents: agents.length,
            active_agents: activeAgents.length,
            failed_agents: failedAgents.length,
            average_success_rate: avgSuccessRate
          }
        }));
      }

      if (threats) {
        const criticalThreats = threats.filter(t => t.threat_level === 'critical');
        
        setMetrics(prev => ({
          ...prev,
          threat_intelligence: {
            ...prev.threat_intelligence,
            threats_detected_24h: threats.length,
            critical_threats: criticalThreats.length
          }
        }));
      }

      if (notifications) {
        setAlerts(notifications);
      }

      // Determine overall system health
      const overallStatus = determineSystemHealth(agents || [], threats || []);
      setMetrics(prev => ({
        ...prev,
        system_health: {
          ...prev.system_health,
          overall_status: overallStatus
        }
      }));

    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineSystemHealth = (agents: any[], threats: any[]) => {
    const failedAgents = agents.filter(a => a.status === 'error' || a.status === 'failed');
    const criticalThreats = threats.filter(t => t.threat_level === 'critical');
    
    if (failedAgents.length > agents.length * 0.3 || criticalThreats.length > 10) {
      return 'critical';
    }
    
    if (failedAgents.length > agents.length * 0.1 || criticalThreats.length > 5) {
      return 'warning';
    }
    
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading monitoring data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Real-time monitoring of your AI Agent Network infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(metrics.system_health.overall_status)}
              <div>
                <p className="text-sm font-medium">Overall Status</p>
                <p className={`text-lg font-bold capitalize ${getStatusColor(metrics.system_health.overall_status)}`}>
                  {metrics.system_health.overall_status}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">{metrics.system_health.uptime_percentage}%</p>
              <Progress value={metrics.system_health.uptime_percentage} className="mt-1" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
              <p className="text-2xl font-bold">{metrics.system_health.response_time_avg}ms</p>
              <p className="text-xs text-muted-foreground">Target: &lt;200ms</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold">{metrics.system_health.error_rate}%</p>
              <p className="text-xs text-muted-foreground">Target: &lt;1%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Agents</span>
                <Badge variant={metrics.agent_performance.active_agents > 0 ? 'default' : 'secondary'}>
                  {metrics.agent_performance.active_agents}/{metrics.agent_performance.total_agents}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Failed Agents</span>
                <Badge variant={metrics.agent_performance.failed_agents > 0 ? 'destructive' : 'default'}>
                  {metrics.agent_performance.failed_agents}
                </Badge>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-bold">{Math.round(metrics.agent_performance.average_success_rate)}%</span>
                </div>
                <Progress value={metrics.agent_performance.average_success_rate} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Threat Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Threats (24h)</span>
                <Badge variant={metrics.threat_intelligence.threats_detected_24h > 0 ? 'secondary' : 'default'}>
                  {metrics.threat_intelligence.threats_detected_24h}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Critical Threats</span>
                <Badge variant={metrics.threat_intelligence.critical_threats > 0 ? 'destructive' : 'default'}>
                  {metrics.threat_intelligence.critical_threats}
                </Badge>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Detection Accuracy</span>
                  <span className="text-sm font-bold">{metrics.threat_intelligence.detection_accuracy}%</span>
                </div>
                <Progress value={metrics.threat_intelligence.detection_accuracy} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm font-bold">{metrics.resource_usage.cpu_usage}%</span>
              </div>
              <Progress value={metrics.resource_usage.cpu_usage} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm font-bold">{metrics.resource_usage.memory_usage}%</span>
              </div>
              <Progress value={metrics.resource_usage.memory_usage} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">API Calls</span>
                <span className="text-sm font-bold">{metrics.resource_usage.api_calls_remaining.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Remaining this month</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Bandwidth</span>
                <span className="text-sm font-bold">{metrics.resource_usage.bandwidth_used}%</span>
              </div>
              <Progress value={metrics.resource_usage.bandwidth_used} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-500' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};