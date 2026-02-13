import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      console.error('Missing stripe signature or webhook secret');
      return new Response('Missing signature or webhook secret', { status: 400 });
    }

    const body = await req.text();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event, supabase);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout completed:', session.id);
  
  // Update template purchase status
  const { error: updateError } = await supabase
    .from('template_purchases')
    .update({
      status: 'completed',
      purchased_at: new Date().toISOString()
    })
    .eq('stripe_session_id', session.id);

  if (updateError) {
    console.error('Error updating template purchase:', updateError);
  } else {
    console.log('Template purchase updated successfully');
  }
  
  // Track conversion event if from Adobe plugin
  const source = session.metadata?.source;
  if (source === 'adobe_plugin') {
    try {
      const { error: conversionError } = await supabase
        .from('plugin_conversion_events')
        .insert({
          event_type: 'subscription_converted',
          source: 'adobe_plugin',
          user_email: session.customer_email,
          plugin_version: session.metadata?.pluginVersion || null,
          metadata: {
            plan_id: session.metadata?.plan_id,
            billing_cycle: session.metadata?.billing_cycle,
            amount_total: session.amount_total,
            currency: session.currency,
            stripe_session_id: session.id,
            converted_at: new Date().toISOString()
          }
        });
      
      if (conversionError) {
        console.error('Error tracking conversion:', conversionError);
      } else {
        console.log('Subscription conversion tracked successfully for Adobe plugin user');
      }
    } catch (e) {
      console.error('Conversion tracking failed:', e);
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Additional payment success logic can be added here
  // For example, send confirmation emails, update user credits, etc.
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Handle payment failures
  // For example, notify users, update payment status, etc.
}

async function handleSubscriptionChange(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription;
  console.log('Subscription change:', event.type, subscription.id);
  
  // Handle subscription changes
  // Update subscription status in database, notify users, etc.
}