import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('Session status:', session.payment_status);
    console.log('Session metadata:', session.metadata);

    // Use service role to update the database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update the purchase status based on payment status
    const status = session.payment_status === 'paid' ? 'completed' : 'failed';
    
    const { error: updateError } = await supabaseService
      .from("template_purchases")
      .update({ 
        status: status,
        purchased_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('stripe_session_id', sessionId);

    if (updateError) {
      console.error('Error updating purchase:', updateError);
      throw updateError;
    }

    console.log(`Purchase updated to ${status} for session ${sessionId}`);

    return new Response(JSON.stringify({ 
      success: true,
      status: status,
      sessionId: sessionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Update template purchase error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});