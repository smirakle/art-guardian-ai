

## Plan: Add Organization JSON-LD Structured Data

### Problem
Google is confusing "TSMO Watch" (art protection software) with a scam dropshipping watch store. Adding explicit Organization structured data will help Google correctly identify TSMO as a technology/software company.

### Changes

**`index.html`** — Add a second `<script type="application/ld+json">` block with Organization schema, placed after the existing WebApplication block. This will include:

- `@type: Organization`
- `name: TSMO`
- `alternateName: TSMO Watch` (to claim the name)
- `url` pointing to the site
- `description` explicitly stating it's an AI art protection platform (not watches/retail)
- `foundingDate`, `industry` keywords
- `sameAs` array (empty for now, can add social links later)
- `logo` using the existing favicon/logo URL
- `knowsAbout` array with terms like "copyright protection", "AI art monitoring", "digital art security"

This disambiguates the entity for Google's Knowledge Graph and AI Overview, making it clear TSMO is a software company in the art protection space — not a watch retailer.

