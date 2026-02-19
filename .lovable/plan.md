
# Why TSMO Is Not Passing C2PA Conformance

## Root Cause Analysis

There are TWO distinct problems blocking conformance. One is a missing credential (external action required), and one is a fixable technical gap in the evidence package.

---

## Problem 1: Missing Production Signing Credentials (Critical — External Action Required)

The live readiness check confirms all 3 credentials are absent:

| Secret | Status | Impact |
|---|---|---|
| `C2PA_PRIVATE_KEY` | Missing | Signatures use throwaway runtime keys |
| `C2PA_SIGNING_CERT` | Missing | No trusted X.509 certificate chain |
| `C2PA_ISSUER_ID` | Missing | Not registered with CAI |

Without these, every manifest is signed in **self-signed mode**. Any C2PA-compliant validator (including the CAI's own tools) will flag these as **"untrusted"** because the certificate is not chained to a recognized trust anchor.

**This cannot be fixed in code.** These credentials must be obtained from:
- **SSL.com** or **DigiCert** for the X.509 signing certificate
- **The Content Authenticity Initiative (CAI)** for the Issuer ID / Organization registration

---

## Problem 2: Evidence Package Is Incomplete (Fixable Now)

The conformance reviewers need both a **protected image** (a real image file with the JUMBF manifest embedded) AND a correctly structured **manifest JSON** side by side, exactly as shown in the uploaded PDF. Currently:

- The Generator Evidence tool produces the PDF report — but the PDF shows `signing_mode: "self-signed"` which immediately flags the submission.
- The evidence checklist in the PDF marks `✓ JUMBF Embedded` but this depends on whether the edge function succeeded. When it fails silently, the PDF still shows the checkmark.
- The PDF's conformance checklist needs to honestly reflect the current signing mode — if self-signed, it must say **"Self-Signed (Production Credentials Required)"** instead of implying it is trusted.
- The Conformance Exporter exports JSON only — but reviewers expect to also receive the actual protected image file alongside the manifest.

---

## What Will Be Fixed

### Change 1: Update `GeneratorEvidencePDF.tsx`
- In the **Evidence Summary** section, change the conformance checklist to reflect signing mode honestly:
  - If `signingMode === 'self-signed'`, show a warning row: "⚠ Signing mode: SELF-SIGNED — Production credentials required for conformance"
  - If `signingMode === 'production'`, show: "✓ Production certificate chain verified"
- Add a dedicated **"Signing Mode"** alert box at the top of the signing details page so reviewers see it immediately.

### Change 2: Update `GeneratorEvidence.tsx`
- When downloading the evidence package, if `protectedBlob` is null (JUMBF embedding failed), show a clear toast warning rather than silently omitting the file.
- Add a status indicator in the UI that explicitly shows **"Self-Signed Mode"** in amber/yellow (instead of the current green badge that looks like success) so the operator knows the submission is not yet production-ready.
- Rename the green "Signed (self-signed)" badge to an amber **"Self-Signed — Not Conformance Ready"** badge when in self-signed mode.

### Change 3: Add a Production Readiness Banner to `C2PAConformance.tsx`
- Add a persistent top-of-page banner that reads: **"Production credentials are not configured. All manifests are self-signed and will not pass conformance review. Add C2PA_PRIVATE_KEY, C2PA_SIGNING_CERT, and C2PA_ISSUER_ID to your Supabase edge function secrets to enable production signing."**
- Link directly to the Supabase secrets settings page.
- Dismiss-able once the credentials are added (checks the readiness endpoint on load).

---

## Technical Summary

```text
Current State:
  sign-c2pa-manifest → no C2PA_PRIVATE_KEY found → generates ephemeral keypair
  → signs manifest → COSE Sign1 envelope is valid cryptographically
  → but certificate has NO chain to CAI trust list
  → any C2PA validator returns trustStatus: "untrusted" or "self-signed"
  → CAI reviewer rejects submission

Required State:
  C2PA_PRIVATE_KEY (ES256 PEM) + C2PA_SIGNING_CERT (X.509 PEM from SSL.com/DigiCert)
  → sign-c2pa-manifest uses production key
  → certificate chains to recognized CAI trust anchor
  → validator returns trustStatus: "trusted"
  → submission passes
```

---

## Files Changed

1. `src/components/admin/c2pa/GeneratorEvidencePDF.tsx` — honest signing mode display
2. `src/components/admin/c2pa/GeneratorEvidence.tsx` — amber badge for self-signed, warning on missing JUMBF
3. `src/pages/admin/C2PAConformance.tsx` — production readiness banner at top of page
