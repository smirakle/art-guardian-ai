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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { operation, items, options = {} } = await req.json();
    
    if (!operation || !items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const batchSize = options.batchSize || 10;
    const maxConcurrency = Math.min(options.maxConcurrency || 5, 10); // Cap at 10 for safety
    
    console.log(`[BATCH-PROCESSOR] Starting ${operation} operation for ${items.length} items`);
    
    // Create batch processing record
    const { data: batchRecord, error: batchError } = await supabaseAdmin
      .from('batch_processing_queue')
      .insert({
        user_id: user.id,
        operation_type: operation,
        total_items: items.length,
        batch_size: batchSize,
        status: 'processing',
        started_at: new Date().toISOString(),
        metadata: { options }
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch record:', batchError);
      return new Response(
        JSON.stringify({ error: "Failed to create batch record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process items in controlled batches
    let processed = 0;
    let errors = 0;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch with concurrency control
      const batchPromises = batch.map(async (item, index) => {
        try {
          await new Promise(resolve => setTimeout(resolve, (index % maxConcurrency) * 50)); // Stagger requests
          
          switch (operation) {
            case 'bulk_artwork_update':
              return await processBulkArtworkUpdate(supabaseAdmin, user.id, item);
            case 'storage_cleanup':
              return await processStorageCleanup(supabaseAdmin, user.id, item);
            case 'metadata_enhancement':
              return await processMetadataEnhancement(supabaseAdmin, user.id, item);
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
        } catch (error) {
          console.error(`Error processing item ${i + index}:`, error);
          errors++;
          return { error: error.message, item };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      processed += batch.length;
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });

      // Update progress
      const progressPercentage = Math.round((processed / items.length) * 100);
      await supabaseAdmin
        .from('batch_processing_queue')
        .update({
          items_processed: processed,
          progress_percentage: progressPercentage
        })
        .eq('id', batchRecord.id);

      console.log(`[BATCH-PROCESSOR] Processed ${processed}/${items.length} items (${progressPercentage}%)`);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Mark batch as completed
    await supabaseAdmin
      .from('batch_processing_queue')
      .update({
        status: errors > 0 ? (errors === items.length ? 'failed' : 'completed') : 'completed',
        completed_at: new Date().toISOString(),
        error_message: errors > 0 ? `${errors} items failed to process` : null,
        metadata: { 
          ...options, 
          errors_count: errors,
          results_summary: {
            total: items.length,
            processed: processed,
            errors: errors
          }
        }
      })
      .eq('id', batchRecord.id);

    console.log(`[BATCH-PROCESSOR] Batch completed: ${processed - errors}/${items.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batchRecord.id,
        processed: processed - errors,
        errors: errors,
        total: items.length,
        results: results.slice(0, 10) // Return first 10 results for preview
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Batch processor error:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processBulkArtworkUpdate(supabase: any, userId: string, item: any) {
  const { artwork_id, updates } = item;
  
  const { data, error } = await supabase
    .from('artwork')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', artwork_id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, artwork_id, updated: data };
}

async function processStorageCleanup(supabase: any, userId: string, item: any) {
  const { file_path, artwork_id } = item;
  
  // Remove from storage
  const { error: storageError } = await supabase.storage
    .from('artwork')
    .remove([file_path]);

  if (storageError) throw storageError;

  // Update artwork record
  const { error: updateError } = await supabase
    .from('artwork')
    .update({ status: 'deleted' })
    .eq('id', artwork_id)
    .eq('user_id', userId);

  if (updateError) throw updateError;
  
  return { success: true, file_path, artwork_id };
}

async function processMetadataEnhancement(supabase: any, userId: string, item: any) {
  const { artwork_id, metadata_updates } = item;
  
  const { data, error } = await supabase
    .from('artwork')
    .update({
      ...metadata_updates,
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', artwork_id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, artwork_id, enhanced: data };
}