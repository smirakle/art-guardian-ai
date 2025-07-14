# API Keys Required for Real Copyright Detection

## Required API Keys:

### 1. Google Custom Search API
- **Purpose**: Reverse image search via Google
- **Get it at**: https://developers.google.com/custom-search/v1/introduction
- **Secret name**: `GOOGLE_CUSTOM_SEARCH_API_KEY`
- **Also need**: `GOOGLE_SEARCH_ENGINE_ID` (Custom Search Engine ID)

### 2. Bing Visual Search API
- **Purpose**: Reverse image search via Bing
- **Get it at**: https://www.microsoft.com/en-us/bing/apis/bing-visual-search-api
- **Secret name**: `BING_VISUAL_SEARCH_API_KEY`

### 3. TinEye API
- **Purpose**: Reverse image search via TinEye
- **Get it at**: https://services.tineye.com/developers
- **Secret name**: `TINEYE_API_KEY`
- **Also need**: `TINEYE_API_SECRET`

### 4. OpenAI API (for computer vision)
- **Purpose**: Image comparison and analysis
- **Get it at**: https://platform.openai.com/api-keys
- **Secret name**: `OPENAI_API_KEY`

### 5. SerpAPI (for Yahoo and other search engines)
- **Purpose**: Additional search engines
- **Get it at**: https://serpapi.com/
- **Secret name**: `SERPAPI_KEY`

Please add these API keys to your Supabase Edge Function Secrets.