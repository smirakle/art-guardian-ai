import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitoringRequest {
  accountId: string;
  scanType: 'quick' | 'full';
}

function validateInput(data: any): MonitoringRequest {
  if (!data.accountId || typeof data.accountId !== 'string') {
    throw new Error('Invalid accountId provided');
  }
  const scanType = data.scanType || 'full';
  if (!['quick', 'full'].includes(scanType)) {
    throw new Error('Invalid scanType. Must be "quick" or "full"');
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.accountId)) {
    throw new Error('Invalid accountId format');
  }
  return { accountId: data.accountId, scanType };
}

async function logSecurityEvent(supabase: any, userId: string | null, action: string, details: any, req: Request) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await supabase.from('security_audit_log').insert({
      user_id: userId, action, resource_type: 'social_media_monitoring',
      details, ip_address: ipAddress, user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      await logSecurityEvent(supabase, null, 'invalid_method_attempt', { method: req.method }, req);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    const { accountId, scanType } = validateInput(requestData);

    console.log(`Starting social media monitoring for account: ${accountId}, type: ${scanType}`);

    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts').select('*').eq('id', accountId).single();

    if (accountError) {
      await logSecurityEvent(supabase, null, 'monitoring_account_not_found', { accountId, error: accountError.message }, req);
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    await logSecurityEvent(supabase, account.user_id, 'monitoring_scan_started',
      { accountId, scanType, platform: account.platform }, req);

    const { data: scan, error: scanError } = await supabase
      .from('social_media_scans')
      .insert({ account_id: accountId, scan_type: scanType, status: 'running', started_at: new Date().toISOString() })
      .select().single();

    if (scanError) throw new Error(`Failed to create scan record: ${scanError.message}`);

    // Update account verification status
    await supabase.from('social_media_accounts')
      .update({ verification_status: 'verified', last_scan_at: new Date().toISOString() })
      .eq('id', accountId);

    // Real content analysis using SerpAPI + OpenAI
    const analysisResults = await performRealContentAnalysis(account, scan.id, supabase);

    await supabase.from('social_media_scans').update({
      status: 'completed',
      content_scanned: analysisResults.contentScanned,
      detections_found: analysisResults.detectionsCount,
      completed_at: new Date().toISOString()
    }).eq('id', scan.id);

    console.log(`Scan completed: ${analysisResults.contentScanned} items scanned, ${analysisResults.detectionsCount} detections found`);

    return new Response(JSON.stringify({
      success: true,
      scanId: scan.id,
      accountHandle: account.account_handle,
      platform: account.platform,
      contentScanned: analysisResults.contentScanned,
      detectionsFound: analysisResults.detectionsCount,
      detections: analysisResults.detections
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Social media monitoring error:', error);
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await logSecurityEvent(supabase, null, 'monitoring_scan_error', { error: error.message }, req);
    } catch {}
    return new Response(JSON.stringify({ error: 'Monitoring scan failed', success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performRealContentAnalysis(account: any, scanId: string, supabase: any) {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const detections: any[] = [];
  let contentScanned = 0;

  // Search for the account's content on the web using SerpAPI
  if (serpApiKey) {
    try {
      const query = `site:${getPlatformDomain(account.platform)} "@${account.account_handle}"`;
      const url = `https://serpapi.com/search?engine=google&q=${encodeURIComponent(query)}&num=20&api_key=${serpApiKey}`;
      const resp = await fetch(url);

      if (resp.ok) {
        const data = await resp.json();
        const results = data.organic_results || [];
        contentScanned = results.length;

        // Get user's artworks for comparison
        const { data: artworks } = await supabase
          .from('artwork').select('id, title, file_paths')
          .eq('user_id', account.user_id).limit(10);

        for (const result of results) {
          // Use OpenAI to analyze each result for threats
          const assessment = await assessContentThreat(
            openaiKey, result, account, artworks || []
          );

          if (assessment.isThreat) {
            const detection = {
              account_id: account.id,
              scan_id: scanId,
              content_type: assessment.contentType,
              content_url: result.link,
              content_title: result.title,
              content_description: assessment.description,
              thumbnail_url: result.thumbnail || null,
              detection_type: assessment.detectionType,
              confidence_score: assessment.confidence,
              threat_level: assessment.threatLevel,
              artifacts_detected: assessment.artifacts,
              detected_at: new Date().toISOString()
            };

            const { error } = await supabase.from('social_media_monitoring_results').insert(detection);
            if (!error) {
              detections.push(detection);
              console.log(`Detected ${assessment.detectionType} at ${result.link} (${(assessment.confidence * 100).toFixed(0)}%)`);
            }
          }
        }
      }
    } catch (e) {
      console.error('SerpAPI content search error:', e);
    }
  }

  // Also try Google Lens for image-based monitoring
  if (serpApiKey && account.profile_image_url) {
    try {
      const lensUrl = `https://serpapi.com/search?engine=google_lens&url=${encodeURIComponent(account.profile_image_url)}&api_key=${serpApiKey}`;
      const resp = await fetch(lensUrl);
      if (resp.ok) {
        const data = await resp.json();
        const matches = data.visual_matches || [];
        contentScanned += matches.length;

        for (const match of matches.slice(0, 5)) {
          if (match.link && !match.link.includes(getPlatformDomain(account.platform))) {
            const detection = {
              account_id: account.id,
              scan_id: scanId,
              content_type: 'image',
              content_url: match.link,
              content_title: match.title || 'Profile image found elsewhere',
              content_description: `Profile image of @${account.account_handle} found on ${new URL(match.link).hostname}`,
              thumbnail_url: match.thumbnail || null,
              detection_type: 'impersonation',
              confidence_score: 0.7,
              threat_level: 'medium',
              artifacts_detected: ['profile_image_reuse'],
              detected_at: new Date().toISOString()
            };

            const { error } = await supabase.from('social_media_monitoring_results').insert(detection);
            if (!error) detections.push(detection);
          }
        }
      }
    } catch (e) {
      console.error('Google Lens search error:', e);
    }
  }

  return { contentScanned, detectionsCount: detections.length, detections };
}

function getPlatformDomain(platform: string): string {
  const domains: Record<string, string> = {
    youtube: 'youtube.com', facebook: 'facebook.com',
    instagram: 'instagram.com', tiktok: 'tiktok.com',
    twitter: 'twitter.com', x: 'x.com'
  };
  return domains[platform] || `${platform}.com`;
}

async function assessContentThreat(
  apiKey: string | undefined,
  result: any,
  account: any,
  artworks: any[]
): Promise<{
  isThreat: boolean; contentType: string; detectionType: string;
  confidence: number; threatLevel: string; artifacts: string[]; description: string;
}> {
  const noThreat = { isThreat: false, contentType: 'post', detectionType: 'none', confidence: 0, threatLevel: 'low', artifacts: [], description: '' };

  if (!apiKey) {
    // Basic heuristic without AI
    const text = (result.title + ' ' + (result.snippet || '')).toLowerCase();
    const hasCopyright = /stolen|copied|unauthorized|repost|reupload/i.test(text);
    if (hasCopyright) {
      return {
        isThreat: true, contentType: 'post', detectionType: 'copyright',
        confidence: 0.5, threatLevel: 'low', artifacts: ['keyword_match'],
        description: `Keyword match suggesting potential unauthorized use of @${account.account_handle}'s content`
      };
    }
    return noThreat;
  }

  try {
    const artworkTitles = artworks.map(a => a.title).join(', ');
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You analyze social media content for copyright infringement, deepfakes, and impersonation. Return ONLY JSON: {"isThreat": bool, "contentType": "video|image|post|story", "detectionType": "deepfake|copyright|impersonation|none", "confidence": 0.0-1.0, "threatLevel": "low|medium|high", "artifacts": ["list"], "description": "brief"}'
        }, {
          role: 'user',
          content: `Account: @${account.account_handle} on ${account.platform}\nKnown artworks: ${artworkTitles || 'none'}\nFound content:\nTitle: ${result.title}\nSnippet: ${result.snippet || 'N/A'}\nURL: ${result.link}\n\nIs this a threat to the account owner?`
        }],
        max_tokens: 200,
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
          isThreat: !!parsed.isThreat,
          contentType: parsed.contentType || 'post',
          detectionType: parsed.detectionType || 'none',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
          threatLevel: parsed.threatLevel || 'low',
          artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
          description: parsed.description || ''
        };
      }
    }
  } catch (e) {
    console.error('AI content assessment error:', e);
  }

  return noThreat;
}
