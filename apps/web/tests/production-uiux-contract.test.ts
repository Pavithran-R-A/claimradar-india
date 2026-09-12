import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

const page = read('../app/(public)/page.tsx');
const publicLayout = read('../app/(public)/layout.tsx');
const header = read('../components/layout/header.tsx');
const footer = read('../components/layout/footer.tsx');
const search = read('../components/landing/interactive-hero-search.tsx');
const radar = read('../components/landing/evidence-radar-visual.tsx');
const css = read('../app/globals.css');

describe('ClaimKhoj production UI/UX contract', () => {
  it('uses a deliberate hero composition and bounded editorial annotation', () => {
    expect(page).toContain('data-ui="hero-grid"');
    expect(page).toContain('data-ui="hero-annotation"');
    expect(page).not.toContain('absolute -right-2 -top-8');
  });

  it('keeps search as the primary hero action and stacks safely on narrow screens', () => {
    expect(search).toContain('aria-label="Search ClaimKhoj opportunities"');
    expect(search).toContain('data-ui="hero-search"');
    expect(search).toContain('min-h-[48px]');
  });

  it('provides dedicated mobile and desktop radar presentations', () => {
    expect(radar).toContain('data-ui="radar-desktop"');
    expect(radar).toContain('data-ui="radar-mobile"');
  });

  it('uses consistent public shell focus and target treatment', () => {
    expect(header).toContain('min-h-[44px]');
    expect(footer).toContain('focus-visible:');
    expect(css).toContain('--public-radius-card');
    expect(css).toContain('--public-shadow-card');
  });

  it('exposes a responsive journey that is not desktop-only decoration', () => {
    expect(page).toContain('data-ui="claim-journey"');
    expect(page).toContain('sm:grid-cols-2');
    expect(page).toContain('lg:grid-cols-4');
  });

  it('keeps exactly one public main landmark and points the skip link to it', () => {
    expect(publicLayout).toContain('<main id="main-content"');
    expect(header).toContain('href="#main-content"');
    expect(page).not.toContain('<main');
    expect(page).not.toContain('id="main-content"');
  });

  it('keeps section aria labels attached to real heading elements', () => {
    expect(page).toContain('id="latest-opportunities-heading"');
    expect(page).toContain('id="how-it-works-heading"');
    expect(page).toContain('id={id}');
  });
});
