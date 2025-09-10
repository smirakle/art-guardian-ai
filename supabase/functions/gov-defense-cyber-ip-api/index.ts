import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ThreatIntelRequest {
  targets: string[];
  classification_level?: 'unclassified' | 'cui' | 'confidential' | 'secret';
  monitoring_duration_hours?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  callback_url?: string;
}

interface IPMonitoringRequest {
  ip_assets: Array<{
    asset_type: 'patent' | 'trademark' | 'copyright' | 'trade_secret';
    asset_id: string;
    classification: string;
    monitoring_scope: string[];
  }>;
  alert_threshold: 'low' | 'medium' | 'high';
  compliance_framework?: 'itar' | 'ear' | 'cfius' | 'dfars';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify API key has government/defense permissions
    const { data: keyData, error: keyError } = await supabase
      .from('enterprise_api_keys')
      .select('id, user_id, permissions, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData || !keyData.permissions.includes('gov_defense')) {
      console.error('Invalid API key or insufficient permissions:', keyError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key or insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    console.log(`Government Defense API Request: ${method} ${pathname}`);

    // Route requests
    if (pathname === '/v1/threat-intelligence' && method === 'POST') {
      return await handleThreatIntelligence(req, supabase, keyData.user_id);
    } else if (pathname === '/v1/ip-monitoring' && method === 'POST') {
      return await handleIPMonitoring(req, supabase, keyData.user_id);
    } else if (pathname === '/v1/security-alerts' && method === 'GET') {
      return await handleSecurityAlerts(req, supabase, keyData.user_id);
    } else if (pathname === '/v1/compliance-report' && method === 'GET') {
      return await handleComplianceReport(req, supabase, keyData.user_id);
    } else if (pathname === '/v1/health' && method === 'GET') {
      return await handleHealthCheck();
    } else {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in gov-defense-cyber-ip-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleThreatIntelligence(req: Request, supabase: any, userId: string) {
  const requestData: ThreatIntelRequest = await req.json();
  
  // Validate request
  if (!requestData.targets || !Array.isArray(requestData.targets) || requestData.targets.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Targets array is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Create threat intelligence session
  const sessionId = crypto.randomUUID();
  const { error: sessionError } = await supabase
    .from('gov_defense_monitoring_sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      session_type: 'threat_intelligence',
      targets: requestData.targets,
      classification_level: requestData.classification_level || 'unclassified',
      priority: requestData.priority || 'medium',
      monitoring_duration_hours: requestData.monitoring_duration_hours || 24,
      callback_url: requestData.callback_url,
      status: 'active'
    });

  if (sessionError) {
    console.error('Error creating monitoring session:', sessionError);
    return new Response(
      JSON.stringify({ error: 'Failed to create monitoring session' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Invoke real-time threat intelligence function
  const { data: threatData, error: threatError } = await supabase.functions.invoke('real-time-threat-intelligence', {
    body: {
      action: 'scan',
      targets: requestData.targets,
      classification: requestData.classification_level,
      priority: requestData.priority
    }
  });

  if (threatError) {
    console.error('Error invoking threat intelligence:', threatError);
  }

  return new Response(
    JSON.stringify({
      session_id: sessionId,
      status: 'monitoring_initiated',
      targets_count: requestData.targets.length,
      classification: requestData.classification_level || 'unclassified',
      estimated_completion: new Date(Date.now() + (requestData.monitoring_duration_hours || 24) * 60 * 60 * 1000),
      threat_data: threatData
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleIPMonitoring(req: Request, supabase: any, userId: string) {
  const requestData: IPMonitoringRequest = await req.json();
  
  // Validate request
  if (!requestData.ip_assets || !Array.isArray(requestData.ip_assets) || requestData.ip_assets.length === 0) {
    return new Response(
      JSON.stringify({ error: 'IP assets array is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Create IP monitoring session
  const sessionId = crypto.randomUUID();
  const { error: sessionError } = await supabase
    .from('gov_defense_monitoring_sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      session_type: 'ip_monitoring',
      ip_assets: requestData.ip_assets,
      alert_threshold: requestData.alert_threshold,
      compliance_framework: requestData.compliance_framework,
      status: 'active'
    });

  if (sessionError) {
    console.error('Error creating IP monitoring session:', sessionError);
    return new Response(
      JSON.stringify({ error: 'Failed to create IP monitoring session' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Start monitoring for each IP asset
  for (const asset of requestData.ip_assets) {
    await supabase
      .from('gov_defense_ip_monitoring')
      .insert({
        session_id: sessionId,
        user_id: userId,
        asset_type: asset.asset_type,
        asset_id: asset.asset_id,
        classification: asset.classification,
        monitoring_scope: asset.monitoring_scope,
        alert_threshold: requestData.alert_threshold,
        compliance_framework: requestData.compliance_framework
      });
  }

  return new Response(
    JSON.stringify({
      session_id: sessionId,
      status: 'monitoring_active',
      assets_monitored: requestData.ip_assets.length,
      alert_threshold: requestData.alert_threshold,
      compliance_framework: requestData.compliance_framework
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleSecurityAlerts(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const severity = url.searchParams.get('severity');
  const since = url.searchParams.get('since');

  let query = supabase
    .from('gov_defense_security_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (severity) {
    query = query.eq('severity', severity);
  }

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data: alerts, error } = await query;

  if (error) {
    console.error('Error fetching security alerts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch security alerts' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(
    JSON.stringify({
      alerts: alerts || [],
      total_count: alerts?.length || 0,
      retrieved_at: new Date().toISOString()
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleComplianceReport(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url);
  const framework = url.searchParams.get('framework');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  // Generate compliance report
  const { data: sessions, error: sessionsError } = await supabase
    .from('gov_defense_monitoring_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', endDate || new Date().toISOString());

  if (sessionsError) {
    console.error('Error generating compliance report:', sessionsError);
    return new Response(
      JSON.stringify({ error: 'Failed to generate compliance report' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const report = {
    report_id: crypto.randomUUID(),
    user_id: userId,
    framework: framework || 'general',
    period: {
      start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: endDate || new Date().toISOString()
    },
    summary: {
      total_sessions: sessions?.length || 0,
      threat_intelligence_sessions: sessions?.filter(s => s.session_type === 'threat_intelligence').length || 0,
      ip_monitoring_sessions: sessions?.filter(s => s.session_type === 'ip_monitoring').length || 0,
      active_sessions: sessions?.filter(s => s.status === 'active').length || 0
    },
    sessions: sessions || [],
    generated_at: new Date().toISOString()
  };

  return new Response(
    JSON.stringify(report),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleHealthCheck() {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'government-defense-cyber-ip-api',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}