import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GDPRRequest {
  action: 'consent' | 'data_export' | 'data_deletion' | 'consent_withdrawal';
  userId?: string;
  consentType?: string;
  consentGiven?: boolean;
  consentVersion?: string;
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

    const gdprRequest: GDPRRequest = await req.json();

    // Get client IP and user agent from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`GDPR request received: ${gdprRequest.action} for user ${gdprRequest.userId}`);

    switch (gdprRequest.action) {
      case 'consent':
        return await handleConsentLogging(supabaseAdmin, gdprRequest, clientIP, userAgent);
      
      case 'data_export':
        return await handleDataExport(supabaseAdmin, gdprRequest.userId!);
      
      case 'data_deletion':
        return await handleDataDeletion(supabaseAdmin, gdprRequest.userId!);
      
      case 'consent_withdrawal':
        return await handleConsentWithdrawal(supabaseAdmin, gdprRequest, clientIP, userAgent);
      
      default:
        throw new Error(`Unknown GDPR action: ${gdprRequest.action}`);
    }

  } catch (error) {
    console.error('GDPR compliance error:', error);
    return new Response(JSON.stringify({ 
      error: 'GDPR request failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleConsentLogging(
  supabase: any, 
  request: GDPRRequest, 
  clientIP: string, 
  userAgent: string
) {
  // Log consent record
  const { data: consentLog, error: logError } = await supabase
    .from('gdpr_consent_logs')
    .insert({
      user_id: request.userId,
      consent_type: request.consentType || 'general',
      consent_given: request.consentGiven || false,
      consent_version: request.consentVersion || '1.0',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'gdpr_compliance_function'
      }
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to log consent:', logError);
    throw logError;
  }

  // Record production metric
  await supabase.rpc('record_production_metric', {
    metric_name_param: 'gdpr_consent_logged',
    metric_value_param: 1,
    metric_type_param: 'counter',
    labels_param: {
      consent_type: request.consentType || 'general',
      consent_given: request.consentGiven ? 'true' : 'false'
    }
  });

  console.log(`Consent logged: ${consentLog.id}`);

  return new Response(JSON.stringify({ 
    success: true, 
    consentId: consentLog.id,
    message: 'Consent recorded successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function handleDataExport(supabase: any, userId: string) {
  // Collect all user data from various tables
  const userDataTables = [
    'profiles',
    'artwork',
    'subscriptions',
    'portfolios',
    'ai_protection_records',
    'copyright_matches',
    'legal_documents',
    'gdpr_consent_logs'
  ];

  const exportData: Record<string, any> = {
    export_timestamp: new Date().toISOString(),
    user_id: userId,
    data: {}
  };

  // Fetch data from each table
  for (const table of userDataTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        exportData.data[table] = data;
        console.log(`Exported ${data.length} records from ${table}`);
      }
    } catch (error) {
      console.warn(`Failed to export from ${table}:`, error);
      exportData.data[table] = { error: error.message };
    }
  }

  // Record the export request
  await supabase.rpc('record_production_metric', {
    metric_name_param: 'gdpr_data_export',
    metric_value_param: 1,
    metric_type_param: 'counter',
    labels_param: {
      user_id: userId,
      tables_exported: userDataTables.length
    }
  });

  console.log(`Data export completed for user: ${userId}`);

  return new Response(JSON.stringify({ 
    success: true, 
    exportData,
    message: 'Data export completed successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function handleDataDeletion(supabase: any, userId: string) {
  // Tables where user data should be deleted (careful order due to foreign keys)
  const deletionOrder = [
    'gdpr_consent_logs',
    'ai_protection_records',
    'copyright_matches', 
    'portfolio_items',
    'portfolios',
    'legal_documents',
    'artwork',
    'subscriptions',
    'profiles'
  ];

  const deletionResults: Record<string, any> = {};

  // Delete from each table in order
  for (const table of deletionOrder) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
        .select('id');

      if (!error) {
        deletionResults[table] = {
          deleted_count: data?.length || 0,
          status: 'success'
        };
        console.log(`Deleted ${data?.length || 0} records from ${table}`);
      } else {
        deletionResults[table] = {
          deleted_count: 0,
          status: 'error',
          error: error.message
        };
      }
    } catch (error) {
      console.warn(`Failed to delete from ${table}:`, error);
      deletionResults[table] = {
        deleted_count: 0,
        status: 'error',
        error: error.message
      };
    }
  }

  // Record the deletion request
  await supabase.rpc('record_production_metric', {
    metric_name_param: 'gdpr_data_deletion',
    metric_value_param: 1,
    metric_type_param: 'counter',
    labels_param: {
      user_id: userId,
      tables_processed: deletionOrder.length
    }
  });

  console.log(`Data deletion completed for user: ${userId}`);

  return new Response(JSON.stringify({ 
    success: true, 
    deletionResults,
    message: 'Data deletion completed' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function handleConsentWithdrawal(
  supabase: any, 
  request: GDPRRequest, 
  clientIP: string, 
  userAgent: string
) {
  // Log consent withdrawal
  const { data: withdrawalLog, error: logError } = await supabase
    .from('gdpr_consent_logs')
    .insert({
      user_id: request.userId,
      consent_type: request.consentType || 'general',
      consent_given: false,
      consent_version: request.consentVersion || '1.0',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'withdrawal',
        source: 'gdpr_compliance_function'
      }
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to log consent withdrawal:', logError);
    throw logError;
  }

  // Record production metric
  await supabase.rpc('record_production_metric', {
    metric_name_param: 'gdpr_consent_withdrawn',
    metric_value_param: 1,
    metric_type_param: 'counter',
    labels_param: {
      consent_type: request.consentType || 'general',
      user_id: request.userId
    }
  });

  console.log(`Consent withdrawal logged: ${withdrawalLog.id}`);

  return new Response(JSON.stringify({ 
    success: true, 
    withdrawalId: withdrawalLog.id,
    message: 'Consent withdrawal recorded successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}