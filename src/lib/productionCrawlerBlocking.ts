/**
 * Production-Ready Web Crawler Blocking System
 * Implements server-side blocking, real-time detection, and compliance
 */

export interface CrawlerBlockingOptions {
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

export interface CrawlerDetectionResult {
  isCrawler: boolean;
  crawlerType: string;
  userAgent: string;
  shouldBlock: boolean;
  blockingReason: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface CrawlerBlockingResult {
  success: boolean;
  blocked: boolean;
  method: string;
  timestamp: string;
  crawlerInfo: CrawlerDetectionResult;
  error?: string;
}

export class ProductionCrawlerBlocking {
  private static instance: ProductionCrawlerBlocking;
  
  // Known AI training crawlers (updated list)
  private static readonly AI_CRAWLERS = [
    'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai', 'claude-web',
    'bingbot', 'google-extended', 'facebookexternalhit', 'twitterbot',
    'meta-externalagent', 'bytespider', 'yandexbot', 'applebot',
    'amazonbot', 'duckduckbot', 'ia_archiver', 'archive.org_bot',
    'wayback', 'common-crawl', 'datacollector', 'ai2bot', 'ai-crawler',
    'llmbot', 'trainbot', 'datasetbot', 'scraperbot', 'contentbot',
    'perplexitybot', 'claudebot', 'openaibot', 'copilotbot', 'geminibot'
  ];

  // Suspicious patterns indicating AI training crawlers
  private static readonly SUSPICIOUS_PATTERNS = [
    /crawl/i, /bot/i, /spider/i, /scraper/i, /harvest/i, /collect/i,
    /train/i, /learn/i, /ai/i, /ml/i, /dataset/i, /data/i, /index/i,
    /archive/i, /mirror/i, /download/i, /fetch/i, /extract/i
  ];

  static getInstance(): ProductionCrawlerBlocking {
    if (!this.instance) {
      this.instance = new ProductionCrawlerBlocking();
    }
    return this.instance;
  }

  /**
   * Analyze request to detect and block crawlers (server-side)
   */
  async analyzeCrawlerRequest(
    userAgent: string,
    ipAddress: string,
    referrer: string,
    requestHeaders: Record<string, string>,
    options: CrawlerBlockingOptions
  ): Promise<CrawlerBlockingResult> {
    // Use server-side edge function for real-time blocking
    try {
      const response = await fetch(`https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/crawler-protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'X-Forwarded-For': ipAddress
        },
        body: JSON.stringify({ options })
      });

      if (!response.ok) {
        throw new Error(`Server-side blocking failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        blocked: result.blocked,
        method: result.blocked ? 'server-side-blocking' : 'allowed',
        timestamp: result.timestamp,
        crawlerInfo: result.crawlerInfo
      };
    } catch (error) {
      // Fallback to client-side detection if server-side fails
      console.warn('Server-side blocking unavailable, falling back to client-side:', error);
      return this.fallbackClientSideAnalysis(userAgent, ipAddress, referrer, requestHeaders, options);
    }
  }

  /**
   * Fallback client-side analysis when server-side is unavailable
   */
  private async fallbackClientSideAnalysis(
    userAgent: string,
    ipAddress: string,
    referrer: string,
    requestHeaders: Record<string, string>,
    options: CrawlerBlockingOptions
  ): Promise<CrawlerBlockingResult> {
    const timestamp = new Date().toISOString();

    try {
      // Detect crawler
      const detection = this.detectCrawler(userAgent, requestHeaders, options);

      // Check rate limiting
      const rateLimitExceeded = await this.checkRateLimit(ipAddress, options.rateLimit);

      // Determine if should block
      const shouldBlock = this.shouldBlockCrawler(detection, rateLimitExceeded, options);

      // Apply blocking if necessary
      if (shouldBlock) {
        await this.applyCrawlerBlocking(detection, ipAddress, options);
        
        return {
          success: true,
          blocked: true,
          method: this.getBlockingMethod(detection, options),
          timestamp,
          crawlerInfo: detection
        };
      }

      return {
        success: true,
        blocked: false,
        method: 'allowed',
        timestamp,
        crawlerInfo: detection
      };

    } catch (error) {
      return {
        success: false,
        blocked: false,
        method: 'error',
        timestamp,
        crawlerInfo: this.getDefaultDetection(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deploy server-side protection files
   */
  async deployServerSideProtection(options: CrawlerBlockingOptions): Promise<{ robotsTxt: string; aiTxt: string }> {
    try {
      // Get server-generated robots.txt
      const robotsResponse = await fetch(`https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/crawler-protection/robots.txt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options })
      });

      // Get server-generated ai.txt
      const aiResponse = await fetch(`https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/crawler-protection/ai.txt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options })
      });

      return {
        robotsTxt: await robotsResponse.text(),
        aiTxt: await aiResponse.text()
      };
    } catch (error) {
      console.error('Server-side deployment failed:', error);
      // Fallback to client-side generation
      return {
        robotsTxt: this.generateProductionRobotsTxt(options),
        aiTxt: this.generateProductionAiTxt(options)
      };
    }
  }

  /**
   * Detect crawler type and characteristics
   */
  private detectCrawler(
    userAgent: string,
    headers: Record<string, string>,
    options: CrawlerBlockingOptions
  ): CrawlerDetectionResult {
    const ua = userAgent.toLowerCase();
    let crawlerType = 'unknown';
    let isCrawler = false;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let blockingReason = '';
    const recommendations: string[] = [];

    // Check against known AI crawlers
    for (const aiCrawler of ProductionCrawlerBlocking.AI_CRAWLERS) {
      if (ua.includes(aiCrawler.toLowerCase())) {
        isCrawler = true;
        crawlerType = aiCrawler;
        riskLevel = 'critical';
        blockingReason = 'Known AI training crawler';
        recommendations.push('Block immediately to prevent AI training data collection');
        break;
      }
    }

    // Check suspicious patterns
    if (!isCrawler) {
      for (const pattern of ProductionCrawlerBlocking.SUSPICIOUS_PATTERNS) {
        if (pattern.test(ua)) {
          isCrawler = true;
          crawlerType = 'suspicious';
          riskLevel = 'high';
          blockingReason = 'Suspicious crawler pattern detected';
          recommendations.push('Monitor closely and consider blocking');
          break;
        }
      }
    }

    // Check for legitimate crawlers that should be allowed
    if (isCrawler && this.isLegitimateAllowedCrawler(ua, options.allowedCrawlers)) {
      riskLevel = 'low';
      blockingReason = 'Legitimate crawler - allowed';
      recommendations.push('Monitor usage patterns');
    }

    // Additional suspicious header analysis
    if (this.hasSuspiciousHeaders(headers)) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
      blockingReason += ' + Suspicious headers detected';
      recommendations.push('Review request headers for anomalies');
    }

    return {
      isCrawler,
      crawlerType,
      userAgent,
      shouldBlock: this.shouldBlockBasedOnDetection(crawlerType, riskLevel, options),
      blockingReason,
      riskLevel,
      recommendations
    };
  }

  /**
   * Check rate limiting for IP address
   */
  private async checkRateLimit(
    ipAddress: string,
    rateLimit: CrawlerBlockingOptions['rateLimit']
  ): Promise<boolean> {
    const key = `rate_limit_${ipAddress}`;
    const now = Date.now();
    const windowStart = now - (60 * 1000); // 1 minute window

    try {
      // Get stored request data (in production, use Redis or similar)
      const storedData = localStorage.getItem(key);
      let requests: number[] = storedData ? JSON.parse(storedData) : [];

      // Filter to current window
      requests = requests.filter(timestamp => timestamp > windowStart);

      // Check if limit exceeded
      if (requests.length >= rateLimit.requestsPerMinute) {
        return true;
      }

      // Add current request
      requests.push(now);
      localStorage.setItem(key, JSON.stringify(requests));

      return false;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  /**
   * Determine if crawler should be blocked
   */
  private shouldBlockCrawler(
    detection: CrawlerDetectionResult,
    rateLimitExceeded: boolean,
    options: CrawlerBlockingOptions
  ): boolean {
    // Always block if rate limit exceeded
    if (rateLimitExceeded) {
      return true;
    }

    // Block based on detection result
    if (detection.shouldBlock) {
      return true;
    }

    // Block based on blocking level
    switch (options.blockingLevel) {
      case 'maximum':
        return detection.isCrawler && detection.riskLevel !== 'low';
      case 'advanced':
        return detection.riskLevel === 'critical' || detection.riskLevel === 'high';
      case 'basic':
        return detection.riskLevel === 'critical';
      default:
        return false;
    }
  }

  /**
   * Apply crawler blocking mechanisms
   */
  private async applyCrawlerBlocking(
    detection: CrawlerDetectionResult,
    ipAddress: string,
    options: CrawlerBlockingOptions
  ): Promise<void> {
    // Log blocking event
    console.log(`Blocking crawler: ${detection.crawlerType} from ${ipAddress}`);

    // Add to blocked IPs list (in production, use database)
    if (options.ipBlocking) {
      const blockedIPs = JSON.parse(localStorage.getItem('blocked_ips') || '[]');
      if (!blockedIPs.includes(ipAddress)) {
        blockedIPs.push({
          ip: ipAddress,
          reason: detection.blockingReason,
          timestamp: new Date().toISOString(),
          crawler: detection.crawlerType
        });
        localStorage.setItem('blocked_ips', JSON.stringify(blockedIPs));
      }
    }

    // Generate crawler blocking response
    this.generateBlockingResponse(detection);
  }

  /**
   * Generate production robots.txt with AI crawler blocking
   */
  generateProductionRobotsTxt(options: CrawlerBlockingOptions): string {
    let robotsTxt = `# Production Robots.txt - AI Training Protection
# Generated on ${new Date().toISOString()}

# Block all AI training crawlers
`;

    // Block known AI crawlers
    ProductionCrawlerBlocking.AI_CRAWLERS.forEach(crawler => {
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

    // Add sitemap and contact info
    robotsTxt += `
# Contact and policies
Sitemap: ${window.location.origin}/sitemap.xml
Contact: ${window.location.origin}/contact

# AI Training Policy
# This site prohibits the use of its content for AI training
# Respect the ai.txt file for AI training policies
`;

    return robotsTxt;
  }

  /**
   * Generate AI.txt file for AI training prohibition
   */
  generateProductionAiTxt(options: CrawlerBlockingOptions): string {
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
Contact: legal@${window.location.hostname}
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

  /**
   * Generate security headers for crawler blocking
   */
  generateSecurityHeaders(options: CrawlerBlockingOptions): Record<string, string> {
    const headers: Record<string, string> = {
      // Basic crawler blocking headers
      'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
      
      // AI training prevention
      'X-AI-Training': 'prohibited',
      'X-Training-Data': 'restricted',
      
      // Content protection
      'X-Content-Protection': 'active',
      'X-Crawler-Policy': 'restricted',
      
      // Rate limiting headers
      'X-RateLimit-Policy': `${options.rateLimit.requestsPerMinute} req/min`,
      
      // Cache control for AI crawlers
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (options.blockingLevel === 'maximum') {
      headers['X-Blocking-Level'] = 'maximum';
      headers['X-AI-Access'] = 'denied';
    }

    return headers;
  }

  // Helper methods
  private isLegitimateAllowedCrawler(userAgent: string, allowedCrawlers: string[]): boolean {
    return allowedCrawlers.some(crawler => 
      userAgent.toLowerCase().includes(crawler.toLowerCase())
    );
  }

  private hasSuspiciousHeaders(headers: Record<string, string>): boolean {
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'via'];
    return suspiciousHeaders.some(header => 
      headers[header] && headers[header].split(',').length > 3
    );
  }

  private shouldBlockBasedOnDetection(
    crawlerType: string,
    riskLevel: string,
    options: CrawlerBlockingOptions
  ): boolean {
    if (ProductionCrawlerBlocking.AI_CRAWLERS.includes(crawlerType)) {
      return options.aiCrawlerBlocking;
    }
    return riskLevel === 'critical';
  }

  private getBlockingMethod(detection: CrawlerDetectionResult, options: CrawlerBlockingOptions): string {
    const methods = [];
    if (options.userAgentBlocking) methods.push('user-agent');
    if (options.ipBlocking) methods.push('ip-blocking');
    if (options.rateLimit) methods.push('rate-limiting');
    return methods.join(', ');
  }

  private generateBlockingResponse(detection: CrawlerDetectionResult): Response {
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
    <p>Detected: ${detection.crawlerType}</p>
    <p>Reason: ${detection.blockingReason}</p>
    <p>For legitimate access, please contact the site administrator.</p>
</body>
</html>`;

    return new Response(blockingPage, {
      status: 403,
      headers: {
        'Content-Type': 'text/html',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noai, noimageai',
        'X-AI-Training': 'prohibited',
        'Cache-Control': 'no-store'
      }
    });
  }

  private getDefaultDetection(): CrawlerDetectionResult {
    return {
      isCrawler: false,
      crawlerType: 'unknown',
      userAgent: '',
      shouldBlock: false,
      blockingReason: '',
      riskLevel: 'low',
      recommendations: []
    };
  }
}

export const productionCrawlerBlocking = ProductionCrawlerBlocking.getInstance();