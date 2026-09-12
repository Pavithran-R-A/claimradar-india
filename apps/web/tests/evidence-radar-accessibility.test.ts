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

  it('uses native SVG animation so rotation does not depend on CSS SVG transform behavior', () => {
    expect(fileContent).toContain('data-ui="radar-rotor"');
    expect(fileContent).toContain('<animateTransform');
    expect(fileContent).toContain('type="rotate"');
    expect(fileContent).toContain('from="0 260 260"');
    expect(fileContent).toContain('to="360 260 260"');
    expect(fileContent).toContain('repeatCount="indefinite"');
    expect(fileContent).not.toContain('className="radar-sweep-rotor"');
  });

  it('keeps the moving radar visually meaningful without claiming live crawl state', () => {
    expect(fileContent).toContain('Now highlighting');
    expect(fileContent).toContain('Animated source overview');
    expect(fileContent).toContain('data-ui="radar-status"');
    expect(fileContent).toContain('Visual scan, not live crawl status');
  });

  it('provides an explicit pause and resume control for continuous scan motion', () => {
    expect(fileContent).toContain('radarRunning');
    expect(fileContent).toContain('Pause radar animation');
    expect(fileContent).toContain('Resume radar animation');
    expect(fileContent).toContain('aria-pressed={!radarRunning}');
  });

  it('keeps reduced-motion handling for nonessential CSS effects', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('.animate-detection-blip');
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

  it('keeps decorative radar depth behind the ClaimKhoj hub so the brand icon stays unobstructed', () => {
    const atmosphere = fileContent.indexOf('data-ui="radar-atmosphere"');
    const hub = fileContent.indexOf('data-ui="radar-hub"');
    expect(atmosphere).toBeGreaterThan(-1);
    expect(hub).toBeGreaterThan(atmosphere);
    expect(fileContent).not.toContain('left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright');
  });

  it('adds selected-source depth without covering the interactive source buttons', () => {
    expect(fileContent).toContain('<radialGradient');
    expect(fileContent).toContain('data-ui="radar-selected-halo"');
    expect(fileContent).toContain('role="group" aria-label="Monitored official sources"');
  });
});
