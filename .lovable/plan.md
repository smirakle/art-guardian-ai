

# Add Missing C2PA Capabilities to TSMO

## Overview

TSMO currently generates C2PA manifest JSON and detects existing manifests in uploads, but is missing two critical capabilities needed for C2PA conformance:

1. **Real JUMBF Binary Embedding** -- Writing C2PA manifests into image files as proper JUMBF boxes (JPEG APP11 / PNG caBX chunks)
2. **Cryptographic Signing** -- Replacing placeholder `TSMO-SIG-...` hashes with real ES256 (ECDSA P-256) signatures
3. **Video C2PA Validation** -- Detecting C2PA manifests in MP4/MOV files (ISO BMFF JUMBF boxes)

## What Changes

### 1. New Edge Function: `embed-c2pa-manifest`

A new edge function that takes the C2PA manifest JSON + image bytes and produces a properly structured output file with embedded JUMBF boxes.

**For JPEG files:**
- Construct a JUMBF superbox with the `c2pa` label
- Wrap it in an APP11 marker segment (`0xFF 0xEB`)
- Insert after SOI and before the first non-APP marker

**For PNG files:**
- Construct a JUMBF superbox with the `c2pa` label
- Wrap it in a `caBX` ancillary chunk
- Insert before the IEND chunk

The JUMBF structure follows ISO 19566-5:

```text
JUMBF Superbox:
  Box Header: size (4 bytes) + type "jumb" (4 bytes)
  Description Box: size + type "jumd" + label "c2pa" + toggles
  Content Boxes:
    Claim Box (CBOR-encoded claim)
    Assertion Store Box
    Signature Box (COSE Sign1)
```

### 2. New Edge Function: `sign-c2pa-manifest`

Handles cryptographic signing using ES256:

- Accepts the manifest claim as CBOR
- Signs with the ECDSA P-256 private key (stored as a Supabase secret)
- Returns a COSE Sign1 envelope
- Initially uses a self-signed certificate; upgrades to CAI-issued cert when received

This function requires three secrets:
- `C2PA_SIGNING_CERT` -- X.509 certificate (PEM)
- `C2PA_PRIVATE_KEY` -- ECDSA P-256 private key (PEM)
- `C2PA_ISSUER_ID` -- CAI organization identifier

Until the user provides production certificates, the function will generate a self-signed keypair on first use and store it, allowing the full pipeline to work (manifests will be valid but not chain to the CAI trust list).

### 3. Update `productionMetadataInjection.ts`

Modify the Generator flow to:
- Call `sign-c2pa-manifest` to get a real COSE Sign1 signature instead of generating `TSMO-SIG-...` placeholders
- Call `embed-c2pa-manifest` to write the signed JUMBF into the output file
- Return the file with the manifest physically embedded in the binary

### 4. Update `validate-c2pa-manifest` for Video (MP4/MOV)

Add an ISO BMFF parser to the existing edge function:
- MP4/MOV files use ISO Base Media File Format
- C2PA manifests live in a top-level `uuid` box with the C2PA UUID
- Scan top-level boxes for the C2PA UUID marker (`d8fec3d6-1b0e-483c-9297-58b3dabb223b`)
- Extract and return detection results the same way as JPEG/PNG

### 5. Database: `c2pa_signing_logs` table

Track every signing operation for compliance:
- `id`, `user_id`, `file_name`, `protection_id`, `signing_algorithm`, `certificate_fingerprint`, `manifest_hash`, `created_at`
- RLS: users can only read their own logs

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/embed-c2pa-manifest/index.ts` | Create | Binary JUMBF embedding for JPEG and PNG |
| `supabase/functions/sign-c2pa-manifest/index.ts` | Create | ES256 cryptographic signing with COSE Sign1 |
| `supabase/functions/validate-c2pa-manifest/index.ts` | Modify | Add MP4/MOV ISO BMFF scanning |
| `src/lib/productionMetadataInjection.ts` | Modify | Replace placeholder signing with real edge function calls; add JUMBF embedding step |
| `src/lib/c2paValidation.ts` | Modify | Add video MIME type support |
| `src/components/ai-protection/C2PAValidationBadge.tsx` | Modify | Show video format detection results |
| Database migration | Create | `c2pa_signing_logs` table with RLS |

## Secrets Required

Three secrets will be needed (can use self-signed initially):
- `C2PA_SIGNING_CERT`
- `C2PA_PRIVATE_KEY`
- `C2PA_ISSUER_ID`

The signing edge function will auto-generate a self-signed keypair if these are not yet configured, so the pipeline works immediately without blocking on CAI certificate issuance.

## Outcome

After implementation, TSMO will:
- Physically embed C2PA JUMBF manifests into JPEG and PNG files (Generator)
- Sign manifests with real ES256 cryptographic signatures (Generator)
- Detect C2PA manifests in JPEG, PNG, MP4, and MOV files (Validator)
- Log all signing and validation operations for audit compliance
- Be ready for production CAI certificates when issued

