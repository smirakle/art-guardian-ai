import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'critical' | 'degraded';
  timestamp: string;
  uptime: number;
  metrics: {
    database_health: 'healthy' | 'degraded';
    edge_functions_health: 'healthy' | 'degraded';
    api_response_time: number;
    error_rate: number;
    active_connections: number;
    memory_usage: number;
    cpu_usage: number;
  };
  services: {
    ai_agent_network: 'operational' | 'degraded' | 'down';
    real_time_monitoring: 'operational' | 'degraded' | 'down';
    blockchain_verification: 'operational' | 'degraded' | 'down';
    security_scanner: 'operational' | 'degraded' | 'down';
  };
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }>;
  version: string;
  environment: 'production' | 'staging' | 'development';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting production health check...');

    const startTime = Date.now();
    
    // Test database connectivity and performance
    const dbStartTime = Date.now();
    const { data: dbTest, error: dbError } = await supabase
      .from('production_metrics')
      .select('count')
      .limit(1);
    const dbResponseTime = Date.now() - dbStartTime;

    console.log(`Database response time: ${dbResponseTime}ms`);

    // Get recent error counts
    const { data: errorLogs } = await supabase
      .from('error_logs')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    const errorCount = errorLogs?.length || 0;
    const criticalErrors = errorLogs?.filter(log => log.severity === 'critical').length || 0;

    console.log(`Errors in last hour: ${errorCount}, Critical: ${criticalErrors}`);

    // Check AI agent network status
    const { data: activeAgents } = await supabase
      .from('ai_monitoring_agents')
      .select('status, last_scan')
      .eq('status', 'active')
      .gte('last_scan', new Date(Date.now() - 300000).toISOString()); // Last 5 minutes

    const activeAgentCount = activeAgents?.length || 0;

    // Check real-time monitoring sessions
    const { data: monitoringSessions } = await supabase
      .from('realtime_monitoring_sessions')
      .select('status')
      .eq('status', 'active')
      .gte('updated_at', new Date(Date.now() - 300000).toISOString());

    const activeSessionCount = monitoringSessions?.length || 0;

    // Calculate overall health metrics
    const errorRate = errorCount / Math.max(1, activeAgentCount + activeSessionCount);
    const databaseHealth = dbResponseTime < 500 && !dbError ? 'healthy' : 'degraded';
    
    // Determine service status
    const aiAgentStatus = activeAgentCount > 0 ? 'operational' : 'degraded';
    const realtimeStatus = activeSessionCount > 0 ? 'operational' : 'degraded';
    
    // Generate alerts based on thresholds
    const alerts: HealthCheckResponse['alerts'] = [];
    
    if (criticalErrors > 0) {
      alerts.push({
        type: 'critical_errors',
        severity: 'critical',
        message: `${criticalErrors} critical errors detected in the last hour`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (dbResponseTime > 1000) {
      alerts.push({
        type: 'slow_database',
        severity: 'high',
        message: `Database response time is ${dbResponseTime}ms (threshold: 1000ms)`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (activeAgentCount === 0) {
      alerts.push({
        type: 'no_active_agents',
        severity: 'medium',
        message: 'No AI monitoring agents are currently active',
        timestamp: new Date().toISOString()
      });
    }

    // Determine overall status
    let overallStatus: HealthCheckResponse['status'] = 'healthy';
    if (criticalErrors > 5 || dbResponseTime > 2000) {
      overallStatus = 'critical';
    } else if (criticalErrors > 0 || dbResponseTime > 1000 || errorRate > 0.1) {
      overallStatus = 'warning';
    } else if (activeAgentCount === 0 || dbResponseTime > 500) {
      overallStatus = 'degraded';
    }

    // Log production metrics
    await supabase.rpc('log_production_metric', {
      metric_type_param: 'health_check',
      metric_name_param: 'overall_status',
      metric_value_param: overallStatus === 'healthy' ? 1 : 0,
      metadata_param: {
        db_response_time: dbResponseTime,
        error_count: errorCount,
        active_agents: activeAgentCount,
        active_sessions: activeSessionCount
      }
    });

    const healthResponse: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      metrics: {
        database_health: databaseHealth,
        edge_functions_health: 'healthy',
        api_response_time: dbResponseTime,
        error_rate: errorRate,
        active_connections: activeAgentCount + activeSessionCount,
        memory_usage: 0, // Not available in edge functions
        cpu_usage: 0 // Not available in edge functions
      },
      services: {
        ai_agent_network: aiAgentStatus,
        real_time_monitoring: realtimeStatus,
        blockchain_verification: 'operational',
        security_scanner: 'operational'
      },
      alerts,
      version: '1.0.0',
      environment: 'production'
    };

    console.log('Health check completed:', healthResponse.status);

    return new Response(
      JSON.stringify(healthResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: overallStatus === 'critical' ? 503 : 200
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse: HealthCheckResponse = {
      status: 'critical',
      timestamp: new Date().toISOString(),
      uptime: 0,
      metrics: {
        database_health: 'degraded',
        edge_functions_health: 'degraded',
        api_response_time: 0,
        error_rate: 1,
        active_connections: 0,
        memory_usage: 0,
        cpu_usage: 0
      },
      services: {
        ai_agent_network: 'down',
        real_time_monitoring: 'down',
        blockchain_verification: 'down',
        security_scanner: 'down'
      },
      alerts: [{
        type: 'health_check_failure',
        severity: 'critical',
        message: `Health check failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }],
      version: '1.0.0',
      environment: 'production'
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
});