
## What’s actually wrong (why Photoshop still shows gray placeholders)
In the repository right now, the icon files do **not** match what `adobe-plugin/manifest.json` is pointing to.

- `manifest.json` (v1.1.5) expects icons at:
  - `adobe-plugin/icons/icon-24.v1.1.5.png` (and 48/96/192/512)
  - `adobe-plugin/icons/panel-dark.v1.1.5.png`, `panel-dark@2x.v1.1.5.png`, etc.

But the repo currently contains (at the *root* of `adobe-plugin/`, not inside `adobe-plugin/icons/`):
- `icon-24 (1).png`, `icon-48 (1).png`, `icon-96 (1).png`, `icon-192 (1).png`, `icon-512 (1).png`
- `panel-dark-v3.png`, `panel-dark-v3@2x.png`, `panel-light-v3.png`, `panel-light-v3@2x.png`
- and `adobe-plugin/icons/` is effectively empty

So when Photoshop/UXP tries to load the icons from the manifest paths, it can’t find them (or finds the wrong ones), and it falls back to the gray placeholder.

## Goal
Make the repo’s on-disk icon files exactly match the manifest paths for v1.1.5 so UXP can load them reliably (no placeholders).

## Implementation plan (what I will change in the codebase)
### 1) Put the correct 9 versioned icon PNGs into the correct folder
- Ensure these 9 files exist in `adobe-plugin/icons/`:
  - `icon-24.v1.1.5.png`
  - `icon-48.v1.1.5.png`
  - `icon-96.v1.1.5.png`
  - `icon-192.v1.1.5.png`
  - `icon-512.v1.1.5.png`
  - `panel-dark.v1.1.5.png`
  - `panel-dark@2x.v1.1.5.png`
  - `panel-light.v1.1.5.png`
  - `panel-light@2x.v1.1.5.png`

Source of truth will be the icons you already uploaded (the `user-uploads://...v1.1.5.png` set), because those are the intended cache-busted filenames.

### 2) Clean up conflicting/incorrect icon files (to prevent confusion)
Inside `adobe-plugin/`, either remove or clearly deprecate the old/duplicate files:
- `icon-24 (1).png`, `icon-48 (1).png`, `icon-96 (1).png`, `icon-192 (1).png`, `icon-512 (1).png`
- `panel-*-v3*.png`

Reason: These “near match” filenames often cause people to copy the wrong icons locally later, and makes it harder to validate what UXP is actually loading.

### 3) Fix the web Admin “Icon Validator” so it validates the current (v1.1.5) reality
Right now `src/components/admin/AdobeIconValidator.tsx` still checks for the old names:
- `icon-24.png` (etc)
- `panel-dark-v3.png` (etc)

I will update it to validate the versioned v1.1.5 names listed above, and expected sizes:
- main: 24/48/96/192/512
- panel: 23×23 and 46×46 (@2x)

This gives you a reliable “repo sanity check” in /admin without guessing.

### 4) Align plugin UI version markers (optional but strongly recommended)
Your `adobe-plugin/index.html` still shows `v1.1.4` and loads assets with `?v=1.1.4`.
This doesn’t directly cause the icon placeholder problem, but it makes troubleshooting harder because you can’t easily confirm what is loaded.

I will update:
- `styles.css?v=1.1.5`
- `index.js?v=1.1.5`
- footer badge `v1.1.5`
(and any other visible version markers)

## How you’ll test end-to-end in Photoshop 2026 (after I implement)
1) Pull latest repo locally (`git pull`)
2) Confirm local folder now contains the exact manifest paths:
   - `adobe-plugin/icons/icon-24.v1.1.5.png` etc (all 9)
3) Run:
   ```bash
   cd adobe-plugin
   ./scripts/dev-reload.sh
   ```
4) In UXP Developer Tools:
   - Remove the plugin
   - Add the plugin folder again
   - Reload
5) Verify in Photoshop:
   - The Plugins panel entry shows the pink shield icon (not gray placeholder)
   - The panel toolbar icon also shows correctly

## Notes / likely outcome
Given your screenshot still shows placeholders even after “dev reload”, the path mismatch is the most consistent explanation. Once the files exist at the exact manifest paths, UXP should stop falling back.

## Small clarifying questions (to avoid rework)
- When you “Add” the plugin in UXP Dev Tools, are you selecting the folder that contains `manifest.json` directly (the `adobe-plugin/` folder), not the repo root?
- After pulling, did you see an `adobe-plugin/icons/` folder populated with the new `*.v1.1.5.png` files, or was it empty?

(These won’t block implementation, but they help confirm the fix will map to your local setup.)
