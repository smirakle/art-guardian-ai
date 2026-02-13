import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorReport {
  message: string;
  stack?: string;
  userId?: string;
  requestPath?: string;
  userAgent?: string;
  severity?: 'error' | 'warning' | 'critical';
  metadata?: Record<string, any>;
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

    const errorReport: ErrorReport = await req.json();

    // Get client IP and user agent from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log error to database
    const { data: errorLog, error: logError } = await supabaseAdmin
      .from('error_logs')
      .insert({
        error_message: errorReport.message,
        error_stack: errorReport.stack,
        user_id: errorReport.userId,
        request_path: errorReport.requestPath,
        user_agent: userAgent,
        ip_address: clientIP,
        severity: errorReport.severity || 'error',
        metadata: errorReport.metadata || {}
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log error:', logError);
      throw logError;
    }

    // Record production metric for error tracking
    await supabaseAdmin.rpc('record_production_metric', {
      metric_name_param: 'error_count',
      metric_value_param: 1,
      metric_type_param: 'counter',
      labels_param: {
        severity: errorReport.severity || 'error',
        path: errorReport.requestPath,
        user_id: errorReport.userId
      }
    });

    // For critical errors, create additional alerts
    if (errorReport.severity === 'critical') {
      await supabaseAdmin
        .from('security_alerts')
        .insert({
          alert_type: 'critical_error',
          severity: 'high',
          title: 'Critical Production Error',
          description: `Critical error in production: ${errorReport.message}`,
          metadata: {
            error_id: errorLog.id,
            path: errorReport.requestPath,
            user_id: errorReport.userId
          }
        });
    }

    console.log(`Error logged successfully: ${errorLog.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      errorId: errorLog.id,
      message: 'Error logged successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error monitor function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to log error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});