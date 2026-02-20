
# Investor Pitch Deck — Downloadable Word + PDF Files

## Goal

Add a **"Download Pitch Deck"** section to the existing `InvestorPitchDeck.tsx` component that lets investors download the full deck as:
- An editable **Word document** (`.docx`) — fully editable in Microsoft Word or Google Docs
- A **PDF** — clean, print-ready version

Both files will be text-only (no embedded images) and will remain well under 1 MB — far below the 10 MB limit.

---

## What Exists Today

`src/components/InvestorPitchDeck.tsx` currently has:
- 7 interactive slides (Cover, Problem, Solution, Market, Business Model, Traction, Investment)
- Slide-by-slide navigation (Previous / Next buttons + dot navigation)
- A contact section at the bottom
- **No download capability at all**

`docx` (Word generation) and `jsPDF` (PDF generation) are **already installed** — the same libraries used in `NSFSBIRGrant.tsx` and `InvestorDataRoom.tsx`. No new dependencies needed.

---

## Files to Edit

### Only 1 file: `src/components/InvestorPitchDeck.tsx`

---

## Changes

### 1. Add imports
At the top of the file, add:
```typescript
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx';
import { FileDown, FileText } from 'lucide-react';
import { toast } from 'sonner';
```

---

### 2. Add `downloadPDF` function (inside the component, before return)

Generates a clean multi-page PDF using `jsPDF` with:

- **Page 1** — Cover: TSMO logo text, tagline, seed ask, valuation, founded date
- **Page 2** — The Problem: 4 bullet pain points, the $24.3B loss figure
- **Page 3** — The Solution: Four-Layer Defense System™, 4 feature bullets each
- **Page 4** — Market Opportunity: TAM $15.7B, the 3 market segments with sizes
- **Page 5** — Business Model: Subscription tiers, transaction fees, enterprise, unit economics table (CAC/LTV/ratio/payback)
- **Page 6** — Traction & Metrics: Key metrics ($200 MRR, 50+ users, 500+ artworks, 2,000+ scans, 25+ DMCA, 94% CSAT), retention/ARPU data
- **Page 7** — Financial Projections: 3-year table (customers, ARPU, MRR, annual revenue), growth metrics
- **Page 8** — Investment: $100K seed, $1M pre-money, $1.1M post-money, use of funds breakdown, 18-month milestones
- **Page 9** — Contact: email, website

Each page has a consistent header band (TSMO | slide title) and footer (page number + confidentiality notice).

Saves as: `TSMO_Investor_Pitch_Deck.pdf`

Estimated file size: **~80–150 KB** (text only, no images).

---

### 3. Add `downloadWord` async function (inside the component, before return)

Generates an editable `.docx` using the `docx` library with identical content to the PDF:

- Title page paragraph block
- 7 section headings (bold, `HeadingLevel.HEADING_1`) with body paragraphs
- Financial projection table using `DocxTable`
- Use of funds breakdown as a table
- Contact information at end

Saves as: `TSMO_Investor_Pitch_Deck.docx`

Estimated file size: **~30–60 KB** (Open XML text, no images).

---

### 4. Add Download Buttons UI

Between the slide viewer and the "Ready to Learn More?" contact card, insert a new download card:

```
┌─────────────────────────────────────────────────────────────────┐
│  📥 Download Pitch Deck                                          │
│  Take a copy of the full TSMO investor presentation              │
│                                                                  │
│  [📄 Download PDF]    [📝 Download Word Doc (.docx)]             │
│                                                                  │
│  PDF is print-ready · Word doc is fully editable                 │
│  Both files are text-based and under 1 MB                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pitch Deck Content (All 8 Slides Included in Download)

### Slide 1 — Cover
- TSMO — The Future of Digital IP Protection
- Protecting creators in the age of AI
- Seeking: $100K Seed | Pre-money Valuation: $1M
- Founded 2025 • Seed Stage

### Slide 2 — The Problem ($24.3B)
- AI Training Theft: models trained on copyrighted content without permission
- 400% increase in trademark infringement since 2020
- Legal action costs $50K–$500K and takes 18+ months
- $24.3B annual global IP theft losses

### Slide 3 — The Solution
- AI Training Protection: fingerprinting, real-time detection, proactive cloaking
- Comprehensive Monitoring: 70+ platforms, multi-modal detection, 95%+ accuracy
- Instant Response: automated DMCA filing, blockchain verification, legal doc generation
- Legal Enforcement: expert legal network, compliance workflows, government filing integration

### Slide 4 — Market Opportunity
- TAM: $15.7B total addressable market
- Digital Content Creators: $8.2B (52%)
- Enterprise IP Management: $4.7B (30%)
- Legal Technology: $2.8B (18%)
- Market drivers: creator economy growing 23% annually, AI adoption accelerating IP theft

### Slide 5 — Business Model
- Subscriptions (70% of revenue): Free / $19.99 / $29.99 / $199.99 / $5,000 per month
- Transaction Fees (20%): 15–20% commission on legal docs and consultations, $25–$100/case DMCA
- Enterprise (10%): White-label $10K–$100K/yr, custom integrations $25K–$250K
- Unit economics: CAC $15, LTV $583, 39x ratio, 0.4 month payback

### Slide 6 — Traction
- MRR: $200 (+45% MoM)
- Active users: 50+
- Protected artworks: 500+
- Monitoring scans: 2,000+
- DMCA notices filed: 25+
- Customer satisfaction: 94%
- Monthly retention: 89%, ARPU: $85/month

### Slide 7 — Financial Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Customers | 120 | 350 | 750 |
| ARPU | $35 | $43 | $56 |
| MRR | $4.2K | $15K | $42K |
| Annual Revenue | $50K | $180K | $500K |

- Series A readiness at 15–18 months, $3M–$10M expected valuation

### Slide 8 — Investment Opportunity
- Amount: $100K seed
- Pre-money: $1M | Post-money: $1.1M
- Security Type: Series A Preferred | Option Pool: 15%
- Use of Funds: Product Dev 50% ($50K), Customer Acquisition 30% ($30K), Operations/Legal 15% ($15K), Working Capital 5% ($5K)
- Milestones: 250 customers at 6 months, $4.2K MRR at 12 months, $50K ARR at 18 months

---

## File Size Guarantee

| File | Approach | Estimated Size |
|------|----------|----------------|
| PDF | jsPDF text-only, 9 pages | ~100–150 KB |
| Word | docx Open XML, no images | ~40–70 KB |
| Combined | Both downloads | ~200 KB total |

Both files are well under the 10 MB limit. No images are embedded. Fonts are built-in to both `jsPDF` (Helvetica) and `docx` (Calibri default).

---

## Technical Notes

- Both `jsPDF` and `docx` are already installed — no new `npm install` required
- `sonner` toast is already used elsewhere in the codebase for user feedback
- The `FileDown` and `FileText` icons from `lucide-react` are already imported in `NSFSBIRGrant.tsx` and available
- Download is triggered via `URL.createObjectURL(blob)` + programmatic anchor click — the same pattern used in `NSFSBIRGrant.tsx` and `InvestorDataRoom.tsx`
- No Supabase, edge functions, or backend changes required
- The existing interactive slide viewer is untouched — the download buttons are additive only
