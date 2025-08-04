import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MeetingRequest {
  name: string;
  email: string;
  company: string;
  phone: string;
  meetingType: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
  investmentInterest: string;
}

const getMeetingTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'product-demo': 'Product Demo',
    'investor-meeting': 'Investor Meeting',
    'partnership': 'Partnership Discussion',
    'enterprise-consultation': 'Enterprise Consultation',
    'technical-deep-dive': 'Technical Deep Dive'
  };
  return types[type] || type;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const meetingData: MeetingRequest = await req.json();

    console.log('Meeting request received:', {
      name: meetingData.name,
      email: meetingData.email,
      meetingType: meetingData.meetingType,
      date: meetingData.preferredDate,
      time: meetingData.preferredTime
    });

    // Check if RESEND_API_KEY is available
    if (!resendApiKey) {
      throw new Error("Email service not configured. RESEND_API_KEY is missing.");
    }

    // Send confirmation email to the requester
    const confirmationEmail = await resend.emails.send({
      from: "TSMO Team <onboarding@resend.dev>",
      to: [meetingData.email],
      subject: "Meeting Request Received - TSMO",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TSMO Meeting Request</h1>
            <p style="color: white; margin: 10px 0 0 0;">AI-Powered IP Protection Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for your meeting request!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Dear ${meetingData.name},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              We have received your request for a <strong>${getMeetingTypeLabel(meetingData.meetingType)}</strong> 
              and will contact you within 24 hours to confirm the meeting details.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Meeting Request Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Meeting Type:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${getMeetingTypeLabel(meetingData.meetingType)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred Date:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.preferredDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred Time:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.preferredTime} ${meetingData.timezone}</td>
                </tr>
                ${meetingData.company ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Company:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.company}</td>
                </tr>
                ` : ''}
                ${meetingData.investmentInterest ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Investment Interest:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.investmentInterest.replace('-', ' to ')}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${meetingData.message ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
              <p style="color: #666; line-height: 1.6;">${meetingData.message}</p>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6;">
              We're excited to discuss how TSMO can help protect your intellectual property in the age of AI.
            </p>
            
            <div style="margin: 30px 0; padding: 15px; background: #e8f4fd; border-radius: 8px;">
              <p style="margin: 0; color: #0066cc; font-size: 14px;">
                <strong>What to expect:</strong><br>
                • Meeting confirmation within 24 hours<br>
                • Calendar invitation with meeting details<br>
                • Pre-meeting materials (if applicable)<br>
                • Direct contact information for any questions
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you have any urgent questions or need to reschedule, please contact us at 
              <a href="mailto:shirleena.cunningham@tsmowatch.com" style="color: #667eea;">shirleena.cunningham@tsmowatch.com</a>
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              <strong>The TSMO Team</strong>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              TSMO - AI-Powered IP Protection Platform<br>
              Protecting creators in the age of AI
            </p>
          </div>
        </div>
      `,
    });

    // Send notification email to TSMO team
    const notificationEmail = await resend.emails.send({
      from: "TSMO Meeting System <onboarding@resend.dev>",
      to: ["shirleena.cunningham@tsmowatch.com"],
      subject: `New Meeting Request: ${getMeetingTypeLabel(meetingData.meetingType)} - ${meetingData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚨 New Meeting Request</h1>
            <p style="color: white; margin: 10px 0 0 0;">TSMO Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Meeting Request Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Contact Information:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <a href="mailto:${meetingData.email}" style="color: #667eea;">${meetingData.email}</a>
                  </td>
                </tr>
                ${meetingData.company ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Company:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.company}</td>
                </tr>
                ` : ''}
                ${meetingData.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <a href="tel:${meetingData.phone}" style="color: #667eea;">${meetingData.phone}</a>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Meeting Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${getMeetingTypeLabel(meetingData.meetingType)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred Date:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.preferredDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred Time:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${meetingData.preferredTime} ${meetingData.timezone}</td>
                </tr>
                ${meetingData.investmentInterest ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Investment Range:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span style="background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${meetingData.investmentInterest.replace('-', ' to ')}
                    </span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${meetingData.message ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="color: #666; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
                ${meetingData.message}
              </p>
            </div>
            ` : ''}
            
            <div style="margin: 30px 0; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong><br>
                • Review meeting request details<br>
                • Confirm availability for requested date/time<br>
                • Send calendar invitation to ${meetingData.email}<br>
                • Prepare materials based on meeting type
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${meetingData.email}?subject=Re: Meeting Request - ${getMeetingTypeLabel(meetingData.meetingType)}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reply to ${meetingData.name}
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
              Meeting request received at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    });

    console.log("Meeting request emails sent successfully:", {
      confirmation: confirmationEmail,
      notification: notificationEmail
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Meeting request submitted successfully",
        confirmationId: confirmationEmail.data?.id,
        notificationId: notificationEmail.data?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in schedule-meeting function:", error);
    
    // More detailed error logging
    if (error.name === 'ResendError') {
      console.error("Resend API Error:", error.message, error.details);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        details: error.name === 'ResendError' ? 'Email service error - please try again later' : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);