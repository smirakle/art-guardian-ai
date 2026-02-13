

# Fix Final C2PA Field Extraction Bugs

## Problem

The CBOR decode succeeds and returns 5 keys: `instanceID`, `claim_generator_info`, `created_assertions`, `signature`, `alg`. But two bugs prevent the data from reaching the output JSON:

1. **No `claim_generator` key in manifest**: Google Pixel C2PA v2.2 manifests don't include a standalone `claim_generator` string. The generator identity is only inside `claim_generator_info` as an object with `name` and `version`. The code needs to fall back to synthesizing `claimGenerator` from `claim_generator_info.name`.

2. **`claim_generator_info` is a single object, not an array**: The code at line 559 does `Array.isArray(claimGenInfo)` which returns `false` for `{"name": "Google C2PA SDK for Android", "version": "..."}`. It should also handle a single object by wrapping it in an array.

## Changes

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

### Fix 1: Handle single-object `claim_generator_info` (line 558-569)

Update the `claim_generator_info` extraction to handle both array and single-object formats:

```typescript
const claimGenInfo = obj.claim_generator_info || obj.claimGeneratorInfo || obj['claim-generator-info'];
if (claimGenInfo && typeof claimGenInfo === 'object') {
  const infoArray = Array.isArray(claimGenInfo) ? claimGenInfo : [claimGenInfo];
  claim.claimGeneratorInfo = infoArray
    .filter((i) => typeof i === 'object' && i !== null)
    .map((i) => {
      const info = i as Record<string, unknown>;
      return {
        name: String(info.name || ''),
        version: String(info.version || ''),
      };
    });
}
```

### Fix 2: Synthesize `claimGenerator` from `claim_generator_info` (after line 555)

If no direct `claim_generator` string was found, derive it from the parsed info:

```typescript
if (!claim.claimGenerator && claim.claimGeneratorInfo?.length) {
  const first = claim.claimGeneratorInfo[0];
  claim.claimGenerator = first.version
    ? `${first.name}/${first.version}`
    : first.name;
}
```

## Expected Result

After these two fixes, re-uploading the Google Pixel sample will produce:

- `claim_generator`: `"Google C2PA SDK for Android/780041847:780077845"`
- `claim_generator_info`: `[{"name": "Google C2PA SDK for Android", "version": "780041847:780077845"}]`
- `spec_version`: `"2.2"` (already working)
- Assertions and other fields remain as-is

The Validator Evidence side-by-side view will then show fully populated manifest JSON next to each image.
