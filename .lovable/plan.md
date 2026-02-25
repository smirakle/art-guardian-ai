

## Plan: Add Stripe Disclosure to Checkout Flows

### What This Does
Adds a proper Stripe payment disclosure notice near checkout buttons across all payment flows, informing users that their payment is securely processed by Stripe and that TSMO does not store credit card information.

### Changes

**1. Create a reusable `StripeDisclosure` component** (`src/components/billing/StripeDisclosure.tsx`)
- Displays Stripe logo/lock icon with disclosure text: "Payments are securely processed by Stripe. TSMO does not store your credit card details. By proceeding, you agree to Stripe's Terms of Service and Privacy Policy."
- Links to Stripe's actual terms (https://stripe.com/legal/consumer) and privacy policy (https://stripe.com/privacy)
- Styled as a subtle, professional footer beneath checkout buttons
- Accepts optional `className` prop for layout flexibility

**2. Add disclosure to Pricing page** (`src/pages/Pricing.tsx`)
- Replace the existing one-liner "🔒 Secure payment powered by Stripe" (line 415-417) with the full `StripeDisclosure` component

**3. Add disclosure to Government Filing checkout** (`src/components/enhanced/GovernmentFilingService.tsx`)
- Add `StripeDisclosure` below the "Proceed to Payment" button in the filing form

**4. Add disclosure to Partner Pricing checkout** (`src/components/partner/PartnerPricingManager.tsx`)
- Add `StripeDisclosure` below the Subscribe buttons

### Technical Details
- Single reusable component, no new dependencies
- Links open in new tabs with `rel="noopener noreferrer"`
- Uses existing Lucide `Shield` or `Lock` icon + muted text styling consistent with current design system

