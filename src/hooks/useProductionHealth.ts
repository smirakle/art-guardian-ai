import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  health_checks: Array<{
    service: string;
    status: 'healthy' | 'warning' | 'critical';
    response_time_ms: number;
    details: any;
  }>;
  system_stats: {
    total_users: number;
    active_subscriptions: number;
    total_artwork: number;
    total_matches: number;
    daily_uploads: number;
    last_updated: string;
  };
  summary: {
    total_services: number;
    healthy_services: number;
    warning_services: number;
    critical_services: number;
  };
}

interface PerformanceMetrics {
  avg_response_time: number;
  recent_metrics: any[];
  performance_summary: {
    excellent: number;
    good: number;
    poor: number;
  };
  last_updated: string;
}

export const useProductionHealth = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('production-health-monitor', {
        body: { action: 'full_health_check' }
      });

      if (error) throw error;

      setHealthStatus(data);

      // Show toast for critical issues
      if (data.status === 'critical') {
        toast({
          title: "Critical System Issues Detected",
          description: `${data.summary.critical_services} service(s) are experiencing critical issues`,
          variant: "destructive",
        });
      } else if (data.status === 'warning') {
        toast({
          title: "System Performance Warning",
          description: `${data.summary.warning_services} service(s) are experiencing performance issues`,
        });
      }

      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete system health check",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getSystemStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('production-health-monitor', {
        body: { action: 'system_stats' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }, []);

  const getPerformanceMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('production-health-monitor', {
        body: { action: 'performance_metrics' }
      });

      if (error) throw error;
      
      setPerformanceMetrics(data);
      return data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }, []);

  // Auto-refresh health status every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        runHealthCheck();
        getPerformanceMetrics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading, runHealthCheck, getPerformanceMetrics]);

  // Initial load
  useEffect(() => {
    runHealthCheck();
    getPerformanceMetrics();
  }, [runHealthCheck, getPerformanceMetrics]);

  return {
    healthStatus,
    performanceMetrics,
    loading,
    runHealthCheck,
    getSystemStats,
    getPerformanceMetrics,
    isHealthy: healthStatus?.status === 'healthy',
    hasCriticalIssues: healthStatus?.status === 'critical',
    hasWarnings: healthStatus?.status === 'warning'
  };
};