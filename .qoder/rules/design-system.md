# Design System

## Visual Identity

- **Theme**: Dark editorial — base background `#070B14`.
- **Body type**: Geist Sans (UI) + Manrope (long-form body).
- **Editorial accent**: Newsreader (serif) for headlines, pull-quotes and claim titles.
- **Monospace**: Geist Mono for code, data values and identifiers.

## Tooling

- Tailwind CSS (with `packages/design-system/tailwind.config.ts` as the single source of tokens).
- shadcn/ui primitives — copy into `packages/design-system/src/components`, own the code.
- Framer Motion only where CSS transitions/keyframes are genuinely insufficient.

## Tokens

All colours, radii, shadows, breakpoints and font stacks live in the Tailwind config. Reference tokens, never hardcode hex values in components.

## Accessibility

- WCAG 2.2 AA minimum.
- `prefers-reduced-motion: reduce` — disable transitions > 200 ms, remove parallax.
- Mobile-first: base styles target ≤ 360 px, scale up via `sm:` → `2xl:`.
- Focus-visible rings on every interactive element; never `outline: none` without replacement.
- Colour alone never conveys meaning — pair with icon or text.

## Component Conventions

- Compose from shadcn primitives; do not fork shadcn internals.
- Variants defined with `cva` (class-variance-authority).
- Slots pattern for compound components (Dialog, Drawer, Popover).
- Server Component by default; add `'use client'` only when state or event handlers are needed.

## Brand Centralisation

Site name, tagline and legal disclaimers are read from `packages/config`. Components never hardcode brand strings.
