import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId } = await req.json();

    if (action === 'start') {
      // Simulate threat detection
      const threats = await simulateThreatDetection(userId);
      
      // Create alerts for detected threats
      for (const threat of threats) {
        await createAlert(supabaseClient, userId, threat);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          threatsDetected: threats.length,
          message: 'Monitoring started, alerts generated' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in threat-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function simulateThreatDetection(userId: string) {
  // Simulate various threat scenarios
  const scenarios = [
    {
      alert_type: 'copyright_violation',
      severity: 'critical',
      title: 'Unauthorized Copyright Usage Detected',
      message: 'Your artwork "Digital Masterpiece" has been detected on an unauthorized platform',
      source_data: {
        platform: 'UnknownImageSite.com',
        url: 'https://example.com/unauthorized-image',
        detected_at: new Date().toISOString()
      }
    },
    {
      alert_type: 'ai_training_detection',
      severity: 'warning',
      title: 'Potential AI Training Dataset Usage',
      message: 'Your content may have been included in an AI training dataset',
      source_data: {
        confidence: 0.85,
        model: 'ImageGen-V2',
        detected_at: new Date().toISOString()
      }
    },
    {
      alert_type: 'high_risk_match',
      severity: 'critical',
      title: 'High-Risk Copyright Match Found',
      message: 'A 95% match of your protected content detected on commercial platform',
      source_data: {
        match_percentage: 95,
        platform: 'CommercialStock.io',
        detected_at: new Date().toISOString()
      }
    }
  ];

  // Randomly select 1-2 threats
  const numThreats = Math.floor(Math.random() * 2) + 1;
  return scenarios.slice(0, numThreats);
}

async function createAlert(supabaseClient: any, userId: string, threat: any) {
  const { error } = await supabaseClient
    .from('advanced_alerts')
    .insert({
      user_id: userId,
      alert_type: threat.alert_type,
      severity: threat.severity,
      title: threat.title,
      message: threat.message,
      delivery_channels: ['in_app', 'email'],
      delivery_status: {
        in_app: 'delivered',
        email: 'pending'
      },
      source_data: threat.source_data,
      is_escalated: threat.severity === 'critical',
      escalation_level: threat.severity === 'critical' ? 1 : 0
    });

  if (error) {
    console.error('Error creating alert:', error);
    throw error;
  }

  console.log(`Alert created for user ${userId}: ${threat.title}`);
}
