import type { AIProvider } from './types.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { NoAiProvider } from './providers/noai.js';

interface RouterEnv {
  AI_PROVIDER: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_BASE_URL?: string;
  NVIDIA_MODEL?: string;
}

/**
 * ClaimKhoj is a free-inference-only deployment.
 *
 * Intentionally do not instantiate the NVIDIA provider or fall back to any
 * alternative paid provider even if a credential is accidentally configured.
 * The OpenRouter free router chooses among *currently available* free models
 * and advertises $0 token pricing. Reject a model override fail-closed.
 */
export function createProviderRouter(env: RouterEnv): AIProvider {
  if (env.AI_PROVIDER === 'none') return new NoAiProvider();

  if (env.AI_PROVIDER !== 'openrouter') {
    throw new Error('FREE_ONLY_PROVIDER_GUARD: only OpenRouter free routing is permitted');
  }

  if ((env.OPENROUTER_MODEL ?? 'openrouter/free') !== 'openrouter/free') {
    throw new Error('FREE_ONLY_MODEL_GUARD: only openrouter/free is permitted');
  }

  if (!env.OPENROUTER_API_KEY) return new NoAiProvider();
  return new OpenRouterProvider(env.OPENROUTER_API_KEY, 'openrouter/free');
}
