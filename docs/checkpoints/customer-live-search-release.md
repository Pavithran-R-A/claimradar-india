# ClaimKhoj Customer-Live Search Release

Updated: 2026-09-14

## Approved public identity

```ini
PUBLIC_BRAND = ClaimKhoj
CANONICAL_ORIGIN = https://claimradar-staging.vercel.app
PREVIEW_INDEXING = BLOCKED
PUBLIC_DISCOVERY_PRODUCT = CUSTOMER_LIVE
SEO_AEO_GEO_TECHNICAL_FOUNDATION = COMPLETE_PENDING_PRODUCTION_MERGE_VERIFICATION
GOOGLE_SEARCH_CONSOLE = EXTERNAL_ACCOUNT_ACTION
BING_WEBMASTER_TOOLS = EXTERNAL_ACCOUNT_ACTION
```

## Technical release scope

This release makes the ClaimKhoj public discovery experience technically ready for conventional search and answer/generative discovery without inventing AI-only content or weakening publication safeguards.

Implemented:

- Vercel Production is crawlable while Preview deployments remain blocked with `Disallow: /` and Vercel `noindex` protection.
- `brandConfig.url` is the canonical source of truth; public claim, company, sector and glossary routes no longer advertise the retired `claimradar.in` origin.
- Server-rendered JSON-LD provides Organization, WebSite, CollectionPage, ItemList, WebPage, BreadcrumbList and DefinedTerm semantics where those facts are visible and supported by the page.
- Claim dossiers expose an answer-first quick summary covering what the opportunity is, who may qualify, authority, deadline, action, proof, official source and last verification time.
- The sitemap is force-dynamic and includes real published claimables with record-derived verification/publication freshness.
- Public contact copy is customer-live and does not promise fictitious or future inboxes.
- IndexNow protocol support is available with same-host validation, a public verification-key endpoint and fail-open submissions. Sitemap discovery remains the guaranteed baseline; IndexNow delivery never controls editorial publication success.

## Preview verification

Exact branch head immediately before merge must have a READY Vercel Preview build.

Verified preview behavior before release:

- `/robots.txt` returns `Disallow: /`.
- Preview responses carry `x-robots-tag: noindex`.
- `/claimables` returns HTTP 200 and shows the five published source-backed records.
- Canonical for the directory points to `https://claimradar-staging.vercel.app/claimables`, not the preview hostname.
- Organization + WebSite JSON-LD render server-side.
- CollectionPage + ItemList JSON-LD render server-side and enumerate the five published claim URLs.
- Production build compilation and Next type/lint validity phase complete without a build-stopping error.

## Search-engine account boundary

Engineering can make the site crawlable, canonical, structured, sitemap-complete and discoverable. Search Console/Bing ownership verification, sitemap submission inside those webmaster accounts, URL Inspection requests, rankings and AI citations require external search-engine accounts and are not represented as repository failures.

Google/Bing/IndexNow discovery does not change ClaimKhoj's editorial safety posture. Billing, automatic claimable verification and customer notifications remain independently disabled unless explicitly enabled through a separate product decision.

## Production closure checklist

After merge, verify against the canonical public origin:

- [ ] `/` returns 200.
- [ ] `/claimables` returns 200 and exposes current published records.
- [ ] `/robots.txt` allows the public site and blocks private/admin/auth routes.
- [ ] `/robots.txt` references the production sitemap.
- [ ] `/sitemap.xml` includes all current published claim URLs and taxonomy routes.
- [ ] Public canonical/JSON-LD URLs contain no `claimradar.in` origin.
- [ ] Representative claim detail renders Quick answer + WebPage/BreadcrumbList JSON-LD.
- [ ] `/indexnow-key.txt` returns the active public verification key.
- [ ] `/contact` contains no pre-launch placeholder wording.
- [ ] No temporary database bootstrap endpoint is present.
- [ ] Production runtime errors are blocker-free.

Once those production checks pass, update the status below to `PASS` with the merged main SHA and production deployment ID.

```ini
CUSTOMER_LIVE_SEARCH_RELEASE = PENDING_PRODUCTION_MERGE_VERIFICATION
```
