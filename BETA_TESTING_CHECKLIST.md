# Beta Testing Checklist

## 🔴 CRITICAL - Must Fix Before Launch

### 1. Email System (BLOCKER)
- [ ] Add DKIM TXT record to tsmowatch.com DNS:
  - Name: `resend._domainkey`
  - Type: `TXT`
  - Value: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoHbg+IS5+c78WxJz4HmYvAOOvocWWvXvlVbV7Ym9qXQ+1M/dwSSnuSkmrCInt/+rM/GOX2cY6V05cqt+p49KqL9Ih+8iABCX0MnyPKaCsOBG01XaJ9KsM/VLakQpE8qz7L7j79DGR5wgnLFRgs3lcI8SIIhKgNzuKytHCXQIbMQIDAQAB`
- [ ] Verify domain at https://resend.com/domains
- [ ] Test bug report email delivery to shirleena.cunningham@tsmowatch.com

### 2. Critical User Flow Testing

#### Authentication Flow
- [ ] Sign up with new email
- [ ] Verify email confirmation works
- [ ] Log in with verified account
- [ ] Log out successfully
- [ ] Password reset flow
- [ ] Invalid credentials error handling

#### Protection Flow
- [ ] Upload artwork (image/video)
- [ ] AI protection application
- [ ] Blockchain registration
- [ ] View protection status
- [ ] Download certificate

#### Subscription Flow
- [ ] View pricing page
- [ ] Click "Upgrade to Premium"
- [ ] Apply BETA200 promo code (should show 30% off)
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify subscription status updates in database
- [ ] Verify protected features are now accessible

#### Bug Report Flow
- [ ] Click "Report Bug" button
- [ ] Fill out bug report form
- [ ] Submit report
- [ ] Verify email arrives at shirleena.cunningham@tsmowatch.com

### 3. Security Review
- [ ] Review 190 Supabase linter warnings
- [ ] Fix anonymous access policies (priority: high-risk tables)
- [ ] Verify admin-only routes require proper authentication
- [ ] Test RLS policies with different user roles
- [ ] Ensure sensitive data is not exposed to anonymous users

## 🟡 HIGH PRIORITY - Should Fix Soon

### 4. Performance Optimization
- [ ] Add database indexes:
  - `CREATE INDEX idx_artwork_user_id ON artwork(user_id)`
  - `CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status)`
  - `CREATE INDEX idx_ai_protection_user_active ON ai_protection_audit_log(user_id, created_at)`
- [ ] Test page load times
- [ ] Check bundle size
- [ ] Implement image lazy loading

### 5. Error Handling
- [x] Implement ErrorBoundary (DONE)
- [x] Standardize error messages (DONE)
- [ ] Add loading states to all async operations
- [ ] Test offline/network failure scenarios

### 6. Monitoring Setup
- [ ] Set up Sentry for production error tracking
- [ ] Configure analytics tracking
- [ ] Set up uptime monitoring
- [ ] Create status page

## 🟢 NICE TO HAVE - Post-Launch

### 7. Documentation
- [ ] Create beta tester onboarding guide
- [ ] Document known issues
- [ ] Set up feedback collection process
- [ ] Create troubleshooting FAQ

### 8. Advanced Features
- [ ] AI model improvements
- [ ] Performance optimizations
- [ ] Additional protection features
- [ ] Enhanced reporting

## Testing Notes

### Test Accounts Needed
1. **Regular User**: Test standard features
2. **Premium User**: Test paid features
3. **Admin User**: Test admin dashboard

### Test Data Requirements
- Sample images (JPEG, PNG)
- Sample videos (MP4)
- Various file sizes (small, medium, large)

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Known Issues to Document
- List any known bugs or limitations
- Workarounds for beta testers

## Beta Readiness Score: 75/100
**Target: 95/100 before public launch**

### Current Status
- ✅ Core functionality implemented
- ✅ Error handling improved
- ⚠️ Email system pending DNS verification
- ⚠️ Security review needed
- ⚠️ Performance optimization pending
- ❌ Production monitoring not yet configured

### Next Steps
1. Complete DNS verification for email system
2. Run through all critical user flows
3. Fix high-priority security warnings
4. Add database indexes
5. Set up monitoring infrastructure
