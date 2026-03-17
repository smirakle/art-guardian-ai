
## Plan: Make Protection Evidence Use Real Data

**Goal**: Pull actual protection results from the database/state so the evidence panel reflects what truly happened.

### Changes — `src/pages/Upload.tsx` only

1. **Capture real protection results in state**  
   - After the artwork + protection records are created in `handleStartProtection`, store the actual `artwork.id`, protection level (`ai_protection_level`), and the real `protection_record_id` (if created) into component state (e.g., `protectionResult`).

2. **Protection ID** — Use the real artwork ID or protection record ID instead of `Date.now().toString(36)`. Format: `TSMO-{artwork.id.substring(0,8).toUpperCase()}`.

3. **Protection Level** — Read from the actual state (currently always `'standard'` but wired correctly so future changes reflect).

4. **Layer Checklist** — Make each layer conditional based on what was actually enabled:
   - "Invisible Watermark" → show green only if `enableWatermark` is true
   - "AI Training Shield" → always true (always applied)
   - "Monitoring Active" → show green only if a monitoring scan was successfully created
   - "DMCA Enforcement" → show green only if user is authenticated (guests don't get this)
   - Show unchecked/grey state for layers that weren't applied

5. **Date** — Use the timestamp captured at protection time (not render time), stored in state.

6. **Verification hint** — Keep as-is (accurate statement).

### No new files or dependencies. All changes scoped to Upload.tsx state management and the Step 4 render block.
