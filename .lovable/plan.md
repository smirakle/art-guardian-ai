

## Fix: Comprehensive Web Scanner + Missing Database Columns

There are two separate issues causing the recurring errors in the logs.

---

### Issue 1: `comprehensive-web-scanner` receives wrong parameters

The `scheduled-scan-executor` calls the scanner with `{ artworkId }`, but the scanner expects `{ contentType, contentUrl, searchTerms, userId }`. The artworkId is never translated into these fields, so `contentType` logs as `undefined` and the `web_scans` insert fails because `user_id` is null.

**Fix in `scheduled-scan-executor/index.ts`:** Update `executeDeepScan()` to look up the artwork record first, then pass the correct fields to the scanner.

```text
Before:  invoke('comprehensive-web-scanner', { body: { artworkId, includeDeepWeb: true, scanDepth: 'comprehensive' } })
After:   1. Fetch artwork record (title, tags, file_paths, user_id)
         2. Generate a signed URL for the first file
         3. Invoke with { contentType: 'photo', contentUrl: signedUrl, searchTerms: [title, ...tags], includeDeepWeb: true, userId: artwork.user_id }
```

### Issue 2: `continuous-scan-scheduler` references missing columns

The `realtime_monitoring_sessions` table is missing `portfolio_id`, `last_scan_at`, and `platforms_enabled` columns. The scheduler tries to join on `portfolios` via a nonexistent `portfolio_id` and read these fields, causing query failures.

**Fix via migration:** Add the three missing columns to `realtime_monitoring_sessions`:
- `portfolio_id` (uuid, nullable, FK to `portfolios.id` with `ON DELETE SET NULL`)
- `last_scan_at` (timestamptz, nullable)
- `platforms_enabled` (text[], nullable)

---

### Changes Summary

| File / Resource | Change |
|---|---|
| `supabase/functions/scheduled-scan-executor/index.ts` | Rewrite `executeDeepScan()` to fetch artwork, build a signed URL, and pass proper parameters to the scanner |
| Database migration | Add `portfolio_id`, `last_scan_at`, `platforms_enabled` columns to `realtime_monitoring_sessions`; add FK constraint to `portfolios` |

### Technical Details

**scheduled-scan-executor `executeDeepScan` rewrite:**

```text
async function executeDeepScan(artworkId: string) {
  // 1. Fetch artwork from DB
  const { data: artwork } = await supabase
    .from('artwork')
    .select('id, user_id, title, tags, file_paths')
    .eq('id', artworkId)
    .maybeSingle();

  if (!artwork) throw new Error('Artwork not found: ' + artworkId);

  // 2. Build signed URL for first file
  let contentUrl;
  if (artwork.file_paths?.length > 0) {
    const { data: fileData } = await supabase.storage
      .from('artwork')
      .createSignedUrl(artwork.file_paths[0], 3600);
    contentUrl = fileData?.signedUrl;
  }

  // 3. Build search terms from title + tags
  const searchTerms = [artwork.title, ...(artwork.tags || [])].filter(Boolean);

  // 4. Invoke with correct parameters
  const { data, error } = await supabase.functions.invoke('comprehensive-web-scanner', {
    body: {
      contentType: 'photo',
      contentUrl,
      searchTerms,
      includeDeepWeb: true,
      userId: artwork.user_id
    }
  });

  if (error) throw error;
  return data;
}
```

**Migration SQL:**

```sql
ALTER TABLE realtime_monitoring_sessions
  ADD COLUMN IF NOT EXISTS portfolio_id uuid REFERENCES portfolios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_scan_at timestamptz,
  ADD COLUMN IF NOT EXISTS platforms_enabled text[];
```

