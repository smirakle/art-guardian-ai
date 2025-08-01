import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimilarityRequest {
  primaryImageUrl: string;
  compareImageUrls?: string[];
  analysisMode: 'single' | 'batch' | 'database';
  similarityThreshold: number;
  userId?: string;
  artworkId?: string;
}

interface SimilarityResult {
  imageUrl: string;
  similarityScore: number;
  matchType: 'exact' | 'near_exact' | 'similar' | 'partial' | 'different';
  analysisDetails: {
    visualSimilarity: number;
    structuralSimilarity: number;
    colorSimilarity: number;
    contentSimilarity: number;
  };
  detectedDifferences: string[];
  confidenceLevel: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      primaryImageUrl, 
      compareImageUrls = [], 
      analysisMode, 
      similarityThreshold = 0.8,
      userId,
      artworkId 
    }: SimilarityRequest = await req.json();
    
    if (!primaryImageUrl) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: primaryImageUrl'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting AI similarity detection for: ${primaryImageUrl}`);
    console.log(`Analysis mode: ${analysisMode}, Threshold: ${similarityThreshold}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let results: SimilarityResult[] = [];

    switch (analysisMode) {
      case 'single':
        if (compareImageUrls.length === 0) {
          throw new Error('Single mode requires compareImageUrls');
        }
        results = await performSingleComparison(primaryImageUrl, compareImageUrls[0]);
        break;
        
      case 'batch':
        if (compareImageUrls.length === 0) {
          throw new Error('Batch mode requires compareImageUrls');
        }
        results = await performBatchComparison(primaryImageUrl, compareImageUrls, similarityThreshold);
        break;
        
      case 'database':
        results = await performDatabaseComparison(supabase, primaryImageUrl, similarityThreshold, userId);
        break;
        
      default:
        throw new Error('Invalid analysis mode');
    }

    // Filter results by threshold
    const filteredResults = results.filter(result => result.similarityScore >= similarityThreshold);

    // Store results if userId and artworkId are provided
    if (userId && artworkId && filteredResults.length > 0) {
      await storeSimilarityResults(supabase, {
        userId,
        artworkId,
        primaryImageUrl,
        results: filteredResults,
        analysisMode,
        threshold: similarityThreshold
      });
    }

    // Generate comprehensive analysis report
    const analysisReport = generateAnalysisReport(primaryImageUrl, filteredResults, similarityThreshold);

    return new Response(JSON.stringify({
      success: true,
      primaryImage: primaryImageUrl,
      analysisMode,
      threshold: similarityThreshold,
      totalComparisons: results.length,
      significantMatches: filteredResults.length,
      results: filteredResults,
      analysisReport,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI similarity detection error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performSingleComparison(primaryUrl: string, compareUrl: string): Promise<SimilarityResult[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Performing single image comparison using AI...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Compare these two images and provide a detailed similarity analysis:

1. VISUAL SIMILARITY (0-100):
   - Overall visual resemblance
   - Layout and composition similarity
   - Shape and form matching

2. STRUCTURAL SIMILARITY (0-100):
   - Architectural or design elements
   - Proportions and dimensions
   - Spatial relationships

3. COLOR SIMILARITY (0-100):
   - Color palette matching
   - Tone and saturation comparison
   - Lighting and contrast

4. CONTENT SIMILARITY (0-100):
   - Subject matter matching
   - Objects and elements present
   - Contextual similarities

5. DETECTED DIFFERENCES:
   - List specific differences
   - Note any modifications or alterations
   - Identify unique elements

6. OVERALL SIMILARITY SCORE (0-100) and MATCH TYPE (exact/near_exact/similar/partial/different)

Format response as JSON with numerical scores and detailed analysis.`
            },
            {
              type: 'image_url',
              image_url: { url: primaryUrl }
            },
            {
              type: 'image_url', 
              image_url: { url: compareUrl }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No analysis content returned');
  }

  try {
    const analysis = JSON.parse(content);
    
    return [{
      imageUrl: compareUrl,
      similarityScore: analysis.overall_similarity_score / 100,
      matchType: analysis.match_type || 'similar',
      analysisDetails: {
        visualSimilarity: analysis.visual_similarity / 100,
        structuralSimilarity: analysis.structural_similarity / 100,
        colorSimilarity: analysis.color_similarity / 100,
        contentSimilarity: analysis.content_similarity / 100
      },
      detectedDifferences: analysis.detected_differences || [],
      confidenceLevel: 0.9
    }];
  } catch (parseError) {
    // Fallback to basic analysis if JSON parsing fails
    console.warn('JSON parsing failed, using text analysis');
    
    const score = extractScoreFromText(content);
    return [{
      imageUrl: compareUrl,
      similarityScore: score,
      matchType: score > 0.9 ? 'exact' : score > 0.7 ? 'similar' : 'partial',
      analysisDetails: {
        visualSimilarity: score,
        structuralSimilarity: score,
        colorSimilarity: score,
        contentSimilarity: score
      },
      detectedDifferences: ['Analysis completed in text format'],
      confidenceLevel: 0.7
    }];
  }
}

async function performBatchComparison(primaryUrl: string, compareUrls: string[], threshold: number): Promise<SimilarityResult[]> {
  console.log(`Performing batch comparison of ${compareUrls.length} images...`);
  
  const results: SimilarityResult[] = [];
  const batchSize = 5; // Process in batches to avoid rate limits
  
  for (let i = 0; i < compareUrls.length; i += batchSize) {
    const batch = compareUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => 
      performSingleComparison(primaryUrl, url).catch(error => {
        console.error(`Comparison failed for ${url}:`, error);
        return [{
          imageUrl: url,
          similarityScore: 0,
          matchType: 'different' as const,
          analysisDetails: {
            visualSimilarity: 0,
            structuralSimilarity: 0,
            colorSimilarity: 0,
            contentSimilarity: 0
          },
          detectedDifferences: ['Analysis failed'],
          confidenceLevel: 0
        }];
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < compareUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results.filter(result => result.similarityScore >= threshold);
}

async function performDatabaseComparison(supabase: any, primaryUrl: string, threshold: number, userId?: string): Promise<SimilarityResult[]> {
  console.log('Performing database comparison against stored artworks...');
  
  try {
    // Get existing artworks from database for comparison
    let query = supabase.from('artwork').select('id, title, file_paths, user_id');
    
    // If userId provided, exclude their own artworks
    if (userId) {
      query = query.neq('user_id', userId);
    }
    
    const { data: artworks, error } = await query.limit(50); // Limit for performance
    
    if (error) {
      console.error('Database query error:', error);
      return [];
    }
    
    if (!artworks || artworks.length === 0) {
      console.log('No artworks found in database for comparison');
      return [];
    }
    
    console.log(`Comparing against ${artworks.length} database artworks...`);
    
    // Extract image URLs from file paths
    const compareUrls: string[] = [];
    artworks.forEach(artwork => {
      if (artwork.file_paths && Array.isArray(artwork.file_paths)) {
        compareUrls.push(...artwork.file_paths);
      }
    });
    
    // Perform batch comparison
    const results = await performBatchComparison(primaryUrl, compareUrls.slice(0, 20), threshold);
    
    // Add artwork metadata to results
    return results.map(result => ({
      ...result,
      sourceArtwork: artworks.find(artwork => 
        artwork.file_paths && artwork.file_paths.includes(result.imageUrl)
      )
    }));
    
  } catch (error) {
    console.error('Database comparison error:', error);
    return [];
  }
}

function extractScoreFromText(text: string): number {
  // Extract numerical score from text analysis
  const scoreMatch = text.match(/(\d+)%|\b(\d+)\s*\/\s*100\b|score.*?(\d+)/i);
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    return Math.min(Math.max(score / 100, 0), 1);
  }
  
  // Fallback based on keywords
  const lowerText = text.toLowerCase();
  if (lowerText.includes('identical') || lowerText.includes('exact')) return 0.95;
  if (lowerText.includes('very similar') || lowerText.includes('nearly identical')) return 0.85;
  if (lowerText.includes('similar') || lowerText.includes('resembl')) return 0.7;
  if (lowerText.includes('somewhat') || lowerText.includes('partial')) return 0.5;
  if (lowerText.includes('different') || lowerText.includes('distinct')) return 0.2;
  
  return 0.5; // Default fallback
}

function generateAnalysisReport(primaryUrl: string, results: SimilarityResult[], threshold: number) {
  const report = {
    summary: '',
    statistics: {
      totalMatches: results.length,
      exactMatches: results.filter(r => r.matchType === 'exact').length,
      nearExactMatches: results.filter(r => r.matchType === 'near_exact').length,
      similarMatches: results.filter(r => r.matchType === 'similar').length,
      averageSimilarity: 0,
      highestSimilarity: 0
    },
    riskAssessment: {
      copyrightRisk: 'low',
      originalityScore: 100,
      recommendations: [] as string[]
    },
    technicalDetails: {
      analysisMethod: 'AI-powered visual analysis',
      confidenceLevel: 'high',
      thresholdUsed: threshold
    }
  };

  if (results.length > 0) {
    // Calculate statistics
    const similarities = results.map(r => r.similarityScore);
    report.statistics.averageSimilarity = Math.round((similarities.reduce((a, b) => a + b, 0) / similarities.length) * 100);
    report.statistics.highestSimilarity = Math.round(Math.max(...similarities) * 100);
    
    // Assess risk
    const highestScore = Math.max(...similarities);
    if (highestScore > 0.9) {
      report.riskAssessment.copyrightRisk = 'high';
      report.riskAssessment.originalityScore = 20;
      report.riskAssessment.recommendations.push('Potential copyright infringement detected');
      report.riskAssessment.recommendations.push('Legal review recommended before use');
    } else if (highestScore > 0.7) {
      report.riskAssessment.copyrightRisk = 'medium';
      report.riskAssessment.originalityScore = 60;
      report.riskAssessment.recommendations.push('Similar content found - verify originality');
    } else {
      report.riskAssessment.originalityScore = 90;
      report.riskAssessment.recommendations.push('Content appears original');
    }
    
    // Generate summary
    report.summary = `Found ${results.length} similar image(s) with ${report.statistics.exactMatches} exact match(es). ` +
                    `Highest similarity: ${report.statistics.highestSimilarity}%. ` +
                    `Copyright risk: ${report.riskAssessment.copyrightRisk}.`;
  } else {
    report.summary = 'No similar images found above the specified threshold. Content appears unique.';
    report.riskAssessment.recommendations.push('No similar content detected');
  }

  return report;
}

async function storeSimilarityResults(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('similarity_analysis_results')
      .insert({
        user_id: data.userId,
        artwork_id: data.artworkId,
        primary_image_url: data.primaryImageUrl,
        analysis_mode: data.analysisMode,
        similarity_threshold: data.threshold,
        results: data.results,
        total_matches: data.results.length,
        highest_similarity: Math.max(...data.results.map((r: any) => r.similarityScore)),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing similarity results:', error);
    }
  } catch (error) {
    console.error('Storage error:', error);
  }
}