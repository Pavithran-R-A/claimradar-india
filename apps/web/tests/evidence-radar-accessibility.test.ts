import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Evidence Radar Visual Accessibility & Motion', () => {
  const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
  const cssPath = path.resolve(__dirname, '../app/globals.css');
  const fileContent = fs.readFileSync(radarPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('uses semantic keyboard controls for every monitored source', () => {
    expect(fileContent).toContain('<button');
    expect(fileContent).toContain('aria-pressed=');
    expect(fileContent).toContain('aria-label="Monitored official sources"');
    expect(fileContent).toContain('aria-hidden="true"');
  });

  it('keeps the visual SVG separate from keyboard controls', () => {
    expect(fileContent).not.toContain('role="button"');
    expect(fileContent).not.toContain('tabIndex={0}');
  });

  it('uses a dedicated SVG rotor with an explicit SVG transform box', () => {
    expect(fileContent).toContain('data-ui="radar-rotor"');
    expect(fileContent).toContain('radar-sweep-rotor');
    expect(cssContent).toContain('.radar-sweep-rotor');
    expect(cssContent).toContain('transform-box: view-box');
    expect(cssContent).toContain('animation: radar-sweep');
  });

  it('keeps the moving radar visually meaningful without claiming live crawl state', () => {
    expect(fileContent).toContain('Now highlighting');
    expect(fileContent).toContain('Animated source overview');
    expect(fileContent).not.toContain('This is not a live activity feed');
    expect(fileContent).toContain('data-ui="radar-status"');
  });

  it('respects reduced-motion preferences while allowing the full animation otherwise', () => {
    expect(fileContent).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('.radar-sweep-rotor');
    expect(cssContent).toContain('.radar-status-progress');
  });

  it('ensures Escape key restores the default spotlight', () => {
    expect(fileContent).toContain("event.key === 'Escape'");
    expect(fileContent).toContain('DEFAULT_NODE_INDEX');
  });

  it('keeps the full radar-plus-status layout for wide screens only and preserves the radar on narrower screens', () => {
    expect(fileContent).toContain('data-ui="radar-desktop"');
    expect(fileContent).toContain('data-ui="radar-mobile"');
    expect(fileContent).toContain('hidden xl:grid');
    expect(fileContent).toContain('xl:hidden');
    expect(fileContent.match(/<RadarCanvas/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('uses differentiated authority accents without changing the supported source set', () => {
    expect(fileContent).toContain("accent: '#F5B940'");
    expect(fileContent).toContain("accent: '#0F8B8D'");
    expect(fileContent).toContain("accent: '#3B82F6'");
  });
});
