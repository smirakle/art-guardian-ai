

# Restore the View Button for All Matches

## Problem
All `source_url` values in the database are platform names (e.g., `https://Shutterstock`, `https://Alamy`), not real URLs. The recent fix hides the View button when the URL is invalid, which causes it to disappear for every match since none have valid URLs.

## Solution
Always show the View button, but change its behavior based on whether the URL is valid:

- **Valid URL** (starts with `http` and contains a `.`): Opens the URL in a new tab (current behavior).
- **Invalid/missing URL**: Constructs a search URL for the platform. For example, if `source_domain` is "Shutterstock", clicking View opens `https://www.google.com/search?q=site:shutterstock.com` in a new tab, helping the user find the match on that platform.

This way the button is always visible and always does something useful.

## Technical Details

**File**: `src/pages/MonitoringHub.tsx` (lines 234-244)

Replace the current conditional rendering with:

```tsx
<Button 
  size="sm" 
  variant="outline"
  onClick={() => {
    if (match.source_url && match.source_url.startsWith('http') && match.source_url.includes('.')) {
      window.open(match.source_url, '_blank', 'noopener,noreferrer');
    } else {
      const domain = (match.source_domain || '').split(' ')[0].toLowerCase();
      const searchUrl = `https://www.google.com/search?q=site:${domain}.com`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  }}
>
  View
</Button>
```

No other files need to change.
