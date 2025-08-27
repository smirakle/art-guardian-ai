import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertNotificationRequest {
  alertId: string;
  alertType: string;
  userId: string;
  userEmail: string;
  userName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { alertId, alertType, userId, userEmail, userName }: AlertNotificationRequest = await req.json();

    if (!alertId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Alert ID and user email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending ${alertType} alert notification to ${userEmail} for alert ${alertId}`);

    let alert = null;
    
    // Handle test notifications differently
    if (alertType === 'test_notification' || alertId.startsWith('test-alert-')) {
      alert = {
        id: alertId,
        title: 'Test Security Alert',
        message: 'This is a test email notification from TSMO to verify your email alert settings are working properly.',
        threat_level: 'low',
        copyright_matches: null
      };
    } else {
      // Get real alert details
      const { data: alertData, error: alertError } = await supabase
        .from('monitoring_alerts')
        .select(`
          *,
          copyright_matches:match_id (
            *,
            artwork:artwork_id (*)
          )
        `)
        .eq('id', alertId)
        .single();

      if (alertError || !alertData) {
        console.error('Error fetching alert details:', alertError);
        return new Response(
          JSON.stringify({ error: "Alert not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      alert = alertData;
    }

    // Generate email content based on alert type
    const emailContent = generateEmailContent(alert, alertType, userName || 'User');

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "TSMO Alerts <onboarding@resend.dev>",
      to: [userEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Alert email sent successfully:", emailResponse);

    // Log the notification
    await supabase
      .from('alert_notifications_log')
      .insert({
        alert_id: alertId,
        user_id: userId,
        notification_type: 'email',
        recipient_email: userEmail,
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_id: emailResponse.data?.id
      });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Alert notification sent successfully" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error sending alert notification:", error);
    
    // Log failed notification
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { alertId, userId, userEmail } = await req.json();
      
      await supabase
        .from('alert_notifications_log')
        .insert({
          alert_id: alertId,
          user_id: userId,
          notification_type: 'email',
          recipient_email: userEmail,
          status: 'failed',
          error_message: error.message,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error("Failed to log notification error:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateEmailContent(alert: any, alertType: string, userName: string) {
  const match = alert.copyright_matches;
  const artwork = match?.artwork;
  
  let subject = "";
  let urgencyLevel = "Medium";
  let actionRequired = "Review Required";
  let bgColor = "#f59e0b"; // Yellow for medium priority
  
  // Customize content based on alert type
  switch (alertType) {
    case 'test_notification':
      subject = `✅ TSMO Test Notification - Email Settings Working`;
      urgencyLevel = "Test";
      actionRequired = "No Action Required";
      bgColor = "#10b981"; // Green for test
      break;
    case 'high_confidence_match':
    case 'high_threat':
      subject = `🚨 HIGH PRIORITY: Copyright Violation Detected`;
      urgencyLevel = "High";
      actionRequired = "Immediate Action Required";
      bgColor = "#dc2626"; // Red for high priority
      break;
    case 'deepfake_detected':
      subject = `🔍 DEEPFAKE ALERT: AI-Generated Content Detected`;
      urgencyLevel = "Critical";
      actionRequired = "Urgent Review Required";
      bgColor = "#7c2d12"; // Dark red for critical
      break;
    case 'dark_web_match':
      subject = `⚠️ DARK WEB ALERT: Content Found on Dark Web`;
      urgencyLevel = "Critical";
      actionRequired = "Legal Action May Be Required";
      bgColor = "#7c2d12"; // Dark red for critical
      break;
    default:
      subject = `📢 Copyright Match Alert: ${alert.title}`;
      urgencyLevel = "Medium";
      actionRequired = "Review Recommended";
      bgColor = "#f59e0b"; // Yellow for medium priority
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TSMO Alert Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        
        <!-- Header with urgency color -->
        <div style="background: linear-gradient(135deg, ${bgColor}, ${bgColor}dd); padding: 30px 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">TSMO Security Alert</h1>
          <div style="background-color: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-size: 14px; font-weight: 600;">
            ${urgencyLevel} Priority
          </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px;">
          <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Hello ${userName},</h2>
          
          <div style="background-color: #fef3c7; border-left: 4px solid ${bgColor}; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">
              ${alert.title}
            </p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
            ${alert.message}
          </p>

          ${artwork ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Affected Artwork:</h3>
            <p style="margin: 0; color: #6b7280; font-weight: 600;">${artwork.title}</p>
            ${artwork.description ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${artwork.description}</p>` : ''}
          </div>
          ` : ''}

          ${match ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Match Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li style="margin-bottom: 8px;"><strong>Source:</strong> ${match.source_domain || 'Unknown'}</li>
              <li style="margin-bottom: 8px;"><strong>Confidence:</strong> ${Math.round(match.match_confidence || 0)}%</li>
              <li style="margin-bottom: 8px;"><strong>Threat Level:</strong> ${match.threat_level || 'Medium'}</li>
              <li style="margin-bottom: 8px;"><strong>Match Type:</strong> ${match.match_type || 'Standard'}</li>
            </ul>
          </div>
          ` : ''}

          <!-- Action Required Section -->
          <div style="background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 24px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; font-size: 18px;">${actionRequired}</h3>
            <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 14px;">
              Please review this alert and take appropriate action to protect your intellectual property.
            </p>
            <a href="https://tsmo.ai/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              View Alert in Dashboard
            </a>
          </div>

          <!-- Next Steps -->
          <div style="margin: 30px 0;">
            <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 16px;">Recommended Next Steps:</h3>
            <ol style="color: #6b7280; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Review the detected match in your TSMO dashboard</li>
              <li style="margin-bottom: 8px;">Verify if this is unauthorized use of your content</li>
              <li style="margin-bottom: 8px;">Consider filing a DMCA takedown notice if appropriate</li>
              <li style="margin-bottom: 8px;">Document the violation for potential legal action</li>
              <li style="margin-bottom: 8px;">Set up additional monitoring if needed</li>
            </ol>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 40px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This alert was generated by TSMO's AI-powered monitoring system.<br>
              If you believe this is a false positive, please mark it as such in your dashboard.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">
              © 2025 TSMO. All rights reserved.<br>
              <a href="https://tsmo.ai/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe from alerts</a> | 
              <a href="https://tsmo.ai/help" style="color: #6b7280; text-decoration: underline;">Help Center</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}