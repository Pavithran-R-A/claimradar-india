# Fresh soak freeze note — 2026-10-04

The runtime integrity checker classifies `.github/workflows/staging-soak.yml` as runtime-sensitive.

After baseline run `37186623270` passed on `faedec687989a5de2b47ed1bff933db04d3975b3`, an operations-only cleanup briefly removed the path-scoped bootstrap trigger. That cleanup is reverted byte-for-byte so the effective staging-soak workflow remains identical to the successful baseline head.

During this fresh observation window, **do not edit** `docs/checkpoints/fresh-soak-start-2026-10-04.md`. The bootstrap push trigger is path-scoped to that marker, so ordinary code/docs pushes do not create extra soak executions.

Fresh scheduled credit remains limited to genuine `schedule` events from the six-hour cron.
