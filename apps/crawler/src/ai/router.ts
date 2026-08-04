import type { AIProvider } from './types.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { NvidiaNimProvider } from './providers/nvidia.js';
import { NoAiProvider } from './providers/noai.js';

interface RouterEnv {
  AI_PROVIDER: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_BASE_URL?: string;
  NVIDIA_MODEL?: string;
}

export function createProviderRouter(env: RouterEnv): AIProvider {
  const providers: AIProvider[] = [];

  // Build primary provider based on env.AI_PROVIDER
  if (env.AI_PROVIDER === 'openrouter' && env.OPENROUTER_API_KEY) {
    providers.push(
      new OpenRouterProvider(
        env.OPENROUTER_API_KEY,
        env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct',
      ),
    );
  } else if (env.AI_PROVIDER === 'nvidia' && env.NVIDIA_API_KEY) {
    providers.push(
      new NvidiaNimProvider(
        env.NVIDIA_API_KEY,
        env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct',
        env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com',
      ),
    );
  }

  // Add fallback providers (any other configured provider)
  if (env.AI_PROVIDER !== 'openrouter' && env.OPENROUTER_API_KEY) {
    providers.push(
      new OpenRouterProvider(
        env.OPENROUTER_API_KEY,
        env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.1-70b-instruct',
      ),
    );
  }
  if (env.AI_PROVIDER !== 'nvidia' && env.NVIDIA_API_KEY) {
    providers.push(
      new NvidiaNimProvider(
        env.NVIDIA_API_KEY,
        env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct',
        env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com',
      ),
    );
  }

  // Find first available provider
  const primary = providers.find((p) => p.isAvailable());
  if (primary) return primary;

  // No provider configured — return no-op fallback
  return new NoAiProvider();
}
