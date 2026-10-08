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
  it('uses a deliberate reference-width hero composition and bounded editorial annotation', () => {
    expect(page).toContain('data-ui="hero-grid"');
    expect(page).toContain('data-ui="hero-annotation"');
    expect(page).toContain('max-w-[1760px]');
    expect(page).toContain('xl:items-start');
    expect(page).toContain('Scanning official sources for you');
    expect(page).not.toContain('absolute -right-2 -top-8');
  });

  it('keeps the editorial headline compact enough to preserve the approved desktop density', () => {
    expect(page).toContain('2xl:whitespace-nowrap');
    expect(page).toContain('2xl:text-[4.1rem]');
  });

  it('keeps search as the primary hero action and stacks safely on narrow screens', () => {
    expect(search).toContain('aria-label="Search ClaimKhoj opportunities"');
    expect(search).toContain('data-ui="hero-search"');
    expect(search).toContain('min-h-[48px]');
    expect(search).toContain('Search refunds, claims, schemes or your situation');
  });

  it('provides dedicated mobile and desktop radar presentations', () => {
    expect(radar).toContain('data-ui="radar-desktop"');
    expect(radar).toContain('data-ui="radar-mobile"');
  });

  it('uses the wider public navigation shell visible in the approved reference', () => {
    expect(header).toContain('max-w-[1760px]');
    expect(footer).toContain('max-w-[1760px]');
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

  it('keeps journey editorial notes in normal flow so they cannot collide with stage labels', () => {
    expect(page).toContain('data-ui="journey-notes"');
    expect(page).not.toContain('absolute left-1 top-5 hidden font-display');
    expect(page).not.toContain('absolute right-1 top-5 hidden font-display');
  });

  it('authors the desktop rail through the four checkpoint centers in the rendered layout', () => {
    expect(page).toContain('const JOURNEY_RAIL_PATH');
    expect(page).toContain('data-ui="journey-rail-path"');
    expect(page).toContain('125 14');
    expect(page).toContain('375 14');
    expect(page).toContain('625 14');
    expect(page).toContain('875 14');
    expect(page).toContain('lg:min-h-7');
    expect(page).toContain('absolute left-0 top-11 hidden h-10 w-full lg:block');
    expect(page).not.toContain('absolute left-0 top-8 hidden h-10 w-full lg:block');
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
