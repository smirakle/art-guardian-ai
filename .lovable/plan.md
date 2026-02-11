

## Integrate C2PA Protection into the Upload and Protection Flow

### What changes

Move the C2PA Generator (sign + embed) functionality into the Protection Hub's **Protect** tab so that when a user uploads an image, C2PA Content Credentials are automatically applied alongside existing protections (Style Cloaking, metadata, etc.).

Keep the `/admin/c2pa-conformance` page as an **admin-only conformance export tool** for the Security Architecture document and batch validation evidence -- these are only needed for the C2PA application, not for regular users.

### Approach

1. **Add a "Content Credentials (C2PA)" card to the Protect tab** in `ProtectionHub.tsx`
   - Place it alongside the existing "Upload and Protect" and "Style Protection" cards
   - Reuse the `GeneratorEvidence` component (or extract its core signing logic into a simpler user-facing component)
   - Users upload an image, it gets signed with ES256, embedded with JUMBF, and they can download the protected file

2. **Simplify the UI for regular users**
   - Create a new `C2PAProtection` component that wraps the signing/embedding logic but with simpler, non-technical labels (e.g., "Add Content Credentials" instead of "Generator Evidence")
   - Hide conformance-specific details (certificate fingerprints, manifest hashes) behind an expandable "Technical Details" section
   - Keep the download button for the protected image prominent

3. **Keep the admin conformance page unchanged**
   - `/admin/c2pa-conformance` stays as-is for exporting the Security Architecture document, batch validator evidence, and full technical signing details needed for the C2PA conformance submission

### Files to create/modify

- **Create** `src/components/ai-protection/C2PAProtection.tsx` -- user-friendly C2PA signing and embedding card
- **Modify** `src/pages/ProtectionHub.tsx` -- add the C2PA card to the Protect tab grid

### Technical details

The new `C2PAProtection` component will:
- Import `signC2PAManifest` and `embedC2PAManifest` from `@/lib/c2paValidation`
- Accept JPEG and PNG uploads
- Run the sign-then-embed pipeline
- Show a simple success state with a download button for the protected file
- Optionally show technical details (manifest JSON, certificate info) in a collapsible section

