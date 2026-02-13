

# Fix C2PA Validator PNG Scanner and Verify Full Pipeline

## Problem

The C2PA pipeline has two issues preventing reliable operation:

1. The **Validator** (`validate-c2pa-manifest`) has the same PNG chunk scanning bug that was fixed in the Embed function. Line 672 uses `while (offset < data.length - 12)` which can miss chunks (including caBX C2PA data) located near the end of a PNG file.

2. The **Embed** function fix was deployed but has not been verified with a real file yet.

## Changes

### File: `supabase/functions/validate-c2pa-manifest/index.ts`

**Line 672** -- Fix the PNG chunk scanner loop condition:

```
// Before:
while (offset < data.length - 12) {

// After:
while (offset + 8 <= data.length) {
```

This matches the fix already applied to the embed function and ensures all PNG chunks (including those at the very end of the file) are scanned correctly.

### Deployment

Redeploy both functions after the fix:
- `validate-c2pa-manifest`
- `embed-c2pa-manifest` (to confirm latest code is live)

### Verification

After deployment, test the Validator by calling it with a POST request to confirm it returns a valid response (not a 500 error) for PNG files.

## Technical Details

The PNG format stores data in chunks: 4-byte length + 4-byte type + N-byte data + 4-byte CRC. The old loop condition `offset < data.length - 12` would stop scanning before reaching the final chunks if the file size alignment left fewer than 12 bytes remaining, even though only 8 bytes (length + type) are needed to identify a chunk.

