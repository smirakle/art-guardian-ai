import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRuleRequest {
  name: string;
  description?: string;
  triggerEvent: string;
  triggerConditions: any;
  campaignId: string;
  delayMinutes: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader!,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      // Get all automation rules for the user
      const { data: rules, error } = await supabaseClient
        .from('email_automation_rules')
        .select(`
          id,
          name,
          description,
          trigger_event,
          trigger_conditions,
          campaign_id,
          delay_minutes,
          is_active,
          execution_count,
          last_executed_at,
          created_at,
          email_campaigns!inner(name, subject)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ rules: rules || [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (req.method === 'POST') {
      // Create new automation rule
      const body = await req.text();
      if (!body.trim()) {
        return new Response(JSON.stringify({ error: 'Request body is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let requestData;
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { name, description, triggerEvent, triggerConditions, campaignId, delayMinutes }: CreateRuleRequest = requestData;

      if (!name || !triggerEvent || !campaignId) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify the campaign belongs to the user
      const { data: campaign, error: campaignError } = await supabaseClient
        .from('email_campaigns')
        .select('id')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (campaignError || !campaign) {
        return new Response(JSON.stringify({ error: 'Campaign not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create the automation rule
      const { data: rule, error: ruleError } = await supabaseClient
        .from('email_automation_rules')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          trigger_event: triggerEvent,
          trigger_conditions: triggerConditions || {},
          campaign_id: campaignId,
          delay_minutes: delayMinutes || 0
        })
        .select()
        .single();

      if (ruleError) throw ruleError;

      console.log('Automation rule created successfully:', rule.id);

      return new Response(JSON.stringify({ 
        success: true, 
        rule: {
          id: rule.id,
          name: rule.name,
          trigger_event: rule.trigger_event,
          is_active: rule.is_active,
          created_at: rule.created_at
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (req.method === 'PUT') {
      // Update automation rule (toggle active/inactive)
      const body = await req.text();
      if (!body.trim()) {
        return new Response(JSON.stringify({ error: 'Request body is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let requestData;
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { ruleId, isActive } = requestData;

      if (!ruleId) {
        return new Response(JSON.stringify({ error: 'Rule ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: rule, error } = await supabaseClient
        .from('email_automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, rule }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in email-automation-rules:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);