# ClaimKhoj final visual review

Branch: `design/claimkhoj-final-visual`

Reference direction: approved PraptiQ concept, adapted faithfully to the real ClaimKhoj product and the five actually monitored source families.

## Intended visual corrections

- tighter first-viewport balance and hero rhythm
- marigold search CTA matching the approved reference
- larger, calmer source instrument
- persistent truthful source spotlight panel
- differentiated authority colors while preserving the real source set
- handwritten editorial annotation and curved arrow
- flowing discovery journey rail instead of a flat segmented line
- richer source strip cards
- denser opportunity list and clearer process flow
- preserved reduced-motion behavior and keyboard source controls
- metadata origin fix from the superseded metadata-only PR

## Deliberate deviations from the concept

- only real monitored source families are shown: SEBI, RBI, IBBI, TRAI, PIB
- no fake live crawler progress or live-feed language
- no unsupported Income Tax, EPFO, IRDAI, Civil Aviation, or Consumer Affairs monitoring claims
- product continues to direct users to official routes; it does not file claims or promise payouts

## Verification evidence

Exact-head Vercel preview commit: `24dd80cf75ba68cb7beb5bfadd49a42ec014ffa1`

Vercel production build evidence:

- dependency install completed
- workspace TypeScript package builds completed
- Next.js compile succeeded
- lint/type validity stage completed
- static-page generation completed
- deployment completed successfully

GitHub-hosted full CI remains unavailable because the account currently cannot allocate hosted Actions runners. The preview build is therefore evidence for the web production build, not a substitute claim that every repository test suite ran.

Final visual sign-off must be performed against the deployed preview at desktop and mobile before merging.
