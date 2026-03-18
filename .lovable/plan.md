

# Fix Forgery Detection Section - Beta Ready Plan

## Problems Identified

1. **Redirect loop**: `App.tsx` redirects `/forgery-detection` to `/monitoring-hub`, but the Monitoring Hub's Forgery tab has buttons that navigate to `/forgery-detection` - creating a loop. Users can never reach the actual forgery tools.

2. **`advanced-visual-analysis` edge function has ~20 `Math.random()` calls**: Used to add noise to confidence scores in `performDeepfakeDetection`, `performForensicsAnalysis`, `performManipulationDetection`, and `performAIGenerationDetection`. These should use deterministic values derived from the AI analysis text.

3. **`ai-image-detector` heuristic analysis is weak but functional**: The heuristic functions (frequency, pixel, metadata, stylometric, neural) use deterministic logic already. The real detection relies on OpenAI Vision which is properly integrated. This function is beta-ready.

4. **`ImageForgeryDetector.tsx` calls `advanced-visual-analysis` with `deepfake_detection` type**: This works but the edge function adds random noise to the results. Needs the `Math.random()` cleanup.

## Plan

### Step 1: Fix the navigation/redirect loop
- Remove the redirect `<Route path="/forgery-detection" element={<Navigate to="/monitoring-hub" replace />} />` from `App.tsx`
- Restore the actual `ForgeryDetection` page route so users can access both the `AIImageDetector` and `ImageForgeryDetector` components
- Update the Monitoring Hub's forgery tab buttons to navigate correctly

### Step 2: Clean up `advanced-visual-analysis` edge function
Replace all `Math.random()` calls with deterministic confidence derivation:
- In `performDeepfakeDetection` (lines 407-464): Replace random noise on indicator confidences with small deterministic offsets based on the `detected` boolean (e.g., +0.05 if detected, -0.02 if not)
- In `performForensicsAnalysis` (lines 871-898): Same pattern - use detection status to adjust confidence deterministically
- In `performManipulationDetection` (lines 1005-1035): Same pattern
- In `performAIGenerationDetection` (lines 1170-1194): Same pattern
- Keep `Math.random().toString(36)` on line 507 (nonce generation) - replace with `crypto.randomUUID()` for proper randomness

### Step 3: Embed forgery components directly in the Monitoring Hub forgery tab
Instead of navigating away, render `ImageForgeryDetector` and `AIImageDetector` inline within the forgery tab of the Monitoring Hub, giving users immediate access without navigation.

### Files to modify
- `src/App.tsx` - Restore forgery-detection route
- `src/pages/MonitoringHub.tsx` - Embed forgery components inline in forgery tab
- `supabase/functions/advanced-visual-analysis/index.ts` - Remove ~20 `Math.random()` calls with deterministic logic
- Redeploy `advanced-visual-analysis` edge function

