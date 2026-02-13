import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the request body
    const { 
      userId, 
      planId, 
      billingCycle = 'monthly',
      socialMediaAddon = false,
      deepfakeAddon = false,
      stripeCustomerId,
      stripeSubscriptionId,
      promoCode,
      lifetimeDiscount,
      promoCodeId
    } = await req.json();

    if (!userId || !planId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, planId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate subscription end date (1 month or 1 year from now)
    const currentPeriodEnd = new Date();
    if (billingCycle === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // For Professional plan, deepfake monitoring is included
    const actualDeepfakeAddon = planId === 'professional' ? false : deepfakeAddon;

    // Create or update subscription
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        billing_cycle: billingCycle,
        social_media_addon: socialMediaAddon,
        deepfake_addon: actualDeepfakeAddon,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        promo_code_discount: lifetimeDiscount ? parseInt(lifetimeDiscount) : 0,
        promo_code_id: promoCodeId || null,
        metadata: promoCode ? {
          promo_code: promoCode,
          promo_applied_at: new Date().toISOString(),
          is_lifetime_discount: true
        } : null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: data,
        message: "Subscription created successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});