# ClaimKhoj final visual candidate

The branch `design/claimkhoj-final-visual` contains the final reference-faithful ClaimKhoj homepage pass plus the metadata-origin fixes that were previously isolated in PR #24.

The implementation is intentionally truthful to the current product: only the five monitored sources are shown and no live-feed, automatic-eligibility, government-affiliation, filing, or payout claims were introduced.

The exact visual implementation at `24dd80cf75ba68cb7beb5bfadd49a42ec014ffa1` completed a Vercel production build successfully. Later commits on the branch are documentation-only review notes.

Do not interpret the Vercel build as proof that GitHub-hosted full CI ran; hosted Actions remain blocked at account runner allocation.
