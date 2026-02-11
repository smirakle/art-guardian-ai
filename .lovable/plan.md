

# C2PA Manifest Validation for Incoming Images

## Overview
Add the ability to detect and read existing C2PA manifests in user-uploaded images before TSMO applies its own protection. This ensures TSMO acts as both a **Validator** and **Generator** per the C2PA administrator's guidance -- preserving provenance chains rather than silently discarding them.

## Architecture

The solution has three layers:

1. **Edge Function** (`validate-c2pa-manifest`) -- Parses uploaded image bytes to detect JUMBF (ISO 19566-5) boxes containing C2PA manifest stores, extracts manifest JSON, and returns validation results
2. **Client Library** (`src/lib/c2paValidation.ts`) -- Calls the edge function and provides typed results
3. **UI Integration** -- Shows C2PA status on the upload/protection flow so users know if their image already carries content credentials

## Technical Approach

### Why not `@contentauth/c2pa-node`?
That library requires native Rust binaries and won't run in Deno/Supabase Edge Functions. Instead, we'll do **binary JUMBF box detection** directly:

- **JPEG**: Scan for APP11 markers (`0xFF, 0xEB`) with JUMBF content type `c2pa` at known offsets
- **PNG**: Scan for `caBX` ancillary chunks (the C2PA-designated PNG chunk type)
- The JUMBF superbox for C2PA uses the label `c2pa` (bytes `63 32 70 61`)

This gives us reliable **detection** of whether a C2PA manifest exists and basic extraction of the manifest label/structure, without needing full cryptographic signature validation (which requires the CAI trust list and signing certificates).

### What gets detected vs. validated
- **Detected**: Presence of C2PA JUMBF boxes, manifest label, claim generator string
- **Not validated** (yet): Cryptographic signature verification -- this requires production C2PA signing certificates which are pending from CAI

## Implementation Steps

### 1. New Edge Function: `validate-c2pa-manifest`

Create `supabase/functions/validate-c2pa-manifest/index.ts`:

- Accepts multipart form upload (image file)
- Reads raw bytes and scans for JUMBF markers based on image format
- For JPEG: finds APP11 segments, checks for `JP\0\0` JUMBF magic and `c2pa` label
- For PNG: finds `caBX` chunks
- Returns JSON with:
  - `hasC2PA`: boolean
  - `manifestFound`: boolean
  - `claimGenerator`: string (if extractable)
  - `assertions`: array of detected assertion types
  - `format`: detected image format
  - `rawBoxCount`: number of JUMBF boxes found

### 2. Client Library: `src/lib/c2paValidation.ts`

- `validateC2PAManifest(file: File)` -- calls the edge function
- `C2PAValidationResult` interface with typed fields
- Used by upload components to show C2PA status before protection

### 3. UI Integration

Update the protection flow components to:
- Call C2PA validation when a user uploads an image
- Show a badge/banner if existing C2PA credentials are detected (e.g., "This image has Content Credentials from Adobe Photoshop")
- Warn that applying TSMO protection will add a new manifest entry to the provenance chain
- Display in `AITrainingProtectionDashboard` and `ProductionMetadataSettings`

### 4. Database: `c2pa_validation_logs` table

Track validation results for compliance/audit:
- `id`, `user_id`, `file_name`, `file_type`, `has_c2pa`, `manifest_data` (JSONB), `created_at`
- RLS: users can only read their own logs

## Technical Details

### JUMBF Detection in JPEG

```text
JPEG structure:
  SOI (0xFFD8)
  ...
  APP11 marker (0xFFEB)
    Length (2 bytes)
    "JP" box: 4-byte size + "jumb" type
    Content type box with label "c2pa"
    Manifest store data
  ...
```

### JUMBF Detection in PNG

```text
PNG structure:
  Signature (8 bytes)
  ...
  caBX chunk:
    Length (4 bytes)
    Type: "caBX" (4 bytes)
    JUMBF superbox data
    CRC (4 bytes)
  ...
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/validate-c2pa-manifest/index.ts` | Create -- JUMBF parser edge function |
| `src/lib/c2paValidation.ts` | Create -- client library |
| `src/components/ai-protection/C2PAValidationBadge.tsx` | Create -- UI badge component |
| `src/components/ai-protection/AITrainingProtectionDashboard.tsx` | Modify -- add C2PA check on upload |
| `src/components/ai-protection/ProductionMetadataSettings.tsx` | Modify -- show C2PA status |
| Database migration | Create `c2pa_validation_logs` table with RLS |

