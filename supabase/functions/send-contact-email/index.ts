import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

// HTML sanitization function
function sanitizeHTML(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Input validation function
function validateContactForm(data: any): ContactFormData {
  const errors: string[] = [];
  
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (data.firstName.length > 100) {
    errors.push('First name must be less than 100 characters');
  }
  
  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (data.lastName.length > 100) {
    errors.push('Last name must be less than 100 characters');
  }
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Valid email address is required');
    }
  }
  
  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (data.subject.length > 200) {
    errors.push('Subject must be less than 200 characters');
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (data.message.length > 5000) {
    errors.push('Message must be less than 5000 characters');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }
  
  return {
    firstName: sanitizeHTML(data.firstName.trim()),
    lastName: sanitizeHTML(data.lastName.trim()),
    email: data.email.trim().toLowerCase(),
    subject: sanitizeHTML(data.subject.trim()),
    message: sanitizeHTML(data.message.trim())
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    console.log("Processing contact form request...");
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(apiKey);
    
    const { firstName, lastName, email, subject, message }: ContactFormData = await req.json();

    console.log("Contact form data received:", { firstName, lastName, email, subject });

    // Send email to shirleena.cunningham@tsmowatch.com
    const emailResponse = await resend.emails.send({
      from: "TSMO Contact Form <onboarding@resend.dev>",
      to: ["shirleena.cunningham@tsmowatch.com"],
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">Contact Information:</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>This message was sent from the TSMO contact form at ${new Date().toLocaleString()}.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully to shirleena.cunningham@tsmowatch.com:", emailResponse);

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "TSMO <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting TSMO",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Thank you for contacting TSMO
          </h2>
          
          <p>Hi ${firstName},</p>
          
          <p>Thank you for reaching out to us! We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-bottom: 10px;">Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          
          <p>In the meantime, feel free to explore our platform and learn more about how TSMO can help protect your creative work.</p>
          
          <p>Best regards,<br>
          The TSMO Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Confirmation email sent to user:", confirmationResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
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
});