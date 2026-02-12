
# Real CAI Trust List Integration

## Current Problem
The existing `fetch-c2pa-trust-list` edge function returns hardcoded placeholder data with fake fingerprints (e.g., `a1b2c3d4...`). No real certificate data is being used. The TrustListViewer component displays this fake data.

## What Will Change

### 1. Edge Function: Fetch and Parse Real PEM Trust Lists
Rewrite `supabase/functions/fetch-c2pa-trust-list/index.ts` to:
- Fetch the **official C2PA Trust List** PEM from `https://raw.githubusercontent.com/c2pa-org/conformance-public/refs/heads/main/trust-list/C2PA-TRUST-LIST.pem`
- Fetch the **legacy CAI Trust List** PEM from `https://contentcredentials.org/trust/anchors.pem`
- Parse each PEM certificate block, extracting:
  - Subject CN (Common Name), O (Organization), C (Country)
  - Validity dates (notBefore / notAfter) from the ASN.1 DER-encoded certificate
  - SHA-256 fingerprint computed from the raw DER bytes
  - Certificate type (root vs. intermediate) inferred from Basic Constraints CA flag
- Deduplicate across the two sources by fingerprint
- Return structured JSON with all real anchors plus the TSMO self-signed entry
- Fall back to a minimal bundled list if both fetches fail

### 2. Client Library Update
Update `src/lib/c2paTrustList.ts`:
- Add a `country` field to the `TrustAnchor` interface
- Update the bundled fallback to include a few real fingerprints for offline resilience

### 3. Enhanced Trust List Viewer
Update `src/components/admin/c2pa/TrustListViewer.tsx`:
- Add a "Source" column showing which trust list each anchor came from (Official C2PA / Legacy CAI / Bundled)
- Add a "Country" column
- Display full fingerprint in a tooltip/popover on hover
- Add search/filter input to find anchors by name or organization
- Show total counts by source in the summary bar
- Color-code rows: green for active, amber for expiring within 1 year, red for expired

## Technical Details

### PEM Parsing in Deno (Edge Function)
The edge function will:
1. Use `fetch()` to download both PEM files
2. Split on `-----BEGIN CERTIFICATE-----` / `-----END CERTIFICATE-----` markers
3. Base64-decode each certificate body to get raw DER bytes
4. Parse the DER/ASN.1 structure to extract Subject DN fields and Validity dates (using manual ASN.1 TLV parsing -- no external libraries needed for basic X.509 field extraction)
5. Compute SHA-256 fingerprint using Web Crypto API: `crypto.subtle.digest('SHA-256', derBytes)`
6. Extract the "Subject" line preceding each PEM block (both files annotate certificates with a label)

### Files Modified
- `supabase/functions/fetch-c2pa-trust-list/index.ts` -- full rewrite with real PEM fetching and parsing
- `src/lib/c2paTrustList.ts` -- interface updates and fallback refresh
- `src/components/admin/c2pa/TrustListViewer.tsx` -- enhanced UI with search, source column, tooltips
- `supabase/config.toml` -- no changes needed (function already configured with `verify_jwt = false` implicitly through defaults)
