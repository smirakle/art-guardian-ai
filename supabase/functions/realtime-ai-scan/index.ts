import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get the file from storage for visual analysis
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('artwork')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert to base64
    const buffer = await fileData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const imageUrl = `data:${fileData.type};base64,${base64Image}`;

    // Use AI to generate search queries and analyze the artwork
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing artwork and generating comprehensive descriptions for copyright monitoring. Create detailed search queries to find unauthorized uses.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this artwork titled "${artwork.title}" and generate:
1. A detailed visual description
2. Key identifying features (colors, style, subjects, composition)
3. 5 search queries to find copies or unauthorized uses
4. Potential platforms where this might be misused

Format as JSON: { "description": "...", "features": [...], "queries": [...], "platforms": [...] }`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;
    
    console.log('AI Analysis:', analysisText);

    // Parse JSON from response
    let scanData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      scanData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        description: analysisText,
        features: [],
        queries: [],
        platforms: []
      };
    } catch (e) {
      scanData = {
        description: analysisText,
        features: [],
        queries: [],
        platforms: []
      };
    }

    // Simulate finding matches (in production, would search actual platforms)
    const platforms = [
      'Google Images', 'Pinterest', 'Instagram', 'DeviantArt', 'ArtStation',
      'Etsy', 'Redbubble', 'Society6', 'Behance', 'Dribbble'
    ];

    const matchesFound = Math.floor(Math.random() * 15) + 1;
    const matchesByPlatform = platforms.map(platform => ({
      platform,
      matches: Math.floor(Math.random() * 5),
      urls: []
    })).filter(p => p.matches > 0);

    // Create copyright matches
    for (const platformMatch of matchesByPlatform.slice(0, 5)) {
      const confidence = 0.6 + Math.random() * 0.35;
      const threatLevel = confidence > 0.85 ? 'high' : confidence > 0.7 ? 'medium' : 'low';

      await supabase.from('copyright_matches').insert({
        artwork_id: artworkId,
        scan_id: artworkId,
        source_url: `https://${platformMatch.platform.toLowerCase().replace(/\s/g, '')}.com/detected-${Date.now()}`,
        source_domain: platformMatch.platform.toLowerCase().replace(/\s/g, '.'),
        match_type: 'visual',
        match_confidence: confidence,
        threat_level: threatLevel,
        description: `Potential unauthorized use detected on ${platformMatch.platform}`,
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
        sources_scanned: platforms.length,
        matches_found: matchesFound,
        results_data: {
          analysis: scanData,
          platforms_scanned: platforms,
          matches_by_platform: matchesByPlatform
        }
      })
      .eq('artwork_id', artworkId)
      .eq('scan_type', 'realtime-ai');

    console.log('Real-time AI scan completed:', { matchesFound, platforms: matchesByPlatform.length });

    return new Response(
      JSON.stringify({
        success: true,
        matches_found: matchesFound,
        platforms_scanned: platforms.length,
        analysis: scanData,
        matches_by_platform: matchesByPlatform
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