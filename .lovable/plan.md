
# NSF SBIR Grant Page — Admin Panel

## Overview

A new **"NSF Grant"** tab will be added to the Admin panel (`src/pages/Admin.tsx`), housing a brand-new component `src/components/admin/NSFSBIRGrant.tsx`. The page will present the full NSF SBIR-formatted grant narrative for TSMO Watch, broken into the official required sections, with a copy-to-clipboard and PDF download capability.

---

## NSF SBIR Required Sections (Content Plan)

The grant page will include all required NSF SBIR Phase I sections in order:

1. **Cover Summary** — One-paragraph abstract (300 words max), project title, duration, requested amount
2. **Intellectual Merit** — What makes TSMO's technical approach novel and scientifically/technically significant
3. **Broader Impacts** — Societal benefit, economic impact on independent creators, alignment with NSF's democratization goals
4. **Commercial Potential** — Market size (TAM/SAM/SOM), revenue model, go-to-market strategy, competitive landscape
5. **Use of Funds Breakdown** — Itemized budget with justification (C2PA credentials, AI model training, legal infrastructure, accessibility)
6. **Technical Approach** — The C2PA/JUMBF pipeline, style cloaking, reverse image search, 24/7 monitoring
7. **Team & Qualifications** — Placeholder for principal investigator and team credentials
8. **Milestone Timeline** — Key deliverables mapped to Phase I 6-month period

---

## Files to Create / Edit

### New File: `src/components/admin/NSFSBIRGrant.tsx`

A rich, scrollable admin component with:
- Section-by-section NSF SBIR narrative using `Card` + `CardHeader` + `CardContent`
- Color-coded section badges (e.g., blue for Intellectual Merit, green for Broader Impacts, amber for Commercial Potential)
- A **Copy Section** button on each card (copies just that section's text to clipboard via the `navigator.clipboard` API)
- A **Download Full Grant as PDF** button at the top using `jsPDF` (already installed) that exports all sections into a print-ready PDF
- A **Budget Table** for Use of Funds with line items, low/high estimates, and justification column
- A **Milestone Table** with phase, deliverable, month, and success metric columns
- All content pre-filled with TSMO-specific real data (no placeholder Lorem Ipsum)

### Edit: `src/pages/Admin.tsx`

- Import `NSFSBIRGrant` from `@/components/admin/NSFSBIRGrant`
- Add a new `TabsTrigger` for `"nsf-grant"` styled with an amber/gold gradient to stand out:
  ```
  bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20
  ```
- Add the corresponding `TabsContent` that renders `<NSFSBIRGrant />`

---

## Grant Content Details

### Section 1 — Project Summary (Abstract)
- Title: "AI-Powered Creative IP Protection and Content Provenance for Independent Artists"
- Duration: 6 months (Phase I)
- Requested Amount: $275,000
- One-paragraph overview covering style cloaking, C2PA provenance, monitoring, and legal automation

### Section 2 — Intellectual Merit
- Novel application of C2PA v2.2 + JUMBF metadata embedding to protect independent creators (not just enterprise)
- First platform to combine adversarial style cloaking + cryptographic provenance in a single pipeline
- Technical innovation in perceptual hashing across 47+ platforms simultaneously
- Alignment with NSF priorities: trustworthy AI, human-centered computing, cybersecurity

### Section 3 — Broader Impacts
- 57 million independent creators in the US (BLS/Etsy data)
- Economic harm from AI scraping estimated at $15B+ annually
- TSMO reduces legal cost barrier from $5,000–$50,000 per DMCA case to near-zero via automation
- Alignment with NSF broadening participation: designed for underserved creator communities
- C2PA ecosystem contribution: open-standard implementation benefits the entire creative industry

### Section 4 — Commercial Potential
- TAM: $4.2B (global digital content protection market, 2024)
- SAM: $820M (independent creator segment)
- SOM: $41M (3-year realistic capture)
- Revenue: SaaS tiers ($9.99–$49.99/mo) + enterprise licensing + government contracts
- Competitors: Pixsy (detection only), Copytrack (detection only) — TSMO uniquely combines prevention + detection + legal automation

### Section 5 — Use of Funds (Budget Table)

| Line Item | Low Estimate | High Estimate | Justification |
|---|---|---|---|
| C2PA Production Signing Credentials | $3,000 | $8,000 | SSL.com/DigiCert X.509 cert + CAI issuer registration |
| AI Detection Model Training | $15,000 | $40,000 | GPU compute + labeled training datasets |
| Legal Automation Infrastructure | $10,000 | $25,000 | DMCA filing API integrations |
| Platform Accessibility & Free Tier | $5,000 | $12,000 | Onboarding, UX, educator outreach |
| Personnel (Principal Investigator) | $120,000 | $150,000 | Lead researcher/developer, 6 months |
| Indirect Costs (F&A, ~26%) | $40,000 | $62,000 | Facilities & administration |
| **Total** | **$193,000** | **$297,000** | |

### Section 6 — Milestone Timeline (6-Month Phase I)

| Month | Deliverable | Success Metric |
|---|---|---|
| 1–2 | C2PA production credential procurement & integration | `trustStatus: trusted` from CAI validator |
| 2–3 | AI detection model v2 training complete | 92%+ accuracy on held-out test set |
| 3–4 | Legal automation: DMCA filing API live | End-to-end filing time <5 minutes |
| 4–5 | Free tier launch with 1,000 creator onboarding | 1,000 registered free-tier users |
| 5–6 | Phase I report + Phase II proposal drafted | NSF-ready deliverables submitted |

---

## Technical Implementation Notes

- Component is purely presentational (no database queries needed)
- PDF generation uses `jspdf` (already installed) — text-only PDF with section headers
- Copy-to-clipboard uses native `navigator.clipboard.writeText()` with a toast confirmation via `sonner`
- No new dependencies required
- Follows the same pattern as `EUAIActCompliance.tsx` (cards, badges, progress indicators)
