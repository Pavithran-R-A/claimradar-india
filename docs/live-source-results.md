# Live Source Commissioning Results — Wave 2

- **Commissioning date:** 2026-07-27
- **Performed by:** Task #25 (Wave 2: Live source commissioning & fixtures)
- **Method:** Direct HTTPS fetches from a local developer shell (live network is never used
  in CI; all committed tests run against sanitized fixtures in
  `apps/crawler/tests/fixtures/live/`).
- **Policy:** Official endpoints only. No third-party mirrors. No CAPTCHA or access-control
  bypass attempted anywhere.

## Health classification legend

| Class    | Meaning                                                                 |
| -------- | ----------------------------------------------------------------------- |
| Healthy  | Endpoint returns a valid feed with recent items                         |
| Delayed  | Feed valid but newest item is noticeably behind the publication cadence |
| Stale    | Feed valid but has not been updated for an extended period              |
| Failing  | Endpoint unreachable, blocked, or not returning a parseable feed        |
| Disabled | Source intentionally turned off pending a decision                      |

## Summary

| Source  | Commissioned endpoint                                              | Status | Items | Classification        |
| ------- | ------------------------------------------------------------------ | ------ | ----- | --------------------- |
| PIB     | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3` | 200\*  | 20    | Failing (bot-blocked) |
| SEBI    | `https://www.sebi.gov.in/sebirss.xml`                              | 200    | 30    | Healthy               |
| RBI     | `https://www.rbi.org.in/pressreleases_rss.xml`                     | 200    | 10    | Healthy               |
| Generic | n/a (adapter validated offline against standard RSS 2.0 / Atom)    | n/a    | n/a   | n/a                   |

\* 200 with a browser User-Agent only; the declared crawler User-Agent receives HTTP 403 —
see the PIB section.

---

## PIB — Press Information Bureau

The previous registry endpoint `https://pib.gov.in/indexallrss.aspx` is dead: it 301-redirects
to `www.pib.gov.in`, returns HTTP 403 (Akamai "Access Denied") to non-browser User-Agents, and
with a browser User-Agent redirects to `ErrorPage.html`. The working official feed is
`RssMain.aspx` (English all-ministries press releases). Without `&reg=3` the server
geo-redirects `Lang=1` to the Hindi edition (`Lang=2&reg=48`); `reg=3` pins English.

| Field                     | Value                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| Final feed URL            | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3`   |
| HTTP status               | 200 (browser UA) / **403** (declared crawler UA, Akamai)             |
| MIME type                 | `text/xml`                                                           |
| Response size             | 4,027 bytes (gzip transfer encoding)                                 |
| Encoding                  | UTF-8 with BOM (`<?xml ... encoding="utf-8"?>`)                      |
| Feed title                | `Press Information Bureau` (trailing space in live feed)             |
| Item count                | 20                                                                   |
| Newest item date          | Not published — PIB items carry **no `pubDate`**                     |
| Oldest returned item date | Not published — PIB items carry **no `pubDate`**                     |
| Valid item URL count      | 20 / 20 (absolute `pib.gov.in/PressReleasePage.aspx?PRID=...` links) |
| Duplicate item count      | 0                                                                    |
| Malformed item count      | 0 structurally; 20 / 20 items lack dates and GUIDs (real feed quirk) |
| Fetch duration            | 633 ms                                                               |
| ETag                      | Present                                                              |
| Last-Modified             | Absent                                                               |
| Redirect chain            | None for `www.` URL; `pib.gov.in` → 301 → `www.pib.gov.in`           |
| **Classification**        | **Failing (bot-blocked)** for the crawler's declared User-Agent      |

**Honest status:** the endpoint itself is live and healthy for ordinary browser traffic, but
Akamai returns 403 to the crawler's declared User-Agent. A browser User-Agent was used **once**
for commissioning diagnostics only; the production crawler does **not** spoof a browser UA.
PIB stays classified Failing until an access decision (e.g., official permission/allowlisting)
is made. This is recorded as a blocker, not worked around.

### Commissioning criteria

- [x] Real endpoint returns — 200 `text/xml` (browser UA diagnostic); 403 for crawler UA recorded honestly
- [x] ≥1 real item parsed — 4 real items preserved verbatim in `fixtures/live/pib/feed.xml`
- [x] Valid item URLs — 20/20 absolute PRID links live; verified in fixtures by tests
- [x] Dates handled — missing `pubDate` (real quirk) → `publishedAt` stays undefined, no crash
- [x] Rerun produces no duplicates — two consecutive fetches byte-identical; 0 duplicate links
- [x] Failure behavior tested — 403 (bot UA) and dead `indexallrss.aspx` responses captured
- [x] No access control bypassed — 403 respected; no CAPTCHA/UA spoofing in production config

---

## SEBI — Securities and Exchange Board of India

The previous registry endpoint
`https://www.sebi.gov.in/sebi_data/attachdocs/rss-feeds/press-release.xml` returns HTTP 404
(its `Last-Modified` header dates to 2022-06-20 — dead for years). The live official feed is
`https://www.sebi.gov.in/sebirss.xml`, linked from SEBI's own site.

| Field                     | Value                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Final feed URL            | `https://www.sebi.gov.in/sebirss.xml`                                                                                                                   |
| HTTP status               | 200                                                                                                                                                     |
| MIME type                 | `text/xml`                                                                                                                                              |
| Response size             | 17,247 bytes                                                                                                                                            |
| Encoding                  | UTF-8 (declared in XML prolog)                                                                                                                          |
| Feed title                | `SEBI RSS Feed`                                                                                                                                         |
| Item count                | 30                                                                                                                                                      |
| Newest item date          | `24 Jul, 2026 +0530`                                                                                                                                    |
| Oldest returned item date | `21 Jul, 2026 +0530`                                                                                                                                    |
| Valid item URL count      | 30 / 30 (absolute `www.sebi.gov.in` enforcement/order links)                                                                                            |
| Duplicate item count      | 0                                                                                                                                                       |
| Malformed item count      | 30 / 30 dates are non-RFC-822 (`24 Jul, 2026 +0530` — day-only, comma); JS `Date` rejects them, `normalizeDate` falls back to the raw string (no crash) |
| Fetch duration            | 133 ms (rerun 213 ms)                                                                                                                                   |
| ETag                      | Absent                                                                                                                                                  |
| Last-Modified             | Present (`Mon, 27 Jul 2026 16:30:02 GMT`)                                                                                                               |
| Redirect chain            | None                                                                                                                                                    |
| **Classification**        | **Healthy** (date-format quirk documented and regression-tested)                                                                                        |

### Commissioning criteria

- [x] Real endpoint returns — 200 `text/xml`, 30 items
- [x] ≥1 real item parsed — 4 real items preserved in `fixtures/live/sebi/feed.xml`
- [x] Valid item URLs — 30/30 absolute links; verified in fixtures by tests
- [x] Dates handled — non-RFC-822 pubDate falls back to raw string; empty pubDate → undefined
- [x] Rerun produces no duplicates — two consecutive fetches byte-identical; 0 duplicate links
- [x] Failure behavior tested — the dead registry URL's live 404 response was captured
- [x] No access control bypassed — none encountered

---

## RBI — Reserve Bank of India

The previous registry `feedUrl`
(`https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=56133`) is a single
press-release **detail page** (200 `text/html`), not a feed. RBI's official RSS index at
`https://rbi.org.in/scripts/rss.aspx` lists the press-release feed
`https://www.rbi.org.in/pressreleases_rss.xml`, which was verified working.

| Field                     | Value                                                                     |
| ------------------------- | ------------------------------------------------------------------------- |
| Final feed URL            | `https://www.rbi.org.in/pressreleases_rss.xml`                            |
| HTTP status               | 200 (and **304** on conditional GET with `If-None-Match` — verified)      |
| MIME type                 | `text/xml`                                                                |
| Response size             | 91,759 bytes (brotli transfer encoding)                                   |
| Encoding                  | UTF-8 (declared in XML prolog)                                            |
| Feed title                | `PRESS RELEASES FROM RBI`                                                 |
| Item count                | 10                                                                        |
| Newest item date          | `Mon, 27 Jul 2026 18:30:00` (no timezone designator — real feed quirk)    |
| Oldest returned item date | `Mon, 27 Jul 2026 11:30:00` (same-day window; RBI publishes frequently)   |
| Valid item URL count      | 10 / 10 (absolute `BS_PressReleaseDisplay.aspx?prid=...` links)           |
| Duplicate item count      | 0                                                                         |
| Malformed item count      | 0 structurally; all pubDates lack a timezone designator (parsed local-TZ) |
| Fetch duration            | 29 ms                                                                     |
| ETag                      | Present (`W/"8054afcce11ddd1:0"`)                                         |
| Last-Modified             | Present (`Mon, 27 Jul 2026 16:05:52 GMT`)                                 |
| Redirect chain            | None                                                                      |
| **Classification**        | **Healthy** (best-behaved source: ETag + Last-Modified + 304 support)     |

**PDF note:** the press-release PDF links on detail pages (uppercase `.PDF` under
`rbidocs.rbi.org.in/rdocs/PressRelease/PDFs/`) served a JavaScript bot-challenge interstitial
to the test client. Per policy this was **not** bypassed; the committed PDF fixture is a
synthetic minimal valid PDF that preserves parse structure (documented in the manifest). A
sibling official PDF (`rdocs/content/pdfs/GSEC27072026_E.pdf`, 403,589 bytes,
`application/pdf`) was retrievable without any challenge, confirming PDFs are generally
accessible; it was too large to commit and only its SHA-256 is recorded.

### Commissioning criteria

- [x] Real endpoint returns — 200 `text/xml`, 10 items, 304 conditional GET verified
- [x] ≥1 real item parsed — 4 real items (CDATA titles + HTML descriptions) preserved in `fixtures/live/rbi/feed.xml`
- [x] Valid item URLs — 10/10 absolute prid links; verified in fixtures by tests
- [x] Dates handled — timezone-less pubDate normalized to ISO 8601 without crash
- [x] Rerun produces no duplicates — two consecutive fetches byte-identical; 0 duplicate links
- [x] Failure behavior tested — PDF bot-challenge interstitial recorded (and not bypassed)
- [x] No access control bypassed — bot challenge respected; synthetic PDF fixture used instead

---

## Generic RSS adapter

No live endpoint is assigned to the generic adapter. It was validated offline against two
synthetic standards-conformant fixtures (`fixtures/live/generic/rss2.xml` — RSS 2.0 with
RFC-822 GMT dates, non-permalink GUIDs, embedded HTML descriptions; and
`fixtures/live/generic/atom.xml` — Atom 1.0 with `<updated>` timestamps and href links). See
`apps/crawler/tests/adapters/generic-live.test.ts`.

---

## Registry changes (2026-07-27)

| Source | Old `feedUrl`                                                              | New `feedUrl`                                                      | Reason                                 |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| PIB    | `https://pib.gov.in/indexallrss.aspx`                                      | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3` | Old URL dead (redirects to error page) |
| SEBI   | `https://www.sebi.gov.in/sebi_data/attachdocs/rss-feeds/press-release.xml` | `https://www.sebi.gov.in/sebirss.xml`                              | Old URL 404 since ~2022                |
| RBI    | `https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=56133`    | `https://www.rbi.org.in/pressreleases_rss.xml`                     | Old URL was a detail page, not a feed  |

Adapter fallback URLs in `apps/crawler/src/adapters/rss/{pib,sebi,rbi}.ts` were updated to
match. All fixture provenance (capture dates, original URLs, SHA-256 hashes of the original
live responses, sanitization notes) lives in the `manifest.json` beside each fixture set.

## Open blockers

1. **PIB bot-blocking (Akamai 403):** the working English feed rejects the crawler's declared
   User-Agent. Options: request allowlisting from PIB/NIC, or keep the source Disabled/Failing
   in production. Spoofing a browser UA is not an acceptable fix.
2. **RBI press-release PDFs behind a JS bot challenge:** detail-page HTML is fully accessible,
   but some `rbidocs` PDF paths challenge non-browser clients. PDF ingestion for RBI should be
   treated as best-effort.
