import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Get email analytics for the user
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Try to get campaign statistics from email_marketing_campaigns table
    try {
      const { data: campaigns, error: campaignError } = await supabase
        .from('email_marketing_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo)

      if (!campaignError && campaigns) {
        // Calculate analytics from real data
        const totalSent = campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0)
        const totalOpened = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0)
        const totalClicked = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0)

        const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
        const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

        return new Response(JSON.stringify({
          totalSent,
          totalOpened,
          totalClicked,
          avgOpenRate: Math.round(avgOpenRate * 100) / 100,
          avgClickRate: Math.round(avgClickRate * 100) / 100,
          subscriberGrowth: 0,
          campaignCount: campaigns.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } catch (error) {
      console.log('No email campaigns data, using mock analytics')
    }

    // Return mock analytics data
    return new Response(JSON.stringify({
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      subscriberGrowth: 0,
      campaignCount: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in email-analytics function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})