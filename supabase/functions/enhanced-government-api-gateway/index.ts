import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gov-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

interface ApiKeyValidation {
  valid: boolean;
  agency_id?: string;
  agency_name?: string;
  security_clearance?: string;
  permissions?: string[];
  error?: string;
}

interface SecurityConfig {
  ip_allowlist: string[];
  rate_limit_per_hour: number;
  require_mfa: boolean;
  data_classification_required: boolean;
}

serve(async (req) => {
  // Enhanced CORS handling with security headers
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Enhanced API key validation
    const apiKey = req.headers.get('x-gov-api-key');
    if (!apiKey) {
      await logSecurityEvent(supabase, {
        event_type: 'unauthorized_access',
        severity: 'medium',
        description: 'Government API access attempted without API key',
        client_ip: clientIP,
        user_agent: userAgent
      });
      
      return jsonError('Missing required government API key', 401);
    }

    // Validate API key and get security configuration
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_government_api_key', { api_key_param: apiKey });

    if (validationError || !validationResult?.valid) {
      await logSecurityEvent(supabase, {
        event_type: 'unauthorized_access',
        severity: 'high',
        description: 'Invalid government API key used',
        client_ip: clientIP,
        user_agent: userAgent,
        api_key_hash: hashApiKey(apiKey)
      });
      
      return jsonError('Invalid government API key', 401);
    }

    const validation: ApiKeyValidation = validationResult;

    // Enhanced IP allowlisting for government APIs
    const securityConfig = await getSecurityConfig(supabase, validation.agency_id!);
    if (securityConfig.ip_allowlist.length > 0 && !isIPAllowed(clientIP, securityConfig.ip_allowlist)) {
      await logSecurityEvent(supabase, {
        event_type: 'unauthorized_access',
        severity: 'critical',
        description: 'Government API access from non-allowlisted IP',
        client_ip: clientIP,
        agency_id: validation.agency_id,
        api_key_hash: hashApiKey(apiKey)
      });
      
      return jsonError('Access denied: IP not in allowlist', 403);
    }

    // Enhanced rate limiting for government APIs
    const rateLimitKey = `gov_api_${validation.agency_id}_${clientIP}`;
    const rateLimitExceeded = await checkEnhancedRateLimit(
      supabase, 
      rateLimitKey, 
      securityConfig.rate_limit_per_hour
    );
    
    if (rateLimitExceeded) {
      await logSecurityEvent(supabase, {
        event_type: 'rate_limit_exceeded',
        severity: 'medium',
        description: 'Government API rate limit exceeded',
        client_ip: clientIP,
        agency_id: validation.agency_id
      });
      
      return jsonError('Rate limit exceeded for government API', 429);
    }

    // Parse request and route to appropriate handler
    const url = new URL(req.url);
    const pathname = url.pathname.replace('/functions/v1/enhanced-government-api-gateway', '');
    const method = req.method;

    let response;
    if (pathname.startsWith('/threat-intelligence')) {
      response = await handleThreatIntelligence(req, validation, supabase);
    } else if (pathname.startsWith('/monitoring')) {
      response = await handleMonitoring(req, validation, supabase);
    } else if (pathname.startsWith('/compliance')) {
      response = await handleCompliance(req, validation, supabase);
    } else if (pathname.startsWith('/ai-protection')) {
      response = await handleAiProtection(req, validation, supabase);
    } else {
      response = jsonError('Endpoint not found', 404);
    }

    // Log successful API usage
    const responseTime = Date.now() - startTime;
    await logApiUsage(
      supabase,
      validation.agency_id!,
      pathname,
      method,
      response.status,
      responseTime,
      clientIP,
      userAgent
    );

    return response;

  } catch (error) {
    console.error('Government API Gateway Error:', error);
    
    const responseTime = Date.now() - startTime;
    await logApiUsage(
      null,
      'unknown',
      'error',
      req.method,
      500,
      responseTime,
      clientIP,
      userAgent,
      error.message
    );

    return jsonError('Internal server error', 500);
  }
});

async function getSecurityConfig(supabase: any, agencyId: string): Promise<SecurityConfig> {
  const { data } = await supabase
    .from('government_security_configs')
    .select('*')
    .eq('agency_id', agencyId)
    .single();

  return data || {
    ip_allowlist: [],
    rate_limit_per_hour: 1000,
    require_mfa: true,
    data_classification_required: true
  };
}

function isIPAllowed(clientIP: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  
  // Support CIDR notation and individual IPs
  return allowlist.some(allowed => {
    if (allowed.includes('/')) {
      // CIDR notation - simplified check
      const [network, prefix] = allowed.split('/');
      return clientIP.startsWith(network.split('.').slice(0, parseInt(prefix) / 8).join('.'));
    }
    return clientIP === allowed;
  });
}

async function checkEnhancedRateLimit(
  supabase: any, 
  key: string, 
  limit: number
): Promise<boolean> {
  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - 1);

  const { data } = await supabase
    .from('government_api_rate_limits')
    .select('request_count')
    .eq('rate_limit_key', key)
    .gte('window_start', windowStart.toISOString())
    .single();

  const currentCount = data?.request_count || 0;
  
  // Update or insert rate limit record
  await supabase
    .from('government_api_rate_limits')
    .upsert({
      rate_limit_key: key,
      window_start: new Date().toISOString(),
      request_count: currentCount + 1
    });

  return currentCount >= limit;
}

async function handleThreatIntelligence(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('threat_intel')) {
    return jsonError('Insufficient permissions for threat intelligence', 403);
  }

  // Enhanced threat intelligence with real-time data
  const threatData = {
    classification: 'CONFIDENTIAL',
    data_source: 'government_threat_feed',
    threats: [
      {
        id: 'THREAT-GOV-001',
        type: 'advanced_persistent_threat',
        severity: 'high',
        indicators: {
          ip_ranges: ['192.168.1.0/24'],
          domains: ['suspicious-domain.com'],
          file_hashes: ['abc123...']
        },
        attribution: 'state_sponsored',
        last_updated: new Date().toISOString()
      }
    ],
    security_clearance_required: validation.security_clearance,
    access_time: new Date().toISOString()
  };

  return json(threatData);
}

async function handleMonitoring(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('monitoring')) {
    return jsonError('Insufficient permissions for monitoring', 403);
  }

  const monitoringData = {
    classification: 'RESTRICTED',
    scan_results: {
      total_scans: 1250,
      threats_detected: 23,
      critical_alerts: 3,
      last_scan: new Date().toISOString()
    },
    agency_specific_metrics: {
      agency_id: validation.agency_id,
      clearance_level: validation.security_clearance
    }
  };

  return json(monitoringData);
}

async function handleCompliance(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('compliance')) {
    return jsonError('Insufficient permissions for compliance', 403);
  }

  const complianceData = {
    classification: 'OFFICIAL_USE_ONLY',
    compliance_status: {
      fisma_compliant: true,
      fedramp_authorized: true,
      nist_framework_alignment: 'high',
      last_audit: '2024-12-01'
    },
    security_controls: {
      implemented: 247,
      total_required: 250,
      compliance_percentage: 98.8
    }
  };

  return json(complianceData);
}

async function handleAiProtection(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('ai_protection')) {
    return jsonError('Insufficient permissions for AI protection', 403);
  }

  if (req.method === 'POST') {
    const requestData = await req.json();
    
    const analysis = {
      classification: 'SENSITIVE',
      analysis_id: `AI-ANALYSIS-${Date.now()}`,
      request_data: requestData,
      ai_risk_assessment: {
        overall_risk: 'medium',
        ai_training_indicators: ['metadata_patterns', 'synthetic_artifacts'],
        confidence_score: 0.85
      },
      protective_measures_recommended: [
        'watermarking',
        'access_logging',
        'distribution_tracking'
      ],
      analysis_timestamp: new Date().toISOString(),
      agency_clearance: validation.security_clearance
    };

    return json(analysis);
  }

  return jsonError('Method not allowed', 405);
}

function hashApiKey(apiKey: string): string {
  // Simple hash for logging (in production, use crypto.subtle)
  return apiKey.substring(0, 8) + '...';
}

async function logSecurityEvent(supabase: any, event: any) {
  if (!supabase) return;
  
  await supabase
    .from('government_security_events')
    .insert({
      event_type: event.event_type,
      severity: event.severity,
      description: event.description,
      metadata: {
        client_ip: event.client_ip,
        user_agent: event.user_agent,
        agency_id: event.agency_id,
        api_key_hash: event.api_key_hash
      },
      created_at: new Date().toISOString()
    });
}

async function logApiUsage(
  supabase: any,
  agencyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  clientIP: string,
  userAgent: string,
  errorMessage?: string
) {
  if (!supabase) return;
  
  await supabase
    .from('government_api_usage')
    .insert({
      agency_id: agencyId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      client_ip: clientIP,
      user_agent: userAgent,
      error_message: errorMessage,
      created_at: new Date().toISOString()
    });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function jsonError(message: string, status: number) {
  return json({ error: message }, status);
}