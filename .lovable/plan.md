

## Fix: Icons Not Showing After Manifest Update

### Root Cause
Two issues likely causing UXP to skip the panel icons:

1. **Manifest version unchanged (1.1.7)** — UXP may ignore manifest changes if the version hasn't changed, even after Remove/Add/Load.
2. **Missing "medium" theme** — Adobe's own example declares dark icons for `["darkest", "dark", "medium"]`, but ours only covers `["darkest", "dark"]`. Photoshop's default theme is "medium", so UXP finds no matching icon entry.

### Changes

#### 1. `adobe-plugin/manifest.json`
- Bump version from `1.1.7` to `1.1.8`
- Add `"medium"` to the dark icon theme array so it covers Photoshop's default theme

Final icon entries:
```json
{
  "width": 23, "height": 23,
  "path": "panel-dark.png",
  "scale": [1, 2],
  "theme": ["darkest", "dark", "medium"]
},
{
  "width": 23, "height": 23,
  "path": "panel-light.png",
  "scale": [1, 2],
  "theme": ["lightest", "light"]
}
```

### After Changes
1. Pull the updated `adobe-plugin/manifest.json` to your local folder
2. In UXP Dev Tools: **Remove** the plugin, **Add** the folder again, and **Load**
3. Icons should now appear for all Photoshop themes

