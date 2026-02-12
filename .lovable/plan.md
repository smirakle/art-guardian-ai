

# C2PA v2.2 Spec Conformance Upgrade

## Current State: Non-Conformant

After reviewing the full codebase against the C2PA v2.2 specification and the conformance explorer at spec.c2pa.org, here are the specific gaps:

### Gap 1: Instance ID URN Format (Wrong)
- **Current**: `urn:uuid:TSMO-ABCDEF123456` (custom format, deprecated scheme)
- **Required**: `urn:c2pa:<valid-uuid-v4>` (e.g., `urn:c2pa:e65c8514-7101-b615-28e4-4bd337f3f986`)
- **Files affected**: `src/lib/productionMetadataInjection.ts` (line 450), `src/components/admin/c2pa/GeneratorEvidence.tsx` (line 57), `src/components/ai-protection/C2PAProtection.tsx` (line 57), `adobe-plugin/index.js`

### Gap 2: No `claim_generator_info` Field
- **Current**: Only `claim_generator: 'TSMO/2.0'` (a plain string)
- **Required (v2.2)**: `claim_generator_info` is a structured array with `name`, `version`, and optional `icon` fields. The old `claim_generator` string is still permitted but `claim_generator_info` is the v2.2 standard structure.
- **Reference**: AWS MediaConvert uses `claim_generator_info: [{"name": "MediaConvert", "version": "1.0"}]`

### Gap 3: No Ingredient Support
- **Current**: The validator scans for the `c2pa.ingredient` label string but never parses it. The generator never creates ingredient entries.
- **Required (v2.2)**: Ingredients are a core concept. When a file is used as input to a process, it should be referenced as an ingredient with its own hash, instance ID, and relationship (`parentOf` or `componentOf`). The generator must support creating ingredient references and the validator must parse them.

### Gap 4: Manifest Context Version
- **Current**: `@context: 'https://c2pa.org/claim/1.0/'`
- **Required**: Should reference the v2.2 specification context

### Gap 5: No Trust List Integration
- **Current**: Self-signed fallback with no trust chain verification
- **Required**: Validator should check signatures against the CAI trust list. The conformance explorer at `spec.c2pa.org/conformance-explorer/` is the authoritative registry.

### Gap 6: Security Architecture Document Format
- **Current**: JSON export with custom structure
- **Required**: Should follow the C2PA Appendix C template format (structured document, not raw JSON)

---

## Implementation Plan

### Phase 1: Fix URN Format and Claim Structure (All Files)

Update every location that generates a C2PA manifest to use the correct v2.2 format:

**Files to modify:**
- `src/lib/productionMetadataInjection.ts` -- Change `instance_id` from `urn:uuid:${protectionId}` to `urn:c2pa:${crypto.randomUUID()}`
- `src/components/admin/c2pa/GeneratorEvidence.tsx` -- Same URN fix, add `claim_generator_info` array
- `src/components/ai-protection/C2PAProtection.tsx` -- Same URN fix, add `claim_generator_info` array
- `adobe-plugin/index.js` -- Same URN fix in the `applyC2PA()` function

New claim structure:
```text
{
  claim_generator: "TSMO/2.0 ai-protection-system",
  claim_generator_info: [
    { name: "TSMO AI Protection", version: "2.0" }
  ],
  instance_id: "urn:c2pa:<uuid-v4>",
  ...
}
```

### Phase 2: Add Ingredient Support

**New file: `src/lib/c2paIngredients.ts`**
- Define ingredient data structure per v2.2 spec
- Hash computation for ingredient assets (SHA-256)
- Build ingredient assertion with `relationship`, `title`, `format`, `instanceID`, `hash`, and `thumbnail` fields
- Support both `parentOf` (the asset this was derived from) and `componentOf` (an asset composited into this one) relationships

**Modify: `src/components/ai-protection/C2PAProtection.tsx`**
- Add an optional "Ingredients" section where users can attach source files
- Each ingredient gets hashed and included in the manifest's `c2pa.ingredient` assertion
- UI shows ingredient list with relationship type selector

**Modify: `src/components/admin/c2pa/GeneratorEvidence.tsx`**
- Support ingredient attachment in evidence generation
- Include ingredient data in the exported manifest JSON

**Modify: `supabase/functions/sign-c2pa-manifest/index.ts`**
- Accept and validate ingredient references in the claim
- Include ingredient hashes in the signed payload

**Modify: `supabase/functions/validate-c2pa-manifest/index.ts`**
- Parse ingredient assertions when found (currently only detects the label string)
- Return structured ingredient data in validation results

**Modify: `adobe-plugin/index.js`**
- When protecting a document, the current document state before protection becomes an ingredient with `parentOf` relationship

### Phase 3: Trust List Integration

**New file: `src/lib/c2paTrustList.ts`**
- Fetch and cache the CAI trust list
- Certificate chain validation logic
- Check signing certificate against known trust anchors

**Modify: `supabase/functions/validate-c2pa-manifest/index.ts`**
- After detecting a manifest, attempt to verify the signature against the trust list
- Return trust chain status in validation result (trusted / untrusted / self-signed)

**Modify: `src/lib/c2paValidation.ts`**
- Add `trustStatus` field to `C2PAValidationResult` interface
- Surface trust chain info in UI

### Phase 4: Security Architecture Document Reformat

**Modify: `src/components/admin/c2pa/SecurityArchitecture.tsx`**
- Restructure the export to follow the C2PA Appendix C template format
- Generate a proper document (PDF or structured text) rather than raw JSON
- Include all required sections: Product Overview, Target of Evaluation, Cryptographic Implementation, Threat Model, etc. in the prescribed template layout

### Phase 5: Update Spec References

**Modify: All manifest-generating code**
- Update `@context` from `'https://c2pa.org/claim/1.0/'` to reference v2.2
- Ensure all assertion labels match v2.2 naming conventions
- Update the `SecurityArchitecture.tsx` documentation to reference v2.2 throughout

---

## Files Summary

| Action | File | Changes |
|--------|------|---------|
| Modify | `src/lib/productionMetadataInjection.ts` | URN format, claim_generator_info, context version |
| Modify | `src/components/ai-protection/C2PAProtection.tsx` | URN format, claim_generator_info, ingredient UI |
| Modify | `src/components/admin/c2pa/GeneratorEvidence.tsx` | URN format, claim_generator_info, ingredient support |
| Modify | `src/components/admin/c2pa/SecurityArchitecture.tsx` | Document format per Appendix C template, v2.2 refs |
| Modify | `src/lib/c2paValidation.ts` | Add trustStatus to interface, ingredient parsing |
| Modify | `supabase/functions/sign-c2pa-manifest/index.ts` | Accept ingredients, validate v2.2 claim structure |
| Modify | `supabase/functions/validate-c2pa-manifest/index.ts` | Parse ingredients, trust chain check |
| Modify | `supabase/functions/embed-c2pa-manifest/index.ts` | Ingredient JUMBF boxes in superbox |
| Modify | `adobe-plugin/index.js` | URN format, claim_generator_info, ingredient (parentOf) |
| Create | `src/lib/c2paIngredients.ts` | Ingredient hashing, structure, relationship types |
| Create | `src/lib/c2paTrustList.ts` | Trust list fetching, certificate chain validation |

This brings TSMO from a roughly v1.0-level implementation to full v2.2 conformance across all three surfaces (web app, edge functions, Photoshop plugin).
