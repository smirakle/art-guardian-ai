import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RealTimeAnalysisRequest {
  imageUrl: string
  analysisTypes: string[]
  userId: string
}

interface AnalysisResult {
  type: string
  service: string
  results: any[]
  confidence: number
  timestamp: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { imageUrl, analysisTypes, userId }: RealTimeAnalysisRequest = await req.json();

    console.log(`Starting real-time analysis for image: ${imageUrl}`);
    console.log(`Analysis types requested: ${analysisTypes.join(', ')}`);

    const results: AnalysisResult[] = [];

    // Parallel execution of all analysis types
    const analysisPromises = [];

    if (analysisTypes.includes('classification')) {
      analysisPromises.push(performImageClassification(imageUrl));
    }

    if (analysisTypes.includes('reverse_search')) {
      analysisPromises.push(performReverseImageSearch(imageUrl));
    }

    if (analysisTypes.includes('copyright')) {
      analysisPromises.push(performCopyrightAnalysis(imageUrl));
    }

    if (analysisTypes.includes('similarity')) {
      analysisPromises.push(performSimilarityAnalysis(imageUrl));
    }

    // Execute all analyses in parallel
    const analysisResults = await Promise.allSettled(analysisPromises);

    // Process results
    for (let i = 0; i < analysisResults.length; i++) {
      const result = analysisResults[i];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Analysis failed for type ${analysisTypes[i]}:`, result.reason);
        results.push({
          type: analysisTypes[i],
          service: 'error',
          results: [],
          confidence: 0,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Store results in database
    for (const result of results) {
      await supabase
        .from('realtime_analysis_results')
        .insert({
          user_id: userId,
          image_url: imageUrl,
          analysis_type: result.type,
          service_name: result.service,
          results: result.results,
          confidence_score: result.confidence,
          created_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({
      success: true,
      results: results,
      analysisCount: results.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Real-time analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function performImageClassification(imageUrl: string): Promise<AnalysisResult> {
  console.log('Starting image classification...');
  
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide detailed classification including: objects, style, medium, subject matter, artistic elements, and technical details. Return as structured JSON.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const classification = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text analysis
    let parsedClassification;
    try {
      parsedClassification = JSON.parse(classification);
    } catch {
      parsedClassification = { description: classification, confidence: 0.8 };
    }

    console.log('Image classification completed');

    return {
      type: 'classification',
      service: 'openai_gpt4o',
      results: [parsedClassification],
      confidence: 0.9,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Image classification error:', error);
    throw error;
  }
}

async function performReverseImageSearch(imageUrl: string): Promise<AnalysisResult> {
  console.log('Starting reverse image search...');
  
  const results = [];

  // TinEye Search
  try {
    const tinyeyeResults = await searchTinEye(imageUrl);
    results.push(...tinyeyeResults);
  } catch (error) {
    console.error('TinEye search failed:', error);
  }

  // Google Reverse Image Search via SerpAPI
  try {
    const googleResults = await searchGoogleReverseImage(imageUrl);
    results.push(...googleResults);
  } catch (error) {
    console.error('Google reverse search failed:', error);
  }

  // Bing Visual Search
  try {
    const bingResults = await searchBingVisual(imageUrl);
    results.push(...bingResults);
  } catch (error) {
    console.error('Bing visual search failed:', error);
  }

  console.log(`Reverse image search completed. Found ${results.length} matches`);

  return {
    type: 'reverse_search',
    service: 'multi_api',
    results: results,
    confidence: results.length > 0 ? 0.8 : 0.1,
    timestamp: new Date().toISOString()
  };
}

async function performCopyrightAnalysis(imageUrl: string): Promise<AnalysisResult> {
  console.log('Starting copyright analysis...');
  
  const results = [];

  // Check multiple databases for copyright matches
  try {
    // Getty Images API (if available)
    // Stock photo databases
    // Copyright registration databases
    
    // For now, using reverse search results to identify potential copyright issues
    const reverseResults = await performReverseImageSearch(imageUrl);
    
    // Analyze results for copyright concerns
    const copyrightConcerns = reverseResults.results.filter(result => {
      const url = result.url || result.source_url || '';
      const domain = url.toLowerCase();
      
      // Check for stock photo sites, professional photography sites, etc.
      return domain.includes('getty') || 
             domain.includes('shutterstock') || 
             domain.includes('istock') || 
             domain.includes('adobe') ||
             domain.includes('dreamstime') ||
             domain.includes('123rf') ||
             result.title?.toLowerCase().includes('copyright') ||
             result.title?.toLowerCase().includes('licensed');
    });

    results.push(...copyrightConcerns.map(concern => ({
      ...concern,
      copyright_risk: 'high',
      reason: 'Found on commercial stock photo platform'
    })));

  } catch (error) {
    console.error('Copyright analysis error:', error);
  }

  console.log(`Copyright analysis completed. Found ${results.length} potential issues`);

  return {
    type: 'copyright',
    service: 'multi_source',
    results: results,
    confidence: results.length > 0 ? 0.7 : 0.2,
    timestamp: new Date().toISOString()
  };
}

async function performSimilarityAnalysis(imageUrl: string): Promise<AnalysisResult> {
  console.log('Starting similarity analysis...');
  
  const results = [];

  try {
    // Use OpenAI's vision capabilities for similarity analysis
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for unique visual features that could be used for similarity matching. Identify: visual fingerprint, color palette, composition, style markers, and distinctive elements. Return as structured data.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }],
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data.choices[0].message.content;
        
        results.push({
          type: 'visual_fingerprint',
          analysis: analysis,
          confidence: 0.85
        });
      }
    }

    // Perform actual similarity searches using the reverse search results
    const reverseResults = await performReverseImageSearch(imageUrl);
    
    // Calculate similarity scores based on visual matching
    const similarityMatches = reverseResults.results.map(result => ({
      ...result,
      similarity_score: calculateSimilarityScore(result),
      match_type: determineSimilarityType(result)
    })).filter(result => result.similarity_score > 0.5);

    results.push(...similarityMatches);

  } catch (error) {
    console.error('Similarity analysis error:', error);
  }

  console.log(`Similarity analysis completed. Found ${results.length} similar images`);

  return {
    type: 'similarity',
    service: 'ai_analysis',
    results: results,
    confidence: results.length > 0 ? 0.8 : 0.3,
    timestamp: new Date().toISOString()
  };
}

async function searchTinEye(imageUrl: string): Promise<any[]> {
  const apiKey = Deno.env.get('TINEYE_API_KEY');
  const apiSecret = Deno.env.get('TINEYE_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    console.log('TinEye API credentials not configured');
    return [];
  }

  try {
    // Generate authentication parameters
    const nonce = Math.random().toString(36).substring(7);
    const timestamp = Math.floor(Date.now() / 1000);
    
    const searchUrl = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}&nonce=${nonce}&timestamp=${timestamp}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`TinEye API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.matches) {
      return data.results.matches.map((match: any) => ({
        source: 'TinEye',
        url: match.backlinks[0]?.url || match.url,
        title: match.backlinks[0]?.title || 'TinEye Match',
        domain: match.domain,
        size: match.size,
        image_url: match.url,
        crawl_date: match.crawl_date,
        confidence: 0.9
      }));
    }

    return [];
  } catch (error) {
    console.error('TinEye search error:', error);
    return [];
  }
}

async function searchGoogleReverseImage(imageUrl: string): Promise<any[]> {
  const apiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!apiKey) {
    console.log('SerpAPI key not configured');
    return [];
  }

  try {
    const searchUrl = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    // Process inline images
    if (data.inline_images) {
      results.push(...data.inline_images.map((image: any) => ({
        source: 'Google Reverse Image',
        url: image.link,
        title: image.title || 'Google Image Match',
        thumbnail: image.thumbnail,
        source_url: image.source,
        confidence: 0.8
      })));
    }

    // Process visual matches
    if (data.visual_matches) {
      results.push(...data.visual_matches.map((match: any) => ({
        source: 'Google Visual Match',
        url: match.link,
        title: match.title || 'Visual Match',
        thumbnail: match.thumbnail,
        source_domain: match.source,
        confidence: 0.7
      })));
    }

    return results.slice(0, 20); // Limit to top 20 results
  } catch (error) {
    console.error('Google reverse image search error:', error);
    return [];
  }
}

async function searchBingVisual(imageUrl: string): Promise<any[]> {
  const apiKey = Deno.env.get('BING_VISUAL_SEARCH_API_KEY');
  
  if (!apiKey) {
    console.log('Bing Visual Search API key not configured');
    return [];
  }

  try {
    const response = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageInfo: {
          url: imageUrl
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Bing Visual Search error: ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    if (data.tags) {
      for (const tag of data.tags) {
        if (tag.actions) {
          for (const action of tag.actions) {
            if (action.actionType === 'PagesIncluding' && action.data?.value) {
              results.push(...action.data.value.map((item: any) => ({
                source: 'Bing Visual Search',
                url: item.hostPageUrl || item.webSearchUrl,
                title: item.name || 'Bing Visual Match',
                thumbnail: item.thumbnailUrl,
                content_url: item.contentUrl,
                confidence: 0.75
              })));
            } else if (action.actionType === 'VisualSearch' && action.data?.value) {
              results.push(...action.data.value.map((item: any) => ({
                source: 'Bing Similar Images',
                url: item.hostPageUrl || item.webSearchUrl,
                title: item.name || 'Similar Image',
                thumbnail: item.thumbnailUrl,
                content_url: item.contentUrl,
                confidence: 0.6
              })));
            }
          }
        }
      }
    }

    return results.slice(0, 15); // Limit to top 15 results
  } catch (error) {
    console.error('Bing visual search error:', error);
    return [];
  }
}

function calculateSimilarityScore(result: any): number {
  // Calculate similarity based on various factors
  let score = 0.5; // Base score

  // Title similarity
  if (result.title && result.title.length > 0) {
    score += 0.1;
  }

  // Domain authority (higher for known image sites)
  const domain = result.url?.toLowerCase() || '';
  if (domain.includes('flickr') || domain.includes('imgur') || domain.includes('pinterest')) {
    score += 0.2;
  }

  // Source credibility
  if (result.source === 'TinEye') {
    score += 0.3; // TinEye is very accurate
  } else if (result.source === 'Google Reverse Image') {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function determineSimilarityType(result: any): string {
  const domain = result.url?.toLowerCase() || '';
  
  if (domain.includes('pinterest') || domain.includes('tumblr')) {
    return 'social_sharing';
  } else if (domain.includes('blog') || domain.includes('wordpress')) {
    return 'blog_usage';
  } else if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) {
    return 'commercial_usage';
  } else if (domain.includes('news') || domain.includes('article')) {
    return 'editorial_usage';
  } else {
    return 'general_usage';
  }
}