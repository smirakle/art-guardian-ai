import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PARTNER-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier_id, billing_cycle = 'monthly' } = await req.json();
    if (!tier_id) throw new Error("tier_id is required");

    // Get tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from('partner_pricing_tiers')
      .select('*')
      .eq('id', tier_id)
      .eq('is_active', true)
      .single();

    if (tierError || !tier) throw new Error("Invalid tier selected");
    logStep("Tier found", { tierName: tier.tier_name, price: tier.monthly_price });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          user_id: user.id,
          tier_id: tier_id
        }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Calculate pricing based on billing cycle
    const unitAmount = billing_cycle === 'yearly' 
      ? Math.floor(tier.monthly_price * 10) // 20% discount for yearly
      : tier.monthly_price;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.tier_name} - Partner Subscription`,
              description: `${tier.api_calls_included.toLocaleString()} API calls/month, ${tier.rate_limit_per_hour} calls/hour limit`,
              metadata: {
                tier_id: tier.id,
                tier_name: tier.tier_name
              }
            },
            unit_amount: unitAmount,
            recurring: {
              interval: billing_cycle === 'yearly' ? 'year' : 'month'
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/partner-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/partner-pricing`,
      metadata: {
        user_id: user.id,
        tier_id: tier.id,
        billing_cycle: billing_cycle
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier_id: tier.id,
          billing_cycle: billing_cycle
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create pending subscription record
    const subscriptionEnd = new Date();
    if (billing_cycle === 'yearly') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    await supabaseClient.from('partner_subscriptions').upsert({
      user_id: user.id,
      tier_id: tier.id,
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: subscriptionEnd.toISOString(),
      api_calls_used: 0,
      stripe_session_id: session.id,
      billing_cycle: billing_cycle
    }, { onConflict: 'user_id' });

    logStep("Subscription record created/updated");

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-partner-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});