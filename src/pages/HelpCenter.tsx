import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Shield, AlertCircle, TestTube, MapPin } from 'lucide-react';

const HelpCenter = () => {
  const [selectedGuide, setSelectedGuide] = useState('overview');

  const guides = [
    {
      id: 'overview',
      title: 'Implementation Roadmap',
      icon: MapPin,
      badge: 'Overview',
      badgeVariant: 'default' as const,
      content: `
# Implementation Roadmap to 100/100

## Current Status: 75/100
**Target: 95/100 for beta launch**

## Timeline

### Week 1: Critical Path (Score: 70 → 85)
- **Day 1**: Fix email system (DNS verification)
- **Day 2-3**: Fix anonymous access RLS policies
- **Day 4**: Update error handling in auth flows
- **Day 5**: Test critical user flows

### Week 2: Security & Testing (Score: 85 → 92)
- **Day 1-2**: Complete security hardening
- **Day 3**: Add loading states to all forms
- **Day 4**: Implement skeleton loaders
- **Day 5**: End-to-end testing

### Week 3: Performance & Monitoring (Score: 92 → 97)
- **Day 1**: Add database indexes
- **Day 2**: Set up Sentry error tracking
- **Day 3**: Configure analytics
- **Day 4**: Performance optimization
- **Day 5**: Load testing

### Week 4: Final Polish (Score: 97 → 100)
- **Day 1-2**: Documentation for beta testers
- **Day 3**: Fix remaining issues
- **Day 4**: Final security audit
- **Day 5**: Beta launch preparation

## Next Steps
1. Start with email system fix (30 min - 24 hours)
2. Run all critical user flow tests
3. Begin security hardening implementation
      `
    },
    {
      id: 'email',
      title: 'Email System Setup',
      icon: BookOpen,
      badge: 'Critical',
      badgeVariant: 'destructive' as const,
      content: `
# Email System Fix Guide

## 🔴 CRITICAL BLOCKER - Bug Report Email System

### Quick Start

The bug report system needs DNS verification to send emails. Follow these steps:

---

## Step 1: Add DNS Record

Add this TXT record to your domain (tsmowatch.com):

- **Type**: TXT
- **Name**: \`resend._domainkey\`
- **Value**: \`p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoHbg+IS5+c78WxJz4HmYvAOOvocWWvXvlVbV7Ym9qXQ+1M/dwSSnuSkmrCInt/+rM/GOX2cY6V05cqt+p49KqL9Ih+8iABCX0MnyPKaCsOBG01XaJ9KsM/VLakQpE8qz7L7j79DGR5wgnLFRgs3lcI8SIIhKgNzuKytHCXQIbMQIDAQAB\`

### Where to Add (Common Providers)

**GoDaddy**: Domain Management → DNS → Add TXT Record  
**Cloudflare**: DNS → Add Record → TXT  
**Namecheap**: Advanced DNS → Add New Record → TXT

---

## Step 2: Verify Domain

1. Go to https://resend.com/domains
2. Find \`tsmowatch.com\`
3. Click **Verify**
4. Wait for green checkmark ✅

**DNS Propagation**: 15 min - 24 hours (usually < 1 hour)

---

## Step 3: Test Bug Reports

1. Click "Report Bug" in the app
2. Fill out the form
3. Submit
4. Check email at shirleena.cunningham@tsmowatch.com

### Expected Results

✅ Success message appears  
✅ Email received within 1 minute  
✅ No errors in console  

---

## Troubleshooting

### Email Not Received

**Check DNS**:
\`\`\`bash
nslookup -type=TXT resend._domainkey.tsmowatch.com
\`\`\`

**Check Logs**: https://supabase.com/dashboard/project/utneaqmbyjwxaqrrarpc/functions/send-bug-report/logs

### Still Not Working?

Temporarily use test sender:
- Change \`from: "bugs@tsmowatch.com"\`
- To \`from: "onboarding@resend.dev"\`

This allows testing while fixing DNS issues.

---

## Success Criteria

✅ DNS record added  
✅ Domain verified in Resend  
✅ Test email received  
✅ Edge function shows success logs  
      `
    },
    {
      id: 'security',
      title: 'Security Hardening',
      icon: Shield,
      badge: 'Important',
      badgeVariant: 'default' as const,
      content: `
# Security Hardening Guide

## Priority 1: Fix Anonymous Access

### The Problem

Many database tables allow anonymous users (not logged in) to access data. This exposes sensitive information.

---

## Quick Fix - Update RLS Policies

### Pattern to Follow

**Before** (INSECURE):
\`\`\`sql
USING (auth.uid() = user_id)
\`\`\`

**After** (SECURE):
\`\`\`sql
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
\`\`\`

The difference: \`auth.uid() IS NOT NULL\` ensures user is logged in.

---

## Tables to Fix Immediately

### 1. User Data Tables
- \`artwork\` - Personal artwork
- \`ai_protection_records\` - Protection data
- \`subscriptions\` - Payment info
- \`profiles\` - User profiles

### 2. Admin Tables
- \`admin_sessions\` - Admin access
- \`production_metrics\` - System data
- \`error_logs\` - Debug info

---

## Testing Security

### Test 1: Anonymous Access (Should Fail)

1. Log out completely
2. Try to view dashboard
3. **Expected**: Redirect to login
4. Try API call: \`supabase.from('artwork').select()\`
5. **Expected**: Empty result or error

### Test 2: User Isolation (Should Pass)

1. Login as User A
2. View only User A's data
3. **Expected**: Cannot see User B's artwork

### Test 3: Admin Access (Should Pass)

1. Login as admin
2. Can view all data
3. **Expected**: Full access to admin features

---

## Priority 2: Extensions Schema

Move PostgreSQL extensions out of public schema:

\`\`\`sql
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_stat_statements CASCADE;
CREATE EXTENSION pg_stat_statements WITH SCHEMA extensions;
\`\`\`

---

## Success Criteria

✅ No anonymous access to user data  
✅ Admin functions require admin role  
✅ All PII protected by RLS  
✅ Security audit shows 0 critical issues  
      `
    },
    {
      id: 'errors',
      title: 'Error Handling',
      icon: AlertCircle,
      badge: 'Quality',
      badgeVariant: 'secondary' as const,
      content: `
# Error Handling Implementation

## User-Friendly Errors

### The Goal

Show helpful messages instead of technical errors:

- ❌ "Failed to fetch"
- ✅ "Connection error. Please check your internet."

- ❌ "Permission denied"
- ✅ "You don't have permission to perform this action."

---

## Quick Implementation

### Use Standardized Handler

\`\`\`typescript
import { handleAsyncOperation } from '@/lib/errorHandler';

const saveData = async () => {
  const { data, error } = await handleAsyncOperation(
    async () => {
      // Your async operation
      const result = await supabase.from('table').insert(values);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      action: 'save item',
      successMessage: 'Item saved successfully!',
      showSuccessToast: true
    }
  );
  
  if (!error) {
    // Handle success
  }
};
\`\`\`

---

## Add Loading States

### Pattern

\`\`\`typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  await performAction();
  setIsLoading(false);
};

// In render:
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoadingSpinner size="sm" className="mr-2" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
\`\`\`

---

## Skeleton Loaders

Use for initial page loads:

\`\`\`typescript
if (isLoading) return <DashboardSkeleton />;

return <ActualContent />;
\`\`\`

---

## Retry Failed Operations

\`\`\`typescript
{error && (
  <div className="p-4 bg-destructive/10 rounded">
    <p className="text-destructive">{error}</p>
    <Button onClick={retry}>Try Again</Button>
  </div>
)}
\`\`\`

---

## Success Criteria

✅ All errors show user-friendly messages  
✅ All buttons have loading states  
✅ Users can retry failed actions  
✅ No unhandled errors in console  
      `
    },
    {
      id: 'testing',
      title: 'Testing Checklist',
      icon: TestTube,
      badge: 'QA',
      badgeVariant: 'outline' as const,
      content: `
# Critical User Flow Testing

## Test 1: Authentication

### Sign Up
1. Go to \`/auth\`
2. Enter: email, password, name, username
3. Click "Sign Up"
4. **Expected**: Verification email sent
5. Click email link
6. **Expected**: Redirect to dashboard

### Login
1. Enter email and password
2. Click "Login"
3. **Expected**: Redirect to dashboard
4. **Expected**: User data loads

---

## Test 2: Artwork Upload

1. Login
2. Go to \`/upload\`
3. Select image/video file
4. Fill: title, description, category
5. Click "Upload"
6. **Expected**: Success message
7. **Expected**: Artwork in dashboard

---

## Test 3: AI Protection

1. Select uploaded artwork
2. Click "Apply AI Protection"
3. **Expected**: Processing starts
4. Wait for completion
5. **Expected**: Status = "Protected"
6. **Expected**: Certificate available

---

## Test 4: Subscription

### View Plans
1. Go to \`/pricing\`
2. **Expected**: All plans visible

### Apply Promo Code
1. Enter \`BETA200\`
2. **Expected**: 30% discount shown

### Checkout (Test Mode)
1. Click "Upgrade"
2. **Expected**: Stripe checkout loads
3. Enter test card: \`4242 4242 4242 4242\`
4. **Expected**: Payment succeeds
5. **Expected**: Subscription status updates

---

## Test 5: Bug Report

1. Click "Report Bug"
2. Fill subject, description
3. Click "Submit"
4. **Expected**: Success message
5. **Expected**: Email received

---

## Browser Testing

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari
- ✅ Mobile Chrome

---

## Success Criteria

✅ All flows complete without errors  
✅ All success messages appear  
✅ All data persists correctly  
✅ No console errors  
✅ Works on all major browsers  
      `
    }
  ];

  const currentGuide = guides.find(g => g.id === selectedGuide) || guides[0];
  const Icon = currentGuide.icon;

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Help Center & Implementation Guides</h1>
        <p className="text-muted-foreground">
          Step-by-step guides to help you get the most out of TSMO
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guides</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {guides.map((guide) => {
                  const GuideIcon = guide.icon;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors ${
                        selectedGuide === guide.id ? 'bg-accent' : ''
                      }`}
                    >
                      <GuideIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-sm font-medium">{guide.title}</span>
                      <Badge variant={guide.badgeVariant} className="text-xs">
                        {guide.badge}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{currentGuide.title}</CardTitle>
                  <CardDescription>
                    <Badge variant={currentGuide.badgeVariant} className="mt-1">
                      {currentGuide.badge}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: currentGuide.content
                        .split('\n')
                        .map(line => {
                          // Headers
                          if (line.startsWith('### ')) {
                            return `<h3 class="text-lg font-semibold mt-6 mb-3">${line.substring(4)}</h3>`;
                          }
                          if (line.startsWith('## ')) {
                            return `<h2 class="text-xl font-bold mt-8 mb-4 pb-2 border-b">${line.substring(3)}</h2>`;
                          }
                          if (line.startsWith('# ')) {
                            return `<h1 class="text-2xl font-bold mb-4">${line.substring(2)}</h1>`;
                          }
                          
                          // Lists
                          if (line.startsWith('- ')) {
                            return `<li class="ml-4">${line.substring(2)}</li>`;
                          }
                          
                          // Bold
                          const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          
                          // Code inline
                          const codeLine = boldLine.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm">$1</code>');
                          
                          // Checkmarks
                          const checkLine = codeLine.replace(/✅/g, '<span class="text-green-500">✅</span>');
                          const crossLine = checkLine.replace(/❌/g, '<span class="text-red-500">❌</span>');
                          
                          // Code blocks
                          if (line.startsWith('```')) {
                            return line.includes('```') && !line.endsWith('```') 
                              ? '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>'
                              : '</code></pre>';
                          }
                          
                          // Horizontal rule
                          if (line === '---') {
                            return '<hr class="my-6 border-border" />';
                          }
                          
                          // Empty line
                          if (!line.trim()) {
                            return '<br />';
                          }
                          
                          // Regular paragraph
                          return `<p class="mb-3">${crossLine}</p>`;
                        })
                        .join('\n')
                    }}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
