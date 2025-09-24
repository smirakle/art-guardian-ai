import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Known AI training crawlers (updated list)
const AI_CRAWLERS = [
  'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai', 'claude-web',
  'bingbot', 'google-extended', 'facebookexternalhit', 'twitterbot',
  'meta-externalagent', 'bytespider', 'yandexbot', 'applebot',
  'amazonbot', 'duckduckbot', 'ia_archiver', 'archive.org_bot',
  'wayback', 'common-crawl', 'datacollector', 'ai2bot', 'ai-crawler',
  'llmbot', 'trainbot', 'datasetbot', 'scraperbot', 'contentbot',
  'perplexitybot', 'claudebot', 'openaibot', 'copilotbot', 'geminibot'
];

// Suspicious patterns indicating AI training crawlers
const SUSPICIOUS_PATTERNS = [
  /crawl/i, /bot/i, /spider/i, /scraper/i, /harvest/i, /collect/i,
  /train/i, /learn/i, /ai/i, /ml/i, /dataset/i, /data/i, /index/i,
  /archive/i, /mirror/i, /download/i, /fetch/i, /extract/i
];

interface CrawlerBlockingOptions {
  blockingLevel: 'basic' | 'advanced' | 'maximum';
  allowedCrawlers: string[];
  blockedCrawlers: string[];
  rateLimit: {
    requestsPerMinute: number;
    banDuration: number;
  };
  userAgentBlocking: boolean;
  ipBlocking: boolean;
  realTimeBlocking: boolean;
  respectRobotsTxt: boolean;
  aiCrawlerBlocking: boolean;
}

// In-memory rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, number[]>();
const blockedIPs = new Set<string>();

function detectCrawler(userAgent: string, headers: Headers) {
  const ua = userAgent.toLowerCase();
  let crawlerType = 'unknown';
  let isCrawler = false;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let blockingReason = '';

  // Check against known AI crawlers
  for (const aiCrawler of AI_CRAWLERS) {
    if (ua.includes(aiCrawler.toLowerCase())) {
      isCrawler = true;
      crawlerType = aiCrawler;
      riskLevel = 'critical';
      blockingReason = 'Known AI training crawler';
      break;
    }
  }

  // Check suspicious patterns
  if (!isCrawler) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(ua)) {
        isCrawler = true;
        crawlerType = 'suspicious';
        riskLevel = 'high';
        blockingReason = 'Suspicious crawler pattern detected';
        break;
      }
    }
  }

  return {
    isCrawler,
    crawlerType,
    userAgent,
    riskLevel,
    blockingReason
  };
}

function checkRateLimit(ipAddress: string, requestsPerMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - (60 * 1000); // 1 minute window

  let requests = rateLimitStore.get(ipAddress) || [];
  requests = requests.filter(timestamp => timestamp > windowStart);

  if (requests.length >= requestsPerMinute) {
    return true; // Rate limit exceeded
  }

  requests.push(now);
  rateLimitStore.set(ipAddress, requests);
  return false;
}

function generateRobotsTxt(options: CrawlerBlockingOptions): string {
  let robotsTxt = `# Production Robots.txt - AI Training Protection
# Generated on ${new Date().toISOString()}

# Block all AI training crawlers
`;

  // Block known AI crawlers
  AI_CRAWLERS.forEach(crawler => {
    robotsTxt += `User-agent: ${crawler}\n`;
    robotsTxt += `Disallow: /\n`;
    robotsTxt += `Crawl-delay: 86400\n\n`;
  });

  // Block common data collection bots
  robotsTxt += `# Block data collection and training bots
User-agent: *bot*
Disallow: /api/
Disallow: /upload/
Disallow: /protected/
Crawl-delay: 10

# AI Training Prevention
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Allow legitimate crawlers with restrictions
`;

  if (options.allowedCrawlers.length > 0) {
    options.allowedCrawlers.forEach(crawler => {
      robotsTxt += `User-agent: ${crawler}\n`;
      robotsTxt += `Allow: /\n`;
      robotsTxt += `Crawl-delay: 1\n\n`;
    });
  }

  return robotsTxt;
}

function generateAiTxt(options: CrawlerBlockingOptions): string {
  return `# AI.txt - AI Training Policy
# This file specifies how AI systems may interact with this site
# Generated on ${new Date().toISOString()}

User-Agent: *
Disallow-Training: /
Disallow-Derivatives: /
Disallow-Commercial: ${options.aiCrawlerBlocking ? '/' : 'false'}

# Explicit AI Training Prohibition
Policy: NO AI TRAINING - This website and all its content, including but not limited to text, images, videos, audio, code, and metadata, are strictly prohibited from being used for artificial intelligence training, machine learning model development, dataset creation, or any form of automated content analysis for AI system improvement.

# Legal Notice
Legal: Unauthorized use of this content for AI training may result in legal action under copyright, trademark, and privacy laws. Commercial use of AI models trained on this content is explicitly prohibited.

# Contact Information
Contact: legal@example.com
Rights-Holder: Content Owner
Enforcement: DMCA + Legal Action

# Technical Implementation
Robots-Directive: noai, noimageai, noindex, nofollow, noarchive, nosnippet
Cache-Control: no-store, no-cache, must-revalidate
X-Robots-Tag: noai, noimageai

# Compliance
Last-Updated: ${new Date().toISOString()}
Version: 2.0
Standard: AI-TXT-2024
`;
}

function generateBlockingResponse(crawlerType: string, blockingReason: string): Response {
  const blockingPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Access Denied - AI Training Protection</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noai, noimageai">
</head>
<body>
    <h1>Access Denied</h1>
    <p>This content is protected against AI training and unauthorized crawling.</p>
    <p>Detected: ${crawlerType}</p>
    <p>Reason: ${blockingReason}</p>
    <p>For legitimate access, please contact the site administrator.</p>
</body>
</html>`;

  return new Response(blockingPage, {
    status: 403,
    headers: {
      'Content-Type': 'text/html',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noai, noimageai',
      'X-AI-Training': 'prohibited',
      'Cache-Control': 'no-store',
      ...corsHeaders
    }
  });
}

serve(async (req) => {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

  console.log(`Request: ${req.method} ${url.pathname} from ${ipAddress} with UA: ${userAgent}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Default crawler blocking options (can be customized via request body)
    let options: CrawlerBlockingOptions = {
      blockingLevel: 'advanced',
      allowedCrawlers: ['googlebot', 'bingbot'],
      blockedCrawlers: [],
      rateLimit: {
        requestsPerMinute: 60,
        banDuration: 3600
      },
      userAgentBlocking: true,
      ipBlocking: true,
      realTimeBlocking: true,
      respectRobotsTxt: true,
      aiCrawlerBlocking: true
    };

    // Allow customization via POST request
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.options) {
          options = { ...options, ...body.options };
        }
      } catch (e) {
        console.log('No valid JSON body provided, using defaults');
      }
    }

    // Serve robots.txt
    if (url.pathname === '/robots.txt') {
      const robotsTxt = generateRobotsTxt(options);
      return new Response(robotsTxt, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600',
          ...corsHeaders
        }
      });
    }

    // Serve ai.txt
    if (url.pathname === '/ai.txt') {
      const aiTxt = generateAiTxt(options);
      return new Response(aiTxt, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600',
          ...corsHeaders
        }
      });
    }

    // Check if IP is already blocked
    if (blockedIPs.has(ipAddress)) {
      console.log(`Blocked IP ${ipAddress} attempting access`);
      return generateBlockingResponse('blocked-ip', 'IP address is blocked');
    }

    // Rate limiting check
    const rateLimitExceeded = checkRateLimit(ipAddress, options.rateLimit.requestsPerMinute);
    if (rateLimitExceeded) {
      console.log(`Rate limit exceeded for ${ipAddress}`);
      blockedIPs.add(ipAddress);
      // Remove from blocked list after ban duration
      setTimeout(() => {
        blockedIPs.delete(ipAddress);
      }, options.rateLimit.banDuration * 1000);
      
      return generateBlockingResponse('rate-limit', 'Rate limit exceeded');
    }

    // Crawler detection
    const detection = detectCrawler(userAgent, req.headers);

    // Determine if should block based on options
    let shouldBlock = false;
    
    if (detection.isCrawler) {
      switch (options.blockingLevel) {
        case 'maximum':
          shouldBlock = detection.riskLevel !== 'low';
          break;
        case 'advanced':
          shouldBlock = detection.riskLevel === 'critical' || detection.riskLevel === 'high';
          break;
        case 'basic':
          shouldBlock = detection.riskLevel === 'critical';
          break;
      }

      // Check if it's an allowed crawler
      const isAllowed = options.allowedCrawlers.some(crawler => 
        userAgent.toLowerCase().includes(crawler.toLowerCase())
      );
      
      if (isAllowed) {
        shouldBlock = false;
      }
    }

    if (shouldBlock && options.realTimeBlocking) {
      console.log(`Blocking crawler: ${detection.crawlerType} from ${ipAddress}`);
      if (options.ipBlocking) {
        blockedIPs.add(ipAddress);
      }
      return generateBlockingResponse(detection.crawlerType, detection.blockingReason);
    }

    // Return crawler analysis result
    return new Response(
      JSON.stringify({
        success: true,
        blocked: shouldBlock,
        crawlerInfo: detection,
        ipAddress,
        timestamp: new Date().toISOString(),
        rateLimitStatus: {
          requests: rateLimitStore.get(ipAddress)?.length || 0,
          limit: options.rateLimit.requestsPerMinute
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
          'X-AI-Training': 'prohibited',
          'X-Content-Protection': 'active',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Crawler protection error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});