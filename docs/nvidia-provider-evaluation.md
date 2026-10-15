# NVIDIA evaluation and licensed fallback policy

## Current production configuration

- `AI_PROVIDER=openrouter` and `OPENROUTER_MODEL=openrouter/free` remain the only default live provider settings.
- `NVIDIA_API_KEY` being stored in Railway does **not** enable NVIDIA processing.
- NVIDIA API Catalog access via the Developer Program is for **evaluation, prototyping, research and testing**, not customer-facing production processing. See the [official NVIDIA NIM FAQ](https://docs.api.nvidia.com/nim/docs/product).
- Never forward unredacted customer information, names, contact details or underlying documents containing personal data to the NVIDIA trial.
- No AI provider can override evidence validation, editor/legal review, or the disabled publishing/notification/billing guards.

## Evaluation

Use only synthetic public-like notices with fictional entities and no real private information. For any test:

1. Obtain a developer API key and store it in an isolated, nonpublic secret configuration. Never commit, echo or paste it into logs.
2. Test the NVIDIA hosted API at `https://integrate.api.nvidia.com/v1/chat/completions`, using an explicitly available catalog model.
3. Check JSON schema validity, unsupported claims, source-verification abstention, latency, HTTP errors, and trial balance. Limit evaluation requests.
4. Compare those metrics to OpenRouter on the same safe fixture before considering a rollout.
5. Remove the temporary evaluator after confirming its results.

Verified 2026-10-15: the account returned 81 models via GET /v1/models. Old `meta/llama-3.1-8b-instruct` and `nvidia/nemotron-3-nano-30b-a3b` were absent and returned HTTP 410. `nvidia/nemotron-3.5-lightning-30b-a3b` returned HTTP 200. In one synthetic four-field extraction (not a full claim schema benchmark), `chat_template_kwargs.enable_thinking=false` combined with `response_format={type:json_object}` produced correctly parsed JSON, the correct fictional deadline and a refusal to assert official verification, in approximately 1.44 seconds with 85 generated tokens. The prior 230-token default-thinking response did not pass the JSON check. Never extrapolate this single synthetic test to production accuracy, quota or license entitlement.

## Larger synthetic safety checks (2026-10-15)

A separate **non-production** test used the full set of ClaimKhoj extraction fields, a nonexistent cooperative, no genuine refund route or amount, and an explicitly unverified source.

- Nemotron 3.5 Lightning: HTTP 200, approximately 8.1 seconds, finish reason `stop`, 280 completion tokens. JSON had the required typed fields, no invented amount or URL, and evidence snippets existed in the input. **However, it incorrectly returned `is_relevant=true` for a plainly fictional nonclaimable notice.**
- Google Gemma 4 31B: the same fixture did not complete within the 35-second test timeout.
- Therefore, **the provider has NOT passed claimability-accuracy acceptance** and must not be enabled for production real-world notices solely on the basis of the smaller JSON test.

A later authorized rollout needs representative negative/positive fixtures, exact-match evidence tests, adversarial/no-relief samples, live model-availability checks, no-PHI/PII evaluation compliance, measured classification accuracy and human/legal publication gates.

## Production rollout prerequisites

An NVIDIA key alone is **not** a production license. Obtain and document the applicable commercial entitlement/authorization before configuring the model to process any real ClaimKhoj source text. Verify the current model's terms and the data processing agreement. Do not toggle these variables just to bypass free-model throughput limits.

After separate contractual approval, the only supported two-provider mode is:

```dotenv
AI_PROVIDER=openrouter+nvidia
OPENROUTER_MODEL=openrouter/free
NVIDIA_PRODUCTION_AUTHORIZED=true
NVIDIA_API_KEY=<secure-Railway-secret>
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_BASE_URL=https://integrate.api.nvidia.com
NVIDIA_FALLBACK_LIMIT=1
```

- Keep the existing `OPENROUTER_API_KEY`; it remains the primary service.
- `NVIDIA_FALLBACK_LIMIT` must be **1 or 2 per invocation**. The fallback runs only on primary timeout, rate limit or provider error, not on success, invalid output, or authentication failure.
- The limit is **per process**, not a cross-deployment billing ceiling. Railway restarts/manual invocations and other pipelines can increase usage. Before any commercial deployment establish an external account-level spend cap, credential restrictions and monitoring.
- Keep all existing daily AI budget and two-pass reserves; do not increase throughput until real trial/production terms are validated.
- To roll back, reset `AI_PROVIDER=openrouter`, remove the production authorization flag and redeploy.
- Record live acceptance: provider, model, source ID, latency, error class, no publication without editor/legal review.

## Explicitly forbidden

Using NVIDIA Developer Program trial requests as a hidden fallback on real consumer documents or silently selecting a paid model when OpenRouter is unavailable.
