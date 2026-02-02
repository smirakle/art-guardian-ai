

## Problem Found

The `manifest.json` has incorrect dimensions for the `@2x` panel icons:

| Icon File | Actual Size | Manifest Says | Issue |
|-----------|-------------|---------------|-------|
| `panel-dark.png` | 23×23 | 23×23 | ✅ Correct |
| `panel-dark@2x.png` | 46×46 | **23×23** | ❌ Wrong |
| `panel-light.png` | 23×23 | 23×23 | ✅ Correct |
| `panel-light@2x.png` | 46×46 | **23×23** | ❌ Wrong |

UXP validates that the declared dimensions match the actual file dimensions. When they don't match, it falls back to gray placeholder icons.

## Solution

Update `adobe-plugin/manifest.json` to declare the correct dimensions for `@2x` icons (46×46 instead of 23×23).

### Technical Change

**File:** `adobe-plugin/manifest.json`

Change lines 44-46:
```json
{
  "width": 46,
  "height": 46,
  "path": "panel-dark@2x.png",
  "scale": [2],
  "theme": ["darkest", "dark"]
}
```

Change lines 56-60:
```json
{
  "width": 46,
  "height": 46,
  "path": "panel-light@2x.png",
  "scale": [2],
  "theme": ["lightest", "light"]
}
```

## After the Fix

1. Push the manifest change to GitHub
2. Pull the changes to your local folder
3. In UXP Developer Tools: **Remove** → **Add** → **Load**
4. Both panel toolbar icons should now display as pink

