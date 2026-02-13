import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artworkId, filePath } = await req.json();
    
    console.log('Starting real-time AI monitoring for artwork:', artworkId);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artwork')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (artworkError) throw artworkError;

    // Get public URL for reverse image search
    const { data: { publicUrl } } = supabase.storage
      .from('artwork')
      .getPublicUrl(filePath);

    console.log('Running REAL-TIME reverse image search...');

    const tineye_key = Deno.env.get('TINEYE_API_KEY');
    const serpapi_key = Deno.env.get('SERPAPI_KEY');
    const bing_key = Deno.env.get('BING_VISUAL_SEARCH_API_KEY');
    
    let totalScanned = 0;
    let matchesFound = 0;
    const allMatches: any[] = [];

    // TinEye real-time
    if (tineye_key) {
      try {
        console.log('TinEye real-time search...');
        const tineye_url = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(publicUrl)}&api_key=${tineye_key}`;
        const response = await fetch(tineye_url);
        const data = await response.json();
        
        if (data.results?.matches) {
          totalScanned += data.results.matches.length;
          matchesFound += Math.min(data.results.matches.length, 10);
          
          for (const match of data.results.matches.slice(0, 10)) {
            allMatches.push({
              url: match.backlinks?.[0]?.url || `https://${match.domain}`,
              platform: match.domain || 'unknown',
              score: match.score || 0.85,
              source: 'tineye'
            });
          }
        }
        console.log('TinEye real-time:', data.results?.matches?.length || 0, 'matches');
      } catch (error) {
        console.error('TinEye real-time failed:', error);
      }
    }

    // Google real-time
    if (serpapi_key) {
      try {
        console.log('Google real-time search...');
        const serp_url = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(publicUrl)}&api_key=${serpapi_key}`;
        const response = await fetch(serp_url);
        const data = await response.json();
        
        if (data.image_results) {
          totalScanned += data.image_results.length;
          matchesFound += Math.min(data.image_results.length, 10);
          
          for (const result of data.image_results.slice(0, 10)) {
            allMatches.push({
              url: result.link,
              platform: new URL(result.link).hostname,
              score: 0.75,
              source: 'google'
            });
          }
        }
        console.log('Google real-time:', data.image_results?.length || 0, 'matches');
      } catch (error) {
        console.error('Google real-time failed:', error);
      }
    }

    // Bing real-time
    if (bing_key) {
      try {
        console.log('Bing real-time search...');
        const bing_response = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': bing_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageInfo: { url: publicUrl } })
        });
        const data = await bing_response.json();
        
        if (data.tags?.[0]?.actions) {
          for (const action of data.tags[0].actions) {
            if (action.actionType === 'PagesIncluding' && action.data?.value) {
              totalScanned += action.data.value.length;
              matchesFound += Math.min(action.data.value.length, 10);
              
              for (const page of action.data.value.slice(0, 10)) {
                allMatches.push({
                  url: page.hostPageUrl,
                  platform: new URL(page.hostPageUrl).hostname,
                  score: 0.7,
                  source: 'bing'
                });
              }
            }
          }
        }
        console.log('Bing real-time found matches');
      } catch (error) {
        console.error('Bing real-time failed:', error);
      }
    }

    if (!tineye_key && !serpapi_key && !bing_key) {
      throw new Error('No API keys configured for real-time scanning. Please add TINEYE_API_KEY, SERPAPI_KEY, or BING_VISUAL_SEARCH_API_KEY.');
    }

    // Create copyright matches
    for (let i = 0; i < Math.min(allMatches.length, 10); i++) {
      const match = allMatches[i];
      const threatLevel = match.score > 0.85 ? 'high' : match.score > 0.7 ? 'medium' : 'low';

      await supabase.from('copyright_matches').insert({
        artwork_id: artworkId,
        scan_id: artworkId,
        source_url: match.url,
        source_domain: match.platform,
        match_type: 'realtime-detection',
        match_confidence: match.score,
        threat_level: threatLevel,
        description: `Real-time match via ${match.source} with ${(match.score * 100).toFixed(1)}% confidence`,
        is_authorized: false,
        is_reviewed: false
      });
    }

    // Update scan record
    await supabase
      .from('monitoring_scans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sources_scanned: totalScanned,
        matches_found: matchesFound,
        results_data: {
          real_detection: true,
          apis_used: [
            tineye_key ? 'tineye' : null,
            serpapi_key ? 'google' : null,
            bing_key ? 'bing' : null
          ].filter(Boolean),
          total_results: totalScanned,
          matches_by_source: allMatches.reduce((acc, m) => {
            acc[m.source] = (acc[m.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      })
      .eq('artwork_id', artworkId)
      .eq('scan_type', 'realtime-ai');

    console.log('Real-time AI scan completed:', { matchesFound, totalScanned });

    return new Response(
      JSON.stringify({
        success: true,
        real_detection: true,
        matches_found: matchesFound,
        total_scanned: totalScanned,
        platforms: [...new Set(allMatches.map(m => m.platform))],
        apis_used: [
          tineye_key ? 'TinEye' : null,
          serpapi_key ? 'Google' : null,
          bing_key ? 'Bing' : null
        ].filter(Boolean)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in real-time AI scan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});