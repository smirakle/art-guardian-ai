import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PARTNER-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in partner-webhook-handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  logStep("Processing checkout completed", { sessionId: session.id });
  
  const userId = session.metadata?.user_id;
  const tierId = session.metadata?.tier_id;
  const billingCycle = session.metadata?.billing_cycle || 'monthly';
  
  if (!userId || !tierId) {
    logStep("Missing metadata in session", { userId, tierId });
    return;
  }

  // Update subscription to active
  const subscriptionEnd = new Date();
  if (billingCycle === 'yearly') {
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
  } else {
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
  }

  await supabase.from('partner_subscriptions').upsert({
    user_id: userId,
    tier_id: tierId,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: subscriptionEnd.toISOString(),
    stripe_subscription_id: session.subscription,
    stripe_customer_id: session.customer,
    billing_cycle: billingCycle,
    api_calls_used: 0,
    api_calls_reset_at: subscriptionEnd.toISOString()
  }, { onConflict: 'user_id' });

  logStep("Subscription activated", { userId, tierId });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  logStep("Processing payment succeeded", { invoiceId: invoice.id });
  
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Reset API usage for the new billing period
  const { error } = await supabase
    .from('partner_subscriptions')
    .update({
      api_calls_used: 0,
      api_calls_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'active'
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    logStep("Error resetting API usage", { error: error.message });
  } else {
    logStep("API usage reset for new billing period", { subscriptionId });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  logStep("Processing payment failed", { invoiceId: invoice.id });
  
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Mark subscription as past_due
  await supabase
    .from('partner_subscriptions')
    .update({
      status: 'past_due'
    })
    .eq('stripe_subscription_id', subscriptionId);

  logStep("Subscription marked as past_due", { subscriptionId });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing subscription updated", { subscriptionId: subscription.id });
  
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Update subscription status and period
  await supabase.from('partner_subscriptions').update({
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  }).eq('stripe_subscription_id', subscription.id);

  logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  logStep("Processing subscription deleted", { subscriptionId: subscription.id });
  
  // Mark subscription as cancelled
  await supabase.from('partner_subscriptions').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  }).eq('stripe_subscription_id', subscription.id);

  logStep("Subscription cancelled", { subscriptionId: subscription.id });
}