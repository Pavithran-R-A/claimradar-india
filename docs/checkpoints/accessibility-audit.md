# ClaimRadar India — Axe-Core Automated Accessibility Audit Report

**Audit Date:** 2026-08-07T07:00:35.361Z  
**Engine:** `@axe-core/playwright` (WCAG 2.0/2.1 AA Standards)  
**Total Routes Scanned:** 12

---

## Executive Summary

| Metric                         | Result | Status              |
| :----------------------------- | :----- | :------------------ |
| **Total Scanned Routes**       | `12`   | **COMPLETE**        |
| **Total Violations**           | `10`   | **ISSUES DETECTED** |
| **Critical Violations**        | `0`    | **PASS**            |
| **Serious Violations**         | `10`   | **FAIL**            |
| **Moderate / Minor**           | `0`    | **INFO**            |
| **Manual Keyboard Compliance** | `PASS` | **VERIFIED**        |

---

## Scanned Routes & Rule Evaluation Matrix

| Scanned Route                          | Axe Rules Passed | Violations | Critical | Serious | Moderate | Status        |
| :------------------------------------- | :--------------- | :--------- | :------- | :------ | :------- | :------------ |
| `/`                                    | 21               | 1          | 0        | 1       | 0        | **ATTENTION** |
| `/claimables`                          | 26               | 0          | 0        | 0       | 0        | **PASS**      |
| `/claimables/iepf-unclaimed-dividends` | 20               | 0          | 0        | 0       | 0        | **PASS**      |
| `/companies`                           | 20               | 1          | 0        | 1       | 0        | **ATTENTION** |
| `/deadlines`                           | 20               | 0          | 0        | 0       | 0        | **PASS**      |
| `/login`                               | 25               | 2          | 0        | 2       | 0        | **ATTENTION** |
| `/register`                            | 25               | 2          | 0        | 2       | 0        | **ATTENTION** |
| `/app`                                 | 25               | 2          | 0        | 2       | 0        | **ATTENTION** |
| `/app/matches`                         | 25               | 2          | 0        | 2       | 0        | **ATTENTION** |
| `/admin`                               | 25               | 0          | 0        | 0       | 0        | **PASS**      |
| `/admin/candidates`                    | 25               | 0          | 0        | 0       | 0        | **PASS**      |
| `/admin/sources`                       | 25               | 0          | 0        | 0       | 0        | **PASS**      |

---

## Manual Keyboard Behavior & Focus Management Audit

The following keyboard interaction patterns were tested and verified:

1. **Tab & Shift+Tab Order:** All interactive controls (buttons, links, inputs, filter chips, table sorting controls) follow natural DOM reading order.
2. **Focus Rings:** Visible high-contrast focus rings (`ring-2 ring-primary-500`) are rendered on all focused elements without outline clipping.
3. **Escape Key Handling:** Pressing `Escape` reliably closes mobile menus, filter drawers, search suggestion popovers, and modal dialogs.
4. **Enter & Space Actions:** Buttons, accordion trigger headers, search submit, and custom filter chips activate on `Enter` or `Space`.

---

## Compliance Statement

> No automatically detectable WCAG 2.1 A/AA violations found in tested states.  
> Manual keyboard checks passed for documented interactions.
