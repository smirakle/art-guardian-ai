import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLY-PROMO-CODE] ${step}${detailsStr}`);
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
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new Error(`Authentication error: ${userError?.message || 'User not found'}`);
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { promoCode, subscriptionId } = await req.json();
    
    if (!promoCode) {
      throw new Error("Promo code is required");
    }
    
    logStep("Validating promo code", { promoCode });

    // Validate promo code using database function
    const { data: validation, error: validationError } = await supabaseClient
      .rpc('validate_promo_code', { code_param: promoCode.toUpperCase() });

    if (validationError) {
      logStep("Validation error", { error: validationError });
      throw new Error(validationError.message);
    }

    if (!validation || !validation.valid) {
      throw new Error(validation?.error || "Invalid promo code");
    }

    logStep("Promo code validated", validation);

    // Apply discount to subscription if subscription ID provided
    if (subscriptionId) {
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          promo_code_discount: validation.discount_percentage,
          promo_code_id: validation.code_id,
          metadata: {
            ...{ promo_code: promoCode.toUpperCase() },
            promo_applied_at: new Date().toISOString(),
            is_lifetime_discount: validation.is_lifetime
          }
        })
        .eq('id', subscriptionId);

      if (updateError) {
        logStep("Error updating subscription", { error: updateError });
        throw new Error(`Failed to apply promo code: ${updateError.message}`);
      }
    }

    // Record redemption
    const { error: redeemError } = await supabaseClient
      .rpc('redeem_promo_code', { 
        code_param: promoCode.toUpperCase(),
        subscription_id_param: subscriptionId 
      });

    if (redeemError) {
      logStep("Error redeeming promo code", { error: redeemError });
      throw new Error(`Failed to redeem promo code: ${redeemError.message}`);
    }

    logStep("Promo code applied successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Promo code applied successfully!",
      discount_percentage: validation.discount_percentage,
      is_lifetime: validation.is_lifetime,
      uses_remaining: validation.uses_remaining - 1
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in apply-promo-code", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
