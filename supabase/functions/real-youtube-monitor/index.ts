import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeSearchResult {
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId?: string;
      channelId?: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
    };
  }>;
}

interface MonitoringRequest {
  accountId: string;
  searchTerms: string[];
  originalContent?: {
    title: string;
    description: string;
    thumbnailUrl: string;
  };
}

function validateInput(data: any): MonitoringRequest {
  if (!data.accountId || typeof data.accountId !== 'string') {
    throw new Error('Valid accountId is required');
  }
  
  if (!data.searchTerms || !Array.isArray(data.searchTerms) || data.searchTerms.length === 0) {
    throw new Error('searchTerms array is required');
  }

  return {
    accountId: data.accountId,
    searchTerms: data.searchTerms,
    originalContent: data.originalContent
  };
}

async function searchYouTube(query: string, apiKey: string): Promise<YouTubeSearchResult> {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=50&key=${apiKey}`;
  
  console.log(`Searching YouTube for: ${query}`);
  
  const response = await fetch(searchUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`YouTube API error: ${response.status} - ${errorText}`);
    throw new Error(`YouTube API error: ${response.status}`);
  }
  
  return await response.json();
}

async function analyzeVideoForInfringement(video: any, originalContent: any, supabase: any, accountId: string, scanId: string) {
  const titleSimilarity = calculateStringSimilarity(video.snippet.title, originalContent?.title || '');
  const descSimilarity = calculateStringSimilarity(video.snippet.description, originalContent?.description || '');
  
  // Consider it a potential match if title similarity > 70% or description similarity > 60%
  const isMatch = titleSimilarity > 0.7 || descSimilarity > 0.6;
  
  if (isMatch) {
    const confidence = Math.max(titleSimilarity, descSimilarity) * 100;
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
    
    console.log(`Potential copyright match found: ${video.snippet.title} (${confidence.toFixed(1)}% confidence)`);
    
    // Insert detection result
    const { error } = await supabase
      .from('social_media_monitoring_results')
      .insert({
        account_id: accountId,
        scan_id: scanId,
        detection_type: 'copyright',
        threat_level: confidence > 85 ? 'high' : confidence > 70 ? 'medium' : 'low',
        confidence_score: confidence / 100,
        content_type: 'video',
        content_url: videoUrl,
        content_title: video.snippet.title,
        content_description: video.snippet.description,
        thumbnail_url: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        artifacts_detected: ['title_similarity', 'content_similarity'],
        detected_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error inserting detection result:', error);
    }
    
    return {
      detected: true,
      confidence: confidence,
      videoUrl: videoUrl,
      title: video.snippet.title
    };
  }
  
  return { detected: false };
}

function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
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

    // Get YouTube API key
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const requestData = await req.json();
    const { accountId, searchTerms, originalContent } = validateInput(requestData);

    console.log(`Starting YouTube monitoring for account: ${accountId}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('social_media_scans')
      .insert({
        account_id: accountId,
        scan_type: 'full',
        status: 'running'
      })
      .select()
      .single();

    if (scanError || !scan) {
      throw new Error('Failed to create scan record');
    }

    console.log(`Created scan record: ${scan.id}`);

    let totalVideosScanned = 0;
    let detectionsFound = 0;
    const detections: any[] = [];

    // Search for each term
    for (const searchTerm of searchTerms) {
      try {
        const searchResults = await searchYouTube(searchTerm, youtubeApiKey);
        console.log(`Found ${searchResults.items.length} videos for search term: ${searchTerm}`);
        
        totalVideosScanned += searchResults.items.length;

        // Analyze each video
        for (const video of searchResults.items) {
          if (video.id.videoId) {
            const analysis = await analyzeVideoForInfringement(
              video, 
              originalContent, 
              supabase, 
              accountId, 
              scan.id
            );
            
            if (analysis.detected) {
              detectionsFound++;
              detections.push({
                title: analysis.title,
                url: analysis.videoUrl,
                confidence: analysis.confidence
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for term "${searchTerm}":`, error);
      }
    }

    // Update scan completion
    const { error: updateError } = await supabase
      .from('social_media_scans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        content_scanned: totalVideosScanned,
        detections_found: detectionsFound
      })
      .eq('id', scan.id);

    if (updateError) {
      console.error('Error updating scan record:', updateError);
    }

    // Update account last scan time
    await supabase
      .from('social_media_accounts')
      .update({ last_scan_at: new Date().toISOString() })
      .eq('id', accountId);

    console.log(`YouTube monitoring completed: ${totalVideosScanned} videos scanned, ${detectionsFound} detections found`);

    return new Response(JSON.stringify({
      success: true,
      scanId: scan.id,
      videosScanned: totalVideosScanned,
      detectionsFound: detectionsFound,
      detections: detections.slice(0, 10), // Return first 10 for preview
      message: `Scanned ${totalVideosScanned} YouTube videos and found ${detectionsFound} potential copyright matches`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('YouTube monitoring error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to perform YouTube monitoring'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});