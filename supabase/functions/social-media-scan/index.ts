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
    const { artworkId, title, description } = await req.json();
    
    console.log('Starting REAL social media scan for:', title);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tineye_key = Deno.env.get('TINEYE_API_KEY');
    const serpapi_key = Deno.env.get('SERPAPI_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get artwork image
    const { data: artwork } = await supabase
      .from('artwork')
      .select('file_paths')
      .eq('id', artworkId)
      .single();
    
    if (!artwork?.file_paths?.[0]) {
      throw new Error('Artwork image not found');
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${artwork.file_paths[0]}`;
    
    let totalScanned = 0;
    let matchesFound = 0;
    const socialPlatforms = ['instagram.com', 'pinterest.com', 'twitter.com', 'tiktok.com', 'facebook.com'];
    const allMatches: any[] = [];

    // TinEye for social media
    if (tineye_key) {
      try {
        console.log('Searching social media via TinEye...');
        const tineye_url = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&api_key=${tineye_key}`;
        const response = await fetch(tineye_url);
        const data = await response.json();
        
        if (data.results?.matches) {
          const socialMatches = data.results.matches.filter(match => 
            socialPlatforms.some(platform => match.domain?.includes(platform))
          );
          totalScanned += socialMatches.length;
          matchesFound += Math.min(socialMatches.length, 15);
          
          for (const match of socialMatches.slice(0, 15)) {
            const platform = socialPlatforms.find(p => match.domain?.includes(p))?.split('.')[0] || 'social';
            allMatches.push({
              url: match.backlinks?.[0]?.url || `https://${match.domain}`,
              platform,
              score: match.score || 0.85,
              source: 'tineye'
            });
          }
        }
        console.log('Found', socialMatches?.length || 0, 'social media matches via TinEye');
      } catch (error) {
        console.error('TinEye social search failed:', error);
      }
    }

    // Google for social media
    if (serpapi_key) {
      try {
        console.log('Searching social media via Google...');
        const serp_url = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${serpapi_key}`;
        const response = await fetch(serp_url);
        const data = await response.json();
        
        if (data.image_results) {
          const socialResults = data.image_results.filter(result =>
            socialPlatforms.some(platform => result.link?.includes(platform))
          );
          totalScanned += socialResults.length;
          matchesFound += Math.min(socialResults.length, 15);
          
          for (const result of socialResults.slice(0, 15)) {
            const platform = socialPlatforms.find(p => result.link?.includes(p))?.split('.')[0] || 'social';
            allMatches.push({
              url: result.link,
              platform,
              score: 0.8,
              source: 'google'
            });
          }
        }
        console.log('Found', socialResults?.length || 0, 'social media matches via Google');
      } catch (error) {
        console.error('Google social search failed:', error);
      }
    }

    if (!tineye_key && !serpapi_key) {
      throw new Error('No API keys configured for social media scanning. Please add TINEYE_API_KEY or SERPAPI_KEY.');
    }

    // Create matches for different platforms
    for (let i = 0; i < Math.min(allMatches.length, 15); i++) {
      const match = allMatches[i];
      const threatLevel = match.score > 0.85 ? 'high' : match.score > 0.7 ? 'medium' : 'low';

      await supabase.from('copyright_matches').insert({
        artwork_id: artworkId,
        scan_id: artworkId,
        source_url: match.url,
        source_domain: `${match.platform}.com`,
        source_title: `Post on ${match.platform}`,
        match_type: 'social-media',
        match_confidence: match.score,
        threat_level: threatLevel,
        context: `Real detection via ${match.source} on ${match.platform}`,
        description: `Unauthorized social media post detected with ${(match.score * 100).toFixed(1)}% confidence`,
        is_authorized: false,
        is_reviewed: false
      });
    }

    // Update scan results
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
            serpapi_key ? 'google' : null
          ].filter(Boolean),
          total_results: totalScanned,
          matches_by_platform: allMatches.reduce((acc, m) => {
            acc[m.platform] = (acc[m.platform] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      })
      .eq('artwork_id', artworkId)
      .eq('scan_type', 'social-media');

    console.log('Social media scan completed:', { totalScanned, matchesFound });

    return new Response(
      JSON.stringify({
        success: true,
        real_detection: true,
        total_scanned: totalScanned,
        matches_found: matchesFound,
        platforms: [...new Set(allMatches.map(m => m.platform))],
        apis_used: [
          tineye_key ? 'TinEye' : null,
          serpapi_key ? 'Google' : null
        ].filter(Boolean)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in social media scan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});