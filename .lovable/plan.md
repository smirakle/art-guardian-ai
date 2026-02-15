
# CAI Readiness Dashboard Widget

## Overview
Add a dedicated "CAI Readiness" dashboard card to the top of the admin C2PA Conformance page. It will call a new edge function that checks whether the 3 production C2PA signing secrets are configured, plus verify that the signing and validation edge functions are reachable. The widget will show a clear green/red indicator for each requirement, plus an overall readiness status.

## Components

### 1. New Edge Function: `c2pa-readiness-check`
A lightweight Deno edge function (following the same pattern as `monitoring-readiness-check`) that checks:

| Check | Secret / Target | Description |
|-------|----------------|-------------|
| Private Key | `C2PA_PRIVATE_KEY` | ES256 signing key in PEM format |
| Signing Certificate | `C2PA_SIGNING_CERT` | X.509 certificate from CAI trust anchor |
| Issuer ID | `C2PA_ISSUER_ID` | CAI Organization / Issuer identifier |
| Signing Function | `sign-c2pa-manifest` reachable | Confirms the generator pipeline is deployed |
| Validation Function | `validate-c2pa-manifest` reachable | Confirms the validator pipeline is deployed |

Returns a JSON response with per-check status, overall readiness boolean, and actionable next-step recommendations.

### 2. New React Component: `CAIReadinessWidget`
Location: `src/components/admin/c2pa/CAIReadinessWidget.tsx`

- Card with title "CAI Certification Readiness"
- "Run Readiness Check" button (follows the `MonitoringReadiness` pattern)
- After check, displays:
  - Overall status banner: green "Ready for Submission" or amber "Action Required"
  - Per-check rows with green/red badges (same `Row` pattern as existing readiness widgets)
  - Recommendations section for any missing items
  - Link to Supabase Edge Function Secrets page for quick remediation

### 3. Page Integration
Update `C2PAConformance.tsx` to import and render `CAIReadinessWidget` as the first card on the page, above `TrustListViewer`.

## Technical Details

### Edge Function (`supabase/functions/c2pa-readiness-check/index.ts`)

```text
Request: GET/POST (no body needed)
Response: {
  status: "ok" | "needs_attention",
  message: string,
  checks: [{ name: string, ok: boolean, details?: object }],
  recommendations: string[]
}
```

- Uses `Deno.env.get()` to check each secret (same `has()` helper pattern)
- Uses `fetch()` with OPTIONS to verify signing/validation functions are deployed
- No database access required -- purely checks environment config

### Widget Component
- Follows exact same state/UI pattern as `MonitoringReadiness.tsx` and `AITPReadiness.tsx`
- Calls `supabase.functions.invoke('c2pa-readiness-check')`
- Shows results in a two-column grid: checks on the left, recommendations on the right
- Overall status uses a colored Alert banner at the top of results

### File Changes Summary
| File | Action |
|------|--------|
| `supabase/functions/c2pa-readiness-check/index.ts` | Create -- new edge function |
| `src/components/admin/c2pa/CAIReadinessWidget.tsx` | Create -- new React component |
| `src/pages/admin/C2PAConformance.tsx` | Edit -- add import and render widget first |
