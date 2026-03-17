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
    const { filePath, fileName, artworkId } = await req.json();
    console.log('Starting deepfake scan for uploaded file:', fileName);

    // Get signed URL for the file
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('artwork')
      .createSignedUrl(filePath, 3600);

    if (urlError || !signedUrlData) {
      throw new Error('Failed to get signed URL for analysis');
    }

    const imageUrl = signedUrlData.signedUrl;
    console.log('Got signed URL, starting real AI analysis...');

    const analysisResults = await performRealDeepfakeAnalysis(imageUrl, fileName);
    console.log('Analysis completed:', analysisResults);

    // If deepfake detected, create a match record
    if (analysisResults.isDeepfake) {
      const { error: matchError } = await supabase
        .from('deepfake_matches')
        .insert({
          source_url: `storage://artwork/${filePath}`,
          source_domain: 'user-upload',
          source_title: `User Upload: ${fileName}`,
          image_url: `storage://artwork/${filePath}`,
          detection_confidence: analysisResults.confidence,
          manipulation_type: analysisResults.manipulationType,
          threat_level: analysisResults.threatLevel,
          facial_artifacts: analysisResults.artifacts,
          temporal_inconsistency: analysisResults.temporalInconsistency,
          metadata_suspicious: analysisResults.metadataSuspicious,
          scan_type: 'upload',
          source_type: 'surface',
          context: { artwork_id: artworkId, upload_scan: true, file_name: fileName }
        });

      if (matchError) console.error('Error inserting deepfake match:', matchError);
    }

    // Update monitoring stats
    await supabase.from('realtime_monitoring_stats').insert({
      sources_scanned: 1,
      deepfakes_detected: analysisResults.isDeepfake ? 1 : 0,
      surface_web_scans: 1,
      high_threat_count: analysisResults.threatLevel === 'high' ? 1 : 0,
      medium_threat_count: analysisResults.threatLevel === 'medium' ? 1 : 0,
      low_threat_count: analysisResults.threatLevel === 'low' ? 1 : 0,
      scan_type: 'upload'
    });

    return new Response(JSON.stringify({
      success: true,
      isDeepfake: analysisResults.isDeepfake,
      confidence: analysisResults.confidence,
      manipulationType: analysisResults.manipulationType,
      threatLevel: analysisResults.threatLevel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deepfake-scan-upload:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performRealDeepfakeAnalysis(imageUrl: string, fileName: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

  // Try OpenAI Vision first
  if (openaiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: `You are an expert deepfake detection analyst. Analyze images for signs of AI manipulation, face swapping, expression transfer, lip-sync artifacts, or full synthesis. Return ONLY a JSON object with these fields:
- isDeepfake (boolean)
- confidence (number 0-100)
- manipulationType (string: "none", "face_swap", "expression_transfer", "lip_sync", "full_synthesis")
- threatLevel (string: "low", "medium", "high")
- artifacts (array of strings describing detected artifacts)
- temporalInconsistency (boolean)
- metadataSuspicious (boolean)
- reasoning (string: brief explanation)`
          }, {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this uploaded image "${fileName}" for deepfake manipulation. Look for facial boundary artifacts, skin tone inconsistencies, lighting mismatches, compression artifacts, pixel-level anomalies, and unnatural features.` },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            isDeepfake: !!result.isDeepfake,
            confidence: typeof result.confidence === 'number' ? result.confidence : 10,
            manipulationType: result.manipulationType || 'none',
            threatLevel: result.threatLevel || 'low',
            artifacts: Array.isArray(result.artifacts) ? result.artifacts : [],
            temporalInconsistency: !!result.temporalInconsistency,
            metadataSuspicious: !!result.metadataSuspicious,
          };
        }
      }
    } catch (e) {
      console.error('OpenAI deepfake analysis error:', e);
    }
  }

  // Try Google Gemini as fallback
  if (googleKey) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Analyze this image for deepfake manipulation. Return ONLY JSON: {"isDeepfake": bool, "confidence": 0-100, "manipulationType": "none|face_swap|expression_transfer|lip_sync|full_synthesis", "threatLevel": "low|medium|high", "artifacts": ["list"], "temporalInconsistency": bool, "metadataSuspicious": bool}` },
              { inline_data: { mime_type: 'image/jpeg', data: '' } },
              { file_data: { mime_type: 'image/jpeg', file_uri: imageUrl } }
            ]
          }]
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            isDeepfake: !!result.isDeepfake,
            confidence: typeof result.confidence === 'number' ? result.confidence : 10,
            manipulationType: result.manipulationType || 'none',
            threatLevel: result.threatLevel || 'low',
            artifacts: Array.isArray(result.artifacts) ? result.artifacts : [],
            temporalInconsistency: !!result.temporalInconsistency,
            metadataSuspicious: !!result.metadataSuspicious,
          };
        }
      }
    } catch (e) {
      console.error('Gemini deepfake analysis error:', e);
    }
  }

  // No AI available - return inconclusive result
  console.warn('No AI API keys configured for deepfake analysis');
  return {
    isDeepfake: false,
    confidence: 0,
    manipulationType: 'none',
    threatLevel: 'low',
    artifacts: [],
    temporalInconsistency: false,
    metadataSuspicious: false,
  };
}
