import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Run all analyses in parallel for maximum efficiency
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

    // Wait for all analyses to complete
    const analysisResults = await Promise.allSettled(analysisPromises);

    // Process results
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

    // Generate comprehensive summary
    const summary = generateComprehensiveSummary(results);

    // Store results if user and artwork IDs are provided
    if (userId && artworkId) {
      await storeAnalysisResults(supabase, {
        userId,
        artworkId,
        imageUrl,
        results,
        summary
      });
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

async function performAdvancedVisualAnalysis(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
              text: `Perform a comprehensive visual analysis of this image. Provide detailed insights on:

1. ARTISTIC ANALYSIS:
   - Style, medium, and technique
   - Composition and visual balance
   - Color palette and harmony
   - Artistic influences or movements

2. TECHNICAL ANALYSIS:
   - Image quality and resolution
   - Lighting and exposure
   - Focus and depth of field
   - Digital vs traditional medium indicators

3. CONTENT ANALYSIS:
   - Main subjects and objects
   - Scene context and setting
   - Emotional tone and mood
   - Cultural or symbolic elements

4. COMMERCIAL POTENTIAL:
   - Market appeal and target audience
   - Licensing considerations
   - Usage applications
   - Value assessment factors

5. UNIQUENESS ASSESSMENT:
   - Originality indicators
   - Distinctive features
   - Potential for recognition
   - Rarity factors

Format your response as a structured JSON object with detailed analysis for each category.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 2000,
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
    return JSON.parse(content);
  } catch (parseError) {
    // Return structured fallback if JSON parsing fails
    return {
      analysis: content,
      confidence: 0.8,
      status: 'completed_text_format'
    };
  }
}

async function performCopyrightAssessment(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
              text: `Assess this image for copyright and intellectual property considerations:

1. ORIGINALITY ASSESSMENT:
   - Signs of original creation vs stock/commercial imagery
   - Unique artistic elements
   - Personal creative expression indicators

2. COPYRIGHT RISK FACTORS:
   - Presence of copyrighted characters, logos, or trademarks
   - Commercial product placements
   - Recognizable copyrighted artwork references
   - Celebrity likeness or personality rights

3. LICENSING INDICATORS:
   - Professional photography markers
   - Stock photo characteristics
   - Watermarks or copyright notices
   - Commercial quality indicators

4. LEGAL CONSIDERATIONS:
   - Fair use potential
   - Transformative work elements
   - Educational or commentary aspects
   - Commercial use restrictions

Provide a risk score (0-100) and detailed recommendations as JSON.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
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
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    return {
      assessment: content,
      risk_score: 50,
      status: 'completed_text_format'
    };
  }
}

async function performDeepfakeDetection(imageUrl: string) {
  // Use our existing deepfake detection function
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase.functions.invoke('real-deepfake-detector', {
    body: { imageUrl }
  });

  if (error) {
    throw new Error(`Deepfake detection failed: ${error.message}`);
  }

  return data;
}

async function performSimilaritySearch(imageUrl: string) {
  // Use TinEye API for professional similarity search
  const apiKey = Deno.env.get('TINEYE_API_KEY');
  const apiSecret = Deno.env.get('TINEYE_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    return { error: 'TinEye API credentials not configured', matches: [] };
  }

  try {
    const nonce = Math.random().toString(36).substring(7);
    const timestamp = Math.floor(Date.now() / 1000);
    
    const searchUrl = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}&nonce=${nonce}&timestamp=${timestamp}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`TinEye API error: ${response.status}`);
    }

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
  // Use our existing Google Lens analysis
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase.functions.invoke('google-lens-analysis', {
    body: { 
      imageData: imageUrl,
      analysisTypes: ['objects', 'products', 'landmarks']
    }
  });

  if (error) {
    throw new Error(`Object detection failed: ${error.message}`);
  }

  return data;
}

async function performTextExtraction(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
              text: 'Extract all text from this image including: visible text, captions, titles, logos, signs, watermarks, and any readable content. Also identify the language and provide coordinates if possible. Format as JSON with extracted text, language, and context.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    return {
      extracted_text: content,
      language: 'unknown',
      status: 'completed_text_format'
    };
  }
}

async function performQualityAssessment(imageUrl: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
              text: `Assess the technical quality of this image:

1. RESOLUTION & CLARITY:
   - Apparent resolution quality
   - Sharpness and focus
   - Pixel density assessment

2. EXPOSURE & LIGHTING:
   - Exposure balance
   - Dynamic range
   - Shadow and highlight detail

3. COLOR & SATURATION:
   - Color accuracy
   - Saturation levels
   - White balance

4. COMPRESSION & ARTIFACTS:
   - JPEG compression artifacts
   - Noise levels
   - Digital artifacts

5. OVERALL QUALITY SCORE (0-100) and recommendations for improvement.

Format as structured JSON.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    return {
      assessment: content,
      quality_score: 75,
      status: 'completed_text_format'
    };
  }
}

async function performMetadataAnalysis(imageUrl: string) {
  try {
    // Fetch image headers to analyze metadata
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

    // Basic analysis of the metadata
    const analysis = {
      file_size_mb: metadata.content_length ? (parseInt(metadata.content_length) / 1024 / 1024).toFixed(2) : 'unknown',
      format: metadata.content_type?.split('/')[1] || 'unknown',
      is_optimized: metadata.content_length ? parseInt(metadata.content_length) < 2000000 : false,
      cache_friendly: !!metadata.cache_control,
      metadata: metadata
    };

    return analysis;
  } catch (error) {
    return { error: error.message, status: 'failed' };
  }
}

function generateComprehensiveSummary(results: Partial<AnalysisResults>) {
  const summary = {
    overall_assessment: 'Analysis completed',
    key_findings: [],
    risk_factors: [],
    recommendations: [],
    confidence_score: 0
  };

  let totalConfidence = 0;
  let confidenceCount = 0;

  // Process each analysis result
  Object.entries(results).forEach(([type, result]) => {
    if (result && !result.error) {
      if (result.confidence) {
        totalConfidence += result.confidence;
        confidenceCount++;
      }

      // Extract key findings based on analysis type
      switch (type) {
        case 'visual_analysis':
          if (result.artistic_analysis) {
            summary.key_findings.push(`Artistic style: ${result.artistic_analysis.style || 'Contemporary'}`);
          }
          break;
        case 'copyright_assessment':
          if (result.risk_score > 70) {
            summary.risk_factors.push('High copyright risk detected');
          }
          break;
        case 'deepfake_detection':
          if (result.isDeepfake) {
            summary.risk_factors.push(`Potential deepfake detected (${result.confidence}% confidence)`);
          }
          break;
        case 'similarity_search':
          if (result.total_matches > 0) {
            summary.key_findings.push(`${result.total_matches} similar images found online`);
          }
          break;
      }
    }
  });

  // Calculate overall confidence
  summary.confidence_score = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

  // Generate recommendations
  if (summary.risk_factors.length > 0) {
    summary.recommendations.push('Review copyright and authenticity concerns before commercial use');
  }
  if (summary.key_findings.length === 0) {
    summary.recommendations.push('Consider higher quality images for better analysis results');
  }

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

    if (error) {
      console.error('Error storing analysis results:', error);
    }
  } catch (error) {
    console.error('Storage error:', error);
  }
}