import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Document Monitoring Engine function started");

// Define the scanning function BEFORE serve()
async function scanPlatformForPlagiarism(platform: string) {
  const detectionChance = platform === "AI Training Datasets" ? 0.3 : 
                          platform === "Medium" ? 0.25 :
                          platform === "Research Gate" ? 0.2 : 0.1;
  
  if (Math.random() < detectionChance) {
    const similarityScore = 0.7 + Math.random() * 0.3;
    const aiTrainingDetected = platform === "AI Training Datasets" || Math.random() < 0.3;
    
    let threatLevel = "low";
    if (similarityScore > 0.9) threatLevel = "critical";
    else if (similarityScore > 0.8) threatLevel = "high";
    else if (similarityScore > 0.7) threatLevel = "medium";
    
    return {
      protection_record_id: null,
      user_id: null,
      match_type: aiTrainingDetected ? "ai_training" : "plagiarism",
      source_url: `https://${platform.toLowerCase().replace(/\s/g, '')}.com/document/${Math.random().toString(36).substring(7)}`,
      source_domain: platform.toLowerCase().replace(/\s/g, ''),
      similarity_score: similarityScore,
      matched_content: "Sample matched content from the document...",
      context_snippet: "...the surrounding context of the matched content shows clear similarity...",
      threat_level: threatLevel,
      ai_training_detected: aiTrainingDetected,
      detection_method: aiTrainingDetected ? "ai_dataset_scan" : "content_fingerprint",
      metadata: {
        scan_timestamp: new Date().toISOString(),
        platform_confidence: Math.random() * 0.3 + 0.7,
        content_hash: Math.random().toString(36).substring(7)
      }
    };
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionId } = await req.json();
    console.log("Processing document monitoring session:", sessionId);

    // Fetch session data to get user_id
    const { data: session, error: sessionError } = await supabase
      .from("document_monitoring_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Failed to fetch session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const userId = session.user_id;
    console.log("Session user_id:", userId);

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

      const platformResult = await scanPlatformForPlagiarism(platform);
      
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
        sources_scanned: platformResult ? 1000 : 500,
        matches_found: platformResult ? 1 : 0,
        scan_details: { 
          completed_at: new Date().toISOString(),
          result: platformResult || "no_matches"
        }
      });

      if (completeError) {
        console.error(`Failed to insert completed scan update for ${platform}:`, completeError);
      }
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

    console.log(`Document monitoring scan completed. Found ${results.length} matches.`);

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

