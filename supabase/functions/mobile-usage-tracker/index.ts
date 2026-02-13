import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_id,
      platform,
      device_info,
      app_version,
      features_used = [],
      crash_reports = null,
      session_duration_minutes = 0
    } = await req.json()

    if (!user_id || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record mobile app usage
    const { data: usage, error: usageError } = await supabaseClient
      .from('mobile_app_usage')
      .insert({
        user_id,
        platform,
        device_info,
        app_version,
        features_used,
        crash_reports,
        session_end: session_duration_minutes > 0 ? 
          new Date(Date.now() + session_duration_minutes * 60000).toISOString() : null
      })
      .select()
      .single()

    if (usageError) {
      console.error('Error recording mobile usage:', usageError)
      return new Response(
        JSON.stringify({ error: 'Failed to record usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user settings for response
    const { data: settings } = await supabaseClient
      .from('mobile_app_settings')
      .select('*')
      .eq('user_id', user_id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        usage_id: usage.id,
        settings: settings || {
          push_notifications_enabled: true,
          biometric_auth_enabled: false,
          offline_mode_enabled: true,
          auto_sync_enabled: true,
          theme_preference: 'system',
          language_preference: 'en'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in mobile-usage-tracker:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})