import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artworkId, imageUrl } = await req.json();
    
    if (!artworkId || !imageUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: artworkId and imageUrl'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting real copyright monitoring for artwork ${artworkId}`);

    // Create monitoring scan record
    const { data: scan, error: scanError } = await supabase
      .from('monitoring_scans')
      .insert({
        artwork_id: artworkId,
        scan_type: 'comprehensive',
        status: 'running',
        total_sources: 5, // TinEye, Google, Bing, SerpAPI, Yandex
        scanned_sources: 0
      })
      .select()
      .single();

    if (scanError || !scan) {
      throw new Error('Failed to create monitoring scan');
    }

    // Start real monitoring process
    const results = await performRealSearch(imageUrl, scan.id);

    // Update scan status
    await supabase
      .from('monitoring_scans')
      .update({
        status: 'completed',
        scanned_sources: 5,
        matches_found: results.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id);

    return new Response(JSON.stringify({
      success: true,
      scanId: scan.id,
      matchesFound: results.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-copyright-monitor:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performRealSearch(imageUrl: string, scanId: string) {
  const allMatches: any[] = [];
  let sourcesScanned = 0;

  try {
    // 1. TinEye Reverse Image Search
    console.log('Searching TinEye...');
    const tineyeMatches = await searchTinEye(imageUrl);
    allMatches.push(...tineyeMatches);
    sourcesScanned++;
    
    await updateScanProgress(scanId, sourcesScanned);

    // 2. Google Custom Search
    console.log('Searching Google...');
    const googleMatches = await searchGoogle(imageUrl);
    allMatches.push(...googleMatches);
    sourcesScanned++;
    
    await updateScanProgress(scanId, sourcesScanned);

    // 3. Bing Visual Search
    console.log('Searching Bing...');
    const bingMatches = await searchBing(imageUrl);
    allMatches.push(...bingMatches);
    sourcesScanned++;
    
    await updateScanProgress(scanId, sourcesScanned);

    // 4. SerpAPI
    console.log('Searching SerpAPI...');
    const serpMatches = await searchSerpAPI(imageUrl);
    allMatches.push(...serpMatches);
    sourcesScanned++;
    
    await updateScanProgress(scanId, sourcesScanned);

    // 5. Yandex (using SerpAPI)
    console.log('Searching Yandex...');
    const yandexMatches = await searchYandex(imageUrl);
    allMatches.push(...yandexMatches);
    sourcesScanned++;
    
    await updateScanProgress(scanId, sourcesScanned);

  } catch (error) {
    console.error('Error during search:', error);
  }

  // Store all matches in database
  for (const match of allMatches) {
    await storeMatch(match, scanId);
  }

  return allMatches;
}

async function searchTinEye(imageUrl: string) {
  const apiKey = Deno.env.get('TINEYE_API_KEY');
  const apiSecret = Deno.env.get('TINEYE_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    console.log('TinEye API keys not configured');
    return [];
  }

  try {
    const response = await fetch(`https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
      }
    });

    if (!response.ok) {
      console.error('TinEye API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return data.results?.matches?.map((match: any) => ({
      source_url: match.domain,
      source_domain: new URL(match.domain).hostname,
      source_title: match.title || 'Image match found',
      image_url: match.image_url,
      thumbnail_url: match.thumbnail_url,
      match_confidence: Math.min(match.score * 100, 100),
      match_type: 'exact',
      threat_level: determineThreatLevel(match.score),
      scan_source: 'tineye'
    })) || [];

  } catch (error) {
    console.error('TinEye search error:', error);
    return [];
  }
}

async function searchGoogle(imageUrl: string) {
  const apiKey = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY');
  const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
  
  if (!apiKey || !searchEngineId) {
    console.log('Google API keys not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&imgSize=large&q=${encodeURIComponent(imageUrl)}&num=10`
    );

    if (!response.ok) {
      console.error('Google API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      source_url: item.image.contextLink || item.link,
      source_domain: new URL(item.image.contextLink || item.link).hostname,
      source_title: item.title,
      image_url: item.link,
      thumbnail_url: item.image.thumbnailLink,
      match_confidence: 85, // Google doesn't provide confidence scores
      match_type: 'similar',
      threat_level: 'medium',
      scan_source: 'google'
    })) || [];

  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
}

async function searchBing(imageUrl: string) {
  const apiKey = Deno.env.get('BING_VISUAL_SEARCH_API_KEY');
  
  if (!apiKey) {
    console.log('Bing API key not configured');
    return [];
  }

  try {
    const response = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageInfo: {
          url: imageUrl
        }
      })
    });

    if (!response.ok) {
      console.error('Bing API error:', response.status);
      return [];
    }

    const data = await response.json();
    const matches: any[] = [];

    // Process similar images
    data.tags?.forEach((tag: any) => {
      tag.actions?.forEach((action: any) => {
        if (action.actionType === 'VisualSearch' && action.data?.value) {
          action.data.value.forEach((item: any) => {
            matches.push({
              source_url: item.hostPageUrl || item.webSearchUrl,
              source_domain: item.hostPageDisplayUrl ? new URL(item.hostPageDisplayUrl).hostname : 'bing.com',
              source_title: item.name,
              image_url: item.contentUrl,
              thumbnail_url: item.thumbnailUrl,
              match_confidence: 80,
              match_type: 'similar',
              threat_level: 'medium',
              scan_source: 'bing'
            });
          });
        }
      });
    });

    return matches;

  } catch (error) {
    console.error('Bing search error:', error);
    return [];
  }
}

async function searchSerpAPI(imageUrl: string) {
  const apiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!apiKey) {
    console.log('SerpAPI key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`
    );

    if (!response.ok) {
      console.error('SerpAPI error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return data.image_results?.map((item: any) => ({
      source_url: item.source,
      source_domain: new URL(item.source).hostname,
      source_title: item.title,
      image_url: item.original,
      thumbnail_url: item.thumbnail,
      match_confidence: 90,
      match_type: 'exact',
      threat_level: 'high',
      scan_source: 'serpapi'
    })) || [];

  } catch (error) {
    console.error('SerpAPI search error:', error);
    return [];
  }
}

async function searchYandex(imageUrl: string) {
  const apiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!apiKey) {
    console.log('SerpAPI key not configured for Yandex');
    return [];
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=yandex_images&url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`
    );

    if (!response.ok) {
      console.error('Yandex via SerpAPI error:', response.status);
      return [];
    }

    const data = await response.json();
    
    return data.images_results?.map((item: any) => ({
      source_url: item.source,
      source_domain: new URL(item.source).hostname,
      source_title: item.title,
      image_url: item.original,
      thumbnail_url: item.thumbnail,
      match_confidence: 85,
      match_type: 'similar',
      threat_level: 'medium',
      scan_source: 'yandex'
    })) || [];

  } catch (error) {
    console.error('Yandex search error:', error);
    return [];
  }
}

function determineThreatLevel(confidence: number): string {
  if (confidence > 0.9) return 'high';
  if (confidence > 0.7) return 'medium';
  return 'low';
}

async function updateScanProgress(scanId: string, sourcesScanned: number) {
  await supabase
    .from('monitoring_scans')
    .update({ scanned_sources: sourcesScanned })
    .eq('id', scanId);
}

async function storeMatch(match: any, scanId: string) {
  // Get artwork_id from scan
  const { data: scan } = await supabase
    .from('monitoring_scans')
    .select('artwork_id')
    .eq('id', scanId)
    .single();

  if (!scan) return;

  await supabase
    .from('copyright_matches')
    .insert({
      scan_id: scanId,
      artwork_id: scan.artwork_id,
      source_url: match.source_url,
      source_domain: match.source_domain,
      source_title: match.source_title,
      image_url: match.image_url,
      thumbnail_url: match.thumbnail_url,
      match_confidence: match.match_confidence,
      match_type: match.match_type,
      threat_level: match.threat_level,
      context: `Found via ${match.scan_source}`
    });
}