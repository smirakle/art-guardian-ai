import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessDripRequest {
  enrollmentId?: string; // Process specific enrollment
  sequenceId?: string;   // Process all enrollments for a sequence
  processAll?: boolean;  // Process all due drip steps
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const requestData: ProcessDripRequest = await req.json().catch(() => ({ processAll: true }));

    console.log('Processing drip campaigns:', requestData);

    let enrollmentsToProcess: any[] = [];

    if (requestData.enrollmentId) {
      // Process specific enrollment
      const { data, error } = await supabaseClient
        .from('email_drip_enrollments')
        .select(`
          *,
          email_drip_sequences(*),
          email_subscribers(*)
        `)
        .eq('id', requestData.enrollmentId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (data) enrollmentsToProcess = [data];

    } else if (requestData.sequenceId) {
      // Process all enrollments for a sequence
      const { data, error } = await supabaseClient
        .from('email_drip_enrollments')
        .select(`
          *,
          email_drip_sequences(*),
          email_subscribers(*)
        `)
        .eq('sequence_id', requestData.sequenceId)
        .eq('status', 'active');

      if (error) throw error;
      enrollmentsToProcess = data || [];

    } else {
      // Process all active enrollments
      const { data, error } = await supabaseClient
        .from('email_drip_enrollments')
        .select(`
          *,
          email_drip_sequences(*),
          email_subscribers(*)
        `)
        .eq('status', 'active')
        .order('enrolled_at');

      if (error) throw error;
      enrollmentsToProcess = data || [];
    }

    let processedCount = 0;
    let sentCount = 0;

    for (const enrollment of enrollmentsToProcess) {
      try {
        const result = await processEnrollment(supabaseClient, resend, enrollment);
        processedCount++;
        if (result.emailSent) {
          sentCount++;
        }
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        
        // Mark enrollment as failed if too many errors
        await supabaseClient
          .from('email_drip_enrollments')
          .update({ 
            status: 'failed',
            metadata: { 
              ...enrollment.metadata, 
              lastError: error.message,
              errorAt: new Date().toISOString()
            }
          })
          .eq('id', enrollment.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processedCount,
      sentCount,
      message: `Processed ${processedCount} enrollments, sent ${sentCount} emails`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in drip-campaign-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function processEnrollment(supabaseClient: any, resend: any, enrollment: any): Promise<{emailSent: boolean}> {
  const sequence = enrollment.email_drip_sequences;
  const subscriber = enrollment.email_subscribers;

  if (!sequence.is_active) {
    return { emailSent: false };
  }

  // Get the next step to process
  const { data: steps, error: stepsError } = await supabaseClient
    .from('email_drip_steps')
    .select('*')
    .eq('sequence_id', sequence.id)
    .eq('is_active', true)
    .order('step_order');

  if (stepsError) throw stepsError;

  if (!steps || steps.length === 0) {
    // No steps, mark as completed
    await supabaseClient
      .from('email_drip_enrollments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', enrollment.id);
    
    return { emailSent: false };
  }

  const nextStep = steps[enrollment.current_step];
  if (!nextStep) {
    // All steps completed
    await supabaseClient
      .from('email_drip_enrollments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', enrollment.id);
    
    return { emailSent: false };
  }

  // Check if enough time has passed for this step
  const enrolledAt = new Date(enrollment.enrolled_at);
  const delayMs = (nextStep.delay_days * 24 * 60 * 60 * 1000) + (nextStep.delay_hours * 60 * 60 * 1000);
  const shouldSendAt = new Date(enrolledAt.getTime() + delayMs);
  const now = new Date();

  if (now < shouldSendAt) {
    return { emailSent: false }; // Not time yet
  }

  // Check if this step was already sent (avoid duplicates)
  const stepKey = `step_${nextStep.step_order}_sent`;
  if (enrollment.metadata && enrollment.metadata[stepKey]) {
    // This step was already sent, move to next
    await supabaseClient
      .from('email_drip_enrollments')
      .update({ current_step: enrollment.current_step + 1 })
      .eq('id', enrollment.id);
    
    return { emailSent: false };
  }

  // Personalize the email content
  const personalizedSubject = personalizeContent(nextStep.subject_template, subscriber, enrollment);
  const personalizedContent = personalizeContent(nextStep.content_template, subscriber, enrollment);

  // Send the email
  const emailResponse = await resend.emails.send({
    from: "Drip Campaign <drip@yourdomain.com>", // Configure this
    to: [subscriber.email],
    subject: personalizedSubject,
    html: personalizedContent,
    headers: {
      'X-Campaign-Type': 'drip',
      'X-Sequence-ID': sequence.id,
      'X-Step-Order': nextStep.step_order.toString(),
      'X-Enrollment-ID': enrollment.id
    }
  });

  if (emailResponse.error) {
    throw new Error(`Failed to send email: ${emailResponse.error.message}`);
  }

  console.log(`Sent drip email to ${subscriber.email}, step ${nextStep.step_order}`);

  // Update enrollment progress
  const updatedMetadata = {
    ...enrollment.metadata,
    [stepKey]: new Date().toISOString(),
    lastEmailId: emailResponse.data?.id
  };

  await supabaseClient
    .from('email_drip_enrollments')
    .update({ 
      current_step: enrollment.current_step + 1,
      metadata: updatedMetadata
    })
    .eq('id', enrollment.id);

  // Log the email event
  await supabaseClient
    .from('email_detailed_events')
    .insert({
      subscriber_id: subscriber.id,
      event_type: 'sent',
      event_data: {
        sequence_id: sequence.id,
        step_order: nextStep.step_order,
        enrollment_id: enrollment.id,
        email_id: emailResponse.data?.id
      },
      created_at: new Date().toISOString()
    });

  return { emailSent: true };
}

function personalizeContent(template: string, subscriber: any, enrollment: any): string {
  let content = template;

  // Basic personalization variables
  const variables = {
    '{{email}}': subscriber.email,
    '{{first_name}}': subscriber.first_name || subscriber.email.split('@')[0],
    '{{last_name}}': subscriber.last_name || '',
    '{{full_name}}': subscriber.full_name || subscriber.email.split('@')[0],
    '{{enrolled_date}}': new Date(enrollment.enrolled_at).toLocaleDateString(),
    '{{unsubscribe_url}}': `${Deno.env.get('SUPABASE_URL')}/unsubscribe?token=${subscriber.unsubscribe_token || 'invalid'}`
  };

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(key, 'g'), value);
  });

  return content;
}

serve(handler);