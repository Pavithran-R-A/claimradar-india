# ClaimKhoj Rebrand + Motion Remediation Gate

Date: 2026-09-12
Status: IMPLEMENTED — NEW RBI BASELINE REQUIRED
Branch: `codex/claimradar-rebrand-motion-remediation`

## Why the current candidate is not release-ready

The current public UI has material brand and interaction defects that were not captured by the prior soak criteria:

1. **Brand-name collision**
   - `ClaimRadar` is already in active commercial use by unrelated claims / unclaimed-money products.
   - The repository's own product requirements already mark `ClaimRadar India` as a temporary project name and require an IP India trademark search before commercial launch.
   - Therefore the current name must not ship commercially.

2. **Brand mark / favicon quality**
   - The current `BrandMark` is a dense 32×32 radar glyph with multiple rings/crosshairs that collapses visually at navigation and favicon sizes.
   - The previous root Next.js app lacked dedicated icon and social metadata assets.
   - The remediation now provides a simplified mark, wordmark lockup, SVG favicon, app icon, manifest, and social/OG identity.
   - Official trademark screening remains separate from this technical identity work.

3. **Radar interaction quality**
   - The previous `EvidenceRadarVisual` used a 14-second sweep and detection-blip cycle.
   - The remediation uses a six-second sweep with direct keyboard and pointer controls.
   - The radar currently feels decorative rather than informative.
   - The UI must make source inspection discoverable and responsive, with immediate hover/tap/focus feedback, active sweep behavior, and data-linked state.

4. **Motion / microinteraction gap**
   - Motion tokens exist, but the experience remains visually static because most effects are subtle, short-lived route-entry transitions or very slow ambient cycles.
   - The global `prefers-reduced-motion: reduce` rule intentionally disables all non-essential motion and must remain respected.
   - For `no-preference`, the site needs clear but restrained motion: hero entrance, search response, CTA affordance, section reveal, card hover, source radar state, nav underline, FAQ, toast/state transitions, loading/progress, focus/selection feedback.

5. **Visual distinctiveness**
   - Current cream + editorial-blue layout is competent but generic and does not yet create a memorable product identity.
   - The redesigned brand must feel credible, Indian, public-benefit, modern, and human-designed—not like a generic AI dashboard or government clone.

## Release policy

The current soak may continue for historical evidence only, but **must not authorize production release** after this document.

Any accepted rebrand / frontend motion changes invalidate the current final runtime freeze as a production candidate. After remediation:

1. new candidate branch
2. complete visual/browser QA
3. accessibility + reduced-motion QA
4. exact-head CI
5. merge only after approval
6. establish new runtime freeze
7. fresh 7/7 baseline
8. restart the required final soak
9. production approval + smoke

## Naming gate

A new name must pass all of these before being committed as final branding:

- exact web search: no active product/company in same or adjacent category
- app-store / software-directory sweep
- domain collision check (availability is supporting evidence, not legal clearance)
- GitHub / package-name collision sweep
- IP India official wordmark **and phonetic** search for relevant Nice classes
- no known well-known mark or prohibited-mark issue
- no misleading government affiliation

No agent may claim a name is trademark-clear solely from ordinary web search.

### Current provisional candidate

`ClaimKhoj`

Rationale: `Claim` plus Hindi `khoj` (search/discovery) makes the product purpose legible to Indian consumers. The candidate remains provisional. Exact and phonetic IP India searches, plus wider collision screening, are still mandatory before commercial lock-in.

Domain precheck: `claimkhoj.com` appeared available during the latest check. This is supporting evidence only, not trademark clearance.

## Brand design target

Do not reuse the current dense radar-square logo.

Create a simple, ownable mark that remains legible at 16×16 and 24×24. Preferred concept direction:

- a single continuous route / document edge / verified-return path
- one or two geometric strokes maximum
- no generic shield/checkmark/radar mashup
- no government emblem resemblance
- no Ashoka Chakra imitation
- no currency-symbol cliché
- no gradient-heavy AI aesthetic

The favicon must be recognizable without the wordmark.

## Motion target

For users with `prefers-reduced-motion: no-preference`:

- hero composition enters with 3–5 restrained staggered elements, under ~650 ms total
- search field gets immediate focus glow/edge response and deterministic submit state
- CTA arrow/label shift responds within 120–180 ms
- source radar sweep should complete in roughly 5–7 seconds, with visible but subtle beam trail
- radar nodes react within 120–180 ms on hover/focus/tap
- selected radar node should expose details without covering the instrument
- section reveals occur once on viewport entry, not endlessly
- cards use small lift/border/ink transitions, not floaty animation
- FAQ open/close motion is smooth and reversible
- loading / success / error state transitions are visibly animated but brief

For `prefers-reduced-motion: reduce`:

- no sweep rotation, parallax, scale travel, or repeated pulse
- preserve all information and interaction state through opacity/color/border/static emphasis

## Verification required before merge

- desktop: 1440×900, 1536×960, 1280×800
- tablet: 1024×768, 768×1024
- mobile: 430×932, 390×844, 360×800
- Chrome/Chromium, Firefox, WebKit
- keyboard-only navigation
- reduced-motion enabled and disabled
- favicon/browser-tab verification
- no overflow, clipping, overlap, or unreadable tiny radar labels
- no console errors
- no hydration warnings
- Axe: zero material violations
- Lighthouse / performance budget preserved
- all existing functional tests pass

## Acceptance condition

This release blocker is closed only when the public brand is legally safer, visually ownable, motion feels intentional on capable devices, reduced motion remains fully accessible, favicon/app identity are complete, and the UI no longer reads as a static generic template.

## 2026-09-12 implementation update

- ClaimKhoj now replaces the legacy visible product name across web routes,
  metadata, legal copy, tracker copy, and admin publishing copy.
- The provisional name remains subject to official IP India wordmark and
  phonetic screening. No trademark clearance is claimed here.
- RBI registry and staging seed entries now use the official bare-host feeds.
- RBI RSS item links are validated and canonicalized to HTTPS on `rbi.org.in`
  before fetching. External, private, malformed, non-HTTP, and non-default-port
  URLs are rejected.
- Fetch failures retain transport status for classification. Timeouts remain
  `TIMEOUT`; HTTP 4xx and 5xx responses retain their HTTP categories.
- Root formatter, lint, typecheck, test, build, and client-secret gates pass.
- A fresh staging baseline and final soak remain required after this runtime
  change. The previous soak cannot qualify this candidate.
