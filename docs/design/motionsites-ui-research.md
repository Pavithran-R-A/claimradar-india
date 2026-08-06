# MotionSites UI Research — ClaimRadar Public Site

Research input for the ClaimRadar India public-site redesign (Phase A).

**Source material.** Screenshots captured from the live MotionSites product are stored at the
workspace root:

| Screenshot                          | What it shows                                                  |
| ----------------------------------- | -------------------------------------------------------------- |
| `motionsites-home-hero.png`         | Homepage hero, promo banner, category chip row, featured cards |
| `motionsites-templates.png`         | Templates gallery hero with gradient display type              |
| `motionsites-home-footer.png`       | Showcase card grid with metadata rows                          |
| `motionsites-home-promo-bottom.png` | Alternating dark/light section rhythm, embedded site previews  |
| `motionsites-nav-menu-dialog.png`   | Full-screen nav dialog overlay with "NEW" badges               |
| `motionsites-backgrounds-grid.png`  | Masonry-ish media grid, lock badges, filter dropdown           |
| `motionsites-sections-hero.png`     | Section-library landing hero                                   |
| `motionsites-backgrounds-hero.png`  | Backgrounds gallery landing hero                               |
| `motionsites-lesson-hero.png`       | Academy lesson page hero                                       |
| `motionsites-academy-hero.png`      | Academy landing hero                                           |
| `motionsites-templates-footer.png`  | Minimal affiliate-style footer                                 |

**Verified implementation details** (inspected from the live MotionSites site):

- No custom webfonts — a plain system font stack (fast, zero font CLS).
- Base background `#121212`; card surface `rgb(41, 41, 41)`.
- Aurora background animated with CSS custom-property keyframes, `6s ease-in-out infinite`.
- Glass surfaces: `backdrop-filter: blur(18px) saturate(1.4)`.
- Card hover: `translateY(-4px)` lift + soft shadow, easing `cubic-bezier(0, 0, 0.2, 1)`.
- Shimmer keyframes at `1.6s` (used on skeleton/loading states).

---

## 1. Patterns observed (12)

### P1 — Typography scale: oversized uppercase display type

Headlines are very large, bold, uppercase, tight-tracked sans ("UNLOCK YOUR AI DESIGN
SUPERPOWERS"). One or two words switch treatment (gradient fill or weight change) to create a
focal point. Body copy is small, calm, and sentence-case — a deliberate loud/quiet contrast.

### P2 — Dark hero + animated aurora/grid backdrop

Every landing hero sits on near-black (`#121212`) with a slow aurora glow driven purely by CSS
custom-property keyframes (`6s ease-in-out infinite`). No WebGL, no video. The effect adds depth
without costing LCP.

### P3 — Glass / blur navigation surfaces

Header and overlay panels use `backdrop-filter: blur(18px) saturate(1.4)` over the dark hero so
the chrome reads as a layer, not a bar. Sticky positioning keeps nav reachable during scroll.

### P4 — Pill CTA with arrow

Primary action is a white/soft pill button ("Go Unlimited →") with high contrast against the dark
hero, soft shadow, and a directional arrow. One primary CTA per viewport — never two competing
loud buttons.

### P5 — Badge chips & category filter rows

Horizontal chip rows ("All / Apps / Sections / Hero / Landing Page") act as both filters and
orientation. Active chip gets a filled treatment; inactive chips stay quiet. Small pill badges
("NEW", "Premium", "FRESH DROPS EVERYDAY") carry state with a single accent colour.

### P6 — Card treatments: preview + metadata row

Cards pair a large visual preview with a compact metadata strip (title, category label, icon
actions). Consistent radius, consistent border, hover lift of `-4px` with soft shadow. Cards are
the atomic unit of every listing page.

### P7 — Scroll reveals & staggered entrances

Cards and sections fade/translate in on scroll; grids stagger by column index. Motion is
short-lived (no looping inside content areas).

### P8 — Hover motion on interactive cards

Hover = translateY lift + shadow bloom + slight image zoom in some galleries, eased with
`cubic-bezier(0, 0, 0.2, 1)` over ~200 ms. Motion signals interactivity; it never communicates
data.

### P9 — Section rhythm: alternating tonal bands

Long pages alternate dark and slightly-raised dark (or light) bands, separated by hairline
borders, giving vertical rhythm without heavy dividers. Each band contains exactly one idea.

### P10 — Full-screen nav dialog (mobile + desktop hamburger)

The menu opens as a dimmed full-screen dialog: large stacked links, active item highlighted,
badge accents, explicit close control in the corner.

### P11 — Promo strip pinned above the header

A thin full-width strip above the nav carries a single promotional message. High-contrast
background, one line, dismissible territory.

### P12 — Minimal affiliate-style footer

MotionSites ends with a sparse footer (logo + few links). Fine for a template marketplace; **not
fine for a legal-information product** (see §2).

---

## 2. Suitability for legal / claim content

### Adopt (adapted)

| Pattern                        | Adaptation for ClaimRadar                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P2 dark hero + CSS aurora/grid | Keep the dark deep-ink hero on `/`; replace neon aurora with a restrained teal/navy glow and a faint survey grid. Content pages stay light. |
| P3 glass blur nav              | Sticky blur header on all public pages; neutral surface so it works over dark hero and light content.                                       |
| P4 single pill CTA             | One primary teal action per section; secondary always ghost/outline.                                                                        |
| P5 chip rows                   | Status chips and active-filter chips on `/claimables`; no fake "NEW" hype badges.                                                           |
| P6 card + metadata             | Claimable cards: title, company, status badge, deadline (machine-readable date) — no imagery, so no image weight.                           |
| P7/P8 motion                   | Fade/translate reveals, card hover lift with reserved dimensions (no CLS). All behind `prefers-reduced-motion`.                             |
| P9 tonal bands                 | Off-white content bands separated by white cards and hairline borders; dark hero and dark footer bookend the page.                          |
| P10 nav dialog                 | Accessible mobile drawer with focus management, Escape to close, real labels.                                                               |

### Reject

| Pattern                            | Reason                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P11 promo strip                    | Discount codes + urgency banners are dark patterns for a legal-information product. We use a **trust strip** instead (independence statement). |
| Gradient display type (P1 variant) | Gradient headlines read as hype; we allow at most one restrained serif accent word.                                                            |
| Shimmer on content (P2 ecosystem)  | Shimmer reserved for skeleton placeholders only; never looping inside content areas.                                                           |
| P12 minimal footer                 | ClaimRadar needs a real multi-column civic footer: discover/product/trust/legal columns plus the independence disclaimer.                      |
| "Premium" lock badges              | We never gate information with fake scarcity; billing flags stay disabled.                                                                     |
| Loud uppercase shouting            | Legal content needs calm authority; display type stays sentence-case.                                                                          |

---

## 3. Risks

**Performance.** `backdrop-filter` is GPU-expensive on low-end Android — cap blur at the header
only, keep blur radius modest, provide an opaque fallback background. Aurora/grid must be pure CSS
(no JS loop) and paused under `prefers-reduced-motion`. No webfonts on MotionSites gave them zero
font CLS; we self-host a single variable sans with `font-display: swap` and reserve the serif for
one marketing heading. LCP budget ≤ 2.5 s: hero text is the LCP element, so it must render on first
paint (CSS-only animation, no client JS gate).

**Accessibility.** Full-screen nav dialogs need real `role="dialog"`, focus trap, Escape and
close-button semantics — MotionSites skips most of it; we won't. Colour-only state (e.g. a red
deadline) must always pair with an icon or text label. Contrast on dark surfaces needs auditing —
teal on near-black fails for small text unless brightened. All motion > 200 ms must honour
`prefers-reduced-motion` with an immediate-content fallback (content never starts hidden when JS
is unavailable).

**Mobile.** Chip rows must scroll horizontally with snap rather than wrap; touch targets ≥ 44 px;
the filter drawer must be reachable with one thumb; card metadata must not truncate critical
deadline dates.

---

## 4. Chosen direction

**"Civic radar":** dark deep-ink hero with a restrained animated grid/aurora (CSS only), white
content cards on an off-white page, teal/emerald primary actions, saffron/gold reserved strictly
for deadlines and attention, red only for errors/expiry. One sans product typeface (Geist); one
serif accent (Newsreader) on at most one marketing heading. Motion limited to fade/translate
reveals, staggered cards, nav underline, and search focus transitions — all reduced-motion safe,
none infinite inside content areas.

## 5. Rejected alternatives

1. **Full-dark site (current ClaimRadar theme).** Great for a dashboard, poor for long-form legal
   reading and source verification; light surfaces improve readability and print/share behaviour.
2. **Full-light site with no hero.** Loses the memorability and "radar" brand moment; the dark
   hero is cheap (CSS only) and carries the trust messaging.
3. **MotionSites-style maximalism (gradients, neon, shouty type).** Incompatible with legal
   content, invites regulatory-style distrust, and fails our no-fake-urgency policy.

## 6. Pages / components requiring redesign

- `components/layout/header.tsx` — sticky blur header, nav underline, accessible mobile drawer.
- `components/layout/footer.tsx` — multi-column civic footer + independence disclaimer.
- `app/(public)/page.tsx` — homepage (hero, search, trust strip, real data sections).
- `app/(public)/claimables/page.tsx` — filters, chips, sort, pagination, mobile filter drawer.
- `app/(public)/claimables/[slug]/page.tsx` — direct-answer header + sticky summary panel.
- `app/(public)/companies/*`, `app/(public)/sectors/*` — neutral, substantive directory pages.
- `app/(public)/new/page.tsx`, `closing-soon/page.tsx`, `deadlines/page.tsx` — deadline-aware
  listings with machine-readable IST dates.
- `components/repository-states.tsx` — restyled honest empty/error/demo states.
- `components/legal-page.tsx` + `components/landing/interactive.tsx` — light-theme token update.
