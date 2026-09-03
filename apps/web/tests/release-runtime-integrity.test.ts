import { describe, expect, it } from 'vitest';
import { RUNTIME_SENSITIVE_PATHS } from '../../../scripts/summarize-soak-readiness.mjs';
import fs from 'node:fs';
import path from 'node:path';

describe('release runtime integrity coverage', () => {
  it('treats frontend runtime surfaces as soak-sensitive', () => {
    expect(RUNTIME_SENSITIVE_PATHS).toContain('apps/web/**');
    expect(RUNTIME_SENSITIVE_PATHS).toContain('packages/design-system/**');
    expect(RUNTIME_SENSITIVE_PATHS).toContain('.github/workflows/daily-crawl.yml');
  });

  it('declares browser security boundaries in the Next.js headers', () => {
    const nextConfig = fs.readFileSync(path.resolve(__dirname, '../next.config.ts'), 'utf8');

    expect(nextConfig).toContain("key: 'Content-Security-Policy'");
    expect(nextConfig).toContain("frame-ancestors 'none'");
    expect(nextConfig).toContain("base-uri 'self'");
    expect(nextConfig).toContain("form-action 'self'");
    expect(nextConfig).toContain("object-src 'none'");
  });
});
