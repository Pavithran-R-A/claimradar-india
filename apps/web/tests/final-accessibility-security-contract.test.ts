import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (...parts: string[]) =>
  fs.readFileSync(path.resolve(__dirname, '..', ...parts), 'utf8');

describe('Final accessibility and security contracts', () => {
  it('uses an AA-safe muted text token on light surfaces', () => {
    expect(read('app', 'globals.css')).toContain('--c-text-muted: 93 101 112;');
  });

  it('keeps the visible logo name as its accessible name', () => {
    const brand = read('components', 'layout', 'brand-mark.tsx');
    expect(brand).not.toContain('aria-label="ClaimRadar India — Homepage"');
    expect(brand).toContain('ClaimRadar');
    expect(brand).toContain('India');
  });

  it('keeps the evidence flow heading hierarchy sequential', () => {
    const flow = read('components', 'landing', 'evidence-flow-diagram.tsx');
    expect(flow).not.toContain('<h4');
    expect(flow).toContain('<h3');
  });

  it('keeps footer disclosure text readable on dark ink', () => {
    const footer = read('components', 'layout', 'footer.tsx');
    expect(footer).toContain('text-slate-300');
    expect(footer).toContain('text-white');
  });

  it('keeps hero suggestion controls at least 24 by 24 CSS pixels', () => {
    const search = read('components', 'landing', 'interactive-hero-search.tsx');
    expect(search).toContain('min-h-[24px]');
    expect(search).toContain('min-w-[24px]');
  });

  it('uses request nonces without script unsafe-inline', () => {
    const nextConfig = fs.readFileSync(path.resolve(__dirname, '../next.config.ts'), 'utf8');
    const middleware = fs.readFileSync(path.resolve(__dirname, '../middleware.ts'), 'utf8');
    const rootLayout = fs.readFileSync(path.resolve(__dirname, '../app/layout.tsx'), 'utf8');

    expect(nextConfig).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(middleware).toContain("'nonce-");
    expect(middleware).toContain("requestHeaders.set('x-nonce'");
    expect(rootLayout).toContain("export const dynamic = 'force-dynamic';");
  });
});
