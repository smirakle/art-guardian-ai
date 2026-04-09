

# Add Download Buttons to Dashboard Protected Art Cards

## Overview
The dashboard already shows real visual thumbnails of protected artwork (via signed URLs from the private `artwork` bucket). The missing piece is a **download button** on each card so users can download their protected files directly from the dashboard.

## Changes

### 1. Add download button to artwork cards in Dashboard.tsx
**File:** `src/pages/Dashboard.tsx`

- Import `Download` icon from lucide-react
- Add a download handler function that:
  - Creates a signed URL for the artwork file from Supabase storage (`artwork` bucket)
  - Triggers a browser download using an anchor element with `download` attribute
  - Shows loading state per-card while downloading
- Add a download button overlay on each artwork card (bottom-right or as a hover action), styled consistently with existing card design
- Add `downloading` state (`Set<string>`) to track which cards are actively downloading

### 2. Add download button to ProtectedItemsGallery plugin items
**File:** `src/components/dashboard/ProtectedItemsGallery.tsx`

- Add a download button to each `ThumbnailCard`
- Download logic checks `protected_file_path` first (from `ai-protected-files` bucket), then falls back to `metadata.thumbnailPath` (from `artwork` bucket)
- Also fetch `protected_file_path` in the query (add to select fields)
- Show download spinner per card

### 3. Also ensure real thumbnails load for plugin items
The `ProtectedItemsGallery` already loads thumbnails via `metadata.thumbnailPath` signed URLs. Additionally query `protected_file_path` so the download button can use the correct file for download (the full protected file, not the thumbnail).

## Technical Details
- Downloads use `supabase.storage.from('artwork').createSignedUrl()` or `supabase.storage.from('ai-protected-files').download()` depending on file source
- Browser download triggered via temporary `<a>` element with `href` set to signed URL and `download` attribute set to filename
- Download button appears on hover over the card image area, with a semi-transparent backdrop
- No new components or dependencies needed

