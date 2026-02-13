import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const checks: Array<{
      service: string
      status: 'healthy' | 'degraded' | 'down'
      response_time_ms: number
      details?: string
    }> = []

    // Check Database
    const dbStart = Date.now()
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1).single()
      checks.push({
        service: 'database',
        status: error ? 'degraded' : 'healthy',
        response_time_ms: Date.now() - dbStart,
        details: error ? error.message : 'Connected'
      })
    } catch (e) {
      checks.push({
        service: 'database',
        status: 'down',
        response_time_ms: Date.now() - dbStart,
        details: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Check Auth
    const authStart = Date.now()
    try {
      const { error } = await supabase.auth.getSession()
      checks.push({
        service: 'auth',
        status: error ? 'degraded' : 'healthy',
        response_time_ms: Date.now() - authStart,
        details: error ? error.message : 'Available'
      })
    } catch (e) {
      checks.push({
        service: 'auth',
        status: 'down',
        response_time_ms: Date.now() - authStart,
        details: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Check Storage
    const storageStart = Date.now()
    try {
      const { data, error } = await supabase.storage.listBuckets()
      checks.push({
        service: 'storage',
        status: error ? 'degraded' : 'healthy',
        response_time_ms: Date.now() - storageStart,
        details: error ? error.message : `${data?.length || 0} buckets available`
      })
    } catch (e) {
      checks.push({
        service: 'storage',
        status: 'down',
        response_time_ms: Date.now() - storageStart,
        details: e instanceof Error ? e.message : 'Unknown error'
      })
    }

    // Overall status
    const hasDown = checks.some(c => c.status === 'down')
    const hasDegraded = checks.some(c => c.status === 'degraded')
    const overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'healthy'

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      uptime: Deno.systemCpuInfo ? 'available' : 'not available',
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: overallStatus === 'down' ? 503 : 200,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return new Response(
      JSON.stringify({
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    )
  }
})
