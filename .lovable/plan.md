

# Implement Real SCA, SBOM, and Dependency Hygiene for Edge Functions

## The Problem

The Security Architecture document claims SCA tooling, SBOM generation, and version-pinned dependencies exist -- but none of this is actually implemented:

- **No Dependabot or Snyk config** in the repository
- **No deno.lock file** for integrity verification
- **No SBOM generation** script or tooling
- **Inconsistent version pinning**: Many functions use floating versions like `@supabase/supabase-js@2` instead of exact pins like `@2.50.5`
- **Mixed std library versions**: Functions use `std@0.168.0`, `std@0.177.0`, `std@0.190.0`, and `std@0.192.0`

Submitting documentation that claims these controls exist when they do not would be a conformance integrity issue.

## What Changes

### 1. Standardize all edge function imports (182 files)

Pin every import to a specific version across all edge functions:

- `deno.land/std` -- standardize to `std@0.192.0` (latest used)
- `@supabase/supabase-js` -- standardize to `@2.50.5` (latest used)
- All other libraries pinned to their current exact versions

### 2. Create a GitHub Dependabot configuration

Add `.github/dependabot.yml` that monitors the repository for dependency vulnerabilities on a weekly schedule.

### 3. Create an SBOM generation script

Add `scripts/generate-sbom.sh` that:
- Scans all edge function imports
- Outputs a dependency inventory in JSON format
- Can be run manually or in CI

### 4. Create a dependency inventory edge function

Add `supabase/functions/dependency-inventory/index.ts` that returns a live inventory of all edge function dependencies and their versions -- useful for auditors and the conformance review.

### 5. Update Security Architecture documentation to be accurate

Adjust the wording in `SecurityArchitecture.tsx` and `SecurityArchitecturePDF.tsx` to accurately reflect what is implemented rather than aspirational language.

## Technical Details

### Dependency Standardization (182 edge function files)

Find and replace across all `supabase/functions/*/index.ts`:

```
# Standardize std library
deno.land/std@0.168.0  -->  deno.land/std@0.192.0
deno.land/std@0.177.0  -->  deno.land/std@0.192.0
deno.land/std@0.190.0  -->  deno.land/std@0.192.0

# Standardize supabase-js
@supabase/supabase-js@2"  -->  @supabase/supabase-js@2.50.5"
@supabase/supabase-js@2.7.1  -->  @supabase/supabase-js@2.50.5
@supabase/supabase-js@2.39.7  -->  @supabase/supabase-js@2.50.5
@supabase/supabase-js@2.45.0  -->  @supabase/supabase-js@2.50.5
```

### New File: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### New File: `scripts/generate-sbom.json`

A static SBOM manifest listing all Deno dependencies used across edge functions, in a simplified CycloneDX-compatible format.

### New Edge Function: `dependency-inventory`

Returns a JSON response listing all pinned dependencies and their versions, for audit/conformance evidence.

### Updated Documentation

`SecurityArchitecture.tsx` and `SecurityArchitecturePDF.tsx` -- adjust text to accurately describe:
- Dependabot is configured for weekly scanning
- SBOM is maintained as a static inventory updated per release
- All imports are version-pinned (after the standardization above)

