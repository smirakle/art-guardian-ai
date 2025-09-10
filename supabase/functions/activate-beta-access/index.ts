import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-BETA-ACCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use the service role key to perform writes (upsert) in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { promoCode } = await req.json();
    
    // Validate promo code
    if (!promoCode || promoCode.toLowerCase() !== 'betatester') {
      throw new Error("Invalid promo code");
    }
    logStep("Promo code validated", { promoCode });

    // Check if user already has an active subscription
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .single();

    if (existingSub) {
      throw new Error("User already has an active subscription");
    }
    logStep("No existing active subscription found");

    // Create 60-day free beta subscription
    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days

    const { data: newSub, error: subError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: 'starter',
        status: 'active',
        billing_cycle: 'monthly',
        current_period_start: currentDate.toISOString(),
        current_period_end: endDate.toISOString(),
        stripe_subscription_id: null, // No Stripe involvement
        social_media_addon: false,
        deepfake_addon: false,
        metadata: {
          source: 'beta_tester_promo',
          promo_code: 'BETATESTER',
          activated_at: currentDate.toISOString()
        }
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (subError) {
      logStep("Error creating subscription", { error: subError });
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }
    logStep("Subscription created successfully", { subscriptionId: newSub.id });

    // Log the beta access activation
    const { error: logError } = await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: 'beta_access_activated',
        resource_type: 'subscription',
        resource_id: newSub.id.toString(),
        details: {
          promo_code: 'BETATESTER',
          plan: 'starter',
          duration_days: 60,
          email: user.email
        }
      });

    if (logError) {
      logStep("Warning: Failed to log activation", { error: logError });
    }

    logStep("Beta access activated successfully", { 
      userId: user.id, 
      subscriptionId: newSub.id,
      expiresAt: endDate.toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Beta access activated successfully!",
      subscription: {
        plan_id: newSub.plan_id,
        expires_at: newSub.current_period_end
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in activate-beta-access", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});