import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Production limits
const DAILY_LIMITS = {
  monitoring_sessions: 10,
  serpapi_calls: 100,
  openai_calls: 200
};

// Platform domain mappings for filtering search results
const platformDomains: Record<string, string[]> = {
  'Twitter/X': ['twitter.com', 'x.com', 'twimg.com', 'pbs.twimg.com'],
  'Reddit': ['reddit.com', 'redd.it', 'i.redd.it', 'preview.redd.it'],
  'Instagram': ['instagram.com', 'cdninstagram.com', 'scontent.cdninstagram.com'],
  'TikTok': ['tiktok.com', 'tiktokcdn.com', 'musical.ly'],
  'YouTube': ['youtube.com', 'youtu.be', 'ytimg.com', 'i.ytimg.com'],
  'Facebook': ['facebook.com', 'fbcdn.net', 'fb.com'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!serpApiKey) {
      throw new Error('SERPAPI_KEY is not configured. Please add it to enable real deepfake monitoring.');
    }
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it to enable AI-powered deepfake analysis.');
    }

    const { sessionId } = await req.json();
    console.log(`[PRODUCTION] Real deepfake monitoring started for session: ${sessionId}`);

    // Get the session to find the user
    const { data: session } = await supabase
      .from('realtime_monitoring_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    const userId = session?.user_id;

    // Check daily monitoring limit
    if (userId) {
      const { data: usageCheck } = await supabase.rpc('check_daily_api_limit', {
        p_user_id: userId,
        p_service_type: 'monitoring',
        p_daily_limit: DAILY_LIMITS.monitoring_sessions
      });
      
      if (usageCheck && !usageCheck.allowed) {
        console.log(`[RATE LIMIT] User ${userId} exceeded daily monitoring limit`);
        return new Response(JSON.stringify({
          error: 'Daily monitoring limit reached',
          daily_limit: DAILY_LIMITS.monitoring_sessions,
          reset_time: usageCheck.reset_time,
          hint: 'Your daily monitoring limit resets at midnight UTC'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        });
      }
    }

    // Track API calls for this session
    let apiUsage = { serpapi: 0, openai: 0 };

    // Fetch user's protected images to search for
    const { data: artworks } = await supabase
      .from('artwork')
      .select('id, title, file_paths')
      .eq('user_id', userId)
      .limit(10);

    console.log(`[PRODUCTION] Found ${artworks?.length || 0} protected artworks to monitor`);

    // Platform scanning targets
    const platforms = [
      { name: 'Twitter/X', priority: 'high' },
      { name: 'Reddit', priority: 'high' },
      { name: 'Instagram', priority: 'medium' },
      { name: 'TikTok', priority: 'high' },
      { name: 'YouTube', priority: 'medium' },
      { name: 'Facebook', priority: 'medium' },
    ];

    let totalMatchesFound = 0;
    let platformsScanned = 0;
    let highThreatCount = 0;

    // For each platform, search for user's images
    for (const platform of platforms) {
      platformsScanned++;
      let platformMatches = 0;

      console.log(`Scanning ${platform.name} for deepfakes...`);

      // Search using each protected artwork
      for (const artwork of artworks || []) {
        if (!artwork.file_paths || artwork.file_paths.length === 0) continue;

        const imageUrl = artwork.file_paths[0];
        
        try {
          // Perform real reverse image search with SerpAPI
          const searchResults = await performReverseImageSearch(
            imageUrl, 
            platform.name, 
            serpApiKey
          );

          console.log(`SerpAPI found ${searchResults.length} results for ${artwork.title} on ${platform.name}`);

          // Analyze each found image for deepfake characteristics
          for (const result of searchResults) {
            const analysis = await analyzeForDeepfake(result.imageUrl, openaiApiKey);
            
            if (analysis.isDeepfake) {
              platformMatches++;
              totalMatchesFound++;

              if (analysis.threatLevel === 'high') {
                highThreatCount++;
              }

              // Store real match in database
              const { error: matchError } = await supabase
                .from('deepfake_matches')
                .insert({
                  source_url: result.sourceUrl,
                  source_domain: platform.name.toLowerCase().replace(/\//g, '-'),
                  source_title: result.title || `Found on ${platform.name}`,
                  source_type: 'surface',
                  image_url: result.imageUrl,
                  thumbnail_url: result.thumbnailUrl || result.imageUrl,
                  detection_confidence: analysis.confidence,
                  manipulation_type: analysis.manipulationType,
                  threat_level: analysis.threatLevel,
                  facial_artifacts: analysis.artifacts,
                  temporal_inconsistency: analysis.hasTemporalIssues,
                  metadata_suspicious: analysis.metadataSuspicious,
                  scan_type: 'continuous',
                  context: {
                    platform: platform.name,
                    scan_session: sessionId,
                    original_artwork_id: artwork.id,
                    original_artwork_title: artwork.title,
                    detection_timestamp: new Date().toISOString(),
                    ai_analysis: analysis.rawAnalysis,
                    search_engine: 'serpapi_google_reverse_image'
                  }
                });

              if (matchError) {
                console.error('Error storing match:', matchError);
              }

              // Create alert if high threat
              if (analysis.threatLevel === 'high' || analysis.confidence > 0.85) {
                await supabase
                  .from('advanced_alerts')
                  .insert({
                    user_id: userId || '00000000-0000-0000-0000-000000000000',
                    alert_type: 'deepfake_detection',
                    severity: 'high',
                    title: `Real Deepfake Detected on ${platform.name}`,
                    message: `${analysis.manipulationType} detected with ${Math.round(analysis.confidence * 100)}% confidence. Source: ${result.sourceUrl}`,
                    source_data: {
                      platform: platform.name,
                      confidence: analysis.confidence,
                      manipulation_type: analysis.manipulationType,
                      source_url: result.sourceUrl,
                      original_artwork: artwork.title
                    }
                  });
              }
            }
          }
        } catch (searchError) {
          console.error(`Error searching ${platform.name} for ${artwork.title}:`, searchError);
        }
      }

      // Update scan progress for this platform
      await supabase
        .from('realtime_scan_updates')
        .insert({
          session_id: sessionId,
          platform: platform.name,
          status: 'completed',
          matches_found: platformMatches,
          scan_metadata: {
            search_engine: 'serpapi',
            ai_analyzer: 'openai_gpt4_vision',
            artworks_searched: artworks?.length || 0,
            real_scan: true
          }
        });

      console.log(`Completed ${platform.name}: ${platformMatches} matches found`);
    }

    // Update session with final results
    await supabase
      .from('realtime_monitoring_sessions')
      .update({
        detections_count: totalMatchesFound,
        high_threat_count: highThreatCount,
        platforms_monitored: platforms.map(p => p.name),
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log(`Real deepfake scan complete: ${totalMatchesFound} matches across ${platformsScanned} platforms`);

    return new Response(JSON.stringify({
      success: true,
      session_id: sessionId,
      platforms_scanned: platformsScanned,
      matches_found: totalMatchesFound,
      high_threat_count: highThreatCount,
      scan_type: 'real_api',
      apis_used: ['serpapi_reverse_image', 'openai_gpt4_vision']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deepfake monitoring engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      hint: 'Ensure SERPAPI_KEY and OPENAI_API_KEY are configured in Supabase secrets'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Real reverse image search using SerpAPI
async function performReverseImageSearch(
  imageUrl: string, 
  platformName: string, 
  apiKey: string
): Promise<Array<{ sourceUrl: string; imageUrl: string; title: string; thumbnailUrl?: string }>> {
  const results: Array<{ sourceUrl: string; imageUrl: string; title: string; thumbnailUrl?: string }> = [];
  
  try {
    const searchUrl = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`;
    
    console.log(`Performing reverse image search for: ${imageUrl.substring(0, 50)}...`);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SerpAPI error: ${response.status} - ${errorText}`);
      return results;
    }
    
    const data = await response.json();
    
    // Get domain filters for this platform
    const domains = platformDomains[platformName] || [];
    
    // Process image results
    const imageResults = data.image_results || [];
    const inlineImages = data.inline_images || [];
    
    const allImages = [...imageResults, ...inlineImages];
    
    for (const image of allImages) {
      const sourceUrl = image.link || image.source || '';
      const imgUrl = image.original || image.thumbnail || image.src || '';
      
      // Filter by platform domain
      const matchesPlatform = domains.some(domain => 
        sourceUrl.toLowerCase().includes(domain) || 
        imgUrl.toLowerCase().includes(domain)
      );
      
      if (matchesPlatform && imgUrl) {
        results.push({
          sourceUrl: sourceUrl,
          imageUrl: imgUrl,
          title: image.title || image.snippet || `Image from ${platformName}`,
          thumbnailUrl: image.thumbnail
        });
      }
    }
    
    // Also check visually similar images
    const similarImages = data.visual_matches || [];
    for (const similar of similarImages) {
      const sourceUrl = similar.link || '';
      const imgUrl = similar.thumbnail || similar.image || '';
      
      const matchesPlatform = domains.some(domain => 
        sourceUrl.toLowerCase().includes(domain)
      );
      
      if (matchesPlatform && imgUrl) {
        results.push({
          sourceUrl: sourceUrl,
          imageUrl: imgUrl,
          title: similar.title || `Similar image on ${platformName}`,
          thumbnailUrl: similar.thumbnail
        });
      }
    }
    
    console.log(`Found ${results.length} results on ${platformName} domains`);
    
  } catch (error) {
    console.error('Reverse image search error:', error);
  }
  
  return results.slice(0, 5); // Limit to 5 results per platform per image
}

// Real deepfake analysis using OpenAI GPT-4 Vision
async function analyzeForDeepfake(
  imageUrl: string, 
  apiKey: string
): Promise<{
  isDeepfake: boolean;
  confidence: number;
  threatLevel: string;
  manipulationType: string;
  artifacts: string[];
  hasTemporalIssues: boolean;
  metadataSuspicious: boolean;
  rawAnalysis: string;
}> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert deepfake detection analyst. Analyze images for signs of AI manipulation, face swapping, or synthetic generation. Look for:
- Facial boundary inconsistencies
- Unnatural eye movements or reflections
- Inconsistent lighting on the face
- Blurred or distorted edges around faces
- Asymmetric facial features
- Unnatural skin texture
- Background inconsistencies
- Signs of AI generation (too perfect, uncanny valley effects)

Respond ONLY with valid JSON in this exact format:
{
  "isDeepfake": boolean,
  "confidence": number between 0 and 1,
  "manipulationType": "Face Swap" | "AI Generated" | "Facial Manipulation" | "Voice Synthesis Artifact" | "Full Body Replacement" | "None Detected",
  "artifacts": ["list", "of", "detected", "artifacts"],
  "reasoning": "brief explanation"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for deepfake or AI manipulation indicators. Be thorough but avoid false positives.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      return getDefaultAnalysis();
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    console.log('OpenAI analysis response:', content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from OpenAI response');
      return getDefaultAnalysis();
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Determine threat level based on confidence
    let threatLevel = 'low';
    if (analysis.confidence > 0.85) threatLevel = 'high';
    else if (analysis.confidence > 0.65) threatLevel = 'medium';

    return {
      isDeepfake: analysis.isDeepfake || false,
      confidence: analysis.confidence || 0,
      threatLevel,
      manipulationType: analysis.manipulationType || 'Unknown',
      artifacts: analysis.artifacts || [],
      hasTemporalIssues: analysis.artifacts?.some((a: string) => 
        a.toLowerCase().includes('temporal') || a.toLowerCase().includes('flicker')
      ) || false,
      metadataSuspicious: analysis.artifacts?.some((a: string) => 
        a.toLowerCase().includes('metadata') || a.toLowerCase().includes('exif')
      ) || false,
      rawAnalysis: analysis.reasoning || content
    };

  } catch (error) {
    console.error('Deepfake analysis error:', error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis() {
  return {
    isDeepfake: false,
    confidence: 0,
    threatLevel: 'low',
    manipulationType: 'Analysis Failed',
    artifacts: [],
    hasTemporalIssues: false,
    metadataSuspicious: false,
    rawAnalysis: 'Unable to analyze image'
  };
}
