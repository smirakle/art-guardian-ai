import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ verified: false, reason: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const licenseId = (session.metadata?.licenseId as string) || null;
    const userId = (session.metadata?.userId as string) || null;
    if (!licenseId) throw new Error("Missing licenseId in metadata");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Mark license as paid; activation (blockchain) still happens when user triggers "Activate"
    const { data: updated, error: updErr } = await supabase
      .from("licenses")
      .update({ status: "paid", stripe_session_id: session_id, paid_at: new Date().toISOString() })
      .eq("id", licenseId)
      .select("id")
      .single();
    if (updErr) throw new Error(`Failed to update license: ${updErr.message}`);

    // Record payment event if table exists
    await supabase.from("license_events").insert({
      license_id: licenseId,
      user_id: userId,
      event_type: "payment_succeeded",
      data: { session_id },
    });

    return new Response(JSON.stringify({ verified: true, license_id: updated.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[verify-license-payment]", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});