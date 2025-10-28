import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_id, event_type, payload } = await req.json();

    if (!webhook_id || !event_type || !payload) {
      return new Response(JSON.stringify({ 
        error: 'webhook_id, event_type, and payload are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from('partner_webhooks')
      .select('*')
      .eq('id', webhook_id)
      .eq('is_active', true)
      .single();

    if (webhookError || !webhook) {
      return new Response(JSON.stringify({ 
        error: 'Webhook not found or inactive' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this event type is configured for the webhook
    if (!webhook.events.includes(event_type) && !webhook.events.includes('*')) {
      return new Response(JSON.stringify({ 
        error: 'Event type not configured for this webhook' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare webhook payload
    const webhookPayload = {
      event: event_type,
      webhook_id: webhook.id,
      timestamp: new Date().toISOString(),
      data: payload
    };

    // Generate signature
    const signature = generateSignature(webhookPayload, webhook.secret_key);

    // Deliver webhook with retries
    const deliveryResult = await deliverWithRetry(
      webhook.webhook_url,
      webhookPayload,
      signature,
      3 // max retries
    );

    // Update webhook statistics
    await supabase
      .from('partner_webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        total_deliveries: (webhook.total_deliveries || 0) + 1,
        failed_deliveries: deliveryResult.success 
          ? webhook.failed_deliveries 
          : (webhook.failed_deliveries || 0) + 1
      })
      .eq('id', webhook.id);

    return new Response(JSON.stringify({
      success: deliveryResult.success,
      webhook_id: webhook.id,
      event_type,
      delivered_at: new Date().toISOString(),
      attempts: deliveryResult.attempts,
      status_code: deliveryResult.statusCode
    }), {
      status: deliveryResult.success ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook Delivery Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to deliver webhook',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateSignature(payload: any, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

async function deliverWithRetry(
  url: string,
  payload: any,
  signature: string,
  maxRetries: number
): Promise<{ success: boolean; attempts: number; statusCode?: number }> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    
    try {
      console.log(`Webhook delivery attempt ${attempts} to ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TSMO-Partner-Webhook/1.0',
          'X-TSMO-Signature': signature,
          'X-TSMO-Event': payload.event,
          'X-TSMO-Webhook-Id': payload.webhook_id
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        console.log(`Webhook delivered successfully on attempt ${attempts}`);
        return {
          success: true,
          attempts,
          statusCode: response.status
        };
      }

      console.error(`Webhook delivery failed with status ${response.status}`);
      
      // Don't retry on 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          attempts,
          statusCode: response.status
        };
      }

    } catch (error) {
      console.error(`Webhook delivery attempt ${attempts} failed:`, error);
    }

    // Wait before retry (exponential backoff)
    if (attempts < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    attempts
  };
}
