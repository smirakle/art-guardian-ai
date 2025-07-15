import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { matchId, userId } = await req.json()

    if (!matchId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('copyright_matches')
      .select(`
        *,
        artwork:artwork_id (*)
      `)
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      console.error('Error fetching match:', matchError)
      return new Response(
        JSON.stringify({ error: 'Match not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Determine alert type based on threat level and confidence
    let alertType = 'low'
    if (match.threat_level === 'high' || match.match_confidence > 0.9) {
      alertType = 'high'
    } else if (match.threat_level === 'medium' || match.match_confidence > 0.7) {
      alertType = 'medium'
    }

    // Create alert title and message
    const alertTitle = `Copyright Match Detected: ${match.match_type}`
    const alertMessage = `Your artwork "${match.artwork?.title}" was found on ${match.source_domain || 'an external site'} with ${Math.round(match.match_confidence * 100)}% confidence.`

    // Create the alert
    const { data: alert, error: alertError } = await supabase
      .from('monitoring_alerts')
      .insert({
        user_id: userId,
        match_id: matchId,
        alert_type: alertType,
        title: alertTitle,
        message: alertMessage,
        is_read: false
      })
      .select()
      .single()

    if (alertError) {
      console.error('Error creating alert:', alertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create alert' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, alert }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-monitoring-alert function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})