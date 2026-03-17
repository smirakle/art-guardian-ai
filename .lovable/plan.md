

## Plan: Make Facebook (and Other Social Media) Monitoring Real

### Problem
All social media monitoring functions generate random fake data using `Math.random()`. No actual platform APIs or web searches are called. Users see fabricated results.

### Approach
Use **SerpAPI** (already referenced in `API_KEYS_NEEDED.md`) to perform real web searches for each platform. This is the most practical approach because:
- Facebook/Meta does not offer a public monitoring API
- Instagram's API requires business account OAuth
- SerpAPI can search `site:facebook.com`, `site:instagram.com`, etc. for real results
- The project already has `SERPAPI_KEY` as a planned secret

For deeper analysis, use **OpenAI GPT-4o** (already referenced) to analyze search results for impersonation/copyright signals.

### Changes

#### 1. Add/verify secrets
- Confirm `SERPAPI_KEY` is configured (required)
- Confirm `OPENAI_API_KEY` is configured (for AI-powered threat classification)

#### 2. Rewrite `analyzeFacebookContentWithAI()` in `supabase/functions/real-social-media-monitor/index.ts`
- Replace `Math.random()` logic with real SerpAPI calls:
  ```
  GET https://serpapi.com/search.json?engine=google&q=site:facebook.com "{account_handle}"&api_key=...
  ```
- Parse real search results (URLs, titles, snippets)
- For each result, call OpenAI to classify threat type (copyright, impersonation, identity_theft) and assign a real confidence score
- Store real URLs and real content descriptions

#### 3. Rewrite `analyzeInstagramContentWithAI()`
- Same pattern: `site:instagram.com "{handle}"` via SerpAPI
- OpenAI classification of results

#### 4. Rewrite `analyzeTikTokContentWithAI()`
- Same pattern: `site:tiktok.com "{handle}"` via SerpAPI

#### 5. Rewrite `analyzeTwitterContentWithAI()`
- Same pattern: `site:twitter.com OR site:x.com "{handle}"` via SerpAPI

#### 6. Rewrite `performFallbackAIAnalysis()`
- Generic web search for the handle across all platforms

#### 7. Create shared helper functions
- `searchPlatformViaSerpAPI(platform, handle, apiKey)` — reusable search function
- `classifyThreatWithAI(searchResult, account, openaiKey)` — OpenAI-based classification
- Proper error handling with graceful degradation (return empty results, not fake data)

#### 8. Update the `PlatformCoverage` component
- Remove hardcoded fake account data (the `useState` with fake coverage percentages)
- Load real accounts from `social_media_accounts` table
- Show real scan counts from `social_media_scans` table

### Technical Details

**SerpAPI search pattern per platform:**
```
Facebook:  site:facebook.com "{handle}" OR "{display_name}"
Instagram: site:instagram.com "{handle}"
TikTok:    site:tiktok.com "{handle}"
Twitter:   site:twitter.com OR site:x.com "{handle}"
```

**OpenAI classification prompt:**
```
Analyze this search result for potential IP violations against @{handle}:
Title: {title}, URL: {url}, Snippet: {snippet}
Classify as: copyright | impersonation | identity_theft | benign
Return JSON: { type, confidence, reasoning, threat_level }
```

**Graceful degradation:** If API keys are missing, return `{ contentScanned: 0, detections: [], note: "API keys not configured" }` instead of fake data.

### Files Modified
- `supabase/functions/real-social-media-monitor/index.ts` — Replace all simulated platform functions with real API calls
- `src/components/monitoring/PlatformCoverage.tsx` — Load real data from database instead of hardcoded state

### Secrets Required
- `SERPAPI_KEY` — for platform-specific web searches
- `OPENAI_API_KEY` — for AI threat classification (may already exist)

