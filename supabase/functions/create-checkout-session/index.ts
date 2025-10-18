import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Validate BETA200 promo code for lifetime discount
    let lifetimeDiscount = 0;
    let promoCodeId = null;
    if (promoCode && promoCode.toUpperCase() === 'BETA200') {
      const { data: validation } = await supabaseClient.rpc('validate_promo_code', { 
        code_param: promoCode.toUpperCase() 
      });
      
      if (validation && validation.valid && validation.is_lifetime) {
        lifetimeDiscount = validation.discount_percentage;
        promoCodeId = validation.code_id;
        logStep("Lifetime discount will be applied", { discount: lifetimeDiscount });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Define plan pricing
    const planPricing = {
      student: { monthly: 1900, yearly: 19000 }, // $19/month, $190/year
      starter: { monthly: 2900, yearly: 29000 }, // $29/month, $290/year  
      professional: { monthly: 19900, yearly: 199000 }, // $199/month, $1990/year
    };

    if (!planPricing[planId as keyof typeof planPricing]) {
      throw new Error("Invalid plan selected");
    }

    const pricing = planPricing[planId as keyof typeof planPricing];
    let amount = pricing[billingCycle as keyof typeof pricing];
    
    // Apply lifetime discount if BETA200 promo code is valid
    if (lifetimeDiscount > 0) {
      const discountAmount = Math.floor(amount * (lifetimeDiscount / 100));
      amount = amount - discountAmount;
      logStep("Lifetime discount applied", { original: pricing[billingCycle as keyof typeof pricing], discounted: amount });
    }
    
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
        lifetimeDiscount: lifetimeDiscount.toString(),
        promoCodeId: promoCodeId || '',
      },
    };

    // Handle promotional codes
    if (promoCode) {
      const code = promoCode.toLowerCase();
      logStep("Applying promotional code", { promoCode });
      
      // Check if this is the BETA200 lifetime discount code
      if (code === 'beta200') {
        // Validate the promo code through Supabase
        const { data: validation, error: validationError } = await supabaseClient
          .rpc('validate_promo_code', { code_param: 'BETA200' });

        if (!validationError && validation?.valid) {
          // Create or retrieve lifetime 30% discount coupon
          let coupon;
          try {
            coupon = await stripe.coupons.retrieve('beta200-lifetime-30');
            logStep("Found existing BETA200 coupon");
          } catch (error) {
            // Create the coupon if it doesn't exist
            coupon = await stripe.coupons.create({
              id: 'beta200-lifetime-30',
              name: 'Beta Tester 30% Lifetime Discount',
              duration: 'forever', // Lifetime discount
              percent_off: 30,
            });
            logStep("Created new BETA200 coupon", { couponId: coupon.id });
          }
          
          if (coupon) {
            sessionConfig.discounts = [{
              coupon: coupon.id,
            }];
            sessionConfig.metadata.promo_code = 'BETA200';
            sessionConfig.metadata.lifetime_discount = 'true';
          }
        }
      } else if (code === 'freemonth') {
        // Create or retrieve coupon for one month free
        let coupon;
        try {
          coupon = await stripe.coupons.retrieve('one-month-free');
          logStep("Found existing coupon");
        } catch (error) {
          // Create the coupon if it doesn't exist
          coupon = await stripe.coupons.create({
            id: 'one-month-free',
            name: 'One Month Free',
            duration: 'once',
            amount_off: billingCycle === 'monthly' ? amount : Math.floor(amount / 12), // One month's worth
            currency: 'usd',
          });
          logStep("Created new coupon", { couponId: coupon.id });
        }
        
        if (coupon) {
          sessionConfig.discounts = [{
            coupon: coupon.id,
          }];
        }
      } else if (code === 'betatester') {
        // Create or retrieve coupon for two months free
        let coupon;
        try {
          coupon = await stripe.coupons.retrieve('two-months-free');
          logStep("Found existing BETATESTER coupon");
        } catch (error) {
          // Create the coupon if it doesn't exist
          coupon = await stripe.coupons.create({
            id: 'two-months-free',
            name: 'Two Months Free - Beta Tester',
            duration: 'once',
            amount_off: billingCycle === 'monthly' ? amount * 2 : Math.floor(amount / 6), // Two months' worth
            currency: 'usd',
          });
          logStep("Created new BETATESTER coupon", { couponId: coupon.id });
        }
        
        if (coupon) {
          sessionConfig.discounts = [{
            coupon: coupon.id,
          }];
        }
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