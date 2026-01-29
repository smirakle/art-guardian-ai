

## Problem Summary
Adobe UXP cannot load icon files with **spaces or parentheses** in their filenames. The current icons are named `icon-24 (1).png`, `icon-48 (1).png`, etc., and this causes UXP to fall back to gray placeholder icons.

## Solution: Rename Icons to Simple Filenames

### Step 1: Rename All Icon Files
Remove spaces and parentheses from all icon filenames:

| Current Name | New Name |
|---|---|
| `icon-24 (1).png` | `icon-24.png` |
| `icon-48 (1).png` | `icon-48.png` |
| `icon-96 (1).png` | `icon-96.png` |
| `icon-192 (1).png` | `icon-192.png` |
| `icon-512 (1).png` | `icon-512.png` |
| `panel-dark-v3.png` | `panel-dark.png` |
| `panel-dark-v3@2x.png` | `panel-dark@2x.png` |
| `panel-light-v3.png` | `panel-light.png` |
| `panel-light-v3@2x.png` | `panel-light@2x.png` |

### Step 2: Update manifest.json
Update all icon paths to reference the new simple filenames:

```json
"icons": [
  { "width": 24, "height": 24, "path": "icon-24.png" },
  { "width": 48, "height": 48, "path": "icon-48.png" },
  { "width": 96, "height": 96, "path": "icon-96.png" },
  { "width": 192, "height": 192, "path": "icon-192.png" },
  { "width": 512, "height": 512, "path": "icon-512.png" }
]
```

And for panel icons:
```json
"icons": [
  { "width": 23, "height": 23, "path": "panel-dark.png", "scale": [1], "theme": ["darkest", "dark"] },
  { "width": 23, "height": 23, "path": "panel-dark@2x.png", "scale": [2], "theme": ["darkest", "dark"] },
  { "width": 23, "height": 23, "path": "panel-light.png", "scale": [1], "theme": ["lightest", "light"] },
  { "width": 23, "height": 23, "path": "panel-light@2x.png", "scale": [2], "theme": ["lightest", "light"] }
]
```

### Step 3: Update version to 1.1.6
Bump the manifest version to ensure UXP sees this as a new version:
- Change `"version": "1.1.5"` → `"version": "1.1.6"`
- Update `index.html` asset references: `styles.css?v=1.1.6`, `index.js?v=1.1.6`
- Update `styles.css` header comment to `v1.1.6`

### Step 4: Update Admin Icon Validator
Update `AdobeIconValidator.tsx` to expect the new simple filenames.

### Files to Modify

1. **adobe-plugin/manifest.json** - Update all icon paths and bump version
2. **adobe-plugin/index.html** - Update version references in CSS/JS links
3. **adobe-plugin/styles.css** - Update version in header comment
4. **src/components/admin/AdobeIconValidator.tsx** - Update expected icon names

### Your Local Action (After I Make Changes)

Since I cannot rename files in the repo, you will need to:

1. **Pull the latest changes** (`git pull`)
2. **Locally rename the icon files** in your `adobe-plugin/` folder:
   - Rename `icon-24 (1).png` → `icon-24.png`
   - Rename `icon-48 (1).png` → `icon-48.png`
   - Rename `icon-96 (1).png` → `icon-96.png`
   - Rename `icon-192 (1).png` → `icon-192.png`
   - Rename `icon-512 (1).png` → `icon-512.png`
   - Rename `panel-dark-v3.png` → `panel-dark.png`
   - Rename `panel-dark-v3@2x.png` → `panel-dark@2x.png`
   - Rename `panel-light-v3.png` → `panel-light.png`
   - Rename `panel-light-v3@2x.png` → `panel-light@2x.png`

3. **Commit and push the renamed files** to update the repo
4. **In UXP Developer Tools**: Remove and re-add the plugin folder
5. **Verify in Photoshop** that the pink shield icons appear

### Why This Will Work

The `@` symbol in `panel-dark@2x.png` is standard convention and works fine in UXP. The problem is specifically:
- **Spaces** (` `) in filenames
- **Parentheses** (`(` and `)`) in filenames

By removing these special characters, UXP will be able to locate and load the icon files correctly.

