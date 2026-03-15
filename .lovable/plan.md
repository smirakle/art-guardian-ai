

## Fix: Artwork Thumbnails Not Loading

**Root Cause**: The `artwork` storage bucket is **private**. The dashboard uses `getPublicUrl()` which returns a URL that gets a 403 error. Every other part of the codebase correctly uses `createSignedUrl()` instead.

### Changes

**`src/pages/SimpleDashboard.tsx`**:
- Replace the synchronous `getPublicUrl` call with an async signed URL approach
- Add a state map to hold signed URLs keyed by artwork ID
- Use a `useEffect` to batch-generate signed URLs for all artwork items when data loads
- Show a skeleton/loading state while URLs are being generated
- Set signed URL expiry to 1 hour (consistent with rest of codebase)

**`src/components/dashboard/ProtectedItemsGallery.tsx`** (ThumbnailCard):
- The thumbnail loading for plugin-protected items also uses `getPublicUrl` on line ~126 — update to use `createSignedUrl` for the thumbnail path as well

### Technical Approach

```text
artwork data loads → useEffect triggers → 
  Promise.all(artwork.map(art => createSignedUrl(art.file_paths[0], 3600)))
  → store results in state map { [artworkId]: signedUrl }
  → render images with signed URLs
```

No backend changes needed. Just switching from public to signed URL generation on the client side.

