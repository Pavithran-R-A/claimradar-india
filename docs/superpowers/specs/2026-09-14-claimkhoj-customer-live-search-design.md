# ClaimKhoj Customer-Live Search Architecture

## Goal

Make ClaimKhoj fully customer-live on the existing Vercel origin `https://claimradar-staging.vercel.app` while preserving the ClaimKhoj public brand, source-verification safety model, and non-production indexing protections.

## Approved production identity

- Public brand: **ClaimKhoj**.
- Canonical customer origin for this release: `https://claimradar-staging.vercel.app`.
- No custom domain is required for this release.
- The old `claimradar.in` origin is retired from customer-facing canonicals, structured data, social metadata, sitemap entries, and public crawler identity links where those links describe the customer website.
- Preview deployments must remain non-indexable.

## Search and indexing architecture

### Production crawl policy

The canonical public deployment must be crawlable. `robots.txt` must allow public routes and block only private or operational paths such as admin, authentication, dashboard, settings, and internal APIs. Preview/non-production deployments remain `Disallow: /`.

The crawlability decision must be based on an explicit production-public condition, not on the accidental presence or absence of a Vercel preview hostname. The production branch must be capable of serving the customer-live crawl policy on the approved Vercel origin.

### Canonical URL contract

`brandConfig.url` is the single source of truth for public origin generation. Every canonical, Open Graph URL, Twitter image URL, sitemap URL, JSON-LD URL, and IndexNow URL must derive from this value.

No public route may hard-code `https://claimradar.in`.

### Sitemap

The sitemap must include:

- customer-facing static routes that contain genuine content;
- all genuine glossary entries;
- every published claimable detail page;
- every company derived from published claimables;
- every sector derived from published claimables;
- every state page that has at least one published record.

Dynamic records must use meaningful timestamps from the underlying publication data rather than assigning the sitemap generation time to every record.

Empty, unpublished, placeholder, demo, auth, admin, and private app routes must not enter the sitemap.

## SEO architecture

Every indexable public route must have:

- unique title;
- useful meta description;
- canonical URL;
- Open Graph metadata;
- Twitter card metadata;
- index/follow behavior appropriate to the route;
- coherent internal navigation.

Directory/search parameter pages should canonicalize to stable clean routes unless the parameter creates a deliberately indexable landing page.

Published claim detail pages must remain the strongest indexable units because they contain the source-backed customer answer.

## Structured data

Structured data must reflect only visible, truthful page content.

### Site-level

Emit:

- `Organization` for ClaimKhoj;
- `WebSite` for ClaimKhoj;
- a site search action only if it maps to a real, stable customer search URL.

### Route-level

Use as appropriate:

- `WebPage` / `CollectionPage` for directories;
- `ItemList` for real directory lists;
- `BreadcrumbList` for detail and taxonomy navigation;
- `DefinedTerm` or equivalent glossary semantics for glossary entries;
- `FAQPage` only where the questions and answers are visibly rendered, while not depending on FAQ rich results for ranking or visibility.

Claim detail structured data must not misrepresent ClaimKhoj as the issuing authority or as a government agency. The official authority and official source URLs must remain explicit.

## AEO / GEO content architecture

No separate "AI-only" content layer will be fabricated. Search and generative discovery should consume the same truthful customer-facing content.

Claim detail pages should expose an answer-first factual sequence:

1. What this opportunity is.
2. Who may qualify.
3. Issuing authority.
4. Deadline, if any.
5. What action the user should take.
6. Required proof/documents, if stated.
7. Official source and official action route.
8. Last verified timestamp and freshness warning.

Content should use concise headings, explicit entity names, dates in unambiguous formats, source attribution, and visible evidence rather than generic SEO filler.

Company, sector, state, glossary, deadlines, new, and closing-soon pages must provide helpful explanatory copy and internal links rather than thin index pages.

## Freshness and discovery

Integrate IndexNow as an optional production capability for newly published, updated, or removed customer-visible URLs.

Requirements:

- key is environment-configured and never hard-coded as a secret;
- key file is served at the canonical site origin when configured;
- URL submission is limited to the canonical host;
- publication/update workflows can call a small reusable IndexNow client;
- failures are logged but do not block publication;
- no old historical URLs are bulk-submitted merely for volume.

Google Search Console and Bing Webmaster Tools submission remain external account actions. The application must expose valid `robots.txt`, `sitemap.xml`, canonical metadata, and public pages so those tools can verify and index the site.

## Customer-live trust and contact posture

A customer-live product must not visibly claim that launch contacts will be added later.

Public contact/governance copy must use configured channels when available and otherwise fall back to a truthful general contact mechanism appropriate for the current Vercel-domain release. No fake email inboxes may be invented.

Billing, automatic verification, and customer notifications remain disabled unless separately approved. Customer-live in this release means the public discovery/read experience is live; it does not mean ClaimKhoj files claims, takes payments, or automatically publishes unreviewed high-stakes records.

## Security and privacy

- Keep privileged Supabase access server-only.
- Do not expose service-role keys or IndexNow credentials to browser bundles.
- Keep admin/auth/private app routes out of indexing.
- Keep existing CSP, clickjacking, referrer, and permissions-policy protections.
- Do not add third-party analytics scripts as a prerequisite for launch.

## Performance and accessibility

SEO work must not regress Core Web Vitals or accessibility.

- JSON-LD should be small and server-rendered.
- Avoid unnecessary client JavaScript for metadata/search features.
- Preserve semantic heading order and landmarks.
- Preserve responsive behavior and keyboard/focus behavior.

## Verification gates

Before merge:

1. Unit/contract tests for canonical generation, robots behavior, sitemap inclusion, and JSON-LD output.
2. Lint, typecheck, tests, production build.
3. Preview inspection confirming preview remains non-indexable.
4. Production deployment inspection confirming:
   - public pages return 200;
   - `robots.txt` is crawlable on the approved customer origin;
   - `sitemap.xml` contains all five current published claim detail URLs plus taxonomy URLs;
   - no public canonical points to `claimradar.in`;
   - structured data is present and parseable;
   - no temporary operational/bootstrap route exists;
   - runtime error check remains clean.

## External-account boundaries

The following cannot be truthfully marked complete without the relevant external account connection/action:

- Google Search Console property verification/submission;
- Bing Webmaster Tools property verification/submission;
- production SMTP provider/domain verification if outbound email is required;
- future custom-domain purchase.

Those are not reasons to keep the public read-only ClaimKhoj site blocked from customer use, but the final release report must distinguish implemented search readiness from external webmaster-account verification.

## Completion definition

The engineering release is customer-live when the approved Vercel origin serves the ClaimKhoj brand, real published claimables, correct public indexing policy, clean canonical metadata, truthful structured data, complete dynamic sitemap coverage, answer-first source-backed content, safe private-route blocking, and verified production deployment with no blocking runtime errors.
