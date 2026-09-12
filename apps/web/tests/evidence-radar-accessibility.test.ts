import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Evidence Radar Visual Accessibility & Keyboard Navigation', () => {
  const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
  const fileContent = fs.readFileSync(radarPath, 'utf8');

  it('ensures source details have semantic keyboard controls', () => {
    expect(fileContent).toContain('<button');
    expect(fileContent).toContain('aria-pressed=');
    expect(fileContent).toContain('aria-label="Monitored official sources"');
    expect(fileContent).toContain('aria-hidden="true"');
  });

  it('keeps the visual SVG separate from keyboard controls', () => {
    expect(fileContent).not.toContain('role="button"');
    expect(fileContent).not.toContain('tabIndex={0}');
  });

  it('ensures visible focus indication on nodes', () => {
    expect(fileContent).toContain('public-focus');
    expect(fileContent).toContain('strokeDasharray="3 3"');
  });

  it('keeps spotlight details persistently readable instead of exposing a fake close action', () => {
    expect(fileContent).toContain('role="region"');
    expect(fileContent).toContain('aria-live="polite"');
    expect(fileContent).not.toContain('aria-label="Close authority inspector"');
    expect(fileContent).not.toContain('title="Reset source spotlight"');
  });

  it('ensures Escape key restores the default spotlight', () => {
    expect(fileContent).toContain("event.key === 'Escape'");
    expect(fileContent).toContain('setSelectedNode(DEFAULT_NODE)');
  });

  it('opens with a truthful source spotlight so the instrument does not read as decorative', () => {
    expect(fileContent).toContain('Source spotlight');
    expect(fileContent).toContain('const DEFAULT_NODE = MONITORED_NODES[1]!');
    expect(fileContent).toContain('This is not a live activity feed');
  });

  it('uses dedicated tablet-safe desktop and mobile source presentations from one monitored-source model', () => {
    expect(fileContent).toContain('data-ui="radar-desktop"');
    expect(fileContent).toContain('data-ui="radar-mobile"');
    expect(fileContent).toContain('hidden md:grid');
    expect(fileContent).toContain('md:hidden');
    expect(fileContent).toContain('role="group"');
    expect(fileContent).toContain('min-h-[44px]');
    expect(fileContent.match(/MONITORED_NODES\.map/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('uses differentiated authority accents without changing the supported source set', () => {
    expect(fileContent).toContain("accent: '#F5B940'");
    expect(fileContent).toContain("accent: '#0F8B8D'");
    expect(fileContent).toContain("accent: '#3B82F6'");
  });
});
