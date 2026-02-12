

# Implement C2PA Content Credentials in the Photoshop Plugin

## Overview
Add C2PA signing and JUMBF embedding directly into the Adobe Photoshop plugin's protection workflow. When a user clicks "Protect Current Document," the plugin will sign a C2PA manifest via the existing edge function, then embed the credentials into the exported image file -- all within the UXP environment.

## How It Will Work

1. **User clicks "Protect"** in the plugin panel
2. Plugin exports the active document as a temporary JPEG/PNG using Photoshop's batchPlay
3. Plugin calls the `sign-c2pa-manifest` edge function to get an ES256 signature
4. Plugin sends the image + manifest + signature to `embed-c2pa-manifest` to get the protected file back
5. The protected image (with embedded JUMBF) is placed back as a new layer or saved alongside the PSD
6. XMP metadata injection and database record creation continue as before

## Changes

### 1. Modified: `adobe-plugin/index.js`
Add a new `applyC2PA()` function that:
- Uses batchPlay to export the active document as a temporary JPEG (`saveToJPEG` descriptor)
- Reads the exported file bytes using UXP's `localFileSystem` API
- Builds the C2PA claim JSON (matching the web app's claim structure: `c2pa.actions`, `c2pa.hash.data`)
- Calls `sign-c2pa-manifest` edge function via fetch (same auth pattern as existing `apiCall`)
- Calls `embed-c2pa-manifest` edge function with multipart/form-data (file + manifest + signature)
- Receives the protected image bytes back
- Writes the protected file to disk using UXP file API
- Places the protected image as a new "TSMO C2PA Protected" layer via batchPlay `placeEvent`

Integrate this into `protectDocument()` so it runs automatically after the existing protection logic succeeds (for both Basic and Pro tiers).

Add a C2PA status indicator in the UI showing "Content Credentials: Applied" after success.

### 2. Modified: `adobe-plugin/index.html`
- Add a C2PA status section below the protection status area:
  - Shows "Content Credentials: Pending / Applied / Failed"
  - Collapsible technical details (algorithm, manifest hash) matching the web app's pattern
- Add a "C2PA" badge next to the protection status when credentials are embedded

### 3. Modified: `adobe-plugin/styles.css`
- Style the C2PA status indicator and badge
- Match existing plugin design language (dark theme, consistent spacing)

### 4. Modified: `adobe-plugin/manifest.json`
- Bump version to `2.1.0`
- Add `localFilesystem` permission under `requiredPermissions` (needed for temp file read/write during export)

## Technical Considerations

- **UXP File API**: UXP provides `require('uxp').storage.localFileSystem` for file I/O. Temp files are written to a plugin-specific sandbox folder.
- **Multipart FormData**: UXP supports the `FormData` API, which is required for the `embed-c2pa-manifest` edge function.
- **File Size**: Photoshop documents can be large. The export will use JPEG quality 95 to balance fidelity and size within the edge function's limits.
- **Fallback**: If C2PA embedding fails (network error, unsupported format), the protection still succeeds with XMP-only metadata -- C2PA is additive, not blocking.
- **No new edge functions needed**: The existing `sign-c2pa-manifest` and `embed-c2pa-manifest` functions handle everything.

