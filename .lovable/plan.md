

# Fix Empty Links on Recent Matches and My Findings Pages

## Problem
The "View" and "See Where" buttons open real platform pages but with **empty search queries**, showing no results. This happens because:

1. **Monitoring Hub (Recent Matches)**: The database query fetches `source_url` and `source_domain` but **not** `source_title`. Without the title, `buildMatchUrl` constructs URLs like `youtube.com/results?search_query=` (empty search).
2. **Simple Findings (My Findings)**: The fix from the last edit is correct, but the `sourceTitle` field may still be empty for some record types.

The database actually has good `source_title` values (e.g., "Here for the Party - YouTube", "Circle.so Feature Review...") -- they just aren't being fetched or passed through.

## Changes

### 1. `src/pages/MonitoringHub.tsx` - Add `source_title` to the query
- Add `source_title` to the select statement on line 76 so the Recent Matches section has access to real titles
- Current: `'id, source_url, source_domain, thumbnail_url, image_url, match_confidence, detected_at, threat_level'`
- Fixed: `'id, source_url, source_domain, source_title, thumbnail_url, image_url, match_confidence, detected_at, threat_level'`

### 2. `src/pages/MonitoringHub.tsx` - Pass `source_title` to `buildMatchUrl`
- The View button's onClick handler on line 240 already calls `buildMatchUrl(match.source_url, match.source_domain, match.source_title)` -- once `source_title` is fetched, this will work correctly.

### 3. `src/utils/buildMatchUrl.ts` - Extract title from `source_domain` as fallback
- When `sourceTitle` is empty, extract a usable search term from `sourceDomain` (e.g., from `"YouTube · Gretchen Wilson"`, extract `"Gretchen Wilson"` as the title)
- This ensures links always produce meaningful search results even if `source_title` is missing

### What This Fixes
- **"View" on Recent Matches**: Will open `youtube.com/results?search_query=Here+for+the+Party` instead of an empty search
- **"See Where" on My Findings**: Same fix -- titles will populate the search queries
- **Fallback**: If `source_title` is still empty, the utility will extract the creator/channel name from `source_domain` (e.g., "Gretchen Wilson" from "YouTube · Gretchen Wilson")

