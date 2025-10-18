# Email System Fix Guide

## 🔴 CRITICAL BLOCKER - Bug Report Email System

### Current Status
- Bug report form exists and functional
- Edge function `send-bug-report` is deployed
- Resend API key configured
- **BLOCKER**: Domain verification incomplete - emails cannot be sent

### Issue
Resend requires DNS verification before emails can be sent from `bugs@tsmowatch.com`. Currently emails fail silently because the domain is not verified.

---

## Step-by-Step Implementation

### Step 1: Add DKIM Record to DNS (Required)

**Action Required**: Add TXT record to tsmowatch.com DNS settings

#### DNS Settings
- **Type**: `TXT`
- **Name**: `resend._domainkey`
- **Value**: 
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoHbg+IS5+c78WxJz4HmYvAOOvocWWvXvlVbV7Ym9qXQ+1M/dwSSnuSkmrCInt/+rM/GOX2cY6V05cqt+p49KqL9Ih+8iABCX0MnyPKaCsOBG01XaJ9KsM/VLakQpE8qz7L7j79DGR5wgnLFRgs3lcI8SIIhKgNzuKytHCXQIbMQIDAQAB
```
- **TTL**: `3600` (or default)

#### Where to Add This
Depending on your DNS provider:

**GoDaddy**:
1. Log in to GoDaddy
2. Go to Domain Management
3. Click DNS for tsmowatch.com
4. Add New Record → TXT
5. Host: `resend._domainkey`
6. TXT Value: (paste the long value above)
7. Save

**Cloudflare**:
1. Log in to Cloudflare
2. Select tsmowatch.com domain
3. DNS → Add Record
4. Type: TXT
5. Name: `resend._domainkey`
6. Content: (paste the long value above)
7. Save

**Namecheap**:
1. Log in to Namecheap
2. Domain List → Manage
3. Advanced DNS
4. Add New Record → TXT Record
5. Host: `resend._domainkey`
6. Value: (paste the long value above)
7. Save

#### Verification Timeline
- DNS propagation: 5 minutes to 24 hours (typically < 1 hour)
- Check propagation: `nslookup -type=TXT resend._domainkey.tsmowatch.com`

---

### Step 2: Verify Domain in Resend

**URL**: https://resend.com/domains

1. Log in to Resend dashboard
2. Navigate to Domains section
3. Find `tsmowatch.com` in the list
4. Click "Verify" button
5. Resend will check for the DKIM record
6. Status should change from "Pending" to "Verified" ✅

**Expected Result**: Green checkmark next to tsmowatch.com domain

---

### Step 3: Test Email Delivery

#### Manual Test via Bug Report Form

1. Go to your app
2. Click "Report Bug" button
3. Fill out the form:
   - Subject: "Test - Email System Verification"
   - Description: "Testing bug report email delivery after DNS verification"
   - Steps to Reproduce: "N/A - System test"
4. Submit

#### Check Email Delivery

**Expected Email**:
- **To**: shirleena.cunningham@tsmowatch.com
- **From**: TSMO Bug Reports <bugs@tsmowatch.com>
- **Subject**: 🐛 Bug Report: Test - Email System Verification

**Check Spam Folder**: First-time emails from new domains may land in spam

#### Monitor Edge Function Logs

Check logs at: https://supabase.com/dashboard/project/utneaqmbyjwxaqrrarpc/functions/send-bug-report/logs

**Success Log Example**:
```
✅ [Step] Email sent successfully
{
  "id": "re_...",
  "from": "bugs@tsmowatch.com",
  "to": ["shirleena.cunningham@tsmowatch.com"]
}
```

**Failure Log Example** (if domain not verified):
```
❌ Error in send-bug-report function
{
  "message": "Domain not verified",
  "statusCode": 403
}
```

---

### Step 4: Troubleshooting

#### Issue: Domain Still Not Verified After 24 Hours

**Check DNS Record**:
```bash
nslookup -type=TXT resend._domainkey.tsmowatch.com
```

**Expected Output**:
```
resend._domainkey.tsmowatch.com text = "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoHbg+IS5+c78WxJz4HmYvAOOvocWWvXvlVbV7Ym9qXQ+1M/dwSSnuSkmrCInt/+rM/GOX2cY6V05cqt+p49KqL9Ih+8iABCX0MnyPKaCsOBG01XaJ9KsM/VLakQpE8qz7L7j79DGR5wgnLFRgs3lcI8SIIhKgNzuKytHCXQIbMQIDAQAB"
```

**If Not Found**: DNS record not added correctly, check DNS provider settings

#### Issue: Emails Land in Spam

**Solution**: Add SPF record

Add another TXT record:
- **Name**: `@` (or leave blank for root domain)
- **Value**: `v=spf1 include:_spf.resend.com ~all`

#### Issue: Edge Function Timeout

**Check**: Resend API key is correct
- Go to https://resend.com/api-keys
- Verify API key matches the one in Supabase secrets

**Update Secret** (if needed):
```bash
# In Supabase dashboard
Settings → Edge Functions → Add Secret
Name: RESEND_API_KEY
Value: re_... (your actual key)
```

---

### Step 5: Post-Verification Actions

Once emails are working:

1. **Test All Scenarios**:
   - Bug report with minimum fields
   - Bug report with all fields filled
   - Long bug descriptions (test character limits)
   - Special characters in subject/description

2. **Update Documentation**:
   - Mark email system as ✅ OPERATIONAL in BETA_TESTING_CHECKLIST.md
   - Document any spam filter issues

3. **Set Up Email Monitoring**:
   - Create Resend webhook for delivery tracking
   - Log all sent emails in `email_logs` table (future enhancement)

---

## Success Criteria

✅ DNS TXT record added and verified
✅ Domain status "Verified" in Resend dashboard
✅ Test email received at shirleena.cunningham@tsmowatch.com
✅ Edge function logs show successful sends
✅ No errors in browser console during submission
✅ User sees success toast message

---

## Timeline
- **DNS Addition**: 5 minutes
- **DNS Propagation**: 15 minutes - 24 hours (avg: 1 hour)
- **Domain Verification**: 1 minute
- **Testing**: 15 minutes
- **Total**: ~2 hours (including propagation wait)

---

## Rollback Plan

If issues persist:
1. Temporarily use `onboarding@resend.dev` as sender (works without verification)
2. Update edge function:
```typescript
from: "TSMO Bug Reports <onboarding@resend.dev>",
replyTo: "bugs@tsmowatch.com",
```
3. Continue with beta testing
4. Fix DNS verification issues in parallel
