import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Continuous deepfake scanner triggered');

    // Get all active monitoring sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('realtime_monitoring_sessions')
      .select('*')
      .eq('status', 'active')
      .eq('session_type', 'deepfake');

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      throw sessionsError;
    }

    console.log(`Found ${sessions?.length || 0} active deepfake monitoring sessions`);

    let totalScanned = 0;
    
    // Invoke monitoring engine for each active session
    for (const session of sessions || []) {
      try {
        const { error: invokeError } = await supabase.functions.invoke('deepfake-monitoring-engine', {
          body: { sessionId: session.id }
        });

        if (invokeError) {
          console.error(`Error invoking engine for session ${session.id}:`, invokeError);
        } else {
          totalScanned++;
        }
      } catch (error) {
        console.error(`Failed to process session ${session.id}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sessions_processed: totalScanned,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in continuous deepfake scanner:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
