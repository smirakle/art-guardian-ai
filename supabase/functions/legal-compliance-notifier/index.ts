import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();

    switch (action) {
      case 'send_purchase_confirmation':
        return await sendPurchaseConfirmation(data, supabase);
      
      case 'send_compliance_reminder':
        return await sendComplianceReminder(data, supabase);
      
      case 'send_deadline_warning':
        return await sendDeadlineWarning(data, supabase);
      
      case 'check_due_reminders':
        return await checkDueReminders(supabase);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Legal compliance notifier error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendPurchaseConfirmation(data: any, supabase: any) {
  const { userEmail, userName, templateTitle, documentId } = data;
  
  const emailResponse = await resend.emails.send({
    from: "TSMO Legal <legal@tsmo.com>",
    to: [userEmail],
    subject: `Legal Document Ready: ${templateTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Legal Document is Ready!</h1>
        
        <p>Dear ${userName},</p>
        
        <p>Thank you for your purchase! Your <strong>${templateTitle}</strong> has been successfully generated and is ready for download.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What's Next?</h3>
          <ol>
            <li><strong>Review your document</strong> - Carefully review all details</li>
            <li><strong>Customize if needed</strong> - Make any necessary adjustments</li>
            <li><strong>Get legal review</strong> - Consider professional review for complex matters</li>
            <li><strong>Take action</strong> - File, send, or implement as appropriate</li>
          </ol>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Important:</strong> This document is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for specific legal matters.</p>
        </div>
        
        <p>
          <a href="https://your-domain.com/legal-templates?document=${documentId}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Your Document
          </a>
        </p>
        
        <p>Best regards,<br>The TSMO Legal Team</p>
        
        <hr style="margin: 30px 0; border: none; height: 1px; background: #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          Need help? Contact us at legal@tsmo.com or visit our help center.
        </p>
      </div>
    `,
  });

  return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendComplianceReminder(data: any, supabase: any) {
  const { userEmail, userName, complianceType, deadlineDate, documentTitle } = data;
  
  const daysUntilDeadline = Math.ceil((new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const emailResponse = await resend.emails.send({
    from: "TSMO Legal <legal@tsmo.com>",
    to: [userEmail],
    subject: `Legal Compliance Reminder: ${complianceType} - ${daysUntilDeadline} days remaining`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Compliance Deadline Approaching</h1>
        
        <p>Dear ${userName},</p>
        
        <p>This is a reminder that you have an upcoming compliance deadline for your legal document:</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Action Required</h3>
          <p><strong>Document:</strong> ${documentTitle}</p>
          <p><strong>Compliance Type:</strong> ${complianceType}</p>
          <p><strong>Deadline:</strong> ${new Date(deadlineDate).toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> ${daysUntilDeadline} days</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Recommended Actions:</h3>
          <ul>
            <li>Review your document for accuracy</li>
            <li>Gather any required supporting documentation</li>
            <li>Consider consulting with a legal professional</li>
            <li>Submit or file before the deadline</li>
          </ul>
        </div>
        
        <p>
          <a href="https://your-domain.com/legal-templates" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Manage Compliance
          </a>
        </p>
        
        <p>Best regards,<br>The TSMO Legal Team</p>
      </div>
    `,
  });

  return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendDeadlineWarning(data: any, supabase: any) {
  const { userEmail, userName, complianceType, deadlineDate, documentTitle } = data;
  
  const emailResponse = await resend.emails.send({
    from: "TSMO Legal <legal@tsmo.com>",
    to: [userEmail],
    subject: `🚨 URGENT: Legal Deadline Tomorrow - ${complianceType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626; text-align: center;">⚠️ URGENT LEGAL DEADLINE ⚠️</h1>
        
        <p>Dear ${userName},</p>
        
        <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h2 style="color: #dc2626; margin-top: 0; text-align: center;">DEADLINE TOMORROW</h2>
          <p style="text-align: center; font-size: 18px; margin: 0;">
            Your <strong>${complianceType}</strong> deadline is <strong>tomorrow (${new Date(deadlineDate).toLocaleDateString()})</strong>
          </p>
        </div>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Document Details:</h3>
          <p><strong>Document:</strong> ${documentTitle}</p>
          <p><strong>Compliance Type:</strong> ${complianceType}</p>
          <p><strong>Deadline:</strong> ${new Date(deadlineDate).toLocaleDateString()}</p>
        </div>
        
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">IMMEDIATE ACTION REQUIRED:</h3>
          <ol style="margin: 0;">
            <li>Complete and submit your document TODAY</li>
            <li>Ensure all required information is included</li>
            <li>Keep confirmation records</li>
            <li>Contact legal counsel if needed</li>
          </ol>
        </div>
        
        <p style="text-align: center;">
          <a href="https://your-domain.com/legal-templates" 
             style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 18px; font-weight: bold;">
            TAKE ACTION NOW
          </a>
        </p>
        
        <p style="color: #dc2626; font-weight: bold;">Missing this deadline may result in legal consequences or loss of rights.</p>
        
        <p>Best regards,<br>The TSMO Legal Team</p>
      </div>
    `,
  });

  return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkDueReminders(supabase: any) {
  // Check for compliance items that need reminders
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Get items needing reminders
  const { data: dueItems, error } = await supabase
    .from('legal_compliance_tracking')
    .select(`
      *,
      legal_document_generations!inner(
        template_title,
        user_id
      ),
      profiles!inner(
        full_name,
        email
      )
    `)
    .in('status', ['initiated', 'pending'])
    .or(`deadline_date.lte.${tomorrow.toISOString()},deadline_date.lte.${threeDaysFromNow.toISOString()},deadline_date.lte.${sevenDaysFromNow.toISOString()}`)
    .eq('reminder_sent', false);

  if (error) {
    throw error;
  }

  // Send appropriate reminders
  for (const item of dueItems || []) {
    const daysUntilDeadline = Math.ceil((new Date(item.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 1) {
      // Send urgent warning
      await sendDeadlineWarning({
        userEmail: item.profiles.email,
        userName: item.profiles.full_name,
        complianceType: item.compliance_type,
        deadlineDate: item.deadline_date,
        documentTitle: item.legal_document_generations.template_title
      }, supabase);
    } else if (daysUntilDeadline <= 3) {
      // Send reminder
      await sendComplianceReminder({
        userEmail: item.profiles.email,
        userName: item.profiles.full_name,
        complianceType: item.compliance_type,
        deadlineDate: item.deadline_date,
        documentTitle: item.legal_document_generations.template_title
      }, supabase);
    }
    
    // Mark reminder as sent
    await supabase
      .from('legal_compliance_tracking')
      .update({ reminder_sent: true })
      .eq('id', item.id);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    processed: dueItems?.length || 0,
    message: `Processed ${dueItems?.length || 0} compliance reminders`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}