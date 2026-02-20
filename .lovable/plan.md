
# Editable Word Document Download — NSF SBIR Grant Page

## Overview

A **"Download Word Doc"** button will be added to the NSF Grant page alongside the existing PDF button. Clicking it will generate and download a fully editable `.docx` file containing all 8 grant sections, the budget table, and the milestone timeline — formatted and ready for submission editing in Microsoft Word or Google Docs.

---

## Why a New Package Is Needed

The project has `jsPDF` for PDF generation, but `.docx` files require a different format (Open XML). The standard pure-JavaScript library for this is **`docx`** (npm). It:
- Runs entirely in the browser (no server needed)
- Produces real `.docx` Open XML files editable in Word, Google Docs, LibreOffice
- Has no backend or API key requirements
- Is a well-maintained package (~2M weekly downloads)

---

## Data Corrections Also Applied

The same corrections identified in the data-accuracy review will be applied in this same implementation pass:

| Field | Before | After | Source |
|---|---|---|---|
| Creator count | 57M | 64M | MBO Partners / Upwork 2024 |
| Economic harm | $15B+ (Creative Economy Coalition 2024) | $17.5B+ (UNESCO Creative Economy Report, 2026) |
| TAM | $4.2B | $6.72B | MarketsandMarkets 2025 |
| NSF Program badge | 47.084 | NSF 24-579 | NSF official solicitation |
| Phase I max note | $275,000 | $275,000 (max: $305,000) | Solicitation NSF 24-579 |
| Advisory board blurb | 57M creator segment | 64M creator segment | — |

---

## Files to Edit

### 1. `src/components/admin/NSFSBIRGrant.tsx`

#### a) Add `downloadWord` function

Using the `docx` library, this function will construct a multi-section Word document with:

- **Title page block** — Project title, applicant, program, duration, requested amount
- **8 narrative sections** — Each section gets a bold heading + body paragraphs (pre-filled from the same `sections` constants already defined)
- **Budget table** — A proper Word table with headers: Line Item / Low Estimate / High Estimate / Justification; totals row in bold
- **Milestone table** — Month / Deliverable / Success Metric columns
- **Page breaks** between major sections for clean printing

The function saves as `TSMO_Watch_NSF_SBIR_Phase_I_Grant.docx`.

#### b) Add "Download Word Doc" button in the header card

Next to the existing amber "Download PDF" button, add a second button:
```
<Button onClick={downloadWord} variant="outline" className="gap-2 shrink-0">
  <FileDown className="h-4 w-4" />
  Download Word Doc
</Button>
```

And a matching button in the bottom CTA row (currently only has the PDF button).

#### c) Fix all inaccurate data in the same pass

- `REQUESTED_AMOUNT` constant → `"$275,000 (Phase I max: $305,000)"`
- `NSF_PROGRAM` constant → `"NSF SBIR Phase I — Solicitation NSF 24-579"`
- Header badge → `"Program: NSF 24-579"`
- Broader Impacts stat card: `"57 Million"` → `"64 Million"`, citation updated
- Broader Impacts stat card: `"$15B+"` → `"$17.5B+"`, citation updated to UNESCO 2026
- `sections.broaderImpacts` text string: same corrections
- Commercial Potential TAM card: `"$4.2B"` → `"$6.72B"`, citation updated to MarketsandMarkets 2025
- `sections.commercialPotential` text string: same correction
- Team advisory board description: `"57M creator segment"` → `"64M creator segment"`

### 2. `package.json` / `vite.config.ts`

Install the `docx` package:
```
npm install docx
```

This is the only new dependency needed. No backend changes required.

---

## Word Document Structure

```text
TSMO Watch — NSF SBIR Phase I Grant Application
================================================

Project Title: AI-Powered Creative IP Protection...
Small Business: TSMO Watch, Inc.
Program: NSF SBIR Phase I — Solicitation NSF 24-579
Duration: 6 months (Phase I)
Requested Amount: $275,000 (Phase I max: $305,000)

[Page Break]

1. PROJECT SUMMARY / ABSTRACT
-------------------------------
[Full narrative text...]

[Page Break]

2. INTELLECTUAL MERIT
----------------------
[Full narrative text...]

... (sections 3–6)

7. USE OF FUNDS BREAKDOWN (TABLE)
----------------------------------
| Line Item | Low | High | Justification |
|-----------|-----|------|---------------|
| C2PA Credentials | $3,000 | $8,000 | ... |
...
| TOTAL | $193,000 | $297,000 | |

8. MILESTONE TIMELINE (TABLE)
-------------------------------
| Month | Deliverable | Success Metric |
| 1–2 | C2PA integration | trustStatus: trusted |
...

9. TEAM & QUALIFICATIONS
-------------------------
[Full narrative text...]
```

---

## Technical Notes

- The `docx` library generates Open XML `.docx` blobs in the browser via `Packer.toBlob()`
- The blob is downloaded using `URL.createObjectURL()` — same pattern already used elsewhere in the codebase (e.g., `AIProtectedFilesManager.tsx`)
- All section text comes from the same `sections` constants already defined — no content duplication
- Budget and milestone data come from the same `budgetItems` and `milestones` arrays
- No backend or Supabase changes required — purely frontend
- The Word doc will be fully editable: all text, tables, and headings can be modified in Word or Google Docs before submission
