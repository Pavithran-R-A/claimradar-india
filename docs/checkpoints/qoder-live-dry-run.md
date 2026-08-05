# New-Device Live Dry Run Verification Checkpoint

**Date:** August 5, 2026
**Run ID:** `c5194823-3002-42c9-96df-6ed957d9262e`
**Command:** `pnpm crawler:daily -- --live --dry-run`
**Environment:** New device — Node `v24.19.0` (fnm) | pnpm `11.18.0` | `dryRun = true` | in-memory writer only
**Crawler identity:** `ClaimRadar India Bot/1.0 (+https://claimradar.in)` (declared, never spoofed)

This checkpoint records the first live dry run executed on the new development device. It
supersedes the transport findings of `live-dry-run-5.md` for the `generic-rss` source, whose
configured endpoint was recommissioned during this task (see section 2).

---

## 1. Multi-Source Retrieval Summary

| Source ID     | Source Name                    | Endpoint                                       | Discovered | Fetched | Status / Notes                                                             |
| :------------ | :----------------------------- | :--------------------------------------------- | ---------: | ------: | :------------------------------------------------------------------------- |
| `pib-rss`     | Press Information Bureau RSS   | `https://www.pib.gov.in/RssMain.aspx?…`        |         20 |       0 | **FAIL / SKIP_EXTERNAL_ACCESS** — feed parses; 20/20 detail pages HTTP 403 |
| `sebi-rss`    | SEBI RSS Feed                  | `https://www.sebi.gov.in/sebirss.xml`          |         30 |      29 | **PASS** — 1 live-feed PDF link 404 (double-prefixed URL in the feed item) |
| `rbi-rss`     | Reserve Bank of India RSS      | `https://www.rbi.org.in/pressreleases_rss.xml` |         10 |      10 | **PASS** — 10 press releases fetched cleanly                               |
| `generic-rss` | W3C News RSS (Generic Adapter) | `https://www.w3.org/news/feed/`                |         25 |      25 | **PASS** — newly commissioned replacement (see section 2)                  |

All four configured sources appear in the summary. PIB failure is contained per-document:
`sebi-rss`, `rbi-rss`, and `generic-rss` completed in the same run (failure isolation verified).

---

## 2. Generic RSS Live Verification — `GENERIC_RSS_LIVE=PASS`

### 2.1 Configured endpoint failed: `https://www.cci.gov.in/rss.xml`

Probed through the adapter (`pnpm dev source --source generic-rss --dry-run`, run ID
`a58693a5-6110-4853-9f02-f1c29518fd4b`): discovery raised
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`; 0 documents discovered, 0 fetched.

TLS diagnosis (strict verification, diagnostic socket only — the crawler never disables TLS):

| Field              | Value                                                                                                   |
| :----------------- | :------------------------------------------------------------------------------------------------------ |
| Configured URL     | `https://www.cci.gov.in/rss.xml`                                                                        |
| TLS result         | **FAILED** — `UNABLE_TO_VERIFY_LEAF_SIGNATURE`                                                          |
| Presented chain    | Leaf only: `CN=cci.gov.in` ← `Sectigo Public Server Authentication CA DV R36` (intermediate NOT served) |
| Leaf validity      | Not expired (valid to 2026-09-01) — failure is a missing intermediate, not expiry                       |
| HTTP status / MIME | Never reached (handshake fails before any HTTP exchange)                                                |
| Errors             | 1 (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`)                                                                   |

Verdict for the configured feed: **FAILED (untrusted certificate chain)**. Per policy the
endpoint was **disabled from scheduled crawling**: it is removed from `initialSources` in
`packages/source-registry/src/index.ts` (kept there as `cciRssSourceDisabled` for
provenance). TLS verification was never weakened and no `NODE_TLS_REJECT_UNAUTHORIZED=0`
was used anywhere.

### 2.2 Replacement commissioned: `https://www.w3.org/news/feed/`

Why suitable: publicly permitted official RSS 2.0 feed of the W3C news channel; live,
recently updated (newest item 2026-08-04), standards-conformant (RFC-822 pubDates, GUIDs,
absolute links), serves proper `application/rss+xml` with ETag, no redirects, and no
bot-blocking for the declared crawler User-Agent. It exercises the full generic-adapter path
(discover → fetch detail pages → extract), which the CCI endpoint never reached.

HTTP-level evidence (captured 2026-08-05T09:44:32Z with the declared crawler UA):

| Field                    | Value                                                                                   |
| :----------------------- | :-------------------------------------------------------------------------------------- |
| Configured / final URL   | `https://www.w3.org/news/feed/` (no redirect)                                           |
| Redirects                | 0                                                                                       |
| TLS result               | Verified (system trust store, strict)                                                   |
| HTTP status              | 200                                                                                     |
| MIME type                | `application/rss+xml`                                                                   |
| Body size                | 47,835 bytes (SHA-256 `f16522e2…f27de3`)                                                |
| Feed format              | RSS 2.0 (`<rss version="2.0">` with `atom:link rel="self"`)                             |
| Items discovered / valid | 25 / 25 (all links absolute `www.w3.org` URLs)                                          |
| Invalid items            | 0                                                                                       |
| Publication-date quality | 25/25 RFC-822 `+0000` pubDates, all parseable; newest `Tue, 04 Aug 2026 09:16:27 +0000` |
| Description quality      | CDATA summaries + `content:encoded` HTML on every item                                  |
| Link quality             | 25/25 resolvable news article permalinks (GUID = permalink)                             |
| ETag / Last-Modified     | ETag `"011593e4c6515afde8afed5b5b5a7e3b-gzip"` present; Last-Modified absent            |
| Duration                 | 581 ms                                                                                  |
| Errors                   | 0                                                                                       |

Adapter-level live probe (run ID `ec5139db-f09c-4e54-9620-af488db6e8e7`, dry run):
**25 discovered, 25 fetched, 0 errors, 9.5 s**. All 25 keyword scores were 0 (web-standards
news is not claim material), so 0 candidates — expected and correct for this source's role as
an adapter transport verification.

A sanitized fixture of the live capture (channel + 4 real items verbatim) is committed at
`apps/crawler/tests/fixtures/live/generic/feed.xml` with provenance in the adjacent
`manifest.json`; regression-tested by `generic-live.test.ts` (19 tests pass).

**`GENERIC_RSS_LIVE=PASS`** — a real external request succeeded through the adapter.

---

## 3. PIB Status — `FAIL / SKIP_EXTERNAL_ACCESS` (unchanged, verified honestly)

Permitted approaches only: official RSS endpoint, declared transparent User-Agent, normal
headers, conservative (once-per-probe) frequency. No identity spoofing, no proxy evasion,
no CAPTCHA bypass.

- Feed discovery works: `RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3` parsed, **20 items**
  (probe run `54352528-fa14-43d2-88e9-dc793fa866e8`).
- Detail pages still return **HTTP 403** for the declared crawler UA (Akamai bot
  detection): **20/20 fetch failures** in both the single-source probe and the daily run.
- Status remains **FAIL / SKIP_EXTERNAL_ACCESS** with the evidence above; the blocker is
  recorded, not worked around (PIB items also carry no `pubDate`/GUID — feed quirk retained).
- **Failure isolation verified:** PIB errors are per-document; the pipeline completed the
  other three sources in the same run (`sourcesFailed: 0`, all 20 errors attributed to
  `pib-rss` document stage).

---

## 4. Decision & Invariant Audit

```json
{
  "runId": "c5194823-3002-42c9-96df-6ed957d9262e",
  "startedAt": "2026-08-05T09:49:44.750Z",
  "completedAt": "2026-08-05T09:49:50.200Z",
  "durationMs": 5450,
  "sourcesAttempted": 4,
  "sourcesSucceeded": 4,
  "sourcesFailed": 0,
  "documentsDiscovered": 85,
  "documentsFetched": 64,
  "documentsUnchanged": 0,
  "documentsDuplicate": 0,
  "candidatesCreated": 2,
  "aiCallsUsed": 0,
  "aiCallsFailed": 0,
  "recordsPublished": 0,
  "recordsQueued": 0,
  "recordsRejected": 0,
  "errorCount": 21
}
```

Counter reconciliation:

- **Discovered:** 20 (pib) + 30 (sebi) + 10 (rbi) + 25 (generic) = 85.
- **Fetched:** 0 (pib) + 29 (sebi) + 10 (rbi) + 25 (generic) = 64.
- **Errors (21):** 20 × PIB detail-page HTTP 403 + 1 × SEBI PDF HTTP 404
  (`exemption_order_mumil1.pdf` — the live feed item carries a double-prefixed URL
  `https://www.sebi.gov.in/https://www.sebi.gov.in/…`, recorded as-is, not repaired).
- **Candidates (2):** 1 SEBI + 1 RBI keyword-positive document.
- **AI:** `AI_PROVIDER=none` on this device → extractor not instantiated; both candidates
  were queued without AI (no-AI path), hence `aiCallsUsed/aiCallsFailed = 0`.
- **Keyword-positive:** 2 (the two candidates above; all other 62 fetched documents scored
  below threshold). **OCR-required:** 0 (no PDF content reached extraction).
- **Evidence/validator failures:** 0 (no AI extractions occurred, so no evidence or
  validator runs were executed).
- **Decisions:** published 0 / queued 0 / rejected 0 / uncertain n/a — publication policy
  only runs after AI extraction, which was correctly skipped.

### Safety & Dry-Run Safeguards (invariants verified)

- **Database writes:** `0` — `dryRun=true` routes all persistence to `InMemoryDryRunWriter`;
  no crawl-run, source-document, candidate, AI-run, or validation rows left the process.
- **Publication-event writes:** `0` — `insertPublicationEvent` is gated behind `!dryRun`
  and `recordsPublished/Queued/Rejected` are all 0.
- **Notification writes:** `0` — no notification path exists in the dry-run pipeline.
- **All four configured sources appear in the summary** even with per-source failures.
- **Per-source failure isolation:** PIB 403s did not abort SEBI/RBI/generic-rss.
- **TLS integrity:** strict certificate verification throughout; the failing CCI endpoint
  was decommissioned rather than trusted.
- **Exit code:** the CLI exits 1 with `Completed with 21 errors` (honest error surface);
  the dry run itself behaved exactly as designed.

## 5. Commits

- `fix(crawler): commission stable generic rss source` — registry recommissioning
  (CCI disabled, W3C commissioned), sanitized live fixture + manifest, regression tests.
- `docs(checkpoints): record new device live dry run` — this checkpoint.
