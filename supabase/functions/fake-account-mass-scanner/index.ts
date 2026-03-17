import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FakeAccountDetection {
  platform: string
  account_handle: string
  account_url: string
  confidence_score: number
  threat_level: string
  artifacts_detected: string[]
  profile_image_url?: string
  follower_count?: number
  creation_date?: string
  suspicious_patterns: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json().catch(() => ({}));
    const targetPlatforms = body.platforms || ['instagram', 'twitter', 'facebook', 'tiktok'];
    const searchQuery = body.searchQuery || body.artistName || '';

    if (!searchQuery) {
      return new Response(JSON.stringify({ error: 'searchQuery or artistName is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting real fake account detection for "${searchQuery}" on ${targetPlatforms.join(', ')}`)

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const allDetections: FakeAccountDetection[] = [];
    let totalScanned = 0;

    for (const platform of targetPlatforms) {
      const detections = await scanPlatformForFakes(platform, searchQuery, serpApiKey, openaiKey);
      allDetections.push(...detections);
      totalScanned += detections.length > 0 ? 50 : 20; // estimate of profiles checked
    }

    // Store detections
    if (allDetections.length > 0) {
      await storeFakeAccountDetections(supabase, allDetections);
    }

    // Update monitoring stats
    await supabase.from('realtime_monitoring_stats').insert({
      scan_type: 'fake_account_scan',
      sources_scanned: totalScanned,
      deepfakes_detected: allDetections.length,
      surface_web_scans: targetPlatforms.length,
      dark_web_scans: 0,
      low_threat_count: allDetections.filter(d => d.threat_level === 'low').length,
      medium_threat_count: allDetections.filter(d => d.threat_level === 'medium').length,
      high_threat_count: allDetections.filter(d => d.threat_level === 'high').length,
      timestamp: new Date().toISOString()
    });

    console.log(`Scan complete: ${allDetections.length} suspicious accounts found across ${targetPlatforms.length} platforms`)

    return new Response(JSON.stringify({
      success: true,
      message: `Fake account detection scan completed`,
      scan_details: {
        total_scanned: totalScanned,
        detections_found: allDetections.length,
        platforms: targetPlatforms,
        detections: allDetections.slice(0, 20) // return top 20
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in fake account scanner:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function scanPlatformForFakes(
  platform: string,
  searchQuery: string,
  serpApiKey: string | undefined,
  openaiKey: string | undefined
): Promise<FakeAccountDetection[]> {
  const detections: FakeAccountDetection[] = [];

  // Use SerpAPI to find accounts matching the query on the platform
  if (serpApiKey) {
    try {
      const query = `site:${getPlatformDomain(platform)} "${searchQuery}"`;
      const url = `https://serpapi.com/search?engine=google&q=${encodeURIComponent(query)}&num=10&api_key=${serpApiKey}`;
      const resp = await fetch(url);

      if (resp.ok) {
        const data = await resp.json();
        const results = data.organic_results || [];

        for (const result of results) {
          // Use AI to assess if the account looks fake/impersonating
          const assessment = await assessAccountWithAI(
            openaiKey, searchQuery, platform, result.title, result.snippet, result.link
          );

          if (assessment.isSuspicious) {
            detections.push({
              platform,
              account_handle: extractHandle(result.link, platform) || result.title,
              account_url: result.link,
              confidence_score: assessment.confidence,
              threat_level: assessment.confidence > 0.85 ? 'high' : assessment.confidence > 0.7 ? 'medium' : 'low',
              artifacts_detected: assessment.artifacts,
              follower_count: undefined,
              creation_date: undefined,
              suspicious_patterns: assessment.patterns
            });
          }
        }
      }
    } catch (e) {
      console.error(`SerpAPI search error for ${platform}:`, e);
    }
  }

  return detections;
}

function getPlatformDomain(platform: string): string {
  const domains: Record<string, string> = {
    instagram: 'instagram.com',
    twitter: 'twitter.com OR site:x.com',
    facebook: 'facebook.com',
    tiktok: 'tiktok.com',
    youtube: 'youtube.com',
    linkedin: 'linkedin.com'
  };
  return domains[platform] || `${platform}.com`;
}

function extractHandle(url: string, platform: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      return parts[0].startsWith('@') ? parts[0] : `@${parts[0]}`;
    }
  } catch {}
  return null;
}

async function assessAccountWithAI(
  apiKey: string | undefined,
  originalName: string,
  platform: string,
  title: string,
  snippet: string,
  url: string
): Promise<{ isSuspicious: boolean; confidence: number; artifacts: string[]; patterns: string[] }> {
  if (!apiKey) {
    // Without AI, do basic heuristic: check if the title/snippet suggests impersonation
    const lower = (title + ' ' + snippet).toLowerCase();
    const original = originalName.toLowerCase();
    const hasName = lower.includes(original);
    const hasImpersonationSignals = /fan|tribute|parody|fake|unofficial|not.real/i.test(lower);
    const hasSuspiciousPatterns = /\d{4,}|_official|_real|\.art\./.test(title);

    if (hasName && (hasImpersonationSignals || hasSuspiciousPatterns)) {
      return {
        isSuspicious: true,
        confidence: 0.6,
        artifacts: ['name_similarity'],
        patterns: hasImpersonationSignals ? ['impersonation_keywords'] : ['suspicious_username_pattern']
      };
    }
    return { isSuspicious: false, confidence: 0, artifacts: [], patterns: [] };
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You detect fake/impersonation accounts on social media. Return ONLY JSON: {"isSuspicious": bool, "confidence": 0.0-1.0, "artifacts": ["list"], "patterns": ["list"]}'
        }, {
          role: 'user',
          content: `Is this ${platform} account potentially impersonating or faking being "${originalName}"?\nAccount title: ${title}\nSnippet: ${snippet}\nURL: ${url}`
        }],
        max_tokens: 150,
        temperature: 0.1
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isSuspicious: !!parsed.isSuspicious,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
          artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
          patterns: Array.isArray(parsed.patterns) ? parsed.patterns : []
        };
      }
    }
  } catch (e) {
    console.error('AI assessment error:', e);
  }

  return { isSuspicious: false, confidence: 0, artifacts: [], patterns: [] };
}

async function storeFakeAccountDetections(supabase: any, detections: FakeAccountDetection[]) {
  try {
    const results = detections.map(detection => ({
      account_id: 'system-scan',
      scan_id: crypto.randomUUID(),
      detection_type: 'fake_account',
      confidence_score: detection.confidence_score,
      threat_level: detection.threat_level,
      content_type: 'profile',
      content_url: detection.account_url,
      content_title: `Suspicious Account: ${detection.account_handle}`,
      content_description: `Platform: ${detection.platform}, Patterns: ${detection.suspicious_patterns.join(', ')}`,
      artifacts_detected: detection.artifacts_detected,
      is_reviewed: false,
      detected_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('social_media_monitoring_results').insert(results)
    if (error) console.error('Error storing detections:', error)
    else console.log(`Stored ${results.length} fake account detections`)
  } catch (error) {
    console.error('Error in storeFakeAccountDetections:', error)
  }
}
