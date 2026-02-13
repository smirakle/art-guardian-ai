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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Get user subscription to determine pricing
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Get request body
    const { 
      filingType, 
      documentTitle, 
      documentDescription,
      filingJurisdiction,
      urgencyLevel,
      contactName,
      contactEmail,
      contactPhone,
      additionalInstructions 
    } = await req.json();

    // Determine pricing based on subscription plan
    let amount: number;
    const planId = subscription?.plan_id || 'free';
    
    switch (planId) {
      case 'student':
        amount = 9900; // $99
        break;
      case 'starter':
        amount = 19900; // $199
        break;
      case 'professional':
      case 'enterprise':
        amount = planId === 'professional' ? 49900 : 99900; // $499 or $999
        break;
      default:
        amount = 19900; // Default to starter pricing
    }

    // Add urgency surcharge
    if (urgencyLevel === 'expedited') {
      amount = Math.round(amount * 1.5);
    } else if (urgencyLevel === 'rush') {
      amount = Math.round(amount * 2);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Government Filing Service - ${filingType}`,
              description: `Filing for: ${documentTitle} (${urgencyLevel} processing)`
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/legal-templates?filing=success`,
      cancel_url: `${req.headers.get("origin")}/legal-templates?filing=cancelled`,
      metadata: {
        user_id: user.id,
        filing_type: filingType,
        document_title: documentTitle,
        jurisdiction: filingJurisdiction,
        urgency_level: urgencyLevel
      }
    });

    // Create filing request record using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: filingRequest, error } = await supabaseService
      .from("government_filing_requests")
      .insert({
        user_id: user.id,
        filing_type: filingType,
        document_title: documentTitle,
        document_description: documentDescription,
        filing_jurisdiction: filingJurisdiction,
        urgency_level: urgencyLevel,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        additional_instructions: additionalInstructions,
        stripe_session_id: session.id,
        amount_paid: amount,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating filing request:', error);
      throw new Error('Failed to create filing request');
    }

    console.log(`Created filing request ${filingRequest.id} for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        filing_request_id: filingRequest.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in government-filing-checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});