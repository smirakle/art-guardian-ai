import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComplianceNotifierRequest {
  action: 'schedule_reminder' | 'send_reminder' | 'process_queue';
  compliance_id?: string;
  reminder_id?: string;
  reminder_type?: string;
  scheduled_date?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: ComplianceNotifierRequest = await req.json();

    switch (requestData.action) {
      case 'schedule_reminder':
        return await scheduleReminder(user.id, requestData);
      case 'send_reminder':
        return await sendReminder(requestData);
      case 'process_queue':
        return await processReminderQueue();
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in legal-compliance-notifier:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function scheduleReminder(userId: string, request: ComplianceNotifierRequest) {
  if (!request.compliance_id || !request.reminder_type || !request.scheduled_date) {
    throw new Error('Missing required fields for scheduling reminder');
  }

  // Create reminder using the database function
  const { data, error } = await supabase.rpc('schedule_compliance_reminder', {
    compliance_id_param: request.compliance_id,
    reminder_type_param: request.reminder_type,
    scheduled_date_param: request.scheduled_date
  });

  if (error) throw error;

  // Create a notification for the user
  await createNotification(userId, {
    type: 'compliance_reminder',
    title: 'Compliance Reminder Scheduled',
    message: `A ${request.reminder_type.replace('_', ' ')} reminder has been scheduled for ${request.scheduled_date}`,
    priority: 'normal',
    metadata: {
      compliance_id: request.compliance_id,
      reminder_type: request.reminder_type,
      scheduled_date: request.scheduled_date
    }
  });

  return new Response(
    JSON.stringify({ success: true, reminder_id: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendReminder(request: ComplianceNotifierRequest) {
  if (!request.reminder_id) {
    throw new Error('Reminder ID is required');
  }

  // Get reminder details
  const { data: reminderData, error: reminderError } = await supabase
    .from('compliance_reminders')
    .select(`
      *,
      legal_compliance_tracking (
        compliance_type,
        jurisdiction,
        deadline_date,
        user_id
      )
    `)
    .eq('id', request.reminder_id)
    .single();

  if (reminderError || !reminderData) {
    throw new Error('Reminder not found');
  }

  // Get user profile for email
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', reminderData.legal_compliance_tracking.user_id)
    .single();

  if (profileError) {
    console.warn('Could not fetch user profile:', profileError);
  }

  // Get user email from auth
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
    reminderData.legal_compliance_tracking.user_id
  );

  if (userError || !userData.user?.email) {
    throw new Error('Could not fetch user email');
  }

  // Send email notification
  const emailSubject = getEmailSubject(reminderData.reminder_type, reminderData.legal_compliance_tracking.compliance_type);
  const emailBody = getEmailBody(reminderData, profileData?.full_name || 'User');

  try {
    await resend.emails.send({
      from: 'TSMO Legal <legal@tsmo.ai>',
      to: [userData.user.email],
      subject: emailSubject,
      html: emailBody,
    });

    // Update reminder as sent
    await supabase
      .from('compliance_reminders')
      .update({
        sent_at: new Date().toISOString(),
        email_sent: true,
        reminder_count: reminderData.reminder_count + 1
      })
      .eq('id', request.reminder_id);

    // Create notification
    await createNotification(reminderData.legal_compliance_tracking.user_id, {
      type: 'compliance_reminder',
      title: emailSubject,
      message: `Compliance reminder sent for ${reminderData.legal_compliance_tracking.compliance_type}`,
      priority: reminderData.reminder_type === 'deadline_past' ? 'urgent' : 'high',
      metadata: {
        reminder_id: request.reminder_id,
        compliance_type: reminderData.legal_compliance_tracking.compliance_type
      }
    });

  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    
    // Still create notification even if email fails
    await createNotification(reminderData.legal_compliance_tracking.user_id, {
      type: 'compliance_reminder',
      title: emailSubject,
      message: `Compliance reminder: ${reminderData.legal_compliance_tracking.compliance_type}`,
      priority: reminderData.reminder_type === 'deadline_past' ? 'urgent' : 'high',
      metadata: {
        reminder_id: request.reminder_id,
        compliance_type: reminderData.legal_compliance_tracking.compliance_type,
        email_failed: true
      }
    });

    // Mark notification as sent but email as failed
    await supabase
      .from('compliance_reminders')
      .update({
        sent_at: new Date().toISOString(),
        notification_sent: true,
        email_sent: false,
        reminder_count: reminderData.reminder_count + 1
      })
      .eq('id', request.reminder_id);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Reminder sent successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processReminderQueue() {
  // Get all pending reminders that should be sent now
  const { data: pendingReminders, error } = await supabase
    .from('compliance_reminders')
    .select('id')
    .eq('is_active', true)
    .is('sent_at', null)
    .lte('scheduled_for', new Date().toISOString());

  if (error) {
    console.error('Error fetching pending reminders:', error);
    throw error;
  }

  const results = [];
  for (const reminder of pendingReminders || []) {
    try {
      await sendReminder({ action: 'send_reminder', reminder_id: reminder.id });
      results.push({ reminder_id: reminder.id, status: 'sent' });
    } catch (error) {
      console.error(`Failed to send reminder ${reminder.id}:`, error);
      results.push({ reminder_id: reminder.id, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createNotification(userId: string, notification: {
  type: string;
  title: string;
  message: string;
  priority: string;
  metadata: any;
}) {
  await supabase
    .from('legal_notifications')
    .insert({
      user_id: userId,
      notification_type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      metadata: notification.metadata
    });
}

function getEmailSubject(reminderType: string, complianceType: string): string {
  switch (reminderType) {
    case 'deadline_warning':
      return `⚠️ Compliance Deadline Approaching: ${complianceType}`;
    case 'deadline_past':
      return `🚨 URGENT: Compliance Deadline Passed: ${complianceType}`;
    case 'response_required':
      return `📋 Response Required: ${complianceType}`;
    default:
      return `📅 Compliance Reminder: ${complianceType}`;
  }
}

function getEmailBody(reminder: any, userName: string): string {
  const complianceData = reminder.legal_compliance_tracking;
  const deadlineDate = complianceData.deadline_date ? 
    new Date(complianceData.deadline_date).toLocaleDateString() : 'Not specified';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Compliance Reminder</h2>
          
          <p>Dear ${userName},</p>
          
          <p>This is a reminder regarding your compliance tracking:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Compliance Details</h3>
            <p><strong>Type:</strong> ${complianceData.compliance_type}</p>
            <p><strong>Jurisdiction:</strong> ${complianceData.jurisdiction}</p>
            <p><strong>Current Status:</strong> ${complianceData.status}</p>
            <p><strong>Deadline:</strong> ${deadlineDate}</p>
            <p><strong>Reminder Type:</strong> ${reminder.reminder_type.replace('_', ' ')}</p>
          </div>
          
          ${getActionText(reminder.reminder_type)}
          
          <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Important:</strong> Please take appropriate action to ensure compliance with applicable laws and regulations.</p>
          </div>
          
          <p>If you have any questions or need assistance, please contact our legal support team.</p>
          
          <p>Best regards,<br>
          TSMO Legal Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated reminder from TSMO Legal Templates. 
            Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getActionText(reminderType: string): string {
  switch (reminderType) {
    case 'deadline_warning':
      return `
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #dc2626;"><strong>Action Required:</strong> Your compliance deadline is approaching. Please review and complete any necessary actions.</p>
        </div>
      `;
    case 'deadline_past':
      return `
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #dc2626;"><strong>URGENT ACTION REQUIRED:</strong> Your compliance deadline has passed. Immediate action is required to address this matter.</p>
        </div>
      `;
    case 'response_required':
      return `
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1d4ed8;"><strong>Response Required:</strong> Please review the compliance status and provide any required responses or documentation.</p>
        </div>
      `;
    default:
      return `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0; color: #0369a1;"><strong>Reminder:</strong> Please review your compliance status and take any necessary actions.</p>
        </div>
      `;
  }
}