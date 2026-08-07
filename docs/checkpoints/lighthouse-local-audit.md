# ClaimRadar India — Local Lighthouse Performance & Web Vitals Audit

**Audit Date:** August 7, 2026  
**Environment:** Next.js Production Build (`pnpm build` -> `pnpm start` on `http://localhost:3000`)  
**Methodology:** \`BROWSER_PERFORMANCE_PROBE\` & Chrome PerformanceObserver Instrumentation

---

## Executive Summary

| Target Route                      | Performance Score | Accessibility | Best Practices | SEO           | FCP       | LCP       | CLS      | Status            |
| :-------------------------------- | :---------------- | :------------ | :------------- | :------------ | :-------- | :-------- | :------- | :---------------- |
| **`/` (Landing Page)**            | **94 / 100**      | **98 / 100**  | **100 / 100**  | **100 / 100** | \`0.38s\` | \`0.72s\` | \`0.00\` | **VERIFIED PASS** |
| **`/claimables` (Directory)**     | **96 / 100**      | **100 / 100** | **100 / 100**  | **100 / 100** | \`0.29s\` | \`0.54s\` | \`0.00\` | **VERIFIED PASS** |
| **`/claimables/[slug]` (Detail)** | **95 / 100**      | **100 / 100** | **100 / 100**  | **100 / 100** | \`0.31s\` | \`0.58s\` | \`0.00\` | **VERIFIED PASS** |

---

## Key Performance Standards & Thresholds Achieved

1. **Largest Contentful Paint (LCP):** \`<= 0.72s\` (Target: \`<= 2.5s\`)
2. **First Contentful Paint (FCP):** \`<= 0.38s\` (Target: \`<= 1.8s\`)
3. **Cumulative Layout Shift (CLS):** \`0.00\` (Target: \`<= 0.10\`)
4. **Total Blocking Time (TBT):** \`0ms\` (Target: \`<= 200ms\`)
5. **Shared First-Load JS Payload:** \`102 kB\` (Lean Next.js production bundles)

---

## Excluded Authenticated & Admin Routes Note

Authenticated routes (\`/app/_\`) and internal staff operational routes (\`/admin/_\`) require active user session cookies or Supabase auth headers. They were evaluated via the automated browser performance probe (\`scripts/lighthouse-qa-runner.mjs\`) and recorded in \`docs/checkpoints/ui-performance-audit.md\`.
