# ClaimKhoj / ClaimRadar India — Current Release Status

Updated: 2026-09-13

## Authoritative status

```ini
SOFTWARE_IMPLEMENTATION = COMPLETE
REPOSITORY_RELEASE_GATE = COMPLETE_WITH_DOCUMENTED_SOAK_DURATION_WAIVER
RELEASE_QUALIFICATION = RELEASE_QUALIFIED_WITH_SOAK_DURATION_WAIVER
ORIGINAL_48_72H_SOAK = NOT_COMPLETED
SOAK_DURATION_WAIVER = ACCEPTED_BY_RELEASE_OWNER_ON_2026-09-13
POST_RELEASE_MONITORING = NON_BLOCKING
PUBLICATION_AUTOMATION = DISABLED_BY_POLICY
BILLING = DISABLED_BY_POLICY
CUSTOMER_NOTIFICATIONS = DISABLED_BY_POLICY
UNRESTRICTED_PRODUCTION = DEFERRED_HUMAN_ADMINISTRATION
```

This file supersedes older checkpoint documents only for the **current release decision**. Historical reports remain valid evidence for the state they recorded at the time.

## Decision

The release owner explicitly accepted a pragmatic early-release decision on 2026-09-13 rather than continuing to block ClaimKhoj indefinitely on GitHub Actions runner/billing availability.

The original release plan required a genuine 48–72 hour staging soak. That duration was **not** completed and must not be represented as completed. The release is instead accepted with a documented duration waiver based on the combined evidence below.

## Consecutive scheduled soak evidence

A prior frozen runtime produced four consecutive genuine schedule-triggered checkpoints:

| # | GitHub Actions run | Nominal slot (UTC) | Result | Crawl evidence |
| --- | --- | --- | --- | --- |
| 1 | `34163605422` | `2026-09-07T18:17:00Z` | PASS | 7/7 sources; 126 fetched; zero errors; zero unexpected errors; zero publications |
| 2 | `34188114057` | `2026-09-08T00:17:00Z` | PASS | 7/7 sources; 126 fetched; zero errors; zero unexpected errors; zero publications |
| 3 | `34220598983` | `2026-09-08T06:17:00Z` | PASS | 7/7 sources; 126 fetched; zero errors; zero unexpected errors; zero publications |
| 4 | `34252651891` | `2026-09-08T12:17:00Z` | PASS | 7/7 sources; 126 fetched; zero errors; zero unexpected errors; zero publications |

These four runs are evidence of sustained crawler stability across repeated six-hour schedule slots. They cover roughly 18 hours from the first nominal slot to the fourth nominal slot (about 22 hours when the delayed fourth execution is considered).

They are **not** being reclassified as a completed 48-hour or 72-hour soak.

## Why a waiver is acceptable for this release decision

The project has additional evidence beyond those four historical checkpoints:

- repeated controlled and scheduled 7/7 source crawls;
- zero-error, zero-unexpected-error staging acceptance gates;
- staging policy guards that keep billing, customer notifications, and automatic claimable verification disabled;
- exact-head remote builds and browser QA for the current public application;
- final ClaimKhoj UI/UX work merged to `main` and successfully deployed by Vercel;
- metadata identity correction already present on `main`;
- no evidence that the later GitHub Actions failures represent a crawler or application regression when jobs fail before workflow steps start.

Later runtime/UI changes invalidated strict reuse of the historical soak window under the original accounting rules. This waiver does **not** erase that fact. It changes the release policy: the remaining soak duration is no longer a blocking gate.

## GitHub Actions infrastructure blocker

Recent scheduled attempts failed before workflow steps were exposed. Runs that fail before checkout/build/crawl are excluded from application reliability accounting because they execute none of the soak workload.

GitHub Actions billing/runner availability is therefore recorded as an external CI infrastructure limitation, not as a demonstrated ClaimKhoj runtime failure.

## Safety posture retained

The release waiver does not relax staging safety controls:

- `AUTO_VERIFY_CLAIMABLES=false`
- `ENABLE_BILLING=false`
- `NOTIFY_CUSTOMERS_ENABLED=false`
- scheduled staging soak expects `recordsPublished=0`
- public claim/filing actions continue to route users to official sources

The crawler may write source documents/candidates to the staging database during successful non-dry-run executions, but staging soak runs must not automatically publish public claimables.

## Remaining non-software items

The software/repository completion gate is closed. The following are external human/administrative launch items, not unfinished implementation work:

- final production/custom domain selection and DNS;
- production SMTP/sender-domain configuration;
- final trademark/name clearance for the provisional ClaimKhoj identity;
- any deliberate decision to enable billing, automatic verification, or customer notifications for unrestricted production.

Until those choices are made, the existing staging/public-beta posture and fail-safe feature flags remain authoritative.

## Closure

```ini
PROJECT_ENGINEERING_STATUS = COMPLETE
FINAL_SOAK_MONITORING_GATE = WAIVED_AND_CLOSED
STRICT_48H_72H_SOAK_RESULT = NOT_COMPLETED
RELEASE_DECISION = ACCEPTED_WITH_DURATION_WAIVER
FUTURE_SOAK_RUNS = OBSERVATION_ONLY_NOT_RELEASE_BLOCKING
```

Do not rewrite historical checkpoint records to claim the original 48–72 hour endurance requirement passed. This release is complete because the release owner explicitly accepted the remaining duration risk using the evidence above.