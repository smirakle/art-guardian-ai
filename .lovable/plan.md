
## Problem

The second icon (plugin list entry) is still gray because the **main plugin icons** (`icon-24.png`, `icon-48.png`) in your local folder are not the correct pink shield versions.

| Icon Location | File Used | Current State |
|---------------|-----------|---------------|
| Plugins panel header | `panel-dark.png` | ✅ Pink |
| Plugin list entry | `icon-24.png` or `icon-48.png` | ❌ Gray |

## Solution

### Step 1: Generate Fresh Icons

1. Go to **Admin → Plugins → Icons** tab in the web app
2. Click **"Generate All Icons"**
3. Click **"Download All"**

### Step 2: Rename Downloaded Files

The generator downloads files with version suffixes. You need to remove them:

| Downloaded Name | Rename To |
|-----------------|-----------|
| `icon-24.v1.1.5.png` | `icon-24.png` |
| `icon-48.v1.1.5.png` | `icon-48.png` |
| `icon-96.v1.1.5.png` | `icon-96.png` |
| `icon-192.v1.1.5.png` | `icon-192.png` |
| `icon-512.v1.1.5.png` | `icon-512.png` |

*(Panel icons you already have working, but you can update them too if needed)*

### Step 3: Replace Local Files

Copy the renamed files into your local `adobe-plugin/` folder, replacing the existing ones.

### Step 4: Reload in UXP

1. In UXP Developer Tools: **Remove** the plugin
2. **Add** the `adobe-plugin/` folder again
3. Click **Load**
4. Both icons should now be pink

## Technical Detail

The Icon Generator uses Canvas to draw a pink gradient rounded rectangle (#ec4899 → #f43f5e) for all icon sizes. For icons ≥48px, it also adds a white shield symbol. For 24px, it's just the pink rounded square - which is what you see in the header already.

## Alternative: Quick Fix

If you just want to quickly fix the 24px icon, you can:

1. In Finder, duplicate `panel-dark.png` (which is 23px and pink)
2. Open in Preview, resize to 24×24 pixels
3. Save as `icon-24.png`
4. Replace the file in your `adobe-plugin/` folder
5. Reload in UXP

This gets both icons pink with minimal effort.
