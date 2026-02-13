import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-STORAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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

    const { storage_amount_gb, addon_type = 'extra_storage' } = await req.json();
    
    if (!storage_amount_gb || storage_amount_gb <= 0) {
      throw new Error("Invalid storage amount");
    }

    // Pricing tiers
    const pricingTiers = {
      1: 299,    // $2.99 for 1GB
      5: 999,    // $9.99 for 5GB
      10: 1599,  // $15.99 for 10GB
      25: 2999,  // $29.99 for 25GB
      50: 4999,  // $49.99 for 50GB
      100: 7999  // $79.99 for 100GB
    };

    const price = pricingTiers[storage_amount_gb as keyof typeof pricingTiers];
    if (!price) {
      throw new Error("Invalid storage amount. Available: 1GB, 5GB, 10GB, 25GB, 50GB, 100GB");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${storage_amount_gb}GB Storage Add-on`,
              description: `Additional ${storage_amount_gb}GB of storage space for your account`
            },
            unit_amount: price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?storage_purchase=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?storage_purchase=cancelled`,
      metadata: {
        user_id: user.id,
        storage_amount_gb: storage_amount_gb.toString(),
        addon_type: addon_type
      }
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Record the addon in our database (pending until payment confirmed)
    const { error: addonError } = await supabaseClient
      .from('storage_addons')
      .insert({
        user_id: user.id,
        addon_type,
        storage_amount_gb,
        monthly_price_cents: price,
        stripe_product_id: session.line_items?.data[0]?.price?.product as string,
        stripe_price_id: session.line_items?.data[0]?.price?.id as string,
        is_active: false, // Will be activated by webhook
        created_at: new Date().toISOString()
      });

    if (addonError) {
      logStep("Error creating addon record", { error: addonError });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      storage_amount_gb,
      monthly_price_cents: price
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in purchase-storage-addon", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});