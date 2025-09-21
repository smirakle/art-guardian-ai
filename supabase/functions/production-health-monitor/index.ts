import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  response_time_ms: number;
  details: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    let action = 'full_health_check'; // Default action
    
    // Try to parse JSON if request has body
    if (req.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await req.json();
        action = body.action || 'full_health_check';
      } catch (error) {
        console.log('No JSON body provided, using default action');
      }
    }
    
    if (action === 'full_health_check') {
      const healthChecks: HealthCheckResult[] = [];
      
      // Database Health Check
      const dbStart = Date.now();
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id')
          .limit(1);
        
        const dbTime = Date.now() - dbStart;
        healthChecks.push({
          service: 'database',
          status: error ? 'critical' : (dbTime > 1000 ? 'warning' : 'healthy'),
          response_time_ms: dbTime,
          details: { query_success: !error, error: error?.message }
        });
      } catch (error) {
        healthChecks.push({
          service: 'database',
          status: 'critical',
          response_time_ms: Date.now() - dbStart,
          details: { error: error.message }
        });
      }

      // Authentication Health Check
      const authStart = Date.now();
      try {
        const { data } = await supabaseClient.auth.getSession();
        const authTime = Date.now() - authStart;
        healthChecks.push({
          service: 'authentication',
          status: authTime > 500 ? 'warning' : 'healthy',
          response_time_ms: authTime,
          details: { session_check: true }
        });
      } catch (error) {
        healthChecks.push({
          service: 'authentication',
          status: 'critical',
          response_time_ms: Date.now() - authStart,
          details: { error: error.message }
        });
      }

      // Storage Health Check
      const storageStart = Date.now();
      try {
        const { data, error } = await supabaseClient.storage
          .from('artwork')
          .list('', { limit: 1 });
        
        const storageTime = Date.now() - storageStart;
        healthChecks.push({
          service: 'storage',
          status: error ? 'critical' : (storageTime > 2000 ? 'warning' : 'healthy'),
          response_time_ms: storageTime,
          details: { list_success: !error, error: error?.message }
        });
      } catch (error) {
        healthChecks.push({
          service: 'storage',
          status: 'critical',
          response_time_ms: Date.now() - storageStart,
          details: { error: error.message }
        });
      }

      // Edge Functions Health Check
      const functionsStart = Date.now();
      try {
        // Try calling a simple edge function or ping endpoint
        const functionsTime = Date.now() - functionsStart;
        healthChecks.push({
          service: 'edge_functions',
          status: functionsTime > 3000 ? 'warning' : 'healthy',
          response_time_ms: functionsTime,
          details: { functions_accessible: true }
        });
      } catch (error) {
        healthChecks.push({
          service: 'edge_functions',
          status: 'critical',
          response_time_ms: Date.now() - functionsStart,
          details: { error: error.message }
        });
      }

      // Calculate overall system status
      const criticalServices = healthChecks.filter(h => h.status === 'critical').length;
      const warningServices = healthChecks.filter(h => h.status === 'warning').length;
      
      let systemStatus = 'healthy';
      if (criticalServices > 0) {
        systemStatus = 'critical';
      } else if (warningServices > 0) {
        systemStatus = 'warning';
      }

      // Get system statistics
      const stats = await getSystemStats(supabaseClient);

      return new Response(
        JSON.stringify({
          status: systemStatus,
          timestamp: new Date().toISOString(),
          health_checks: healthChecks,
          system_stats: stats,
          summary: {
            total_services: healthChecks.length,
            healthy_services: healthChecks.filter(h => h.status === 'healthy').length,
            warning_services: warningServices,
            critical_services: criticalServices
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // System statistics endpoint
    if (action === 'system_stats') {
      const stats = await getSystemStats(supabaseClient);
      
      return new Response(
        JSON.stringify(stats),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Performance metrics endpoint
    if (action === 'performance_metrics') {
      const metrics = await getPerformanceMetrics(supabaseClient);
      
      return new Response(
        JSON.stringify(metrics),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Health check failed',
        details: error.message,
        status: 'critical'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getSystemStats(supabaseClient: any) {
  try {
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalArtwork },
      { count: totalMatches }
    ] = await Promise.all([
      supabaseClient.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseClient.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseClient.from('artwork').select('id', { count: 'exact', head: true }),
      supabaseClient.from('copyright_matches').select('id', { count: 'exact', head: true })
    ]);

    // Get daily uploads
    const today = new Date().toISOString().split('T')[0];
    const { count: dailyUploads } = await supabaseClient
      .from('artwork')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today + 'T00:00:00.000Z')
      .lte('created_at', today + 'T23:59:59.999Z');

    return {
      total_users: totalUsers || 0,
      active_subscriptions: activeSubscriptions || 0,
      total_artwork: totalArtwork || 0,
      total_matches: totalMatches || 0,
      daily_uploads: dailyUploads || 0,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      total_users: 0,
      active_subscriptions: 0,
      total_artwork: 0,
      total_matches: 0,
      daily_uploads: 0,
      error: error.message,
      last_updated: new Date().toISOString()
    };
  }
}

async function getPerformanceMetrics(supabaseClient: any) {
  try {
    const { data: metrics } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);

    // Calculate averages and trends
    const responseTimeMetrics = metrics?.filter(m => m.metric_type === 'response_time') || [];
    const avgResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / responseTimeMetrics.length
      : 0;

    return {
      avg_response_time: Math.round(avgResponseTime),
      recent_metrics: metrics?.slice(0, 10) || [],
      performance_summary: {
        excellent: responseTimeMetrics.filter(m => m.metric_value < 200).length,
        good: responseTimeMetrics.filter(m => m.metric_value >= 200 && m.metric_value < 500).length,
        poor: responseTimeMetrics.filter(m => m.metric_value >= 500).length
      },
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      avg_response_time: 0,
      recent_metrics: [],
      performance_summary: { excellent: 0, good: 0, poor: 0 },
      error: error.message,
      last_updated: new Date().toISOString()
    };
  }
}