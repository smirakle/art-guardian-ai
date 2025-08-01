import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  userId: string;
  violationId?: string;
  type: 'high_confidence_violation' | 'dmca_filed' | 'violation_resolved' | 'weekly_summary';
  recipientEmail: string;
  violationData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { userId, violationId, type, recipientEmail, violationData }: EmailNotificationRequest = await req.json();

    console.log(`Processing email notification: ${type} for user ${userId}`);

    let emailContent = '';
    let subject = '';

    switch (type) {
      case 'high_confidence_violation':
        subject = '🚨 High-Confidence AI Training Violation Detected';
        emailContent = `
          <h2>AI Training Violation Alert</h2>
          <p>We've detected unauthorized use of your content in AI training with <strong>${(violationData?.confidence * 100)?.toFixed(1)}% confidence</strong>.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Violation Details:</h3>
            <ul>
              <li><strong>Source:</strong> ${violationData?.source_domain || 'Unknown'}</li>
              <li><strong>Confidence:</strong> ${(violationData?.confidence * 100)?.toFixed(1)}%</li>
              <li><strong>Violation Type:</strong> ${violationData?.violation_type || 'Unknown'}</li>
              <li><strong>Detected:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Review the violation details in your dashboard</li>
            <li>Consider filing a DMCA takedown notice</li>
            <li>Contact legal counsel if needed</li>
          </ul>
          
          <a href="${Deno.env.get('SITE_URL') || 'https://utneaqmbyjwxaqrrarpc.supabase.co'}/ai-protection?violation=${violationId}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            View Violation Details
          </a>
        `;
        break;

      case 'dmca_filed':
        subject = '📋 DMCA Notice Filed Successfully';
        emailContent = `
          <h2>DMCA Notice Filed</h2>
          <p>Your DMCA takedown notice has been successfully filed for the AI training violation.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Filing Details:</h3>
            <ul>
              <li><strong>Platform:</strong> ${violationData?.platform || 'Unknown'}</li>
              <li><strong>Filed Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Reference Number:</strong> ${violationData?.reference_number || 'Pending'}</li>
            </ul>
          </div>
          
          <p>We'll monitor the status of your DMCA notice and notify you of any updates.</p>
          
          <a href="${Deno.env.get('SITE_URL') || 'https://utneaqmbyjwxaqrrarpc.supabase.co'}/ai-protection" 
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            View DMCA Status
          </a>
        `;
        break;

      case 'violation_resolved':
        subject = '✅ AI Training Violation Resolved';
        emailContent = `
          <h2>Violation Successfully Resolved</h2>
          <p>Great news! The AI training violation has been successfully resolved.</p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Resolution Details:</h3>
            <ul>
              <li><strong>Resolution Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Action Taken:</strong> ${violationData?.action_taken || 'Content Removed'}</li>
              <li><strong>Platform:</strong> ${violationData?.platform || 'Unknown'}</li>
            </ul>
          </div>
          
          <p>Your content is now better protected from unauthorized AI training use.</p>
        `;
        break;

      case 'weekly_summary':
        // Get weekly stats from database
        const { data: weeklyStats } = await supabaseClient
          .from('ai_training_violations')
          .select('*')
          .eq('user_id', userId)
          .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const totalViolations = weeklyStats?.length || 0;
        const highConfidenceViolations = weeklyStats?.filter(v => v.confidence_score > 0.8).length || 0;
        const resolvedViolations = weeklyStats?.filter(v => v.status === 'resolved').length || 0;

        subject = '📊 Weekly AI Protection Summary';
        emailContent = `
          <h2>Your Weekly AI Protection Summary</h2>
          <p>Here's what happened with your AI protection this week:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>This Week's Activity:</h3>
            <ul>
              <li><strong>Total Violations Detected:</strong> ${totalViolations}</li>
              <li><strong>High-Confidence Violations:</strong> ${highConfidenceViolations}</li>
              <li><strong>Violations Resolved:</strong> ${resolvedViolations}</li>
              <li><strong>Protection Effectiveness:</strong> ${totalViolations > 0 ? ((resolvedViolations / totalViolations) * 100).toFixed(1) : 100}%</li>
            </ul>
          </div>
          
          ${totalViolations > 0 ? `
            <p><strong>Action Items:</strong></p>
            <ul>
              <li>Review any pending violations in your dashboard</li>
              <li>Consider upgrading protection methods if needed</li>
              <li>File DMCA notices for high-confidence violations</li>
            </ul>
          ` : '<p>🎉 Great job! No violations detected this week. Your content is well protected.</p>'}
          
          <a href="${Deno.env.get('SITE_URL') || 'https://utneaqmbyjwxaqrrarpc.supabase.co'}/ai-protection" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
             View Full Dashboard
          </a>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'AI Protection <noreply@resend.dev>',
      to: [recipientEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${emailContent}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated message from your AI Protection system. 
            You're receiving this because you have notifications enabled for AI training protection.
          </p>
          
          <p style="color: #666; font-size: 12px;">
            To manage your notification preferences, visit your dashboard settings.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse.id);

    // Log the notification in audit trail
    await supabaseClient.rpc('log_ai_protection_action', {
      user_id_param: userId,
      action_param: 'email_notification_sent',
      resource_type_param: 'notification',
      resource_id_param: emailResponse.id,
      details_param: {
        type: type,
        recipient: recipientEmail,
        violation_id: violationId
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.id,
        message: `${type} notification sent successfully`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in ai-protection-email-notifier function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);