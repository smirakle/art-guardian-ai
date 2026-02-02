
Goal
- Fix the Photoshop/Illustrator UXP plugin “default/gray placeholder” icons so they render the pink shield icons in the Plugins list and panel.

What I found in your repo right now (why it’s still broken)
- Your manifest is already updated to v1.1.6 and expects these files in adobe-plugin/:
  - icon-24.png, icon-48.png, icon-96.png, icon-192.png, icon-512.png
  - panel-dark.png, panel-dark@2x.png, panel-light.png, panel-light@2x.png
- But your actual files currently present are still the old names with spaces/parentheses and “-v3”:
  - icon-24 (1).png, icon-48 (1).png, icon-96 (1).png, icon-192 (1).png, icon-512 (1).png
  - panel-dark-v3.png, panel-dark-v3@2x.png, panel-light-v3.png, panel-light-v3@2x.png
- So UXP can’t find the icon files the manifest references, and it falls back to the gray placeholders.
- Also, adobe-plugin/icons/ contains an odd nested path (“adobe-plugin/icons/adobe-plugin/icons”), which is a red flag for an accidental folder nesting issue. We should remove/clean that so it doesn’t confuse future tooling.

Fix strategy (repo-side, real assets, no mocks)
1) Normalize the icon filenames inside the repository (not just in your local machine)
   - Rename (git move) these existing files in adobe-plugin/:
     - icon-24 (1).png  -> icon-24.png
     - icon-48 (1).png  -> icon-48.png
     - icon-96 (1).png  -> icon-96.png
     - icon-192 (1).png -> icon-192.png
     - icon-512 (1).png -> icon-512.png
     - panel-dark-v3.png      -> panel-dark.png
     - panel-dark-v3@2x.png   -> panel-dark@2x.png
     - panel-light-v3.png     -> panel-light.png
     - panel-light-v3@2x.png  -> panel-light@2x.png
   - This makes the filesystem match what manifest.json already references.

2) Clean up the stray nested icons directory
   - Inspect what exactly is inside adobe-plugin/icons/adobe-plugin/icons (it likely shouldn’t exist).
   - Remove the accidental nested directory if it’s empty or redundant.
   - Keep either:
     - Option A (recommended, simplest): store icons in adobe-plugin/ root (current manifest already does this), and keep adobe-plugin/icons empty or remove it if unused.
     - Option B: store icons in adobe-plugin/icons/ and update manifest paths to “icons/icon-24.png”, etc. (only if you explicitly want that structure).
   - Given your current manifest and validator are already aligned to “adobe-plugin/ root”, Option A is the least-risk change.

3) Keep existing version bump behavior, optionally bump again for stubborn caching
   - You already bumped to 1.1.6 in manifest/index.html/styles.css.
   - If you still see stale behavior after the filenames are fixed in the repo, bump to 1.1.7 (manifest + index.html query params + styles.css header) to fully break UXP caching.

4) Validation (in-app + in-UXP)
   - In the Lovable Admin > Plugins > Icon Validator:
     - It should report all required icons present with correct dimensions (23/46 and 24/48/96/192/512).
   - In UXP Developer Tools:
     - Remove plugin
     - Add plugin folder (adobe-plugin/)
     - Reload
   - Confirm:
     - Plugin list shows the custom icon (not gray placeholder)
     - Panel icon in header/tool area shows correctly for dark/light themes

Expected outcome
- Your screenshot’s gray placeholder icon will be replaced by the correct shield icon because UXP will finally find the files referenced by manifest.json.

Implementation notes (what I’ll do after you approve this plan)
- Perform the actual repo-side renames (so you don’t have to do it locally).
- Clean up the accidental nested icons directory.
- If needed, bump version to 1.1.7 to ensure caching is not hiding the fix.

Edge cases to watch
- Case sensitivity: icon filenames must match exactly (Linux/macOS can be case-sensitive).
- PNG format/transparency: icons must be true PNG with alpha (your existing “(1)” and “-v3” files appear to already be valid assets, so this should be fine).
- Nested folder confusion: leaving the weird nested icons folder could keep future tools pointing to the wrong place, so we’ll remove it if it’s not intentionally used.