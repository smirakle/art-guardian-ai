# C2PA v2.2 Full Conformance Plan

## Overview
Bring TSMO's C2PA implementation to full v2.2 spec conformance across Generator and Validator products. Target: Assurance Level 1 (software-based ES256 signing).

---

## Phase 1: JUMBF Superbox Structure Fix (Foundation)
**Goal:** Make the JUMBF binary structure spec-compliant per ISO 19566-5 and C2PA v2.2 §6.
**Priority:** HIGHEST — everything depends on correct binary format.

### Tasks:
1. **Add UUID type field to JUMD description box** — the C2PA JUMBF description box requires a 16-byte UUID (`6332 7061-0011-0010-8000-00AA00389B71`) before the label, per ISO 19566-5 §8.
2. **Add Assertion Store superbox** — wrap assertion boxes (actions, ingredients, hash.data) inside a `c2as` (assertion store) JUMBF superbox, nested inside the main `c2pa` superbox.
3. **Add Claim box (`c2cl`)** — CBOR-encoded claim referencing assertion URIs and hash bindings.
4. **Add Claim Signature box (`c2cs`)** — COSE Sign1 envelope wrapping the claim hash.
5. **Restructure `buildC2PASuperbox()`** — correct nesting: `c2pa` superbox → { description, assertion store, claim, claim signature }.

### Files:
- `supabase/functions/embed-c2pa-manifest/index.ts` (major refactor)

---

## Phase 2: CBOR Claim Parsing in Validator
**Goal:** Replace string-pattern matching with proper CBOR deserialization.
**Priority:** HIGH — needed for validator to understand the new structure.

### Tasks:
1. **Add CBOR decoding to `validate-c2pa-manifest`** — use lightweight CBOR decode to parse the claim box content from JUMBF.
2. **Extract structured claim fields** — `dc:title`, `claim_generator`, `claim_generator_info[]`, `assertions[]` (with URIs and hashes), `ingredients[]`, `signature` reference.
3. **Verify claim hash binding** — compute SHA-256 of the claim CBOR bytes and compare against the hash in the COSE Sign1 payload.
4. **Return structured validation result** — populate `C2PAValidationResult` with parsed fields instead of regex-matched strings.

### Files:
- `supabase/functions/validate-c2pa-manifest/index.ts` (major update)
- `src/lib/c2paValidation.ts` (update types if needed)

---

## Phase 3: Asset Hash Binding (`c2pa.hash.data`)
**Goal:** Compute and verify the content hash that binds the manifest to the actual asset bytes.
**Priority:** HIGH — core integrity mechanism required by spec.

### Tasks:
1. **Compute `c2pa.hash.data` during signing** — accept the file's SHA-256 hash (computed client-side) and include it as a `c2pa.hash.data` assertion in the claim. The hash covers the asset bytes excluding the manifest itself (exclusion ranges).
2. **Define exclusion ranges** — for JPEG: exclude the APP11 segment bytes. For PNG: exclude the caBX chunk bytes. Store exclusion offset/length in the `c2pa.hash.data` assertion.
3. **Verify hash on validation** — after extracting the manifest, recompute the asset hash with exclusion ranges and compare against the stored `c2pa.hash.data` value.
4. **Client-side hash computation** — compute SHA-256 of the file before upload and pass to the signing edge function.

### Files:
- `src/components/ai-protection/C2PAProtection.tsx` (compute hash before upload)
- `supabase/functions/sign-c2pa-manifest/index.ts` (include hash assertion)
- `supabase/functions/embed-c2pa-manifest/index.ts` (record exclusion ranges)
- `supabase/functions/validate-c2pa-manifest/index.ts` (verify hash)

---

## Phase 4: Ingredient Support (End-to-End)
**Goal:** Wire ingredient data structures into the full pipeline: UI → manifest → JUMBF embedding.
**Priority:** MEDIUM — builds on correct JUMBF + claim structure from Phases 1-3.

### Tasks:
1. **Add ingredient selector to C2PAProtection component** — allow users to attach source/parent files during protection. Compute SHA-256 hash of each ingredient file.
2. **Include `c2pa.ingredient` assertions in manifest claim** — when signing, pass ingredient data to `sign-c2pa-manifest`. Build ingredient assertion boxes with `dc:title`, `dc:format`, `instanceID`, `relationship`, and `data.hash`.
3. **Add ingredient boxes to JUMBF assertion store** — in `embed-c2pa-manifest`, serialize each ingredient assertion as a JUMBF content box inside the assertion store.
4. **Update GeneratorEvidence** — show ingredient data in conformance evidence export.

### Files:
- `src/components/ai-protection/C2PAProtection.tsx` (update)
- `src/lib/c2paIngredients.ts` (already exists, wire in)
- `supabase/functions/sign-c2pa-manifest/index.ts` (update)
- `supabase/functions/embed-c2pa-manifest/index.ts` (update)
- `src/components/admin/c2pa/GeneratorEvidence.tsx` (update)

---

## Phase 5: Trust List Integration (Real Anchors)
**Goal:** Replace hardcoded placeholder anchors with real CAI trust anchors and provide admin UI.
**Priority:** MEDIUM — independent but needed for full validation.

### Tasks:
1. **Create `fetch-c2pa-trust-list` edge function** — proxy to fetch trust anchors from the CAI ecosystem. Returns structured JSON with fingerprints, orgs, validity dates.
2. **Update `c2paTrustList.ts`** — consume the edge function instead of hardcoded anchors. Cache in localStorage with 24h TTL. Fallback to bundled snapshot if fetch fails.
3. **Build Trust List Viewer component** — new section in C2PA Conformance admin page showing all anchors in a table (CN, Org, Fingerprint, Valid From/To, Status). Include refresh button.
4. **Wire `verifyCertificateChain()` into validator results** — display trust status in validation UI with matched anchor details.

### Files:
- `supabase/functions/fetch-c2pa-trust-list/index.ts` (new)
- `src/lib/c2paTrustList.ts` (update)
- `src/components/admin/c2pa/TrustListViewer.tsx` (new)
- `src/pages/admin/C2PAConformance.tsx` (update)

---

## Phase 6: Security Architecture Document Export
**Goal:** Export a proper Security Architecture document (PDF) instead of raw JSON.
**Priority:** LOW — documentation, can be done anytime.

### Tasks:
1. **Create PDF export using `@react-pdf/renderer`** (already installed):
   - Title page with product name, version, date
   - TOE (Target of Evaluation) description
   - Cryptographic architecture (ES256, key storage in Supabase secrets)
   - Trust model (trust list integration, certificate chain validation)
   - Data flow diagrams (text-based)
   - Threat model summary
   - Conformance checklist (Generator + Validator requirements)
2. **Add "Export PDF" button** to SecurityArchitecture component.
3. **Structure matches C2PA Conformance Program Appendix C template format.**

### Files:
- `src/components/admin/c2pa/SecurityArchitecturePDF.tsx` (new)
- `src/components/admin/c2pa/SecurityArchitecture.tsx` (update)

---

## Implementation Order
```
Phase 1 (JUMBF) → Phase 2 (CBOR) → Phase 3 (Hash Binding) → Phase 4 (Ingredients) → Phase 5 (Trust List) → Phase 6 (Security Doc)
```

## Success Criteria
- [ ] JUMBF superbox contains: description (with UUID), assertion store, claim (CBOR), claim signature (COSE Sign1)
- [ ] Validator can CBOR-decode claims and verify COSE signatures
- [ ] `c2pa.hash.data` binds manifest to asset bytes with correct exclusion ranges
- [ ] Ingredients are attached via UI, serialized in claims, embedded in JUMBF
- [ ] Trust list fetches real CAI anchors and validates certificate chains
- [ ] Security Architecture exports as formatted PDF matching Appendix C

## Files Summary

| Phase | Action | File | Changes |
|-------|--------|------|---------|
| 1 | Refactor | `supabase/functions/embed-c2pa-manifest/index.ts` | Full JUMBF restructure with UUID, assertion store |
| 2 | Update | `supabase/functions/validate-c2pa-manifest/index.ts` | CBOR decoding, structured claim parsing |
| 2 | Update | `src/lib/c2paValidation.ts` | Type updates for parsed results |
| 3 | Update | `src/components/ai-protection/C2PAProtection.tsx` | Client-side hash computation |
| 3 | Update | `supabase/functions/sign-c2pa-manifest/index.ts` | Hash assertion in claim |
| 3 | Update | `supabase/functions/embed-c2pa-manifest/index.ts` | Exclusion ranges |
| 3 | Update | `supabase/functions/validate-c2pa-manifest/index.ts` | Hash verification |
| 4 | Update | `src/components/ai-protection/C2PAProtection.tsx` | Ingredient selector UI |
| 4 | Wire | `src/lib/c2paIngredients.ts` | Already exists, integrate |
| 4 | Update | `supabase/functions/sign-c2pa-manifest/index.ts` | Ingredient assertions |
| 4 | Update | `supabase/functions/embed-c2pa-manifest/index.ts` | Ingredient JUMBF boxes |
| 4 | Update | `src/components/admin/c2pa/GeneratorEvidence.tsx` | Ingredient evidence |
| 5 | Create | `supabase/functions/fetch-c2pa-trust-list/index.ts` | Trust list proxy |
| 5 | Update | `src/lib/c2paTrustList.ts` | Real anchor fetching |
| 5 | Create | `src/components/admin/c2pa/TrustListViewer.tsx` | Admin UI |
| 5 | Update | `src/pages/admin/C2PAConformance.tsx` | Add viewer section |
| 6 | Create | `src/components/admin/c2pa/SecurityArchitecturePDF.tsx` | PDF generator |
| 6 | Update | `src/components/admin/c2pa/SecurityArchitecture.tsx` | PDF export button |
