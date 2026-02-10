

## Fix: Tier Not Updating + Verify Protection Not Working

Two bugs were found in the Adobe plugin (`adobe-plugin/index.js`) and the edge function (`supabase/functions/adobe-plugin-api/index.ts`).

---

### Bug 1: Tier Not Updating

**Root Cause:** The plugin calls `action: "get_status"` to fetch the user's tier after login. But the `get_status` handler in the edge function (line 1172-1185) is a static health-check response -- it never queries the user's subscription. It just returns a hardcoded status message with no `tier` field.

```text
Plugin calls:   apiCall({ action: "get_status" })
                        ↓
Edge function:  Returns { success: true, message: "API is operational", ... }
                        ↓
Plugin reads:   data.tier → undefined → defaults to "basic"
```

The actual subscription lookup exists as `action: "get_subscription"` (line 1168), but the plugin never calls it.

**Fix:** Change the `get_status` handler in the edge function to also call `handleGetSubscription()` and include the `tier` in its response. This way the plugin's existing `fetchUserTier()` code will receive the correct tier without any plugin-side changes.

---

### Bug 2: Verify Protection Not Working

**Root Cause:** The plugin checks for `result.verified` or `result.is_protected` (line 293), but the edge function returns the verification result nested inside `result.verificationResult.isProtected` (line 815). The plugin never reads `verificationResult`, so it always falls through to "No protection found."

```text
Edge returns:   { success: true, verificationResult: { isProtected: true, ... } }
                        ↓
Plugin checks:  result.verified → undefined
                result.is_protected → undefined
                        ↓
Result:         "No protection found" (false negative)
```

**Fix:** Update the plugin's `verifyProtection()` function to read from `result.verificationResult.isProtected` and extract the protection ID from `result.verificationResult.protectionId`.

---

### Changes

| File | Change |
|------|--------|
| `supabase/functions/adobe-plugin-api/index.ts` | Update `get_status` case (lines 1172-1185) to call `handleGetSubscription()` and merge the tier into the response |
| `adobe-plugin/index.js` | Fix `verifyProtection()` (line 293) to read `result.verificationResult.isProtected` instead of `result.verified` / `result.is_protected` |

### Technical Details

**Edge function change (get_status handler):**
- Call `await handleGetSubscription(supabase, user.id)` inside the `get_status` case
- Spread the subscription result (`tier`, `plan_id`, `is_active`) into the response object

**Plugin change (verifyProtection):**
- Replace the condition `result.verified || result.is_protected` with `result.verificationResult?.isProtected`
- Read protection ID from `result.verificationResult?.protectionId`

