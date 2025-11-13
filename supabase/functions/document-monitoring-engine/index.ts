import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Document Monitoring Engine function started");

// Platform configurations for real API scanning
const platformConfigs = {
  "Google Scholar": { searchEngine: "google", category: "scholar" },
  "Research Gate": { searchEngine: "serpapi", category: "academic" },
  "Academia.edu": { searchEngine: "google", category: "academic" },
  "Medium": { searchEngine: "serpapi", category: "blog" },
  "Substack": { searchEngine: "google", category: "newsletter" },
  "Common Crawl": { searchEngine: "google", category: "web" },
  "AI Training Datasets": { searchEngine: "copyleaks", category: "ai" }
};

// Scan using OpenAI for content similarity
async function analyzeContentSimilarity(content: string, searchResults: any[]): Promise<number> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return 0;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a plagiarism detection expert. Analyze the similarity between the original content and search results. Return only a number between 0 and 1 representing similarity percentage."
        }, {
          role: "user",
          content: `Original content: "${content.substring(0, 500)}"\n\nSearch results: ${JSON.stringify(searchResults.slice(0, 3))}\n\nProvide similarity score (0-1):`
        }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const scoreText = data.choices?.[0]?.message?.content || "0";
    return parseFloat(scoreText) || 0;
  } catch (error) {
    console.error("OpenAI similarity analysis error:", error);
    return 0;
  }
}

// Scan using Copyleaks API for professional plagiarism detection
async function scanWithCopyleaks(content: string, platform: string) {
  const copyleaksKey = Deno.env.get("COPYLEAKS_API_KEY");
  if (!copyleaksKey) {
    console.log("Copyleaks API key not configured, skipping");
    return null;
  }

  try {
    // Submit scan to Copyleaks
    const scanResponse = await fetch("https://api.copyleaks.com/v3/scans/submit/file", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${copyleaksKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: content.substring(0, 25000), // Copyleaks limit
        properties: {
          webhooks: {
            status: `${Deno.env.get("SUPABASE_URL")}/functions/v1/copyleaks-webhook`
          }
        }
      }),
    });

    if (!scanResponse.ok) {
      console.error("Copyleaks scan failed:", await scanResponse.text());
      return null;
    }

    const scanData = await scanResponse.json();
    console.log("Copyleaks scan submitted:", scanData);

    // Note: Copyleaks is async - results come via webhook
    return {
      scan_id: scanData.scanId,
      status: "pending",
      message: "Scan submitted to Copyleaks for professional analysis"
    };
  } catch (error) {
    console.error("Copyleaks error:", error);
    return null;
  }
}

// Scan using Google Custom Search API
async function scanWithGoogleSearch(content: string, platform: string) {
  const googleKey = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY");
  const searchEngineId = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");
  
  if (!googleKey || !searchEngineId) {
    console.log("Google Search credentials not configured");
    return [];
  }

  try {
    const query = content.substring(0, 200).replace(/[^\w\s]/g, '');
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${searchEngineId}&q="${encodeURIComponent(query)}"&num=10`
    );

    if (!response.ok) {
      console.error("Google Search error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.items?.map((item: any) => ({
      url: item.link,
      title: item.title,
      snippet: item.snippet,
      domain: new URL(item.link).hostname
    })) || [];
  } catch (error) {
    console.error("Google Search API error:", error);
    return [];
  }
}

// Scan using SerpAPI for academic and blog platforms
async function scanWithSerpAPI(content: string, platform: string) {
  const serpApiKey = Deno.env.get("SERPAPI_KEY");
  if (!serpApiKey) {
    console.log("SerpAPI key not configured");
    return [];
  }

  try {
    const query = content.substring(0, 200).replace(/[^\w\s]/g, '');
    let engine = "google";
    
    if (platform === "Medium") engine = "google";
    else if (platform === "Research Gate") engine = "google_scholar";
    
    const response = await fetch(
      `https://serpapi.com/search?engine=${engine}&q="${encodeURIComponent(query)}"&api_key=${serpApiKey}`
    );

    if (!response.ok) {
      console.error("SerpAPI error:", await response.text());
      return [];
    }

    const data = await response.json();
    const results = data.organic_results || data.scholar_results || [];
    
    return results.map((item: any) => ({
      url: item.link,
      title: item.title,
      snippet: item.snippet,
      domain: item.link ? new URL(item.link).hostname : platform.toLowerCase()
    }));
  } catch (error) {
    console.error("SerpAPI error:", error);
    return [];
  }
}

// Main scanning function with real API integrations
async function scanPlatformForPlagiarism(platform: string, documentContent: string, userId: string) {
  const config = platformConfigs[platform as keyof typeof platformConfigs];
  if (!config) return null;

  console.log(`Real scan starting for ${platform} using ${config.searchEngine}`);
  
  let searchResults: any[] = [];
  let copyleaksResult = null;

  // Use appropriate API based on platform
  if (config.searchEngine === "copyleaks") {
    copyleaksResult = await scanWithCopyleaks(documentContent, platform);
  } else if (config.searchEngine === "serpapi") {
    searchResults = await scanWithSerpAPI(documentContent, platform);
  } else {
    searchResults = await scanWithGoogleSearch(documentContent, platform);
  }

  // If no results, no plagiarism detected
  if (searchResults.length === 0 && !copyleaksResult) {
    console.log(`No matches found on ${platform}`);
    return null;
  }

  // Analyze content similarity using OpenAI
  const similarityScore = await analyzeContentSimilarity(documentContent, searchResults);
  
  // Only report if similarity is significant (>70%)
  if (similarityScore < 0.7) {
    console.log(`Low similarity (${similarityScore}) on ${platform}, not reporting`);
    return null;
  }

  const aiTrainingDetected = platform === "AI Training Datasets" || similarityScore > 0.85;
  
  let threatLevel = "low";
  if (similarityScore > 0.9) threatLevel = "critical";
  else if (similarityScore > 0.8) threatLevel = "high";
  else if (similarityScore > 0.7) threatLevel = "medium";

  const topMatch = searchResults[0];
  
  return {
    protection_record_id: null,
    user_id: userId,
    match_type: aiTrainingDetected ? "ai_training" : "plagiarism",
    source_url: topMatch?.url || `https://${platform.toLowerCase().replace(/\s/g, '')}.com`,
    source_domain: topMatch?.domain || platform.toLowerCase().replace(/\s/g, ''),
    similarity_score: similarityScore,
    matched_content: topMatch?.snippet || "Content match detected via API scan",
    context_snippet: topMatch?.title || `Match found on ${platform}`,
    threat_level: threatLevel,
    ai_training_detected: aiTrainingDetected,
    detection_method: config.searchEngine === "copyleaks" ? "copyleaks_professional" : 
                      config.searchEngine === "serpapi" ? "serpapi_search" : "google_search",
    metadata: {
      scan_timestamp: new Date().toISOString(),
      api_used: config.searchEngine,
      total_results: searchResults.length,
      copyleaks_scan_id: copyleaksResult?.scan_id,
      top_matches: searchResults.slice(0, 3).map(r => ({ url: r.url, title: r.title }))
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log("Starting document monitoring for session:", sessionId);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get session details and protection record with extracted text
    const { data: session, error: sessionError } = await supabase
      .from("document_monitoring_sessions")
      .select(`
        *,
        ai_protection_records (
          metadata,
          word_count
        )
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Session fetch error:", sessionError);
      throw new Error(`Failed to fetch session: ${sessionError.message}`);
    }

    // Check if we have document content to scan
    const documentContent = session.ai_protection_records?.metadata?.original_text || "";
    const wordCount = session.ai_protection_records?.word_count || 0;
    
    if ((!documentContent || documentContent.trim().length === 0) && wordCount === 0) {
      console.error("No document content available for session:", sessionId);
      
      // Update session with error status
      await supabase
        .from("document_monitoring_sessions")
        .update({
          status: "failed",
          metadata: {
            error: "No document text available. Text extraction may have failed or is still in progress.",
            error_time: new Date().toISOString()
          }
        })
        .eq("id", sessionId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "No document content available for scanning. Please ensure the document text has been extracted.",
          sessionId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Document content length:", documentContent.length, "characters, word count:", wordCount);

    const platforms = [
      "Google Scholar",
      "Research Gate",
      "Academia.edu",
      "Medium",
      "Substack",
      "Common Crawl",
      "AI Training Datasets"
    ];

    const results = [];

    for (const platform of platforms) {
      console.log(`Scanning ${platform} for plagiarism...`);

      const { error: insertError } = await supabase.from("document_scan_updates").insert({
        session_id: sessionId,
        user_id: userId,
        platform: platform,
        status: "scanning",
        progress_percentage: 0,
        sources_scanned: 0,
        matches_found: 0,
        scan_details: { started_at: new Date().toISOString() }
      });

      if (insertError) {
        console.error(`Failed to insert scan update for ${platform}:`, insertError);
      }

      // Real API scan
      const platformResult = await scanPlatformForPlagiarism(platform, documentContent, userId);
      
      if (platformResult) {
        results.push(platformResult);

        await supabase.from("document_plagiarism_matches").insert({
          session_id: sessionId,
          protection_record_id: platformResult.protection_record_id,
          user_id: platformResult.user_id,
          match_type: platformResult.match_type,
          source_url: platformResult.source_url,
          source_domain: platformResult.source_domain,
          similarity_score: platformResult.similarity_score,
          matched_content: platformResult.matched_content,
          context_snippet: platformResult.context_snippet,
          threat_level: platformResult.threat_level,
          ai_training_detected: platformResult.ai_training_detected,
          detection_method: platformResult.detection_method,
          metadata: platformResult.metadata
        });

        if (platformResult.threat_level === "critical" || platformResult.threat_level === "high") {
          await supabase.from("ai_protection_notifications").insert({
            user_id: platformResult.user_id,
            notification_type: "document_plagiarism_detected",
            title: `High-Risk Plagiarism Detected on ${platform}`,
            message: `We detected ${Math.round(platformResult.similarity_score * 100)}% similarity of your document on ${platform}.`,
            severity: platformResult.threat_level === "critical" ? "critical" : "warning",
            action_url: `/document-protection?session=${sessionId}`,
            metadata: {
              session_id: sessionId,
              platform: platform,
              similarity: platformResult.similarity_score
            }
          });
        }
      }

      const { error: completeError } = await supabase.from("document_scan_updates").insert({
        session_id: sessionId,
        user_id: userId,
        platform: platform,
        status: "completed",
        progress_percentage: 100,
        sources_scanned: platformResult ? (platformResult.metadata.total_results || 10) : 0,
        matches_found: platformResult ? 1 : 0,
        scan_details: { 
          completed_at: new Date().toISOString(),
          result: platformResult || "no_matches"
        }
      });

      if (completeError) {
        console.error(`Failed to insert completed scan update for ${platform}:`, completeError);
      }

      // Rate limiting between platform scans
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await supabase
      .from("document_monitoring_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        total_scans: platforms.length,
        total_matches: results.length,
        high_risk_matches: results.filter(r => r.threat_level === "high" || r.threat_level === "critical").length
      })
      .eq("id", sessionId);

    console.log(`Document monitoring scan completed. Found ${results.length} real matches.`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        platforms_scanned: platforms.length,
        matches_found: results.length,
        results: results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document monitoring error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

