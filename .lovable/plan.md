

## Fix Adobe Plugin Icons - Replace with Pink Shield Design

### Problem
The current icon files in `adobe-plugin/icons/` are not displaying the pink shield design. As shown in your screenshot:
- **Plugins panel**: Shows a gray square placeholder
- **Plugin header**: Shows a small red/orange icon (not the pink gradient shield)

### Solution
Regenerate all icon files using the uploaded pink shield image as the source, ensuring they are properly saved as PNG files with the correct dimensions.

---

### Files to Regenerate

**Main Plugin Icons** (for Extensions menu/listings):
| File | Dimensions | Purpose |
|------|------------|---------|
| `icon-24.png` | 24x24px | Small menu icon |
| `icon-48.png` | 48x48px | Standard menu icon |
| `icon-96.png` | 96x96px | Large display |
| `icon-192.png` | 192x192px | High-res display |
| `icon-512.png` | 512x512px | Adobe Exchange listing |

**Panel Toolbar Icons** (23x23px icons in panel header):
| File | Dimensions | Theme |
|------|------------|-------|
| `panel-dark-v3.png` | 23x23px | Dark Adobe UI |
| `panel-dark-v3@2x.png` | 46x46px | Dark UI (Retina) |
| `panel-light-v3.png` | 23x23px | Light Adobe UI |
| `panel-light-v3@2x.png` | 46x46px | Light UI (Retina) |

---

### Implementation Steps

1. Use the uploaded pink shield image (`user-uploads://icon-24.jpg`) as the base design
2. Generate properly sized PNG versions for each required dimension
3. Ensure transparent backgrounds for all icons
4. Save directly to `adobe-plugin/icons/` directory, overwriting existing files

---

### After Implementation

Run the dev reload script to verify:
```bash
cd adobe-plugin
./scripts/dev-reload.sh
```

Then reload the plugin in Photoshop and verify the pink shield appears in both:
- The Plugins panel list
- The plugin panel header

