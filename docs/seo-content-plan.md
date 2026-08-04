# SEO & Content Strategy

## Keyword Clusters

### Company Refund Intent

"How to claim refund from [company]", "[company] refund status", "[company] compensation claim form".
**Target pages**: Individual claim detail pages + company profile pages.

### Legal-Process Intent

"Consumer complaint compensation India", "SEBI investor refund process", "RBI banking ombudsman claim", "NCLT class action India".
**Target pages**: Sector hub pages + editorial explainers.

### Proof Intent

"[company] penalty proof", "consumer court judgment [company]", "SEBI order against [company]".
**Target pages**: Claim detail pages with linked source documents.

### Deadline Intent

"[scheme name] last date to claim", "[company] refund deadline", "registration closing date [sector]".
**Target pages**: Time-sensitive claim pages with countdown + alert CTA.

### Sector Intent

"Banking sector refunds India", "insurance claim settlements India", "telecom consumer compensation".
**Target pages**: Sector hub pages aggregating all claims in a sector.

## Content Strategy

### Public Claim Pages

- Unique editorial summary (min 200 words) per claim — no templated thin content.
- Structured data: `Article` JSON-LD with `datePublished`, `dateModified`, `author`.
- "Last verified" date prominently displayed.
- Related claims and company links for internal link graph.

### Company Profile Pages

- Aggregated view of all claims against a company.
- Unique editorial overview of the company's regulatory history.
- `Organization` JSON-LD with `name`, `legalName`, `identifier` (CIN).

### Sector Hub Pages

- Editorial introduction to the sector's regulatory landscape.
- Curated list of active and historical claims.
- `CollectionPage` JSON-LD.

### Blog / Editorial

- Long-form explainers of legal processes, consumer rights, landmark cases.
- Targets legal-process and proof intent keywords.
- `Article` JSON-LD with full author attribution.

## Technical SEO

- Dynamic sitemap with sitemap indexes (> 50 k URLs).
- `robots.txt` allows public pages; blocks admin, auth, API.
- Canonical URLs explicit; no-index on staging / preview.
- OG + Twitter Cards on every public page.
- Internal linking: every claim links to its company, sector, and related claims.
