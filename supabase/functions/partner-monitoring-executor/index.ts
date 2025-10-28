import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Partner Monitoring Executor: Starting execution');

    // Get all active monitoring jobs that need to run
    const { data: jobsToRun, error: jobsError } = await supabase
      .from('partner_monitoring_jobs')
      .select('*')
      .eq('status', 'active')
      .lte('next_scan_at', new Date().toISOString())
      .limit(50); // Process up to 50 jobs per run

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      throw jobsError;
    }

    console.log(`Found ${jobsToRun?.length || 0} jobs to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each job
    for (const job of jobsToRun || []) {
      try {
        console.log(`Processing job ${job.id} for URL: ${job.content_url}`);

        // Execute scan based on monitor type
        let scanResult;
        if (job.monitor_type === 'image') {
          scanResult = await supabase.functions.invoke('real-image-search', {
            body: { imageUrl: job.content_url }
          });
        } else if (job.monitor_type === 'video') {
          scanResult = await supabase.functions.invoke('deepfake-detection', {
            body: { url: job.content_url }
          });
        } else if (job.monitor_type === 'article' || job.monitor_type === 'content') {
          scanResult = await supabase.functions.invoke('analyze-article-content', {
            body: { url: job.content_url }
          });
        } else {
          console.log(`Skipping unsupported monitor type: ${job.monitor_type}`);
          continue;
        }

        const matchesFound = scanResult.data?.matches?.length || 0;
        const threatLevel = scanResult.data?.threat_level || 'low';

        // Save scan result
        const { data: scanRecord, error: scanError } = await supabase
          .from('partner_scan_results')
          .insert({
            api_key_id: job.api_key_id,
            user_id: job.user_id,
            monitoring_job_id: job.id,
            scan_type: job.monitor_type,
            content_url: job.content_url,
            status: 'completed',
            matches_found: matchesFound,
            threat_level: threatLevel,
            scan_data: scanResult.data || {}
          })
          .select()
          .single();

        if (scanError) {
          console.error(`Failed to save scan result for job ${job.id}:`, scanError);
        }

        // Calculate next scan time
        const nextScanTime = calculateNextScanTime(job.scan_frequency);

        // Update monitoring job
        const { error: updateError } = await supabase
          .from('partner_monitoring_jobs')
          .update({
            last_scan_at: new Date().toISOString(),
            next_scan_at: nextScanTime.toISOString(),
            total_scans: (job.total_scans || 0) + 1,
            matches_found: (job.matches_found || 0) + matchesFound,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        if (updateError) {
          console.error(`Failed to update job ${job.id}:`, updateError);
        }

        // Trigger webhook if configured and matches found
        if (job.webhook_url && scanRecord) {
          EdgeRuntime.waitUntil(
            deliverWebhook(job.webhook_url, {
              event: 'scan.completed',
              job_id: job.id,
              scan_id: scanRecord.id,
              content_url: job.content_url,
              matches_found: matchesFound,
              threat_level: threatLevel,
              timestamp: new Date().toISOString()
            })
          );
        }

        processedCount++;
        console.log(`Successfully processed job ${job.id}`);

      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
        errorCount++;
        
        // Update job status to failed if it keeps failing
        await supabase
          .from('partner_monitoring_jobs')
          .update({
            status: 'failed',
            metadata: { 
              last_error: jobError.message,
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', job.id);
      }
    }

    console.log(`Execution complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      errors: errorCount,
      total_jobs: jobsToRun?.length || 0,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Partner Monitoring Executor Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateNextScanTime(frequency: string): Date {
  const now = new Date();
  
  switch(frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
  }
}

async function deliverWebhook(url: string, payload: any): Promise<void> {
  try {
    console.log(`Delivering webhook to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TSMO-Partner-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed with status ${response.status}`);
    } else {
      console.log('Webhook delivered successfully');
    }
  } catch (error) {
    console.error('Webhook delivery error:', error);
  }
}
