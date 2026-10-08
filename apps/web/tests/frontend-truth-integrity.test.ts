import { describe, it, expect } from 'vitest';
import {
  publicSourceFamilies,
  initialSources,
  getActivePublicSourceIds,
} from '@claimradar/source-registry';
import fs from 'fs';
import path from 'path';

describe('Frontend Truth Integrity & Source Registry Parity', () => {
  it('enforces strict 100% resolution of every advertised public source ID to an active source', () => {
    expect(publicSourceFamilies.length).toBeGreaterThan(0);

    const initialSourceIds = new Set(initialSources.map((s) => s.id));

    for (const family of publicSourceFamilies) {
      expect(family.id).toBeTruthy();
      expect(family.name).toBeTruthy();
      expect(family.shortName).toBeTruthy();
      expect(family.domain).toBeTruthy();
      expect(family.scope).toBeTruthy();
      expect(family.activeSourceIds.length).toBeGreaterThan(0);

      // EVERY source ID in activeSourceIds must resolve to an active source in initialSources
      for (const sourceId of family.activeSourceIds) {
        expect(
          initialSourceIds.has(sourceId),
          `Public family ${family.shortName} contains inactive or unknown source ID: "${sourceId}"`,
        ).toBe(true);
      }
    }
  });

  it('enforces strict reverse parity: every active source belongs to exactly one public family', () => {
    const allActivePublicIds = getActivePublicSourceIds();

    // Check no duplicates in active public sources
    const uniqueIds = new Set(allActivePublicIds);
    expect(uniqueIds.size, 'Duplicate source IDs found across public source families').toBe(
      allActivePublicIds.length,
    );

    // Total count parity
    expect(allActivePublicIds.length).toBe(initialSources.length);

    // Check reverse mapping
    for (const activeSource of initialSources) {
      expect(
        uniqueIds.has(activeSource.id),
        `Active crawler source "${activeSource.id}" is missing from public source families`,
      ).toBe(true);
    }
  });

  it('prohibits stale, inactive, or internal-only source IDs from public activeSourceIds', () => {
    const prohibitedSourceIds = [
      'sebi-orders-rss',
      'cci-rss',
      'generic-rss',
      'irdai-notices',
      'iepf-notices',
    ];
    const allActivePublicIds = new Set(getActivePublicSourceIds());

    for (const prohibitedId of prohibitedSourceIds) {
      expect(
        allActivePublicIds.has(prohibitedId),
        `Inactive source ID "${prohibitedId}" must not be listed in public activeSourceIds`,
      ).toBe(false);
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

  it('prohibits unsupported active court, tribunal, or gazette monitoring claims in UI files', () => {
    const prohibitedOperationalClaims = [
      'regulators, courts, and gazette orders',
      'SEBI, RBI, IBBI, and courts',
      'high court gazettes across India',
      'consumer authorities, courts and tribunals',
      'from official gazette detection',
      'Official statutory portal',
      'feeds monitored',
      'Regulated Sources We Monitor',
      'court filing',
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
          for (const phrase of prohibitedOperationalClaims) {
            expect(
              content.includes(phrase),
              `File ${path.relative(process.cwd(), full)} contains prohibited operational claim: "${phrase}"`,
            ).toBe(false);
          }
        }
      }
    }

    for (const d of searchDirs) {
      checkDir(d);
    }
  });

  it('verifies Evidence Radar visual includes mandatory conceptual disclaimer microcopy and clean plain language', () => {
    const radarPath = path.resolve(__dirname, '../components/landing/evidence-radar-visual.tsx');
    const content = fs.readFileSync(radarPath, 'utf8');

    const normalized = content.replace(/\s+/g, ' ');
    expect(normalized).toContain('Official source scan');
    expect(normalized).toContain('Published listings are source-verified.');
    expect(normalized).toContain('Monitored official sources');
    expect(normalized).toContain('Securities and Exchange Board of India');
    expect(normalized).toContain('Press Information Bureau');
    expect(normalized).toContain(
      'Visual scan, not live crawl status.',
    );
    expect(normalized).toContain(
      'Pause radar animation',
    );

    // Prohibit tiny text and old AI jargon
    expect(content).not.toContain('text-[11px]');
    expect(content).not.toContain('text-[10px]');
    expect(content).not.toContain('text-[9px]');
    expect(content).not.toContain('Securities & Exchange Board');
    expect(content).not.toContain('statutory RSS');
    expect(content).not.toContain('statutory filing portal');
    expect(content).not.toContain('Monitored Statutory Authorities');
    expect(content).not.toContain('Government Press Information');
  });

  it('prohibits placeholder domains, fake email addresses, and unstaffed SLA turnaround promises', () => {
    const searchDirs = [
      path.resolve(__dirname, '../components'),
      path.resolve(__dirname, '../app/(public)'),
    ];

    const prohibitedStrings = [
      'claimradar.example',
      'support@claimradar.in',
      'corrections@claimradar.in',
      'grievance@claimradar.in',
      'billing@claimradar.example',
      'grievance@claimradar.example',
      'press@claimradar.example',
      'within 2 business days',
      'within 4 business hours',
      'within 48 hours',
      'within 24 hours of receipt',
      'Verified Ingestion Stream',
      'Document Ingest',
      'Evidence Desk Status',
      'Current Ingestion & Verification Funnel',
      'Securities & Exchange Board',
      'statutory RSS',
      'statutory filing portal',
    ];

    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(full);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          const content = fs.readFileSync(full, 'utf8');
          for (const phrase of prohibitedStrings) {
            expect(
              content.includes(phrase),
              `File ${path.relative(process.cwd(), full)} contains prohibited placeholder/jargon string: "${phrase}"`,
            ).toBe(false);
          }
        }
      }
    }

    for (const d of searchDirs) {
      checkDir(d);
    }
  });

  it('ensures zero-inventory empty directory renders human consumer copy without (0) counts', () => {
    const pagePath = path.resolve(__dirname, '../app/(public)/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    expect(pageContent).toContain('latest.length > 0');
    expect(pageContent).toContain('Latest opportunities');
    expect(pageContent).not.toContain('Latest opportunities (0)');

    const statePath = path.resolve(__dirname, '../components/repository-states.tsx');
    const stateContent = fs.readFileSync(statePath, 'utf8');

    expect(stateContent).toContain('Publication status');
    expect(stateContent).toContain('No notice has cleared publication review yet');
    expect(stateContent).toContain('How a notice becomes a listing');
    expect(stateContent).toContain('Official notice found');
    expect(stateContent).toContain('Source checked');
    expect(stateContent).toContain('Editorial review');
    expect(stateContent).toContain('Published with official link');
  });
});
