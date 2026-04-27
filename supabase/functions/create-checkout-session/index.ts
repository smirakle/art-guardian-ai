import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const { planId, billingCycle, email, promoCode, socialMediaAddon, deepfakeAddon, aiTrainingAddon, userId } = await req.json();
    logStep("Request data received", { planId, billingCycle, email, promoCode, socialMediaAddon, deepfakeAddon, aiTrainingAddon, userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Define plan pricing (amounts in cents)
    const planPricing: Record<string, { monthly: number; yearly: number }> = {
      free: { monthly: 0, yearly: 0 },
      pro: { monthly: 2900, yearly: 29000 }, // $29/month, $290/year
      student: { monthly: 1900, yearly: 19000 }, // $19/month, $190/year (legacy)
      starter: { monthly: 2900, yearly: 29000 }, // $29/month, $290/year (legacy)
      professional: { monthly: 7900, yearly: 79000 }, // $79/month, $790/year (legacy)
      'pro-plus': { monthly: 14900, yearly: 149000 }, // $149/month, $1490/year (legacy)
    };

    // Handle free plan separately
    if (planId === 'free') {
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/success?plan=free`,
        sessionId: null,
        message: "Free plan activated"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle enterprise plan separately
    if (planId === 'enterprise') {
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/contact?plan=enterprise`,
        sessionId: null,
        message: "Contact sales for enterprise pricing"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle pay-as-you-go single proof (one-time $0.49 payment, no subscription)
    if (planId === 'single_proof') {
      logStep("Creating single-proof one-time checkout session");

      // Look up customer if email provided
      let payAsYouGoCustomerId: string | undefined;
      if (email) {
        const existing = await stripe.customers.list({ email, limit: 1 });
        if (existing.data.length > 0) payAsYouGoCustomerId = existing.data[0].id;
      }

      const singleProofSession = await stripe.checkout.sessions.create({
        customer: payAsYouGoCustomerId,
        customer_email: payAsYouGoCustomerId ? undefined : email,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "TSMO Single Proof",
                description: "One court-ready, blockchain-anchored timestamp proof of ownership. Verifiable forever.",
              },
              unit_amount: 49, // $0.49
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}&plan=single_proof`,
        cancel_url: `${req.headers.get("origin")}/pricing`,
        metadata: {
          planId: "single_proof",
          userId: userId || "",
        },
      });

      logStep("Single-proof session created", { sessionId: singleProofSession.id });

      return new Response(JSON.stringify({
        url: singleProofSession.url,
        sessionId: singleProofSession.id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!planPricing[planId]) {
      throw new Error(`Invalid plan selected: ${planId}`);
    }

    const pricing = planPricing[planId];
    let amount = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;
    
    // Add social media addon if selected (available for all plans)
    if (socialMediaAddon) {
      amount += billingCycle === 'monthly' ? 9900 : 118800; // $99/month or $1188/year
    }
    
    // Add deepfake addon if selected (not available for professional plan as it's included)
    if (deepfakeAddon && planId !== 'professional') {
      amount += billingCycle === 'monthly' ? 4900 : 58800; // $49/month or $588/year
    }
    
    // Add AI training protection addon if selected (available for all plans) with startup fee
    if (aiTrainingAddon) {
      amount += billingCycle === 'monthly' ? 4900 : 58800; // $49/month or $588/year
    }
    
    logStep("Plan pricing determined", { planId, billingCycle, amount, socialMediaAddon, deepfakeAddon, aiTrainingAddon });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Prepare session configuration
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: { 
            name: `TSMO ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
            description: `Copyright protection for artists - ${planId} tier`
          },
          unit_amount: pricing[billingCycle as keyof typeof pricing],
          recurring: { 
            interval: billingCycle === 'monthly' ? 'month' : 'year' 
          },
        },
        quantity: 1,
      },
    ];

    // Add social media addon as separate line item if selected (available for all plans)
    if (socialMediaAddon) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { 
            name: "Social Media Profile Monitoring",
            description: "Monitor unlimited social media profiles for impersonation and unauthorized use"
          },
          unit_amount: billingCycle === 'monthly' ? 9900 : 118800, // $99/month or $1188/year
          recurring: { 
            interval: billingCycle === 'monthly' ? 'month' : 'year' 
          },
        },
        quantity: 1,
      });
    }

    // Add deepfake addon as separate line item if selected (not for professional plan)
    if (deepfakeAddon && planId !== 'professional') {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { 
            name: "Deepfake Monitoring",
            description: "Advanced AI-powered deepfake detection and monitoring across the web"
          },
          unit_amount: billingCycle === 'monthly' ? 4900 : 58800, // $49/month or $588/year
          recurring: { 
            interval: billingCycle === 'monthly' ? 'month' : 'year' 
          },
        },
        quantity: 1,
      });
    }

    // Add AI training protection addon as separate line item if selected (available for all plans)
    if (aiTrainingAddon) {
      // Add startup fee as one-time payment
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { 
            name: "AI Training Protection - Setup Fee",
            description: "One-time setup fee for AI training protection monitoring"
          },
          unit_amount: 10000, // $100 startup fee
        },
        quantity: 1,
      });
      
      // Add monthly recurring fee
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { 
            name: "AI Training Protection",
            description: "Advanced AI training protection and monitoring across AI platforms"
          },
          unit_amount: billingCycle === 'monthly' ? 4900 : 58800, // $49/month or $588/year
          recurring: { 
            interval: billingCycle === 'monthly' ? 'month' : 'year' 
          },
        },
        quantity: 1,
      });
    }

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        planId,
        billingCycle,
        socialMediaAddon: socialMediaAddon ? 'true' : 'false',
        deepfakeAddon: deepfakeAddon ? 'true' : 'false',
        aiTrainingAddon: aiTrainingAddon ? 'true' : 'false',
        promoCode: promoCode || '',
      },
    };

    // Handle promotional codes dynamically from database
    if (promoCode) {
      logStep("Validating promo code through database", { promoCode });
      
      // Validate the promo code through Supabase RPC
      const { data: validation, error: validationError } = await supabaseClient
        .rpc('validate_promo_code', { code_param: promoCode.toUpperCase() });

      if (validationError) {
        logStep("Promo code validation error", { error: validationError.message });
      } else if (validation && validation.valid) {
        logStep("Promo code validated successfully", { 
          discountPercentage: validation.discount_percentage,
          isLifetime: validation.is_lifetime,
          discountDurationMonths: validation.discount_duration_months
        });

        // Generate a unique coupon ID based on the promo code and its properties
        const couponId = `${promoCode.toLowerCase()}-${validation.discount_percentage}${validation.is_lifetime ? '-forever' : validation.discount_duration_months ? `-${validation.discount_duration_months}mo` : '-once'}`;
        
        let coupon;
        try {
          // Try to retrieve existing coupon
          coupon = await stripe.coupons.retrieve(couponId);
          logStep("Found existing coupon", { couponId });
        } catch (error) {
          // Create the coupon if it doesn't exist
          const couponConfig: any = {
            id: couponId,
            percent_off: validation.discount_percentage,
          };

          // Set coupon duration based on promo code properties
          if (validation.is_lifetime) {
            // Lifetime discount (forever)
            couponConfig.duration = 'forever';
            couponConfig.name = `${promoCode.toUpperCase()} - ${validation.discount_percentage}% Lifetime Discount`;
          } else if (validation.discount_duration_months && validation.discount_duration_months > 0) {
            // Time-limited discount (repeating for X months)
            couponConfig.duration = 'repeating';
            couponConfig.duration_in_months = validation.discount_duration_months;
            couponConfig.name = `${promoCode.toUpperCase()} - ${validation.discount_percentage}% Off for ${validation.discount_duration_months} Months`;
          } else {
            // One-time discount
            couponConfig.duration = 'once';
            couponConfig.name = `${promoCode.toUpperCase()} - ${validation.discount_percentage}% Off`;
          }

          coupon = await stripe.coupons.create(couponConfig);
          logStep("Created new coupon", { couponId: coupon.id, duration: couponConfig.duration });
        }
        
        if (coupon) {
          sessionConfig.discounts = [{
            coupon: coupon.id,
          }];
          
          // Update metadata with promo code details
          sessionConfig.metadata.promoCodeId = validation.code_id || '';
          sessionConfig.metadata.discountPercentage = validation.discount_percentage.toString();
          sessionConfig.metadata.isLifetimeDiscount = validation.is_lifetime ? 'true' : 'false';
          sessionConfig.metadata.discountDurationMonths = validation.discount_duration_months?.toString() || '';
        }
      } else {
        logStep("Promo code is invalid or expired", { promoCode });
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-session", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
