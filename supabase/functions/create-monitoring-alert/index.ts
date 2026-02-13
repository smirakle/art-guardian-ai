import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
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

    // Determine alert type based on match type and threat level
    let alertType = 'copyright_match'
    if (match.match_type.includes('deepfake')) {
      alertType = 'deepfake_detected'
    } else if (match.source_domain && match.source_domain.includes('dark')) {
      alertType = 'dark_web_match'
    } else if (match.threat_level === 'high' || match.match_confidence > 90) {
      alertType = 'high_confidence_match'
    } else if (match.threat_level === 'high') {
      alertType = 'high_threat'
    }

    // Create alert title and message
    const alertTitle = `${match.match_type.charAt(0).toUpperCase() + match.match_type.slice(1)} Match Found`
    const alertMessage = `Your artwork "${match.artwork?.title}" was found on ${match.source_domain || 'an external site'} with ${Math.round(match.match_confidence)}% confidence.`

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

    // Get user details for email notification
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single()

    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (!authError && user?.email) {
      // Send email notification in background
      console.log(`Triggering email notification for alert ${alert.id}`)
      
      try {
        await supabase.functions.invoke('send-alert-notification', {
          body: {
            alertId: alert.id,
            alertType: alertType,
            userId: userId,
            userEmail: user.email,
            userName: userProfile?.full_name || user.user_metadata?.full_name || 'User'
          }
        })
        console.log('Email notification triggered successfully')
      } catch (emailError) {
        console.error('Failed to trigger email notification:', emailError)
        // Don't fail the alert creation if email fails
      }
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