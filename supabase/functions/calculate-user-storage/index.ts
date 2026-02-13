import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CALCULATE-STORAGE] ${step}${detailsStr}`);
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
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Calculate user storage usage
    const { error: calcError } = await supabaseClient.rpc('calculate_user_storage_usage', {
      user_id_param: user.id
    });

    if (calcError) {
      logStep("Error calculating storage", { error: calcError });
      throw new Error(`Storage calculation error: ${calcError.message}`);
    }

    // Get updated storage info
    const { data: storageData, error: storageError } = await supabaseClient
      .from('user_storage_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (storageError) {
      logStep("Error fetching storage data", { error: storageError });
      throw new Error(`Storage fetch error: ${storageError.message}`);
    }

    // Get active addons
    const { data: addons, error: addonsError } = await supabaseClient
      .from('storage_addons')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (addonsError) {
      logStep("Error fetching addons", { error: addonsError });
    }

    const response = {
      storage_used_bytes: storageData.storage_used_bytes,
      storage_limit_bytes: storageData.storage_limit_bytes,
      artwork_count: storageData.artwork_count,
      last_calculated_at: storageData.last_calculated_at,
      storage_used_gb: (storageData.storage_used_bytes / 1073741824).toFixed(2),
      storage_limit_gb: (storageData.storage_limit_bytes / 1073741824).toFixed(2),
      usage_percentage: Math.round((storageData.storage_used_bytes / storageData.storage_limit_bytes) * 100),
      active_addons: addons || [],
      is_near_limit: (storageData.storage_used_bytes / storageData.storage_limit_bytes) > 0.8,
      is_over_limit: storageData.storage_used_bytes > storageData.storage_limit_bytes
    };

    logStep("Storage calculation successful", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in calculate-user-storage", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});