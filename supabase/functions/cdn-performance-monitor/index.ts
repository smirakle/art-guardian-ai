import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CDNRequest {
  action: 'monitor' | 'get_metrics' | 'configure';
  domain?: string;
  provider?: string;
  configuration?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, domain, provider, configuration }: CDNRequest = await req.json();

    if (action === 'get_metrics') {
      // Get CDN performance metrics
      const { data: configs } = await supabaseClient
        .from('cdn_configurations')
        .select('*')
        .eq('is_active', true);

      const { data: metrics } = await supabaseClient
        .from('cdn_performance_metrics')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(100);

      const { data: analytics } = await supabaseClient
        .from('cdn_cache_analytics')
        .select('*')
        .gte('requested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('requested_at', { ascending: false });

      // Calculate aggregate metrics
      const aggregateMetrics = calculateAggregateMetrics(metrics || []);
      const cacheAnalytics = calculateCacheAnalytics(analytics || []);

      return new Response(
        JSON.stringify({ 
          configurations: configs,
          metrics: aggregateMetrics,
          cache: cacheAnalytics,
          recentMetrics: metrics?.slice(0, 10)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'monitor' && domain) {
      // Monitor CDN performance for a domain
      const performance = await measureCDNPerformance(domain);
      
      // Get or create CDN configuration
      let { data: config } = await supabaseClient
        .from('cdn_configurations')
        .select('*')
        .eq('domain', domain)
        .single();

      if (!config) {
        const { data: newConfig } = await supabaseClient
          .from('cdn_configurations')
          .insert({
            domain,
            provider: 'lovable', // Default provider
            status: 'active'
          })
          .select()
          .single();
        config = newConfig;
      }

      // Store performance metrics
      if (config) {
        await supabaseClient
          .from('cdn_performance_metrics')
          .insert({
            cdn_config_id: config.id,
            domain,
            region: performance.region,
            response_time_ms: performance.responseTime,
            cache_hit_ratio: performance.cacheHitRatio,
            bandwidth_bytes: performance.bandwidth,
            requests_count: performance.requests,
            error_count: performance.errors,
            status_2xx: performance.status2xx,
            status_3xx: performance.status3xx,
            status_4xx: performance.status4xx,
            status_5xx: performance.status5xx,
            metadata: performance.metadata
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          performance,
          config
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'configure' && domain && provider) {
      // Create or update CDN configuration
      const { data: config, error } = await supabaseClient
        .from('cdn_configurations')
        .upsert({
          domain,
          provider,
          configuration: configuration || {},
          status: 'active'
        }, {
          onConflict: 'domain'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true,
          configuration: config
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cdn-performance-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function measureCDNPerformance(domain: string) {
  const startTime = Date.now();
  
  try {
    // Measure actual response time
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });
    
    const responseTime = Date.now() - startTime;
    
    // Extract CDN headers
    const cacheStatus = response.headers.get('cf-cache-status') || 
                       response.headers.get('x-cache') ||
                       response.headers.get('x-vercel-cache') ||
                       'UNKNOWN';
    
    const cdnRay = response.headers.get('cf-ray') || '';
    const server = response.headers.get('server') || '';
    
    return {
      responseTime,
      region: extractRegion(cdnRay, server),
      cacheHitRatio: cacheStatus === 'HIT' ? 100 : 0,
      bandwidth: 0, // Would need traffic data from CDN provider
      requests: 1,
      errors: response.ok ? 0 : 1,
      status2xx: response.status >= 200 && response.status < 300 ? 1 : 0,
      status3xx: response.status >= 300 && response.status < 400 ? 1 : 0,
      status4xx: response.status >= 400 && response.status < 500 ? 1 : 0,
      status5xx: response.status >= 500 ? 1 : 0,
      metadata: {
        cacheStatus,
        cdnRay,
        server,
        httpVersion: '2.0', // Most modern CDNs use HTTP/2
        ssl: true
      }
    };
  } catch (error) {
    return {
      responseTime: Date.now() - startTime,
      region: 'unknown',
      cacheHitRatio: 0,
      bandwidth: 0,
      requests: 1,
      errors: 1,
      status2xx: 0,
      status3xx: 0,
      status4xx: 0,
      status5xx: 1,
      metadata: {
        error: error.message
      }
    };
  }
}

function extractRegion(cdnRay: string, server: string): string {
  // Extract region from Cloudflare Ray ID or server header
  if (cdnRay) {
    const parts = cdnRay.split('-');
    return parts[parts.length - 1] || 'unknown';
  }
  if (server.includes('Vercel')) return 'vercel-edge';
  if (server.includes('Cloudflare')) return 'cloudflare';
  return 'unknown';
}

function calculateAggregateMetrics(metrics: any[]) {
  if (metrics.length === 0) return null;

  const totalRequests = metrics.reduce((sum, m) => sum + (m.requests_count || 0), 0);
  const totalErrors = metrics.reduce((sum, m) => sum + (m.error_count || 0), 0);
  const avgResponseTime = metrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / metrics.length;
  const avgCacheHitRatio = metrics.reduce((sum, m) => sum + (m.cache_hit_ratio || 0), 0) / metrics.length;

  return {
    totalRequests,
    totalErrors,
    errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
    avgResponseTime: Math.round(avgResponseTime),
    avgCacheHitRatio: Math.round(avgCacheHitRatio),
    uptime: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100
  };
}

function calculateCacheAnalytics(analytics: any[]) {
  if (analytics.length === 0) return null;

  const totalRequests = analytics.length;
  const cacheHits = analytics.filter(a => a.cache_hit).length;
  const cacheHitRatio = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

  const assetBreakdown = analytics.reduce((acc, a) => {
    const type = a.asset_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRequests,
    cacheHits,
    cacheMisses: totalRequests - cacheHits,
    cacheHitRatio: Math.round(cacheHitRatio),
    assetBreakdown
  };
}
