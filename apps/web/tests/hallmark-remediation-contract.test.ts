import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('ClaimKhoj remediation regressions', () => {
  it('keeps the evidence journey visible before JavaScript runs', () => {
    const journey = read('../components/landing/evidence-flow-diagram.tsx');

    expect(journey).not.toContain('opacity-0');
    expect(journey).not.toContain('new IntersectionObserver');
  });

  it('submits a valid directory search without JavaScript', () => {
    const search = read('../components/landing/interactive-hero-search.tsx');

    expect(search).toContain('action="/claimables"');
    expect(search).toContain('method="get"');
    expect(search).toContain('name="search"');
  });

  it('keeps reduced-motion users out of radar rotation and timed changes', () => {
    const radar = read('../components/landing/evidence-radar-visual.tsx');

    expect(radar).toContain('prefers-reduced-motion: reduce');
    expect(radar).toContain('const motionEnabled = radarRunning && !prefersReducedMotion;');
    expect(radar).toContain('if (!motionEnabled) return undefined;');
  });

  it('removes broad transitions from shared controls', () => {
    const paths = [
      '../components/layout/header.tsx',
      '../components/landing/interactive-hero-search.tsx',
      '../components/directory/claimable-card.tsx',
      '../components/directory/status-badge.tsx',
      '../components/motion/reveal.tsx',
      '../../../packages/design-system/src/index.tsx',
    ];

    for (const path of paths) {
      expect(read(path)).not.toContain('transition-all');
    }
  });

  it('provides a keyboard focus loop inside the mobile navigation dialog', () => {
    const header = read('../components/layout/header.tsx');

    expect(header).toContain("event.key !== 'Tab'");
    expect(header).toContain('firstFocusable');
    expect(header).toContain('lastFocusable');
  });

  it('gives every claim detail section a real heading id', () => {
    const page = read('../app/(public)/claimables/[slug]/page.tsx');

    for (const id of [
      'who-qualifies',
      'relief',
      'proof',
      'action-route',
      'sources',
      'verification',
      'related',
    ]) {
      expect(page).toContain(`aria-labelledby="${id}"`);
      expect(page).toContain(`id="${id}"`);
    }
  });

  it('does not present a database update date as a verification date', () => {
    const repository = read('../lib/claimables-repository.ts');
    const detail = read('../app/(public)/claimables/[slug]/page.tsx');

    expect(repository).not.toContain('last_verified_at ?? row.updated_at');
    expect(repository).toContain('lastVerifiedAt: row.last_verified_at');
    expect(detail).toContain('Verification date unavailable');
  });

  it('does not label an unknown claim status as open', () => {
    const badge = read('../components/directory/status-badge.tsx');

    expect(badge).toContain('Status unavailable');
    expect(badge).not.toContain('STATUS_CONFIGS[status] ?? STATUS_CONFIGS.open');
  });

  it('does not promise unavailable customer email alerts', () => {
    const states = read('../components/repository-states.tsx');
    const deadlines = read('../app/(public)/deadlines/page.tsx');
    const privacy = read('../app/(public)/privacy/page.tsx');

    expect(states).not.toMatch(/set up email alert/i);
    expect(deadlines).not.toMatch(/get deadline reminders/i);
    expect(privacy).not.toMatch(/send you alerts about opportunities matching your watchlist/i);
  });

  it('uses the directory route for the new-record CTA', () => {
    const page = read('../app/(public)/new/page.tsx');

    expect(page).toContain('href="/claimables"');
    expect(page).not.toContain('href="/register"');
  });

  it('derives public regions from the full onboarding list', () => {
    const repository = read('../lib/claimables-repository.ts');
    const constants = read('../lib/constants.ts');

    expect(repository).toContain('INDIAN_STATES as INDIAN_STATE_NAMES');
    expect(constants).toContain("'Arunachal Pradesh'");
    expect(constants).toContain("'Ladakh'");
  });

  it('does not promise a fixed crawl cadence', () => {
    const network = read('../components/landing/monitored-sources-network.tsx');

    expect(network).not.toMatch(/every 6 hours|six hours/i);
    expect(network).not.toMatch(/Ingestion Cadence/i);
  });

  it('announces headings on auth entry screens', () => {
    const pages = [
      '../app/(auth)/login/login-form.tsx',
      '../app/(auth)/register/page.tsx',
      '../app/(auth)/forgot-password/forgot-password-form.tsx',
      '../app/(auth)/reset-password/reset-password-form.tsx',
      '../app/(auth)/verify-email/page.tsx',
    ];

    for (const pagePath of pages) {
      expect(read(pagePath)).toContain('<h1');
    }
  });

  it('does not claim an email was sent on direct verification visits', () => {
    const page = read('../app/(auth)/verify-email/page.tsx');

    expect(page).toContain('If you just registered');
    expect(page).not.toContain("We've sent you a verification link");
  });

  it('keeps reset link outages separate from invalid sessions', () => {
    const page = read('../app/(auth)/reset-password/page.tsx');

    expect(page).toContain('sessionCheckUnavailable');
    expect(page).not.toContain('invalid or has expired');
  });
});
