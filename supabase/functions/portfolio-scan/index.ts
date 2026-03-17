import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
    const { portfolio_id, platforms } = await req.json();

    if (!portfolio_id || !platforms || platforms.length === 0) {
      throw new Error("portfolio_id and platforms are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

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

    // Get portfolio items with artwork details
    const { data: items, error: itemsError } = await supabase
      .from("portfolio_items")
      .select("id, artwork_id")
      .eq("portfolio_id", portfolio_id)
      .eq("is_active", true);
    if (itemsError) throw itemsError;
    if (!items || items.length === 0) throw new Error("No items in portfolio to scan");

    // Get artwork file paths
    const artworkIds = items.map(i => i.artwork_id);
    const { data: artworks } = await supabase
      .from("artwork")
      .select("id, title, file_paths")
      .in("id", artworkIds);

    // Create monitoring session
    const { data: session, error: sessionError } = await supabase
      .from("portfolio_monitoring_sessions")
      .insert({
        user_id: userId,
        session_type: "manual_scan",
        status: "in_progress",
        session_metadata: { portfolio_id, platforms, total_items: items.length },
      })
      .select()
      .single();
    if (sessionError) throw sessionError;

    // Real scanning using available APIs
    const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
    const TINEYE_API_KEY = Deno.env.get("TINEYE_API_KEY");
    const GOOGLE_CUSTOM_SEARCH_API_KEY = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY");
    const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");

    let totalMatches = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    const matchDetails: any[] = [];

    for (const artwork of (artworks || [])) {
      if (!artwork.file_paths || artwork.file_paths.length === 0) continue;

      const filePath = artwork.file_paths[0];
      const { data: urlData } = supabase.storage.from("artwork").getPublicUrl(filePath);
      if (!urlData?.publicUrl) continue;

      const imageUrl = urlData.publicUrl;

      // Try TinEye reverse image search
      if (TINEYE_API_KEY) {
        try {
          const tinyResponse = await fetch("https://api.tineye.com/rest/search/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ api_key: TINEYE_API_KEY, url: imageUrl }),
          });

          if (tinyResponse.ok) {
            const tinyData = await tinyResponse.json();
            const matches = tinyData.results?.matches || [];
            for (const match of matches.slice(0, 10)) {
              const domain = match.domain || "unknown";
              const backlink = match.backlinks?.[0];
              const risk = classifyRisk(domain, backlink?.url);
              totalMatches++;
              if (risk === "high") highRisk++;
              else if (risk === "medium") mediumRisk++;
              else lowRisk++;

              matchDetails.push({
                artwork_id: artwork.id,
                artwork_title: artwork.title,
                source: "TinEye",
                domain,
                url: backlink?.url || "",
                risk_level: risk,
              });
            }
          }
        } catch (err) {
          console.error("TinEye error:", err);
        }
      }

      // Try SerpAPI Google Lens
      if (SERPAPI_KEY) {
        try {
          const serpUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(imageUrl)}&api_key=${SERPAPI_KEY}`;
          const serpResponse = await fetch(serpUrl);

          if (serpResponse.ok) {
            const serpData = await serpResponse.json();
            const visualMatches = serpData.visual_matches || [];
            for (const match of visualMatches.slice(0, 10)) {
              const domain = match.source || "unknown";
              const risk = classifyRisk(domain, match.link);
              totalMatches++;
              if (risk === "high") highRisk++;
              else if (risk === "medium") mediumRisk++;
              else lowRisk++;

              matchDetails.push({
                artwork_id: artwork.id,
                artwork_title: artwork.title,
                source: "Google Lens",
                domain,
                url: match.link || "",
                title: match.title || "",
                risk_level: risk,
              });
            }
          }
        } catch (err) {
          console.error("SerpAPI error:", err);
        }
      }

      // Try Google Custom Search
      if (GOOGLE_CUSTOM_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
        try {
          const gcsUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&searchType=image&q=${encodeURIComponent(artwork.title)}`;
          const gcsResponse = await fetch(gcsUrl);

          if (gcsResponse.ok) {
            const gcsData = await gcsResponse.json();
            for (const item of (gcsData.items || []).slice(0, 5)) {
              const domain = item.displayLink || "unknown";
              const risk = classifyRisk(domain, item.link);
              totalMatches++;
              if (risk === "high") highRisk++;
              else if (risk === "medium") mediumRisk++;
              else lowRisk++;

              matchDetails.push({
                artwork_id: artwork.id,
                artwork_title: artwork.title,
                source: "Google Search",
                domain,
                url: item.link || "",
                title: item.title || "",
                risk_level: risk,
              });
            }
          }
        } catch (err) {
          console.error("Google Custom Search error:", err);
        }
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
        session_metadata: { portfolio_id, platforms, items_scanned: items.length, match_details: matchDetails },
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
        artworks_scanned: artworks?.length || 0,
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
        message: `Found ${highRisk} high-risk matches across scanned platforms`,
        metadata: { result_id: result.id, session_id: session.id, match_count: highRisk, match_details: matchDetails.filter(m => m.risk_level === 'high') },
      });
    }

    // Log the action
    await supabase.from("portfolio_monitoring_audit_log").insert({
      user_id: userId,
      action: "portfolio_scan_completed",
      resource_type: "portfolio_monitoring_session",
      resource_id: session.id,
      details: { portfolio_id, platforms, total_matches: totalMatches, items_scanned: items.length },
    });

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        result_id: result.id,
        summary: {
          items_scanned: artworks?.length || 0,
          platforms,
          total_matches: totalMatches,
          high_risk: highRisk,
          medium_risk: mediumRisk,
          low_risk: lowRisk,
        },
        match_details: matchDetails.slice(0, 50),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[portfolio-scan] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Scan failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function classifyRisk(domain: string, url?: string): "high" | "medium" | "low" {
  const d = domain.toLowerCase();
  const u = (url || "").toLowerCase();

  // High risk: commercial/marketplace sites, unknown sellers
  const highRiskDomains = ["etsy.com", "ebay.com", "amazon.com", "alibaba.com", "aliexpress.com", "redbubble.com", "teepublic.com", "zazzle.com", "spreadshirt.com", "society6.com"];
  if (highRiskDomains.some(hr => d.includes(hr))) return "high";

  // Medium risk: social media, content platforms
  const mediumRiskDomains = ["facebook.com", "instagram.com", "twitter.com", "x.com", "pinterest.com", "tumblr.com", "reddit.com", "tiktok.com", "vk.com"];
  if (mediumRiskDomains.some(mr => d.includes(mr))) return "medium";

  // Low risk: art platforms (could be legitimate), personal sites
  const lowRiskDomains = ["deviantart.com", "artstation.com", "behance.net", "dribbble.com", "flickr.com", "500px.com"];
  if (lowRiskDomains.some(lr => d.includes(lr))) return "low";

  // Default to medium for unknown domains
  return "medium";
}
