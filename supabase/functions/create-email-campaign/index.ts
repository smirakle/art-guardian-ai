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

    const { name, subject, content, triggerType, sendTime, templateId } = await req.json()

    if (!name || !subject || !content) {
      throw new Error('Missing required fields: name, subject, content')
    }

    let status = 'draft'
    let sendTimeValue = null

    if (triggerType === 'immediate') {
      status = 'draft' // Will be set to sending when actually sent
    } else if (triggerType === 'scheduled' && sendTime) {
      status = 'scheduled'
      sendTimeValue = new Date(sendTime).toISOString()
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        user_id: user.id,
        name,
        subject,
        content,
        status,
        trigger_type: triggerType || 'manual',
        send_time: sendTimeValue,
      })
      .select()
      .single()

    if (error) throw error

    // Get subscriber count
    const { count } = await supabase
      .from('email_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'subscribed')

    return new Response(JSON.stringify({
      success: true,
      campaign,
      subscriberCount: count || 0,
      message: status === 'scheduled'
        ? `Campaign scheduled for ${sendTimeValue}`
        : 'Campaign created as draft'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in create-email-campaign:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
