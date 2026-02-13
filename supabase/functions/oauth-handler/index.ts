import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const ADOBE_CLIENT_ID = Deno.env.get('ADOBE_CLIENT_ID')?.trim()
const ADOBE_CLIENT_SECRET = Deno.env.get('ADOBE_CLIENT_SECRET')?.trim()
const BUFFER_CLIENT_ID = Deno.env.get('BUFFER_CLIENT_ID')?.trim() || 'dummy_buffer_client_id'
const BUFFER_CLIENT_SECRET = Deno.env.get('BUFFER_CLIENT_SECRET')?.trim() || 'dummy_buffer_secret'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function randomState() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const url = new URL(req.url)

  try {
    if (req.method === 'POST') {
      console.log('OAuth POST request received')
      const { provider, appRedirect } = await req.json()
      console.log('Request data:', { provider, appRedirect })
      
      if (!provider || !appRedirect) return json({ error: 'Missing provider or appRedirect' }, 400)

      // Validate user via Authorization header
      const authHeader = req.headers.get('Authorization')
      console.log('Auth header present:', !!authHeader)
      
      if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)
      const token = authHeader.replace('Bearer ', '')
      const { data: authUser, error: authErr } = await supabase.auth.getUser(token)
      console.log('User auth result:', { user: !!authUser.user, error: authErr })
      
      if (authErr || !authUser.user) return json({ error: 'Invalid auth' }, 401)

      const state = randomState()

      // Save oauth state
      const { error: stateErr } = await supabase.from('oauth_states').insert({
        user_id: authUser.user.id,
        provider,
        state,
        app_redirect_uri: appRedirect,
      })
      if (stateErr) return json({ error: 'Failed to create OAuth state', details: stateErr.message }, 500)

      // Function callback URL (must be registered at provider)
      const callback = `https://${new URL(SUPABASE_URL).host}/functions/v1/oauth-handler?provider=${provider}`

      let authUrl = ''
      switch (provider) {
        case 'adobe': {
          console.log('Adobe OAuth request - Client ID present:', !!ADOBE_CLIENT_ID)
          if (!ADOBE_CLIENT_ID) return json({ error: 'Adobe Creative Cloud integration is not configured. Please contact support.' }, 500)
          const scope = encodeURIComponent('openid creative_sdk')
          authUrl = `https://ims-na1.adobelogin.com/ims/authorize/v2?client_id=${encodeURIComponent(ADOBE_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(callback)}&scope=${scope}&state=${state}`
          console.log('Generated Adobe auth URL:', authUrl)
          break
        }
        case 'buffer': {
          if (!BUFFER_CLIENT_ID) return json({ error: 'BUFFER_CLIENT_ID not set' }, 500)
          authUrl = `https://buffer.com/oauth2/authorize?client_id=${encodeURIComponent(BUFFER_CLIENT_ID)}&redirect_uri=${encodeURIComponent(callback)}&response_type=code&state=${state}`
          break
        }
        default:
          return json({ error: 'Unsupported provider' }, 400)
      }

      return json({ url: authUrl })
    }

    if (req.method === 'GET') {
      const provider = url.searchParams.get('provider')
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      if (!provider || !code || !state) return json({ error: 'Missing query params' }, 400)

      // Lookup oauth state
      const { data: stateRow, error: stateErr } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .maybeSingle()
      if (stateErr || !stateRow) return json({ error: 'Invalid state' }, 400)
      if (stateRow.used) return json({ error: 'State already used' }, 400)
      if (new Date(stateRow.expires_at) < new Date()) return json({ error: 'State expired' }, 400)

      // Exchange code for tokens
      const callback = `https://${new URL(SUPABASE_URL).host}/functions/v1/oauth-handler?provider=${provider}`

      let tokenData: any = null
      if (provider === 'adobe') {
        if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET) return json({ error: 'Missing Adobe credentials' }, 500)
        const body = new URLSearchParams({
          client_id: ADOBE_CLIENT_ID,
          client_secret: ADOBE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: callback,
        })
        const resp = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        })
        const txt = await resp.text()
        if (!resp.ok) throw new Error(`Adobe token error: ${resp.status} ${txt}`)
        tokenData = JSON.parse(txt)
      } else if (provider === 'buffer') {
        if (!BUFFER_CLIENT_ID || !BUFFER_CLIENT_SECRET) return json({ error: 'Missing Buffer credentials' }, 500)
        const body = new URLSearchParams({
          client_id: BUFFER_CLIENT_ID,
          client_secret: BUFFER_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: callback,
        })
        const resp = await fetch('https://api.bufferapp.com/1/oauth2/token.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        })
        const txt = await resp.text()
        if (!resp.ok) throw new Error(`Buffer token error: ${resp.status} ${txt}`)
        tokenData = JSON.parse(txt)
      } else {
        return json({ error: 'Unsupported provider' }, 400)
      }

      // Persist tokens
      const accessToken = tokenData.access_token
      const refreshToken = tokenData.refresh_token ?? null
      const expiresIn = tokenData.expires_in ? Number(tokenData.expires_in) : null
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null
      const scope = tokenData.scope ?? tokenData.scopes ?? null

      const { error: upsertErr } = await supabase.from('user_integrations').upsert({
        user_id: stateRow.user_id,
        provider,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        scope,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })
      if (upsertErr) return json({ error: 'Failed to save tokens', details: upsertErr.message }, 500)

      // Mark state as used
      await supabase.from('oauth_states').update({ used: true }).eq('id', stateRow.id)

      // Redirect back to app
      const redirect = new URL(stateRow.app_redirect_uri)
      redirect.searchParams.set('connected', provider)
      return Response.redirect(redirect.toString(), 302)
    }

    return json({ error: 'Method not allowed' }, 405)
  } catch (e: any) {
    console.error('oauth-handler error', e)
    return json({ error: e.message ?? 'Internal error' }, 500)
  }
})
