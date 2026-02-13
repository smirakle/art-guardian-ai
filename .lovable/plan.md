

# Fix C2PA Claim Data Extraction — CBOR Decode Succeeds But Fields Not Mapped

## Problem Confirmed

The logs show the CBOR content IS found and has 377 bytes starting with `a5` (valid CBOR map of 5 entries). The hex decodes to keys starting with `instanceID` (camelCase). However, `extractFieldsFromDecodedClaim` only checks snake_case keys like `claim_generator`, `instance_id` -- so every field check fails silently and `claimGenerator` stays `null`.

Additionally, there's no debug logging to show what the CBOR decode actually returns, making this invisible.

## Root Cause

Real C2PA v2.2 CBOR claim maps use mixed key naming:
- `instanceID` (camelCase, per spec)
- `claim_generator` (snake_case, per spec)
- `dc:title`, `dc:format` (namespaced)

But the decoder may also encounter issues with tagged values or byte strings that cause partial decode failures. Without logging the decode result, we can't tell if the map is fully parsed or partially parsed.

## Changes (Single File)

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

### Change 1: Add Debug Logging After CBOR Decode (line 502)

After `robustCBORDecode(contentData)`, log:
- The type and nullity of the result
- The keys of the decoded object (if it's a map)
- A preview of the JSON stringified result (first 500 chars)

This will immediately reveal whether the decode succeeds and what keys the claim map contains.

### Change 2: Handle Alternative Key Names in `extractFieldsFromDecodedClaim` (line 541)

Update every field extraction to check multiple key name variants:

| Field | Current Check | Add Checks |
|-------|--------------|------------|
| claim_generator | `obj.claim_generator` | `obj.claimGenerator`, `obj['claim-generator']` |
| claim_generator_info | `obj.claim_generator_info` | `obj.claimGeneratorInfo`, `obj['claim-generator-info']` |
| instance_id | `obj.instance_id` | `obj.instanceID` |
| title | (not checked) | `obj['dc:title']`, `obj.dc_title`, `obj.title` |
| format | (not checked) | `obj['dc:format']`, `obj.dc_format` |
| signature | (not checked) | `obj.signature` (reference to sig box) |

### Change 3: Update `ParsedClaim` Interface (line 359)

Add optional fields: `title`, `dcFormat`, `signatureRef` to capture additional claim metadata from the decoded CBOR.

### Change 4: Wire New Fields to Response

In the response builder, populate `claimGenerator` from the newly extracted fields and include any additional metadata in the JSON output.

## Expected Outcome

After deploying:
1. Debug logs will show the exact decoded CBOR keys and values
2. `claim_generator` (or its variant) will be correctly extracted
3. The exported JSON will contain real manifest data: `claim_generator`, `claim_generator_info`, `spec_version`, etc.

If the CBOR decode itself is failing (returning null), the new logging will reveal exactly where and why, enabling a targeted follow-up fix.

