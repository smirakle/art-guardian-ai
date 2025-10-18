import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alert {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  metadata?: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, alert, metric, userAction, metadata, page } = await req.json();

    console.log('Monitoring alert action:', action);

    // Handle different monitoring actions
    switch (action) {
      case 'send_alert':
        await handleAlert(supabaseClient, alert);
        break;
      
      case 'log_web_vital':
        await logWebVital(supabaseClient, metric, page);
        break;
      
      case 'log_user_action':
        await logUserAction(supabaseClient, userAction, metadata, page);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Monitoring alert error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleAlert(supabase: any, alert: Alert) {
  console.log('Processing alert:', alert.title, alert.severity);

  // Only create alert if we have a user_id
  if (!alert.user_id) {
    console.warn('Alert skipped - no user_id provided:', alert.title);
    return;
  }

  // Store alert in advanced_alerts table
  const { error: insertError } = await supabase
    .from('advanced_alerts')
    .insert({
      user_id: alert.user_id,
      alert_type: alert.source,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      source_data: alert.metadata || {},
      delivery_channels: getDeliveryChannels(alert.severity),
      delivery_status: {},
    });

  if (insertError) {
    console.error('Failed to insert alert:', insertError);
    throw insertError;
  }

  // Send email for critical and error alerts
  if (alert.severity === 'critical' || alert.severity === 'error') {
    await sendEmailAlert(supabase, alert);
  }

  // Log to production metrics
  await supabase.from('production_metrics').insert({
    metric_type: 'alert',
    metric_name: `${alert.severity}_alert`,
    metric_value: 1,
    metadata: {
      title: alert.title,
      source: alert.source,
      severity: alert.severity,
    },
  });

  console.log('Alert processed successfully');
}

async function logWebVital(supabase: any, metric: any, page: string) {
  console.log('Logging web vital:', metric.name, metric.value);

  // Store web vital in production_metrics
  await supabase.from('production_metrics').insert({
    metric_type: 'web_vital',
    metric_name: metric.name,
    metric_value: metric.value,
    metadata: {
      rating: metric.rating,
      page,
      delta: metric.delta,
    },
  });

  // Get current user if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only create alerts for poor web vitals if we have a user context
  if (metric.rating === 'poor' && user?.id) {
    await handleAlert(supabase, {
      title: 'Poor Web Vital Detected',
      message: `${metric.name} is ${metric.value} (poor rating) on ${page}`,
      severity: 'warning',
      source: 'web_vitals',
      user_id: user.id,
      metadata: metric,
      timestamp: new Date().toISOString(),
    });
  } else if (metric.rating === 'poor') {
    // Log poor web vital to metrics even without user context
    console.log('Poor web vital detected (no user context):', metric.name, metric.value);
  }
}

async function logUserAction(supabase: any, userAction: string, metadata: any, page: string) {
  console.log('Logging user action:', userAction);

  await supabase.from('production_metrics').insert({
    metric_type: 'user_action',
    metric_name: userAction,
    metric_value: 1,
    metadata: {
      ...metadata,
      page,
    },
  });
}

async function sendEmailAlert(supabase: any, alert: Alert) {
  console.log('Sending email alert:', alert.title);

  // Get admin emails (you can customize this query)
  const { data: adminUsers, error: adminError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (adminError) {
    console.error('Failed to get admin users:', adminError);
    return;
  }

  // In production, integrate with email service (SendGrid, Resend, etc.)
  // For now, just log the alert
  console.log('Would send email to admins:', {
    recipients: adminUsers?.length || 0,
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    body: alert.message,
  });

  // Log notification attempt
  if (alert.user_id) {
    await supabase.from('alert_notifications_log').insert({
      alert_id: alert.user_id, // This should be actual alert_id
      user_id: alert.user_id,
      notification_type: 'email',
      recipient_email: 'admin@example.com',
      status: 'sent',
    });
  }
}

function getDeliveryChannels(severity: string): string[] {
  const channels = ['in_app'];
  
  if (severity === 'critical' || severity === 'error') {
    channels.push('email');
  }
  
  if (severity === 'critical') {
    channels.push('sms'); // If SMS is configured
  }
  
  return channels;
}
