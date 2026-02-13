import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-ORIGIN": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPLY-PROMO] ${step}${detailsStr}`);
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
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      throw new Error("Authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { promoCode } = await req.json();
    
    if (!promoCode) {
      throw new Error("Promo code is required");
    }

    // Validate promo code
    const { data: validation, error: validationError } = await supabaseClient
      .rpc('validate_promo_code', { code_param: promoCode });

    if (validationError || !validation?.valid) {
      throw new Error(validation?.error || "Invalid promo code");
    }

    logStep("Promo code validated", { promoCode, discount: validation.discount_percentage });

    // Store promo code in user metadata for use during checkout
    const { error: metadataError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.raw_user_meta_data,
          promo_code: promoCode.toUpperCase(),
          promo_discount: validation.discount_percentage,
          promo_is_lifetime: validation.is_lifetime
        }
      }
    );

    if (metadataError) {
      logStep("Warning: Could not update user metadata", { error: metadataError });
    }

    return new Response(JSON.stringify({
      success: true,
      discount_percentage: validation.discount_percentage,
      is_lifetime: validation.is_lifetime
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in apply-promo-discount", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
