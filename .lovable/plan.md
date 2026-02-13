
# Fix C2PA Claim Extraction: Label and Content Type Mismatches

## Problem (Confirmed from Edge Function Logs)

The logs show the nested manifest IS found successfully, and assertions are extracted. But `claimGenerator` remains `null` because of two specific mismatches:

### Mismatch 1: Claim Box Label
The code at line 489 searches for:
```
manifestBox.children.find(b => b.label === 'c2pa.claim')
```
But the actual Google Pixel manifest uses:
```
jumb [label="c2pa.claim.v2"] (432 bytes, 2 children)
```
The `.v2` suffix means the search never finds the claim box.

### Mismatch 2: Content Box Type
Inside the claim box, the code at line 492 searches for:
```
claimBox.children.find(b => b.type === 'c2cl')
```
But the actual content box is of type `cbor`:
```
jumd [label="c2pa.claim.v2"] (39 bytes)
cbor (385 bytes)
```
So the CBOR claim data is never decoded.

## Fix (Single File)

**File: `supabase/functions/validate-c2pa-manifest/index.ts`**

### Change 1: Fix Claim Box Search (line 489)
Replace exact match with `startsWith`:
```typescript
const claimBox = manifestBox.children.find(b =>
  b.label === 'c2pa.claim' || b.label === 'c2pa.claim.v2' ||
  (b.label && b.label.startsWith('c2pa.claim'))
);
```

### Change 2: Fix Content Box Search (line 492)
Also look for `cbor` type boxes and any non-descriptor child:
```typescript
const contentBox = claimBox.children.find(b => b.type === 'c2cl') ||
                   claimBox.children.find(b => b.type === 'cbor') ||
                   claimBox.children.find(b => b.type !== 'jumd' && b.type !== 'jumb');
```

### Change 3: Fix Signature Content Box Search (line 522)
Same issue -- look for `cbor` type in addition to `c2cs`:
```typescript
const sigContentBox = sigBox.children.find(b => b.type === 'c2cs') ||
                      sigBox.children.find(b => b.type === 'cbor') ||
                      sigBox.children.find(b => b.type !== 'jumd' && b.type !== 'jumb');
```

These three targeted fixes will allow the validator to successfully extract `claim_generator`, `claim_generator_info`, `spec_version`, and other structured data from real-world C2PA v2.2 manifests.
