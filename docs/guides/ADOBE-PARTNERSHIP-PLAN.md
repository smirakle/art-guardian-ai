# Adobe Creative Cloud Partnership Certification Plan

**Current Status:** 75% Ready  
**Target:** 100% Partnership Certification  
**Last Updated:** December 31, 2024

---

## Executive Summary

To achieve Adobe Creative Cloud partnership certification, we need to address:
- 212 database security warnings (RLS policies)
- Build actual UXP plugin package (.ccx file)
- Implement real C2PA signing
- Obtain Adobe API credentials
- Complete plugin distribution infrastructure

---

## Phase 1: Security Hardening (Priority: CRITICAL)
**Timeline:** 2-3 days  
**Owner:** Backend/Database Team

### 1.1 Fix Anonymous Access Policies
**Issue:** 211 tables have RLS policies that allow anonymous access to user data.

**Tables Requiring Immediate Fix:**
| Table | Risk Level | Required Change |
|-------|------------|-----------------|
| `admin_online_status` | HIGH | Restrict to authenticated admins only |
| `ai_protection_records` | CRITICAL | Ensure `auth.uid() IS NOT NULL` |
| `ai_training_violations` | CRITICAL | User-only access |
| `artwork` | CRITICAL | Owner-only access |
| `profiles` | HIGH | Self-access only |
| `subscriptions` | CRITICAL | Owner-only access |

**SQL Pattern to Apply:**
```sql
-- Before (INSECURE):
CREATE POLICY "Users can view data" ON table_name
FOR SELECT USING (user_id = auth.uid());

-- After (SECURE):
CREATE POLICY "Users can view data" ON table_name
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
```

### 1.2 Move Extensions from Public Schema
**Issue:** PostgreSQL extensions in `public` schema.

```sql
-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;
ALTER EXTENSION pgcrypto SET SCHEMA extensions;
```

### 1.3 Verification Checklist
- [ ] All user tables require `auth.uid() IS NOT NULL`
- [ ] Admin tables use `has_role(auth.uid(), 'admin')`
- [ ] No anonymous SELECT on sensitive data
- [ ] Rate limiting table secured

---

## Phase 2: C2PA Real Signing Implementation
**Timeline:** 3-5 days  
**Owner:** Security/Cryptography Team

### 2.1 Obtain C2PA Signing Certificate
1. Register at [Content Authenticity Initiative](https://contentauthenticity.org)
2. Request signing certificate for production use
3. Store certificate securely in Supabase secrets

### 2.2 Implement ES256 Signing
**File:** `supabase/functions/adobe-plugin-api/index.ts`

```typescript
// Replace placeholder signature with real ES256 signing
async function signC2paManifest(manifest: object, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(manifest));
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    data
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
```

### 2.3 Secrets Required
| Secret Name | Description |
|-------------|-------------|
| `C2PA_PRIVATE_KEY` | ES256 private key (PEM format) |
| `C2PA_CERTIFICATE` | X.509 certificate chain |
| `C2PA_ISSUER_ID` | CAI issuer identifier |

---

## Phase 3: Adobe Developer Registration
**Timeline:** 1-2 weeks (includes Adobe review)  
**Owner:** Product/Partnerships Team

### 3.1 Register for Adobe Exchange
1. Go to [partners.adobe.com/exchangeprogram/creativecloud](https://partners.adobe.com/exchangeprogram/creativecloud)
2. Create Adobe ID (if not exists)
3. Complete partner application form
4. Accept Adobe Exchange Agreement

### 3.2 Create Developer Project
1. Access [Adobe Developer Console](https://developer.adobe.com/console)
2. Create new project: "TSMO AI Protection Plugin"
3. Add Creative Cloud API
4. Generate OAuth credentials

### 3.3 Credentials to Obtain
| Credential | Where to Store |
|------------|----------------|
| `ADOBE_CLIENT_ID` | Supabase Secrets |
| `ADOBE_CLIENT_SECRET` | Supabase Secrets |
| `ADOBE_ORG_ID` | Supabase Secrets |

---

## Phase 4: UXP Plugin Development
**Timeline:** 2-3 weeks  
**Owner:** Frontend/Plugin Team

### 4.1 Setup Development Environment
```bash
# Install UXP Developer Tools
npm install -g @adobe/create-uxp-plugin

# Create plugin scaffold
npx create-uxp-plugin tsmo-protection-plugin
```

### 4.2 Plugin Structure
```
tsmo-protection-plugin/
├── manifest.json          # Plugin metadata
├── index.html            # Plugin UI
├── index.js              # Main logic
├── styles.css            # Adobe Spectrum styles
└── icons/
    ├── icon-16.png
    ├── icon-24.png
    └── icon-48.png
```

### 4.3 manifest.json Template
```json
{
  "manifestVersion": 5,
  "id": "com.tsmo.aiprotection",
  "name": "TSMO AI Training Protection",
  "version": "1.0.0",
  "host": [
    { "app": "PS", "minVersion": "24.0.0" },
    { "app": "AI", "minVersion": "27.0.0" }
  ],
  "entrypoints": [
    {
      "type": "panel",
      "id": "mainPanel",
      "label": { "default": "TSMO Protection" },
      "icons": [
        { "width": 24, "height": 24, "path": "icons/icon-24.png" }
      ]
    }
  ]
}
```

### 4.4 Core Plugin Features
- [ ] Single file protection with XMP injection
- [ ] Batch protection for multiple files
- [ ] Protection verification
- [ ] Certificate generation and export
- [ ] Account connection and authentication

### 4.5 Build and Package
```bash
# Build plugin
npm run build

# Package as .ccx
npx uxp-pack --manifest manifest.json --output dist/tsmo-protection.ccx
```

---

## Phase 5: Plugin Distribution
**Timeline:** 1 week  
**Owner:** DevOps/Infrastructure Team

### 5.1 Host Plugin Package
1. Upload `.ccx` to Supabase Storage bucket
2. Create versioned download URLs
3. Implement download tracking

### 5.2 Update Landing Page
**File:** `src/pages/AdobeIntegration.tsx`
- Replace placeholder download link with real `.ccx` URL
- Add version information
- Add installation video tutorial

### 5.3 Auto-Update Infrastructure
```typescript
// Version check endpoint
GET /api/plugin-version
Response: { "version": "1.0.0", "downloadUrl": "...", "changelog": "..." }
```

---

## Phase 6: Adobe Certification Submission
**Timeline:** 2-4 weeks (Adobe review process)  
**Owner:** Product/Partnerships Team

### 6.1 Pre-Submission Checklist
- [ ] Plugin tested on Photoshop 2024+
- [ ] Plugin tested on Illustrator 2024+
- [ ] All API endpoints have rate limiting
- [ ] Privacy Policy URL accessible
- [ ] Terms of Service URL accessible
- [ ] Support email configured
- [ ] Demo account created for reviewers

### 6.2 Required Marketing Assets
| Asset | Specification |
|-------|---------------|
| Plugin icon | 512x512 PNG, transparent |
| Screenshots | 3 minimum, 1920x1080 |
| Demo video | 60-90 seconds, MP4 |
| Description | 500-2000 characters |

### 6.3 Submit to Adobe Exchange
1. Log in to Adobe Exchange Publisher Portal
2. Create new listing
3. Upload plugin package
4. Fill metadata and descriptions
5. Upload marketing assets
6. Submit for review

---

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Security | 2-3 days | None |
| Phase 2: C2PA Signing | 3-5 days | CAI registration |
| Phase 3: Adobe Registration | 1-2 weeks | None |
| Phase 4: UXP Plugin | 2-3 weeks | Phase 3 |
| Phase 5: Distribution | 1 week | Phase 4 |
| Phase 6: Certification | 2-4 weeks | All phases |

**Total Estimated Time:** 8-12 weeks

---

## Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Adobe rejects plugin | Medium | Follow Adobe UX guidelines strictly |
| C2PA cert delays | Low | Start CAI registration immediately |
| Security audit fails | Medium | Fix all 212 warnings before submission |
| Plugin compatibility issues | Medium | Test on multiple Adobe versions |

---

## Success Metrics

- [ ] 0 security linter warnings
- [ ] Plugin approved on Adobe Exchange
- [ ] 100+ plugin installs in first month
- [ ] <5% user-reported issues
- [ ] Real C2PA signatures verifiable

---

## Immediate Actions (This Week)

1. **Day 1-2:** Run database migration to fix top 50 critical RLS policies
2. **Day 2:** Register for Adobe Exchange Partner Program
3. **Day 3:** Apply for C2PA signing certificate from CAI
4. **Day 4-5:** Begin UXP plugin scaffold and basic UI
5. **End of Week:** Have security warnings under 50

---

## Resources

- [Adobe UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [Adobe Exchange Guidelines](https://partners.adobe.com/exchangeprogram/creativecloud/build/guidelines.html)
- [C2PA Specification](https://c2pa.org/specifications/specifications/1.0/specs/C2PA_Specification.html)
- [Content Authenticity Initiative](https://contentauthenticity.org)

---

*Document maintained by TSMO Engineering Team*
