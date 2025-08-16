import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCampaignRequest {
  name: string;
  subject: string;
  content: string;
  triggerType: string;
  sendTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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

    const { name, subject, content, triggerType, sendTime }: CreateCampaignRequest = await req.json();

    // Validate required fields
    if (!name || !subject || !content || !triggerType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('email_campaigns')
      .insert({
        user_id: user.id,
        name,
        subject,
        content,
        trigger_type: triggerType,
        send_time: sendTime || null,
        status: triggerType === 'manual' ? 'draft' : 'scheduled'
      })
      .select()
      .single();

    if (campaignError) {
      throw campaignError;
    }

    console.log('Campaign created successfully:', campaign.id);

    return new Response(JSON.stringify({ 
      success: true, 
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        trigger_type: campaign.trigger_type,
        created_at: campaign.created_at
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in create-email-campaign:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);