import { describe, expect, it } from 'vitest';
import {
  RUNTIME_SENSITIVE_PATHS,
  checkRuntimeIntegrity,
} from '../../../scripts/summarize-soak-readiness.mjs';
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
    const middleware = fs.readFileSync(path.resolve(__dirname, '../middleware.ts'), 'utf8');

    expect(nextConfig).not.toContain("key: 'Content-Security-Policy'");
    expect(middleware).toContain("frame-ancestors 'none'");
    expect(middleware).toContain("base-uri 'self'");
    expect(middleware).toContain("form-action 'self'");
    expect(middleware).toContain("object-src 'none'");
    expect(middleware).toContain("'nonce-");
  });

  it('detects the intentional runtime repair against the old freeze', () => {
    const integrity = checkRuntimeIntegrity('f7a77ee0349078a0dfbe8649d77683feb89e6470', 'HEAD');

    expect(integrity.runtimeBehaviorChanged).toBe(true);
    expect(integrity.changedFiles).toContain('apps/crawler/src/pipeline/db-writer.ts');
  });
});
