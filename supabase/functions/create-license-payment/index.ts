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

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(token);
    if (userErr || !userData?.user) throw new Error("Unauthorized");
    const user = userData.user;

    const { licenseId } = await req.json();
    if (!licenseId) throw new Error("licenseId is required");

    // Verify license ownership and fetch price
    const { data: license, error: licErr } = await supabaseAnon
      .from("licenses")
      .select("id, licensor_user_id, price_cents, currency, license_type, artwork_id, terms_text")
      .eq("id", licenseId)
      .single();
    if (licErr) throw new Error(`Failed to fetch license: ${licErr.message}`);
    if (!license || license.licensor_user_id !== user.id) throw new Error("Not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    const amount = Math.max(0, Number(license.price_cents || 0));
    if (amount <= 0) {
      return new Response(JSON.stringify({ error: "License price must be greater than 0" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Try to find or create a customer for licensor (sender of checkout)
    let customerId: string | undefined;
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://utneaqmbyjwxaqrrarpc.supabase.co";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email ?? undefined,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (license.currency || "usd").toLowerCase(),
            product_data: {
              name: `License: ${license.license_type}`,
              description: `Artwork ${license.artwork_id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&context=license`,
      cancel_url: `${origin}/licensing?canceled=true&license_id=${licenseId}`,
      metadata: {
        context: "license",
        licenseId,
        userId: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[create-license-payment]", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});