

# Add Screenshot Protection to AI Training Protection Page

## Current State
- `ScreenshotShield` component exists and works (blur on tab-leave, block right-click, block print, block keyboard shortcuts, watermark overlay).
- It is only used inside `DocumentProtectionDashboard` as a demo.
- The `AITrainingProtection` page has **no screenshot protection**.

## Plan

### 1. Wrap AI Training Protection content with ScreenshotShield
**File:** `src/pages/AITrainingProtection.tsx`
- Import `ScreenshotShield` and wrap the dashboard content with it.
- Use dynamic watermark text (e.g., user email or ID from Supabase auth) for traceability.
- Enable all protection by default (right-click block, keyboard shortcut block, blur-on-leave, print block).

### 2. Add a toggle in the UI to let users enable/disable it
**File:** `src/pages/AITrainingProtection.tsx`
- Add a small Shield icon toggle button in the page header area so users can turn screenshot protection on/off for their session.
- Default: enabled.

## Technical Details
- No new components needed — reuses existing `ScreenshotShield` and `useScreenshotProtection`.
- Auth context used to pull the current user's email for the watermark text.
- Single file change: `src/pages/AITrainingProtection.tsx`.

