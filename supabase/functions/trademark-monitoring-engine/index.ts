import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, trademark_id, scan_type, platforms, search_terms, jurisdictions, similarity_threshold, fuzzy_matching, include_expired, search_type: searchType } = await req.json()

    console.log(`Trademark monitoring action: ${action} for trademark: ${trademark_id}`)

    if (action === 'scan_trademark') {
      const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY');
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      const startTime = Date.now();

      const usedPlatforms = platforms?.length > 0 ? platforms : ['Google', 'USPTO', 'Social Media'];

      // Perform real trademark search
      const allResults: any[] = [];

      // 1. SerpAPI text search for trademark mentions
      if (SERPAPI_KEY && search_terms?.length > 0) {
        for (const term of search_terms.slice(0, 3)) {
          try {
            const serpUrl = `https://serpapi.com/search.json?engine=google&q=trademark+"${encodeURIComponent(term)}"&api_key=${SERPAPI_KEY}&num=10`;
            const serpResponse = await fetch(serpUrl);

            if (serpResponse.ok) {
              const serpData = await serpResponse.json();
              for (const result of (serpData.organic_results || []).slice(0, 10)) {
                const similarity = calculateTextSimilarity(term, result.title || '');
                allResults.push({
                  id: `serp_${Date.now()}_${allResults.length}`,
                  trademark_name: result.title || term,
                  owner: result.displayed_link || 'Unknown',
                  status: 'found_online',
                  similarity_score: similarity,
                  risk_level: similarity > 0.8 ? 'high' : similarity > 0.6 ? 'medium' : 'low',
                  jurisdiction: jurisdictions?.[0] || 'US',
                  source_url: result.link,
                  platform: 'Google Search',
                  snippet: result.snippet || '',
                });
              }
            }
          } catch (err) {
            console.error('SerpAPI trademark search error:', err);
          }
        }
      }

      // 2. OpenAI analysis of results for risk assessment
      if (OPENAI_API_KEY && allResults.length > 0) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{
                role: 'system',
                content: 'You are a trademark conflict analyst. Assess the risk level of each search result as a potential trademark conflict.'
              }, {
                role: 'user',
                content: `Search terms: ${search_terms?.join(', ')}
Results found:
${allResults.slice(0, 10).map((r, i) => `${i+1}. "${r.trademark_name}" at ${r.source_url} - snippet: ${r.snippet}`).join('\n')}

For each result, respond with JSON array: [{"index": 0, "risk_level": "high"|"medium"|"low", "reason": "brief reason"}]`
              }],
              max_tokens: 500,
              temperature: 0.2
            })
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            const jsonMatch = content?.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const assessments = JSON.parse(jsonMatch[0]);
              for (const a of assessments) {
                if (allResults[a.index]) {
                  allResults[a.index].risk_level = a.risk_level;
                  allResults[a.index].ai_reason = a.reason;
                }
              }
            }
          }
        } catch (err) {
          console.error('OpenAI trademark analysis error:', err);
        }
      }

      const highRiskMatches = allResults.filter(r => r.risk_level === 'high').length;
      const scanDuration = Date.now() - startTime;

      // Store scan results
      const { data: scanRecord, error: scanError } = await supabase
        .from('trademark_monitoring_scans')
        .insert({
          trademark_id,
          scan_type: scan_type || 'standard',
          platforms_scanned: usedPlatforms,
          jurisdictions_covered: jurisdictions || ['US'],
          similarity_threshold: similarity_threshold || 0.6,
          fuzzy_matching: fuzzy_matching || false,
          total_results_found: allResults.length,
          high_risk_matches: highRiskMatches,
          scan_metadata: {
            search_terms,
            include_expired,
            search_type: searchType,
            scan_duration_ms: scanDuration,
            apis_used: [
              SERPAPI_KEY ? 'SerpAPI' : null,
              OPENAI_API_KEY ? 'OpenAI' : null,
            ].filter(Boolean)
          }
        })
        .select()
        .single()

      if (scanError) throw scanError;

      await supabase
        .from('trademarks')
        .update({ last_monitored_at: new Date().toISOString() })
        .eq('id', trademark_id)

      return new Response(
        JSON.stringify({
          success: true,
          scan_id: scanRecord.id,
          results: {
            total_matches: allResults.length,
            high_risk_matches: highRiskMatches,
            medium_risk_matches: allResults.filter(r => r.risk_level === 'medium').length,
            low_risk_matches: allResults.filter(r => r.risk_level === 'low').length,
            platform_results: allResults.slice(0, 20),
            scan_duration_ms: scanDuration,
          },
          message: `Trademark scan completed. Found ${allResults.length} results (${highRiskMatches} high risk).`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Trademark monitoring error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function calculateTextSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  
  if (aLower === bLower) return 1.0;
  if (bLower.includes(aLower)) return 0.9;
  if (aLower.includes(bLower)) return 0.85;

  // Simple word overlap score
  const aWords = new Set(aLower.split(/\s+/));
  const bWords = new Set(bLower.split(/\s+/));
  let overlap = 0;
  for (const w of aWords) {
    if (bWords.has(w)) overlap++;
  }
  const maxLen = Math.max(aWords.size, bWords.size);
  return maxLen > 0 ? overlap / maxLen : 0;
}
