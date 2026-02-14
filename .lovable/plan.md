

# Align Consumer C2PA Badge with Conformance Program Capabilities

## Summary

The consumer-side `C2PAValidationBadge` uses the same validation engine as the Conformance Program's Validator Evidence tool, but it currently hides several important fields. This plan brings the consumer badge to feature parity while keeping the UI clean for non-technical users.

## What's Missing on the Consumer Side

| Capability | Conformance Side | Consumer Side |
|---|---|---|
| Trust status (trusted/self-signed/expired) | Shown in JSON | Not displayed |
| Claim generator info (name + version) | Shown in JSON | Not displayed |
| Spec version (e.g. "2.2") | Shown in JSON | Not displayed |
| Trust reason text | Shown in JSON | Not displayed |
| Error details | Shown in JSON | Not displayed |
| Audit log completeness | Full data logged | Partial (missing 5 fields) |

The core validation logic (CBOR parsing, JUMBF extraction, hash binding, trust anchor checks) is identical -- both call the same `validateC2PAManifest` edge function. The gap is purely in what the consumer UI shows and what gets saved to the audit log.

## Proposed Changes

### 1. Add Trust Status Indicator to Consumer Badge

Display a colored badge showing trust status next to the "Content Credentials Detected" label:
- **Trusted** (green) -- signed by a known CAI trust anchor
- **Self-signed** (yellow) -- valid signature but not from a trusted CA
- **Expired** (orange) -- certificate has expired
- **Untrusted/Unknown** (gray) -- no trust chain verified

This is the most important missing piece -- users need to know if credentials are actually trustworthy, not just present.

### 2. Show Spec Version and Generator Info

Add a small detail line below the claim generator showing:
- Spec version (e.g., "C2PA v2.2")
- Generator info name and version when available

These will appear in the existing expanded alert view, keeping the compact badge unchanged.

### 3. Show Error Details When Validation Partially Fails

If `result.error` is set but `hasC2PA` is still true (partial parse), display a subtle warning note so users know the credentials may be incomplete.

### 4. Complete the Audit Log

Update the `logC2PAValidation` call in the consumer badge to include all fields that the conformance side logs:
- `claimGeneratorInfo`
- `ingredients`
- `trustStatus`
- `trustReason`
- `specVersion`
- `error`

## Technical Details

**File: `src/components/ai-protection/C2PAValidationBadge.tsx`**

- In the `runValidation` function (line 36-41), expand the manifest data object passed to `logC2PAValidation` to include all fields matching the conformance side.
- In the full (non-compact) success view (lines 95-135):
  - Add a trust status badge after the "Content Credentials Detected" heading.
  - Add a spec version line below the claim generator source line.
  - Add `claimGeneratorInfo` details (name/version) when available.
  - Add an error/warning note if `result.error` is present.
- The compact badge (lines 82-92) will get a trust-status color variation (green for trusted, yellow for self-signed, gray for unknown).

No changes needed to the edge function or the validation library -- the data is already returned, it just needs to be rendered and logged.

