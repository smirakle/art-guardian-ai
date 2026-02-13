import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running continuous scan scheduler...');

    // Get all active real-time monitoring sessions with their portfolio frequency settings
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('realtime_monitoring_sessions')
      .select(`
        *,
        artwork(*),
        portfolios!inner(monitoring_frequency)
      `)
      .eq('status', 'active');

    if (sessionsError) throw sessionsError;

    // Filter sessions based on their monitoring frequency
    const now = Date.now();
    const sessionsToScan = sessions.filter(session => {
      const lastScan = session.last_scan_at ? new Date(session.last_scan_at).getTime() : 0;
      const frequency = session.portfolios?.monitoring_frequency || 'daily';
      
      let scanInterval: number;
      switch (frequency) {
        case 'realtime':
          scanInterval = 5 * 60 * 1000; // 5 minutes
          break;
        case 'hourly':
          scanInterval = 60 * 60 * 1000; // 1 hour
          break;
        case 'daily':
          scanInterval = 24 * 60 * 60 * 1000; // 24 hours
          break;
        case 'weekly':
          scanInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
          break;
        case 'monthly':
          scanInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
          break;
        default:
          scanInterval = 24 * 60 * 60 * 1000; // Default to daily
      }
      
      return (now - lastScan) >= scanInterval;
    });

    console.log(`Found ${sessionsToScan.length} sessions to scan (${sessions.length} total active)`);

    const results = [];

    for (const session of sessionsToScan) {
      try {
        // Get artwork file URL
        const { data: fileData } = await supabaseClient.storage
          .from('artwork')
          .createSignedUrl(session.artwork.file_paths[0], 3600);

        if (fileData?.signedUrl) {
          // Trigger real-time monitoring engine
          const { data: scanResult, error: scanError } = await supabaseClient.functions.invoke(
            'realtime-monitoring-engine',
            {
              body: {
                sessionId: session.id,
                artworkId: session.artwork_id,
                imageUrl: fileData.signedUrl,
                platforms: session.platforms_enabled || ['google_images', 'tineye']
              }
            }
          );

          if (scanError) {
            console.error(`Scan error for session ${session.id}:`, scanError);
          } else {
            console.log(`Scan completed for session ${session.id}:`, scanResult);
            results.push({
              sessionId: session.id,
              status: 'completed',
              matchesFound: scanResult.matchesFound
            });
          }
        }
      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
        results.push({
          sessionId: session.id,
          status: 'error',
          error: error.message
        });
      }
    }

    // Update monitoring stats
    await supabaseClient
      .from('realtime_monitoring_stats')
      .insert({
        total_sessions_active: sessions.length,
        scans_completed: results.filter(r => r.status === 'completed').length,
        scans_failed: results.filter(r => r.status === 'error').length,
        total_matches_found: results.reduce((sum, r) => sum + (r.matchesFound || 0), 0),
        recorded_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        totalActiveSessions: sessions.length,
        sessionsProcessed: sessionsToScan.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in continuous-scan-scheduler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});