import { describe, expect, it } from 'vitest';
import { RUNTIME_SENSITIVE_PATHS } from '../../../scripts/summarize-soak-readiness.mjs';

describe('release runtime integrity coverage', () => {
  it('treats frontend runtime surfaces as soak-sensitive', () => {
    expect(RUNTIME_SENSITIVE_PATHS).toContain('apps/web/**');
    expect(RUNTIME_SENSITIVE_PATHS).toContain('packages/design-system/**');
  });
});
