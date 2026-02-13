import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'alert' | 'digest' | 'urgent' | 'status_update';
  user_id?: string;
  alert_id?: string;
  trademark_id?: string;
  schedule?: 'immediate' | 'daily' | 'weekly';
}

function logError(error: any, context: string, userId?: string) {
  console.error(`[TRADEMARK_NOTIFICATIONS] ${context}:`, {
    error: error.message,
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString(),
  });
}

function logActivity(action: string, userId: string, details: any) {
  console.log(`[TRADEMARK_NOTIFICATIONS] ${action}:`, {
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}

async function getUser(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) return null;

    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    
    return {
      id: userId,
      email: user?.email,
      full_name: profile.full_name,
      username: profile.username
    };
  } catch (error) {
    logError(error, 'getUser', userId);
    return null;
  }
}

async function sendEmail(to: string, subject: string, html: string, from?: string): Promise<boolean> {
  if (!resend) {
    console.log('Email would be sent:', { to, subject, preview: html.substring(0, 100) });
    return true; // Simulate success when Resend is not configured
  }

  try {
    await resend.emails.send({
      from: from || 'TSMO Trademark Alerts <alerts@yourdomain.com>',
      to: [to],
      subject,
      html,
    });
    return true;
  } catch (error) {
    logError(error, 'sendEmail');
    return false;
  }
}

async function sendUrgentAlert(userId: string, alertId: string): Promise<boolean> {
  try {
    const user = await getUser(userId);
    if (!user || !user.email) return false;

    const { data: alert } = await supabase
      .from('trademark_alerts')
      .select(`
        *,
        trademarks!inner(trademark_name, jurisdiction)
      `)
      .eq('id', alertId)
      .single();

    if (!alert) return false;

    const trademark = alert.trademarks;
    
    const subject = `🚨 URGENT: High-Risk Trademark Conflict Detected - ${trademark.trademark_name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Urgent Trademark Alert</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
          .details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
          .risk-high { color: #dc2626; font-weight: bold; }
          .confidence-score { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 URGENT TRADEMARK ALERT</h1>
            <p>Immediate action may be required</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <h2>High-Risk Conflict Detected</h2>
              <p><strong>Trademark:</strong> ${trademark.trademark_name}</p>
              <p><strong>Jurisdiction:</strong> ${trademark.jurisdiction}</p>
              <p><strong>Alert Type:</strong> ${alert.alert_type}</p>
              <p><strong>Risk Level:</strong> <span class="risk-high">${alert.severity.toUpperCase()}</span></p>
              <p><strong>Confidence:</strong> <span class="confidence-score">${Math.round(alert.confidence_score * 100)}%</span></p>
            </div>
            
            <h3>Conflict Details</h3>
            <div class="details">
              <p><strong>Title:</strong> ${alert.title}</p>
              <p><strong>Description:</strong> ${alert.description}</p>
              ${alert.source_url ? `<p><strong>Source:</strong> <a href="${alert.source_url}" target="_blank">${alert.source_domain}</a></p>` : ''}
              <p><strong>Detected:</strong> ${new Date(alert.created_at).toLocaleString()}</p>
            </div>
            
            <h3>Recommended Actions</h3>
            <ul>
              <li><strong>Immediate:</strong> Review the conflict details in your dashboard</li>
              <li><strong>Consider:</strong> Consulting with an IP attorney</li>
              <li><strong>Document:</strong> Evidence of the conflict for legal proceedings</li>
              <li><strong>Monitor:</strong> Additional developments in this matter</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', 'https://')}/trademark-monitoring?alert=${alertId}" class="button">
                View Alert Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated alert from TSMO Trademark Monitoring System</p>
            <p>© ${new Date().getFullYear()} TSMO. All rights reserved.</p>
            <p><a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail(user.email, subject, html);
    
    if (emailSent) {
      // Log notification
      await supabase.from('legal_notifications').insert({
        user_id: userId,
        notification_type: 'urgent_trademark_alert',
        title: subject,
        message: `High-risk trademark conflict detected for ${trademark.trademark_name}`,
        action_url: `/trademark-monitoring?alert=${alertId}`,
        priority: 'urgent',
        metadata: { alert_id: alertId, trademark_id: alert.trademark_id }
      });
      
      logActivity('urgent_alert_sent', userId, { alertId, trademarkName: trademark.trademark_name });
    }
    
    return emailSent;
  } catch (error) {
    logError(error, 'sendUrgentAlert', userId);
    return false;
  }
}

async function sendDailyDigest(userId: string): Promise<boolean> {
  try {
    const user = await getUser(userId);
    if (!user || !user.email) return false;

    // Get alerts from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: alerts } = await supabase
      .from('trademark_alerts')
      .select(`
        *,
        trademarks!inner(trademark_name, jurisdiction)
      `)
      .eq('user_id', userId)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });

    const { data: scans } = await supabase
      .from('trademark_monitoring_scans')
      .select(`
        *,
        trademarks!inner(trademark_name)
      `)
      .eq('user_id', userId)
      .gte('started_at', yesterday)
      .eq('scan_status', 'completed')
      .order('started_at', { ascending: false });

    if (!alerts?.length && !scans?.length) {
      return true; // No activity to report
    }

    const highRiskAlerts = alerts?.filter(a => a.severity === 'high') || [];
    const mediumRiskAlerts = alerts?.filter(a => a.severity === 'medium') || [];
    const lowRiskAlerts = alerts?.filter(a => a.severity === 'low') || [];

    const subject = `📊 Daily Trademark Monitoring Report - ${alerts?.length || 0} New Alerts`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Trademark Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
          .summary-card { background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e5e7eb; }
          .summary-number { font-size: 24px; font-weight: bold; color: #1f2937; }
          .summary-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .alert-item { background-color: #f9fafb; border-left: 4px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 0 6px 6px 0; }
          .alert-high { border-left-color: #dc2626; }
          .alert-medium { border-left-color: #f59e0b; }
          .alert-low { border-left-color: #10b981; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Trademark Report</h1>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="content">
            <h2>Activity Summary</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-number">${alerts?.length || 0}</div>
                <div class="summary-label">New Alerts</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${scans?.length || 0}</div>
                <div class="summary-label">Scans Completed</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${highRiskAlerts.length}</div>
                <div class="summary-label">High Risk</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${mediumRiskAlerts.length + lowRiskAlerts.length}</div>
                <div class="summary-label">Med/Low Risk</div>
              </div>
            </div>
            
            ${highRiskAlerts.length > 0 ? `
            <h3>🚨 High-Risk Alerts (${highRiskAlerts.length})</h3>
            ${highRiskAlerts.map(alert => `
              <div class="alert-item alert-high">
                <strong>${alert.trademarks.trademark_name}</strong> - ${alert.title}<br>
                <small>Confidence: ${Math.round(alert.confidence_score * 100)}% | ${new Date(alert.created_at).toLocaleString()}</small>
              </div>
            `).join('')}
            ` : ''}
            
            ${mediumRiskAlerts.length > 0 ? `
            <h3>⚠️ Medium-Risk Alerts (${mediumRiskAlerts.length})</h3>
            ${mediumRiskAlerts.slice(0, 5).map(alert => `
              <div class="alert-item alert-medium">
                <strong>${alert.trademarks.trademark_name}</strong> - ${alert.title}<br>
                <small>Confidence: ${Math.round(alert.confidence_score * 100)}% | ${new Date(alert.created_at).toLocaleString()}</small>
              </div>
            `).join('')}
            ${mediumRiskAlerts.length > 5 ? `<p>... and ${mediumRiskAlerts.length - 5} more</p>` : ''}
            ` : ''}
            
            ${scans?.length > 0 ? `
            <h3>📋 Recent Scans (${scans.length})</h3>
            ${scans.slice(0, 3).map(scan => `
              <div class="alert-item">
                <strong>${scan.trademarks.trademark_name}</strong> - ${scan.scan_type} scan<br>
                <small>Results: ${scan.total_results_found || 0} | Duration: ${scan.scan_duration_seconds || 0}s</small>
              </div>
            `).join('')}
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', 'https://')}/trademark-monitoring" class="button">
                View Full Dashboard
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>TSMO Trademark Monitoring System - Daily Report</p>
            <p>© ${new Date().getFullYear()} TSMO. All rights reserved.</p>
            <p><a href="#" style="color: #6b7280;">Unsubscribe</a> | <a href="#" style="color: #6b7280;">Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail(user.email, subject, html);
    
    if (emailSent) {
      logActivity('daily_digest_sent', userId, { 
        alertsCount: alerts?.length || 0, 
        scansCount: scans?.length || 0,
        highRiskCount: highRiskAlerts.length
      });
    }
    
    return emailSent;
  } catch (error) {
    logError(error, 'sendDailyDigest', userId);
    return false;
  }
}

async function sendStatusUpdate(userId: string, trademarkId: string): Promise<boolean> {
  try {
    const user = await getUser(userId);
    if (!user || !user.email) return false;

    const { data: trademark } = await supabase
      .from('trademarks')
      .select('*')
      .eq('id', trademarkId)
      .eq('user_id', userId)
      .single();

    if (!trademark) return false;

    // Get latest scan results
    const { data: latestScan } = await supabase
      .from('trademark_monitoring_scans')
      .select('*')
      .eq('trademark_id', trademarkId)
      .eq('scan_status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const { data: recentAlerts } = await supabase
      .from('trademark_alerts')
      .select('*')
      .eq('trademark_id', trademarkId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const subject = `📈 Trademark Status Update - ${trademark.trademark_name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trademark Status Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-card { background-color: #f0f9ff; border: 2px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .metric { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .metric:last-child { border-bottom: none; }
          .metric-value { font-weight: bold; color: #1f2937; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Trademark Status Update</h1>
            <p>${trademark.trademark_name}</p>
          </div>
          
          <div class="content">
            <div class="status-card">
              <h3>Current Status</h3>
              <div class="metric">
                <span>Trademark Status:</span>
                <span class="metric-value">${trademark.status}</span>
              </div>
              <div class="metric">
                <span>Jurisdiction:</span>
                <span class="metric-value">${trademark.jurisdiction}</span>
              </div>
              <div class="metric">
                <span>Registration Number:</span>
                <span class="metric-value">${trademark.registration_number || 'Pending'}</span>
              </div>
              <div class="metric">
                <span>Last Monitored:</span>
                <span class="metric-value">${trademark.last_monitored_at ? new Date(trademark.last_monitored_at).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
            
            ${latestScan ? `
            <h3>Latest Scan Results</h3>
            <div class="status-card">
              <div class="metric">
                <span>Scan Date:</span>
                <span class="metric-value">${new Date(latestScan.completed_at).toLocaleDateString()}</span>
              </div>
              <div class="metric">
                <span>Total Results:</span>
                <span class="metric-value">${latestScan.total_results_found || 0}</span>
              </div>
              <div class="metric">
                <span>High Risk Matches:</span>
                <span class="metric-value">${latestScan.high_risk_matches || 0}</span>
              </div>
              <div class="metric">
                <span>Medium Risk Matches:</span>
                <span class="metric-value">${latestScan.medium_risk_matches || 0}</span>
              </div>
            </div>
            ` : ''}
            
            ${recentAlerts && recentAlerts.length > 0 ? `
            <h3>Recent Alerts (Last 7 Days)</h3>
            <div class="status-card">
              <p><strong>${recentAlerts.length} alerts</strong> detected in the past week</p>
              <ul>
                ${recentAlerts.slice(0, 3).map(alert => `
                  <li>${alert.title} - <span style="color: ${alert.severity === 'high' ? '#dc2626' : alert.severity === 'medium' ? '#f59e0b' : '#10b981'}">${alert.severity}</span></li>
                `).join('')}
              </ul>
              ${recentAlerts.length > 3 ? `<p>... and ${recentAlerts.length - 3} more</p>` : ''}
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', 'https://')}/trademark-monitoring" class="button">
                View Full Report
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>TSMO Trademark Monitoring System - Status Update</p>
            <p>© ${new Date().getFullYear()} TSMO. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail(user.email, subject, html);
    
    if (emailSent) {
      logActivity('status_update_sent', userId, { 
        trademarkId, 
        trademarkName: trademark.trademark_name,
        alertsCount: recentAlerts?.length || 0
      });
    }
    
    return emailSent;
  } catch (error) {
    logError(error, 'sendStatusUpdate', userId);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    
    let result = false;
    
    switch (request.type) {
      case 'alert':
        if (!request.user_id || !request.alert_id) {
          return new Response(JSON.stringify({ error: 'user_id and alert_id required for alert notifications' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendUrgentAlert(request.user_id, request.alert_id);
        break;
        
      case 'digest':
        if (!request.user_id) {
          return new Response(JSON.stringify({ error: 'user_id required for digest notifications' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendDailyDigest(request.user_id);
        break;
        
      case 'status_update':
        if (!request.user_id || !request.trademark_id) {
          return new Response(JSON.stringify({ error: 'user_id and trademark_id required for status updates' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        result = await sendStatusUpdate(request.user_id, request.trademark_id);
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({ 
      success: result,
      type: request.type,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    logError(error, 'notification_handler');
    
    return new Response(JSON.stringify({ 
      error: 'Failed to send notification',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});