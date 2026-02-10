

## Clean Rebuild: Adobe Plugin Icons

### Why Rebuild
After multiple manifest fixes, the icons remain gray. This strongly suggests the PNG files themselves are the problem — possibly wrong dimensions, missing pixel data, or macOS metadata corruption. A fresh rebuild from scratch is the cleanest fix.

### Steps

#### 1. Delete all existing icon files from `adobe-plugin/`
Remove these files from your local `adobe-plugin/` folder:
- `panel-dark.png`
- `panel-dark@2x.png`
- `panel-light.png`
- `panel-light@2x.png`

#### 2. Regenerate icons using the Admin Icon Generator
1. Open the app and go to **Admin > Plugins > Icon Generator** tab
2. Generate new panel icons at the correct sizes:
   - `panel-dark.png` — exactly **23x23 px**, PNG, transparent background
   - `panel-dark@2x.png` — exactly **46x46 px**, PNG, transparent background
   - `panel-light.png` — exactly **23x23 px**, PNG, transparent background
   - `panel-light@2x.png` — exactly **46x46 px**, PNG, transparent background
3. Download each file and place them in your local `adobe-plugin/` folder (root level, not in a subfolder)

#### 3. Verify the files before loading
In Finder, right-click each PNG and choose **Get Info**. Confirm:
- Dimensions match exactly (23x23 or 46x46)
- File type is PNG
- File size is more than 0 bytes

#### 4. Bump version and reload
I will bump `manifest.json` to **1.1.9** to force UXP to re-read everything. Then:
1. Pull the updated manifest
2. In UXP Dev Tools: **Remove** the plugin
3. **Add** the `adobe-plugin/` folder again
4. Click **Load**

### Code Change
- `adobe-plugin/manifest.json`: bump version from `1.1.8` to `1.1.9`
- `adobe-plugin/index.html`: update cache-busting query params from `1.1.7` to `1.1.9` and version badge to `v1.1.9`

### No manifest icon format changes needed
The current manifest format (23x23 logical with `scale: [1, 2]` and `"medium"` theme) is correct per Adobe docs. Only the PNG files need rebuilding.

