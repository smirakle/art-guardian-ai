

## Fix Adobe Plugin Icons - Transparent Background

### Root Cause
All icon files currently have **solid backgrounds** instead of transparent:
- Main icons (icon-24.png, etc.): Pink background
- Panel icons (panel-dark-v3.png, etc.): Dark blue background

Adobe UXP requires **PNG files with transparent backgrounds** for icons to display correctly in Photoshop's UI.

---

### Solution
Regenerate all icon files with the pink shield design on a **transparent background**.

### Files to Update

**Main Plugin Icons** (used in Plugins list):
| File | Size | Current Issue |
|------|------|---------------|
| `icon-24.png` | 24x24px | Pink background |
| `icon-48.png` | 48x48px | Pink background |
| `icon-96.png` | 96x96px | Pink background |
| `icon-192.png` | 192x192px | Pink background |
| `icon-512.png` | 512x512px | Pink background |

**Panel Toolbar Icons** (used in panel header):
| File | Size | Current Issue |
|------|------|---------------|
| `panel-dark-v3.png` | 23x23px | Dark background |
| `panel-dark-v3@2x.png` | 46x46px | Dark background |
| `panel-light-v3.png` | 23x23px | Dark background |
| `panel-light-v3@2x.png` | 46x46px | Dark background |

---

### Implementation Steps

1. **Generate new icon assets** using AI image generation with explicit transparent background instruction
2. **Replace all 9 icon files** in `adobe-plugin/icons/`
3. **Clean up old versions** - Remove unused v1/v2 icon files to prevent confusion

### Cleanup - Files to Remove
- `icon-24.jpg` (duplicate)
- `panel-dark.png`, `panel-dark@2x.png` (v1)
- `panel-dark-v2.png`, `panel-dark@2x-v2.png` (v2)
- `panel-light.png`, `panel-light@2x.png` (v1)
- `panel-light-v2.png`, `panel-light@2x-v2.png` (v2)

---

### After Implementation

1. Run cache clear:
   ```bash
   cd adobe-plugin
   ./scripts/dev-reload.sh
   ```
2. Remove plugin from UXP Developer Tools
3. Re-add plugin folder
4. Verify pink shield icons appear in both locations

