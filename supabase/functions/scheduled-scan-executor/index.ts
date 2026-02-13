import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Scheduled scan executor started at:', new Date().toISOString());

    // Get all pending scheduled scans that are due
    const now = new Date().toISOString();
    const { data: dueScans, error: fetchError } = await supabase
      .from('scheduled_scans')
      .select('*')
      .eq('is_active', true)
      .or(`scheduled_time.lte.${now},next_execution.lte.${now}`)
      .is('last_executed', null);

    if (fetchError) {
      throw new Error(`Failed to fetch due scans: ${fetchError.message}`);
    }

    console.log(`Found ${dueScans?.length || 0} due scans to execute`);

    // Execute each due scan
    for (const scan of dueScans || []) {
      try {
        await executeScheduledScan(scan);
      } catch (error) {
        console.error(`Error executing scan ${scan.id}:`, error);
        
        // Log the error
        await supabase
          .from('scan_execution_log')
          .insert({
            scheduled_scan_id: scan.id,
            execution_type: 'scheduled',
            status: 'failed',
            error_message: error.message,
            started_at: now,
            completed_at: new Date().toISOString()
          });
      }
    }

    // Also execute continuous monitoring schedules
    await executeContinuousMonitoring();

    return new Response(JSON.stringify({
      success: true,
      message: `Executed ${dueScans?.length || 0} scheduled scans`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in scheduled-scan-executor:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeScheduledScan(scan: any) {
  const startTime = new Date().toISOString();
  console.log(`Executing scheduled scan: ${scan.id} - Type: ${scan.scan_type}`);

  // Create execution log entry
  const { data: logEntry } = await supabase
    .from('scan_execution_log')
    .insert({
      scheduled_scan_id: scan.id,
      execution_type: 'scheduled',
      status: 'running',
      started_at: startTime
    })
    .select()
    .single();

  try {
    let scanResult;

    // Execute the appropriate scan type
    switch (scan.scan_type) {
      case 'monitoring':
        scanResult = await executeMonitoringScan(scan.artwork_id);
        break;
      case 'deep-scan':
        scanResult = await executeDeepScan(scan.artwork_id);
        break;
      case 'social-media':
        scanResult = await executeSocialMediaScan(scan.artwork_id);
        break;
      case 'comprehensive':
        scanResult = await executeComprehensiveScan(scan.artwork_id);
        break;
      default:
        throw new Error(`Unknown scan type: ${scan.scan_type}`);
    }

    // Update execution log with success
    if (logEntry) {
      await supabase
        .from('scan_execution_log')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results: scanResult
        })
        .eq('id', logEntry.id);
    }

    // Update scheduled scan with execution info
    const nextExecution = calculateNextExecution(scan);
    await supabase
      .from('scheduled_scans')
      .update({
        last_executed: startTime,
        next_execution: nextExecution,
        is_active: scan.schedule_type === 'once' ? false : scan.is_active
      })
      .eq('id', scan.id);

    console.log(`Completed scheduled scan: ${scan.id}`);

  } catch (error) {
    console.error(`Failed to execute scan ${scan.id}:`, error);
    
    // Update execution log with failure
    if (logEntry) {
      await supabase
        .from('scan_execution_log')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logEntry.id);
    }
    
    throw error;
  }
}

async function executeMonitoringScan(artworkId: string) {
  console.log(`Executing monitoring scan for artwork: ${artworkId}`);

  // Fetch artwork to get file path
  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('id, file_paths')
    .eq('id', artworkId)
    .maybeSingle();

  if (artworkError) throw new Error(`Failed to fetch artwork: ${artworkError.message}`);
  if (!artwork) throw new Error(`Artwork not found: ${artworkId}`);

  // Generate signed URL for the image
  let imageUrl: string | undefined;
  if (artwork.file_paths?.length > 0) {
    const { data: fileData } = await supabase.storage
      .from('artwork')
      .createSignedUrl(artwork.file_paths[0], 3600);
    imageUrl = fileData?.signedUrl;
  }

  if (!imageUrl) {
    throw new Error(`No image URL available for artwork: ${artworkId}`);
  }

  // Call with both required parameters
  const { data, error } = await supabase.functions.invoke('real-copyright-monitor', {
    body: { artworkId, imageUrl }
  });

  if (error) throw error;
  return data;
}

async function executeDeepScan(artworkId: string) {
  console.log(`Executing deep scan for artwork: ${artworkId}`);

  // 1. Fetch artwork from DB
  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('id, user_id, title, tags, file_paths')
    .eq('id', artworkId)
    .maybeSingle();

  if (artworkError) throw new Error(`Failed to fetch artwork: ${artworkError.message}`);
  if (!artwork) throw new Error(`Artwork not found: ${artworkId}`);

  // 2. Build signed URL for first file
  let contentUrl: string | undefined;
  if (artwork.file_paths?.length > 0) {
    const { data: fileData } = await supabase.storage
      .from('artwork')
      .createSignedUrl(artwork.file_paths[0], 3600);
    contentUrl = fileData?.signedUrl;
  }

  // 3. Build search terms from title + tags
  const searchTerms = [artwork.title, ...(artwork.tags || [])].filter(Boolean);

  // 4. Invoke with correct parameters
  const { data, error } = await supabase.functions.invoke('comprehensive-web-scanner', {
    body: {
      contentType: 'photo',
      contentUrl,
      searchTerms,
      includeDeepWeb: true,
      userId: artwork.user_id
    }
  });

  if (error) throw error;
  return data;
}

async function executeSocialMediaScan(artworkId: string) {
  console.log(`Executing social media scan for artwork: ${artworkId}`);
  
  // Call the real-social-media-monitor function
  const { data, error } = await supabase.functions.invoke('real-social-media-monitor', {
    body: { artworkId }
  });

  if (error) throw error;
  return data;
}

async function executeComprehensiveScan(artworkId: string) {
  console.log(`Executing comprehensive scan for artwork: ${artworkId}`);
  
  // Execute all scan types
  const results = await Promise.allSettled([
    executeMonitoringScan(artworkId),
    executeDeepScan(artworkId),
    executeSocialMediaScan(artworkId)
  ]);

  return {
    monitoring: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
    deepScan: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
    socialMedia: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message }
  };
}

async function executeContinuousMonitoring() {
  console.log('Checking continuous monitoring schedules...');
  
  const now = new Date();
  const { data: activeSchedules, error } = await supabase
    .from('monitoring_schedules')
    .select('*')
    .eq('is_active', true)
    .eq('is_24_7_enabled', true);

  if (error || !activeSchedules?.length) {
    console.log('No active 24/7 monitoring schedules found');
    return;
  }

  for (const schedule of activeSchedules) {
    try {
      // Check if it's time to run based on frequency
      const lastRun = await getLastMonitoringRun(schedule.id);
      const nextRunTime = new Date(lastRun.getTime() + (schedule.frequency_minutes * 60 * 1000));
      
      if (now >= nextRunTime) {
        await executeMonitoringSchedule(schedule);
      }
    } catch (error) {
      console.error(`Error processing monitoring schedule ${schedule.id}:`, error);
    }
  }
}

async function executeMonitoringSchedule(schedule: any) {
  console.log(`Executing monitoring schedule: ${schedule.id} - ${schedule.schedule_name}`);
  
  const startTime = new Date().toISOString();
  
  // Create execution log
  const { data: logEntry } = await supabase
    .from('scan_execution_log')
    .insert({
      monitoring_schedule_id: schedule.id,
      execution_type: 'continuous',
      status: 'running',
      started_at: startTime
    })
    .select()
    .single();

  try {
    // Get artworks to monitor
    let artworkIds = schedule.artwork_ids;
    
    if (!artworkIds || artworkIds.length === 0) {
      // Monitor all user's artwork
      const { data: userArtwork } = await supabase
        .from('artwork')
        .select('id')
        .eq('user_id', schedule.user_id);
      
      artworkIds = userArtwork?.map(a => a.id) || [];
    }

    const results = [];
    
    // Execute scans for each artwork
    for (const artworkId of artworkIds) {
      for (const scanType of schedule.scan_types) {
        try {
          let scanResult;
          
          switch (scanType) {
            case 'monitoring':
              scanResult = await executeMonitoringScan(artworkId);
              break;
            case 'deepfake-detection':
              scanResult = await supabase.functions.invoke('real-deepfake-detector', {
                body: { artworkId }
              });
              break;
            default:
              console.warn(`Unknown scan type in schedule: ${scanType}`);
              continue;
          }
          
          results.push({ artworkId, scanType, result: scanResult });
        } catch (error) {
          console.error(`Error scanning artwork ${artworkId} with ${scanType}:`, error);
          results.push({ artworkId, scanType, error: error.message });
        }
      }
    }

    // Update execution log with success
    if (logEntry) {
      await supabase
        .from('scan_execution_log')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results: { scans: results }
        })
        .eq('id', logEntry.id);
    }

    console.log(`Completed monitoring schedule: ${schedule.id}`);

  } catch (error) {
    console.error(`Failed to execute monitoring schedule ${schedule.id}:`, error);
    
    if (logEntry) {
      await supabase
        .from('scan_execution_log')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', logEntry.id);
    }
  }
}

async function getLastMonitoringRun(scheduleId: string): Promise<Date> {
  const { data } = await supabase
    .from('scan_execution_log')
    .select('started_at')
    .eq('monitoring_schedule_id', scheduleId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  return data ? new Date(data.started_at) : new Date(0);
}

function calculateNextExecution(scan: any): string | null {
  if (scan.schedule_type === 'once') {
    return null;
  }

  const lastExecuted = new Date(scan.last_executed || scan.scheduled_time);
  
  switch (scan.schedule_type) {
    case 'daily':
      return new Date(lastExecuted.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(lastExecuted.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'monthly':
      const nextMonth = new Date(lastExecuted);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString();
    case 'continuous':
      return new Date(lastExecuted.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour
    default:
      return null;
  }
}