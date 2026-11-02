import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SOURCES } from '../components/landing/monitored-sources-network';
import { publicSourceFamilies } from '@claimradar/source-registry';

const landingPath = path.resolve(__dirname, '../app/(public)/page.tsx');
const editorialPath = path.resolve(__dirname, '../components/landing/editorial-principles.tsx');
const sourcesPath = path.resolve(__dirname, '../components/landing/monitored-sources-network.tsx');
const sourcePagePath = path.resolve(__dirname, '../app/(public)/sources/page.tsx');
const howItWorksPath = path.resolve(__dirname, '../app/(public)/how-it-works/page.tsx');
const methodologyPath = path.resolve(__dirname, '../app/(public)/methodology/page.tsx');
const heroSearchPath = path.resolve(__dirname, '../components/landing/interactive-hero-search.tsx');

const read = (filePath: string) => fs.readFileSync(filePath, 'utf8');

describe('truthful public copy contracts', () => {
  it('keeps the monitored-source network bounded to configured public families', () => {
    expect(SOURCES.map((source) => source.code)).toEqual(
      publicSourceFamilies.map((source) => source.shortName),
    );
    expect(SOURCES.every((source) => source.officialPortal === `https://${source.domain}`)).toBe(
      true,
    );
    expect(SOURCES.every((source) => !('frequency' in source))).toBe(true);
  });

  it('keeps landing copy search-first and source-bounded', () => {
    const page = read(landingPath).replace(/\s+/g, ' ');
    const search = read(heroSearchPath).replace(/\s+/g, ' ');

    expect(page).toContain('Find what&apos;s rightfully yours.');
    expect(page).toContain('checks official sources for refunds, benefits, compensation');
    expect(search).toContain('Search refunds, claims, schemes or your situation');
    expect(page).toContain('Latest opportunities');

    for (const unsupportedClaim of [
      'government gazettes',
      'court orders',
      'tribunal orders',
      'state authorities',
      'company submission portal',
      'ClaimKhoj does not file claims or promise payouts.',
    ]) {
      expect(page).not.toContain(unsupportedClaim);
    }
  });

  it('keeps editorial principles focused on public-benefit finance', () => {
    const editorial = read(editorialPath).replace(/\s+/g, ' ');
    const sources = read(sourcesPath).replace(/\s+/g, ' ');

    expect(editorial).toContain('Public financial notices');
    expect(editorial).toContain('configured official source families');
    expect(editorial).toContain('official route named in the source record');
    expect(sources).toContain('Coverage settings are listed with each source.');
    expect(sources).not.toMatch(/\b(?:every|each)\s+\d+\s+(?:minutes|hours|days)\b/i);

    for (const unsupportedClaim of [
      'AI-hallucinated',
      'court orders',
      'government or company submission portal',
      'tribunal settlements',
      'Gazette Feeds',
      'Financial Penalty Distributions',
    ]) {
      expect(editorial + sources).not.toContain(unsupportedClaim);
    }
  });

  it('keeps supporting pages aligned with the configured source scope', () => {
    const supportingCopy = [sourcePagePath, howItWorksPath, methodologyPath]
      .map(read)
      .join(' ')
      .replace(/\s+/g, ' ');

    expect(supportingCopy).toContain('configured public source');
    expect(supportingCopy).not.toContain('authenticated public channels');
    expect(supportingCopy).not.toContain('courts, and gazette releases daily');
  });
});
