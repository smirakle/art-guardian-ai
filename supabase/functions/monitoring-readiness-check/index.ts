import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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
    const checks: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }> = []

    const required = [
      'GOOGLE_CUSTOM_SEARCH_API_KEY',
      'GOOGLE_SEARCH_ENGINE_ID',
      'BING_VISUAL_SEARCH_API_KEY',
      'TINEYE_API_KEY',
      'TINEYE_API_SECRET',
      'OPENAI_API_KEY',
      'SERPAPI_KEY',
    ]

    for (const key of required) {
      checks.push({ name: `${key} present`, ok: has(key) })
    }

    // Derive readiness
    const missing = checks.filter((c) => !c.ok).map((c) => c.name)
    const ready = missing.length === 0

    const result = {
      status: ready ? 'ok' : 'needs_attention',
      message: ready
        ? 'All required monitoring secrets are configured.'
        : 'Some required API keys are missing. Add them in Supabase Edge Function Secrets.',
      checks,
      recommendations: [
        'Enable retry and backoff in scan functions',
        'Set monitoring alert thresholds and paging',
        'Run load tests against real-time and batch scanners',
        'Set up dashboards and SLOs (p95 latency, error rate)',
      ],
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e: any) {
    console.error('monitoring-readiness-check error', e)
    return new Response(
      JSON.stringify({ status: 'needs_attention', error: e?.message ?? 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})