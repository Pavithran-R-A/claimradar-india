import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Visual Composition & SVG Integrity Regressions', () => {
  const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
  const radarSource = fs.readFileSync(radarPath, 'utf8');

  it('A. EvidenceRadarVisual explicitly paints its atmosphere without black SVG defaults', () => {
    const atmosphere = radarSource.split('data-ui="radar-atmosphere">')[1]?.split('</g>')[0];
    expect(atmosphere).toBeDefined();
    expect(atmosphere).toContain('fill="#FCFEFF"');
    expect(atmosphere).toContain('stroke="#8DB4D1"');
    expect(radarSource).not.toContain('fill="black"');
  });

  it('B. Radar outer container does not use aspect-square geometry', () => {
    // The outer instrument card must NOT be aspect-square
    expect(radarSource).not.toMatch(/className=[^>]*max-w-\[[^>]*\] aspect-square/);
    // The inner canvas wrapper must be aspect-square
    expect(radarSource).toContain('aspect-square w-full');
  });

  it('C. Homepage process stage area uses responsive horizontal journey', () => {
    const flowPath = path.resolve(__dirname, '../components/landing/evidence-flow-diagram.tsx');
    const flowSource = fs.readFileSync(flowPath, 'utf8');

    expect(flowSource).toContain('sm:grid-cols-4');
    expect(flowSource).toContain('prefers-reduced-motion: reduce');
  });

  it('D. Monitored sources network provides dedicated mobile layout without table scrolling', () => {
    const sourcesPath = path.resolve(
      __dirname,
      '../components/landing/monitored-sources-network.tsx',
    );
    const sourcesSource = fs.readFileSync(sourcesPath, 'utf8');

    // Mobile layout must exist (sm:hidden)
    expect(sourcesSource).toContain('sm:hidden');
    // Desktop table must be hidden on mobile (hidden sm:block)
    expect(sourcesSource).toContain('hidden sm:block');
  });

  it('E. Reduced motion directives remain enforced on radar and flow diagram', () => {
    const cssPath = path.resolve(__dirname, '../app/globals.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.animate-detection-blip,');
    expect(css).toContain('animation: none !important;');
    const flowPath = path.resolve(__dirname, '../components/landing/evidence-flow-diagram.tsx');
    const flowSource = fs.readFileSync(flowPath, 'utf8');
    expect(flowSource).toContain('prefers-reduced-motion: reduce');
    expect(flowSource).toContain('translate-y-0 opacity-100');
  });
});
