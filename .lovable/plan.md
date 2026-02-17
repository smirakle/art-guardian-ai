

# Fix Generator Evidence to Output a PDF Document

## Problem
The Generator Evidence tool currently only outputs raw JSON files and a protected image. The C2PA conformance reviewers need a formatted **PDF document** (like the Security Architecture PDF you uploaded) that contains the manifest data, signing details, and evidence summary in a professional, readable format.

## Solution
Create a new PDF renderer component (`GeneratorEvidencePDF`) using `@react-pdf/renderer` (already installed) and add a "Download PDF" button to the Generator Evidence card. The PDF will match the style of the existing Security Architecture PDF.

## PDF Contents
The generated PDF will include:

1. **Title Page** -- "C2PA Generator Evidence Report" with TSMO branding, date, and protection ID
2. **Manifest Claim** -- The full C2PA v2.2 claim details (claim generator, assertions, rights, instance ID)
3. **Signing Details** -- Algorithm (ES256), signing mode, certificate fingerprint, manifest hash
4. **File Information** -- Original filename, file size, MIME type, protection timestamp
5. **COSE Sign1 Signature** -- The base64-encoded signature value
6. **Evidence Summary** -- Protection ID, conformance statement, spec version

## Changes

### 1. New file: `src/components/admin/c2pa/GeneratorEvidencePDF.tsx`
A `@react-pdf/renderer` Document component that renders all evidence fields into a multi-page A4 PDF, styled consistently with the existing `SecurityArchitecturePDF.tsx`.

### 2. Update: `src/components/admin/c2pa/GeneratorEvidence.tsx`
- Import the new PDF component and `pdf` from `@react-pdf/renderer`
- Add a "Download Evidence PDF" button in the results section
- When clicked, generate the PDF blob and trigger a download with filename `c2pa-generator-evidence-{protectionId}.pdf`
- The PDF will include all the data currently shown in the JSON preview plus the signing summary

## What This Fixes
- Conformance reviewers get a properly formatted PDF document instead of raw JSON
- The PDF matches the professional format of the Security Architecture document they already have
- All manifest and signing evidence is presented in one readable document

