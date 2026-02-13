import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupRequest {
  tableName?: string;
  dryRun?: boolean;
  forceCleanup?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const cleanupRequest: CleanupRequest = await req.json();

    console.log(`Data retention cleanup initiated`, cleanupRequest);

    // Get active data retention policies
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('data_retention_policies')
      .select('*')
      .eq('is_active', true)
      .order('table_name');

    if (policiesError) {
      console.error('Failed to fetch retention policies:', policiesError);
      throw policiesError;
    }

    const cleanupResults: Record<string, any> = {};
    let totalRecordsProcessed = 0;

    // Process each policy
    for (const policy of policies) {
      // Skip if specific table requested and this isn't it
      if (cleanupRequest.tableName && policy.table_name !== cleanupRequest.tableName) {
        continue;
      }

      // Skip if policy was recently run (within last 23 hours) unless forced
      if (!cleanupRequest.forceCleanup && policy.last_cleanup) {
        const lastCleanup = new Date(policy.last_cleanup);
        const hoursSinceLastRun = (Date.now() - lastCleanup.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastRun < 23) {
          console.log(`Skipping ${policy.table_name} - cleaned up ${hoursSinceLastRun.toFixed(1)} hours ago`);
          continue;
        }
      }

      try {
        const result = await cleanupTable(supabaseAdmin, policy, cleanupRequest.dryRun || false);
        cleanupResults[policy.table_name] = result;
        totalRecordsProcessed += result.records_affected;

        // Update last cleanup timestamp if not a dry run
        if (!cleanupRequest.dryRun) {
          await supabaseAdmin
            .from('data_retention_policies')
            .update({ 
              last_cleanup: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', policy.id);
        }

      } catch (error) {
        console.error(`Failed to cleanup ${policy.table_name}:`, error);
        cleanupResults[policy.table_name] = {
          status: 'error',
          error: error.message,
          records_affected: 0
        };
      }
    }

    // Record production metrics
    await supabaseAdmin.rpc('record_production_metric', {
      metric_name_param: 'data_retention_cleanup',
      metric_value_param: 1,
      metric_type_param: 'counter',
      labels_param: {
        tables_processed: Object.keys(cleanupResults).length,
        dry_run: cleanupRequest.dryRun ? 'true' : 'false',
        total_records: totalRecordsProcessed
      }
    });

    console.log(`Data retention cleanup completed. Processed ${totalRecordsProcessed} records across ${Object.keys(cleanupResults).length} tables`);

    return new Response(JSON.stringify({ 
      success: true, 
      cleanupResults,
      totalRecordsProcessed,
      dryRun: cleanupRequest.dryRun || false,
      message: cleanupRequest.dryRun ? 'Dry run completed' : 'Cleanup completed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Data retention cleanup error:', error);
    return new Response(JSON.stringify({ 
      error: 'Data retention cleanup failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function cleanupTable(supabase: any, policy: any, dryRun: boolean) {
  const { table_name, retention_days } = policy;
  
  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retention_days);
  const cutoffISOString = cutoffDate.toISOString();

  console.log(`Processing ${table_name} - removing records older than ${cutoffISOString} (${retention_days} days)`);

  try {
    if (dryRun) {
      // Count records that would be deleted
      const { count, error } = await supabase
        .from(table_name)
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffISOString);

      if (error) throw error;

      return {
        status: 'dry_run',
        records_affected: count || 0,
        cutoff_date: cutoffISOString,
        retention_days
      };

    } else {
      // Actually delete records
      const { data, error } = await supabase
        .from(table_name)
        .delete()
        .lt('created_at', cutoffISOString)
        .select('id');

      if (error) throw error;

      return {
        status: 'completed',
        records_affected: data?.length || 0,
        cutoff_date: cutoffISOString,
        retention_days
      };
    }

  } catch (error) {
    // Handle case where table doesn't have created_at column
    if (error.message?.includes('created_at')) {
      console.warn(`Table ${table_name} doesn't have created_at column, skipping`);
      return {
        status: 'skipped',
        reason: 'no_created_at_column',
        records_affected: 0
      };
    }
    throw error;
  }
}