

# C2PA Conformance Evidence Generation

## What the C2PA Team Needs

The C2PA Conformance team has requested three deliverables:

1. **Sample signed manifests and supporting JSON files** -- actual output from TSMO's Generator pipeline showing a file protected with embedded C2PA credentials
2. **Validation results from their Conformant Image Library** -- proof that TSMO's Validator correctly detects C2PA manifests in 9 reference images (Pixel camera photos with existing C2PA credentials)
3. **Generator Product Security Architecture Document** -- a comprehensive document covering TSMO's security architecture per the C2PA Requirements Document Appendix C template

## Current State

- The signing (`sign-c2pa-manifest`), embedding (`embed-c2pa-manifest`), and validation (`validate-c2pa-manifest`) edge functions are deployed
- The `c2pa_signing_logs` table exists but has zero entries -- the full pipeline has never been exercised
- There is no admin UI or tool to batch-validate external files and export results
- There is no way to export signed manifest JSON for submission

## Plan

### Part 1: C2PA Conformance Test Page

Create a new admin page at `/admin/c2pa-conformance` with three sections:

**Section A -- Generator Evidence**
- Upload an image, run it through the full protection pipeline (sign + embed), and display the resulting:
  - Signed C2PA manifest JSON (downloadable as `.json`)
  - COSE Sign1 signature details (algorithm, fingerprint, mode)
  - The protected image file with embedded JUMBF (downloadable)
  - Signing log entry from the database
- A "Download Evidence Package" button that bundles: the original file, the protected file, the manifest JSON, and a signing summary into a ZIP-like download set

**Section B -- Validator Evidence (Conformant Image Library)**
- Ability to upload multiple files (the 9 reference images from the C2PA library)
- Run each through the `validate-c2pa-manifest` edge function
- Display results in a table: file name, C2PA detected (yes/no), claim generator, assertions found, format, raw box count
- "Export Results" button to download a JSON report of all validation results
- This proves TSMO can ingest and validate files with existing C2PA manifests as ingredients

**Section C -- Security Architecture Export**
- A structured form/document generator based on the C2PA Generator Product Security Architecture Document Template (Appendix C)
- Pre-fills known information about TSMO's architecture:
  - Signing algorithm (ES256 / ECDSA P-256)
  - Key management (Supabase Edge Function secrets, self-signed fallback)
  - JUMBF embedding approach (JPEG APP11, PNG caBX)
  - Cloud environment (Supabase Edge Functions on Deno Deploy)
  - Communication methods (HTTPS, Supabase auth)
  - Third-party services (Supabase, content delivery)
  - Target of Evaluation scope
- Exportable as a structured document (JSON or formatted text)

### Part 2: Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/admin/C2PAConformance.tsx` | Create | Main conformance evidence page |
| `src/components/admin/c2pa/GeneratorEvidence.tsx` | Create | Generator test and manifest export |
| `src/components/admin/c2pa/ValidatorEvidence.tsx` | Create | Batch validation of reference images |
| `src/components/admin/c2pa/SecurityArchitecture.tsx` | Create | Architecture document generator |
| `src/App.tsx` | Modify | Add route for `/admin/c2pa-conformance` |

### Part 3: Technical Details

**Generator Evidence Flow:**
1. User uploads an image on the conformance page
2. Frontend calls `signC2PAManifest()` to get a real ES256 signature
3. Frontend calls `embedC2PAManifest()` to write JUMBF into the file
4. Page displays the full manifest JSON, signature details, and offers downloads
5. The signing log entry is fetched from `c2pa_signing_logs` and displayed

**Validator Evidence Flow:**
1. User uploads the 9 reference JPEG files from the Google Drive library
2. Each file is sent to `validate-c2pa-manifest` edge function
3. Results are collected and displayed in a summary table
4. Export button generates a JSON report with all results, timestamps, and file details

**Security Architecture Data:**
- Pre-populated from TSMO's actual implementation
- Covers the Target of Evaluation (TOE) components: Supabase Edge Functions (Deno runtime), ECDSA P-256 key generation, COSE Sign1 envelope construction, JUMBF binary embedding, HTTPS transport, Supabase Auth (JWT), Supabase Secrets vault for key storage
- Exportable for submission alongside the other evidence

### Outcome

After implementation, you will be able to:
1. Generate and download real signed manifest evidence to send to C2PA
2. Upload the 9 reference images from their library and export validation results proving TSMO correctly detects C2PA credentials
3. Export a Security Architecture Document describing TSMO's Generator TOE
