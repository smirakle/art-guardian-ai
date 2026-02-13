import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { periodDays = 30 } = await req.json().catch(() => ({ periodDays: 30 }));
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Fetch AI training violations
    const { data: violations } = await supabase
      .from('ai_training_violations')
      .select('detected_at,resolved_at,status,legal_action_taken')
      .gte('detected_at', since)
      .order('detected_at', { ascending: false });

    const totalDetected = violations?.length || 0;
    const resolved = (violations || []).filter(v => v.resolved_at).length;
    const success = (violations || []).filter(v => v.status === 'resolved' || v.legal_action_taken === true).length;

    // Compute MTTR for resolved items
    let mttrMinutes = 0;
    let count = 0;
    for (const v of violations || []) {
      if (v.resolved_at) {
        const d1 = new Date(v.detected_at).getTime();
        const d2 = new Date(v.resolved_at).getTime();
        if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
          mttrMinutes += Math.round((d2 - d1) / 60000);
          count++;
        }
      }
    }
    const avgMttr = count > 0 ? Math.round(mttrMinutes / count) : null;

    const metrics = {
      period_days: periodDays,
      total_detected: totalDetected,
      resolved_count: resolved,
      takedown_success_rate: totalDetected > 0 ? Number(((success / totalDetected) * 100).toFixed(1)) : 0,
      avg_time_to_resolve_minutes: avgMttr,
    };

    return json({ metrics });
  } catch (error) {
    console.error('sla-metrics error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
