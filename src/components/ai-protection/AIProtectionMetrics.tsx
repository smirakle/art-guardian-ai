import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Shield, AlertTriangle, TrendingUp, Clock, FileCheck } from 'lucide-react';

interface MetricsData {
  totalProtectedFiles: number;
  activeViolations: number;
  resolvedViolations: number;
  protectionEffectiveness: number;
  avgResponseTime: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

const AIProtectionMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalProtectedFiles: 0,
    activeViolations: 0,
    resolvedViolations: 0,
    protectionEffectiveness: 0,
    avgResponseTime: 0,
    threatLevel: 'low'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    // Set up real-time updates
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Get protected files count
      const { data: protectedFiles, error: filesError } = await supabase
        .from('ai_protection_records')
        .select('id')
        .eq('is_active', true);

      if (filesError) throw filesError;

      // Get violations data
      const { data: violations, error: violationsError } = await supabase
        .from('ai_training_violations')
        .select('status, confidence_score, detected_at');

      if (violationsError) throw violationsError;

      const activeViolations = violations?.filter(v => v.status === 'pending').length || 0;
      const resolvedViolations = violations?.filter(v => v.status === 'resolved').length || 0;
      const totalViolations = violations?.length || 0;

      // Calculate protection effectiveness
      const highConfidenceViolations = violations?.filter(v => v.confidence_score > 0.8).length || 0;
      const effectiveness = totalViolations > 0 
        ? Math.max(0, 100 - (highConfidenceViolations / totalViolations * 100))
        : 100;

      // Calculate threat level
      const recentViolations = violations?.filter(v => 
        new Date(v.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (recentViolations > 20) threatLevel = 'critical';
      else if (recentViolations > 10) threatLevel = 'high';
      else if (recentViolations > 5) threatLevel = 'medium';

      // Calculate average response time (simulate for now)
      const avgResponseTime = 2.5; // hours

      setMetrics({
        totalProtectedFiles: protectedFiles?.length || 0,
        activeViolations,
        resolvedViolations,
        protectionEffectiveness: Math.round(effectiveness),
        avgResponseTime,
        threatLevel
      });

      // Record metrics in database
      await supabase.rpc('record_ai_protection_metric', {
        metric_type_param: 'system_health',
        metric_name_param: 'protection_effectiveness',
        metric_value_param: effectiveness,
        metadata_param: {
          total_files: protectedFiles?.length || 0,
          active_violations: activeViolations,
          threat_level: threatLevel
        }
      });

    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Activity className="h-4 w-4 text-orange-500" />;
      case 'low': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Files</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProtectedFiles}</div>
            <p className="text-xs text-muted-foreground">
              Total files under AI protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.activeViolations}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Violations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.resolvedViolations}</div>
            <p className="text-xs text-muted-foreground">
              Successfully handled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Effectiveness</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.protectionEffectiveness}%</div>
            <Progress value={metrics.protectionEffectiveness} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on violation prevention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Time to violation detection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            {getThreatLevelIcon(metrics.threatLevel)}
          </CardHeader>
          <CardContent>
            <Badge variant={getThreatLevelColor(metrics.threatLevel)} className="text-sm font-medium">
              {metrics.threatLevel.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Current system threat assessment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIProtectionMetrics;