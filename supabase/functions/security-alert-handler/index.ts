import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SecurityAlert {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  description: string;
  metadata?: Record<string, any>;
  client_info?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const alert: SecurityAlert = await req.json();
    
    console.log('Security alert received:', {
      event_type: alert.event_type,
      severity: alert.severity,
      user_id: alert.user_id,
      description: alert.description
    });

    // Store the alert in the security_alerts table
    const { error: insertError } = await supabase
      .from('security_alerts')
      .insert({
        event_type: alert.event_type,
        severity: alert.severity,
        user_id: alert.user_id,
        description: alert.description,
        metadata: alert.metadata || {},
        client_info: alert.client_info || {},
        status: 'active',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to store security alert:', insertError);
    }

    // For critical alerts, trigger immediate notifications
    if (alert.severity === 'critical') {
      await handleCriticalAlert(supabase, alert);
    }

    // Update threat intelligence based on the alert
    await updateThreatIntelligence(supabase, alert);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Security alert processed successfully',
        alert_id: 'generated-id'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing security alert:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process security alert',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleCriticalAlert(supabase: any, alert: SecurityAlert) {
  console.log('Handling critical security alert:', alert.event_type);
  
  // Notify administrators immediately
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (admins) {
    for (const admin of admins) {
      await supabase
        .from('notifications')
        .insert({
          user_id: admin.user_id,
          type: 'security_alert',
          title: 'Critical Security Alert',
          message: alert.description,
          metadata: {
            alert_type: alert.event_type,
            severity: alert.severity,
            requires_immediate_attention: true
          },
          severity: 'critical'
        });
    }
  }

  // For certain critical events, consider automatic protective actions
  if (alert.event_type === 'privilege_escalation_attempt' && alert.user_id) {
    console.log('Considering automatic user suspension for:', alert.user_id);
    // Could implement automatic temporary suspension here
  }
}

async function updateThreatIntelligence(supabase: any, alert: SecurityAlert) {
  const threatIndicators = {
    ip_address: alert.client_info?.ip_address,
    user_agent: alert.client_info?.user_agent,
    event_pattern: alert.event_type,
    severity_level: alert.severity
  };

  // Update or create threat intelligence record
  await supabase
    .from('threat_intelligence')
    .upsert({
      threat_type: alert.event_type,
      source: 'internal_security_monitoring',
      confidence_score: alert.severity === 'critical' ? 0.9 : 0.7,
      threat_indicators: threatIndicators,
      first_detected: new Date().toISOString(),
      last_detected: new Date().toISOString(),
      occurrence_count: 1
    }, {
      onConflict: 'threat_type,source',
      ignoreDuplicates: false
    });
}