

# Update Security Architecture PDF with RLS Hardening Evidence

## What's Missing

The Security Architecture PDF (`SecurityArchitecturePDF.tsx`) currently documents:
- SCA / Dependabot scanning
- SBOM generation (CycloneDX v1.5)
- Vulnerability patch policy (90/180-day SLAs)
- Basic RLS mention for C2PA tables only

It does **not** document the security hardening just completed:
- Critical data exposure fixes (ip_lawyers, leads, promo_codes)
- Migration of 93 policies from `public` to `authenticated` role
- Admin-only restrictions on platform_api_configs
- Elimination of anonymous access to user-owned data

## Changes

**File: `src/components/admin/c2pa/SecurityArchitecturePDF.tsx`**

Update Section 5 (Security Controls) to add two new entries after the existing "Vulnerability Patch Policy" block:

1. **Row-Level Security Hardening** -- Document that all user-owned tables enforce `TO authenticated` policies, critical data exposures (attorney records, lead data, promo codes) were remediated, and 93 anonymous-vulnerable policies were migrated to require authentication.

2. **Access Control Model** -- Document the three-tier access model: public (community content only), authenticated (user-owned data with `auth.uid()` ownership checks), and admin (system configuration tables gated by role checks).

Update Section 7 (Threat Model) to add a new addressed threat:

3. **Anonymous data access** -- Add bullet: "Anonymous data access: all user-owned tables restricted to authenticated role; public role limited to community content."

These additions ensure the exported PDF fully documents the RLS posture for C2PA conformance auditors reviewing Requirement O.6 (Hosting Environment Security).

## Technical Details

- Only one file modified: `SecurityArchitecturePDF.tsx`
- Adds approximately 20 lines of `<Text>` elements within the existing Section 5 and Section 7 page structures
- No new pages needed; content fits within existing page layout
- The on-page UI component (`SecurityArchitecture.tsx`) does not need changes since it renders the PDF component dynamically
