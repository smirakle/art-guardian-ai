

## Plan: Align Checkout Page Plans & Prices with Pricing Page

### Problem
The Checkout page (`/checkout`) has different plans and pricing than the Pricing page (`/pricing`):

| | Pricing Page | Checkout Page |
|---|---|---|
| Plans | Free ($0), Pro ($29/mo), Enterprise (Custom) | Student ($19), Starter ($29), Professional ($199) |
| Features | Mismatched feature lists | Old feature lists |
| Discount | Pro shows "40% OFF" ($49→$29) | No discount shown |
| Layout | 3 clean cards | Radio button selection |

### Changes

**1. Update plan definitions in `src/pages/Checkout.tsx`** (lines 73-91)
- Replace the `student/starter/professional` plans with `free/pro/enterprise` to match the Pricing page exactly
- Match prices: Free ($0), Pro ($29/mo, $290/yr), Enterprise (Custom)
- Match features lists exactly from the Pricing page
- Add the "40% OFF" discount badge for Pro
- Add the "Most Popular" badge for Pro

**2. Update plan selection UI** (lines 347-468)
- Update RadioGroup to show the 3 new plans (free, pro, enterprise)
- Show original price strikethrough for Pro ($49 → $29)
- Enterprise shows "Contact Sales" instead of a price
- Keep add-ons section but remove the professional-specific notice

**3. Update price calculations** (lines 101-117)
- Free plan: $0
- Pro plan: $29/mo or $290/yr (was $49, now 40% off)
- Enterprise: redirect to contact page, no checkout
- Remove old student/starter/professional pricing logic

**4. Update order summary section** (lines 625-786)
- Match feature lists to the Pricing page
- Update price display to show discount for Pro
- Keep add-ons, promo code, tax calculation, and beta tester flow

**5. Add `StripeDisclosure` component** below the submit button (around line 1053)
- Import already exists in the project; just add it to the checkout form

**6. Remove mock payment form** (lines 820-858)
- Remove the fake card number/CVV/expiry fields since real payments go through Stripe checkout
- Replace with a notice that user will be redirected to Stripe
- Update submit handler to call `create-checkout-session` edge function (like the Pricing page does) instead of the demo `create-subscription` call

### Technical Details
- The `create-checkout-session` edge function already supports `free` and `enterprise` plan IDs with proper handling
- The edge function's `planPricing` map has `starter` at $29 — we'll use `pro` mapped to the same Stripe flow by updating the edge function's pricing map to include a `pro` key at 2900 cents/mo
- Add `pro` to the edge function's `planPricing` record: `pro: { monthly: 2900, yearly: 29000 }`
- The checkout will redirect to Stripe (real payment) instead of collecting card details locally

