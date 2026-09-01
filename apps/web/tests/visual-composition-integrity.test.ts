import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Visual Composition & SVG Integrity Regressions', () => {
  const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
  const radarSource = fs.readFileSync(radarPath, 'utf8');

  it('A. EvidenceRadarVisual range circles explicitly declare fill="none" (no black SVG disc)', () => {
    // Look for circles that have stroke but no fill
    const circleTags = radarSource.match(/<circle[\s\S]*?\/>/g) || [];
    expect(circleTags.length).toBeGreaterThan(0);

    for (const tag of circleTags) {
      if (
        tag.includes('stroke=') &&
        !tag.includes('fill="#FFFFFF"') &&
        !tag.includes('fill="#15171A"') &&
        !tag.includes('fill="#214E80"') &&
        !tag.includes('fill={') &&
        !tag.includes('fill="rgba')
      ) {
        expect(tag).toContain('fill="none"');
      }
    }
  });

  it('B. Radar outer container does not use aspect-square geometry', () => {
    // The outer instrument card must NOT be aspect-square
    expect(radarSource).not.toMatch(/className=[^>]*max-w-\[[^>]*\] aspect-square/);
    // The inner canvas wrapper must be aspect-square
    expect(radarSource).toContain('aspect-square w-full');
  });

  it('C. Methodology desktop stage area uses vertical timeline instead of 4 skinny columns', () => {
    const flowPath = path.resolve(__dirname, '../components/landing/evidence-flow-diagram.tsx');
    const flowSource = fs.readFileSync(flowPath, 'utf8');

    // Must not use lg:grid-cols-4 or grid-cols-4
    expect(flowSource).not.toContain('lg:grid-cols-4');
    expect(flowSource).not.toContain('grid-cols-4');
    // Must use vertical editorial timeline structure
    expect(flowSource).toContain('relative pl-7 sm:pl-8');
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
    expect(radarSource).toContain('motion-reduce:!animate-none');
    const flowPath = path.resolve(__dirname, '../components/landing/evidence-flow-diagram.tsx');
    const flowSource = fs.readFileSync(flowPath, 'utf8');
    expect(flowSource).toContain('prefers-reduced-motion: reduce');
    expect(flowSource).toContain('motion-reduce:!opacity-100');
  });
});
