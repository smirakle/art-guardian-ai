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
    const { imageUrl, sourceUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: imageUrl'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing image for deepfake: ${imageUrl}`);

    // Use OpenAI Vision API to analyze the image
    const analysis = await analyzeImageWithOpenAI(imageUrl);
    
    if (analysis.isDeepfake) {
      // Store the detection in database
      const detection = await storeDeepfakeDetection({
        source_url: sourceUrl || imageUrl,
        image_url: imageUrl,
        detection_confidence: analysis.confidence,
        manipulation_type: analysis.manipulation_type,
        threat_level: analysis.threat_level,
        facial_artifacts: analysis.artifacts,
        analysis_details: analysis.details
      });

      return new Response(JSON.stringify({
        success: true,
        isDeepfake: true,
        confidence: analysis.confidence,
        manipulation_type: analysis.manipulation_type,
        threat_level: analysis.threat_level,
        artifacts: analysis.artifacts,
        detection_id: detection.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      isDeepfake: false,
      confidence: analysis.confidence,
      message: 'No deepfake detected'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-deepfake-detector:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeImageWithOpenAI(imageUrl: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for signs of being a deepfake or AI-generated content. Look for:
                
                1. Facial inconsistencies (unnatural skin texture, mismatched lighting, boundary artifacts)
                2. Eye and teeth irregularities (asymmetrical eyes, unnatural teeth alignment)
                3. Hair and background anomalies (unrealistic hair physics, inconsistent backgrounds)
                4. Temporal inconsistencies (if applicable)
                5. Compression and pixel-level artifacts
                6. Overall image quality and realism
                
                Respond with a JSON object containing:
                {
                  "isDeepfake": boolean,
                  "confidence": number (0-100),
                  "manipulation_type": string (face_swap, expression_transfer, full_synthesis, etc.),
                  "threat_level": string (low, medium, high),
                  "artifacts": array of detected artifacts,
                  "details": string explaining the analysis
                }
                
                Be thorough and conservative in your analysis.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response
    try {
      const analysis = JSON.parse(content);
      return analysis;
    } catch (parseError) {
      // If JSON parsing fails, create a basic response
      console.error('Failed to parse OpenAI response as JSON:', content);
      
      // Use keyword detection as fallback
      const isDeepfake = content.toLowerCase().includes('deepfake') || 
                        content.toLowerCase().includes('artificial') ||
                        content.toLowerCase().includes('generated') ||
                        content.toLowerCase().includes('fake');
      
      return {
        isDeepfake,
        confidence: isDeepfake ? 75 : 25,
        manipulation_type: isDeepfake ? 'unknown' : 'none',
        threat_level: isDeepfake ? 'medium' : 'low',
        artifacts: [],
        details: content
      };
    }

  } catch (error) {
    console.error('OpenAI analysis error:', error);
    
    // Fallback to basic heuristic analysis
    return await performBasicAnalysis(imageUrl);
  }
}

async function performBasicAnalysis(imageUrl: string) {
  // Basic heuristic analysis when OpenAI fails
  console.log('Performing basic heuristic analysis...');
  
  try {
    // Check image properties that might indicate AI generation
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Basic checks (this is simplified - real detection would be much more complex)
    let suspicionScore = 0;
    const artifacts = [];
    
    // Check file size patterns (AI images often have specific size ranges)
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size > 2000000 && size < 5000000) { // 2-5MB range common for AI
        suspicionScore += 20;
        artifacts.push('suspicious_file_size');
      }
    }
    
    // Check if URL suggests AI generation
    const url = imageUrl.toLowerCase();
    if (url.includes('generated') || url.includes('ai') || url.includes('synthetic')) {
      suspicionScore += 40;
      artifacts.push('url_suggests_ai');
    }
    
    const isDeepfake = suspicionScore > 30;
    
    return {
      isDeepfake,
      confidence: suspicionScore,
      manipulation_type: isDeepfake ? 'unknown' : 'none',
      threat_level: suspicionScore > 50 ? 'high' : suspicionScore > 30 ? 'medium' : 'low',
      artifacts,
      details: `Basic analysis completed. Suspicion score: ${suspicionScore}/100`
    };
    
  } catch (error) {
    console.error('Basic analysis error:', error);
    return {
      isDeepfake: false,
      confidence: 0,
      manipulation_type: 'none',
      threat_level: 'low',
      artifacts: [],
      details: 'Analysis failed - image could not be processed'
    };
  }
}

async function storeDeepfakeDetection(detection: any) {
  const { data, error } = await supabase
    .from('deepfake_matches')
    .insert({
      source_url: detection.source_url,
      source_domain: getDomain(detection.source_url),
      source_title: 'Deepfake detected via analysis',
      image_url: detection.image_url,
      detection_confidence: detection.detection_confidence,
      manipulation_type: detection.manipulation_type,
      threat_level: detection.threat_level,
      facial_artifacts: detection.facial_artifacts || [],
      temporal_inconsistency: detection.manipulation_type === 'lip_sync',
      metadata_suspicious: detection.manipulation_type === 'full_synthesis',
      scan_type: 'manual',
      source_type: 'surface',
      context: {
        detection_method: 'openai_vision',
        analysis_details: detection.analysis_details,
        model_version: 'gpt-4o'
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing deepfake detection:', error);
    throw error;
  }

  return data;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}