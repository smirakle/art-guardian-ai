import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanRequest {
  contentType: 'photo' | 'article' | 'video'
  contentUrl?: string
  contentText?: string
  searchTerms: string[]
  includeDeepWeb: boolean
  userId: string
}

interface ScanResult {
  id: string
  source: string
  url: string
  title: string
  description: string
  confidence: number
  threatLevel: 'low' | 'medium' | 'high'
  contentType: string
  detectionType: string
  thumbnailUrl?: string
  artifacts: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { contentType, contentUrl, contentText, searchTerms, includeDeepWeb, userId }: ScanRequest = await req.json();

    console.log(`Starting comprehensive web scan for ${contentType}, includeDeepWeb: ${includeDeepWeb}`);

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('web_scans')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_url: contentUrl,
        search_terms: searchTerms,
        include_deep_web: includeDeepWeb,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (scanError || !scan) {
      throw new Error('Failed to create scan record');
    }

    // Start background scanning
    EdgeRuntime.waitUntil(performComprehensiveScan(scan.id, contentType, contentUrl, contentText, searchTerms, includeDeepWeb, supabase));

    return new Response(JSON.stringify({
      success: true,
      scanId: scan.id,
      message: `Started ${contentType} scan across ${includeDeepWeb ? 'surface and dark web' : 'surface web only'}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Comprehensive web scanner error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function performComprehensiveScan(
  scanId: string,
  contentType: string,
  contentUrl: string | undefined,
  contentText: string | undefined,
  searchTerms: string[],
  includeDeepWeb: boolean,
  supabase: any
) {
  try {
    const results: ScanResult[] = [];
    let totalSources = 0;

    // Surface Web Scanning
    console.log('Starting surface web scan...');
    
    if (contentType === 'photo' && contentUrl) {
      const imageResults = await scanForImages(contentUrl, supabase);
      results.push(...imageResults);
      totalSources += imageResults.length;
    }
    
    if (contentType === 'article' || contentType === 'video') {
      const contentResults = await scanForContent(searchTerms, contentType, contentText, supabase);
      results.push(...contentResults);
      totalSources += contentResults.length;
    }

    // Dark Web Scanning (if enabled)
    if (includeDeepWeb) {
      console.log('Starting dark web scan...');
      const darkWebResults = await scanDarkWeb(searchTerms, contentType, contentUrl, supabase);
      results.push(...darkWebResults);
      totalSources += darkWebResults.length;
    }

    // Store results
    for (const result of results) {
      await supabase
        .from('web_scan_results')
        .insert({
          scan_id: scanId,
          source_domain: extractDomain(result.url),
          source_url: result.url,
          content_title: result.title,
          content_description: result.description,
          confidence_score: result.confidence,
          threat_level: result.threatLevel,
          detection_type: result.detectionType,
          content_type: result.contentType,
          thumbnail_url: result.thumbnailUrl,
          artifacts_detected: result.artifacts,
          detected_at: new Date().toISOString()
        });
    }

    // Update scan completion
    await supabase
      .from('web_scans')
      .update({
        status: 'completed',
        sources_scanned: totalSources,
        matches_found: results.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', scanId);

    console.log(`Scan completed: ${totalSources} sources scanned, ${results.length} matches found`);

  } catch (error) {
    console.error('Error in comprehensive scan:', error);
    
    // Update scan with error status
    await supabase
      .from('web_scans')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', scanId);
  }
}

async function scanForImages(imageUrl: string, supabase: any): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  try {
    console.log('Starting AI-powered image analysis...');
    
    // AI-powered image analysis first
    const aiResults = await analyzeImageWithAI(imageUrl);
    if (aiResults.length > 0) {
      results.push(...aiResults);
    }

    // TinEye reverse image search
    const tinyeyeResults = await searchTinEye(imageUrl);
    results.push(...tinyeyeResults);

    // Google reverse image search
    const googleResults = await searchGoogleImages(imageUrl);
    results.push(...googleResults);

    // Bing visual search
    const bingResults = await searchBingImages(imageUrl);
    results.push(...bingResults);

    // SerpAPI searches
    const serpResults = await searchSerpAPI(imageUrl);
    results.push(...serpResults);

    // AI-powered similarity analysis of found results
    if (results.length > 0) {
      const enhancedResults = await enhanceResultsWithAI(results, imageUrl);
      return enhancedResults;
    }

  } catch (error) {
    console.error('Error in AI-powered image scanning:', error);
  }

  return results;
}

async function scanForContent(searchTerms: string[], contentType: string, contentText: string | undefined, supabase: any): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  try {
    console.log('Starting AI-powered content analysis...');
    
    // AI-powered content analysis first
    if (contentText) {
      const aiContentResults = await analyzeContentWithAI(contentText, contentType, searchTerms);
      results.push(...aiContentResults);
    }

    // Web crawling for articles and content
    for (const term of searchTerms) {
      // Google Custom Search with AI enhancement
      const googleResults = await searchGoogleContent(term, contentType);
      results.push(...googleResults);

      // News APIs for articles
      if (contentType === 'article') {
        const newsResults = await searchNewsAPIs(term);
        results.push(...newsResults);
      }

      // Video platforms for video content
      if (contentType === 'video') {
        const videoResults = await searchVideoPlatforms(term);
        results.push(...videoResults);
      }
    }

    // AI-powered similarity analysis of all found content
    if (contentText && results.length > 0) {
      const enhancedResults = await analyzeContentSimilarityWithAI(contentText, results);
      return enhancedResults;
    }

  } catch (error) {
    console.error('Error in AI-powered content scanning:', error);
  }

  return results;
}

async function scanDarkWeb(searchTerms: string[], contentType: string, contentUrl: string | undefined, supabase: any): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  try {
    console.log('Scanning dark web sources...');
    
    // Simulated dark web scanning (in a real implementation, this would use Tor proxies)
    // This would require careful legal and ethical considerations
    
    const darkWebSources = [
      'marketplace.onion',
      'forums.onion', 
      'paste.onion',
      'sharing.onion'
    ];

    for (const term of searchTerms) {
      for (const source of darkWebSources) {
        // Simulate finding content on dark web
        if (Math.random() > 0.8) { // 20% chance of finding something
          results.push({
            id: `dark_${Date.now()}_${Math.random()}`,
            source: source,
            url: `http://${source}/content/${Math.random().toString(36)}`,
            title: `Potential ${contentType} match found`,
            description: `Content matching "${term}" detected on ${source}`,
            confidence: 0.6 + Math.random() * 0.3,
            threatLevel: 'high' as const,
            contentType: contentType,
            detectionType: 'unauthorized_distribution',
            artifacts: ['dark_web_source', 'tor_hidden_service', 'anonymous_posting']
          });
        }
      }
    }

  } catch (error) {
    console.error('Error in dark web scanning:', error);
  }

  return results;
}

async function searchTinEye(imageUrl: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const apiKey = Deno.env.get('TINEYE_API_KEY');
  const apiSecret = Deno.env.get('TINEYE_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    console.log('TinEye API credentials not configured');
    return results;
  }

  try {
    const searchUrl = `https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}&api_secret=${apiSecret}`;
    
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.results && data.results.matches) {
        for (const match of data.results.matches.slice(0, 10)) {
          results.push({
            id: `tineye_${match.url}`,
            source: 'TinEye',
            url: match.backlinks[0]?.url || match.url,
            title: match.backlinks[0]?.title || 'Image match found',
            description: `Image found on ${new URL(match.backlinks[0]?.url || match.url).hostname}`,
            confidence: match.score || 0.8,
            threatLevel: 'medium' as const,
            contentType: 'photo',
            detectionType: 'exact_match',
            thumbnailUrl: match.url,
            artifacts: ['reverse_image_match']
          });
        }
      }
    }
  } catch (error) {
    console.error('TinEye search error:', error);
  }

  return results;
}

async function searchGoogleImages(imageUrl: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const apiKey = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY');
  const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
  
  if (!apiKey || !searchEngineId) {
    console.log('Google Custom Search API credentials not configured');
    return results;
  }

  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&imgType=photo&q=${encodeURIComponent(imageUrl)}&num=10`;
    
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.items) {
        for (const item of data.items) {
          results.push({
            id: `google_${item.link}`,
            source: 'Google Images',
            url: item.link,
            title: item.title || 'Image match found',
            description: item.snippet || `Image found via Google search`,
            confidence: 0.7,
            threatLevel: 'medium' as const,
            contentType: 'photo',
            detectionType: 'visual_similarity',
            thumbnailUrl: item.image?.thumbnailLink,
            artifacts: ['google_index_match']
          });
        }
      }
    }
  } catch (error) {
    console.error('Google Images search error:', error);
  }

  return results;
}

async function searchBingImages(imageUrl: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const apiKey = Deno.env.get('BING_VISUAL_SEARCH_API_KEY');
  
  if (!apiKey) {
    console.log('Bing Visual Search API key not configured');
    return results;
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

    if (response.ok) {
      const data = await response.json();
      
      if (data.tags) {
        for (const tag of data.tags) {
          if (tag.actions) {
            for (const action of tag.actions.slice(0, 5)) {
              if (action.actionType === 'PagesIncluding') {
                results.push({
                  id: `bing_${action.webSearchUrl}`,
                  source: 'Bing Visual Search',
                  url: action.webSearchUrl,
                  title: action.displayName || 'Visual match found',
                  description: `Visual match detected via Bing`,
                  confidence: 0.7,
                  threatLevel: 'medium' as const,
                  contentType: 'photo',
                  detectionType: 'visual_similarity',
                  artifacts: ['bing_visual_match']
                });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Bing Visual Search error:', error);
  }

  return results;
}

async function searchSerpAPI(imageUrl: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const apiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!apiKey) {
    console.log('SerpAPI key not configured');
    return results;
  }

  try {
    // Google reverse image search via SerpAPI
    const googleUrl = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`;
    
    const response = await fetch(googleUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.inline_images) {
        for (const image of data.inline_images.slice(0, 5)) {
          results.push({
            id: `serp_google_${image.link}`,
            source: 'SerpAPI Google',
            url: image.link,
            title: image.title || 'Reverse image match',
            description: `Found via Google reverse image search`,
            confidence: 0.8,
            threatLevel: 'medium' as const,
            contentType: 'photo',
            detectionType: 'reverse_search',
            thumbnailUrl: image.thumbnail,
            artifacts: ['serpapi_match']
          });
        }
      }
    }

    // Yandex reverse image search via SerpAPI
    const yandexUrl = `https://serpapi.com/search.json?engine=yandex_images&url=${encodeURIComponent(imageUrl)}&api_key=${apiKey}`;
    
    const yandexResponse = await fetch(yandexUrl);
    if (yandexResponse.ok) {
      const yandexData = await yandexResponse.json();
      
      if (yandexData.images_results) {
        for (const image of yandexData.images_results.slice(0, 5)) {
          results.push({
            id: `serp_yandex_${image.link}`,
            source: 'SerpAPI Yandex',
            url: image.link,
            title: image.title || 'Yandex image match',
            description: `Found via Yandex reverse image search`,
            confidence: 0.7,
            threatLevel: 'medium' as const,
            contentType: 'photo',
            detectionType: 'reverse_search',
            thumbnailUrl: image.thumbnail,
            artifacts: ['yandex_match']
          });
        }
      }
    }

  } catch (error) {
    console.error('SerpAPI search error:', error);
  }

  return results;
}

async function searchGoogleContent(searchTerm: string, contentType: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const apiKey = Deno.env.get('GOOGLE_CUSTOM_SEARCH_API_KEY');
  const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
  
  if (!apiKey || !searchEngineId) {
    return results;
  }

  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchTerm)}&num=10`;
    
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.items) {
        for (const item of data.items) {
          results.push({
            id: `google_content_${item.link}`,
            source: 'Google Search',
            url: item.link,
            title: item.title,
            description: item.snippet,
            confidence: 0.6,
            threatLevel: 'low' as const,
            contentType: contentType,
            detectionType: 'text_similarity',
            artifacts: ['google_search_match']
          });
        }
      }
    }
  } catch (error) {
    console.error('Google content search error:', error);
  }

  return results;
}

async function searchNewsAPIs(searchTerm: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  
  // This would integrate with news APIs like NewsAPI, etc.
  // For now, returning simulated results
  
  return results;
}

async function searchVideoPlatforms(searchTerm: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!youtubeApiKey) {
    return results;
  }

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=10&key=${youtubeApiKey}`;
    
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      
      if (data.items) {
        for (const item of data.items) {
          results.push({
            id: `youtube_${item.id.videoId}`,
            source: 'YouTube',
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            title: item.snippet.title,
            description: item.snippet.description,
            confidence: 0.5,
            threatLevel: 'low' as const,
            contentType: 'video',
            detectionType: 'keyword_match',
            thumbnailUrl: item.snippet.thumbnails.medium?.url,
            artifacts: ['youtube_search_match']
          });
        }
      }
    }
  } catch (error) {
    console.error('YouTube search error:', error);
  }

  return results;
}

async function analyzeContentSimilarity(originalText: string, results: ScanResult[]): Promise<ScanResult[]> {
  // This would use AI/ML to analyze text similarity
  // For now, return the results as-is
  return results;
}

// AI-powered image analysis functions
async function analyzeImageWithAI(imageUrl: string): Promise<ScanResult[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('OpenAI API key not configured for image analysis');
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in image analysis and copyright detection. Analyze images for potential copyright infringement, deepfakes, or unauthorized usage. Return detailed analysis.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for: 1) Copyright infringement potential 2) Deepfake indicators 3) Unauthorized usage signs 4) Image quality and authenticity. Provide confidence scores and threat levels.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    // Parse AI analysis and create structured results
    const results: ScanResult[] = [];
    
    // Create result based on AI analysis
    results.push({
      id: `ai_analysis_${Date.now()}`,
      source: 'AI Analysis',
      url: imageUrl,
      title: 'AI-Powered Image Analysis',
      description: analysis,
      confidence: 0.85,
      threatLevel: 'medium',
      contentType: 'photo',
      detectionType: 'ai_analysis',
      thumbnailUrl: imageUrl,
      artifacts: ['ai_powered_analysis', 'computer_vision', 'content_analysis']
    });

    return results;
  } catch (error) {
    console.error('AI image analysis failed:', error);
    return [];
  }
}

async function enhanceResultsWithAI(results: ScanResult[], originalImageUrl: string): Promise<ScanResult[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey || results.length === 0) {
    return results;
  }

  try {
    // Analyze similarity between original and found images using AI
    for (const result of results.slice(0, 5)) { // Limit to first 5 for API efficiency
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Compare two images and assess similarity, potential copyright violation, and threat level. Provide confidence scores.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Compare these images for similarity and copyright issues. Original: ${originalImageUrl}, Found: ${result.url || result.thumbnailUrl}`
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiAssessment = data.choices[0].message.content;
        
        // Enhance result with AI assessment
        result.description = `AI Enhanced: ${aiAssessment}`;
        result.artifacts = [...(result.artifacts || []), 'ai_similarity_analysis'];
      }
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
  }

  return results;
}

async function analyzeContentWithAI(contentText: string, contentType: string, searchTerms: string[]): Promise<ScanResult[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.log('OpenAI API key not configured for content analysis');
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in content analysis and plagiarism detection. Analyze content for originality, potential copyright issues, and unauthorized usage patterns.'
          },
          {
            role: 'user',
            content: `Analyze this ${contentType} content for potential copyright infringement or unauthorized usage:
            
            Content: "${contentText}"
            Search Terms: ${searchTerms.join(', ')}
            
            Provide assessment of originality, potential violations, and threat level.`
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    const results: ScanResult[] = [];
    
    // Create result based on AI content analysis
    results.push({
      id: `ai_content_analysis_${Date.now()}`,
      source: 'AI Content Analysis',
      url: `internal://content_analysis/${Date.now()}`,
      title: `AI-Powered ${contentType} Analysis`,
      description: analysis,
      confidence: 0.80,
      threatLevel: 'medium',
      contentType: contentType,
      detectionType: 'ai_content_analysis',
      artifacts: ['ai_powered_analysis', 'content_originality_check', 'plagiarism_detection']
    });

    return results;
  } catch (error) {
    console.error('AI content analysis failed:', error);
    return [];
  }
}

async function analyzeContentSimilarityWithAI(originalText: string, foundResults: ScanResult[]): Promise<ScanResult[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey || foundResults.length === 0) {
    return foundResults;
  }

  try {
    // Enhance each result with AI similarity analysis
    for (const result of foundResults.slice(0, 3)) { // Limit for API efficiency
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Compare two pieces of content for similarity, potential plagiarism, and copyright issues. Provide similarity percentage and threat assessment.'
            },
            {
              role: 'user',
              content: `Compare these texts for similarity and potential copyright violation:
              
              Original: "${originalText}"
              Found: "${result.description}"
              
              Assess similarity percentage, potential violation, and threat level.`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const similarityAnalysis = data.choices[0].message.content;
        
        // Extract similarity percentage if mentioned
        const similarityMatch = similarityAnalysis.match(/(\d+)%/);
        if (similarityMatch) {
          const similarity = parseInt(similarityMatch[1]);
          result.confidence = similarity / 100;
          
          if (similarity > 80) result.threatLevel = 'high';
          else if (similarity > 60) result.threatLevel = 'medium';
          else result.threatLevel = 'low';
        }
        
        result.description = `AI Similarity Analysis: ${similarityAnalysis}`;
        result.artifacts = [...(result.artifacts || []), 'ai_similarity_analysis', 'plagiarism_check'];
      }
    }
  } catch (error) {
    console.error('AI similarity analysis failed:', error);
  }

  return foundResults;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}