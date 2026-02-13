import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface WebhookEvent {
  type: string; // delivered, opened, clicked, bounced, complained, unsubscribed
  email: string;
  campaignId?: string;
  subscriberId?: string;
  timestamp: string;
  data?: any;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
  device?: {
    type?: string;
    client?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify webhook signature if provided
    const signature = req.headers.get('x-webhook-signature');
    const body = await req.text();
    
    // In production, verify the webhook signature here
    // if (signature && !verifyWebhookSignature(body, signature)) {
    //   return new Response('Invalid signature', { status: 401 });
    // }

    const event: WebhookEvent = JSON.parse(body);

    console.log('Processing webhook event:', event);

    // Find the subscriber by email
    const { data: subscriber, error: subscriberError } = await supabaseClient
      .from('email_subscribers')
      .select('id, user_id')
      .eq('email', event.email)
      .single();

    if (subscriberError || !subscriber) {
      console.warn('Subscriber not found for email:', event.email);
      return new Response('Subscriber not found', { status: 404 });
    }

    // Find the campaign if provided
    let campaignId = event.campaignId;
    if (!campaignId && event.data?.campaignId) {
      campaignId = event.data.campaignId;
    }

    // Insert detailed event record
    const eventData = {
      campaign_id: campaignId,
      subscriber_id: subscriber.id,
      event_type: event.type,
      event_data: event.data || {},
      user_agent: event.userAgent,
      ip_address: event.ipAddress,
      location_country: event.location?.country,
      location_city: event.location?.city,
      device_type: event.device?.type,
      email_client: event.device?.client,
      created_at: new Date(event.timestamp).toISOString()
    };

    const { error: eventError } = await supabaseClient
      .from('email_detailed_events')
      .insert(eventData);

    if (eventError) {
      console.error('Error inserting event:', eventError);
    }

    // Update campaign recipient record if campaign is found
    if (campaignId) {
      const updates: any = {};
      
      switch (event.type) {
        case 'delivered':
          updates.status = 'delivered';
          updates.delivered_at = new Date(event.timestamp).toISOString();
          break;
        case 'opened':
          updates.opened_at = new Date(event.timestamp).toISOString();
          break;
        case 'clicked':
          updates.clicked_at = new Date(event.timestamp).toISOString();
          break;
        case 'bounced':
          updates.status = 'bounced';
          updates.bounced_at = new Date(event.timestamp).toISOString();
          break;
        case 'complained':
          updates.status = 'complained';
          updates.complained_at = new Date(event.timestamp).toISOString();
          break;
        case 'unsubscribed':
          // Update subscriber status
          await supabaseClient
            .from('email_subscribers')
            .update({ 
              status: 'unsubscribed',
              unsubscribed_at: new Date(event.timestamp).toISOString()
            })
            .eq('id', subscriber.id);
          break;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabaseClient
          .from('email_campaign_recipients')
          .update(updates)
          .eq('campaign_id', campaignId)
          .eq('subscriber_id', subscriber.id);

        if (updateError) {
          console.error('Error updating campaign recipient:', updateError);
        }
      }
    }

    // Update deliverability stats
    await updateDeliverabilityStats(supabaseClient, subscriber.user_id, event);

    // Trigger any configured webhooks for this user
    await triggerUserWebhooks(supabaseClient, subscriber.user_id, event);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in email-webhook-handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function updateDeliverabilityStats(supabaseClient: any, userId: string, event: WebhookEvent) {
  try {
    const domain = event.email.split('@')[1];
    const today = new Date().toISOString().split('T')[0];

    const updateData: any = {};
    
    switch (event.type) {
      case 'delivered':
        updateData.delivered = 1;
        break;
      case 'bounced':
        updateData.bounced = 1;
        break;
      case 'complained':
        updateData.complained = 1;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      // Upsert deliverability stats
      const { data: existing } = await supabaseClient
        .from('email_deliverability_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('domain', domain)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing record
        const updates: any = {};
        Object.keys(updateData).forEach(key => {
          updates[key] = (existing[key] || 0) + updateData[key];
        });

        // Recalculate rates
        const totalSent = updates.total_sent || existing.total_sent || 0;
        if (totalSent > 0) {
          updates.deliverability_rate = ((updates.delivered || existing.delivered || 0) / totalSent) * 100;
          updates.bounce_rate = ((updates.bounced || existing.bounced || 0) / totalSent) * 100;
          updates.complaint_rate = ((updates.complained || existing.complained || 0) / totalSent) * 100;
        }

        await supabaseClient
          .from('email_deliverability_stats')
          .update(updates)
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabaseClient
          .from('email_deliverability_stats')
          .insert({
            user_id: userId,
            domain,
            date: today,
            ...updateData,
            deliverability_rate: event.type === 'delivered' ? 100 : 0,
            bounce_rate: event.type === 'bounced' ? 100 : 0,
            complaint_rate: event.type === 'complained' ? 100 : 0
          });
      }
    }
  } catch (error) {
    console.error('Error updating deliverability stats:', error);
  }
}

async function triggerUserWebhooks(supabaseClient: any, userId: string, event: WebhookEvent) {
  try {
    // Get user's active webhooks that are interested in this event type
    const { data: webhooks } = await supabaseClient
      .from('email_webhooks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .contains('events', [event.type]);

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    // Send webhook to each configured endpoint
    for (const webhook of webhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': await generateWebhookSignature(JSON.stringify(event), webhook.secret_key)
          },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(webhook.timeout_seconds * 1000 || 30000)
        });

        if (response.ok) {
          // Update last triggered timestamp
          await supabaseClient
            .from('email_webhooks')
            .update({ 
              last_triggered: new Date().toISOString(),
              failure_count: 0
            })
            .eq('id', webhook.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        console.error(`Webhook failed for ${webhook.url}:`, error);
        
        // Increment failure count
        const newFailureCount = (webhook.failure_count || 0) + 1;
        const updates: any = { failure_count: newFailureCount };
        
        // Disable webhook after too many failures
        if (newFailureCount >= 10) {
          updates.is_active = false;
        }

        await supabaseClient
          .from('email_webhooks')
          .update(updates)
          .eq('id', webhook.id);
      }
    }
  } catch (error) {
    console.error('Error triggering user webhooks:', error);
  }
}

async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(handler);