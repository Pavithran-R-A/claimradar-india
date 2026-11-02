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
    expect(flowSource).not.toContain('opacity-0');
    expect(flowSource).not.toContain('IntersectionObserver');
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

  it('E. Motion respects user preferences and flow stays visible', () => {
    const cssPath = path.resolve(__dirname, '../app/globals.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.animate-detection-blip,');
    expect(css).toContain('animation: none !important;');
    const flowPath = path.resolve(__dirname, '../components/landing/evidence-flow-diagram.tsx');
    const flowSource = fs.readFileSync(flowPath, 'utf8');
    expect(radarSource).toContain('prefers-reduced-motion: reduce');
    expect(flowSource).not.toContain('opacity-0');
  });

  it('F. Homepage hero stays concise and fills desktop first viewport', () => {
    const homePath = path.resolve(__dirname, '../app/(public)/page.tsx');
    const homeSource = fs.readFileSync(homePath, 'utf8');
    const hero = homeSource.split('<section aria-labelledby="home-hero-heading"')[1]?.split('</section>')[0];

    expect(hero).toBeDefined();
    expect(hero).toContain('xl:min-h-[calc(100svh-4.5rem)]');
    expect(hero).toContain('xl:items-center');
    expect(hero).toContain('Search official sources for refunds, benefits, and compensation.');
    expect(hero).not.toContain('Official sources</strong>');
    expect(hero).not.toContain('data-ui="claim-journey"');
    expect(homeSource).not.toContain('data-ui="claim-journey"');
    expect(homeSource).not.toContain('EvidenceFlowDiagram');
    expect(homeSource).toContain('title="No opportunities yet"');
    expect(homeSource).toContain('showProcess={false}');
    expect(fs.readFileSync(path.resolve(__dirname, '../components/repository-states.tsx'), 'utf8')).toContain('showProcess = true');
  });

  it('G. Hero search chips meet 44px target height', () => {
    const searchPath = path.resolve(__dirname, '../components/landing/interactive-hero-search.tsx');
    const searchSource = fs.readFileSync(searchPath, 'utf8');

    expect(searchSource.match(/min-h-\[44px\]/g)).toHaveLength(1);
    expect(searchSource).not.toContain('min-h-[36px]');
    expect(searchSource).toContain('role="group"');
    expect(searchSource).toContain('aria-label="Search ClaimKhoj opportunities"');
  });

  it('H. Source spotlight groups its content and keeps controls reachable', () => {
    expect(radarSource).toContain('role="group"');
    expect(radarSource).not.toContain('role="region"');
    expect(radarSource).toContain('min-h-[44px]');
    expect(radarSource).not.toContain('min-h-[32px]');
  });
});
