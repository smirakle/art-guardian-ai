import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== REALTIME DEEPFAKE MONITOR INVOKED ===');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // This function monitors the user's OWN artworks for deepfake derivatives on the web.
    // It uses reverse image search to find the user's artworks, then analyzes matches for deepfake manipulation.

    // 1. Get user's artworks that have file paths
    const { data: artworks, error: artworkError } = await supabaseClient
      .from('artwork')
      .select('id, title, file_paths')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(10);

    if (artworkError) throw artworkError;

    if (!artworks || artworks.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active artworks to monitor',
        monitoring_summary: { artworks_checked: 0, deepfakes_detected: 0 }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const TINEYE_API_KEY = Deno.env.get('TINEYE_API_KEY');

    let totalChecked = 0;
    let deepfakesDetected = 0;
    const detections: any[] = [];

    // 2. For each artwork, search for online copies and analyze them
    for (const artwork of artworks) {
      if (!artwork.file_paths || artwork.file_paths.length === 0) continue;

      const filePath = artwork.file_paths[0];
      
      // Get public URL for the artwork
      const { data: urlData } = supabaseClient.storage.from('artwork').getPublicUrl(filePath);
      if (!urlData?.publicUrl) continue;

      // Use SerpAPI Google Lens to find copies
      let foundUrls: string[] = [];

      if (SERPAPI_KEY) {
        try {
          const serpUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(urlData.publicUrl)}&api_key=${SERPAPI_KEY}`;
          const serpResponse = await fetch(serpUrl);
          
          if (serpResponse.ok) {
            const serpData = await serpResponse.json();
            const visualMatches = serpData.visual_matches || [];
            foundUrls = visualMatches
              .filter((m: any) => m.thumbnail)
              .slice(0, 5)
              .map((m: any) => m.thumbnail);
          }
        } catch (err) {
          console.error('SerpAPI search error:', err);
        }
      }

      // Also try TinEye
      if (TINEYE_API_KEY && foundUrls.length < 3) {
        try {
          const tinyResponse = await fetch('https://api.tineye.com/rest/search/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              api_key: TINEYE_API_KEY,
              url: urlData.publicUrl,
            }),
          });

          if (tinyResponse.ok) {
            const tinyData = await tinyResponse.json();
            const matches = tinyData.results?.matches || [];
            for (const m of matches.slice(0, 3)) {
              if (m.backlinks?.[0]?.url) foundUrls.push(m.backlinks[0].url);
            }
          }
        } catch (err) {
          console.error('TinEye search error:', err);
        }
      }

      totalChecked++;

      // 3. For each found URL, analyze if it's a deepfake modification of the original
      if (OPENAI_API_KEY && foundUrls.length > 0) {
        for (const matchUrl of foundUrls.slice(0, 3)) {
          try {
            const analysisResult = await analyzeForDeepfakeModification(
              OPENAI_API_KEY, urlData.publicUrl, matchUrl
            );

            if (analysisResult.isDeepfake) {
              deepfakesDetected++;
              detections.push({
                artwork_id: artwork.id,
                artwork_title: artwork.title,
                match_url: matchUrl,
                confidence: analysisResult.confidence,
                manipulation_type: analysisResult.manipulation_type,
                threat_level: analysisResult.confidence > 0.8 ? 'high' : 'medium',
              });

              // Store in ai_detection_results
              await supabaseClient.from('ai_detection_results').insert({
                user_id: user.id,
                artwork_id: artwork.id,
                detection_type: 'deepfake',
                ai_model_used: 'gpt-4o-mini',
                confidence_score: analysisResult.confidence,
                threat_level: analysisResult.confidence > 0.8 ? 'high' : 'medium',
                status: 'detected',
                detection_metadata: {
                  match_url: matchUrl,
                  manipulation_type: analysisResult.manipulation_type,
                  analysis: analysisResult.analysis,
                  original_url: urlData.publicUrl,
                }
              }).catch(err => console.error('Failed to store detection:', err));
            }
          } catch (err) {
            console.error('Analysis error for match URL:', err);
          }
        }
      }
    }

    // Log metrics
    await supabaseClient.from('production_metrics').insert({
      metric_type: 'realtime_deepfake_monitor',
      metric_name: 'monitoring_cycle',
      metric_value: deepfakesDetected,
      metadata: {
        user_id: user.id,
        artworks_checked: totalChecked,
        deepfakes_detected: deepfakesDetected,
        urls_analyzed: detections.length,
      }
    }).catch(err => console.error('Metrics logging failed:', err));

    return new Response(JSON.stringify({
      success: true,
      monitoring_summary: {
        artworks_checked: totalChecked,
        online_copies_found: detections.length,
        deepfakes_detected: deepfakesDetected,
      },
      detections,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime deepfake monitor:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeForDeepfakeModification(apiKey: string, originalUrl: string, matchUrl: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Compare these two images. The first is the original artwork. The second was found online. Determine if the second image is a deepfake/AI-manipulated version of the first.

Respond ONLY with valid JSON:
{
  "isDeepfake": boolean,
  "confidence": number 0-1,
  "manipulation_type": "face_swap" | "style_transfer" | "ai_modification" | "simple_copy" | "unrelated",
  "analysis": "brief explanation"
}`
            },
            { type: 'image_url', image_url: { url: originalUrl } },
            { type: 'image_url', image_url: { url: matchUrl } }
          ]
        }],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      return { isDeepfake: false, confidence: 0, manipulation_type: 'unknown', analysis: 'API error' };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isDeepfake: false, confidence: 0, manipulation_type: 'unknown', analysis: 'Parse error' };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isDeepfake: parsed.isDeepfake || false,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      manipulation_type: parsed.manipulation_type || 'unknown',
      analysis: parsed.analysis || '',
    };
  } catch (error) {
    console.error('Deepfake comparison error:', error);
    return { isDeepfake: false, confidence: 0, manipulation_type: 'unknown', analysis: error.message };
  }
}
