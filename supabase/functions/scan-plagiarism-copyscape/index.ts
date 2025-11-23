import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COPYSCAPE_USERNAME = Deno.env.get('COPYSCAPE_USERNAME');
const COPYSCAPE_API_KEY = Deno.env.get('COPYSCAPE_API_KEY');

console.log("Copyscape Plagiarism Scanner initialized");

interface CopyscapeResult {
  url: string;
  title: string;
  percentmatched: number;
  minwordsmatched: number;
  textsnippet?: string[];
  htmlsnippet?: string[];
}

interface CopyscapeResponse {
  count?: number;
  result?: CopyscapeResult[];
  error?: string;
  errormessage?: string;
}

/**
 * Scan text for plagiarism using Copyscape API
 */
async function scanWithCopyscape(
  text: string,
  sessionId: string
): Promise<CopyscapeResult[]> {
  if (!COPYSCAPE_USERNAME || !COPYSCAPE_API_KEY) {
    console.error("Copyscape credentials not configured");
    throw new Error("Copyscape API credentials missing");
  }

  // Limit text to 10,000 characters for API
  const searchText = text.substring(0, 10000);
  
  console.log(`Scanning ${searchText.length} characters with Copyscape...`);

  try {
    // Copyscape API endpoint for text search
    const params = new URLSearchParams({
      u: COPYSCAPE_USERNAME,
      k: COPYSCAPE_API_KEY,
      o: 'csearch',  // Text search operation
      t: searchText,
      e: 'UTF-8',
      c: '10'  // Return up to 10 results
    });

    const response = await fetch('https://www.copyscape.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Copyscape API error: ${response.status} ${response.statusText}`);
    }

    const data: CopyscapeResponse = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('Copyscape API error:', data.error, data.errormessage);
      throw new Error(`Copyscape error: ${data.errormessage || data.error}`);
    }

    const results = data.result || [];
    console.log(`Copyscape found ${results.length} matches`);

    return results;
  } catch (error) {
    console.error('Error calling Copyscape API:', error);
    throw error;
  }
}

/**
 * Calculate similarity percentage from Copyscape result
 */
function calculateSimilarity(percentMatched: number, minWordsMatched: number): number {
  // Copyscape returns percentmatched (0-100) and minwordsmatched
  // We'll use percentmatched as the primary metric
  return Math.min(percentMatched, 100) / 100;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, documentContent } = await req.json();
    
    if (!sessionId || !documentContent) {
      throw new Error('sessionId and documentContent are required');
    }

    console.log("Starting Copyscape plagiarism scan for session:", sessionId);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get session details with retry logic
    let session = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!session && retryCount < maxRetries) {
      const { data, error: sessionError } = await supabase
        .from("document_monitoring_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error("Database error fetching session:", sessionError);
        throw new Error(`Database error: ${sessionError.message}`);
      }

      if (data) {
        session = data;
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Session not found, retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    if (!session) {
      console.error("Session not found after retries for ID:", sessionId);
      throw new Error(`Session with ID ${sessionId} does not exist. Please ensure the monitoring session was created before scanning.`);
    }

    // Perform Copyscape scan
    const copyscapeResults = await scanWithCopyscape(documentContent, sessionId);

    // Process results and store in database
    const matches = [];
    for (const result of copyscapeResults) {
      const similarity = calculateSimilarity(result.percentmatched, result.minwordsmatched);
      
      // Store match in database
      const { data: match, error: matchError } = await supabase
        .from('document_plagiarism_matches')
        .insert({
          session_id: sessionId,
          protection_record_id: session.protection_record_id,
          source_url: result.url,
          source_title: result.title || 'Untitled',
          similarity_score: similarity,
          matched_content: result.textsnippet?.join('\n...') || '',
          platform: new URL(result.url).hostname,
          detected_at: new Date().toISOString(),
          metadata: {
            percent_matched: result.percentmatched,
            min_words_matched: result.minwordsmatched,
            html_snippet: result.htmlsnippet,
            copyscape_result: result
          }
        })
        .select()
        .single();

      if (!matchError && match) {
        matches.push(match);
        
        // Create notification for high-confidence matches (>70%)
        if (similarity > 0.70) {
          await supabase.from('ai_protection_notifications').insert({
            user_id: session.user_id,
            notification_type: 'plagiarism_detected',
            title: 'High-Confidence Plagiarism Detected',
            message: `Your document was found on ${new URL(result.url).hostname} with ${Math.round(similarity * 100)}% similarity.`,
            severity: similarity > 0.85 ? 'critical' : 'warning',
            action_url: `/document-protection?match=${match.id}`,
            metadata: {
              match_id: match.id,
              similarity: similarity,
              source_url: result.url
            }
          });
        }
      }
    }

    // Update scan status
    await supabase
      .from('document_scan_updates')
      .insert({
        session_id: sessionId,
        platform: 'Copyscape Web Scan',
        status: 'completed',
        scanned_items: 100,
        total_items: 100,
        matches_found: matches.length,
        metadata: {
          total_results: copyscapeResults.length,
          scan_completed_at: new Date().toISOString()
        }
      });

    console.log(`Scan complete: ${matches.length} plagiarism matches found`);

    return new Response(
      JSON.stringify({
        success: true,
        matchesFound: matches.length,
        matches: matches,
        message: `Found ${matches.length} potential plagiarism matches`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Copyscape scan error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
