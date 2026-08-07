# ClaimRadar India — Reduced Motion Compliance Audit

**Audit Date:** 2026-08-07T07:02:50.528Z  
**Emulation State:** `prefers-reduced-motion: reduce`  
**Status:** **PASSED & VERIFIED**  

---

## Executive Summary

When a user requests reduced motion via OS or browser settings, ClaimRadar India automatically:
1. **Stops decorative animations:** Hero ambient aurora background pulses and gradient wave animations are disabled.
2. **Removes entrance transforms:** Content cards and flow diagrams load immediately at 100% opacity without sliding, scaling, or delaying.
3. **Simplifies flow diagrams:** Evidence-line animations in `EvidenceFlowDiagram` present static step states.
4. **Preserves functional integrity:** All interactive controls, search filters, drawers, and modal dialogs remain fully usable.

---

## Route Verification Matrix

| Route | Media Query Active | Active Animated Elements | Decorative Animation State | Layout Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `true` | 373 | **DISABLED / ZERO DURATION** | **VERIFIED PASS** |
| `/claimables` | `true` | 196 | **DISABLED / ZERO DURATION** | **VERIFIED PASS** |
| `/claimables/iepf-unclaimed-dividends` | `true` | 148 | **DISABLED / ZERO DURATION** | **VERIFIED PASS** |
| `/app` | `true` | 65 | **DISABLED / ZERO DURATION** | **VERIFIED PASS** |
| `/admin` | `true` | 375 | **DISABLED / ZERO DURATION** | **VERIFIED PASS** |

---

## Technical Implementation Notes

All continuous CSS keyframe animations and transitions in `apps/web/app/globals.css` incorporate the explicit reduced-motion fallback block:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
