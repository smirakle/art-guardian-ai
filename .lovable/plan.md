

# Fix C2PA Validator: Correct JUMBF Tree Traversal and CBOR Parsing

## Root Cause (Confirmed from Logs)

The edge function logs show:
```
JUMBF parsed: 1 top-level boxes, 18 total, 0 assertions, 0 ingredients, claimGen: null
```

**18 boxes are successfully parsed**, but zero data is extracted. The problem is in `extractClaimFromJUMBF` -- it looks for `c2pa.assertions` and `c2pa.claim` as **direct children** of the top-level `c2pa` box, but real-world C2PA v2.2 manifests (from Google Pixel, Adobe, etc.) have an extra nesting level:

```text
Real C2PA v2.2 Structure:
  jumb [label="c2pa"]           <-- manifest store
    jumb [label="urn:c2pa:..."] <-- individual manifest (THIS LEVEL IS MISSING FROM THE SEARCH)
      jumb [label="c2pa.assertions"]
        jumb [label="c2pa.actions"]
        jumb [label="c2pa.hash.data"]
      jumb [label="c2pa.claim"]
        c2cl (CBOR data)
      jumb [label="c2pa.signature"]
        c2cs (COSE Sign1)

TSMO's Own Structure (simpler, no intermediate manifest box):
  jumb [label="c2pa"]
    jumb [label="c2pa.assertions"]
    jumb [label="c2pa.claim"]
    jumb [label="c2pa.signature"]
```

The code currently only handles the TSMO structure, not the real-world one.

## Fix #1: Recursive Manifest Search in `extractClaimFromJUMBF`

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

Update `extractClaimFromJUMBF` to:
1. First try finding `c2pa.assertions` / `c2pa.claim` as direct children (TSMO format)
2. If not found, search one level deeper -- look inside child `jumb` boxes whose label starts with `urn:c2pa:` or any unlabeled superbox children
3. This handles both TSMO-generated and real-world manifests

```text
Search logic:
  c2paBox = find box with label "c2pa"
  assertionStore = c2paBox.children.find(label="c2pa.assertions")
  IF not found:
    FOR EACH child of c2paBox that is a "jumb":
      assertionStore = child.children.find(label="c2pa.assertions")
      IF found: use this child as the manifest box, break
```

## Fix #2: Improve CBOR Decoder for Real-World Claims

The `c2cl` content box in real C2PA images contains CBOR-encoded claim data. The CBOR decoder has edge cases that cause it to fail silently on complex real-world structures (e.g., tagged values, byte strings with embedded CBOR). Add more robust error handling and try multiple parse strategies:

1. Try CBOR decode from offset 0
2. If that fails, scan for CBOR map markers (`0xA0`-`0xBF` for small maps, `0xB9`/`0xBA` for larger maps) in the first 64 bytes and try decoding from each
3. The JSON fallback already exists and will catch TSMO manifests

## Fix #3: Handle Real Assertion Box Content Types

Real C2PA assertions use CBOR content boxes (type `cbor`, 4 bytes: `0x63626F72`). The current assertion parser only checks for boxes with `type === 'cbor'` or falls back to `children[1]`. Update to also check for `json` type boxes and generic content.

## Fix #4: Add Diagnostic Logging of Box Labels

Add a log line that prints all box labels found in the tree, so future debugging is instant:
```
[validate-c2pa] Box tree: c2pa > urn:c2pa:abc123 > [c2pa.assertions, c2pa.claim, c2pa.signature]
```

## Fix #5: Fix Embed Function Content Type

The `embed-c2pa-manifest` function stores the manifest as raw JSON text in the `c2cl` box (line 363: `new TextEncoder().encode(manifestJson)`). While this works, it should ideally store CBOR. For now, the validator's JSON fallback handles this, but the embed function should also fix the `c2pa.actions` assertion -- currently it puts the entire manifest JSON as the actions content, which is incorrect. The actions assertion should contain only the actions data.

## Technical Details

All changes are in one file: `supabase/functions/validate-c2pa-manifest/index.ts`

- Modify `extractClaimFromJUMBF` (lines 360-448) to add recursive manifest box search
- Add `logBoxTree` helper function for diagnostic logging
- Improve CBOR fallback logic in claim parsing
- Deploy and test with the user's Google Pixel sample images
