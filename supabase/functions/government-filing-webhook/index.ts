import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature (in production, use webhook secret)
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`Processing payment completion for session: ${session.id}`);

      // Update the filing request payment status
      const { error } = await supabaseService
        .from("government_filing_requests")
        .update({
          payment_status: 'paid',
          filing_fee_paid: true,
          filing_status: 'in_review'
        })
        .eq('stripe_session_id', session.id);

      if (error) {
        console.error('Error updating filing request:', error);
        throw error;
      }

      // Create notification for user
      const { data: filingRequest } = await supabaseService
        .from("government_filing_requests")
        .select('user_id, document_title, filing_type')
        .eq('stripe_session_id', session.id)
        .single();

      if (filingRequest) {
        await supabaseService
          .from("legal_notifications")
          .insert({
            user_id: filingRequest.user_id,
            notification_type: 'government_filing_payment_confirmed',
            title: 'Government Filing Payment Confirmed',
            message: `Your payment for filing "${filingRequest.document_title}" has been confirmed. Our team will begin processing your ${filingRequest.filing_type} filing shortly.`,
            priority: 'high'
          });
      }

      console.log(`Successfully processed payment for session ${session.id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in government-filing-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});