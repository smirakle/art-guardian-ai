

## Screenshot Protection — Full Browser-Based Suite

**Important caveat**: True screenshot prevention is impossible in browsers. No web technology can fully block OS-level screen capture (Print Screen, Snipping Tool, phone camera). What we can do is implement multiple deterrent layers that make capturing clean, usable copies significantly harder.

### What We'll Build

**1. `useScreenshotProtection` hook** — Central hook that activates all protections:
- Disables right-click context menu on protected content
- Blocks keyboard shortcuts (Ctrl+S, Ctrl+C, Ctrl+P, PrtScn, Cmd+Shift+3/4)
- Detects `visibilitychange` and blurs/hides protected content when tab loses focus
- Listens for `beforeprint` event to hide content during print-to-PDF attempts
- Applies CSS `user-select: none` and `-webkit-user-drag: none`

**2. `ScreenshotShield` component** — Wrapper for protected content:
- Renders a dynamic invisible watermark overlay (user ID + timestamp in low-opacity text, rotated grid pattern)
- On visibility loss: replaces content with a "Content Protected" placeholder
- On print: injects CSS `@media print { .protected { display: none } }`
- Applies `pointer-events` control to prevent drag-and-drop of images

**3. `ScreenshotProtectionSettings` component** — User-facing settings panel:
- Toggle switches for each protection layer (watermark, blur-on-leave, right-click block, keyboard block)
- Protection level presets (Light / Standard / Maximum)
- Visual preview of active protections

**4. Integration into Protection Hub**:
- Add a new "Screenshot Shield" tab to the `DocumentProtectionDashboard`
- Include the settings panel and a live demo area where users can see protections in action

### Technical Details

- All protections are client-side CSS/JS — no backend changes needed
- The invisible watermark uses CSS `mix-blend-mode` and very low opacity (~0.03) with the user's ID repeated in a rotated grid, making any screenshot traceable
- `visibilitychange` + `document.hasFocus()` used together for reliable tab-switch detection
- `@media print` CSS rule injected dynamically to block print-screen workarounds
- Canvas fingerprinting approach: protected images rendered in a canvas with a poisoned overlay that survives screenshots

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/hooks/useScreenshotProtection.ts` | Create — core protection logic hook |
| `src/components/protection/ScreenshotShield.tsx` | Create — wrapper component with watermark overlay |
| `src/components/protection/ScreenshotProtectionSettings.tsx` | Create — settings UI with toggles |
| `src/components/phase3/DocumentProtectionDashboard.tsx` | Edit — add Screenshot Shield tab |

