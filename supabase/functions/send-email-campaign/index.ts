import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
  campaignId: string;
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      supabaseClient.auth.setAuth(authHeader.replace('Bearer ', ''));
    }

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { campaignId }: SendCampaignRequest = await req.json();

    if (!campaignId) {
      return new Response(JSON.stringify({ error: 'Campaign ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('email_subscribers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'subscribed');

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: 'No active subscribers found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let successCount = 0;
    let errorCount = 0;

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        // Create recipient record
        const { error: recipientError } = await supabaseClient
          .from('email_campaign_recipients')
          .insert({
            user_id: user.id,
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            email: subscriber.email,
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        if (recipientError) {
          console.error('Error creating recipient record:', recipientError);
          errorCount++;
          continue;
        }

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: 'TSMO <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: campaign.subject,
          html: campaign.content
        });

        if (emailResponse.error) {
          console.error('Resend error:', emailResponse.error);
          errorCount++;
        } else {
          successCount++;
          
          // Log email event
          await supabaseClient
            .from('email_events')
            .insert({
              user_id: user.id,
              campaign_id: campaignId,
              subscriber_id: subscriber.id,
              email: subscriber.email,
              event_type: 'sent',
              payload: { email_id: emailResponse.data?.id }
            });
        }

      } catch (error) {
        console.error('Error sending to subscriber:', subscriber.email, error);
        errorCount++;
      }
    }

    // Update campaign status
    await supabaseClient
      .from('email_campaigns')
      .update({ status: 'sent' })
      .eq('id', campaignId);

    console.log(`Campaign ${campaignId} sent. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount,
      errors: errorCount,
      total: subscribers.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-email-campaign:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);