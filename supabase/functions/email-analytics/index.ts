import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
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
    if (!authHeader) throw new Error('No authorization header')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Invalid authentication')

    const body = await req.json().catch(() => ({}))
    const timeRange = body.timeRange || '30d'
    
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[timeRange] || 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get campaigns in time range
    const { data: campaigns, error: campError } = await supabase
      .from('email_campaigns')
      .select('id, status')
      .eq('user_id', user.id)
      .gte('created_at', since)

    if (campError) throw campError

    const campaignIds = (campaigns || []).map(c => c.id)
    const totalCampaigns = campaigns?.length || 0
    const activeCampaigns = campaigns?.filter(c => c.status === 'sent' || c.status === 'sending').length || 0

    let totalSent = 0, totalOpened = 0, totalClicked = 0, totalBounced = 0, totalUnsubscribed = 0

    if (campaignIds.length > 0) {
      // Get recipient stats
      const { data: recipients, error: recError } = await supabase
        .from('email_campaign_recipients')
        .select('status, opened_at, clicked_at, bounced_at, unsubscribed_at')
        .in('campaign_id', campaignIds)

      if (!recError && recipients) {
        totalSent = recipients.filter(r => r.status === 'sent').length
        totalOpened = recipients.filter(r => r.opened_at).length
        totalClicked = recipients.filter(r => r.clicked_at).length
        totalBounced = recipients.filter(r => r.bounced_at).length
        totalUnsubscribed = recipients.filter(r => r.unsubscribed_at).length
      }
    }

    const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 10000) / 100 : 0
    const avgClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 10000) / 100 : 0
    const deliverabilityRate = totalSent > 0 ? Math.round(((totalSent - totalBounced) / totalSent) * 10000) / 100 : 100
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 10000) / 100 : 0
    const unsubscribeRate = totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 10000) / 100 : 0

    return new Response(JSON.stringify({
      totalSent,
      totalOpened,
      totalClicked,
      avgOpenRate,
      avgClickRate,
      totalCampaigns,
      activeCampaigns,
      deliverabilityRate,
      bounceRate,
      unsubscribeRate,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in email-analytics:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
