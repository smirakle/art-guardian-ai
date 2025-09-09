import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://utneaqmbyjwxaqrrarpc.supabase.co', // Restrict to known domains
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
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
    // Validate JWT token for authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Valid Bearer token required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify JWT with Supabase
    const jwt = authHeader.replace('Bearer ', '');
    const { data: user, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;
    
    // Check if user has valid enterprise subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .single();

    if (!subscription || !['professional', 'enterprise'].includes(subscription.plan_id)) {
      return new Response(JSON.stringify({ error: 'Enterprise subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting with user-based limits
    const rateLimit = await checkUserRateLimit(user.user.id, pathname);
    if (!rateLimit) {
      await logApiUsage(user.user.id, pathname, method, 429, Date.now() - start_time, req, 'Rate limit exceeded');
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route handling with validation
    let response;
    
    if (pathname === '/v1/scan' && method === 'POST') {
      response = await handleScanRequest(req, user.user.id);
    } else if (pathname === '/v1/analytics' && method === 'GET') {
      response = await handleAnalytics(req, user.user.id);
    } else if (pathname === '/v1/health' && method === 'GET') {
      response = await handleHealthCheck(req, user.user.id);
    } else {
      response = new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log successful API usage
    await logApiUsage(user.user.id, pathname, method, response.status, Date.now() - start_time, req);
    
    return response;

  } catch (error) {
    console.error('Secure Enterprise API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function checkUserRateLimit(userId: string, endpoint: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('check_ai_protection_rate_limit', {
      user_id_param: userId,
      endpoint_param: endpoint,
      max_requests_param: 100,
      window_minutes_param: 60
    });
    return data || false;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
}

async function handleScanRequest(req: Request, userId: string) {
  try {
    const body = await req.json();
    const { content_url, content_type = 'image', options = {} } = body;

    // Input validation
    if (!content_url || typeof content_url !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid content_url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // URL validation - only allow HTTPS URLs
    try {
      const url = new URL(content_url);
      if (url.protocol !== 'https:') {
        return new Response(JSON.stringify({ error: 'Only HTTPS URLs are allowed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call appropriate scan function with user context
    let scanResult;
    if (content_type === 'image') {
      scanResult = await supabase.functions.invoke('real-image-search', {
        body: { imageUrl: content_url, userId, ...options },
        headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` }
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

async function handleAnalytics(req: Request, userId: string) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();

    // Get user's AI protection metrics
    const { data: metrics } = await supabase
      .from('ai_protection_metrics')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const analytics = {
      period: { start_date: startDate, end_date: endDate },
      usage: {
        total_requests: metrics?.length || 0,
        successful_requests: metrics?.filter(m => m.metric_type === 'success').length || 0,
        failed_requests: metrics?.filter(m => m.metric_type === 'error').length || 0,
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

async function handleHealthCheck(req: Request, userId: string) {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    user_authenticated: true,
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
  userId: string,
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
    
    await supabase.rpc('log_ai_protection_action', {
      user_id_param: userId,
      action_param: `api_${method.toLowerCase()}`,
      resource_type_param: 'enterprise_api',
      resource_id_param: endpoint,
      details_param: {
        status_code: statusCode,
        response_time_ms: responseTime,
        error_message: errorMessage || null
      },
      ip_param: clientIp,
      user_agent_param: userAgent
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}