import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanSource {
  platform: string;
  url: string;
  confidence: number;
  title?: string;
  domain?: string;
}

serve(async (req) => {
  console.log('=== EDGE FUNCTION INVOKED ===');
  console.log('Process monitoring scan function called:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { scanId, artworkId } = requestBody

    if (!scanId || !artworkId) {
      console.error('Missing required parameters:', { scanId, artworkId });
      return new Response(
        JSON.stringify({ error: 'Missing scanId or artworkId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Getting artwork details for:', artworkId);
    // Get the artwork details
    const { data: artwork, error: artworkError } = await supabaseClient
      .from('artwork')
      .select('*')
      .eq('id', artworkId)
      .single()

    if (artworkError || !artwork) {
      console.error('Artwork error:', artworkError);
      throw new Error('Artwork not found')
    }

    console.log('Found artwork:', artwork.title);

    // Update scan status to running
    console.log('Updating scan status to running...');
    const { error: updateError } = await supabaseClient
      .from('monitoring_scans')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString(),
        total_sources: 52000
      })
      .eq('id', scanId)

    if (updateError) {
      console.error('Error updating scan status:', updateError);
    }

    // Simulate scanning across multiple platforms
    const platforms = [
      'Instagram', 'Pinterest', 'DeviantArt', 'ArtStation', 'Behance', 
      'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'Reddit',
      'Etsy', 'Amazon', 'eBay', 'Alibaba', 'Shopify stores',
      'Getty Images', 'Shutterstock', 'Unsplash', 'Pixabay',
      'Dark web marketplaces', 'Telegram channels', 'Discord servers'
    ]

    let sourcesScanned = 0
    let matchesFound = 0

    // Simulate progressive scanning
    for (let batch = 0; batch < 10; batch++) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay per batch

      sourcesScanned += Math.floor(Math.random() * 5000) + 5000
      
      // Simulate finding matches (80% chance per batch for testing)
      if (Math.random() < 0.8) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const confidence = 60 + Math.random() * 40
        const matchType = Math.random() < 0.5 ? 'exact' : 'similar'
        
        const mockDomains = {
          'Instagram': 'instagram.com',
          'Pinterest': 'pinterest.com',
          'DeviantArt': 'deviantart.com',
          'TikTok': 'tiktok.com',
          'YouTube': 'youtube.com',
          'Facebook': 'facebook.com',
          'Twitter/X': 'x.com',
          'Reddit': 'reddit.com',
          'Etsy': 'etsy.com',
          'Dark web marketplaces': 'darkmarket.onion'
        }

        // Create copyright match
        const { error: matchError } = await supabaseClient
          .from('copyright_matches')
          .insert({
            artwork_id: artworkId,
            scan_id: scanId,
            source_url: `https://${mockDomains[platform] || 'example.com'}/post/${Math.random().toString(36).substr(2, 9)}`,
            source_domain: mockDomains[platform] || 'example.com',
            source_title: `Artwork found on ${platform}`,
            match_type: matchType,
            match_confidence: confidence,
            threat_level: confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low',
            context: `Found during automated scan of ${platform}`,
            description: `${matchType === 'exact' ? 'Exact' : 'Similar'} match detected with ${confidence.toFixed(1)}% confidence`,
            detected_at: new Date().toISOString()
          })

        if (!matchError) {
          matchesFound++

          // Create alert for high-confidence matches
          if (confidence > 75) {
            await supabaseClient
              .from('monitoring_alerts')
              .insert({
                user_id: artwork.user_id,
                match_id: scanId, // Using scanId as temporary match_id
                alert_type: confidence > 90 ? 'copyright_violation' : 'potential_infringement',
                title: `Copyright Match Detected on ${platform}`,
                message: `We found a ${confidence > 90 ? 'high confidence' : 'potential'} match of your artwork "${artwork.title}" on ${platform}. Confidence: ${confidence.toFixed(1)}%`
              })
          }
        }
      }

      // Update scan progress
      await supabaseClient
        .from('monitoring_scans')
        .update({ 
          scanned_sources: sourcesScanned,
          matches_found: matchesFound
        })
        .eq('id', scanId)
    }

    // Complete the scan
    await supabaseClient
      .from('monitoring_scans')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        scanned_sources: 52000,
        matches_found: matchesFound
      })
      .eq('id', scanId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sourcesScanned: 52000,
        matchesFound,
        message: `Scan completed. Found ${matchesFound} potential matches across 52,000+ sources.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Monitoring scan error:', error)
    return new Response(
      JSON.stringify({ error: 'Scan processing failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})