

## Problem

`SignUpForm` is defined **inside** the `Pricing` component (line 294). Every keystroke on the promo code input calls `setPromoCode`, re-rendering `Pricing`, which recreates `SignUpForm` as a new component reference. React unmounts and remounts the form, causing the input to lose focus after each character.

## Fix

Extract `SignUpForm` out of the `Pricing` function to the top level of the file (or a separate file). Pass all referenced state/handlers as props.

### Changes — `src/pages/Pricing.tsx`

1. **Define a props interface** above `Pricing` for `SignUpForm`:
   - `plan`, `formData`, `handleInputChange`, `promoCode`, `setPromoCode`, `emailError`, `validateEmail`, `billingCycle`, `isProcessing`, `handleFormSubmit`, `formatPrice`

2. **Move `SignUpForm`** (lines 294–419) outside and above the `Pricing` component, accepting the props interface instead of using closure variables.

3. **Update the usage** inside `Pricing` to pass these values as props.

Single file change, no new dependencies.

