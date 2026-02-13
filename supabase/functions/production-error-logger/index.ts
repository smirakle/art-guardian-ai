import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { 
      error_type, 
      error_message, 
      error_stack, 
      user_id, 
      request_path, 
      request_method, 
      user_agent, 
      ip_address, 
      metadata 
    } = await req.json();

    // Log error to performance metrics table (using existing table)
    const { data, error } = await supabaseClient
      .from('performance_metrics')
      .insert({
        metric_type: 'error',
        metric_unit: 'count',
        metric_value: 1,
        source_component: error_type || 'unknown',
        additional_data: {
          error_message,
          error_stack,
          user_id,
          request_path,
          request_method,
          user_agent,
          ip_address,
          metadata: metadata || {},
          severity: getSeverity(error_type, error_message),
          timestamp: new Date().toISOString()
        }
      });

    if (error) {
      console.error('Error logging to database:', error);
    }

    // Check if this is a critical error that needs immediate attention
    const severity = getSeverity(error_type, error_message);
    if (severity === 'critical') {
      // Could trigger alerts here (email, Slack, etc.)
      console.error('CRITICAL ERROR DETECTED:', {
        error_type,
        error_message,
        user_id,
        request_path,
        timestamp: new Date().toISOString()
      });
    }

    // Return error ID for tracking
    const errorId = data?.[0]?.id || crypto.randomUUID();

    return new Response(
      JSON.stringify({
        success: true,
        error_id: errorId,
        severity,
        logged_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in production error logger:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to log error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getSeverity(errorType: string, errorMessage: string): 'low' | 'medium' | 'high' | 'critical' {
  if (!errorType || !errorMessage) return 'medium';
  
  const type = errorType.toLowerCase();
  const message = errorMessage.toLowerCase();
  
  // Critical errors
  if (
    type.includes('database') ||
    type.includes('auth') ||
    type.includes('payment') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('500') ||
    message.includes('internal server error')
  ) {
    return 'critical';
  }
  
  // High priority errors
  if (
    type.includes('validation') ||
    type.includes('permission') ||
    type.includes('unauthorized') ||
    message.includes('404') ||
    message.includes('403') ||
    message.includes('401')
  ) {
    return 'high';
  }
  
  // Medium priority errors
  if (
    type.includes('ui') ||
    type.includes('component') ||
    message.includes('400')
  ) {
    return 'medium';
  }
  
  return 'low';
}