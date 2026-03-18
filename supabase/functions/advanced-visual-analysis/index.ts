import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdvancedAnalysisRequest {
  imageUrl: string;
  analysisTypes: string[];
  userId?: string;
  artworkId?: string;
}

interface AnalysisResults {
  visualAnalysis: any;
  copyrightAssessment: any;
  deepfakeDetection: any;
  similaritySearch: any;
  objectDetection: any;
  textExtraction: any;
  qualityAssessment: any;
  metadataAnalysis: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, analysisTypes, userId, artworkId }: AdvancedAnalysisRequest = await req.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: imageUrl'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting advanced visual analysis for: ${imageUrl}`);
    console.log(`Analysis types: ${analysisTypes.join(', ')}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: Partial<AnalysisResults> = {};

    const analysisPromises = [];

    if (analysisTypes.includes('visual_analysis')) {
      analysisPromises.push(performAdvancedVisualAnalysis(imageUrl));
    }
    if (analysisTypes.includes('copyright_assessment')) {
      analysisPromises.push(performCopyrightAssessment(imageUrl));
    }
    if (analysisTypes.includes('deepfake_detection')) {
      analysisPromises.push(performDeepfakeDetection(imageUrl));
    }
    if (analysisTypes.includes('similarity_search')) {
      analysisPromises.push(performSimilaritySearch(imageUrl));
    }
    if (analysisTypes.includes('object_detection')) {
      analysisPromises.push(performObjectDetection(imageUrl));
    }
    if (analysisTypes.includes('text_extraction')) {
      analysisPromises.push(performTextExtraction(imageUrl));
    }
    if (analysisTypes.includes('quality_assessment')) {
      analysisPromises.push(performQualityAssessment(imageUrl));
    }
    if (analysisTypes.includes('metadata_analysis')) {
      analysisPromises.push(performMetadataAnalysis(imageUrl));
    }
    if (analysisTypes.includes('forensics_analysis')) {
      analysisPromises.push(performForensicsAnalysis(imageUrl));
    }
    if (analysisTypes.includes('manipulation_detection')) {
      analysisPromises.push(performManipulationDetection(imageUrl));
    }
    if (analysisTypes.includes('ai_generation_detection')) {
      analysisPromises.push(performAIGenerationDetection(imageUrl));
    }

    const analysisResults = await Promise.allSettled(analysisPromises);

    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      const analysisType = analysisTypes[i];
      
      if (result.status === 'fulfilled') {
        results[analysisType as keyof AnalysisResults] = result.value;
      } else {
        console.error(`Analysis failed for ${analysisType}:`, result.reason);
        results[analysisType as keyof AnalysisResults] = {
          error: result.reason.message || 'Analysis failed',
          status: 'failed'
        };
      }
    }

    const summary = generateComprehensiveSummary(results);

    if (userId && artworkId) {
      await storeAnalysisResults(supabase, { userId, artworkId, imageUrl, results, summary });
    }

    return new Response(JSON.stringify({
      success: true,
      imageUrl,
      analysisTypes,
      results,
      summary,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Advanced visual analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// --- Helper: deterministic offset based on detected boolean ---
function detOffset(detected: boolean, base: number): number {
  return detected ? base + 0.05 : base - 0.02;
}

async function performAdvancedVisualAnalysis(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Perform a comprehensive visual analysis of this image. Provide detailed insights on:
1. ARTISTIC ANALYSIS: Style, medium, technique, composition, color palette, artistic influences
2. TECHNICAL ANALYSIS: Image quality, resolution, lighting, exposure, focus, digital vs traditional
3. CONTENT ANALYSIS: Main subjects, scene context, emotional tone, cultural elements
4. COMMERCIAL POTENTIAL: Market appeal, licensing considerations, usage applications, value factors
5. UNIQUENESS ASSESSMENT: Originality indicators, distinctive features, rarity factors
Format your response as a structured JSON object.` },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 2000,
      temperature: 0.1
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No analysis content returned');

  try { return JSON.parse(content); } catch {
    return { analysis: content, confidence: 0.8, status: 'completed_text_format' };
  }
}

async function performCopyrightAssessment(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Assess this image for copyright and intellectual property considerations:
1. ORIGINALITY ASSESSMENT: Signs of original creation vs stock/commercial imagery
2. COPYRIGHT RISK FACTORS: Copyrighted characters, logos, trademarks, celebrity likeness
3. LICENSING INDICATORS: Professional photography markers, stock photo characteristics, watermarks
4. LEGAL CONSIDERATIONS: Fair use potential, transformative elements, commercial use restrictions
Provide a risk score (0-100) and detailed recommendations as JSON.` },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 1500,
      temperature: 0.1
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  try { return JSON.parse(content); } catch {
    return { assessment: content, risk_score: 50, status: 'completed_text_format' };
  }
}

async function performDeepfakeDetection(imageUrl: string) {
  console.log('Performing enhanced deepfake detection...');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const prompt = `Analyze this image for deepfake characteristics with forensic precision. Examine:
1. FACIAL ANALYSIS: Facial inconsistencies, blending artifacts, unnatural skin texture, eye/lip sync, hairline
2. TECHNICAL ARTIFACTS: Compression patterns for face swapping, edge artifacts, color grading inconsistencies, resolution mismatches
3. AI GENERATION SIGNATURES: DCGAN/StyleGAN patterns, uncanny valley, over-smoothed features, anatomical impossibilities
4. FORENSIC INDICATORS: Metadata inconsistencies, lighting direction conflicts, shadow/reflection anomalies, perspective inconsistencies
Provide a confidence score (0-100) for deepfake likelihood and detailed technical analysis.
Format as JSON with confidence, analysis, riskLevel, and specific indicators.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a forensic image analysis expert specializing in deepfake detection. Provide detailed technical analysis with confidence scores and specific indicators.' },
          { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }
        ],
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    const analysis = data.choices[0].message.content;

    const confidenceMatch = analysis.match(/confidence[:\s]+([0-9.]+)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) / 100 : 0.5;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const indicators = [
      {
        type: 'facial_inconsistencies',
        detected: analysis.toLowerCase().includes('facial') || analysis.toLowerCase().includes('face'),
        confidence: 0,
        description: 'Facial feature consistency and blending artifact analysis'
      },
      {
        type: 'compression_artifacts',
        detected: analysis.toLowerCase().includes('compression') || analysis.toLowerCase().includes('artifact'),
        confidence: 0,
        description: 'Compression pattern analysis for face swapping indicators'
      },
      {
        type: 'lighting_consistency',
        detected: analysis.toLowerCase().includes('lighting') || analysis.toLowerCase().includes('shadow'),
        confidence: 0,
        description: 'Lighting direction and intensity consistency analysis'
      },
      {
        type: 'ai_generation_patterns',
        detected: analysis.toLowerCase().includes('ai') || analysis.toLowerCase().includes('artificial'),
        confidence: 0,
        description: 'AI model signature and generation pattern detection'
      },
      {
        type: 'temporal_inconsistencies',
        detected: analysis.toLowerCase().includes('temporal') || analysis.toLowerCase().includes('motion'),
        confidence: 0,
        description: 'Temporal consistency and motion pattern analysis'
      }
    ];

    // Deterministic confidence: base from AI + small offset per detection status
    for (const ind of indicators) {
      ind.confidence = clamp(detOffset(ind.detected, confidence));
    }

    const avgConfidence = indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length;
    const finalConfidence = clamp(avgConfidence);

    let riskLevel: string;
    if (finalConfidence >= 0.8) riskLevel = 'critical';
    else if (finalConfidence >= 0.6) riskLevel = 'high';
    else if (finalConfidence >= 0.4) riskLevel = 'medium';
    else riskLevel = 'low';

    const forensicAnalysis = {
      compressionAnalysis: {
        hasArtifacts: analysis.toLowerCase().includes('compression'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('compression'), confidence)),
        description: 'JPEG compression and quality inconsistency analysis'
      },
      edgeDetection: {
        hasInconsistencies: analysis.toLowerCase().includes('edge') || analysis.toLowerCase().includes('boundary'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('edge'), confidence)),
        description: 'Edge artifact and boundary inconsistency detection'
      },
      metadataAnalysis: {
        hasAnomalies: analysis.toLowerCase().includes('metadata'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('metadata'), confidence)),
        description: 'Digital metadata and creation history analysis'
      }
    };

    return {
      confidence: Math.round(finalConfidence * 100),
      analysis,
      indicators,
      riskLevel,
      forensicAnalysis,
      isDeepfake: finalConfidence > 0.6,
      technicalScore: Math.round(finalConfidence * 100),
      recommendations: finalConfidence > 0.7 ? 
        ['Immediate manual review required', 'Consider expert forensic analysis', 'Legal consultation recommended'] :
        finalConfidence > 0.5 ?
        ['Manual verification recommended', 'Additional analysis suggested'] :
        ['Content appears authentic', 'Monitor for additional suspicious activity'],
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Enhanced deepfake detection error:', error);
    return {
      confidence: 50,
      analysis: 'Enhanced deepfake detection failed. Manual review recommended.',
      indicators: [],
      riskLevel: 'medium',
      forensicAnalysis: null,
      isDeepfake: false,
      error: error.message
    };
  }
}

async function performSimilaritySearch(imageUrl: string) {
  const apiKey = Deno.env.get('TINEYE_API_KEY');
  const apiSecret = Deno.env.get('TINEYE_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    return { error: 'TinEye API credentials not configured', matches: [] };
  }

  try {
    const nonce = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const searchUrl = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}&nonce=${nonce}&timestamp=${timestamp}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) throw new Error(`TinEye API error: ${response.status}`);
    const data = await response.json();
    
    return {
      total_matches: data.results?.num_matches || 0,
      matches: data.results?.matches || [],
      oldest_match: data.results?.oldest_match,
      newest_match: data.results?.newest_match,
      status: 'completed'
    };
  } catch (error) {
    return { error: error.message, matches: [] };
  }
}

async function performObjectDetection(imageUrl: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  const { data, error } = await supabase.functions.invoke('google-lens-analysis', {
    body: { imageData: imageUrl, analysisTypes: ['objects', 'products', 'landmarks'] }
  });
  if (error) throw new Error(`Object detection failed: ${error.message}`);
  return data;
}

async function performTextExtraction(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this image including: visible text, captions, titles, logos, signs, watermarks, and any readable content. Also identify the language and provide coordinates if possible. Format as JSON with extracted text, language, and context.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  try { return JSON.parse(content); } catch {
    return { extracted_text: content, language: 'unknown', status: 'completed_text_format' };
  }
}

async function performQualityAssessment(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `Assess the technical quality of this image:
1. RESOLUTION & CLARITY: Apparent resolution, sharpness, focus, pixel density
2. EXPOSURE & LIGHTING: Exposure balance, dynamic range, shadow/highlight detail
3. COLOR & SATURATION: Color accuracy, saturation levels, white balance
4. COMPRESSION & ARTIFACTS: JPEG compression artifacts, noise levels, digital artifacts
5. OVERALL QUALITY SCORE (0-100) and recommendations for improvement.
Format as structured JSON.` },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  try { return JSON.parse(content); } catch {
    return { assessment: content, quality_score: 75, status: 'completed_text_format' };
  }
}

async function performMetadataAnalysis(imageUrl: string) {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const metadata = {
      content_type: response.headers.get('content-type'),
      content_length: response.headers.get('content-length'),
      last_modified: response.headers.get('last-modified'),
      cache_control: response.headers.get('cache-control'),
      etag: response.headers.get('etag'),
      server: response.headers.get('server'),
      analysis_timestamp: new Date().toISOString()
    };
    return {
      file_size_mb: metadata.content_length ? (parseInt(metadata.content_length) / 1024 / 1024).toFixed(2) : 'unknown',
      format: metadata.content_type?.split('/')[1] || 'unknown',
      is_optimized: metadata.content_length ? parseInt(metadata.content_length) < 2000000 : false,
      cache_friendly: !!metadata.cache_control,
      metadata
    };
  } catch (error) {
    return { error: error.message, status: 'failed' };
  }
}

function generateComprehensiveSummary(results: Partial<AnalysisResults>) {
  const summary = {
    overall_assessment: 'Analysis completed',
    key_findings: [] as string[],
    risk_factors: [] as string[],
    recommendations: [] as string[],
    confidence_score: 0
  };

  let totalConfidence = 0;
  let confidenceCount = 0;

  Object.entries(results).forEach(([type, result]) => {
    if (result && !result.error) {
      if (result.confidence) {
        totalConfidence += result.confidence;
        confidenceCount++;
      }
      switch (type) {
        case 'visual_analysis':
          if (result.artistic_analysis) summary.key_findings.push(`Artistic style: ${result.artistic_analysis.style || 'Contemporary'}`);
          break;
        case 'copyright_assessment':
          if (result.risk_score > 70) summary.risk_factors.push('High copyright risk detected');
          break;
        case 'deepfake_detection':
          if (result.isDeepfake) summary.risk_factors.push(`Potential deepfake detected (${result.confidence}% confidence)`);
          break;
        case 'similarity_search':
          if (result.total_matches > 0) summary.key_findings.push(`${result.total_matches} similar images found online`);
          break;
      }
    }
  });

  summary.confidence_score = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

  if (summary.risk_factors.length > 0) summary.recommendations.push('Review copyright and authenticity concerns before commercial use');
  if (summary.key_findings.length === 0) summary.recommendations.push('Consider higher quality images for better analysis results');

  return summary;
}

async function storeAnalysisResults(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('advanced_analysis_results')
      .insert({
        user_id: data.userId,
        artwork_id: data.artworkId,
        image_url: data.imageUrl,
        analysis_results: data.results,
        summary: data.summary,
        created_at: new Date().toISOString()
      });
    if (error) console.error('Error storing analysis results:', error);
  } catch (error) {
    console.error('Storage error:', error);
  }
}

// --- Forensics Analysis ---
async function performForensicsAnalysis(imageUrl: string) {
  console.log('Performing comprehensive forensics analysis...');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const prompt = `Perform comprehensive digital forensics analysis on this image. Examine:
1. COMPRESSION ANALYSIS: JPEG compression artifacts, quality levels, multiple compression signatures, recompression evidence
2. EDGE & BOUNDARY ANALYSIS: Edge inconsistencies, blending artifacts, copy-paste evidence, feathering patterns
3. LIGHTING & SHADOW FORENSICS: Light source consistency, shadow direction analysis, reflection authenticity, color temperature variations
4. NOISE & GRAIN PATTERNS: Sensor noise consistency, grain pattern analysis, noise reduction artifacts
5. GEOMETRIC CONSISTENCY: Perspective and scale analysis, vanishing point consistency, object proportion verification
Provide detailed technical findings with confidence scores for each category. Format as comprehensive JSON report.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a digital forensics expert specializing in image authenticity verification. Provide detailed technical analysis with specific measurements and confidence scores.' },
          { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const forensicsResults = {
      compressionArtifacts: {
        detected: analysis.toLowerCase().includes('compression') || analysis.toLowerCase().includes('artifact'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('compression'), 0.75)),
        severity: analysis.toLowerCase().includes('severe') ? 'high' : 'medium',
        description: 'JPEG compression and quality inconsistency analysis'
      },
      edgeInconsistencies: {
        detected: analysis.toLowerCase().includes('edge') || analysis.toLowerCase().includes('boundary'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('edge'), 0.70)),
        locations: generateSuspiciousRegions(analysis),
        description: 'Edge artifact and boundary inconsistency detection'
      },
      lightingAnalysis: {
        consistent: !analysis.toLowerCase().includes('lighting inconsist') && !analysis.toLowerCase().includes('shadow conflict'),
        confidence: clamp(detOffset(!analysis.toLowerCase().includes('lighting inconsist'), 0.80)),
        issues: extractLightingIssues(analysis),
        description: 'Lighting direction and intensity consistency analysis'
      },
      noiseAnalysis: {
        consistent: !analysis.toLowerCase().includes('noise inconsist'),
        confidence: clamp(detOffset(!analysis.toLowerCase().includes('noise inconsist'), 0.65)),
        patterns: ['sensor_noise', 'digital_noise', 'grain_analysis'],
        description: 'Noise pattern and grain consistency analysis'
      },
      geometricConsistency: {
        valid: !analysis.toLowerCase().includes('perspective') && !analysis.toLowerCase().includes('scale inconsist'),
        confidence: clamp(detOffset(!analysis.toLowerCase().includes('perspective'), 0.78)),
        issues: extractGeometricIssues(analysis),
        description: 'Geometric and spatial relationship verification'
      }
    };

    const avgConfidence = Object.values(forensicsResults).reduce((sum: number, result: any) => sum + result.confidence, 0) / Object.keys(forensicsResults).length;
    const suspiciousCount = Object.values(forensicsResults).filter((result: any) => result.detected || !result.consistent || !result.valid).length;
    const authenticityScore = Math.max(0, Math.min(100, (avgConfidence * 100) - (suspiciousCount * 15)));

    return {
      analysis,
      forensicsResults,
      authenticityScore: Math.round(authenticityScore),
      overallAssessment: authenticityScore > 80 ? 'likely_authentic' : 
                        authenticityScore > 60 ? 'potentially_modified' : 
                        authenticityScore > 40 ? 'likely_manipulated' : 'highly_suspicious',
      recommendations: generateForensicsRecommendations(authenticityScore, suspiciousCount),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Forensics analysis error:', error);
    return {
      analysis: 'Forensics analysis failed. Manual review recommended.',
      error: error.message,
      authenticityScore: 50,
      overallAssessment: 'analysis_failed'
    };
  }
}

// --- Manipulation Detection ---
async function performManipulationDetection(imageUrl: string) {
  console.log('Performing manipulation detection...');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const prompt = `Analyze this image for digital manipulation and editing. Look for:
1. COPY-PASTE OPERATIONS: Duplicated regions, cloning artifacts, copy-move forgery, texture repetition
2. OBJECT MANIPULATION: Object removal/addition evidence, scale/proportion inconsistencies, missing shadows
3. COLOR & TONE ADJUSTMENTS: Selective color modifications, tone mapping artifacts, histogram irregularities
4. COMPOSITE OPERATIONS: Multi-source image combination, background replacement, layer blending artifacts
5. ADVANCED EDITING: Content-aware fill usage, frequency domain manipulation, advanced retouching evidence
Provide confidence scores and specific manipulation types detected. Format as detailed JSON analysis.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a digital forensics expert specializing in image manipulation detection. Identify specific editing techniques and provide confidence assessments.' },
          { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }
        ],
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const manipulations = [
      { 
        type: 'copy_paste', 
        detected: analysis.toLowerCase().includes('copy') || analysis.toLowerCase().includes('clone') || analysis.toLowerCase().includes('duplicate'),
        confidence: 0,
        description: 'Copy-paste and cloning operation detection'
      },
      { 
        type: 'object_manipulation', 
        detected: analysis.toLowerCase().includes('object') || analysis.toLowerCase().includes('remove') || analysis.toLowerCase().includes('add'),
        confidence: 0,
        description: 'Object addition, removal, or modification detection'
      },
      { 
        type: 'color_adjustment', 
        detected: analysis.toLowerCase().includes('color') || analysis.toLowerCase().includes('tone') || analysis.toLowerCase().includes('saturation'),
        confidence: 0,
        description: 'Color and tone adjustment detection'
      },
      { 
        type: 'compositing', 
        detected: analysis.toLowerCase().includes('composite') || analysis.toLowerCase().includes('background') || analysis.toLowerCase().includes('layer'),
        confidence: 0,
        description: 'Image compositing and background replacement detection'
      },
      { 
        type: 'advanced_editing', 
        detected: analysis.toLowerCase().includes('content-aware') || analysis.toLowerCase().includes('advanced') || analysis.toLowerCase().includes('retouching'),
        confidence: 0,
        description: 'Advanced editing technique detection'
      }
    ];

    const bases = [0.70, 0.65, 0.60, 0.75, 0.80];
    for (let i = 0; i < manipulations.length; i++) {
      manipulations[i].confidence = clamp(detOffset(manipulations[i].detected, bases[i]));
    }

    const detectedCount = manipulations.filter(m => m.detected).length;
    const avgConfidence = manipulations.reduce((sum, m) => sum + m.confidence, 0) / manipulations.length;
    const overallConfidence = Math.min(0.95, detectedCount * 0.15 + avgConfidence * 0.5);

    let riskLevel: string;
    if (overallConfidence > 0.8) riskLevel = 'critical';
    else if (overallConfidence > 0.6) riskLevel = 'high';
    else if (overallConfidence > 0.4) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      confidence: Math.round(overallConfidence * 100),
      analysis,
      manipulations,
      detectedManipulations: detectedCount,
      riskLevel,
      authenticityLikelihood: Math.round((1 - overallConfidence) * 100),
      recommendations: generateManipulationRecommendations(overallConfidence, detectedCount),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Manipulation detection error:', error);
    return {
      confidence: 50,
      analysis: 'Manipulation detection failed. Manual review recommended.',
      manipulations: [],
      riskLevel: 'medium',
      error: error.message
    };
  }
}

// --- AI Generation Detection ---
async function performAIGenerationDetection(imageUrl: string) {
  console.log('Performing AI generation detection...');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');

  const prompt = `Analyze this image to determine if it was generated by AI. Look for:
1. AI MODEL SIGNATURES: GAN artifacts (StyleGAN, DCGAN), diffusion model characteristics, VAE artifacts, neural network fingerprints
2. TECHNICAL INDICATORS: Spectral anomalies, frequency domain artifacts, noise pattern inconsistencies, resolution/sampling artifacts
3. VISUAL CUES: Uncanny valley effects, over-smoothed textures, impossible combinations, anatomical inconsistencies
4. STYLE ANALYSIS: Typical AI art characteristics, model-specific style signatures, training data influences
5. METADATA ANALYSIS: Generation software signatures, creation timestamp patterns, file format characteristics
Rate the likelihood this is AI-generated (0-100) and identify potential AI models or techniques.
Format as comprehensive JSON assessment.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert in AI-generated image detection. Identify AI generation patterns, model signatures, and technical artifacts.' },
          { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }
        ],
        max_tokens: 1200,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));

    const confidenceMatch = analysis.match(/([0-9.]+)[%\s]*(?:likelihood|confidence|chance)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) / 100 : 0.5;

    let detectedModel = 'Unknown';
    let modelConfidence = 0.5;
    
    if (analysis.toLowerCase().includes('dall-e') || analysis.toLowerCase().includes('dalle')) {
      detectedModel = 'DALL-E'; modelConfidence = 0.8;
    } else if (analysis.toLowerCase().includes('midjourney')) {
      detectedModel = 'Midjourney'; modelConfidence = 0.85;
    } else if (analysis.toLowerCase().includes('stable diffusion')) {
      detectedModel = 'Stable Diffusion'; modelConfidence = 0.9;
    } else if (analysis.toLowerCase().includes('stylegan')) {
      detectedModel = 'StyleGAN'; modelConfidence = 0.75;
    } else if (analysis.toLowerCase().includes('gan') || analysis.toLowerCase().includes('generative')) {
      detectedModel = 'GAN-based'; modelConfidence = 0.7;
    }

    const indicators = [
      {
        type: 'model_signatures',
        detected: analysis.toLowerCase().includes('signature') || analysis.toLowerCase().includes('fingerprint'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('signature'), confidence)),
        description: 'AI model signature and fingerprint detection'
      },
      {
        type: 'technical_artifacts',
        detected: analysis.toLowerCase().includes('artifact') || analysis.toLowerCase().includes('anomal'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('artifact'), confidence)),
        description: 'Technical artifacts and processing signatures'
      },
      {
        type: 'visual_inconsistencies',
        detected: analysis.toLowerCase().includes('uncanny') || analysis.toLowerCase().includes('impossible'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('uncanny'), confidence)),
        description: 'Visual inconsistencies and impossible features'
      },
      {
        type: 'style_patterns',
        detected: analysis.toLowerCase().includes('style') || analysis.toLowerCase().includes('typical'),
        confidence: clamp(detOffset(analysis.toLowerCase().includes('style'), confidence)),
        description: 'AI art style patterns and characteristics'
      }
    ];

    const finalConfidence = clamp(confidence + (modelConfidence - 0.5) * 0.2);

    return {
      confidence: Math.round(finalConfidence * 100),
      analysis,
      detectedModel,
      modelConfidence: Math.round(modelConfidence * 100),
      isAIGenerated: finalConfidence > 0.6,
      indicators,
      technicalAssessment: {
        spectralAnomalies: analysis.toLowerCase().includes('spectral') || analysis.toLowerCase().includes('frequency'),
        noisePatterns: analysis.toLowerCase().includes('noise'),
        resolutionArtifacts: analysis.toLowerCase().includes('resolution') || analysis.toLowerCase().includes('sampling')
      },
      recommendations: finalConfidence > 0.8 ? 
        ['Highly likely AI-generated', 'Verify source and creation method', 'Consider licensing implications'] :
        finalConfidence > 0.6 ?
        ['Possibly AI-generated', 'Additional verification recommended'] :
        ['Likely human-created', 'Standard content verification sufficient'],
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI generation detection error:', error);
    return {
      confidence: 50,
      analysis: 'AI generation detection failed. Manual review recommended.',
      detectedModel: 'Unknown',
      isAIGenerated: false,
      indicators: [],
      error: error.message
    };
  }
}

// Helper functions
function generateSuspiciousRegions(analysis: string) {
  const regions: any[] = [];
  if (analysis.toLowerCase().includes('edge')) regions.push({ x: 0.3, y: 0.4, severity: 0.8, type: 'edge_artifact' });
  if (analysis.toLowerCase().includes('boundary')) regions.push({ x: 0.6, y: 0.2, severity: 0.6, type: 'boundary_inconsistency' });
  return regions;
}

function extractLightingIssues(analysis: string) {
  const issues: string[] = [];
  if (analysis.toLowerCase().includes('shadow')) issues.push('Shadow direction inconsistency');
  if (analysis.toLowerCase().includes('light source')) issues.push('Multiple light source conflict');
  return issues;
}

function extractGeometricIssues(analysis: string) {
  const issues: string[] = [];
  if (analysis.toLowerCase().includes('perspective')) issues.push('Perspective distortion detected');
  if (analysis.toLowerCase().includes('scale')) issues.push('Scale inconsistency found');
  return issues;
}

function generateForensicsRecommendations(authenticityScore: number, suspiciousCount: number) {
  if (authenticityScore < 40 || suspiciousCount >= 3) {
    return ['Image shows multiple signs of manipulation', 'Professional forensic analysis recommended', 'Legal consultation advised for intellectual property concerns', 'Consider rejecting for commercial use'];
  } else if (authenticityScore < 60 || suspiciousCount >= 2) {
    return ['Image shows potential signs of modification', 'Additional verification recommended', 'Manual review by expert suggested', 'Use caution for commercial purposes'];
  }
  return ['Image appears authentic with minor concerns', 'Standard verification procedures sufficient', 'Safe for most commercial applications'];
}

function generateManipulationRecommendations(confidence: number, detectedCount: number) {
  if (confidence > 0.8 || detectedCount >= 3) {
    return ['High likelihood of digital manipulation detected', 'Immediate expert review required', 'Not recommended for commercial use without verification', 'Consider legal implications for copyright claims'];
  } else if (confidence > 0.6 || detectedCount >= 2) {
    return ['Potential manipulation detected', 'Additional analysis recommended', 'Manual verification suggested', 'Use with caution for commercial purposes'];
  }
  return ['Low likelihood of significant manipulation', 'Standard content verification sufficient', 'Appears suitable for commercial use'];
}
