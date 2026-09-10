import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

describe('UI perfection contracts', () => {
  it('keeps the homepage trust hierarchy explicit', () => {
    const source = read('app/(public)/page.tsx');

    expect(source).toContain('Public records, made useful');
    expect(source).toContain('Official links');
    expect(source).toContain('Human review');
    expect(source).toContain('No filing fees');
  });

  it('keeps the truthful empty directory editorial rather than card-heavy', () => {
    const source = read('components/repository-states.tsx');

    expect(source).toContain('<ol className="relative space-y-4 border-l-2');
    expect(source).toContain('How a notice becomes a listing');
    expect(source).not.toContain('grid gap-3 sm:grid-cols-2');
  });

  it('keeps shared navigation motion and focus states bounded', () => {
    const header = read('components/layout/header.tsx');
    const sidebar = read('components/app/sidebar.tsx');
    const styles = read('app/globals.css');

    expect(header).toContain('focus-visible:ring-2');
    expect(sidebar).toContain("aria-current={active ? 'page' : undefined}");
    expect(sidebar).toContain('border-trust-primary');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
