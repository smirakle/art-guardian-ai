import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeepfakeAnalysis {
  isDeepfake: boolean;
  confidence: number;
  manipulation_type: string;
  temporal_inconsistency: boolean;
  facial_artifacts: string[];
  metadata_analysis: {
    creation_date: string | null;
    location_claimed: string | null;
    camera_model: string | null;
    editing_software: string[];
  };
  reverse_search_verification: {
    original_found: boolean;
    earliest_appearance: string | null;
    authentic_sources: string[];
    suspicious_edits: string[];
  };
}

serve(async (req) => {
  console.log('=== DEEPFAKE DETECTOR INVOKED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { imageUrl, imageData, artworkId, scanId, claimedLocation, claimedTime } = await req.json()

    if (!imageUrl && !imageData) {
      return new Response(
        JSON.stringify({ error: 'Either imageUrl or imageData is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const startTime = Date.now();
    const mediaSource = imageUrl || imageData;
    console.log('Starting comprehensive deepfake analysis...');

    // Run all real analyses in parallel
    const [deepfakeResult, metadataResult, originResult] = await Promise.all([
      performDeepfakeAnalysis(mediaSource),
      analyzeImageMetadataWithAI(mediaSource),
      verifyImageOriginWithSearch(mediaSource),
    ]);

    const finalAnalysis: DeepfakeAnalysis = {
      isDeepfake: deepfakeResult.isDeepfake || metadataResult.suspicious || originResult.inconsistent,
      confidence: Math.max(deepfakeResult.confidence, metadataResult.confidence, originResult.confidence),
      manipulation_type: determineManipulationType(deepfakeResult, metadataResult, originResult),
      temporal_inconsistency: false,
      facial_artifacts: deepfakeResult.artifacts,
      metadata_analysis: {
        creation_date: metadataResult.creation_date || null,
        location_claimed: claimedLocation || null,
        camera_model: metadataResult.camera_model || null,
        editing_software: metadataResult.editing_software || [],
      },
      reverse_search_verification: {
        original_found: originResult.original_found,
        earliest_appearance: originResult.earliest_appearance || null,
        authentic_sources: originResult.authentic_sources || [],
        suspicious_edits: originResult.suspicious_edits || [],
      }
    };

    // Store results if artworkId and scanId provided
    if (artworkId && scanId && finalAnalysis.isDeepfake) {
      await storeDeepfakeMatch(supabaseClient, {
        artwork_id: artworkId,
        scan_id: scanId,
        analysis: finalAnalysis,
        source_url: imageUrl,
        claimed_location: claimedLocation,
        claimed_time: claimedTime
      });
    }

    // Track usage
    const totalTime = Date.now() - startTime;
    await supabaseClient.from('production_metrics').insert({
      metric_type: 'api_usage',
      metric_name: 'deepfake_detection',
      metric_value: totalTime,
      metadata: { user_id: user.id, confidence: finalAnalysis.confidence, total_time_ms: totalTime }
    }).catch(err => console.error('Metrics logging failed:', err));

    console.log('Deepfake analysis completed:', { confidence: finalAnalysis.confidence, isDeepfake: finalAnalysis.isDeepfake });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: finalAnalysis,
        threat_level: finalAnalysis.confidence > 0.8 ? 'high' : finalAnalysis.confidence > 0.5 ? 'medium' : 'low',
        disclaimer: 'AI analysis is not 100% accurate. Results should be verified by experts for critical decisions.',
        performance: { total_time_ms: totalTime }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Deepfake detection error:', error);
    return new Response(
      JSON.stringify({ error: 'Deepfake detection failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function performDeepfakeAnalysis(imageSource: string) {
  console.log('[Deepfake Detector] Performing real AI deepfake detection...');
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('[Deepfake Detector] OpenAI API key NOT configured');
    return {
      isDeepfake: false,
      confidence: 0,
      artifacts: ['⚠️ Analysis unavailable: OPENAI_API_KEY not configured']
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image for deepfake or AI manipulation. Look for:
- Facial lighting inconsistencies
- Unnatural eye movements or blinking patterns  
- Facial boundary artifacts
- Skin texture anomalies
- Shadow/reflection mismatches
- Compression inconsistencies
- AI generation patterns (GAN/diffusion artifacts)

Respond ONLY with valid JSON:
{
  "isDeepfake": boolean,
  "confidence": number 0-1,
  "artifacts": ["specific artifact 1", "specific artifact 2"]
}`
            },
            { type: 'image_url', image_url: { url: imageSource } }
          ]
        }],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Deepfake Detector] OpenAI API ERROR:', response.status, errorText);
      return { isDeepfake: false, confidence: 0, artifacts: [`API error: ${response.status}`] };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isDeepfake: result.isDeepfake || false,
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        artifacts: result.artifacts || []
      };
    }
    
    return { isDeepfake: false, confidence: 0, artifacts: ['Failed to parse AI response'] };
    
  } catch (error) {
    console.error('[Deepfake Detector] OpenAI EXCEPTION:', error);
    return { isDeepfake: false, confidence: 0, artifacts: [`Exception: ${error.message}`] };
  }
}

async function analyzeImageMetadataWithAI(imageSource: string) {
  // Use OpenAI to analyze visual metadata clues (not EXIF — we can't extract that from a URL directly)
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return { suspicious: false, confidence: 0, creation_date: null, camera_model: null, editing_software: [] };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Examine this image for metadata/forensic clues about its authenticity. Assess:
1. Does it show signs of being edited by photo manipulation software?
2. Are there compression artifacts suggesting re-saving/compositing?
3. Does it appear to be a professional photo, phone photo, or AI-generated?

Respond ONLY with valid JSON:
{
  "suspicious": boolean,
  "confidence": number 0-1,
  "camera_model": "estimated device or null",
  "editing_software": ["any detected editing tools"],
  "analysis": "brief explanation"
}`
            },
            { type: 'image_url', image_url: { url: imageSource } }
          ]
        }],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) return { suspicious: false, confidence: 0, creation_date: null, camera_model: null, editing_software: [] };

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { suspicious: false, confidence: 0, creation_date: null, camera_model: null, editing_software: [] };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      suspicious: parsed.suspicious || false,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      creation_date: null,
      camera_model: parsed.camera_model || null,
      editing_software: parsed.editing_software || [],
    };
  } catch (error) {
    console.error('Metadata analysis error:', error);
    return { suspicious: false, confidence: 0, creation_date: null, camera_model: null, editing_software: [] };
  }
}

async function verifyImageOriginWithSearch(imageSource: string) {
  // Use TinEye or Google reverse image search to check origin
  const tineye_key = Deno.env.get('TINEYE_API_KEY');
  
  const result = {
    original_found: false,
    earliest_appearance: null as string | null,
    authentic_sources: [] as string[],
    suspicious_edits: [] as string[],
    inconsistent: false,
    confidence: 0,
  };

  // Try TinEye reverse image search
  if (tineye_key) {
    try {
      const tinyResponse = await fetch('https://api.tineye.com/rest/search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: tineye_key,
          url: imageSource,
        }),
      });

      if (tinyResponse.ok) {
        const tinyData = await tinyResponse.json();
        const matches = tinyData.results?.matches || [];
        
        if (matches.length > 0) {
          result.original_found = true;
          // Sort by crawl date to find earliest
          const sorted = matches.sort((a: any, b: any) => 
            new Date(a.crawl_date).getTime() - new Date(b.crawl_date).getTime()
          );
          result.earliest_appearance = sorted[0]?.crawl_date || null;
          result.authentic_sources = matches.slice(0, 5).map((m: any) => m.domain);
          
          // If found on many sites, may indicate widespread unauthorized use
          if (matches.length > 10) {
            result.inconsistent = true;
            result.confidence = 0.6;
            result.suspicious_edits.push(`Image found on ${matches.length} sites — possible widespread unauthorized distribution`);
          }
        }
      }
    } catch (error) {
      console.error('TinEye search error:', error);
    }
  }

  return result;
}

function determineManipulationType(deepfake: any, metadata: any, origin: any): string {
  if (deepfake.isDeepfake) {
    const artifacts = (deepfake.artifacts || []).join(' ').toLowerCase();
    if (artifacts.includes('face swap') || artifacts.includes('facial boundary')) return 'Face Swap Deepfake';
    if (artifacts.includes('gan') || artifacts.includes('generated') || artifacts.includes('diffusion')) return 'AI-Generated Content';
    if (artifacts.includes('lip') || artifacts.includes('expression')) return 'Expression Manipulation';
    return 'AI-Enhanced/Modified Content';
  }
  if (metadata.suspicious) {
    if ((metadata.editing_software || []).some((s: string) => /deep|face|gan/i.test(s))) return 'AI-Generated Face';
    return 'Digitally Edited Content';
  }
  if (origin.inconsistent) return 'Potentially Misattributed Content';
  return 'No Manipulation Detected';
}

async function storeDeepfakeMatch(supabaseClient: any, data: {
  artwork_id: string;
  scan_id: string;
  analysis: DeepfakeAnalysis;
  source_url: string;
  claimed_location?: string;
  claimed_time?: string;
}) {
  const matchData = {
    artwork_id: data.artwork_id,
    scan_id: data.scan_id,
    source_url: data.source_url,
    source_title: `Potential ${data.analysis.manipulation_type}`,
    source_domain: (() => { try { return new URL(data.source_url).hostname; } catch { return 'unknown'; }})(),
    match_confidence: data.analysis.confidence * 100,
    match_type: 'deepfake_manipulation',
    threat_level: data.analysis.confidence > 0.8 ? 'high' : 'medium',
    detected_at: new Date().toISOString(),
    description: `Detected ${data.analysis.manipulation_type}. Confidence: ${(data.analysis.confidence * 100).toFixed(1)}%`,
    context: JSON.stringify({
      deepfake_analysis: data.analysis,
      claimed_location: data.claimed_location,
      claimed_time: data.claimed_time,
    })
  };

  const { error } = await supabaseClient.from('copyright_matches').insert(matchData);
  if (error) console.error('Error storing deepfake match:', error);
}
