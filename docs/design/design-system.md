# ClaimRadar Design System

Phase A token set for the public site (and the shared app shell).
Research rationale: [`motionsites-ui-research.md`](./motionsites-ui-research.md).

## Principles

1. **Tokens only.** Components reference semantic tokens, never raw hex values.
2. **One vocabulary, two themes.** Semantic colours resolve to CSS custom
   properties; `.theme-light` remaps them for the public site, `:root` keeps
   the dark app shell. Components never branch on theme.
3. **Calm authority.** No countdown timers, fake urgency, autoplay, dominant
   red, gavel/scales clichés or government emblems. Colour is never the only
   carrier of meaning.
4. **Motion with an exit.** Every animation is short, purposeful, and disabled
   under `prefers-reduced-motion` with an immediate-content fallback.

---

## Colour tokens

Defined in `apps/web/app/globals.css`, consumed through
`apps/web/tailwind.config.ts` (mirrored in
`packages/design-system/tailwind-preset.js`).

| Token                 | Dark theme (`:root`)                       | Light theme (`.theme-light`) | Usage                      |
| --------------------- | ------------------------------------------ | ---------------------------- | -------------------------- |
| `background`          | `#070B14`                                  | `#F6F7F4` (off-white paper)  | Page background            |
| `background-elevated` | `#0B1120`                                  | `#EEF0EB`                    | Banded sections            |
| `surface`             | `#101827`                                  | `#FFFFFF`                    | Cards, inputs              |
| `surface-strong`      | `#151F32`                                  | `#F3F5F0`                    | Raised fills, skeletons    |
| `border`              | `rgba(255,255,255,.09)`                    | `rgba(17,24,39,.12)`         | Hairlines                  |
| `text-primary`        | `#F7F8FB`                                  | `#111827`                    | Headings, body             |
| `text-secondary`      | `#A7B0C0`                                  | `#374151`                    | Secondary copy             |
| `text-muted`          | `#778197`                                  | `#6B7280`                    | Metadata, captions         |
| `trust-primary`       | `#7387FF`                                  | `#0F766E` teal-700           | Primary actions/links      |
| `trust-primary-hover` | `#8798FF`                                  | `#115E59` teal-800           | Primary hover              |
| `success`             | `#28C6A2`                                  | `#047857` emerald-700        | Verified/open states       |
| `deadline` / warning  | `#F4A340`                                  | `#9E4A08` saffron            | Deadlines & attention only |
| `danger`              | `#FF6B72`                                  | `#B91C1C` red-700            | Errors/expiry only         |
| `info`                | `#5DB7FF`                                  | `#1D4ED8` blue-700           | Informational states       |
| `focus`               | `trust-primary` outline, 2 px, 2 px offset | —                            | Keyboard focus ring        |
| `overlay`             | `rgba(6,11,20,.6)` scrim                   | —                            | Dialogs/drawers            |
| `skeleton`            | `surface-strong` + `animate-shimmer`       | —                            | Loading placeholders       |
| `verified-background` | `rgba(40,198,162,.12)`                     | `rgba(4,120,87,.09)`         | Success badge fills        |
| `deadline-background` | `rgba(244,163,64,.12)`                     | `rgba(180,83,9,.10)`         | Deadline badge fills       |

Material (non-semantic) colours for always-dark surfaces (hero, footer):

| Token                 | Value                 | Usage                             |
| --------------------- | --------------------- | --------------------------------- |
| `ink-950` … `ink-600` | `#060B14` → `#27395C` | Hero, footer, dark panels         |
| `brand-bright`        | `#2DD4BF`             | Teal accents/text on ink surfaces |
| `gold-bright`         | `#F4A340`             | Deadline accents on ink surfaces  |

Contrast targets: body text ≥ 4.5:1, large text ≥ 3:1, all pairs checked in
both themes. On light surfaces saffron text uses the darkened `#9E4A08`
variant to stay AA.

## Typography

- **Sans (product):** Geist Sans — the only UI/body typeface. Weights limited
  to 400/500/600/700.
- **Serif (marketing accent):** Newsreader — at most **one** marketing heading
  per page (homepage hero accent phrase), italic 500. Never in data UI.
- Scale (Tailwind defaults): display `text-4xl→6xl` hero, section `text-2xl→3xl`,
  card title `text-lg`, body `text-sm/base`, metadata `text-xs`.
- Line heights: headings `leading-tight`, body `leading-relaxed`.

## Spacing & layout

- Spacing scale: Tailwind default (4 px base). Section rhythm: `py-16 sm:py-20`
  (64/80 px); card padding `p-5`–`p-6`; grid gaps `gap-4`–`gap-6`.
- Content container: `max-w-content` (76rem / 1216 px) with `px-4 sm:px-6 lg:px-8`.
- Reading column for long-form: `max-w-3xl`.

## Radii & elevation

| Token           | Value         | Usage                        |
| --------------- | ------------- | ---------------------------- |
| `rounded-field` | 8 px          | Inputs, small buttons, chips |
| `rounded-card`  | 12 px         | Cards, notices               |
| `rounded-md/lg` | 6/8 px        | Buttons                      |
| `shadow-card`   | subtle 1–3 px | Resting cards                |
| `shadow-lift`   | 10 px soft    | Hover lift                   |
| `shadow-panel`  | deep dark     | Dialogs/drawers              |

## Motion

| Token / utility                 | Value                         | Usage                                                  |
| ------------------------------- | ----------------------------- | ------------------------------------------------------ |
| `duration-fast`                 | 150 ms                        | Hover colour, underline                                |
| `duration-base`                 | 200 ms                        | Card lift, focus                                       |
| `duration-slow`                 | 350 ms                        | Drawer/dialog                                          |
| `ease-lift`                     | `cubic-bezier(0,0,.2,1)`      | Translate/shadow                                       |
| `animate-rise`                  | 550 ms fade+translateY(14 px) | Above-fold entrance (CSS only)                         |
| `animate-fade`                  | 450 ms                        | Secondary entrance                                     |
| `aurora`                        | 26 s alternate                | Hero glow only — never in content areas                |
| `animate-shimmer`               | 1.6 s                         | Skeletons only                                         |
| `.reveal-ready → .reveal-shown` | 500 ms                        | Below-fold scroll reveal, applied only after JS opt-in |
| `.nav-link` underline           | 200 ms scaleX                 | Navigation                                             |

**Reduced motion:** a global `prefers-reduced-motion: reduce` block collapses
all durations, disables the aurora, and forces reveal/entrance states to
their final visible values. Reveals never start hidden in server HTML, so
content is immediate without JS.

## Status semantics (directory UI)

| Display status | Colour token | Icon         | Label        |
| -------------- | ------------ | ------------ | ------------ |
| open           | `success`    | circle-check | Open         |
| closing_soon   | `deadline`   | clock        | Closing soon |
| under_review   | `info`       | eye          | Under review |
| closed         | `text-muted` | circle-off   | Closed       |

Status always renders icon + text — colour alone never carries meaning.

## Component conventions

- Server Components by default; `'use client'` only for drawer, accordion and
  reveal (all small, all progressive-enhancement safe).
- Directory data comes exclusively from `lib/claimables-repository.ts`;
  honest empty/error/demo states via `components/repository-states.tsx`.
- Dates: machine-readable `<time dateTime>` elements, displayed in IST
  (`Asia/Kolkata`).
