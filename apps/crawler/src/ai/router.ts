import type { AIProvider } from './types.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { NvidiaNimProvider } from './providers/nvidia.js';
import { BoundedFallbackProvider } from './providers/bounded-fallback.js';
import { NoAiProvider } from './providers/noai.js';

interface RouterEnv {
  AI_PROVIDER: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_BASE_URL?: string;
  NVIDIA_MODEL?: string;
  /** Explicit entitlement confirmation: a free developer trial is NOT a license. */
  NVIDIA_PRODUCTION_AUTHORIZED?: boolean;
  NVIDIA_FALLBACK_LIMIT?: number;
}

const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com';
const ALLOWED_NVIDIA_MODELS = new Set([
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.1-70b-instruct',
]);

/**
 * OpenRouter free remains the default customer-processing service.
 *
 * NVIDIA's Developer Program trial is restricted to prototyping/evaluation,
 * so merely setting NVIDIA_API_KEY can NEVER enable production inference.
 * A separate production entitlement and a deliberate provider choice are
 * required. The licensed fallback has a separate per-process hard cap.
 */
export function createProviderRouter(env: RouterEnv): AIProvider {
  if (env.AI_PROVIDER === 'none') return new NoAiProvider();

  if (!['openrouter', 'openrouter+nvidia'].includes(env.AI_PROVIDER)) {
    throw new Error('FREE_ONLY_PROVIDER_GUARD: unknown or unauthorized provider');
  }

  if ((env.OPENROUTER_MODEL ?? 'openrouter/free') !== 'openrouter/free') {
    throw new Error('FREE_ONLY_MODEL_GUARD: only openrouter/free is permitted');
  }

  const openrouter = env.OPENROUTER_API_KEY
    ? new OpenRouterProvider(env.OPENROUTER_API_KEY, 'openrouter/free')
    : new NoAiProvider();

  if (env.AI_PROVIDER === 'openrouter') return openrouter;

  if (env.NVIDIA_PRODUCTION_AUTHORIZED !== true) {
    throw new Error('NVIDIA_LICENSE_GUARD: evaluation keys cannot process customer documents');
  }
  if (!env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_KEY_GUARD: NVIDIA key is missing');
  }
  const baseUrl = env.NVIDIA_BASE_URL ?? NVIDIA_ENDPOINT;
  if (baseUrl !== NVIDIA_ENDPOINT) {
    throw new Error('NVIDIA_ENDPOINT_GUARD: refuse unapproved credential destinations');
  }

  const model = env.NVIDIA_MODEL ?? 'meta/llama-3.1-8b-instruct';
  if (!ALLOWED_NVIDIA_MODELS.has(model)) {
    throw new Error('NVIDIA_MODEL_GUARD: model must be explicitly approved');
  }

  const nvidia = new NvidiaNimProvider(env.NVIDIA_API_KEY, model, baseUrl);
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_KEY_GUARD: dual-provider mode requires OpenRouter');
  }
  return new BoundedFallbackProvider(openrouter, nvidia, env.NVIDIA_FALLBACK_LIMIT ?? 1);
}
