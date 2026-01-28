
## Goal
Fix the Adobe UXP gray placeholder icons (both the Plugins panel icon and the panel toolbar icon) even though the files appear transparent and are in `adobe-plugin/icons/`.

Your screenshot shows UXP falling back to a generic placeholder, which typically means **UXP couldn’t load/decode the PNGs** or is **still using cached icon assets**.

## What I found in the codebase
- `adobe-plugin/icons/` contains all 9 expected files with the exact names referenced by `adobe-plugin/manifest.json`.
- `manifest.json` references:
  - Main: `icons/icon-24.png`, `icons/icon-48.png`, `icons/icon-96.png`, `icons/icon-192.png`, `icons/icon-512.png`
  - Panel: `icons/panel-dark-v3.png`, `icons/panel-dark-v3@2x.png`, `icons/panel-light-v3.png`, `icons/panel-light-v3@2x.png`
- The in-app Icon Generator (`src/components/admin/AdobeIconGenerator.tsx`) generates:
  - Main sizes: 24/48/96/192/512
  - Panel sizes: 23 and 46 for “@2x”
  - Uses `canvas.toDataURL("image/png")`, which should preserve alpha transparency.

So the remaining likely causes are:
1) **Wrong pixel dimensions** (especially the panel icons: @2x must be 46×46).  
2) **PNG encoding incompatibility** (rare, but UXP can be picky: color profile, interlacing, indexed palette, etc.).  
3) **UXP caching icons by path**, so even if you bump manifest version, it may still keep icon assets cached; changing filenames is often the only reliable cache-buster.

---

## Step 1 (No code): Confirm the local icon files are valid for UXP
On your local machine (the same folder you loaded in UXP Dev Tools), verify these facts:

### A) Confirm exact file names (no hidden “(1)” copies)
In Finder, inside `adobe-plugin/icons/`, ensure the names are exactly:
- `icon-24.png`
- `icon-48.png`
- `icon-96.png`
- `icon-192.png`
- `icon-512.png`
- `panel-dark-v3.png`
- `panel-dark-v3@2x.png`
- `panel-light-v3.png`
- `panel-light-v3@2x.png`

### B) Confirm pixel dimensions via Terminal (recommended)
Run these in your local repo root:
```bash
sips -g pixelWidth -g pixelHeight adobe-plugin/icons/icon-24.png
sips -g pixelWidth -g pixelHeight adobe-plugin/icons/panel-dark-v3.png
sips -g pixelWidth -g pixelHeight adobe-plugin/icons/panel-dark-v3@2x.png
```

Expected:
- `icon-24.png` = 24×24
- `panel-dark-v3.png` = 23×23
- `panel-dark-v3@2x.png` = 46×46

If any do not match, UXP often shows placeholders.

### C) Confirm the files are real PNGs (not WebP renamed)
```bash
file adobe-plugin/icons/panel-dark-v3@2x.png
```
It should say `PNG image data ...`, not WebP/other.

If you want, you can also open one in Preview → Tools → Show Inspector and confirm dimensions + alpha.

---

## Step 2 (Code change): Add an “Icon Validator” in the web admin to verify repo icons
Even if Finder/Preview looks okay, we’ll add a reliable validator inside the web app that:
- loads the **actual files from the repo** (not the generated data URLs),
- prints:
  - pixel size (`naturalWidth`, `naturalHeight`)
  - whether any pixel has alpha < 255 (true transparency test)
  - whether the image can be decoded at all in a Chromium environment

### Implementation approach
1) Create a new admin component (or a new tab under the existing Admin → Plugins area) called something like **“Icon Validator”**.
2) It will try to load each of the 9 icon assets from the repo path and then:
   - display the image on a checkerboard
   - show decoded dimensions
   - run a quick transparency scan:
     - draw to a canvas
     - sample pixels (or scan a subset for performance)
     - confirm presence of alpha channel usage
3) If any asset fails to load or has wrong dimensions, it will be obvious immediately.

This helps us distinguish:
- “icons are correct, UXP is caching” vs
- “icons are actually wrong/renamed/mis-sized in the repo/local copy”.

---

## Step 3 (Code change): Hard cache-bust UXP icons by renaming and updating manifest paths
If Step 1 & Step 2 show the icons are correct (sizes + alpha), then we treat this as a UXP icon cache issue.

### Strategy
UXP tends to cache icons strongly by file path. So we will:
1) Add a version suffix to icon filenames in `adobe-plugin/icons/`, e.g.:
   - `icon-24.v1.1.5.png`
   - `panel-dark-v3.v1.1.5.png`
   - `panel-dark-v3@2x.v1.1.5.png`
2) Update `adobe-plugin/manifest.json` to reference the new paths.
3) Bump the plugin version (e.g. 1.1.4 → 1.1.5).
4) Optionally update any internal UI/version badge references if used.

### Why this works
Changing filenames forces UXP to fetch new files instead of serving the old cached bitmap, and avoids “I cleared cache but it still shows placeholder” loops.

---

## Step 4: Local end-to-end test checklist in Photoshop (real results)
After applying the above:
1) Pull latest from GitHub (or re-sync from Lovable).
2) Run:
   ```bash
   cd adobe-plugin
   ./scripts/dev-reload.sh
   ```
3) In UXP Dev Tools:
   - remove the plugin
   - add the plugin folder again
   - reload
4) Verify:
   - Plugins panel list shows your pink shield icon
   - The panel toolbar icon shows correctly
   - Both dark/light variants render properly

---

## Edge cases we will account for
- If the panel icon appears but main icon doesn’t (or vice versa): we’ll validate each specific file and ensure paths are correct.
- If only @2x is broken: likely wrong 46×46 size, or wrong scale entry in manifest.
- If decoding fails in browser validator: likely the PNG is not actually a valid PNG, or it’s corrupted, or includes something UXP can’t handle.

---

## What I need from you (to proceed efficiently)
If you can paste the output of these three commands, we’ll know immediately whether this is a size/format issue:
```bash
sips -g pixelWidth -g pixelHeight adobe-plugin/icons/panel-dark-v3.png
sips -g pixelWidth -g pixelHeight adobe-plugin/icons/panel-dark-v3@2x.png
file adobe-plugin/icons/panel-dark-v3@2x.png
```

Even without that, the plan above will still work; the validator + cache-busting rename will force a definitive result.

---

## Technical notes (for later implementation)
- The validator will use `new Image()` + `img.decode()` and a `<canvas>` readback.
- Transparency test: sample a grid of pixels (for 512×512 don’t scan all pixels; scan e.g. every 8th pixel) and detect any alpha < 255.
- We’ll follow existing Admin plugin tab patterns in `src/components/admin/AdminPluginsSection.tsx`.

