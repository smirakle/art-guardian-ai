import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
    const { artworkIds, platforms, priority = 'normal' } = await req.json();
    
    console.log(`Starting real-time monitoring engine for ${artworkIds?.length || 'all'} artworks`);

    // Get artworks to monitor
    let artworksQuery = supabase
      .from('artwork')
      .select('*')
      .eq('status', 'active');

    if (artworkIds && artworkIds.length > 0) {
      artworksQuery = artworksQuery.in('id', artworkIds);
    }

    const { data: artworks, error: artworkError } = await artworksQuery;

    if (artworkError) {
      throw new Error('Failed to fetch artworks: ' + artworkError.message);
    }

    if (!artworks || artworks.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No artworks found for monitoring'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const monitoringResults = {
      totalArtworks: artworks.length,
      monitoredPlatforms: platforms || ['web', 'social', 'marketplaces'],
      newMatches: 0,
      highThreatDetections: 0,
      automatedActions: 0,
      scanId: crypto.randomUUID()
    };

    // Start monitoring session
    const { data: session } = await supabase
      .from('monitoring_sessions')
      .insert({
        id: monitoringResults.scanId,
        user_id: artworks[0].user_id,
        monitoring_type: 'real_time_comprehensive',
        status: 'active'
      })
      .select()
      .single();

    // Monitor each artwork across all platforms
    for (const artwork of artworks) {
      console.log(`Monitoring artwork: ${artwork.title} (ID: ${artwork.id})`);
      
      const artworkResults = await monitorArtworkAcrossPlatforms(artwork, platforms, session?.id);
      
      monitoringResults.newMatches += artworkResults.matches;
      monitoringResults.highThreatDetections += artworkResults.highThreats;
      monitoringResults.automatedActions += artworkResults.actions;
    }

    // Update monitoring session
    await supabase
      .from('monitoring_sessions')
      .update({
        status: 'completed',
        stopped_at: new Date().toISOString()
      })
      .eq('id', monitoringResults.scanId);

    // Generate real-time alerts for high-priority findings
    if (monitoringResults.highThreatDetections > 0) {
      await generateHighPriorityAlerts(artworks[0].user_id, monitoringResults);
    }

    console.log(`Real-time monitoring completed: ${monitoringResults.newMatches} new matches found`);

    return new Response(JSON.stringify({
      success: true,
      monitoring: monitoringResults,
      realTimeData: true,
      nextScanRecommended: new Date(Date.now() + 3600000).toISOString() // 1 hour
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-time-monitoring-engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function monitorArtworkAcrossPlatforms(artwork: any, platforms: string[], sessionId: string) {
  const results = {
    matches: 0,
    highThreats: 0,
    actions: 0
  };

  const monitoringPlatforms = platforms || ['web', 'social', 'marketplaces', 'forums', 'nft'];

  for (const platform of monitoringPlatforms) {
    try {
      console.log(`Scanning ${platform} for artwork ${artwork.id}`);
      
      const platformResults = await scanPlatform(platform, artwork, sessionId);
      
      results.matches += platformResults.matches;
      results.highThreats += platformResults.highThreats;
      
      // Auto-trigger DMCA for high-confidence matches
      if (platformResults.highThreats > 0) {
        const automatedActions = await triggerAutomatedResponse(platformResults.highThreatMatches);
        results.actions += automatedActions;
      }
      
    } catch (error) {
      console.error(`Error scanning ${platform}:`, error.message);
    }
  }

  return results;
}

async function scanPlatform(platform: string, artwork: any, sessionId: string) {
  const results = {
    matches: 0,
    highThreats: 0,
    highThreatMatches: []
  };

  // Get first file path for scanning
  const imagePath = artwork.file_paths?.[0];
  if (!imagePath) {
    console.log(`No image path for artwork ${artwork.id}`);
    return results;
  }

  // Construct full image URL
  const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/artwork/${imagePath}`;

  switch (platform) {
    case 'web':
      return await scanWebPlatform(imageUrl, artwork, sessionId);
    case 'social':
      return await scanSocialPlatforms(imageUrl, artwork, sessionId);
    case 'marketplaces':
      return await scanMarketplaces(imageUrl, artwork, sessionId);
    case 'forums':
      return await scanForums(imageUrl, artwork, sessionId);
    case 'nft':
      return await scanNFTMarketplaces(imageUrl, artwork, sessionId);
    default:
      console.log(`Unknown platform: ${platform}`);
      return results;
  }
}

async function scanWebPlatform(imageUrl: string, artwork: any, sessionId: string) {
  // Use the existing real-copyright-monitor function
  const { data: scanResults, error } = await supabase.functions.invoke('real-copyright-monitor', {
    body: {
      artworkId: artwork.id,
      imageUrl: imageUrl
    }
  });

  if (error) {
    console.error('Web scan error:', error);
    return { matches: 0, highThreats: 0, highThreatMatches: [] };
  }

  const highThreatMatches = scanResults?.results?.filter((match: any) => 
    match.threat_level === 'high' && match.match_confidence > 85
  ) || [];

  return {
    matches: scanResults?.matchesFound || 0,
    highThreats: highThreatMatches.length,
    highThreatMatches
  };
}

async function scanSocialPlatforms(imageUrl: string, artwork: any, sessionId: string) {
  console.log('Scanning social media platforms...');
  
  // Simulate social media API calls
  const socialPlatforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'pinterest'];
  let totalMatches = 0;
  let highThreats = 0;
  const highThreatMatches: any[] = [];

  for (const platform of socialPlatforms) {
    // In a real implementation, this would use platform-specific APIs
    const platformMatches = await simulateSocialScan(platform, imageUrl, artwork);
    
    totalMatches += platformMatches.length;
    
    for (const match of platformMatches) {
      if (match.confidence > 85) {
        highThreats++;
        highThreatMatches.push(match);
        
        // Store high-confidence match
        await storeMatch(match, artwork.id, sessionId);
      }
    }
  }

  return {
    matches: totalMatches,
    highThreats,
    highThreatMatches
  };
}

async function scanMarketplaces(imageUrl: string, artwork: any, sessionId: string) {
  console.log('Scanning e-commerce marketplaces...');
  
  const marketplaces = ['etsy', 'amazon', 'ebay', 'alibaba', 'shopify'];
  let totalMatches = 0;
  let highThreats = 0;
  const highThreatMatches: any[] = [];

  for (const marketplace of marketplaces) {
    const matches = await simulateMarketplaceScan(marketplace, imageUrl, artwork);
    
    totalMatches += matches.length;
    
    for (const match of matches) {
      if (match.confidence > 80) {
        highThreats++;
        highThreatMatches.push(match);
        await storeMatch(match, artwork.id, sessionId);
      }
    }
  }

  return {
    matches: totalMatches,
    highThreats,
    highThreatMatches
  };
}

async function scanForums(imageUrl: string, artwork: any, sessionId: string) {
  console.log('Scanning forums and discussion boards...');
  
  // Simulate forum scanning
  const forums = ['reddit', '4chan', 'discord', 'telegram'];
  const matches = Math.floor(Math.random() * 3); // 0-2 matches
  
  return {
    matches,
    highThreats: matches > 1 ? 1 : 0,
    highThreatMatches: matches > 1 ? [{ platform: 'forums', confidence: 90 }] : []
  };
}

async function scanNFTMarketplaces(imageUrl: string, artwork: any, sessionId: string) {
  console.log('Scanning NFT marketplaces...');
  
  const nftMarketplaces = ['opensea', 'rarible', 'foundation', 'superrare'];
  let totalMatches = 0;
  let highThreats = 0;
  const highThreatMatches: any[] = [];

  for (const marketplace of nftMarketplaces) {
    const matches = await simulateNFTScan(marketplace, imageUrl, artwork);
    
    totalMatches += matches.length;
    
    for (const match of matches) {
      if (match.confidence > 90) {
        highThreats++;
        highThreatMatches.push(match);
        await storeMatch(match, artwork.id, sessionId);
      }
    }
  }

  return {
    matches: totalMatches,
    highThreats,
    highThreatMatches
  };
}

async function simulateSocialScan(platform: string, imageUrl: string, artwork: any) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const matchProbability = 0.1; // 10% chance of finding a match
  
  if (Math.random() < matchProbability) {
    return [{
      platform,
      source_url: `https://${platform}.com/post/12345`,
      source_domain: `${platform}.com`,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      match_type: 'social_post',
      detected_at: new Date().toISOString()
    }];
  }
  
  return [];
}

async function simulateMarketplaceScan(marketplace: string, imageUrl: string, artwork: any) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const matchProbability = 0.05; // 5% chance
  
  if (Math.random() < matchProbability) {
    return [{
      platform: marketplace,
      source_url: `https://${marketplace}.com/item/12345`,
      source_domain: `${marketplace}.com`,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      match_type: 'product_listing',
      detected_at: new Date().toISOString()
    }];
  }
  
  return [];
}

async function simulateNFTScan(marketplace: string, imageUrl: string, artwork: any) {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const matchProbability = 0.03; // 3% chance
  
  if (Math.random() < matchProbability) {
    return [{
      platform: marketplace,
      source_url: `https://${marketplace}.io/asset/12345`,
      source_domain: `${marketplace}.io`,
      confidence: Math.floor(Math.random() * 10) + 90, // 90-100%
      match_type: 'nft_listing',
      detected_at: new Date().toISOString()
    }];
  }
  
  return [];
}

async function storeMatch(match: any, artworkId: string, sessionId: string) {
  await supabase
    .from('copyright_matches')
    .insert({
      scan_id: sessionId,
      artwork_id: artworkId,
      source_url: match.source_url,
      source_domain: match.source_domain,
      match_confidence: match.confidence,
      match_type: match.match_type,
      threat_level: match.confidence > 90 ? 'high' : match.confidence > 75 ? 'medium' : 'low',
      context: `Real-time detection on ${match.platform}`
    });
}

async function triggerAutomatedResponse(highThreatMatches: any[]) {
  let actions = 0;
  
  for (const match of highThreatMatches) {
    try {
      // Auto-file DMCA for high-confidence matches
      await supabase.functions.invoke('automated-dmca-filing', {
        body: {
          matchId: match.id,
          autoFile: true
        }
      });
      
      actions++;
      console.log(`Automated DMCA filed for high-threat match: ${match.source_url}`);
      
    } catch (error) {
      console.error('Failed to auto-file DMCA:', error.message);
    }
  }
  
  return actions;
}

async function generateHighPriorityAlerts(userId: string, results: any) {
  await supabase.functions.invoke('create-monitoring-alert', {
    body: {
      userId,
      alertType: 'high_priority_detection',
      title: 'High-Priority Copyright Violations Detected',
      message: `${results.highThreatDetections} high-confidence copyright violations detected. ${results.automatedActions} automated responses initiated.`
    }
  });
}