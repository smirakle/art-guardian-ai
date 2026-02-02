

## Problem

The plugin list entry icon remains gray while the panel header icon is pink. This happens because:

1. **Repository icons may be placeholders** - The `icon-24.png` and `icon-48.png` files in the repo might not be the actual pink gradient icons
2. **Download names require renaming** - The Icon Generator downloads files as `icon-24.v1.1.5.png` requiring manual renaming to `icon-24.png`

## Solution

### Part 1: Fix the Icon Generator Downloads

Update `AdobeIconGenerator.tsx` to download files with **clean filenames** (no version suffix):

| Current Download Name | New Download Name |
|-----------------------|-------------------|
| `icon-24.v1.1.5.png` | `icon-24.png` |
| `icon-48.v1.1.5.png` | `icon-48.png` |
| `panel-dark.v1.1.5.png` | `panel-dark.png` |
| etc. | etc. |

This eliminates the need for manual renaming.

### Part 2: Add Pre-Generated Icons to Repository

Create a simple way to update the repository icons:

1. Add a "Copy to Clipboard as Base64" button in the generator
2. Or provide a direct download link that matches exactly what the manifest expects

### Technical Changes

**File: `src/components/admin/AdobeIconGenerator.tsx`**

- Change `downloadName` in `ICON_CONFIGS` to use clean names:
  ```typescript
  { name: "icon-24.png", downloadName: "icon-24.png", width: 24, height: 24, category: "main" },
  ```

- The version comment can remain in the code for reference, but the actual download will use the manifest-compatible name

### Outcome

After this change:
1. User generates icons in the web app
2. Downloads have clean names matching the manifest
3. User copies files directly to `adobe-plugin/` folder (no renaming needed)
4. Reload in UXP → both icons are pink

