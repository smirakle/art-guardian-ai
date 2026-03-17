import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeepfakeAnalysisRequest {
  imageUrl?: string;
  videoUrl?: string;
  analysisType: 'comprehensive' | 'real_time' | 'batch';
  detectManipulations: string[];
  confidenceThreshold: number;
  includeMetadataAnalysis: boolean;
  generateReport: boolean;
}

interface DeepfakeAnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  manipulation_type: string;
  analysis_methods: string[];
  facial_artifacts: string[];
  temporal_inconsistencies: string[];
  metadata_anomalies: string[];
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  technical_details: any;
  countermeasures: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: DeepfakeAnalysisRequest = await req.json();
    console.log(`Starting ${request.analysisType} deepfake analysis`);

    if (!request.imageUrl && !request.videoUrl) {
      throw new Error('Either imageUrl or videoUrl must be provided');
    }

    const mediaUrl = request.imageUrl || request.videoUrl!;
    const mediaType = request.imageUrl ? 'image' : 'video';

    // Run all AI analyses in parallel
    const [geminiResult, openaiResult] = await Promise.all([
      analyzeWithGemini(mediaUrl, mediaType),
      analyzeWithOpenAI(mediaUrl, mediaType),
    ]);

    const analyses = [geminiResult, openaiResult].filter(Boolean);

    if (analyses.length === 0) {
      throw new Error('No AI analysis could be performed. Check API key configuration.');
    }

    const analysisResult = combineAnalysisResults(analyses, mediaType);

    // Store analysis results
    await supabaseClient
      .from('ai_detection_results')
      .insert({
        user_id: (await supabaseClient.auth.getUser()).data.user?.id,
        detection_type: 'deepfake',
        ai_model_used: analyses.map(a => a.method).join(', '),
        confidence_score: analysisResult.confidence,
        threat_level: analysisResult.threat_level,
        status: analysisResult.isDeepfake ? 'detected' : 'clean',
        detection_metadata: {
          manipulation_type: analysisResult.manipulation_type,
          analysis_methods: analysisResult.analysis_methods,
          facial_artifacts: analysisResult.facial_artifacts,
          technical_details: analysisResult.technical_details,
          media_url: mediaUrl,
          media_type: mediaType,
        }
      }).catch(err => console.error('Failed to store result:', err));

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Advanced deepfake analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function analyzeWithGemini(mediaUrl: string, mediaType: string) {
  const googleApiKey = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');
  if (!googleApiKey) {
    console.log('Google AI API key not configured, skipping Gemini analysis');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Fetch the image and convert to base64
    const imageResponse = await fetch(mediaUrl);
    if (!imageResponse.ok) throw new Error(`Failed to fetch media: ${imageResponse.status}`);
    const buffer = await imageResponse.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `You are an expert forensic analyst specializing in deepfake and AI-generated media detection.

Analyze this ${mediaType} for signs of deepfake manipulation or AI generation. Examine:

1. FACIAL ANALYSIS: Asymmetry, unnatural expressions, misaligned features, eye/teeth artifacts
2. LIGHTING & SHADOWS: Inconsistent light sources, impossible shadows, reflection anomalies
3. TEXTURE ANALYSIS: Overly smooth skin, repetitive patterns, unnatural hair, skin boundary issues
4. EDGE ARTIFACTS: Blurring around face/hair boundaries, distortion, compositing seams
5. AI GENERATION PATTERNS: GAN artifacts, diffusion model traces, unusual color distributions
6. COMPRESSION FORENSICS: Double compression artifacts, inconsistent JPEG blocks

Respond ONLY with valid JSON (no markdown):
{
  "isDeepfake": boolean,
  "confidence": number between 0 and 1,
  "artifacts": ["specific artifact found 1", "specific artifact found 2"],
  "manipulation_type": "face_swap" | "ai_generated" | "expression_manipulation" | "none" | "uncertain",
  "detailed_analysis": "2-3 sentence explanation of findings",
  "countermeasures": ["recommended action 1", "recommended action 2"]
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse Gemini JSON response');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      method: 'Google Gemini 2.0 Flash',
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      isDeepfake: parsed.isDeepfake || false,
      artifacts: parsed.artifacts || [],
      details: parsed.detailed_analysis || '',
      manipulation_type: parsed.manipulation_type || 'unknown',
      countermeasures: parsed.countermeasures || []
    };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return null;
  }
}

async function analyzeWithOpenAI(mediaUrl: string, mediaType: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    console.log('OpenAI API key not configured, skipping OpenAI analysis');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${mediaType} for deepfake/AI manipulation signs. Look for facial inconsistencies, lighting anomalies, texture artifacts, edge artifacts, and AI generation patterns.

Respond ONLY with valid JSON:
{
  "isDeepfake": boolean,
  "confidence": number 0-1,
  "artifacts": ["artifact1", "artifact2"],
  "manipulation_type": "face_swap" | "ai_generated" | "expression_manipulation" | "none" | "uncertain",
  "analysis": "brief explanation",
  "recommendedActions": ["action1", "action2"]
}`
            },
            { type: 'image_url', image_url: { url: mediaUrl } }
          ]
        }],
        max_tokens: 800,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      method: 'OpenAI GPT-4o Vision',
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      isDeepfake: parsed.isDeepfake || false,
      artifacts: parsed.artifacts || [],
      details: parsed.analysis || '',
      manipulation_type: parsed.manipulation_type || 'unknown',
      countermeasures: parsed.recommendedActions || []
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return null;
  }
}

function combineAnalysisResults(analyses: any[], mediaType: string): DeepfakeAnalysisResult {
  // Weighted ensemble: average confidence, majority vote on isDeepfake
  const weights: Record<string, number> = {
    'Google Gemini 2.0 Flash': 0.5,
    'OpenAI GPT-4o Vision': 0.5,
  };

  let weightedConfidence = 0;
  let totalWeight = 0;
  let deepfakeVotes = 0;
  const allArtifacts: string[] = [];
  const methods: string[] = [];
  const countermeasures: string[] = [];
  let primaryManipulationType = 'unknown';

  for (const a of analyses) {
    const w = weights[a.method] || 0.5;
    weightedConfidence += a.confidence * w;
    totalWeight += w;
    if (a.isDeepfake) deepfakeVotes++;
    methods.push(a.method);
    allArtifacts.push(...(a.artifacts || []));
    countermeasures.push(...(a.countermeasures || []));
    if (a.manipulation_type && a.manipulation_type !== 'unknown' && a.manipulation_type !== 'none') {
      primaryManipulationType = a.manipulation_type;
    }
  }

  const finalConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
  const isDeepfake = deepfakeVotes > analyses.length / 2 || finalConfidence > 0.65;

  let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (finalConfidence > 0.9) threatLevel = 'critical';
  else if (finalConfidence > 0.75) threatLevel = 'high';
  else if (finalConfidence > 0.5) threatLevel = 'medium';

  return {
    isDeepfake,
    confidence: Math.round(finalConfidence * 100) / 100,
    manipulation_type: isDeepfake ? primaryManipulationType : 'none',
    analysis_methods: methods,
    facial_artifacts: [...new Set(allArtifacts.filter(a => /face|facial|eye|mouth|nose|skin/i.test(a)))],
    temporal_inconsistencies: [...new Set(allArtifacts.filter(a => /temporal|frame|flicker/i.test(a)))],
    metadata_anomalies: [...new Set(allArtifacts.filter(a => /metadata|exif|compress/i.test(a)))],
    threat_level: threatLevel,
    technical_details: {
      total_analyses: analyses.length,
      consensus_score: deepfakeVotes / analyses.length,
      weighted_confidence: finalConfidence,
      analysis_breakdown: analyses.map(a => ({
        method: a.method,
        confidence: a.confidence,
        result: a.isDeepfake ? 'deepfake' : 'authentic',
        details: a.details,
      }))
    },
    countermeasures: [...new Set(countermeasures)]
  };
}
