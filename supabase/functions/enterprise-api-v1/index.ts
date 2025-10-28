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

    // Get API key record
    const { data: keyRec } = await supabase
      .from('enterprise_api_keys')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single();

    if (!keyRec) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call existing scan function based on content type
    const scanStart = Date.now();
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

    const processingTime = Date.now() - scanStart;

    // Store scan results in database
    const { data: scanRecord, error: scanError } = await supabase
      .from('partner_scan_results')
      .insert({
        api_key_id: keyRec.id,
        user_id: keyRec.user_id,
        scan_type: content_type,
        content_url,
        status: 'completed',
        matches_found: scanResult.data?.matches?.length || 0,
        threat_level: scanResult.data?.threat_level || 'low',
        scan_data: scanResult.data || {}
      })
      .select()
      .single();

    if (scanError) {
      console.error('Failed to save scan results:', scanError);
    }
    
    return new Response(JSON.stringify({
      scan_id: scanRecord?.id || crypto.randomUUID(),
      status: 'completed',
      content_url,
      content_type,
      results: scanResult.data || {},
      scan_timestamp: new Date().toISOString(),
      processing_time_ms: processingTime
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
    const { target_urls, scan_frequency = 'daily', notification_webhook, monitor_type = 'content' } = body;

    if (!target_urls || !Array.isArray(target_urls)) {
      return new Response(JSON.stringify({ error: 'target_urls array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get API key record
    const { data: keyRec } = await supabase
      .from('enterprise_api_keys')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single();

    if (!keyRec) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate next scan time based on frequency
    const nextScanTime = new Date();
    switch(scan_frequency) {
      case 'hourly':
        nextScanTime.setHours(nextScanTime.getHours() + 1);
        break;
      case 'weekly':
        nextScanTime.setDate(nextScanTime.getDate() + 7);
        break;
      case 'monthly':
        nextScanTime.setMonth(nextScanTime.getMonth() + 1);
        break;
      default: // daily
        nextScanTime.setDate(nextScanTime.getDate() + 1);
    }

    // Create monitoring jobs for each target URL
    const monitoringJobs = [];
    for (const url of target_urls) {
      const { data: job, error } = await supabase
        .from('partner_monitoring_jobs')
        .insert({
          api_key_id: keyRec.id,
          user_id: keyRec.user_id,
          content_url: url,
          monitor_type,
          scan_frequency,
          webhook_url: notification_webhook,
          next_scan_at: nextScanTime.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create monitoring job:', error);
      } else {
        monitoringJobs.push(job);
      }
    }

    return new Response(JSON.stringify({
      monitor_jobs: monitoringJobs.map(job => ({
        monitor_id: job.id,
        content_url: job.content_url,
        status: job.status
      })),
      status: 'active',
      target_urls,
      scan_frequency,
      notification_webhook,
      created_at: new Date().toISOString(),
      next_scan: nextScanTime.toISOString()
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

    // Get API key record
    const { data: keyRec } = await supabase
      .from('enterprise_api_keys')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (!keyRec) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let results = [];
    let total = 0;
    
    if (scanId) {
      // Return specific scan result
      const { data: scanResult, error } = await supabase
        .from('partner_scan_results')
        .select('*')
        .eq('id', scanId)
        .eq('api_key_id', keyRec.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Scan not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      results = [{
        scan_id: scanResult.id,
        status: scanResult.status,
        content_url: scanResult.content_url,
        scan_type: scanResult.scan_type,
        matches_found: scanResult.matches_found,
        threat_level: scanResult.threat_level,
        scan_timestamp: scanResult.scanned_at,
        results: scanResult.scan_data
      }];
      total = 1;
    } else if (monitorId) {
      // Return monitoring job details and history
      const { data: job } = await supabase
        .from('partner_monitoring_jobs')
        .select('*')
        .eq('id', monitorId)
        .eq('api_key_id', keyRec.id)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Monitor not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get scan results for this monitoring job
      const { data: scans } = await supabase
        .from('partner_scan_results')
        .select('*')
        .eq('monitoring_job_id', monitorId)
        .eq('api_key_id', keyRec.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results = [{
        monitor_id: job.id,
        content_url: job.content_url,
        status: job.status,
        scan_frequency: job.scan_frequency,
        last_scan: job.last_scan_at,
        next_scan: job.next_scan_at,
        total_scans: job.total_scans,
        matches_found: job.matches_found,
        recent_scans: scans || []
      }];
      total = 1;
    } else {
      // Return recent scan results
      const { data: scans, count } = await supabase
        .from('partner_scan_results')
        .select('*', { count: 'exact' })
        .eq('api_key_id', keyRec.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results = (scans || []).map(scan => ({
        scan_id: scan.id,
        status: scan.status,
        content_url: scan.content_url,
        scan_type: scan.scan_type,
        matches_found: scan.matches_found,
        threat_level: scan.threat_level,
        scan_timestamp: scan.scanned_at,
        monitoring_job_id: scan.monitoring_job_id
      }));
      total = count || 0;
    }

    return new Response(JSON.stringify({
      results,
      pagination: {
        limit,
        offset,
        total,
        has_more: offset + limit < total
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

    if (!Array.isArray(event_types) || event_types.length === 0) {
      return new Response(JSON.stringify({ error: 'event_types must be a non-empty array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get API key record
    const { data: keyRec } = await supabase
      .from('enterprise_api_keys')
      .select('id, user_id')
      .eq('api_key', apiKey)
      .single();

    if (!keyRec) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create webhook in database
    const { data: webhook, error: webhookError } = await supabase
      .from('partner_webhooks')
      .insert({
        api_key_id: keyRec.id,
        user_id: keyRec.user_id,
        webhook_url,
        events: event_types,
        secret_key: secret || crypto.randomUUID(),
        is_active: true
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Failed to create webhook:', webhookError);
      return new Response(JSON.stringify({ error: 'Failed to create webhook' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      webhook_id: webhook.id,
      webhook_url: webhook.webhook_url,
      event_types: webhook.events,
      status: 'active',
      secret: webhook.secret_key,
      created_at: webhook.created_at
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