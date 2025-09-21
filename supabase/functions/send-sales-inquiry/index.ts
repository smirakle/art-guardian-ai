import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SalesInquiryData {
  name: string;
  email: string;
  company?: string;
  interestedPlan: string;
  message: string;
}

// Sanitize HTML input to prevent XSS
function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Validate and sanitize contact form data
function validateSalesInquiry(data: any): SalesInquiryData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request data');
  }

  const { name, email, company, interestedPlan, message } = data;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Name is required');
  }
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    throw new Error('Email is required');
  }
  if (!interestedPlan || typeof interestedPlan !== 'string' || interestedPlan.trim().length === 0) {
    throw new Error('Interested plan is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error('Invalid email format');
  }

  // Validate field lengths
  if (name.trim().length > 100) {
    throw new Error('Name is too long');
  }
  if (email.trim().length > 254) {
    throw new Error('Email is too long');
  }
  if (company && company.trim().length > 100) {
    throw new Error('Company name is too long');
  }
  if (message.trim().length > 1000) {
    throw new Error('Message is too long');
  }

  return {
    name: sanitizeHTML(name.trim()),
    email: sanitizeHTML(email.trim()),
    company: company ? sanitizeHTML(company.trim()) : undefined,
    interestedPlan: sanitizeHTML(interestedPlan.trim()),
    message: sanitizeHTML(message.trim())
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("Processing sales inquiry request");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("Email service not configured");
    }

    // Parse and validate request body
    let inquiryData: SalesInquiryData;
    try {
      const requestData = await req.json();
      inquiryData = validateSalesInquiry(requestData);
    } catch (error) {
      console.error("Validation error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sales inquiry data validated:", {
      name: inquiryData.name,
      email: inquiryData.email,
      company: inquiryData.company || 'Not provided',
      interestedPlan: inquiryData.interestedPlan
    });

    // Send email to sales team
    const salesEmailResponse = await resend.emails.send({
      from: "TSMO Sales <noreply@tsmowatch.com>", // Use your verified domain
      to: ["shirleena.cuningham@tsmowatch.com"],
      subject: `New Sales Inquiry - ${inquiryData.interestedPlan} Plan`,
      html: `
        <h2>New Sales Inquiry</h2>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Company:</strong> ${inquiryData.company || 'Not provided'}</p>
        <p><strong>Interested Plan:</strong> ${inquiryData.interestedPlan}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiryData.message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This inquiry was submitted through the TSMO website.</em></p>
      `,
    });

    console.log("Sales notification email sent:", salesEmailResponse);

    // Send confirmation email to the inquirer
    const confirmationEmailResponse = await resend.emails.send({
      from: "TSMO <noreply@tsmowatch.com>", // Use your verified domain
      to: [inquiryData.email],
      subject: "Thank you for your sales inquiry",
      html: `
        <h2>Thank you for your interest in TSMO!</h2>
        <p>Dear ${inquiryData.name},</p>
        <p>We have received your inquiry about our ${inquiryData.interestedPlan} plan and will get back to you within 24 hours.</p>
        <p>Our sales team will review your requirements and provide you with detailed information about how TSMO can help protect your intellectual property.</p>
        <p>Best regards,<br>The TSMO Sales Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        salesEmailId: salesEmailResponse.data?.id,
        confirmationEmailId: confirmationEmailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-sales-inquiry function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send sales inquiry. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});