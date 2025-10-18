import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BUG-REPORT] ${step}${detailsStr}`);
};

interface BugReportRequest {
  subject: string;
  description: string;
  stepsToReproduce?: string;
  userEmail: string;
  userId: string;
  currentPage: string;
  userAgent: string;
  screenSize: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Bug report function started");

    const {
      subject,
      description,
      stepsToReproduce,
      userEmail,
      userId,
      currentPage,
      userAgent,
      screenSize,
      timestamp,
    }: BugReportRequest = await req.json();

    logStep("Received bug report", { subject, userEmail, currentPage });

    // Validate required fields
    if (!subject || !description) {
      throw new Error("Subject and description are required");
    }

    // Create formatted email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; padding: 10px; background: #f9f9f9; border-left: 3px solid #007bff; }
            .metadata { font-size: 12px; color: #888; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #d32f2f;">🐛 New Bug Report</h2>
              <p style="margin: 5px 0 0 0; color: #666;">Submitted: ${new Date(timestamp).toLocaleString()}</p>
            </div>

            <div class="section">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>

            <div class="section">
              <div class="label">Description:</div>
              <div class="value">${description.replace(/\n/g, '<br>')}</div>
            </div>

            ${stepsToReproduce ? `
              <div class="section">
                <div class="label">Steps to Reproduce:</div>
                <div class="value">${stepsToReproduce.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}

            <div class="metadata">
              <h3 style="margin: 0 0 10px 0; font-size: 14px;">User & Environment Information</h3>
              <p><strong>User Email:</strong> ${userEmail}</p>
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Current Page:</strong> ${currentPage}</p>
              <p><strong>Screen Size:</strong> ${screenSize}</p>
              <p><strong>User Agent:</strong> ${userAgent}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "TSMO Bug Reports <onboarding@resend.dev>",
      to: ["shirleena.cunningham@tsmowatch.com"],
      replyTo: userEmail !== 'Anonymous' ? userEmail : undefined,
      subject: `🐛 Bug Report: ${subject}`,
      html: emailHtml,
    });

    logStep("Email sent successfully", { emailId: emailResponse.id });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Bug report submitted successfully",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    logStep("ERROR in send-bug-report", { message: error.message });
    console.error("Error in send-bug-report function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
