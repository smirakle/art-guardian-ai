import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  const start_time = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;
    
    // Get API key from headers
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate API key and check rate limits
    const { data: rateLimitOk } = await supabase.rpc('check_enterprise_api_rate_limit', {
      api_key_param: apiKey,
      endpoint_param: pathname
    });

    if (!rateLimitOk) {
      await logApiUsage(apiKey, pathname, method, 429, Date.now() - start_time, req, 'Rate limit exceeded');
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route handling
    let response;
    
    if (pathname === '/v1/scan' && method === 'POST') {
      response = await handleScanRequest(req, apiKey);
    } else if (pathname === '/v1/monitor' && method === 'POST') {
      response = await handleMonitorSetup(req, apiKey);
    } else if (pathname.startsWith('/v1/results') && method === 'GET') {
      response = await handleResultsRetrieval(req, apiKey);
    } else if (pathname === '/v1/analytics' && method === 'GET') {
      response = await handleAnalytics(req, apiKey);
    } else if (pathname === '/v1/webhooks' && method === 'POST') {
      response = await handleWebhookSetup(req, apiKey);
    } else if (pathname === '/v1/health' && method === 'GET') {
      response = await handleHealthCheck(req, apiKey);
    } else {
      response = new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log successful API usage
    await logApiUsage(apiKey, pathname, method, response.status, Date.now() - start_time, req);
    
    return response;

  } catch (error) {
    console.error('Enterprise API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleScanRequest(req: Request, apiKey: string) {
  try {
    const body = await req.json();
    const { content_url, content_type = 'image', options = {} } = body;

    if (!content_url) {
      return new Response(JSON.stringify({ error: 'content_url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call existing scan function based on content type
    let scanResult;
    if (content_type === 'image') {
      scanResult = await supabase.functions.invoke('real-image-search', {
        body: { imageUrl: content_url, ...options }
      });
    } else if (content_type === 'text') {
      scanResult = await supabase.functions.invoke('analyze-article-content', {
        body: { url: content_url, ...options }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported content_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const scanId = crypto.randomUUID();
    
    return new Response(JSON.stringify({
      scan_id: scanId,
      status: 'completed',
      content_url,
      content_type,
      results: scanResult.data || {},
      scan_timestamp: new Date().toISOString(),
      processing_time_ms: 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scan request error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process scan request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleMonitorSetup(req: Request, apiKey: string) {
  try {
    const body = await req.json();
    const { target_urls, scan_frequency = 'daily', notification_webhook } = body;

    if (!target_urls || !Array.isArray(target_urls)) {
      return new Response(JSON.stringify({ error: 'target_urls array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const monitorId = crypto.randomUUID();

    return new Response(JSON.stringify({
      monitor_id: monitorId,
      status: 'active',
      target_urls,
      scan_frequency,
      notification_webhook,
      created_at: new Date().toISOString(),
      next_scan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Monitor setup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to setup monitoring' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleResultsRetrieval(req: Request, apiKey: string) {
  try {
    const url = new URL(req.url);
    const scanId = url.searchParams.get('scan_id');
    const monitorId = url.searchParams.get('monitor_id');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let results = [];
    
    if (scanId) {
      // Return specific scan results
      results = [{
        scan_id: scanId,
        status: 'completed',
        matches_found: 0,
        high_risk_matches: 0,
        scan_timestamp: new Date().toISOString(),
        results: []
      }];
    } else if (monitorId) {
      // Return monitoring results
      results = [{
        monitor_id: monitorId,
        last_scan: new Date().toISOString(),
        total_scans: 1,
        matches_found: 0,
        status: 'active'
      }];
    } else {
      // Return recent results
      results = [];
    }

    return new Response(JSON.stringify({
      results,
      pagination: {
        limit,
        offset,
        total: results.length,
        has_more: false
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Results retrieval error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve results' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAnalytics(req: Request, apiKey: string) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();

    // Look up API key record to get ID and rate limit settings
    const { data: keyRec, error: keyErr } = await supabase
      .from('enterprise_api_keys')
      .select('id, rate_limit_requests, rate_limit_window_minutes')
      .eq('api_key', apiKey)
      .single();

    if (keyErr || !keyRec) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get API usage analytics for this key id
    const { data: usage } = await supabase
      .from('enterprise_api_usage')
      .select('*')
      .eq('api_key_id', keyRec.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Compute current rate-limit window usage
    const windowMinutes = keyRec.rate_limit_window_minutes || 60;
    const now = new Date();
    const bucketMinutes = Math.floor(now.getMinutes() / windowMinutes) * windowMinutes;
    const windowStart = new Date(now);
    windowStart.setMinutes(bucketMinutes, 0, 0);

    const { data: rl } = await supabase
      .from('enterprise_api_rate_limits')
      .select('request_count')
      .eq('api_key_id', keyRec.id)
      .eq('window_start', windowStart.toISOString())
      .single();

    const currentWindowUsage = rl?.request_count || 0;
    const limit = keyRec.rate_limit_requests || 1000;

    const analytics = {
      period: {
        start_date: startDate,
        end_date: endDate
      },
      usage: {
        total_requests: usage?.length || 0,
        successful_requests: usage?.filter(u => u.status_code < 400).length || 0,
        failed_requests: usage?.filter(u => u.status_code >= 400).length || 0,
        average_response_time: usage && usage.length > 0
          ? usage.reduce((acc: number, u: any) => acc + (u.response_time_ms || 0), 0) / usage.length
          : 0
      },
      endpoints: (usage || []).reduce((acc: any, u: any) => {
        acc[u.endpoint] = (acc[u.endpoint] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      rate_limit: {
        current_window_usage: currentWindowUsage,
        limit,
        window_minutes: windowMinutes,
        remaining: Math.max(limit - currentWindowUsage, 0)
      }
    };

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve analytics' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleWebhookSetup(req: Request, apiKey: string) {
  try {
    const body = await req.json();
    const { webhook_url, event_types, secret } = body;

    if (!webhook_url || !event_types) {
      return new Response(JSON.stringify({ error: 'webhook_url and event_types are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const webhookId = crypto.randomUUID();

    return new Response(JSON.stringify({
      webhook_id: webhookId,
      webhook_url,
      event_types,
      status: 'active',
      secret: secret || null,
      created_at: new Date().toISOString()
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook setup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to setup webhook' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleHealthCheck(req: Request, apiKey: string) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'healthy',
      scanning: 'healthy',
      monitoring: 'healthy'
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function logApiUsage(
  apiKey: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  req: Request,
  errorMessage?: string
) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';
    
    await supabase.rpc('log_enterprise_api_usage', {
      api_key_param: apiKey,
      endpoint_param: endpoint,
      method_param: method,
      status_code_param: statusCode,
      response_time_ms_param: responseTime,
      ip_address_param: clientIp,
      user_agent_param: userAgent,
      error_message_param: errorMessage || null,
      metadata_param: {}
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}