

## Problem

The "As Seen On" / BizWeekly section and CAI Membership banner are stacked vertically as separate bland sections with no visual cohesion. They look like afterthoughts — plain text, small images, no visual hierarchy, and too much whitespace between them.

## Plan

Combine both credibility signals (BizWeekly press + CAI membership) into a single, polished **"Credibility & Trust"** section with better visual design:

### Changes to `src/pages/Index.tsx` (lines 342-389)

Replace the two separate sections with one unified section:

1. **Single section** with subtle gradient background and proper vertical spacing
2. **Two-column layout** on desktop (BizWeekly left, CAI right), stacked on mobile
3. Each credential in a **card-like container** with subtle border, rounded corners, and hover effect
4. **Larger logo sizes** — CAI logo `h-16 md:h-20`, BizWeekly image `max-w-sm`
5. **Section header**: "Trusted & Recognized" with a subtle label above
6. **Divider line** between the two on desktop (vertical) / mobile (horizontal)
7. Harvard disclaimer kept as small text below the BizWeekly card
8. "Read the feature" link styled as a proper button/pill

This creates a cohesive, professional credibility strip that draws the eye without being gaudy.

