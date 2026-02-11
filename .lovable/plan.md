

## Add C2PA Content Credentials to the Upload Page

The C2PA Content Credentials feature was added to the Protection Hub (`/protection-hub`), but you're on the **Upload page** (`/upload`), which is a separate page. Here's the plan to bring it into the Upload flow.

### What will change

The `C2PAProtection` component (already built) will be added to the **Upload page** so users can apply Content Credentials directly as part of their upload workflow.

### Where it will appear

The Upload page currently has 3 tabs: **Upload**, **Watermark**, and **Analyze**. There are two options:

**Option A (recommended):** Add a "Content Credentials" card inside the existing **Watermark** tab alongside the existing watermark protection, since both are protection steps applied to uploaded files.

**Option B:** Add a 4th tab called "Credentials" between Watermark and Analyze.

I'll go with **Option A** -- placing the C2PA card in the Watermark tab so users see all protection options together.

### Files to modify

- **`src/pages/Upload.tsx`**
  - Import the existing `C2PAProtection` component
  - Add a Card wrapping `C2PAProtection` in the Watermark tab content area, below or alongside the existing watermark controls

### Technical details

- Import `C2PAProtection from '@/components/ai-protection/C2PAProtection'`
- Add a new Card with title "Content Credentials (C2PA)" containing the `<C2PAProtection />` component in the Watermark tab's `TabsContent`
- No new files needed -- the component already exists and works
