import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Evidence Radar Visual Accessibility & Keyboard Navigation', () => {
  const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
  const fileContent = fs.readFileSync(radarPath, 'utf8');

  it('ensures all interactive authority nodes have semantic button roles and keyboard tab index', () => {
    expect(fileContent).toContain('role="button"');
    expect(fileContent).toContain('tabIndex={0}');
    expect(fileContent).toContain('aria-label=');
    expect(fileContent).toContain('aria-expanded=');
  });

  it('ensures keyboard activation via Enter and Space keys', () => {
    expect(fileContent).toContain("e.key === 'Enter'");
    expect(fileContent).toContain("e.key === ' '");
    expect(fileContent).toContain('e.preventDefault()');
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
