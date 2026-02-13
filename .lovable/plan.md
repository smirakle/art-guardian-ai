
# Fix "View" Button to Navigate Directly to the Matched Content

## Problem

The database stores platform identifiers instead of real URLs for some sources:
- Reddit: `source_url` = `"https://Reddit · r/filmphotography"`, `source_title` = `"My very first B&W roll. What can I improve as a beginner ..."`
- Alamy: `source_url` = `"https://Alamy"`, `source_title` = `"Grand haven lighthouse and pier Stock Photos and Images"`

The current code detects these aren't real URLs and falls back to the platform homepage -- but it should use the `source_title` to search for the specific match on that platform.

## Solution

Update the fallback logic in both `MonitoringHub.tsx` and `CopyrightMatches.tsx` to construct a **site-scoped search** using the title, so users land on the actual matched content.

### Changes to `src/pages/MonitoringHub.tsx` and `src/components/monitoring/CopyrightMatches.tsx`

Replace the platform homepage map with smarter URL construction:

1. **Extract the real domain** from `source_domain` (e.g., `"Reddit · r/filmphotography"` becomes `"reddit.com"`, `"Alamy"` becomes `"alamy.com"`)
2. **Extract subreddit** if present (e.g., `r/filmphotography` from the domain string)
3. **Build a targeted search URL** using the title:
   - Reddit with subreddit: `https://www.reddit.com/r/filmphotography/search/?q=My+very+first+B%26W+roll`
   - Reddit without subreddit: `https://www.reddit.com/search/?q=title+here`
   - Alamy: `https://www.alamy.com/search?qt=Grand+haven+lighthouse+and+pier`
   - Shutterstock: `https://www.shutterstock.com/search/title+here`
   - Other platforms: `https://duckduckgo.com/?q=site:domain.com+title+here`

This way users are taken directly to search results showing the specific matched content, not just a homepage.

## Technical Details

- The `source_domain` field contains structured info like `"Reddit · r/filmphotography"` -- parse this with a regex to extract subreddit names
- The `source_title` is used as the search query, URL-encoded with `encodeURIComponent()`
- Platform-specific search URL patterns are used where available (Reddit search, Alamy search, Shutterstock search, etc.)
- For platforms without a known search URL format, DuckDuckGo `site:` scoped search is used with the title
- Both files (`MonitoringHub.tsx` and `CopyrightMatches.tsx`) get the same updated logic
