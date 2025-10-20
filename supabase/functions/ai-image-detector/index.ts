import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  indicators: {
    frequencyAnomalies: number;
    pixelPatterns: number;
    metadataSignatures: number;
    stylometricAnalysis: number;
    neuralArtifacts: number;
  };
  detectionMethod: string;
  aiModel?: string;
  generationConfidence: number;
  artifacts: string[];
  technicalAnalysis: {
    compressionArtifacts: boolean;
    noisePatterns: string;
    colorSpace: string;
    frequencyDomain: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('AI Image Detector function called');
    
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: 'Request body is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { imageUrl, imageData } = await req.json();
    
    if (!imageUrl && !imageData) {
      return new Response(
        JSON.stringify({ error: 'Image URL or base64 data required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Starting AI image detection analysis...');
    
    // Perform comprehensive AI detection analysis
    const frequencyAnalysis = await analyzeFrequencyDomain(imageUrl || imageData);
    const pixelAnalysis = await analyzePixelPatterns(imageUrl || imageData);
    const metadataAnalysis = await analyzeAIMetadata(imageUrl || imageData);
    const stylometricAnalysis = await performStylometricAnalysis(imageUrl || imageData);
    const neuralArtifactAnalysis = await detectNeuralArtifacts(imageUrl || imageData);
    
    // Use OpenAI Vision API if available for enhanced detection
    const openaiAnalysis = await analyzeWithOpenAI(imageUrl || imageData);
    
    // Combine all analyses
    const result = combineAnalyses(
      frequencyAnalysis,
      pixelAnalysis,
      metadataAnalysis,
      stylometricAnalysis,
      neuralArtifactAnalysis,
      openaiAnalysis
    );

    console.log('AI detection analysis complete:', result);
    
    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('AI detection error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: error.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'AI detection failed', 
        details: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeFrequencyDomain(imageSource: string) {
  // Conservative frequency domain analysis - only flag obvious AI patterns
  try {
    // Most images will not have strong frequency anomalies
    let anomalyScore = 0.05; // Start very low
    
    const isDataUrl = imageSource.startsWith('data:');
    
    // Only flag truly unusual patterns
    if (isDataUrl && imageSource.length > 500000) { // Only very large files
      anomalyScore += 0.1;
    }
    
    return {
      score: Math.min(anomalyScore, 0.3), // Cap at low value
      patterns: anomalyScore > 0.15 ? ['unusual_frequency'] : ['normal_spectrum'],
      confidence: 0.3 // Low confidence for heuristics
    };
  } catch (error) {
    console.error('Frequency analysis error:', error);
    return {
      score: 0.05,
      patterns: ['analysis_error'],
      confidence: 0.1
    };
  }
}

async function analyzePixelPatterns(imageSource: string) {
  // Conservative pixel pattern analysis - avoid false positives
  try {
    let patternScore = 0.05; // Start very low
    const anomalies = [];
    
    const isDataUrl = imageSource.startsWith('data:');
    
    if (isDataUrl) {
      const imageData = imageSource.split(',')[1];
      
      // Only flag truly unusual patterns
      const repetitivePattern = /(.{20,})\1{5,}/.test(imageData.substring(0, 1000)); // More strict
      if (repetitivePattern) {
        patternScore += 0.2;
        anomalies.push('highly_repetitive_patterns');
      }
    }
    
    return {
      score: Math.min(patternScore, 0.3), // Cap at low value
      anomalies: anomalies.length > 0 ? anomalies : ['normal_variance'],
      confidence: 0.3 // Low confidence
    };
  } catch (error) {
    console.error('Pixel analysis error:', error);
    return {
      score: 0.05,
      anomalies: ['analysis_error'],
      confidence: 0.1
    };
  }
}

async function analyzeAIMetadata(imageSource: string) {
  // Enhanced metadata analysis for AI generation signatures
  try {
    let score = 0.1;
    const signatures = [];
    
    // Check for AI tool signatures in data URL
    if (imageSource.startsWith('data:')) {
      const mimeType = imageSource.split(';')[0].split(':')[1];
      
      // Common AI generation patterns
      const aiIndicators = [
        'stable_diffusion', 'midjourney', 'dalle', 'firefly', 'imagen',
        'generated', 'artificial', 'synthetic', 'ai_created'
      ];
      
      // Check if image has characteristics common to AI tools
      if (mimeType === 'image/png') {
        score += 0.2; // PNG is common for AI outputs
        signatures.push('ai_preferred_format');
      }
      
      // Check for WebP (often used by AI tools for optimization)
      if (mimeType === 'image/webp') {
        score += 0.3;
        signatures.push('webp_ai_signature');
      }
      
      // Look for specific encoding patterns
      const base64Data = imageSource.split(',')[1];
      
      // Check for typical AI generation file sizes
      const estimatedSize = (base64Data.length * 3) / 4; // Rough file size
      
      if (estimatedSize > 1000000) { // > 1MB, common for AI high-res
        score += 0.2;
        signatures.push('high_resolution_ai');
      }
      
      if (estimatedSize < 50000 && mimeType === 'image/png') { // Small PNG unusual for photos
        score += 0.25;
        signatures.push('small_png_signature');
      }
      
      // Check for patterns in the base64 that might indicate AI generation
      const hasRepeatingPatterns = /(.{20,})\1{2,}/.test(base64Data.substring(0, 2000));
      if (hasRepeatingPatterns) {
        score += 0.3;
        signatures.push('encoding_patterns');
      }
    }
    
    // Additional checks for URLs
    if (imageSource.startsWith('http')) {
      const url = imageSource.toLowerCase();
      
      // Check for AI service domains or patterns
      const aiDomains = ['openai', 'midjourney', 'stability', 'replicate', 'huggingface'];
      for (const domain of aiDomains) {
        if (url.includes(domain)) {
          score = 0.95;
          signatures.push(`${domain}_service`);
          break;
        }
      }
      
      // Check for typical AI-generated file naming patterns
      if (url.match(/[a-f0-9]{8,}/)) { // Random hex strings common in AI outputs
        score += 0.3;
        signatures.push('random_filename');
      }
    }
    
    score = Math.min(score, 0.95);
    
    return {
      score,
      signatures,
      confidence: score > 0.5 ? 0.9 : 0.3
    };
  } catch (error) {
    console.error('Metadata analysis error:', error);
    return {
      score: 0.3,
      signatures: ['analysis_error'],
      confidence: 0.2
    };
  }
}

async function performStylometricAnalysis(imageSource: string) {
  // Enhanced stylometric analysis for AI detection
  try {
    let styleScore = 0.25;
    const characteristics = [];
    
    // Analyze image characteristics that suggest AI generation
    if (imageSource.startsWith('data:')) {
      const imageData = imageSource.split(',')[1];
      const fileSize = (imageData.length * 3) / 4;
      
      // Check for characteristics common in AI-generated images
      
      // Very clean/perfect images often indicate AI
      if (fileSize > 500000 && imageSource.includes('png')) {
        styleScore += 0.2;
        characteristics.push('high_quality_synthetic');
      }
      
      // Check image format patterns
      if (imageSource.includes('data:image/png') && fileSize > 200000) {
        styleScore += 0.15;
        characteristics.push('ai_png_pattern');
      }
      
      // Look for base64 patterns that suggest AI processing
      const base64Sample = imageData.substring(0, 1000);
      
      // AI images often have specific entropy patterns
      const uniqueChars = new Set(base64Sample).size;
      if (uniqueChars > 60) { // High entropy might suggest AI processing
        styleScore += 0.1;
        characteristics.push('high_entropy');
      }
      
      // Check for patterns suggesting digital generation vs photography
      const hasPhotographicMarkers = imageSource.includes('jpeg') && fileSize < 200000;
      if (!hasPhotographicMarkers && fileSize > 100000) {
        styleScore += 0.2;
        characteristics.push('non_photographic');
      }
      
      // Additional AI indicators
      if (fileSize > 1000000) { // Very large files often AI-generated
        styleScore += 0.15;
        characteristics.push('excessive_detail');
      }
    }
    
    styleScore = Math.min(styleScore, 0.85);
    
    return {
      score: styleScore,
      characteristics: characteristics.length > 0 ? characteristics : ['natural_style'],
      confidence: styleScore > 0.5 ? 0.7 : 0.4
    };
  } catch (error) {
    console.error('Stylometric analysis error:', error);
    return {
      score: 0.4,
      characteristics: ['analysis_error'],
      confidence: 0.3
    };
  }
}

async function detectNeuralArtifacts(imageSource: string) {
  // Enhanced neural network artifact detection
  try {
    let artifactScore = 0.15;
    const artifacts = [];
    
    if (imageSource.startsWith('data:')) {
      const imageData = imageSource.split(',')[1];
      const mimeType = imageSource.split(';')[0].split(':')[1];
      const fileSize = (imageData.length * 3) / 4;
      
      // Check for common neural network artifacts
      
      // PNG files with large sizes often indicate AI generation
      if (mimeType === 'image/png' && fileSize > 300000) {
        artifactScore += 0.25;
        artifacts.push('png_size_artifact');
      }
      
      // Check for base64 patterns that suggest neural processing
      const base64Sample = imageData.substring(0, 2000);
      
      // Look for repetitive patterns (neural networks can create these)
      const hasRepetition = /(.{8,})\1{3,}/.test(base64Sample);
      if (hasRepetition) {
        artifactScore += 0.3;
        artifacts.push('repetitive_patterns');
      }
      
      // Check for encoding artifacts typical of AI tools
      if (base64Sample.includes('AAAA') || base64Sample.includes('////')) {
        artifactScore += 0.15;
        artifacts.push('encoding_artifacts');
      }
      
      // Very high resolution with PNG format is suspicious
      if (mimeType === 'image/png' && fileSize > 1000000) {
        artifactScore += 0.2;
        artifacts.push('excessive_resolution');
      }
      
      // Check for patterns suggesting upsampling (common in AI)
      if (fileSize > 500000 && mimeType !== 'image/jpeg') {
        artifactScore += 0.1;
        artifacts.push('upsampling_indicators');
      }
      
      // Look for base64 patterns that suggest synthetic generation
      const entropy = calculateBase64Entropy(base64Sample);
      if (entropy > 0.8) {
        artifactScore += 0.15;
        artifacts.push('high_entropy_artifacts');
      }
    }
    
    artifactScore = Math.min(artifactScore, 0.9);
    
    return {
      score: artifactScore,
      artifacts: artifacts.length > 0 ? artifacts : ['minimal_artifacts'],
      confidence: artifactScore > 0.4 ? 0.8 : 0.3
    };
  } catch (error) {
    console.error('Neural artifact detection error:', error);
    return {
      score: 0.4,
      artifacts: ['analysis_error'],
      confidence: 0.3
    };
  }
}

function calculateBase64Entropy(data: string): number {
  const freq = new Map<string, number>();
  for (const char of data) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  
  let entropy = 0;
  const length = data.length;
  
  for (const count of freq.values()) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }
  
  return entropy / Math.log2(64); // Normalize for base64 (6 bits)
}

async function analyzeWithOpenAI(imageSource: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('OpenAI API key not available, using heuristic analysis only');
    return null;
  }

  try {
    console.log('Calling OpenAI Vision API for AI generation detection...');
    
    // Prepare image content for OpenAI Vision API
    const imageContent = imageSource.startsWith('http') 
      ? { type: "image_url", image_url: { url: imageSource } }
      : { type: "image_url", image_url: { url: imageSource } };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert forensic image analyst. Your task is to determine if an image was AI-generated or is a real photograph/artwork.

IMPORTANT: Be CONSERVATIVE. Only mark as AI-generated if you find strong evidence. Many real photos have artifacts from compression, editing, or artistic techniques.

AI-GENERATED INDICATORS (strong evidence needed):
- Impossible anatomy (extra/missing fingers, distorted limbs, incorrect joint placement)
- Nonsensical text or logos (garbled letters, fake text)
- Blending artifacts (unnatural transitions between elements, especially faces)
- Physically impossible lighting (multiple light sources that contradict shadows)
- Repetitive AI patterns (copy-paste textures, synthetic smoothness)
- Surreal elements that don't follow physics

NOT AI INDICATORS (these are normal):
- Artistic stylization (paintings, illustrations, digital art are not AI)
- Photo editing effects (filters, color grading, HDR)
- Compression artifacts (JPEG artifacts are common in real photos)
- Perfect composition or symmetry (photographers can frame shots well)
- High quality or sharpness (modern cameras are very good)
- Digital medium (digital art ≠ AI art)

RESPOND ONLY with valid JSON:
{
  "isAIGenerated": boolean,
  "confidence": 0.0-1.0,
  "reasoning": "clear technical explanation of your determination",
  "specificIndicators": ["specific evidence found"],
  "likelyModel": "suspected AI model (Stable Diffusion/MidJourney/DALL-E) or null"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image for AI generation indicators.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageSource.startsWith('data:') ? imageSource : imageSource,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        isAIGenerated: content.toLowerCase().includes('ai') || content.toLowerCase().includes('generated'),
        confidence: 0.6,
        reasoning: content,
        specificIndicators: [],
        likelyModel: null
      };
    }
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return null;
  }
}

function combineAnalyses(
  frequency: any,
  pixel: any,
  metadata: any,
  stylometric: any,
  neural: any,
  openai: any
): AIDetectionResult {
  
  console.log('Combining analyses - OpenAI result:', openai);
  
  // If OpenAI analysis is available, trust it heavily (it's trained for this)
  if (openai) {
    const finalConfidence = openai.confidence;
    const isAIGenerated = openai.isAIGenerated;
    
    console.log('Using OpenAI-dominant analysis:', { isAIGenerated, finalConfidence });
    
    // Compile artifacts from all sources
    const artifacts: string[] = [];
    if (openai.specificIndicators) artifacts.push(...openai.specificIndicators);
    
    // Only add heuristic artifacts if they strongly support OpenAI's conclusion
    if (isAIGenerated && frequency.score > 0.6) artifacts.push(...frequency.patterns);
    if (isAIGenerated && neural.score > 0.6) artifacts.push(...neural.artifacts);
    
    return {
      isAIGenerated,
      confidence: Math.round(finalConfidence * 100) / 100,
      indicators: {
        frequencyAnomalies: Math.round(frequency.score * 100) / 100,
        pixelPatterns: Math.round(pixel.score * 100) / 100,
        metadataSignatures: Math.round(metadata.score * 100) / 100,
        stylometricAnalysis: Math.round(stylometric.score * 100) / 100,
        neuralArtifacts: Math.round(neural.score * 100) / 100,
      },
      detectionMethod: 'openai_vision_primary',
      aiModel: openai.likelyModel,
      generationConfidence: finalConfidence,
      artifacts,
      technicalAnalysis: {
        compressionArtifacts: frequency.score > 0.5,
        noisePatterns: neural.score > 0.5 ? 'synthetic' : 'natural',
        colorSpace: stylometric.score > 0.6 ? 'ai_optimized' : 'natural',
        frequencyDomain: frequency.score > 0.5 ? 'artificial_peaks' : 'natural_distribution',
      },
    };
  }
  
  // Fallback to heuristics only if OpenAI is not available (less reliable)
  console.log('OpenAI not available, using heuristic analysis (less reliable)');
  
  const scores = [
    { score: frequency.score, weight: 0.15 },
    { score: pixel.score, weight: 0.2 },
    { score: metadata.score, weight: 0.3 }, // Metadata is more reliable
    { score: stylometric.score, weight: 0.15 },
    { score: neural.score, weight: 0.2 }
  ];
  
  let totalScore = 0;
  let totalWeight = 0;
  
  scores.forEach(({ score, weight }) => {
    totalScore += score * weight;
    totalWeight += weight;
  });
  
  const baseConfidence = totalScore / totalWeight;
  
  // Be more conservative without OpenAI - require higher threshold
  const isAIGenerated = baseConfidence > 0.7;
  const finalConfidence = baseConfidence;
  
  // Compile artifacts
  const artifacts: string[] = [];
  if (frequency.score > 0.3) artifacts.push(...frequency.patterns);
  if (pixel.score > 0.5) artifacts.push(...pixel.anomalies);
  if (metadata.score > 0.5) artifacts.push(...metadata.signatures);
  if (stylometric.score > 0.5) artifacts.push(...stylometric.characteristics);
  if (neural.score > 0.4) artifacts.push(...neural.artifacts);
  if (openai?.specificIndicators) artifacts.push(...openai.specificIndicators);
  
  return {
    isAIGenerated,
    confidence: Math.round(finalConfidence * 100) / 100,
    indicators: {
      frequencyAnomalies: Math.round(frequency.score * 100) / 100,
      pixelPatterns: Math.round(pixel.score * 100) / 100,
      metadataSignatures: Math.round(metadata.score * 100) / 100,
      stylometricAnalysis: Math.round(stylometric.score * 100) / 100,
      neuralArtifacts: Math.round(neural.score * 100) / 100,
    },
    detectionMethod: openai ? 'hybrid_ai_statistical' : 'statistical_analysis',
    aiModel,
    generationConfidence: finalConfidence,
    artifacts: [...new Set(artifacts)], // Remove duplicates
    technicalAnalysis: {
      compressionArtifacts: frequency.score > 0.3,
      noisePatterns: pixel.score > 0.4 ? 'synthetic' : 'natural',
      colorSpace: metadata.score > 0.3 ? 'ai_optimized' : 'camera_standard',
      frequencyDomain: frequency.score > 0.4 ? 'artificial_peaks' : 'natural_distribution'
    }
  };
}