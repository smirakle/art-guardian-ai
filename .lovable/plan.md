
# Fix "View" Button on Recent Matches

## Problem
The "View" button on each recent match in `/monitoring-hub` navigates to `/ai-protection` instead of opening the actual source URL where the match was found.

## Fix
In `src/pages/MonitoringHub.tsx`, change the View button's `onClick` handler (line 238) to open `match.source_url` in a new browser tab using `window.open()`.

## Technical Detail
**File**: `src/pages/MonitoringHub.tsx`
**Line 235-241**: Replace the `<Button>` onClick from:
```tsx
onClick={() => navigate('/ai-protection')}
```
to:
```tsx
onClick={() => window.open(match.source_url, '_blank', 'noopener,noreferrer')}
```

This opens the detected match source (the actual URL where the copy was found) in a new tab, which is the expected behavior for a "View" action on a match detection.

No other files need to change.
