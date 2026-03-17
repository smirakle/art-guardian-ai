import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Document Monitoring Engine function started");

// Real web search for document plagiarism using SerpAPI
async function searchWebForPlagiarism(
  content: string,
  platform: string,
  supabase: any,
  sessionId: string
): Promise<any[]> {
  console.log(`Real scan on ${platform}...`);

  await supabase.from("document_scan_updates").insert({
    session_id: sessionId,
    platform,
    status: "scanning",
    scanned_items: 0,
    total_items: 100,
    metadata: { started_at: new Date().toISOString() },
  });

  const serpApiKey = Deno.env.get("SERPAPI_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  // Extract a representative snippet for searching (first ~200 chars of meaningful text)
  const snippet = content.replace(/\s+/g, " ").trim().substring(0, 200);
  const searchQuery = `"${snippet.substring(0, 80)}" ${platform}`;

  const matches: any[] = [];

  // Search with SerpAPI
  if (serpApiKey) {
    try {
      const url = `https://serpapi.com/search?engine=google&q=${encodeURIComponent(searchQuery)}&num=10&api_key=${serpApiKey}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        const results = data.organic_results || [];

        for (const r of results) {
          // Use OpenAI to check if the found page actually contains similar content
          let similarity = 0.4; // base similarity for keyword match
          if (openaiKey && r.snippet) {
            similarity = await computeSimilarityWithAI(openaiKey, content.substring(0, 500), r.snippet);
          }

          if (similarity >= 0.5) {
            matches.push({
              platform,
              url: r.link,
              title: r.title || `Match on ${platform}`,
              similarity_score: similarity,
              snippet: r.snippet || "",
              detected_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.error(`SerpAPI search error for ${platform}:`, e);
    }
  }

  // Google Custom Search fallback
  const googleKey = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY");
  const googleCx = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");
  if (matches.length === 0 && googleKey && googleCx) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(searchQuery)}&num=5`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        for (const item of data.items || []) {
          let similarity = 0.4;
          if (openaiKey && item.snippet) {
            similarity = await computeSimilarityWithAI(openaiKey, content.substring(0, 500), item.snippet);
          }
          if (similarity >= 0.5) {
            matches.push({
              platform,
              url: item.link,
              title: item.title,
              similarity_score: similarity,
              snippet: item.snippet || "",
              detected_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.error(`Google CSE error for ${platform}:`, e);
    }
  }

  // Update scan as complete
  await supabase.from("document_scan_updates").insert({
    session_id: sessionId,
    platform,
    status: "completed",
    scanned_items: 100,
    total_items: 100,
    matches_found: matches.length,
    metadata: { completed_at: new Date().toISOString(), real_search: true },
  });

  return matches;
}

async function computeSimilarityWithAI(apiKey: string, original: string, found: string): Promise<number> {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You compare two text excerpts for plagiarism similarity. Return ONLY a JSON object: {\"similarity\": 0.0-1.0, \"reason\": \"brief explanation\"}",
          },
          {
            role: "user",
            content: `Original excerpt:\n${original}\n\nFound text:\n${found}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return typeof parsed.similarity === "number" ? parsed.similarity : 0.3;
      }
    }
  } catch (e) {
    console.error("AI similarity error:", e);
  }
  return 0.3;
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

    const { data: session, error: sessionError } = await supabase
      .from("document_monitoring_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: "Session not found", sessionId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    let documentContent = "";
    if (session.protection_record_id) {
      const { data: protectionRecord } = await supabase
        .from("ai_protection_records")
        .select("metadata, word_count")
        .eq("id", session.protection_record_id)
        .single();

      if (protectionRecord?.metadata?.original_text) {
        documentContent = protectionRecord.metadata.original_text;
      }
    }

    if (!documentContent) {
      documentContent = "No document content available for scanning.";
    }

    console.log(`Document content length: ${documentContent.length} characters`);

    // Call Copyscape first
    let copyscapeMatches = 0;
    let totalMatches = 0;
    let highRiskMatches = 0;

    try {
      const { data: copyscapeResult, error: copyscapeError } = await supabase.functions.invoke(
        "scan-plagiarism-copyscape",
        { body: { sessionId, documentContent } }
      );

      if (!copyscapeError && copyscapeResult?.success) {
        copyscapeMatches = copyscapeResult.matchesFound || 0;
        totalMatches = copyscapeMatches;
        if (copyscapeResult.matches) {
          highRiskMatches = copyscapeResult.matches.filter((m: any) => m.similarity_score > 0.8).length;
        }
        console.log(`Copyscape found ${copyscapeMatches} matches (${highRiskMatches} high-risk)`);
      }
    } catch (error) {
      console.error("Error calling Copyscape scanner:", error);
    }

    // AI analysis on Copyscape matches
    if (copyscapeMatches > 0) {
      const { data: matches } = await supabase
        .from("document_plagiarism_matches")
        .select("*")
        .eq("session_id", sessionId)
        .gte("similarity_score", 0.6)
        .limit(5);

      if (matches?.length) {
        for (const match of matches) {
          try {
            await supabase.functions.invoke("analyze-similarity-ai", {
              body: {
                originalText: documentContent,
                comparedText: match.matched_content || "",
                matchUrl: match.source_url,
                sessionId,
              },
            });
          } catch (e) {
            console.error("AI analysis error:", e);
          }
        }
      }
    }

    // If Copyscape didn't find matches, do real web search
    if (totalMatches === 0) {
      console.log("Running real web search fallback...");
      const platforms = session.platforms || ["Google Scholar", "Academia.edu", "Medium"];

      for (const platform of platforms) {
        const matches = await searchWebForPlagiarism(documentContent, platform, supabase, sessionId);

        for (const match of matches) {
          const isHighRisk = match.similarity_score > 0.8;
          if (isHighRisk) highRiskMatches++;

          await supabase.from("document_plagiarism_matches").insert({
            session_id: sessionId,
            protection_record_id: session.protection_record_id,
            source_url: match.url,
            source_title: match.title,
            similarity_score: match.similarity_score,
            matched_content: match.snippet,
            platform: match.platform,
            detected_at: match.detected_at,
            metadata: { real_search: true },
          });

          totalMatches++;
        }
      }
    }

    // Update session
    await supabase
      .from("document_monitoring_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_matches: totalMatches,
        high_risk_matches: highRiskMatches,
      })
      .eq("id", sessionId);

    if (totalMatches > 0) {
      await supabase.from("ai_protection_notifications").insert({
        user_id: session.user_id,
        notification_type: "monitoring_complete",
        title: "Document Monitoring Complete",
        message: `Scan finished: ${totalMatches} potential matches found${highRiskMatches > 0 ? ` (${highRiskMatches} high-risk)` : ""}.`,
        severity: highRiskMatches > 0 ? "warning" : "info",
        action_url: `/document-protection?session=${sessionId}`,
        metadata: {
          session_id: sessionId,
          total_matches: totalMatches,
          high_risk_matches: highRiskMatches,
          scan_type: copyscapeMatches > 0 ? "copyscape" : "web_search",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        totalMatches,
        highRiskMatches,
        scanType: copyscapeMatches > 0 ? "real_copyscape" : "real_web_search",
        message: "Document monitoring completed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in document monitoring:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
