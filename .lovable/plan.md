

## Build Adobe Plugin Icon Generator Tool

Create an in-browser icon generator that renders the pink shield design with a **transparent background** and allows downloading all 9 required icon sizes as properly formatted PNG files.

---

### What This Solves

Your current icon files have a **solid pink background** instead of transparency, which causes Adobe UXP to display gray placeholders. This tool will generate icons with proper alpha channel transparency directly in the browser.

---

### Implementation Overview

**New Component**: `AdobeIconGenerator.tsx`

A tool that:
1. Renders the pink shield icon using HTML5 Canvas with transparent background
2. Generates all 9 required sizes in one click
3. Downloads each as a properly formatted PNG with alpha transparency
4. Shows live preview of each icon on a checkerboard pattern (to verify transparency)

---

### Icon Sizes to Generate

| File Name | Dimensions | Purpose |
|-----------|------------|---------|
| `icon-24.png` | 24x24px | Main plugin icon (small) |
| `icon-48.png` | 48x48px | Main plugin icon (medium) |
| `icon-96.png` | 96x96px | Main plugin icon (large) |
| `icon-192.png` | 192x192px | Main plugin icon (XL) |
| `icon-512.png` | 512x512px | Main plugin icon (marketing) |
| `panel-dark-v3.png` | 23x23px | Panel toolbar (dark theme @1x) |
| `panel-dark-v3@2x.png` | 46x46px | Panel toolbar (dark theme @2x) |
| `panel-light-v3.png` | 23x23px | Panel toolbar (light theme @1x) |
| `panel-light-v3@2x.png` | 46x46px | Panel toolbar (light theme @2x) |

---

### Technical Details

**Files to Create:**
- `src/components/admin/AdobeIconGenerator.tsx` - The icon generator component

**Files to Modify:**
- `src/components/admin/AdminPluginsSection.tsx` - Add new "Icon Generator" tab

**Canvas Rendering Approach:**
```text
+----------------------------------+
|  Canvas (transparent background) |
|  +----------------------------+  |
|  |   Pink Shield Shape        |  |
|  |   - Rounded rectangle      |  |
|  |   - Gradient fill          |  |
|  |   - #ec4899 to #f43f5e     |  |
|  +----------------------------+  |
+----------------------------------+
         |
         v
    canvas.toDataURL('image/png')
         |
         v
    Download as .png file
```

**Key Implementation Details:**
1. Use `CanvasRenderingContext2D` with `clearRect()` to ensure transparent background
2. Draw rounded rectangle with pink gradient (#ec4899 to #f43f5e at 135 degrees)
3. Add subtle shadow/depth for visual polish
4. Export using `canvas.toDataURL('image/png')` which preserves alpha channel
5. Display previews on checkerboard pattern to verify transparency

---

### UI Layout

```text
+---------------------------------------------------+
|  Icon Generator                                    |
|  Generate Adobe plugin icons with transparency     |
+---------------------------------------------------+
|                                                   |
|  [Generate All Icons]  [Download All as ZIP]      |
|                                                   |
|  +-------+ +-------+ +-------+ +-------+ +-------+|
|  | 24px  | | 48px  | | 96px  | |192px  | |512px  ||
|  | [img] | | [img] | | [img] | | [img] | | [img] ||
|  | [DL]  | | [DL]  | | [DL]  | | [DL]  | | [DL]  ||
|  +-------+ +-------+ +-------+ +-------+ +-------+|
|                                                   |
|  Panel Icons (23px & 46px variants)               |
|  +-------+ +-------+ +-------+ +-------+          |
|  |dark v3| |dark@2x| |light  | |lite@2x|          |
|  | [DL]  | | [DL]  | | [DL]  | | [DL]  |          |
|  +-------+ +-------+ +-------+ +-------+          |
+---------------------------------------------------+
```

---

### After Implementation

1. Navigate to **Admin → Plugins → Icon Generator** tab
2. Click **"Generate All Icons"** to create all 9 icons
3. Verify transparency by checking the checkerboard pattern shows through
4. Click **"Download All"** or download individually
5. Copy downloaded files to your local `adobe-plugin/icons/` folder
6. Run `./scripts/dev-reload.sh`
7. Re-add plugin in UXP Developer Tools

