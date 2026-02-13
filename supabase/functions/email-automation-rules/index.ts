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
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const body = await req.json().catch(() => ({}))
    
    // Handle different operations based on request method and body content
    if (req.method === 'GET' || (req.method === 'POST' && Object.keys(body).length === 0)) {
      // Load automation rules - return mock data for now since table doesn't exist
      const mockRules = [
        {
          id: '1',
          user_id: user.id,
          name: 'Welcome Email',
          description: 'Send welcome email to new subscribers',
          trigger_event: 'subscriber_added',
          trigger_conditions: {},
          campaign_id: 'welcome-campaign',
          delay_minutes: 0,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]

      return new Response(JSON.stringify({ rules: mockRules }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.ruleId && typeof body.isActive === 'boolean') {
      // Toggle rule active status - mock success
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.name && body.triggerEvent) {
      // Create new automation rule - mock success
      const newRule = {
        id: Date.now().toString(),
        user_id: user.id,
        name: body.name,
        description: body.description || '',
        trigger_event: body.triggerEvent,
        trigger_conditions: body.triggerConditions || {},
        campaign_id: body.campaignId,
        delay_minutes: body.delayMinutes || 0,
        is_active: true,
        created_at: new Date().toISOString()
      }

      return new Response(JSON.stringify({ success: true, rule: newRule }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid request parameters')

  } catch (error: any) {
    console.error('Error in email-automation-rules function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})