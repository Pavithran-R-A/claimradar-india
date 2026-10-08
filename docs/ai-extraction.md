# AI Extraction

## Overview

The AI extraction system converts raw regulatory/legal documents into structured claim data using large language models. It is designed to be provider-neutral, budget-conscious, and fault-tolerant. All AI output is treated as untrusted until it passes Zod schema validation.

## Provider Abstraction

Three providers implement the `AIProvider` interface:

| Provider             | File                         | Backend                                                    |
| -------------------- | ---------------------------- | ---------------------------------------------------------- |
| `OpenRouterProvider` | `ai/providers/openrouter.ts` | OpenRouter API (meta-llama/llama-3.1-70b-instruct default) |
| `NvidiaNimProvider`  | `ai/providers/nvidia.ts`     | NVIDIA NIM API (meta/llama-3.1-70b-instruct default)       |
| `NoAiProvider`       | `ai/providers/noai.ts`       | No-op fallback — returns deferred status                   |

### Switching Providers

Set the following environment variables:

```bash
# Use OpenRouter
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openrouter/free   # optional; zero-cost router, structured-output capable endpoints only

# Use NVIDIA NIM
AI_PROVIDER=nvidia
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com      # optional
NVIDIA_MODEL=meta/llama-3.1-70b-instruct              # optional

# No AI (all documents deferred)
AI_PROVIDER=none
```

The `createProviderRouter()` function builds a fallback chain:

1. Primary provider based on `AI_PROVIDER`
2. Any other configured provider as fallback
3. `NoAiProvider` if nothing is configured

## Two-Pass Extraction

The system supports two-pass extraction for higher accuracy:

- **Pass 1** — Initial extraction: analyzes the document and extracts all structured fields.
- **Pass 2** — Verification pass: reviews the first-pass output, corrects errors, and confirms or adjusts confidence scores. The second pass is more critical — if anything is uncertain, it is set to null.

Pass 2 uses a reserved portion of the daily budget (`AI_SECOND_PASS_RESERVE`).

## Prompt Versioning

Prompts are defined in `ai/prompts.ts` with an explicit version constant:

```typescript
export const PROMPT_VERSION = 'v1';
```

Each AI run record stores the `prompt_version` and `schema_version` for traceability. When prompts change, bump the version to maintain an audit trail of which extraction used which prompt.

The prompt includes strict rules:

- Never invent claim URLs, amounts, or deadlines
- Never convert allegations into findings
- Never convert individual awards into group relief
- Every important field must have supporting evidence
- Output must be valid JSON matching the schema

## Budget Management

The `AIBudgetManager` enforces daily limits:

| Parameter                      | Default | Purpose                                     |
| ------------------------------ | ------- | ------------------------------------------- |
| `AI_DAILY_REQUEST_BUDGET`      | 40      | Total AI calls per day                      |
| `AI_SECOND_PASS_RESERVE`       | 10      | Calls reserved for second-pass verification |
| `AI_MAX_ATTEMPTS_PER_DOCUMENT` | 2       | Max retries per document                    |

Budget logic:

- **First pass** can use up to `dailyLimit - secondPassReserve` = 30 calls
- **Second pass** can use up to `secondPassReserve` = 10 calls
- When budget is exhausted, remaining documents are saved with `ai_extraction_status: 'deferred'`
- Budget is in-memory and resets each pipeline run (one run = one day)

## Circuit Breaker

The `CircuitBreaker` protects against cascading failures when a provider is down:

```
closed ──(3 failures)──► open ──(60s cooldown)──► half-open
  ▲                                                  │
  └──────────────(success)───────────────────────────┘
```

| State       | Behavior                                                  |
| ----------- | --------------------------------------------------------- |
| `closed`    | All requests pass through normally                        |
| `open`      | Requests blocked; returns `provider_error` immediately    |
| `half-open` | One request allowed; success → `closed`, failure → `open` |

Configuration:

- Threshold: 3 consecutive failures to open
- Cooldown: 60,000 ms before transitioning to half-open

## Zod Validation as Hard Boundary

All AI output passes through `extractionSchema.safeParse()` from `@claimradar/claim-schema`. If the output does not match the schema:

- The candidate is marked `ai_extraction_status: 'invalid_output'`
- No further processing occurs (validators, scoring, publication are skipped)
- The error is logged

Additional hard boundaries enforced in `AIExtractor.extract()`:

- **Confidence cap**: confidence is capped at `LEGAL_SAFETY.MAX_CONFIDENCE`
- **Zero-evidence rejection**: if `is_relevant` is true but `evidence.length === 0`, the extraction is rejected with `invalid_output`

## No-AI Mode

When `AI_PROVIDER=none` or no API keys are configured:

1. The `NoAiProvider` is used, which returns `isAvailable() = true` but `name = 'noai'`
2. The pipeline detects this and sets `aiExtractor = null`
3. All candidate documents are saved with `ai_extraction_status: 'deferred'`
4. These documents can be reprocessed later via `crawler retry-queued`

This mode is useful for:

- Testing the pipeline without AI costs
- Running discovery-only crawls to see what documents are found
- Deferring AI processing to a later batch run

## Validators

After successful AI extraction and Zod validation, 11 deterministic validators run:

| Validator                    | Purpose                                                | Severity |
| ---------------------------- | ------------------------------------------------------ | -------- |
| `evidenceBackingValidator`   | Every non-null critical field has verified evidence    | warn     |
| `individualJudgmentGuard`    | Rejects individual judgments published as group claims | block    |
| `domainAllowlistValidator`   | Source domain is in the allowed list                   | warn     |
| `sourceTrustLevelValidator`  | Trust level is official or reputable                   | warn     |
| `groupVsIndividualValidator` | Extraction correctly identifies group vs individual    | warn     |
| `finalVsProposedValidator`   | Procedural status matches evidence                     | warn     |
| `appealOrStayValidator`      | Flags pending appeals or stays                         | warn     |
| `deadlineValidator`          | Deadline is present and reasonable                     | warn     |
| `amountSupportValidator`     | Claimed amount has evidence backing                    | warn     |
| `claimUrlSupportValidator`   | Claim URL exists in source evidence                    | warn     |
| `sourceFreshnessValidator`   | Document is recent enough to be actionable             | warn     |

Validators with `severity: 'block'` cause immediate rejection. Validators with `severity: 'warn'` route to human review.
