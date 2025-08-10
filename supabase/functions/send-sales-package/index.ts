import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  name?: string;
  email: string;
  link: string;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name = "there", email, link, source = "sales-package" } = (await req.json()) as Payload;

    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111827">
        <h1 style="margin:0 0 12px;font-size:20px">Your TSMO Sales Package</h1>
        <p>Hi ${name},</p>
        <p>Thanks for your interest in TSMO. Your sales package is ready:</p>
        <p><a href="${link}" target="_blank" style="color:#2563eb">Download the Sales Package PDF</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        <p style="margin:0">Questions? Email <a href="mailto:Shirleena.cunningham@tsmowatch.com">Shirleena.cunningham@tsmowatch.com</a> or visit <a href="https://www.tsmowatch.com" target="_blank">www.tsmowatch.com</a>.</p>
        <p style="font-size:12px;color:#6b7280">Source: ${source}</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: "TSMO <onboarding@resend.dev>",
      to: [email, "Shirleena.cunningham@tsmowatch.com"],
      subject: "Your TSMO Sales Package",
      html,
    });

    return new Response(JSON.stringify({ ok: true, id: (response as any)?.data?.id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-sales-package error", error);
    return new Response(JSON.stringify({ ok: false, error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
