# SEO & Performance

## Rendering Strategy

- **SSG / ISR** for all public pages (claim detail, company profiles, sector hubs, blog).
- `revalidate` intervals: news-driven pages 60 s; evergreen pages 3600 s.
- Authenticated dashboards render dynamically server-side; never cache user-specific data.

## Metadata

- Every page has a unique `<title>` and `<meta description>` — generated via Next.js `generateMetadata`.
- Open Graph + Twitter Card tags on all public pages.
- Canonical URLs set explicitly; no index for staging / preview deployments.

## Structured Data

- JSON-LD on every public page: `WebSite`, `Organization`, `Article` (blog), `FAQPage` where applicable.
- Validate with Google Rich Results Test before merging template changes.

## Sitemaps & Indexing

- Dynamic `sitemap.xml` generated from DB; split into sitemap indexes when > 50 k URLs.
- `robots.txt` allows all public claim and company pages; blocks admin, auth and API routes.
- Submit sitemap index to Google Search Console and Bing Webmaster Tools on launch.

## Performance Budgets

| Metric     | Target   |
| ---------- | -------- |
| LCP        | < 2.5 s  |
| INP        | < 200 ms |
| CLS        | < 0.1    |
| TTFB (ISR) | < 800 ms |

- Images: `next/image` with explicit `width`/`height`; WebP/AVIF preferred.
- Fonts: `next/font` with `display: swap`; subset to Latin + Devanagari where needed.
- JS budget: ≤ 150 kB gzipped per route.

## Content Quality

- No thin programmatic pages — every published page must contain genuine, sourced editorial content.
- Minimum 200 words of unique body text on claim detail pages before indexing.
- Duplicate claims merged; canonical claim chosen by highest source count + recency.
