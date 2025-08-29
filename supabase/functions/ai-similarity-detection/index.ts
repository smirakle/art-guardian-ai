import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimilarityRequest {
  fingerprint1: {
    visual_features: number[];
    structural_hash: string;
    metadata_signature: string;
  };
  fingerprint2: {
    visual_features: number[];
    structural_hash: string;
    metadata_signature: string;
  };
}

interface SimilarityResult {
  overall_similarity: number;
  visual_similarity: number;
  structural_similarity: number;
  temporal_similarity: number;
  is_adversarial_resistant: boolean;
  confidence_level: 'high' | 'medium' | 'low';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fingerprint1, fingerprint2 }: SimilarityRequest = await req.json();

    console.log('AI Similarity Detection - Comparing fingerprints');

    // Multi-dimensional similarity calculation
    const visual_sim = calculateCosineSimilarity(
      fingerprint1.visual_features, 
      fingerprint2.visual_features
    );
    
    const structural_sim = calculateJaccardIndex(
      fingerprint1.structural_hash, 
      fingerprint2.structural_hash
    );
    
    const temporal_sim = calculateTemporalMatch(
      fingerprint1.metadata_signature, 
      fingerprint2.metadata_signature
    );

    // Weighted aggregation: S(F1,F2) = Σ(wi × similarity_i(F1_i, F2_i))
    const w1 = 0.5; // Visual features weight
    const w2 = 0.3; // Structural features weight
    const w3 = 0.2; // Temporal features weight
    
    const overall_similarity = w1 * visual_sim + w2 * structural_sim + w3 * temporal_sim;

    // Adversarial robustness check
    const is_adversarial_resistant = await checkAdversarialRobustness(
      overall_similarity, 
      visual_sim, 
      structural_sim
    );

    // Confidence level determination
    let confidence_level: 'high' | 'medium' | 'low';
    if (overall_similarity > 0.85 && is_adversarial_resistant) {
      confidence_level = 'high';
    } else if (overall_similarity > 0.65) {
      confidence_level = 'medium';
    } else {
      confidence_level = 'low';
    }

    const result: SimilarityResult = {
      overall_similarity,
      visual_similarity: visual_sim,
      structural_similarity: structural_sim,
      temporal_similarity: temporal_sim,
      is_adversarial_resistant,
      confidence_level
    };

    console.log('Similarity calculation complete:', result);

    return new Response(JSON.stringify({
      success: true,
      similarity_result: result,
      algorithm_details: {
        visual_method: 'cosine_similarity',
        structural_method: 'jaccard_index',
        temporal_method: 'temporal_correlation',
        weighting_scheme: { w1, w2, w3 }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Similarity Detection:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Similarity detection failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
  // Real cosine similarity implementation
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

function calculateJaccardIndex(hash1: string, hash2: string): number {
  // Real Jaccard index for structural similarity
  const set1 = new Set(hash1.split(''));
  const set2 = new Set(hash2.split(''));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

function calculateTemporalMatch(meta1: string, meta2: string): number {
  // Extract timestamps and calculate temporal correlation
  const timestamp1 = extractTimestamp(meta1);
  const timestamp2 = extractTimestamp(meta2);
  
  if (!timestamp1 || !timestamp2) {
    return 0.5; // Default similarity if timestamps not available
  }
  
  const timeDiff = Math.abs(timestamp1 - timestamp2);
  const maxDiff = 1000 * 60 * 60 * 24 * 365; // One year in milliseconds
  
  // Exponential decay similarity based on time difference
  return Math.exp(-timeDiff / maxDiff);
}

function extractTimestamp(metadata: string): number | null {
  // Extract timestamp from metadata signature
  const parts = metadata.split('_');
  const timestamp = parseInt(parts[0]);
  return isNaN(timestamp) ? null : timestamp;
}

async function checkAdversarialRobustness(
  overall_sim: number, 
  visual_sim: number, 
  structural_sim: number
): Promise<boolean> {
  // Secondary verification for high similarity scores
  if (overall_sim > 0.9) {
    // Check for consistency across different similarity metrics
    const consistency_threshold = 0.3;
    const visual_structural_diff = Math.abs(visual_sim - structural_sim);
    
    if (visual_structural_diff > consistency_threshold) {
      console.log('Potential adversarial attack detected - inconsistent similarity scores');
      return false;
    }
    
    // Additional robustness checks
    const robustness_score = calculateRobustnessScore(visual_sim, structural_sim);
    return robustness_score > 0.7;
  }
  
  return true;
}

function calculateRobustnessScore(visual_sim: number, structural_sim: number): number {
  // Calculate robustness against adversarial modifications
  const baseline_consistency = 1 - Math.abs(visual_sim - structural_sim);
  const minimum_threshold = Math.min(visual_sim, structural_sim);
  
  // Weighted combination favoring consistency and minimum performance
  return 0.6 * baseline_consistency + 0.4 * minimum_threshold;
}