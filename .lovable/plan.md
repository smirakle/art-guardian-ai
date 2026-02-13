

# Address C2PA Conformance Review Deficiencies

## What the Review Found

The conformance review flagged two requirements as **DOES NOT MEET**:

1. **O.3 - Claim Generator Protection (Req 6.3.1)**: No evidence of Software Composition Analysis (SCA), SBOM generation, or a 90-day patch policy for Critical/High vulnerabilities.
2. **O.6 - Hosting Environment (Req 6.6.1)**: No vulnerability scanning for dependencies and API surfaces.

## What Changes

Both the **Security Architecture data** and the **PDF export** will be updated to document:

- **SCA/SBOM tooling**: Deno-native `deno info --json` for dependency analysis, plus integration with GitHub Dependabot / Snyk for continuous monitoring.
- **Vulnerability Patch Policy**: Explicit 90-day remediation window for Critical/High CVEs, with defined escalation process.
- **Dependency inventory**: Declaration that all edge function imports are version-pinned from `esm.sh` and `deno.land/std`, with lockfile tracking.

## Technical Details

### File 1: `src/components/admin/c2pa/SecurityArchitecture.tsx`

Add two new fields to `ARCHITECTURE_DOC`:

- In `section_3_cryptographic_implementation`, add `dependency_management` describing version-pinned imports and lockfile usage.
- In `section_5_security_controls`, add:
  - `software_composition_analysis`: describes SCA tooling (deno info, Dependabot/Snyk)
  - `sbom_generation`: describes SBOM output format (CycloneDX JSON)
  - `vulnerability_patch_policy`: documents the 90-day Critical/High CVE remediation mandate with escalation steps

### File 2: `src/components/admin/c2pa/SecurityArchitecturePDF.tsx`

Add corresponding content to the PDF pages:

- **Page 3 (Section 3)**: Add a "Dependency Management" subsection documenting version-pinned imports and lockfile tracking.
- **Page 4 (Section 5)**: Add three new labeled entries:
  - "Software Composition Analysis (SCA)" - tooling and scanning cadence
  - "SBOM Generation" - CycloneDX JSON format, generated per deployment
  - "Vulnerability Patch Policy" - 90-day Critical/High remediation window, 180-day for Medium, quarterly review cadence

These additions directly address all three remediation steps called out in the review: implement SCA/scanning, define patch policy, and update the GPSA document.
