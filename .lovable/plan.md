

## Add C2PA Contributing Member Badge to Homepage

### What Changes

Add a **Content Authenticity Initiative (C2PA) Contributing Member** badge to the existing `TrustBadges` component on the homepage. This will sit alongside the current trust badges ("Your Art is Safe", "Private & Secure", etc.) to showcase TSMO's verified C2PA membership.

### Badge Details

- **Icon**: A certificate/award emoji or the existing `Award` icon (already imported but unused)
- **Label**: "C2PA Member"
- **Description**: "Content Authenticity Initiative"
- **Styling**: Consistent with the other trust badges

### Technical Details

**File**: `src/components/TrustBadges.tsx`

- Add a new entry to the `badges` array with the C2PA membership info
- The `Award` icon is already imported in the file but unused -- it will be used here
- No new dependencies or files needed

This is a single-line addition to one file.

