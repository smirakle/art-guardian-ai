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

    // LIST rules (empty body or GET-like)
    if (req.method === 'GET' || Object.keys(body).length === 0) {
      const { data: rules, error } = await supabase
        .from('email_automation_rules')
        .select(`
          *,
          email_campaigns(name, subject)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ rules: rules || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // TOGGLE rule active status
    if (body.ruleId && typeof body.isActive === 'boolean') {
      const { error } = await supabase
        .from('email_automation_rules')
        .update({ is_active: body.isActive })
        .eq('id', body.ruleId)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE rule
    if (body.deleteRuleId) {
      const { error } = await supabase
        .from('email_automation_rules')
        .delete()
        .eq('id', body.deleteRuleId)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // CREATE new rule
    if (body.name && body.triggerEvent) {
      const { data: rule, error } = await supabase
        .from('email_automation_rules')
        .insert({
          user_id: user.id,
          name: body.name,
          description: body.description || null,
          trigger_event: body.triggerEvent,
          trigger_conditions: body.triggerConditions || {},
          campaign_id: body.campaignId || null,
          delay_minutes: body.delayMinutes || 0,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, rule }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid request parameters')

  } catch (error: any) {
    console.error('Error in email-automation-rules:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
