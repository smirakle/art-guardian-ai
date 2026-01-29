

## Problem Summary
The Adobe UXP plugin still shows gray placeholder icons because the required icon files do not exist at the paths specified in `manifest.json`. Multiple previous attempts to fix this have not succeeded because:

1. The `adobe-plugin/icons/` folder is essentially empty
2. The icons that exist are in the wrong location (`adobe-plugin/` root) with wrong names (`icon-24 (1).png`, `panel-dark-v3.png`)
3. The Lovable image generator cannot create files in arbitrary folders like `adobe-plugin/icons/`

## Solution: Two-Part Approach

### Part 1: Change manifest.json to use the icons that already exist
Instead of trying to create new files, update `manifest.json` to reference the icons that are already in the repo:

| Current manifest path | Change to |
|---|---|
| `icons/icon-24.v1.1.5.png` | `icon-24 (1).png` |
| `icons/icon-48.v1.1.5.png` | `icon-48 (1).png` |
| `icons/icon-96.v1.1.5.png` | `icon-96 (1).png` |
| `icons/icon-192.v1.1.5.png` | `icon-192 (1).png` |
| `icons/icon-512.v1.1.5.png` | `icon-512 (1).png` |
| `icons/panel-dark.v1.1.5.png` | `panel-dark-v3.png` |
| `icons/panel-dark@2x.v1.1.5.png` | `panel-dark-v3@2x.png` |
| `icons/panel-light.v1.1.5.png` | `panel-light-v3.png` |
| `icons/panel-light@2x.v1.1.5.png` | `panel-light-v3@2x.png` |

This makes the manifest point to files that actually exist, eliminating the path mismatch.

### Part 2: Update the Admin Icon Validator
Update `src/components/admin/AdobeIconValidator.tsx` to validate the actual filenames being used.

### Part 3: Your Local Action (After I Make Changes)
After I update the manifest, you will need to:
1. Pull the latest changes (`git pull`)
2. In UXP Developer Tools:
   - Remove the existing plugin
   - Add the plugin folder again
   - Reload
3. Verify in Photoshop that the pink shield icons appear

## Technical Details

### Files to modify:
1. `adobe-plugin/manifest.json` - Update all icon paths to reference existing files
2. `src/components/admin/AdobeIconValidator.tsx` - Update expected icon names to match

### Why this will work:
The existing icons (`icon-24 (1).png`, `panel-dark-v3.png`, etc.) are already in the repository and should be valid PNGs with transparency. By pointing the manifest to these files directly (without the `icons/` subfolder), UXP will be able to find and load them.

### Future cleanup (optional):
Once confirmed working, the files could be renamed to cleaner names and the `icons/` folder removed entirely, but this is lower priority than getting the plugin functional.

