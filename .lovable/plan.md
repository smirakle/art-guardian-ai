

# Fix Findings Page Links to Navigate to Real Sources

## Problem
The "See Where" button on the Simple Findings page opens the raw `source_url` from the database, which contains platform names (e.g., `"https://YouTube · SongsofHarry"`) rather than real URLs. The app already has a utility function (`buildMatchUrl`) that converts these into functional deep-links for YouTube, Instagram, Reddit, and other platforms -- but the Simple Findings page isn't using it.

## Solution
Apply the `buildMatchUrl` utility to the Simple Findings page so that all "See Where" links resolve to real, clickable destinations on the actual platforms.

## Changes

### 1. Update `src/pages/SimpleFindings.tsx`
- Import the `buildMatchUrl` utility from `@/utils/buildMatchUrl`
- In the "See Where" button's `onClick` handler (around line 362), replace:
  ```
  window.open(finding.sourceUrl, '_blank')
  ```
  with:
  ```
  window.open(buildMatchUrl(finding.sourceUrl, finding.source, finding.title), '_blank', 'noopener,noreferrer')
  ```
- Store the `source_title` from the database in the `SimpleFinding` interface so `buildMatchUrl` has the title to construct proper search URLs. This means:
  - Rename the existing `title` usage or add a new `sourceTitle` field to the `SimpleFinding` interface
  - Populate `sourceTitle` from `c.source_title`, `d.source_title` (if available), and `v.source_domain` during the data loading step

### 2. What This Fixes
- **YouTube** links like `"YouTube · SongsofHarry"` will resolve to `https://www.youtube.com/results?search_query=...`
- **Instagram** links like `"Instagram · circleapp"` will resolve to `https://www.instagram.com/circleapp/` or a search URL
- **Reddit** links will deep-link to subreddit searches
- **Unknown platforms** will fall back to a DuckDuckGo site-scoped search

### Technical Details
- The `buildMatchUrl` function already supports 13+ platforms (YouTube, Reddit, Alamy, Shutterstock, Getty, Adobe Stock, Flickr, DeviantArt, Pinterest, Unsplash, Pexels, ArtStation, Behance)
- YouTube is not currently in the platform list, so we will add YouTube support to `buildMatchUrl` as well
- Instagram is also missing and will be added

### 3. Update `src/utils/buildMatchUrl.ts`
Add support for YouTube and Instagram:
```typescript
if (domainKey === 'youtube') {
  return `https://www.youtube.com/results?search_query=${encodedTitle}`;
}
if (domainKey === 'instagram') {
  return `https://www.instagram.com/explore/tags/${encodedTitle}`;
}
```

This is a small, targeted fix that reuses existing infrastructure already proven in the Monitoring Hub's CopyrightMatches component.

