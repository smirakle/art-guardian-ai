

## Fix: `real-copyright-monitor` 400 Bad Request

### Root Cause

The `executeMonitoringScan()` function in `scheduled-scan-executor` calls `real-copyright-monitor` with only `{ artworkId }`, but the monitor requires both `artworkId` and `imageUrl`. Without `imageUrl`, it returns a 400 Bad Request.

### Fix

Update `executeMonitoringScan()` in `supabase/functions/scheduled-scan-executor/index.ts` (lines 162-172) to:

1. Fetch the artwork record to get `file_paths`
2. Generate a signed URL from Supabase storage
3. Pass both `artworkId` and `imageUrl` to `real-copyright-monitor`

### Updated Code

```text
async function executeMonitoringScan(artworkId: string) {
  console.log(`Executing monitoring scan for artwork: ${artworkId}`);

  // Fetch artwork to get file path
  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('id, file_paths')
    .eq('id', artworkId)
    .maybeSingle();

  if (artworkError) throw new Error(`Failed to fetch artwork: ${artworkError.message}`);
  if (!artwork) throw new Error(`Artwork not found: ${artworkId}`);

  // Generate signed URL for the image
  let imageUrl: string | undefined;
  if (artwork.file_paths?.length > 0) {
    const { data: fileData } = await supabase.storage
      .from('artwork')
      .createSignedUrl(artwork.file_paths[0], 3600);
    imageUrl = fileData?.signedUrl;
  }

  if (!imageUrl) {
    throw new Error(`No image URL available for artwork: ${artworkId}`);
  }

  // Call with both required parameters
  const { data, error } = await supabase.functions.invoke('real-copyright-monitor', {
    body: { artworkId, imageUrl }
  });

  if (error) throw error;
  return data;
}
```

### Changes Summary

| File | Change |
|---|---|
| `supabase/functions/scheduled-scan-executor/index.ts` | Update `executeMonitoringScan` to fetch artwork file path, generate signed URL, and pass `imageUrl` alongside `artworkId` |

This is a single function replacement (lines 162-172) with no other files affected.

