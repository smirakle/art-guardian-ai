

## Root Cause: Manifest Icon Format is Wrong

The Adobe UXP documentation (developer.adobe.com) shows that panel icons should be declared as **one entry per theme** with the **logical pixel size** (23x23) and `"scale": [1, 2]`. UXP then automatically looks for the `@2x` file by appending `@2x` to the filename.

**Current (broken)** -- 4 separate entries:
```text
{width: 23, height: 23, path: "panel-dark.png",    scale: [1], theme: ["darkest","dark"]}
{width: 46, height: 46, path: "panel-dark@2x.png", scale: [2], theme: ["darkest","dark"]}
{width: 23, height: 23, path: "panel-light.png",    scale: [1], theme: ["lightest","light"]}
{width: 46, height: 46, path: "panel-light@2x.png", scale: [2], theme: ["lightest","light"]}
```

**Correct (per Adobe docs)** -- 2 entries:
```text
{width: 23, height: 23, path: "panel-dark.png",  scale: [1, 2], theme: ["darkest","dark"]}
{width: 23, height: 23, path: "panel-light.png", scale: [1, 2], theme: ["lightest","light"]}
```

UXP sees `scale: [1, 2]` and auto-resolves `panel-dark@2x.png` from the same folder. Declaring `width: 46` with `scale: [2]` as a separate entry confuses UXP, resulting in gray icons.

---

## Changes

### 1. Fix `adobe-plugin/manifest.json`
Update the `entrypoints[0].icons` array from 4 entries to 2 entries using the official Adobe format.

### 2. Update `src/components/admin/AdobeIconGenerator.tsx`
Update the UXP Installation Checklist to reflect the corrected manifest format, so future instructions match.

### 3. Update `src/components/admin/AdobeIconValidator.tsx`
Update any references to the old 4-entry format so troubleshooting tips stay accurate.

---

## After Approval

1. I will fix `manifest.json` in the repo.
2. You pull the updated `manifest.json` to your local `adobe-plugin/` folder.
3. **Remove** the plugin in UXP Dev Tools, **Add** the folder again, and **Load**.
4. Icons should now appear correctly.

