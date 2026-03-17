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

interface DetectionResult {
  contentType: string;
  contentUrl: string;
  contentTitle: string;
  contentDescription: string;
  thumbnailUrl: string;
  detectionType: string;
  confidence: number;
  threatLevel: string;
  artifacts: string[];
  platform: string;
}

interface SerpResult {
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
  position: number;
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

// ─── SerpAPI: Real platform search ───────────────────────────────────────────

async function searchPlatformViaSerpAPI(
  platform: string,
  handle: string,
  displayName: string | null,
  serpApiKey: string,
  maxResults: number = 20
): Promise<SerpResult[]> {
  const siteMap: Record<string, string> = {
    facebook: 'site:facebook.com',
    instagram: 'site:instagram.com',
    tiktok: 'site:tiktok.com',
    twitter: 'site:twitter.com OR site:x.com',
    youtube: 'site:youtube.com',
  };

  const siteFilter = siteMap[platform.toLowerCase()] || '';
  const nameClause = displayName ? ` OR "${displayName}"` : '';
  const query = `${siteFilter} "${handle}"${nameClause}`;

  console.log(`[SerpAPI] Searching: ${query}`);

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('num', String(maxResults));
  url.searchParams.set('api_key', serpApiKey);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    const body = await resp.text();
    console.error(`[SerpAPI] Error ${resp.status}: ${body}`);
    throw new Error(`SerpAPI request failed: ${resp.status}`);
  }

  const data = await resp.json();
  const organic: any[] = data.organic_results || [];

  return organic.map((r: any) => ({
    title: r.title || '',
    link: r.link || '',
    snippet: r.snippet || '',
    thumbnail: r.thumbnail || r.rich_snippet?.top?.detected_extensions?.thumbnail || '',
    position: r.position || 0,
  }));
}

// ─── OpenAI: Classify a single search result ────────────────────────────────

async function classifyThreatWithAI(
  result: SerpResult,
  handle: string,
  platform: string,
  openaiKey: string
): Promise<{ type: string; confidence: number; threatLevel: string; reasoning: string } | null> {
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `You are an expert IP-violation and impersonation analyst. Given a search result about a social-media handle, classify it strictly as JSON. Only flag genuine violations — NOT the original account's own content. Return exactly: {"type":"copyright"|"impersonation"|"identity_theft"|"deepfake"|"benign","confidence":0.0-1.0,"threat_level":"low"|"medium"|"high","reasoning":"<1 sentence>"}`
          },
          {
            role: 'user',
            content: `Platform: ${platform}\nProtected handle: @${handle}\nSearch result title: ${result.title}\nURL: ${result.link}\nSnippet: ${result.snippet}\n\nIs this result an IP violation, impersonation, or identity theft targeting @${handle}? Or is it benign / the original account's own content?`
          }
        ],
      }),
    });

    if (!resp.ok) {
      console.error(`[OpenAI] classify error ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || '';
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.type === 'benign') return null;

    return {
      type: parsed.type || 'copyright',
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      threatLevel: parsed.threat_level || 'medium',
      reasoning: parsed.reasoning || '',
    };
  } catch (e) {
    console.error('[OpenAI] classify parse error:', e);
    return null;
  }
}

// ─── Core: Analyse a platform using real data ────────────────────────────────

async function analysePlatformReal(
  account: any,
  serpApiKey: string,
  openaiKey: string | null
): Promise<{ contentScanned: number; detections: DetectionResult[] }> {
  const platform = account.platform.toLowerCase();
  const handle = account.account_handle;
  const displayName = account.account_name || null;

  // Step 1 — real web search
  let results: SerpResult[] = [];
  try {
    results = await searchPlatformViaSerpAPI(platform, handle, displayName, serpApiKey);
  } catch (e) {
    console.error(`[${platform}] SerpAPI search failed:`, e);
    return { contentScanned: 0, detections: [] };
  }

  const contentScanned = results.length;
  console.log(`[${platform}] Found ${contentScanned} search results for @${handle}`);

  if (contentScanned === 0) {
    return { contentScanned: 0, detections: [] };
  }

  // Step 2 — classify each result with AI (or skip if no key)
  const detections: DetectionResult[] = [];

  for (const result of results) {
    if (openaiKey) {
      const classification = await classifyThreatWithAI(result, handle, platform, openaiKey);
      if (classification) {
        detections.push({
          contentType: inferContentType(result.link, platform),
          contentUrl: result.link,
          contentTitle: result.title,
          contentDescription: `${classification.reasoning} (Source: ${result.snippet})`,
          thumbnailUrl: result.thumbnail || '',
          detectionType: classification.type,
          confidence: classification.confidence,
          threatLevel: classification.threatLevel,
          artifacts: [`SerpAPI position #${result.position}`, `AI classification: ${classification.type}`, classification.reasoning],
          platform,
        });
      }
    } else {
      // Without OpenAI, flag results that look suspicious based on heuristics
      const heuristic = heuristicClassify(result, handle);
      if (heuristic) {
        detections.push({
          contentType: inferContentType(result.link, platform),
          contentUrl: result.link,
          contentTitle: result.title,
          contentDescription: result.snippet,
          thumbnailUrl: result.thumbnail || '',
          detectionType: heuristic.type,
          confidence: heuristic.confidence,
          threatLevel: heuristic.threatLevel,
          artifacts: [`SerpAPI position #${result.position}`, `Heuristic: ${heuristic.reason}`],
          platform,
        });
      }
    }

    // Small delay to respect OpenAI rate limits
    if (openaiKey) await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[${platform}] ${detections.length} real violations detected out of ${contentScanned} results`);
  return { contentScanned, detections };
}

// ─── Heuristic classifier (no OpenAI fallback) ──────────────────────────────

function heuristicClassify(result: SerpResult, handle: string): { type: string; confidence: number; threatLevel: string; reason: string } | null {
  const title = result.title.toLowerCase();
  const snippet = result.snippet.toLowerCase();
  const combined = title + ' ' + snippet;
  const handleLower = handle.toLowerCase().replace('@', '');

  // Skip results that are clearly the original account
  if (result.link.toLowerCase().includes(`/${handleLower}`) && !combined.includes('fake') && !combined.includes('scam')) {
    return null;
  }

  if (combined.includes('fake') || combined.includes('scam') || combined.includes('impersonat')) {
    return { type: 'impersonation', confidence: 0.6, threatLevel: 'medium', reason: 'Keywords: fake/scam/impersonation detected' };
  }
  if (combined.includes('stolen') || combined.includes('without permission') || combined.includes('unauthorized')) {
    return { type: 'copyright', confidence: 0.55, threatLevel: 'medium', reason: 'Keywords: stolen/unauthorized content' };
  }
  if (combined.includes('deepfake') || combined.includes('ai generated') || combined.includes('synthetic')) {
    return { type: 'deepfake', confidence: 0.65, threatLevel: 'high', reason: 'Keywords: deepfake/AI-generated' };
  }
  if (combined.includes('identity') && (combined.includes('theft') || combined.includes('fraud'))) {
    return { type: 'identity_theft', confidence: 0.6, threatLevel: 'high', reason: 'Keywords: identity theft/fraud' };
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferContentType(url: string, platform: string): string {
  const u = url.toLowerCase();
  if (u.includes('/video') || u.includes('/watch') || u.includes('/reel')) return 'video';
  if (u.includes('/photo') || u.includes('/image')) return 'image';
  if (u.includes('/story') || u.includes('/stories')) return 'story';
  if (u.includes('/live')) return 'live';
  if (platform === 'youtube') return 'video';
  if (platform === 'tiktok') return 'video';
  return 'post';
}

// ─── Main handler ────────────────────────────────────────────────────────────

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

    // Check for required API keys
    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!serpApiKey) {
      console.error('SERPAPI_KEY is not configured — cannot perform real monitoring');
      return new Response(JSON.stringify({
        success: false,
        error: 'SERPAPI_KEY not configured. Real monitoring requires a SerpAPI key.',
        contentScanned: 0, detectionsFound: 0, detections: [],
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!openaiKey) {
      console.warn('OPENAI_API_KEY not configured — using heuristic classification instead of AI');
    }

    console.log(`Starting REAL social media monitoring for account: ${accountId}, type: ${scanType}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts').select('*').eq('id', accountId).single();

    if (accountError) {
      await logSecurityEvent(supabase, null, 'monitoring_account_not_found', { accountId, error: accountError.message }, req);
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    await logSecurityEvent(supabase, account.user_id, 'monitoring_scan_started', { accountId, scanType, platform: account.platform }, req);

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('social_media_scans')
      .insert({ account_id: accountId, scan_type: scanType, status: 'running', started_at: new Date().toISOString() })
      .select().single();

    if (scanError) throw new Error(`Failed to create scan record: ${scanError.message}`);

    console.log(`Created scan record: ${scan.id} for @${account.account_handle} on ${account.platform}`);

    // ── YouTube: delegate to dedicated monitor if available ──
    let analysisResults: { contentScanned: number; detections: DetectionResult[] };

    if (account.platform.toLowerCase() === 'youtube') {
      try {
        const { data: ytResp, error: ytErr } = await supabase.functions.invoke('real-youtube-monitor', {
          body: {
            accountId: account.id,
            searchTerms: [account.account_handle, account.account_name].filter(Boolean),
            originalContent: { title: account.account_name || account.account_handle, description: `Official ${account.account_handle} content`, thumbnailUrl: null }
          }
        });
        if (ytErr) throw ytErr;
        analysisResults = { contentScanned: ytResp.videosScanned || 0, detections: ytResp.detections || [] };
      } catch (e) {
        console.warn('YouTube dedicated monitor failed, falling back to SerpAPI:', e);
        analysisResults = await analysePlatformReal(account, serpApiKey, openaiKey || null);
      }
    } else {
      // ── All other platforms: SerpAPI + OpenAI ──
      analysisResults = await analysePlatformReal(account, serpApiKey, openaiKey || null);
    }

    // Store detections in DB
    for (const detection of analysisResults.detections) {
      const { error: detErr } = await supabase.from('social_media_monitoring_results').insert({
        account_id: account.id, scan_id: scan.id,
        content_type: detection.contentType, content_url: detection.contentUrl,
        content_title: detection.contentTitle, content_description: detection.contentDescription,
        thumbnail_url: detection.thumbnailUrl, detection_type: detection.detectionType,
        confidence_score: detection.confidence, threat_level: detection.threatLevel,
        artifacts_detected: detection.artifacts, detected_at: new Date().toISOString()
      });
      if (detErr) console.error('Error storing detection:', detErr);
    }

    // Update account & scan status
    await supabase.from('social_media_accounts').update({
      verification_status: 'verified', last_scan_at: new Date().toISOString()
    }).eq('id', accountId);

    await supabase.from('social_media_scans').update({
      status: 'completed', content_scanned: analysisResults.contentScanned,
      detections_found: analysisResults.detections.length, completed_at: new Date().toISOString()
    }).eq('id', scan.id);

    console.log(`REAL scan completed: ${analysisResults.contentScanned} items scanned, ${analysisResults.detections.length} violations found`);

    return new Response(JSON.stringify({
      success: true, scanId: scan.id,
      accountHandle: account.account_handle, platform: account.platform,
      contentScanned: analysisResults.contentScanned,
      detectionsFound: analysisResults.detections.length,
      detections: analysisResults.detections.slice(0, 25),
      note: 'Real monitoring via SerpAPI + OpenAI classification'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Social media monitoring error:', error);
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await logSecurityEvent(supabase, null, 'monitoring_scan_error', { error: error.message }, req);
    } catch (_) { /* ignore */ }

    return new Response(JSON.stringify({ error: 'Monitoring scan failed', success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
