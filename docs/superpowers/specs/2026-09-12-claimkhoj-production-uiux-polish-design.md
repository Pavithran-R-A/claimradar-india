# ClaimKhoj Production UI/UX Polish Design

## Status

Approved direction: finish the existing ClaimKhoj visual identity into a production-grade public experience. This is a completion/polish pass, not a wholesale redesign.

## Goal

Turn the current ClaimKhoj public experience from a visually promising prototype into a coherent, trustworthy, accessible, responsive consumer product while preserving all existing crawler, Supabase, auth, RBI, source-registry, publication, and release semantics.

## Source Baseline

Implementation starts from `design/claimkhoj-final-visual-review`, which is currently ahead of `main` and contains the approved ClaimKhoj visual direction plus the latest merged runtime baseline.

## Product Principles

1. **Trust before spectacle.** Official-source provenance, plain language, and obvious next actions must dominate decorative treatment.
2. **Search is the primary job.** The home page must make claim discovery/search the most visually dominant interaction.
3. **One visual system.** Spacing, radii, shadows, typography, borders, iconography, and color usage must feel intentionally related across the whole public surface.
4. **Responsive by composition, not shrinking.** Mobile/tablet layouts must reorganize around priority rather than compress the desktop arrangement.
5. **Accessible by default.** Keyboard focus, target sizes, contrast, semantics, motion reduction, and readable text hierarchy are release gates, not optional polish.
6. **No domain-logic drift.** UI work must not alter crawler behavior, source semantics, eligibility logic, publication state, auth rules, database behavior, or operational release controls.

## Visual Direction

Retain the current ClaimKhoj identity:

- Deep trust navy as the primary structural color.
- Teal for verification/official-source accents.
- Warm gold for the primary action and highlights.
- Editorial serif display type for major headings and selected annotations.
- Clean sans-serif body/interface typography.
- The existing ClaimKhoj mark and official-source visual vocabulary.

The finished result should feel like a credible civic-fintech utility: calm, clear, authoritative, modern, and distinctly Indian without using decorative nationalism.

## Home Page Composition

### Header

- Use a stable content-width container with stronger horizontal and vertical breathing room.
- Keep the logo/wordmark left, primary navigation centered/right, and the main CTA visually distinct.
- Remove any overlap between header content and hero annotations.
- Provide a real mobile navigation pattern rather than squeezing desktop links.
- Ensure all header actions have visible hover, focus-visible, active, and touch states.

### Hero

Desktop uses a balanced two-column composition, approximately 55/45, with aligned visual baselines:

- Left: eyebrow/accent, primary headline, supporting copy, search experience, and three concise trust/value points.
- Right: official-source radar/spotlight visual.
- Decorative editorial notes must be contained inside safe visual bounds and must never overlap the nav, radar card, or viewport edges.
- Hero vertical rhythm should feel deliberate rather than compressed at the top and empty below.

### Search

The hero search is the highest-priority interaction:

- Larger, calmer input field with a clear search affordance.
- State/location selector remains visible and understandable.
- CTA uses the gold treatment and a strong action label.
- Desktop controls may sit in one row when there is sufficient width.
- Tablet/mobile stack controls cleanly with full-width tap targets.
- Keyboard interaction, focus-visible state, and disabled/loading states must be visually explicit.
- Suggested searches remain secondary and visually lighter than the main input.

### Source Radar / Spotlight

Keep the interactive source visualization, but simplify its hierarchy:

- Radar is a supporting trust artifact, not a competing hero CTA.
- Reduce visual density and remove unnecessary micro-decoration.
- Use consistent source colors and icon treatments.
- Spotlight panel copy must fit naturally without cramped line breaks.
- Interaction must work by keyboard and pointer.
- On narrow screens, convert to a simpler stacked/scrollable presentation if the radial layout becomes illegible.

### Discovery Journey

`Discover → Verify → Understand → Act` becomes an intentional progression rather than a faint decorative line:

- Clear stage labels and short descriptions.
- Stronger visual continuity and sufficient contrast.
- Decorative annotations are optional and must not compete with task content.
- On mobile, use a vertical or compact stepped flow rather than an unreadable miniature horizontal diagram.

## Below-the-Fold Structure

### Official Sources Strip

- Preserve direct links to official source families.
- Normalize icon circles, card height, spacing, label hierarchy, and hover/focus behavior.
- Use a consistent source-card component across the home page and sources page where practical.

### Latest Opportunities

- Emphasize title, authority/source, publication date, and obvious click affordance.
- Improve row/card spacing and hover/focus states.
- Empty/demo states must remain truthful and visually integrated.

### How ClaimKhoj Works

- Keep the evidence-flow concept.
- Rebalance spacing and hierarchy so it reads as a process, not an illustration inserted beside content.
- Reuse the same four-step language as the hero journey to avoid conceptual duplication.

### Trust / Public-Benefit Messaging

- Continue the page with a concise trust section explaining official-source provenance, what ClaimKhoj does not do, and that users complete actions on official portals.
- Avoid marketing claims that imply legal, financial, or entitlement guarantees.

### Final CTA and Footer

- End with one clear next action: explore/search claims.
- Footer groups navigation, policies, source transparency, and contact/help consistently.
- Keep support/help placement predictable across public pages.

## Shared Public Design System

Create or normalize reusable primitives for the public site where existing code already has natural seams:

- Section container and vertical spacing rhythm.
- Primary/secondary/text link treatments.
- Public cards and source cards.
- Section heading pattern.
- Trust/evidence badge treatment.
- Focus-visible ring treatment.
- Mobile navigation presentation.

Avoid unnecessary component abstraction. Components should be extracted only when two or more public surfaces genuinely share the same behavior/presentation.

## Responsive Rules

Target behavior at minimum:

- Small mobile: ~320–479 CSS px.
- Large mobile: ~480–767 CSS px.
- Tablet: ~768–1023 CSS px.
- Desktop: 1024+ CSS px.

Rules:

- No horizontal scrolling caused by authored content.
- Hero becomes a single-column content-first layout on mobile.
- Search controls stack before they become cramped.
- Radar/source visualization must remain understandable or switch to a simplified mobile representation.
- Navigation uses a dedicated mobile pattern.
- Typography scales with bounded responsive values rather than large jumps.
- Decorative notes/lines may be hidden on smaller viewports when they stop adding value.

## Accessibility Requirements

Target WCAG 2.2 AA behavior for the polished public experience.

- All interactive elements reachable and operable by keyboard.
- Visible focus treatment that is not clipped or obscured.
- Pointer targets meet or exceed 24×24 CSS px minimum, with larger practical tap areas for primary controls.
- Interactive state must not rely on color alone.
- Semantic headings remain sequential and meaningful.
- Form controls have programmatic labels and understandable error/status messaging.
- `prefers-reduced-motion` disables or reduces non-essential motion.
- Decorative SVG/illustration content is hidden from assistive technology where appropriate.
- Contrast remains sufficient in default, hover, focus, disabled, and selected states.

## Motion

- Keep subtle entrance/reveal motion only where it helps hierarchy.
- Remove motion that causes layout shift, obscures focus, or makes trust-oriented content feel playful.
- Source spotlight transitions should be brief and functional.
- Honor reduced-motion preferences globally.

## Scope Boundaries

This pass MAY change:

- Public-page JSX/TSX and CSS/Tailwind classes.
- Landing-page visual components.
- Shared public navigation/footer components.
- Public presentation components and accessibility tests.
- Browser/visual regression fixtures and test expectations required by the new layout.

This pass MUST NOT change functional semantics in:

- Crawler/adapters.
- RBI feed handling.
- Supabase/database schema or queries except purely presentational read-shape typing if already required by existing UI.
- Authentication/authorization rules.
- Publication state or editorial workflow.
- Source-registry meaning or monitored-source truthfulness.
- Scheduled crawl/release/soak logic.

## Validation Gates

The pass is complete only when all of the following are true:

1. Formatting, lint, typecheck, unit tests, and production build pass.
2. Existing ClaimKhoj source/radar accessibility coverage passes or is strengthened.
3. Browser smoke passes on public routes.
4. Final browser QA passes at representative mobile, tablet, and desktop widths.
5. No authored horizontal overflow on tested public pages.
6. Keyboard-only review confirms nav, hero search, radar/source interactions, major cards, CTA, and footer are reachable with visible focus.
7. Reduced-motion mode is verified.
8. Visual inspection confirms no overlapping annotations, clipped controls, broken line wrapping, or inconsistent spacing in the hero and first two sections.
9. Runtime-sensitive diff review confirms no crawler/RBI/Supabase/auth/publication behavior changed.
10. A Vercel preview is reviewed before any merge to `main`.

## Acceptance Criteria

The UI/UX pass is accepted when:

- The first screen has a clear visual order: brand/navigation → headline → search → trust evidence.
- The radar supports the hero rather than visually overpowering it.
- No text or illustration overlaps another element at desktop, tablet, or mobile widths.
- Search is comfortable to use with mouse, touch, and keyboard.
- Public sections below the fold feel like the same product as the hero.
- Header/footer/navigation patterns are consistent across public pages.
- The site feels finished without changing the product’s operational behavior.
