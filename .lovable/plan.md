

# Signup Conversion Fixes

## Summary
Six targeted changes to reduce signup friction and improve conversion: disable email verification, remove self-testimonial, simplify hero CTA, increase guest limit, add Google OAuth, and move legal disclaimers to footer.

## Changes

### 1. Disable email verification (Supabase Dashboard)
- This is a dashboard setting, not a code change. You need to go to **Supabase Dashboard > Authentication > Email > disable "Confirm email"**.
- Update the signup success toast in `Auth.tsx` (line 62-65) to remove "Check your email to verify" message — replace with "Welcome! Start protecting your art now." and auto-redirect to `/dashboard`.

### 2. Remove self-testimonial from landing page
- Delete lines 479-500 in `src/pages/Index.tsx` (the "Social Proof" section with Shirleena Cunningham quote).
- Replace with a simple social proof counter: "Join 2,400+ creators protecting their art" using existing stats data.

### 3. Simplify hero to single CTA
- In `src/pages/Index.tsx` lines 229-248, remove the secondary "Create Free Account" button.
- Keep only the primary "Scan Your Art Free" button that opens the instant protect modal — this is the hook that demonstrates value before asking for signup.

### 4. Increase guest protection limit
- In `src/components/InstantProtectModal.tsx` line 19, change `MAX_GUEST_PROTECTIONS = 3` to `MAX_GUEST_PROTECTIONS = 10`.
- Add a soft signup prompt after 5 uses (show a banner inside the modal suggesting account creation to save results, but don't block).

### 5. Add Google OAuth
- Add a "Continue with Google" button to `src/pages/Auth.tsx` above the email form in both login and signup tabs.
- Use `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } })`.
- **Requires manual setup**: You must configure Google OAuth in your Supabase Dashboard (Authentication > Providers > Google) with your Google Cloud OAuth credentials.

### 6. Move legal disclaimers to footer
- Remove lines 280-310 in `src/pages/Index.tsx` (the legal disclosure section that appears right after the hero).
- Add the same legal disclaimer and "You Own Your Work" text to `src/components/CopyrightFooter.tsx` as a small section above the copyright line.

## Files to modify
- `src/pages/Auth.tsx` — Google OAuth button, update signup toast/redirect
- `src/pages/Index.tsx` — Remove secondary CTA, remove self-testimonial, remove legal section from mid-page
- `src/components/InstantProtectModal.tsx` — Increase limit to 10, add soft prompt at 5
- `src/components/CopyrightFooter.tsx` — Add legal disclaimers

## Manual step required
- **Supabase Dashboard**: Disable email confirmation at Authentication > Email settings
- **Supabase Dashboard**: Configure Google OAuth provider with Google Cloud credentials

