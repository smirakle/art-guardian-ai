

## Plan: Add Visual Protection Evidence to Step 4

**What**: After protection completes (Step 4), show a visual "Protection Evidence" card above the download section that proves the file has been protected — animated layer indicators, a protection certificate-style summary, and verification details.

**Changes — `src/pages/Upload.tsx` only**

Insert a new **Protection Evidence** card between the stats grid and the download section (after line 753, before line 755):

1. **Animated Shield Badge** — A pulsing shield icon with a green checkmark overlay and a "Verified Protected" label
2. **Protection Layers Verified** — A checklist of 4 protection layers (Invisible Watermark, AI Training Shield, Monitoring Active, DMCA Enforcement) each with a staggered fade-in animation and green check icons, showing they were successfully applied
3. **Protection Certificate** — A mini card styled like a certificate showing:
   - Protection ID (generated timestamp-based hash)
   - Date/time of protection
   - Protection level: "Standard" 
   - File count protected
4. **Visual diff hint** — Small text: "Protection is invisible to the human eye but detectable by our verification system"

**Design**: Follows existing glass-morphism style (`bg-card/50 backdrop-blur`, `border-primary/20`, gradient accents). Uses staggered CSS animations (`animate-fade-in` with delays) so each layer "checks in" sequentially, giving a sense of real verification happening.

**No new files or dependencies** — all done inline in the Step 4 section of Upload.tsx using existing UI primitives (Card, Badge, CheckCircle, Shield, etc.).

