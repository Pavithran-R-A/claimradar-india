import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

describe('Customer-facing UI release guardrails', () => {
  it('provides card padding but allows explicit zero-padding containers', () => {
    const system = source('../../../packages/design-system/src/index.tsx');
    expect(system).toContain('rounded-lg border p-5 transition-all duration-fast');
    const listPage = source('../app/app/matches/page.tsx');
    expect(listPage).toContain('className="p-0"');
  });

  it('never advertises unavailable paid checkout or prices to the public', () => {
    const pricing = source('../app/(public)/pricing/page.tsx');
    expect(pricing).toContain('ClaimKhoj is free during beta');
    expect(pricing).not.toMatch(/₹149|₹299|Upgrade to Plus|mock preview/i);
    expect(pricing).toContain('Paid subscriptions, checkout');
    const billing = source('../app/app/billing/page.tsx');
    expect(billing).not.toContain('NEXT_PUBLIC_ENABLE_BILLING is false');
    expect(billing).toContain("plan.tier === 'free'");
  });

  it('uses compact responsive dashboard breakpoints and laptop smoke widths', () => {
    expect(source('../app/app/page.tsx')).toContain('lg:grid-cols-3 xl:grid-cols-5');
    const smoke = source('../../../scripts/ci-browser-smoke.mjs');
    for (const width of [360, 390, 414, 768, 1024, 1280, 1366, 1536, 1920]) {
      expect(smoke).toContain('width: ' + width);
    }
  });

  it('does not expose internal Next.js metadata deprecation warnings', () => {
    const layout = source('../app/layout.tsx');
    expect(layout).toContain('export const viewport: Viewport');
    expect(layout).not.toMatch(/metadata:[\s\S]*themeColor:/);
  });
});
