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

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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

    if (!RESEND_API_KEY) {
      throw new Error('Email service not configured. RESEND_API_KEY is missing.')
    }

    const { campaignId } = await req.json()
    if (!campaignId) throw new Error('Campaign ID is required')

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) throw new Error('Campaign not found')
    if (campaign.status === 'sent') throw new Error('Campaign has already been sent')

    // Update status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId)

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'subscribed')

    if (subError) throw subError

    const subscriberList = subscribers || []
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Send emails via Resend to each subscriber
    for (const subscriber of subscriberList) {
      try {
        // Create recipient record
        await supabase
          .from('email_campaign_recipients')
          .insert({
            user_id: user.id,
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            email: subscriber.email,
            status: 'sending',
          })

        // Personalize content
        const personalizedContent = campaign.content
          .replace(/\{\{first_name\}\}/g, subscriber.first_name || 'there')
          .replace(/\{\{last_name\}\}/g, subscriber.last_name || '')
          .replace(/\{\{email\}\}/g, subscriber.email)

        // Send via Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TSMO Technology <noreply@tsmowatch.com>',
            to: [subscriber.email],
            subject: campaign.subject,
            html: personalizedContent,
          }),
        })

        const resendData = await resendResponse.json()

        if (resendResponse.ok) {
          // Update recipient as sent
          await supabase
            .from('email_campaign_recipients')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              metadata: { resend_id: resendData.id }
            })
            .eq('campaign_id', campaignId)
            .eq('subscriber_id', subscriber.id)

          sentCount++
        } else {
          const errMsg = resendData.message || 'Unknown Resend error'
          errors.push(`${subscriber.email}: ${errMsg}`)

          await supabase
            .from('email_campaign_recipients')
            .update({
              status: 'failed',
              metadata: { error: errMsg }
            })
            .eq('campaign_id', campaignId)
            .eq('subscriber_id', subscriber.id)

          failedCount++
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (emailError: any) {
        console.error(`Failed to send to ${subscriber.email}:`, emailError)
        errors.push(`${subscriber.email}: ${emailError.message}`)
        failedCount++
      }
    }

    // Update campaign status
    const finalStatus = sentCount > 0 ? 'sent' : 'failed'
    await supabase
      .from('email_campaigns')
      .update({
        status: finalStatus,
        send_time: new Date().toISOString(),
      })
      .eq('id', campaignId)

    console.log(`Campaign "${campaign.name}" sent: ${sentCount} success, ${failedCount} failed`)

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscriberList.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Campaign sent to ${sentCount} of ${subscriberList.length} subscribers`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in send-email-campaign:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
