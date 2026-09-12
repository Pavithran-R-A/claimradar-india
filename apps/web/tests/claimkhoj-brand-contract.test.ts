import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { brandConfig } from '@claimradar/config';

const webRoot = path.resolve(__dirname, '..');

describe('ClaimKhoj provisional identity contract', () => {
  it('keeps the provisional name and positioning centralized', () => {
    expect(brandConfig.siteName).toBe('ClaimKhoj');
    expect(brandConfig.shortName).toBe('ClaimKhoj');
    expect(brandConfig.isProvisional).toBe(true);
    expect(brandConfig.tagline).toContain('refunds');
    expect(brandConfig.tagline).toContain('claims');
  });

  it('ships light, dark, and standalone identity surfaces', () => {
    for (const asset of [
      'app/icon.svg',
      'app/apple-icon.svg',
      'app/manifest.ts',
      'app/opengraph-image.tsx',
    ]) {
      expect(fs.existsSync(path.join(webRoot, asset))).toBe(true);
    }

    const mark = fs.readFileSync(path.join(webRoot, 'app/icon.svg'), 'utf8');
    expect(mark).toContain('#0D2148');
    expect(mark).toContain('#0F8B8D');
    expect(mark).toContain('#F4A62A');
    expect(mark).not.toContain('radar');
  });

  it('keeps trademark clearance explicitly pending', () => {
    const checkpoint = fs.readFileSync(
      path.resolve(webRoot, '../../docs/checkpoints/brand-motion-remediation.md'),
      'utf8',
    );
    expect(checkpoint).toContain('IP India official wordmark **and phonetic** search');
  });
});
