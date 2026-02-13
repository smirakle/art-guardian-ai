

# Fix "View" Button for Monitoring Hub Matches

## Problem

When you click "View" on a match like Shutterstock, the app constructs a Google search URL (`google.com/search?q=site:shutterstock.com`). Google blocks this with `ERR_BLOCKED_BY_RESPONSE` because it rejects being opened programmatically from external origins.

This affects all matches where the `source_url` is not a real URL (e.g., `"https://Shutterstock"`, `"https://Alamy"`, `"https://Flickr"`).

## Solution

Replace the Google search fallback with DuckDuckGo, which does not block external redirects. Also add a mapping of known platforms to their actual search/browse pages for a better user experience.

## Changes

### File: `src/pages/MonitoringHub.tsx` (lines 238-245)

Replace the View button's click handler with:

1. A **platform URL map** that directly links to known platforms (Shutterstock, Alamy, Flickr, Instagram, Reddit, etc.) using their browse/search pages
2. A **DuckDuckGo fallback** (`https://duckduckgo.com/?q=site:domain.com`) for unknown platforms, since DuckDuckGo does not block external navigation

```text
Platform Map Examples:
  shutterstock  -> https://www.shutterstock.com
  alamy         -> https://www.alamy.com
  flickr        -> https://www.flickr.com
  instagram     -> https://www.instagram.com
  reddit        -> https://www.reddit.com
  (unknown)     -> https://duckduckgo.com/?q=site:{domain}.com
```

The existing first check (valid URLs starting with `http` and containing `.`) remains unchanged -- only the fallback path is updated.

