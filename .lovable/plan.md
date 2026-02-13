

# Fix the C2PA Validator to Produce Real Manifest Data (Not Empty Summaries)

## The Real Problem

The exported JSONs are empty because the **validator edge function itself returns empty data**. Looking at the database:

- Every validation result shows: `claimGenerator: null`, `assertions: []`, `ingredients: []`, `rawBoxCount: 0`
- The `hasC2PA` flag is `true` (binary detection works), but the JUMBF parser fails to extract any structured content
- This means no amount of UI or export changes will help -- the problem is in the binary parsing logic of the `validate-c2pa-manifest` edge function

## Root Causes

The JPEG JUMBF extractor (`extractJUMBFFromJPEG`) has a structural issue: it skips the first 12 bytes assuming a fixed "JUMBF envelope" format (`segStart + 12`), but real-world C2PA manifests (from Adobe, Google Pixel cameras, etc.) use varying APP11 segment structures. If the offset is wrong, the JUMBF parser receives misaligned data and silently returns no boxes.

Additionally, for TSMO's own embedded manifests, the `embed-c2pa-manifest` function stores JSON-based manifests rather than true CBOR-encoded JUMBF superboxes, so the validator's CBOR decoder finds nothing to parse.

## Changes

### 1. Fix JPEG APP11 JUMBF Extraction (Edge Function)

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

Update `extractJUMBFFromJPEG` to:
- Properly parse the APP11 segment header according to ISO 19566-5 (the Common Identifier field `JP` + box number + total boxes before JUMBF data)
- Handle multi-segment APP11 (reassemble fragmented JUMBF across multiple APP11 markers)
- Add fallback: if JUMBF box parsing returns 0 boxes, try parsing from different offsets within the segment to handle variant padding

### 2. Add TSMO-Manifest Aware Parsing

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

After the JUMBF parser returns 0 boxes, add a JSON-text fallback that scans APP11 segment data for TSMO's JSON-format manifests:
- Try `JSON.parse()` on the segment data
- Extract `claim_generator`, `assertions`, `claim_generator_info`, `instance_id` directly from the JSON
- This ensures round-trip validation (Generator -> Embed -> Validate) produces real results

### 3. Improve JUMBF Box Count Reporting

Currently `rawBoxCount` stays at 0 even when `hasC2PA` is true. Update the scanner to count the actual APP11/caBX segments found (even if parsing fails), so the exported evidence at least shows detection occurred at the binary level.

### 4. Add Detailed Logging for Debugging

Add hex-dump logging of the first 64 bytes of extracted JUMBF data so we can diagnose parsing failures from the edge function logs. This will be critical for debugging issues with C2PA's reference images.

### 5. Re-validate and Re-export

After deploying the fixed edge function:
- The Validator Evidence tool will produce real results (claim generators, assertions, ingredients, trust status) instead of empty fields
- The Conformance Exporter will then export meaningful JSON files with actual manifest data
- The user can re-upload their sample images through the Validator Evidence tool and get proper conformant results

## Technical Details

- The APP11 marker segment for C2PA follows this structure: `FF EB [length] [CI: 4A50] [En: 2 bytes] [Z: 4 bytes] [LBox + TBox JUMBF data...]`
- The current code assumes the envelope is always 12 bytes, but the CI (Common Identifier) can be 2 bytes (`JP`) not 4, and the sequence number fields vary
- Real-world Adobe/Pixel C2PA manifests use CBOR-encoded claims inside proper `jumb/jumd/c2cl/c2cs` box hierarchies
- TSMO's own embedded manifests use JSON-in-JUMBF, which requires the text fallback path

