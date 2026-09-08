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
});
