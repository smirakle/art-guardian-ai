

## Problem: "Tree" file shows no protection level

**Root Cause**: The Upload wizard's database insert (line 229-239 in `Upload.tsx`) is missing two critical fields:
- `ai_protection_enabled` — not set, defaults to `null`/`false`
- `ai_protection_level` — not set, defaults to `null`

On the Dashboard, line 205 does `art.ai_protection_level || 'standard'`, which would fall back to `'standard'` for `null`. However, `ai_protection_enabled` being `null`/`false` means the "AI Shield" badge on line 286 doesn't render. Combined with no protection level color mapping for unexpected values, the card appears to show weak/no protection indicators.

**Fix**: Update the artwork insert in `src/pages/Upload.tsx` to include the protection fields:

```tsx
// Line 229-239: Add missing protection fields
.insert({
  user_id: user.id,
  title: artworkTitle,
  description: description || null,
  category,
  tags: tags.length > 0 ? tags : null,
  license_type: licenseType || null,
  file_paths: allPaths,
  enable_watermark: enableWatermark,
  ai_protection_enabled: true,        // ← ADD
  ai_protection_level: 'standard',    // ← ADD
  status: 'protected'
})
```

**Secondary fix**: Update the Dashboard fallback on line 205 to be more robust, ensuring even edge cases display correctly:

```tsx
const protectionLevel = art.ai_protection_level && art.ai_protection_level !== 'none' 
  ? art.ai_protection_level 
  : 'standard';
```

### Files to change
1. **`src/pages/Upload.tsx`** — Add `ai_protection_enabled: true` and `ai_protection_level: 'standard'` to the artwork insert
2. **`src/pages/Dashboard.tsx`** — Harden the fallback logic for protection level display

### Existing data
The "Tree" file already in the database still has `null` for these fields. The Dashboard fallback fix will handle this. Optionally, we can run a one-time SQL update to fix existing records:
```sql
UPDATE artwork SET ai_protection_enabled = true, ai_protection_level = 'standard' 
WHERE ai_protection_level IS NULL AND status = 'protected';
```

