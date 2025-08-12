import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return json({ error: 'Missing x-api-key header' }, 401);
    }

    // Create admin client to validate API key and log usage (bypass RLS for key lookup)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate enterprise API key
    const { data: keyRecord, error: keyErr } = await supabaseAdmin
      .from('enterprise_api_keys')
      .select('id,user_id,is_active,expires_at,permissions')
      .eq('api_key', apiKey)
      .single();

    if (keyErr || !keyRecord || !keyRecord.is_active || (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date())) {
      await logUsage(supabaseAdmin, apiKey, '/ip-guardrail', 'POST', 401, 'Invalid or inactive API key');
      return json({ error: 'Invalid API key' }, 401);
    }

    // Rate limit check
    const { data: allowed, error: rlErr } = await supabaseAdmin
      .rpc('check_enterprise_api_rate_limit', { api_key_param: apiKey, endpoint_param: '/ip-guardrail' });

    if (rlErr || allowed === false) {
      await logUsage(supabaseAdmin, apiKey, '/ip-guardrail', 'POST', 429, rlErr?.message || 'Rate limit exceeded');
      return json({ error: 'Rate limit exceeded' }, 429);
    }

    const payload = await req.json().catch(() => ({}));

    // Minimal preflight: compute a simple risk signal based on provided hashes/text
    // In a full implementation, this would perform perceptual hash search, text embedding similarity, etc.
    const title: string | undefined = payload?.title;
    const imageHash: string | undefined = payload?.image_hash; // e.g., pHash
    const textFingerprint: string | undefined = payload?.text_fingerprint;

    // Heuristic scoring (placeholder):
    let risk = 0;
    if (imageHash && imageHash.length >= 16) risk += 0.5;
    if (textFingerprint && textFingerprint.length >= 16) risk += 0.3;
    if (title && /brand|official|exclusive|limited/i.test(title)) risk += 0.2;
    risk = Math.min(1, risk);

    const decision = risk >= 0.6 ? 'block' : risk >= 0.3 ? 'review' : 'allow';

    const response = {
      decision,
      risk_score: Number((risk * 100).toFixed(1)),
      signals: {
        image_hash_present: Boolean(imageHash),
        text_fingerprint_present: Boolean(textFingerprint),
        title_keyword_match: Boolean(title && /brand|official|exclusive|limited/i.test(title || '')),
      },
      guidance: decision === 'block'
        ? 'Block upload and request proof of ownership/license.'
        : decision === 'review'
          ? 'Send to manual review or request additional metadata.'
          : 'Allow upload.',
    };

    await logUsage(supabaseAdmin, apiKey, '/ip-guardrail', 'POST', 200);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('ip-guardrail error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function logUsage(supabaseAdmin: any, apiKey: string, endpoint: string, method: string, status = 200, errorMessage?: string) {
  try {
    await supabaseAdmin.rpc('log_enterprise_api_usage', {
      api_key_param: apiKey,
      endpoint_param: endpoint,
      method_param: method,
      status_code_param: status,
      response_time_ms_param: 0,
      ip_address_param: null,
      user_agent_param: 'edge-func',
      error_message_param: errorMessage || null,
      metadata_param: { source: 'ip-guardrail' },
    });
  } catch (e) {
    console.warn('Usage log failed', e);
  }
}
