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
    expect(fileContent).toContain('group-focus-visible:opacity-100');
    expect(fileContent).toContain('strokeDasharray="3 3"');
  });

  it('ensures drawer overlay has region role, live region announcement, and accessible close button', () => {
    expect(fileContent).toContain('role="region"');
    expect(fileContent).toContain('aria-live="polite"');
    expect(fileContent).toContain('aria-label="Close authority inspector"');
  });

  it('ensures Escape key closes the inspector drawer', () => {
    expect(fileContent).toContain("e.key === 'Escape'");
  });

  it('opens with a truthful source spotlight so the instrument does not read as decorative', () => {
    expect(fileContent).toContain('SOURCE SPOTLIGHT');
    expect(fileContent).toContain('MONITORED_NODES[1] ?? null');
    expect(fileContent).toContain('This is not a live activity feed');
  });

  it('uses differentiated authority accents without changing the supported source set', () => {
    expect(fileContent).toContain("accent: '#F5B940'");
    expect(fileContent).toContain("accent: '#0F8B8D'");
    expect(fileContent).toContain("accent: '#3B82F6'");
  });
});
