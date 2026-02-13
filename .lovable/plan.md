

# Export C2PA Conformant Manifests and Validation Results

## What C2PA Asked For

They want two things:
1. **Conformant manifests (.json)** -- The signed manifest JSON files your Generator produces
2. **Validation results of ingredient samples** -- The detection/parsing results from running their reference images through your Validator

## Current State

Both tools use the **updated and deployed** edge functions with the PNG scanner fix. The pipeline is functional. But:
- ValidatorEvidence does not save results to the database, so they disappear on page refresh
- There is no single "download everything" button for submission

## Changes

### 1. Update ValidatorEvidence to persist results to the database

**File: `src/components/admin/c2pa/ValidatorEvidence.tsx`**

- Import `useAuth` from `@/contexts/AuthContext` and `logC2PAValidation` from `@/lib/c2paValidation`
- After each successful validation in the `handleFilesSelect` loop, call `logC2PAValidation()` to write the result to `c2pa_validation_logs`
- This ensures all ingredient sample validation results are permanently stored for export

### 2. Enhance the exported JSON to match C2PA expectations

**File: `src/components/admin/c2pa/ValidatorEvidence.tsx`**

Update the `exportResults` function to include richer fields that C2PA reviewers expect:
- Add `spec_version: "2.2"` and `product_name: "TSMO AI Protection"` to the report header
- Include `ingredients` and `trust_status` per file (already available in the result object but not currently exported)
- Include `claim_generator_info` if present

### 3. New Component: ConformanceExporter

**New file: `src/components/admin/c2pa/ConformanceExporter.tsx`**

A card at the bottom of the conformance page with:
- **"Export Generator Manifests"** button: Queries `c2pa_signing_logs` from the database, builds a `generator-manifests.json` containing all historical signed manifests with claim_generator, algorithm, certificate fingerprint, and manifest hash
- **"Export Validator Results"** button: Queries `c2pa_validation_logs` from the database, builds a `validator-results.json` with per-file detection outcomes (has_c2pa, claim_generator, assertions, ingredients, trust_status)
- **"Export Full Submission Package"** button: Downloads both files plus a `conformance-summary.json` cover sheet with product identifiers (Common Name: TSMO AI Protection, Assurance Level 1, Spec v2.2, Backend class, Generator + Validator roles)

### 4. Add ConformanceExporter to the page

**File: `src/pages/admin/C2PAConformance.tsx`**

- Import and render `ConformanceExporter` after the existing tools (GeneratorEvidence, ValidatorEvidence)

## Workflow for Submission

1. Go to `/admin/c2pa-conformance`
2. Use **Generator Evidence** -- upload an image, get a signed manifest and protected file. Download the manifest .json files
3. Use **Validator Evidence** -- upload C2PA's ingredient samples. Results are now saved to the database automatically
4. Use **Conformance Exporter** -- click "Export Full Submission Package" to download all manifests and validation results as JSON files
5. Send the downloaded files to C2PA

## Technical Details

- Database queries use `supabase.from('c2pa_signing_logs').select('*')` and `supabase.from('c2pa_validation_logs').select('*')` with `as any` type casting
- The `logC2PAValidation` function already exists and handles the database insert
- File downloads use the existing Blob + URL.createObjectURL pattern
- No new edge functions or database migrations needed -- all tables already exist
