import { describe, it, expect } from 'vitest';
import { publicSourceFamilies, initialSources } from '@claimradar/source-registry';
import fs from 'fs';
import path from 'path';

describe('Frontend Truth Integrity & Source Registry Parity', () => {
  it('ensures all public source families are backed by real source definitions', () => {
    expect(publicSourceFamilies.length).toBeGreaterThan(0);

    const initialSourceIds = new Set(initialSources.map((s) => s.id));

    for (const family of publicSourceFamilies) {
      expect(family.id).toBeTruthy();
      expect(family.name).toBeTruthy();
      expect(family.shortName).toBeTruthy();
      expect(family.domain).toBeTruthy();
      expect(family.scope).toBeTruthy();
      expect(family.sourceIds.length).toBeGreaterThan(0);

      // At least one sourceId in each family must be in initialSources or valid configured sources
      const hasConfiguredSource = family.sourceIds.some((id) => initialSourceIds.has(id));
      expect(
        hasConfiguredSource,
        `Family ${family.shortName} (${family.id}) must have at least one active configured crawler source in initialSources`,
      ).toBe(true);
    }
  });

  it('prohibits unsupported regulators from being claimed as actively monitored in UI files', () => {
    const prohibitedSources = ['NCLT Orders', 'NCDRC', 'DEA Fund & Unclaimed Deposit Guidelines'];
    const landingDir = path.resolve(__dirname, '../components/landing');
    const files = fs.readdirSync(landingDir);

    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
      const content = fs.readFileSync(path.join(landingDir, file), 'utf8');

      for (const phrase of prohibitedSources) {
        expect(
          content.includes(phrase),
          `File ${file} must not claim unconfigured source phrase: "${phrase}"`,
        ).toBe(false);
      }
    }
  });

  it('prohibits fabricated telemetry titles and fake active feed claims in production UI', () => {
    const prohibitedTelemetryPhrases = [
      '5 Official Feeds Active',
      'Recovery & Refund Portal Notice',
      'Unclaimed Deposits / DEA Fund Feed',
      'Public Announcement Form B/C Stream',
      'Creditor Claim Notification Feed',
      'Consumer Compensation Scheme Order',
      '42+ official sources',
      '42+ official',
    ];

    const searchDirs = [
      path.resolve(__dirname, '../components/landing'),
      path.resolve(__dirname, '../app/(public)'),
    ];

    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(full);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          const content = fs.readFileSync(full, 'utf8');
          for (const phrase of prohibitedTelemetryPhrases) {
            expect(
              content.includes(phrase),
              `File ${path.relative(process.cwd(), full)} must not contain fabricated telemetry: "${phrase}"`,
            ).toBe(false);
          }
        }
      }
    }

    for (const d of searchDirs) {
      checkDir(d);
    }
  });

  it('verifies Evidence Radar visual includes mandatory conceptual disclaimer microcopy', () => {
    const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
    const content = fs.readFileSync(radarPath, 'utf8');

    expect(content).toContain('EVIDENCE RADAR');
    expect(content).toContain('How ClaimRadar Monitors Sources');
    expect(content).toContain('Illustration of ClaimRadar');
    expect(content).toContain('not live activity');
  });
});
