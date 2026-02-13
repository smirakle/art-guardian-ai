import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function has(name: string) {
  return Boolean(Deno.env.get(name)?.trim())
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const checks: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }> = []

    // Secrets required by AITP pipeline
    const secretNames = [
      'OPENAI_API_KEY', // AI detection
      'GOOGLE_CUSTOM_SEARCH_API_KEY', // evidence search
      'GOOGLE_SEARCH_ENGINE_ID', // CSE id (cx)
      'SERPAPI_KEY', // optional extra search engines
      'RESEND_API_KEY', // email notifier
    ]

    for (const key of secretNames) {
      checks.push({ name: `${key} present`, ok: has(key) })
    }

    // Database tables availability checks
    const dbTargets = [
      { table: 'ai_training_violations', name: 'ai_training_violations table accessible' },
      { table: 'ai_protection_audit_log', name: 'ai_protection_audit_log table accessible' },
    ]

    for (const t of dbTargets) {
      try {
        const { error } = await supabase.from(t.table as any).select('id').limit(1)
        checks.push({ name: t.name, ok: !error, details: error ? { error: error.message } : undefined })
      } catch (e: any) {
        checks.push({ name: t.name, ok: false, details: { error: String(e?.message || e) } })
      }
    }

    const missing = checks.filter((c) => !c.ok).map((c) => c.name)
    const ready = missing.length === 0

    const recommendations = [
      'Configure on-call alerts for high-confidence violations (> 0.8).',
      'Load test the monitor and processor functions (target p95 < 2s, error rate < 1%).',
      'Enable daily evidence export for legal follow-up.',
      'Document E2E runbook (detection → notification → escalation).',
    ]

    return new Response(
      JSON.stringify({
        status: ready ? 'ok' : 'needs_attention',
        message: ready ? 'AITP pipeline prerequisites look good.' : 'Some AITP prerequisites need attention.',
        checks,
        recommendations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    console.error('aitp-readiness-check error', e)
    return new Response(
      JSON.stringify({ status: 'needs_attention', error: e?.message ?? 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})