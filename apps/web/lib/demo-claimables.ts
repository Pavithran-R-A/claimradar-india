import type { PublishedClaimable } from './claimables-repository';

/**
 * Demo dataset for local development and testing ONLY.
 *
 * These records are entirely fictional. They are served by the public
 * repository layer only when the `ENABLE_DEMO_DATA=true` environment flag is
 * set AND the app is not running in production, and every consuming page
 * renders a visible "Demo data" banner alongside them.
 *
 * All URLs point to `example.com` placeholders so that no fabricated
 * regulator or government link is ever presented as real.
 */
export const DEMO_CLAIMABLES: PublishedClaimable[] = [
  {
    id: 'demo-claim-1',
    slug: 'demo-acme-investor-refund',
    title: '[DEMO] Acme Example Securities Investor Refund Scheme',
    authority: '[DEMO] Example securities authority',
    companyName: 'Acme Example Securities Ltd',
    companySlug: 'acme-example-securities',
    sector: 'Financial Services',
    sectorSlug: 'financial-services',
    status: 'open',
    statusDetail: 'Demo record',
    statusExplanation:
      'Fictional demo record used to demonstrate the directory UI in development environments.',
    affectedGroup: 'Demo investors who held accounts between Jan 2024 and Dec 2025',
    reliefAmount: 'Pro-rata demo refund (fictional)',
    actionRoute: 'Submit the demo claim form via the example portal (fictional)',
    officialRouteUrl: 'https://example.com/demo-claims/acme-securities',
    deadlineDate: '2026-10-31T23:59:59.000Z',
    proofRequirements: ['Demo document A', 'Demo document B'],
    officialSources: [
      {
        name: '[DEMO] Example Order 101/2026',
        url: 'https://example.com/demo-orders/101.pdf',
        publishedAt: '2026-07-15T00:00:00.000Z',
      },
    ],
    evidenceSummary:
      'This is a fabricated summary attached to a demo record. It carries no real-world meaning.',
    lastCheckedAt: '2026-08-04T12:00:00.000Z',
    lastVerifiedAt: '2026-08-04T12:00:00.000Z',
    publishedAt: '2026-07-20T00:00:00.000Z',
    geographicScope: 'Maharashtra (demo)',
    jurisdiction: 'Demo authority',
  },
  {
    id: 'demo-claim-2',
    slug: 'demo-example-bank-service-charge-refund',
    title: '[DEMO] Example Bank Service Charge Refund Window',
    authority: '[DEMO] Example banking authority',
    companyName: 'Example Bank of Demo',
    companySlug: 'example-bank-of-demo',
    sector: 'Banking',
    sectorSlug: 'banking',
    status: 'closing_soon',
    statusDetail: 'Demo record',
    statusExplanation:
      'Fictional demo record with a near-term deadline, used to demonstrate closing-soon states.',
    affectedGroup: 'Demo savings account holders with penal deductions in Q1 2025',
    reliefAmount: 'Fictional refund of ₹1,200 per account',
    actionRoute: 'File a demo claim request on the fictional grievance desk',
    officialRouteUrl: 'https://example.com/demo-claims/example-bank',
    deadlineDate: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
    proofRequirements: ['Demo account reference', 'Demo identity confirmation'],
    officialSources: [
      {
        name: '[DEMO] Example Advisory PR-2025-88',
        url: 'https://example.com/demo-press/PR-2025-88.pdf',
        publishedAt: '2026-06-01T00:00:00.000Z',
      },
    ],
    evidenceSummary:
      'This is a fabricated summary attached to a demo record. It carries no real-world meaning.',
    lastCheckedAt: '2026-08-04T18:00:00.000Z',
    lastVerifiedAt: '2026-08-04T18:00:00.000Z',
    freshnessWarning: 'Demo record: deadline shown for UI demonstration only.',
    publishedAt: '2026-06-10T00:00:00.000Z',
    geographicScope: 'Karnataka (demo)',
    jurisdiction: 'Demo authority',
  },
];
