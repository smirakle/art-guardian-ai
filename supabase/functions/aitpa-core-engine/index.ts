import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AITPARequest {
  action: 'analyze' | 'fingerprint' | 'compare' | 'scan_datasets';
  imageUrl?: string;
  fingerprint?: string;
  comparisonUrls?: string[];
  userId?: string;
  protectionId?: string;
}

interface AITPAFingerprint {
  perceptualHash: string;
  structuralFeatures: number[];
  semanticEmbedding: number[];
  visualSignature: string;
  metadataHash: string;
}

interface AITPAAnalysisResult {
  confidence: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  fingerprint: AITPAFingerprint;
  similarityScore: number;
  riskFactors: {
    datasetPresence: number;
    accessPatterns: number;
    technicalIndicators: number;
    behavioralAnomalies: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const request: AITPARequest = await req.json();

    console.log('AITPA Core Engine request:', request.action);

    let result;
    switch (request.action) {
      case 'analyze':
        result = await performAITPAAnalysis(request.imageUrl!, openAIKey);
        break;
      case 'fingerprint':
        result = await generateAITPAFingerprint(request.imageUrl!, openAIKey);
        break;
      case 'compare':
        result = await performAITPAComparison(request.fingerprint!, request.comparisonUrls!, openAIKey);
        break;
      case 'scan_datasets':
        result = await scanAITrainingDatasets(request.fingerprint!, supabase);
        break;
      default:
        throw new Error('Invalid action');
    }

    // Log analysis for audit trail
    if (request.userId) {
      await supabase.rpc('log_ai_protection_action', {
        user_id_param: request.userId,
        action_param: `aitpa_${request.action}`,
        resource_type_param: 'aitpa_analysis',
        resource_id_param: request.protectionId || 'unknown',
        details_param: { 
          action: request.action,
          confidence: result.confidence || 0,
          threatLevel: result.threatLevel || 'unknown'
        }
      });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AITPA Core Engine error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performAITPAAnalysis(imageUrl: string, openAIKey?: string): Promise<AITPAAnalysisResult> {
  console.log('Performing AITPA analysis for:', imageUrl);
  
  // Generate comprehensive fingerprint
  const fingerprint = await generateAITPAFingerprint(imageUrl, openAIKey);
  
  // Analyze for AI training patterns using advanced detection
  const patternAnalysis = await analyzeAITrainingPatterns(imageUrl, fingerprint, openAIKey);
  
  // Calculate risk factors
  const riskFactors = await calculateRiskFactors(fingerprint, patternAnalysis);
  
  // Compute overall confidence and threat level
  const confidence = computeConfidenceScore(riskFactors, patternAnalysis);
  const threatLevel = determineThreatLevel(confidence, riskFactors);
  
  return {
    confidence,
    threatLevel,
    indicators: patternAnalysis.indicators,
    fingerprint,
    similarityScore: patternAnalysis.similarityScore,
    riskFactors
  };
}

async function generateAITPAFingerprint(imageUrl: string, openAIKey?: string): Promise<AITPAFingerprint> {
  console.log('Generating AITPA fingerprint for:', imageUrl);
  
  // Perceptual hash using difference hash algorithm
  const perceptualHash = await generatePerceptualHash(imageUrl);
  
  // Structural features extraction
  const structuralFeatures = await extractStructuralFeatures(imageUrl);
  
  // Semantic embedding using AI
  const semanticEmbedding = await generateSemanticEmbedding(imageUrl, openAIKey);
  
  // Visual signature based on color distribution and edge detection
  const visualSignature = await generateVisualSignature(imageUrl);
  
  // Metadata hash for additional verification
  const metadataHash = await generateMetadataHash(imageUrl);
  
  return {
    perceptualHash,
    structuralFeatures,
    semanticEmbedding,
    visualSignature,
    metadataHash
  };
}

async function generatePerceptualHash(imageUrl: string): Promise<string> {
  // Simplified perceptual hashing - in production, use proper image processing
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Simple difference hash simulation
  let hash = '';
  for (let i = 0; i < Math.min(64, bytes.length); i += 8) {
    const chunk = bytes.slice(i, i + 8);
    const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length;
    hash += chunk.map(b => b > avg ? '1' : '0').join('');
  }
  
  return hash.substring(0, 64);
}

async function extractStructuralFeatures(imageUrl: string): Promise<number[]> {
  // Simulate structural feature extraction
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Extract basic structural features
  const features: number[] = [];
  
  // Histogram features
  const histogram = new Array(256).fill(0);
  for (const byte of bytes) {
    histogram[byte]++;
  }
  
  // Normalize and take first 50 bins
  const total = bytes.length;
  for (let i = 0; i < 50; i++) {
    features.push(histogram[i] / total);
  }
  
  // Edge density approximation
  let edgeCount = 0;
  for (let i = 1; i < bytes.length; i++) {
    if (Math.abs(bytes[i] - bytes[i-1]) > 30) {
      edgeCount++;
    }
  }
  features.push(edgeCount / bytes.length);
  
  return features;
}

async function generateSemanticEmbedding(imageUrl: string, openAIKey?: string): Promise<number[]> {
  if (!openAIKey) {
    // Return simulated embedding
    return Array.from({length: 128}, () => Math.random() * 2 - 1);
  }
  
  try {
    // Get semantic description from OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [{
            type: 'text',
            text: 'Describe this image in technical detail for content analysis'
          }, {
            type: 'image_url',
            image_url: { url: imageUrl }
          }]
        }],
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    const description = data.choices[0]?.message?.content || '';
    
    // Convert description to embedding (simplified)
    const embedding: number[] = [];
    for (let i = 0; i < 128; i++) {
      const char = description.charCodeAt(i % description.length) || 0;
      embedding.push((char / 255) * 2 - 1);
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating semantic embedding:', error);
    return Array.from({length: 128}, () => Math.random() * 2 - 1);
  }
}

async function generateVisualSignature(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Color distribution signature
  const colorBins = new Array(16).fill(0);
  for (let i = 0; i < bytes.length; i += 3) {
    const intensity = (bytes[i] + bytes[i+1] + bytes[i+2]) / 3;
    const bin = Math.floor(intensity / 16);
    colorBins[Math.min(bin, 15)]++;
  }
  
  // Normalize and create signature
  const total = colorBins.reduce((a, b) => a + b, 0);
  const signature = colorBins.map(count => 
    Math.floor((count / total) * 255).toString(16).padStart(2, '0')
  ).join('');
  
  return signature;
}

async function generateMetadataHash(imageUrl: string): Promise<string> {
  // Create hash from URL and basic metadata
  const urlHash = await crypto.subtle.digest('SHA-256', 
    new TextEncoder().encode(imageUrl)
  );
  return Array.from(new Uint8Array(urlHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').substring(0, 32);
}

async function analyzeAITrainingPatterns(
  imageUrl: string, 
  fingerprint: AITPAFingerprint, 
  openAIKey?: string
) {
  const indicators: string[] = [];
  let similarityScore = 0;
  
  // Pattern analysis using fingerprint
  if (fingerprint.perceptualHash.includes('1111') || fingerprint.perceptualHash.includes('0000')) {
    indicators.push('Repetitive pattern detected');
    similarityScore += 0.2;
  }
  
  // Structural anomaly detection
  const avgFeature = fingerprint.structuralFeatures.reduce((a, b) => a + b, 0) / fingerprint.structuralFeatures.length;
  if (avgFeature < 0.1 || avgFeature > 0.9) {
    indicators.push('Structural anomaly detected');
    similarityScore += 0.3;
  }
  
  // AI-specific pattern analysis with OpenAI
  if (openAIKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'Analyze for AI training dataset indicators: synthetic patterns, dataset artifacts, preprocessing signatures, or training-specific modifications.'
          }, {
            role: 'user',
            content: [{
              type: 'text',
              text: 'Analyze this image for signs of AI training dataset inclusion or processing artifacts.'
            }, {
              type: 'image_url',
              image_url: { url: imageUrl }
            }]
          }],
          max_tokens: 300
        })
      });
      
      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || '';
      
      // Extract indicators from AI analysis
      const aiIndicators = [
        'synthetic', 'artificial', 'generated', 'dataset', 'preprocessing',
        'augmentation', 'normalized', 'standardized', 'batch', 'training'
      ];
      
      for (const indicator of aiIndicators) {
        if (analysis.toLowerCase().includes(indicator)) {
          indicators.push(`AI pattern: ${indicator}`);
          similarityScore += 0.1;
        }
      }
      
    } catch (error) {
      console.error('Error in AI pattern analysis:', error);
    }
  }
  
  return { indicators, similarityScore: Math.min(similarityScore, 1.0) };
}

async function calculateRiskFactors(
  fingerprint: AITPAFingerprint, 
  patternAnalysis: any
) {
  return {
    datasetPresence: patternAnalysis.similarityScore * 0.8,
    accessPatterns: Math.random() * 0.5, // Simulated - would use real access logs
    technicalIndicators: fingerprint.structuralFeatures[50] || 0,
    behavioralAnomalies: patternAnalysis.indicators.length * 0.1
  };
}

function computeConfidenceScore(riskFactors: any, patternAnalysis: any): number {
  const weights = {
    datasetPresence: 0.4,
    accessPatterns: 0.2,
    technicalIndicators: 0.2,
    behavioralAnomalies: 0.2
  };
  
  const score = Object.entries(riskFactors).reduce((total, [key, value]) => {
    return total + (weights[key as keyof typeof weights] * (value as number));
  }, 0);
  
  return Math.min(Math.max(score, 0), 1);
}

function determineThreatLevel(confidence: number, riskFactors: any): 'low' | 'medium' | 'high' | 'critical' {
  if (confidence > 0.8 || riskFactors.datasetPresence > 0.7) return 'critical';
  if (confidence > 0.6 || riskFactors.datasetPresence > 0.5) return 'high';
  if (confidence > 0.4 || riskFactors.datasetPresence > 0.3) return 'medium';
  return 'low';
}

async function performAITPAComparison(
  fingerprint: string, 
  comparisonUrls: string[], 
  openAIKey?: string
): Promise<any> {
  // Implement fingerprint comparison logic
  const comparisons = [];
  
  for (const url of comparisonUrls) {
    const compFingerprint = await generateAITPAFingerprint(url, openAIKey);
    const similarity = calculateFingerprintSimilarity(
      JSON.parse(fingerprint), 
      compFingerprint
    );
    
    comparisons.push({
      url,
      similarity,
      fingerprint: compFingerprint
    });
  }
  
  return { comparisons };
}

function calculateFingerprintSimilarity(fp1: AITPAFingerprint, fp2: AITPAFingerprint): number {
  // Hamming distance for perceptual hashes
  let hammingDistance = 0;
  for (let i = 0; i < Math.min(fp1.perceptualHash.length, fp2.perceptualHash.length); i++) {
    if (fp1.perceptualHash[i] !== fp2.perceptualHash[i]) {
      hammingDistance++;
    }
  }
  const hashSimilarity = 1 - (hammingDistance / Math.max(fp1.perceptualHash.length, fp2.perceptualHash.length));
  
  // Euclidean distance for structural features
  let structuralDistance = 0;
  for (let i = 0; i < Math.min(fp1.structuralFeatures.length, fp2.structuralFeatures.length); i++) {
    structuralDistance += Math.pow(fp1.structuralFeatures[i] - fp2.structuralFeatures[i], 2);
  }
  const structuralSimilarity = 1 / (1 + Math.sqrt(structuralDistance));
  
  // Combined similarity score
  return (hashSimilarity * 0.6) + (structuralSimilarity * 0.4);
}

async function scanAITrainingDatasets(fingerprint: string, supabase: any): Promise<any> {
  // Simulated dataset scanning - in production, would query actual dataset APIs
  const datasets = [
    'LAION-5B', 'CommonCrawl', 'OpenImages', 'COCO', 'ImageNet',
    'Conceptual Captions', 'WIT', 'RedCaps', 'CC12M'
  ];
  
  const matches = [];
  const fp = JSON.parse(fingerprint);
  
  for (const dataset of datasets) {
    // Simulate dataset search
    const matchProbability = Math.random();
    const threshold = 0.15; // 15% chance of finding a match
    
    if (matchProbability < threshold) {
      const confidence = 0.4 + (matchProbability / threshold) * 0.5;
      matches.push({
        dataset,
        confidence,
        matchType: 'fingerprint_similarity',
        details: {
          perceptualHashMatch: Math.random() > 0.5,
          structuralMatch: Math.random() > 0.7,
          semanticMatch: Math.random() > 0.6
        }
      });
    }
  }
  
  // Store results in database
  try {
    await supabase.rpc('record_ai_protection_metric', {
      metric_type_param: 'dataset_scan',
      metric_name_param: 'aitpa_scan_results',
      metric_value_param: matches.length,
      metadata_param: { matches, fingerprint: fp.perceptualHash.substring(0, 16) }
    });
  } catch (error) {
    console.error('Error storing scan results:', error);
  }
  
  return { matches, totalDatasets: datasets.length };
}