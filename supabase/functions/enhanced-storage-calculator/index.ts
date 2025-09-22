import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ENHANCED-STORAGE] Calculating storage for user: ${user.id}`);

    // Get user's subscription plan
    const { data: subscriptionData } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const planId = subscriptionData?.plan_id || 'free';
    console.log(`[ENHANCED-STORAGE] User plan: ${planId}`);

    // Calculate base storage limits based on plan
    const baseStorageLimits = {
      free: 1 * 1024 * 1024 * 1024, // 1GB
      student: 5 * 1024 * 1024 * 1024, // 5GB  
      starter: 20 * 1024 * 1024 * 1024, // 20GB
      professional: 1 * 1024 * 1024 * 1024 * 1024, // 1TB for 250k images
      enterprise: 5 * 1024 * 1024 * 1024 * 1024 // 5TB
    };

    const baseLimit = baseStorageLimits[planId as keyof typeof baseStorageLimits] || baseStorageLimits.free;

    // Get actual storage usage from artwork table
    const { data: artworkData, error: artworkError } = await supabaseAdmin
      .from('artwork')
      .select('file_size, original_file_size, compressed_file_size')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (artworkError) {
      console.error('Error fetching artwork data:', artworkError);
      throw artworkError;
    }

    // Calculate total storage used
    let totalStorageUsed = 0;
    let artworkCount = 0;

    if (artworkData && artworkData.length > 0) {
      artworkCount = artworkData.length;
      totalStorageUsed = artworkData.reduce((total, artwork) => {
        // Use the largest file size (original, compressed, or current)
        const maxSize = Math.max(
          artwork.file_size || 0,
          artwork.original_file_size || 0,
          artwork.compressed_file_size || 0,
          1048576 // Minimum 1MB if no size recorded
        );
        return total + maxSize;
      }, 0);
    }

    console.log(`[ENHANCED-STORAGE] Calculated ${artworkCount} artworks using ${totalStorageUsed} bytes`);

    // Get storage addons
    const { data: addonsData } = await supabaseAdmin
      .from('storage_addons')
      .select('storage_amount_gb')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const addonStorage = addonsData?.reduce((total, addon) => {
      return total + (addon.storage_amount_gb * 1024 * 1024 * 1024);
    }, 0) || 0;

    const totalStorageLimit = baseLimit + addonStorage;

    // Calculate usage metrics
    const storageUsedGB = (totalStorageUsed / (1024 * 1024 * 1024)).toFixed(2);
    const storageLimitGB = (totalStorageLimit / (1024 * 1024 * 1024)).toFixed(2);
    const usagePercentage = totalStorageLimit > 0 ? Math.round((totalStorageUsed / totalStorageLimit) * 100) : 0;

    const isNearLimit = usagePercentage >= 80;
    const isOverLimit = usagePercentage >= 100;

    // Update user_storage_usage table
    const { error: updateError } = await supabaseAdmin
      .from('user_storage_usage')
      .upsert({
        user_id: user.id,
        storage_used_bytes: totalStorageUsed,
        storage_limit_bytes: totalStorageLimit,
        artwork_count: artworkCount,
        last_calculated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating storage usage:', updateError);
    }

    // Record performance metrics
    await supabaseAdmin.from('performance_metrics').insert({
      metric_type: 'storage_calculation',
      metric_value: artworkCount,
      metric_unit: 'items',
      source_component: 'enhanced_storage_calculator',
      additional_data: {
        storage_used_bytes: totalStorageUsed,
        storage_limit_bytes: totalStorageLimit,
        plan_id: planId,
        addon_storage_gb: addonStorage / (1024 * 1024 * 1024)
      }
    });

    const result = {
      storage_used_bytes: totalStorageUsed,
      storage_limit_bytes: totalStorageLimit,
      artwork_count: artworkCount,
      storage_used_gb: storageUsedGB,
      storage_limit_gb: storageLimitGB,
      usage_percentage: usagePercentage,
      active_addons: addonsData || [],
      is_near_limit: isNearLimit,
      is_over_limit: isOverLimit,
      last_calculated_at: new Date().toISOString(),
      plan_id: planId,
      base_storage_gb: (baseLimit / (1024 * 1024 * 1024)).toFixed(2),
      addon_storage_gb: (addonStorage / (1024 * 1024 * 1024)).toFixed(2)
    };

    console.log(`[ENHANCED-STORAGE] Storage calculation successful:`, result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Enhanced storage calculator error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});