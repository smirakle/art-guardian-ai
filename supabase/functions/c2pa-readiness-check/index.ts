import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function has(name: string) {
  return Boolean(Deno.env.get(name)?.trim())
}

async function isReachable(functionName: string): Promise<boolean> {
  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`
    const resp = await fetch(url, {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' },
    })
    return resp.status < 500
  } catch {
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const checks: Array<{ name: string; ok: boolean; details?: Record<string, unknown> }> = []

    // Secret checks
    checks.push({ name: 'C2PA_PRIVATE_KEY present', ok: has('C2PA_PRIVATE_KEY') })
    checks.push({ name: 'C2PA_SIGNING_CERT present', ok: has('C2PA_SIGNING_CERT') })
    checks.push({ name: 'C2PA_ISSUER_ID present', ok: has('C2PA_ISSUER_ID') })

    // Function reachability checks
    const signingOk = await isReachable('sign-c2pa-manifest')
    checks.push({ name: 'sign-c2pa-manifest reachable', ok: signingOk })

    const validationOk = await isReachable('validate-c2pa-manifest')
    checks.push({ name: 'validate-c2pa-manifest reachable', ok: validationOk })

    const missing = checks.filter((c) => !c.ok).map((c) => c.name)
    const ready = missing.length === 0

    const recommendations: string[] = []
    if (!has('C2PA_PRIVATE_KEY')) recommendations.push('Obtain an ES256 private key from your CAI trust anchor and add it as C2PA_PRIVATE_KEY.')
    if (!has('C2PA_SIGNING_CERT')) recommendations.push('Obtain an X.509 signing certificate and add it as C2PA_SIGNING_CERT.')
    if (!has('C2PA_ISSUER_ID')) recommendations.push('Register with CAI and add your Organization ID as C2PA_ISSUER_ID.')
    if (!signingOk) recommendations.push('Deploy the sign-c2pa-manifest edge function.')
    if (!validationOk) recommendations.push('Deploy the validate-c2pa-manifest edge function.')
    if (ready) recommendations.push('All prerequisites met — you can proceed with CAI Conformance Program submission.')

    return new Response(JSON.stringify({
      status: ready ? 'ok' : 'needs_attention',
      message: ready
        ? 'All CAI certification prerequisites are configured.'
        : 'Some CAI prerequisites need attention before submission.',
      checks,
      recommendations,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e: any) {
    console.error('c2pa-readiness-check error', e)
    return new Response(
      JSON.stringify({ status: 'needs_attention', error: e?.message ?? 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
