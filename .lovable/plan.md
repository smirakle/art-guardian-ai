## Replace all `shirleena.cunningham@tsmowatch.com` with `shirleenacunningham@gmail.com`

### Scope
Replace every occurrence of `shirleena.cunningham@tsmowatch.com` with `shirleenacunningham@gmail.com` across the entire codebase.

### Files affected
- `src/components/CopyrightFooter.tsx` (4 occurrences)
- `src/components/EnhancedFooter.tsx` (2 occurrences)
- `src/components/InvestorPitchDeck.tsx` (4 occurrences)
- `src/components/enterprise/ComprehensiveAPIDocumentation.tsx` (2 occurrences)
- `src/components/enterprise/IPGuardrailDocumentation.tsx` (1 occurrence)
- `src/components/investor/AIProtectionTechnicalDoc.tsx` (1 occurrence)
- `src/components/investor/ExecutiveSummary.tsx` (2 occurrences)
- `src/components/investor/FoundingPartnerBriefDownload.tsx` (1 occurrence)
- `src/components/investor/InvestorDataRoom.tsx` (3 occurrences)
- `src/pages/Contact.tsx` (1 occurrence)
- `src/pages/HelpCenter.tsx` (1 occurrence)
- `src/pages/InvestorHub.tsx` (1 occurrence)
- `src/pages/RefundPolicy.tsx` (2 occurrences)
- `src/pages/TermsAndPrivacy.tsx` (6 occurrences)
- `src/data/userGuides.ts` (1 occurrence)
- `supabase/functions/new-user-signup-notification/index.ts` (1 occurrence)
- `supabase/functions/schedule-meeting/index.ts` (2 occurrences)
- `supabase/functions/send-bug-report/index.ts` (1 occurrence)
- `supabase/functions/send-contact-email/index.ts` (3 occurrences)
- `supabase/functions/send-sales-inquiry/index.ts` (1 occurrence)
- `BETA_TESTING_CHECKLIST.md` (2 occurrences)
- `LICENSE.txt` (1 occurrence)
- `docs/guides/01-EMAIL-SYSTEM-FIX.md` (3 occurrences)
- `docs/guides/04-TESTING-GUIDE.md` (1 occurrence)

### Implementation
1. Run a global find-and-replace across all affected files using the exact string replacement.
2. Verify the change by searching for any remaining occurrences of `shirleena.cunningham@tsmowatch.com` and any unintended duplicates of the new email.
3. Run a type check / build to confirm no syntax errors were introduced.

### Memory update
The existing project memory rule says: `Contact: Always use support@tsmowatch.com for official support contact.` Since you want all contact points to use `shirleenacunningham@gmail.com`, I will update that memory rule to match the new contact email so future changes stay consistent.

### Verification
After implementation, `rg -n 'shirleena.cunningham@tsmowatch.com' .` will return zero results, and the new email will appear in all previously affected locations.