import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScanRequest {
  portfolio_id: string;
  platforms: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolio_id, platforms }: ScanRequest = await req.json();
    
    if (!portfolio_id || !platforms || platforms.length === 0) {
      throw new Error("portfolio_id and platforms are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw userError;

    const userId = userData.user.id;

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("id, name")
      .eq("id", portfolio_id)
      .eq("user_id", userId)
      .single();

    if (portfolioError) throw new Error("Portfolio not found or access denied");

    // Get portfolio items
    const { data: items, error: itemsError } = await supabase
      .from("portfolio_items")
      .select("id, artwork_id")
      .eq("portfolio_id", portfolio_id)
      .eq("is_active", true);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      throw new Error("No items in portfolio to scan");
    }

    // Create monitoring session
    const { data: session, error: sessionError } = await supabase
      .from("portfolio_monitoring_sessions")
      .insert({
        user_id: userId,
        session_type: "manual_scan",
        status: "in_progress",
        session_metadata: {
          portfolio_id,
          platforms,
          total_items: items.length,
        },
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Simulate scanning results (in production, this would call actual scanning services)
    let totalMatches = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    // For each platform, simulate finding matches
    for (const platform of platforms) {
      const matchesFound = Math.floor(Math.random() * 5); // 0-4 matches per platform
      totalMatches += matchesFound;

      // Distribute matches across risk levels
      if (matchesFound > 0) {
        const high = Math.floor(Math.random() * (matchesFound + 1));
        const medium = Math.floor(Math.random() * (matchesFound - high + 1));
        const low = matchesFound - high - medium;

        highRisk += high;
        mediumRisk += medium;
        lowRisk += low;
      }
    }

    // Update session as complete
    await supabase
      .from("portfolio_monitoring_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        total_matches_found: totalMatches,
        high_risk_matches: highRisk,
        session_metadata: {
          portfolio_id,
          platforms,
          items_scanned: items.length,
        },
      })
      .eq("id", session.id);

    // Create monitoring result
    const { data: result, error: resultError } = await supabase
      .from("portfolio_monitoring_results")
      .insert({
        portfolio_id,
        total_matches: totalMatches,
        high_risk_matches: highRisk,
        medium_risk_matches: mediumRisk,
        low_risk_matches: lowRisk,
        platforms_scanned: platforms,
        artworks_scanned: items.length,
        total_artworks: items.length,
        scan_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (resultError) throw resultError;

    // Create alerts for high-risk findings
    if (highRisk > 0) {
      await supabase.from("portfolio_alerts").insert({
        portfolio_id,
        user_id: userId,
        alert_type: "high_risk_match",
        severity: "critical",
        title: "High-Risk Content Detected",
        message: `Found ${highRisk} high-risk matches across ${platforms.join(", ")}`,
        metadata: {
          result_id: result.id,
          session_id: session.id,
          match_count: highRisk,
        },
      });
    }

    // Log the action
    await supabase.from("portfolio_monitoring_audit_log").insert({
      user_id: userId,
      action: "portfolio_scan_completed",
      resource_type: "portfolio_monitoring_session",
      resource_id: session.id,
      details: {
        portfolio_id,
        platforms,
        total_matches: totalMatches,
        items_scanned: items.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        result_id: result.id,
        summary: {
          items_scanned: items.length,
          platforms: platforms,
          total_matches: totalMatches,
          high_risk: highRisk,
          medium_risk: mediumRisk,
          low_risk: lowRisk,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[portfolio-scan] Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Scan failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
