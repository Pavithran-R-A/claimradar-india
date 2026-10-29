# Optional Groq free-plan extraction (disabled unless explicitly selected)

This integration adds a second **direct** provider; it is **not** an automatic fallback.

The existing Railway and local installations continue using their current `AI_PROVIDER` and OpenRouter settings unchanged. To opt in separately, an account owner must verify that their Groq organization is on a **free plan with no billable usage**, create a Groq API key, and configure the secret **only in the platform's secret manager**, not GitHub or chat:

- `AI_PROVIDER=groq`
- `GROQ_FREE_PLAN_CONFIRMED=true` (must only be set after verifying the account's billing status and terms)
- `GROQ_MODEL=openai/gpt-oss-120b` (only supported model by this adapter; intended for structured legal-evidence extraction)
- `GROQ_API_KEY` (secret; never print or commit)

The GPT-OSS 120B free plan can enforce an 8,000 tokens/minute cap even though the model context is much larger. The adapter therefore reserves a maximum of 1,536 completion tokens and limits the combined UTF-8 bytes of its system prompt and selected verbatim source excerpts, with framing headroom. If the system prompt leaves inadequate safe space, it rejects locally without an API call. Excerpting is not evidence of absence: all claims still require corroboration against complete stored source documents and editorial review. This is a conservative byte-based guard, not a guarantee against account-level shared quota or future provider changes.

No new fallback is configured; no existing credential is rotated. Before opting in, review Groq's current free-plan rate limits, model availability, pricing, and terms for production/customer data at https://console.groq.com/docs/rate-limits and https://console.groq.com/docs/models. Groq's model catalog lists nonzero _paid_ per-token pricing, so an account not confirmed as free must NOT be opted in. A `401` from OpenRouter is an authorization problem; this adapter doesn't fix or reuse that key.

The adapter only contacts `https://api.groq.com/openai/v1/chat/completions`. It uses the same `AIExtractor` budgets, free-cron limit (maximum two retry candidates), Zod schema, evidence checking, and human editorial review as the existing provider. Requests with no valid free-plan confirmation fail closed. A 429 stops the current batch; no paid fallback. The 50 MiB PDF limit, crawl acceptance gates, all publication/notification/billing flags, and Supabase RLS are unchanged.

Before a real consumer document is routed to Groq: obtain the account owner's informed approval to send official source text to Groq, perform synthetic privacy-safe validation, confirm the free quota remains available, and run at least one natural scheduled crawl plus a bounded candidate with expected schema/evidence behavior. Nothing in this PR changes Railway variables or switches providers.
