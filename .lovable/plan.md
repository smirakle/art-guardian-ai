

## Update All Adobe Plugin Icons with Pink Shield Design

### Overview
Replace all plugin icons with the uploaded pink gradient shield design, creating properly sized versions for both main icons and panel toolbar icons.

---

### Files to Update

**Main Plugin Icons** (used in Extensions menu and listings):
| File | Size | Action |
|------|------|--------|
| `icon-24.png` | 24x24 | Replace with resized pink shield |
| `icon-48.png` | 48x48 | Replace with resized pink shield |
| `icon-96.png` | 96x96 | Replace with resized pink shield |
| `icon-192.png` | 192x192 | Replace with resized pink shield |
| `icon-512.png` | 512x512 | Replace with resized pink shield |

**Panel Toolbar Icons** (small icons in panel header):
| File | Size | Theme | Action |
|------|------|-------|--------|
| `panel-dark-v3.png` | 23x23 | Dark UI | Create simplified pink shield |
| `panel-dark-v3@2x.png` | 46x46 | Dark UI (Retina) | Create simplified pink shield |
| `panel-light-v3.png` | 23x23 | Light UI | Create simplified pink shield |
| `panel-light-v3@2x.png` | 46x46 | Light UI (Retina) | Create simplified pink shield |

---

### Technical Approach

1. **Main Icons**: Scale the uploaded pink shield to each required size (24, 48, 96, 192, 512px) maintaining the gradient and details

2. **Panel Icons**: Create 23x23px versions optimized for small size:
   - **Dark theme**: Pink shield on transparent background (for dark Adobe UI)
   - **Light theme**: Pink shield with slight outline for visibility on light backgrounds
   - Include @2x (46x46) retina versions for both

3. **Cleanup**: Remove legacy icon versions (panel-dark.png, panel-dark-v2.png, etc.) that are no longer referenced

---

### Implementation Steps

1. Use AI image generation to create properly sized versions of the pink shield
2. Generate panel-specific variants optimized for 23x23px display
3. Save all icons to `adobe-plugin/icons/` directory
4. Optionally bump plugin version to verify icon updates loaded

---

### Notes
- Panel icons need to be legible at 23x23px - may need simplified design without fine details
- Both dark and light theme panel icons will use the same pink gradient (it's visible on both backgrounds)
- The @2x versions are for Retina/HiDPI displays

