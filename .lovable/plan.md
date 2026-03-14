

# Fix Logo Display on Homepage

## Problem
The logo PNG still has a gray/checkerboard background visible. The `mix-blend-multiply` trick doesn't fully resolve this — the underlying image simply doesn't have a clean transparent background.

## Solution
1. **Replace the logo asset** — Copy the user's uploaded image to `src/assets/tsmo-transparent-logo.png`, overwriting the current one
2. **Remove blend mode hacks** — Strip `mix-blend-multiply dark:mix-blend-screen` from the logo `<img>` tag in `Index.tsx` since the new image should have proper transparency
3. **Add a subtle drop shadow** instead for visual polish: `drop-shadow-lg`

## Files to change
- **`src/assets/tsmo-transparent-logo.png`** — Overwrite with the uploaded image (after background removal)
- **`src/pages/Index.tsx`** (line 198) — Remove blend classes, add clean styling

