

# Add Full C2PA Conformance Suite to Protection Hub

## What Changes

The Protection Hub's "Content Credentials (C2PA)" section currently only lets users **generate** credentials. This plan adds the full suite from the admin conformance page -- **validation with side-by-side inspection**, **trust list viewer**, and **generator evidence with manifest downloads** -- directly into the Protection Hub's Protect tab.

## Layout

The existing C2PA card in the Protect tab (lines 251-272) will be expanded into a mini-tabbed section containing four sub-sections:

1. **Generate** -- The existing `C2PAProtection` component (unchanged)
2. **Validate** -- The `ValidatorEvidence` component (image upload, side-by-side thumbnail + JSON, copy/download manifest, trust status badges, export all)
3. **Trust List** -- The `TrustListViewer` component (shows CAI trust anchors used for verification)
4. **Generator Evidence** -- The `GeneratorEvidence` component (signed manifest JSON, JUMBF embedding, evidence package download)

## Technical Details

**File: `src/pages/ProtectionHub.tsx`**

- Import `ValidatorEvidence`, `TrustListViewer`, and `GeneratorEvidence` from `@/components/admin/c2pa/`
- Replace the single `C2PAProtection` card (lines 251-272) with a new card containing inner `Tabs` for the four sub-sections
- Each sub-tab renders the corresponding component directly -- no duplication of logic
- The card header keeps the Fingerprint icon, "Content Credentials (C2PA)" title, and tooltip

The admin conformance page remains unchanged -- the Protection Hub simply reuses the same components, giving consumer users access to the full validation and evidence toolkit.

