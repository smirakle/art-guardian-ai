

# Fix Empty Fallback Links for Non-Platform Matches

## Root Cause
The `buildMatchUrl` fallback constructs URLs like `site:fore.com` or `site:wikipedia.com` by taking only the first word of the domain string and blindly appending `.com`. Since the database stores descriptive names (e.g., "Fore the Party", "Circle Internet Financial") instead of real domains, the fallback URLs point to wrong or non-existent sites.

## Changes

### 1. `src/utils/buildMatchUrl.ts` - Fix the fallback to use a general web search

Instead of constructing a broken `site:xxx.com` URL, use a simple DuckDuckGo search with the source title. This always produces relevant results.

**Current broken fallback:**
```
https://duckduckgo.com/?q=site:fore.com+Home+-+Fore+the+Party
```

**Fixed fallback:**
```
https://duckduckgo.com/?q=Home+-+Fore+the+Party+-+Mobile+Mini+Golf
```

Only use `site:` scoping when the domain string looks like an actual domain (contains a dot, e.g., `example.com`).

### 2. `src/utils/buildMatchUrl.ts` - Clean YouTube suffix from search titles

Strip "- YouTube" from titles before searching YouTube, so the query is `Here for the Party` instead of `Here for the Party - YouTube`. This produces better search results.

### 3. `src/utils/buildMatchUrl.ts` - Add Wikipedia support

Add explicit handling for Wikipedia since it appears in the database:
```
https://en.wikipedia.org/wiki/Special:Search?search=Circle
```

### Technical Details

The full changes to `buildMatchUrl.ts`:

1. Add a title-cleaning step that removes platform suffixes like "- YouTube", "- Wikipedia" from `sourceTitle` before encoding
2. Add Wikipedia to the platform-specific handlers
3. Change the fallback from `site:${domainKey}.com+${title}` to just `${sourceDomain}+${title}` when the domain string doesn't contain a dot (indicating it's not a real domain)
4. When the domain string contains a dot (e.g., `foretheparty.com`), keep the `site:` scoping since it's a real domain

### What This Fixes
- "Fore the Party" entries will search DuckDuckGo for the full title, finding the real site
- "Wikipedia" entries will search Wikipedia directly
- "Circle Internet Financial" entries will search for the real company
- YouTube entries will search without the redundant "- YouTube" suffix
- All links will produce meaningful, non-empty results

