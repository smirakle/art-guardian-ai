

## Build Adobe UXP Plugin (Clean Rebuild)

Rebuild the entire `adobe-plugin/` directory from scratch with all four required files, matching the UI shown in the admin panel's Photoshop Plugin Mockup and the uploaded screenshots.

### What Gets Built

**4 core files** in `adobe-plugin/`:

1. **manifest.json** - UXP manifest v5, ID `2ae4a9c1`, version `2.0.0`, supports Photoshop (PS 24+) and Illustrator (AI 27+), panel icon declarations with `scale: [1, 2]` and `medium` theme
2. **index.html** - Plugin UI shell with cache-busting `?v=2.0.0` on asset links
3. **styles.css** - Dark theme matching Adobe Spectrum design (dark backgrounds, pink gradient protect button, blue sign-in buttons)
4. **index.js** - Full plugin logic with TextEncoder/TextDecoder polyfills, FNV-1a document hashing, Supabase API calls

### UI Screens (matching screenshots)

**Login Screen:**
- "TSMO Protection" header with red dot + "TSMO Beta" label
- "Welcome to TSMO / Protect your artwork from AI training"
- Email and Password fields
- Blue "Sign In" button
- Blue "Create Free Account" button (opens `https://www.tsmowatch.com/auth?tab=signup` via `uxp.shell.openExternal`)
- "Need help?" link (opens `https://www.tsmowatch.com/support`)

**Main Panel (logged in):**
- Header: "TSMO Protection" + Logout button
- Subtitle bar: red dot, "TSMO Beta", user email, Basic/Pro badge
- Pink gradient Protect button (#ec4899 to #f43f5e)
- "One click to protect your current document" + tier indicator
- "Upgrade to Pro" button (links to `https://www.tsmowatch.com/pricing`)
- "Verify Protection" button with checkmark
- Success state with "Save to TSMO Account" and "View in TSMO Watch" buttons

**Footer:**
- `www.tsmowatch.com` link (opens homepage via `uxp.shell.openExternal`)
- Copyright 2026 TSMO Technology Inc.
- Pink version badge `v2.0.0`

### Working Links

| Link | Destination | Method |
|------|------------|--------|
| www.tsmowatch.com | `https://www.tsmowatch.com` | `uxp.shell.openExternal` |
| Create Free Account | `https://www.tsmowatch.com/auth?tab=signup` | `uxp.shell.openExternal` |
| Need help? | `https://www.tsmowatch.com/support` | `uxp.shell.openExternal` |
| Upgrade to Pro | `https://www.tsmowatch.com/pricing?source=adobe_plugin&email=...` | `uxp.shell.openExternal` |
| View in TSMO Watch | `https://www.tsmowatch.com` | `uxp.shell.openExternal` |

### Technical Details

- **API endpoint**: `https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api`
- **Auth**: Supabase auth via API calls (login with email/password, get JWT token)
- **Protection flow**: Export doc hash via batchPlay, call API with `action: "protect"`, inject XMP metadata, place protected layer for Pro tier
- **Polyfills**: TextEncoder/TextDecoder for UXP environment
- **Hash function**: FNV-1a fallback when Web Crypto is unavailable
- **Version**: `2.0.0` (clean start after full deletion)
- **No icon files included** - user must generate them via Admin Icon Generator and place them manually

### Note on Icons

The manifest will reference panel icons (`panel-dark.png`, `panel-dark@2x.png`, `panel-light.png`, `panel-light@2x.png`) but the PNG files themselves must be generated separately via the Admin Icon Generator at exact dimensions (23x23 and 46x46).

