import { officialRecoveryRoutes, type RecoveryRoute } from './official-recovery-routes';

export type RecoveryIntent = 'all' | 'forgotten' | 'follow-up' | 'dispute';

export const RECOVERY_INTENT_CHOICES: readonly {
  id: RecoveryIntent;
  label: string;
  description: string;
}[] = [
  {
    id: 'all',
    label: 'Show all',
    description: 'Explore all ten official search, claim and complaint pathways.',
  },
  {
    id: 'forgotten',
    label: 'I may have unclaimed money',
    description: 'For old bank accounts, forgotten shares, insurance proceeds or provident funds.',
  },
  {
    id: 'follow-up',
    label: 'I want to track or recover money',
    description: 'For outstanding tax refunds, eligible deposits, dividends or provident funds.',
  },
  {
    id: 'dispute',
    label: 'I need a refund or complaint resolved',
    description: 'For consumer, shopping, service and investment grievances.',
  },
];

const ROUTE_IDS: Readonly<Record<Exclude<RecoveryIntent, 'all'>, readonly string[]>> = {
  forgotten: [
    'unclaimed-assets-gateway',
    'bank-deposits',
    'mutual-fund-folios',
    'shares-dividends',
    'insurance',
    'epf',
  ],
  'follow-up': ['shares-dividends', 'epf', 'tax-refund', 'sahara'],
  dispute: ['consumer-dispute', 'securities-dispute'],
};

/**
 * Preferences are ranking hints, NEVER access controls or filters.
 * Preserve the full, trusted catalog and its original order within each group.
 * No personal identifiers or answers are transmitted.
 */
export function routesForIntent(intent: RecoveryIntent): readonly RecoveryRoute[] {
  const routes = officialRecoveryRoutes();
  if (intent === 'all') return routes;
  const preferred = new Set(ROUTE_IDS[intent]);
  return [
    ...routes.filter((route) => preferred.has(route.id)),
    ...routes.filter((route) => !preferred.has(route.id)),
  ];
}

const SEARCH_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  'unclaimed-assets-gateway': [
    'unclaimed assets',
    'forgotten funds',
    'dividends',
    'mutual fund',
    'money portal',
    'financial assets',
  ],
  'bank-deposits': ['rbi', 'udgam', 'fixed deposit', 'fd', 'bank account', 'dormant'],
  'mutual-fund-folios': ['mitra', 'mutual funds', 'folio', 'forgotten investments', 'amc'],
  'shares-dividends': ['iepf', 'shares', 'stocks', 'dividend', 'investor'],
  insurance: ['irdai', 'insurance', 'policy', 'premium'],
  epf: ['epfo', 'pf', 'provident fund', 'pension', 'uan'],
  'tax-refund': ['income tax', 'itr', 'tds', 'refund reissue'],
  sahara: ['crcs', 'cooperative', 'deposit', 'sahara'],
  'consumer-dispute': ['shopping', 'merchant', 'airline', 'telecom', 'service', 'complaint'],
  'securities-dispute': ['sebi', 'scores', 'broker', 'stock', 'investment', 'securities'],
};

const GENERIC_SEARCH_TERMS = new Set([
  'a',
  'an',
  'and',
  'for',
  'from',
  'in',
  'my',
  'of',
  'or',
  'the',
  'to',
  'claim',
  'claims',
  'money',
  'recovery',
  'recover',
]);

function normaliseSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Match a public search against ALL official pathways before applying
 * preference ordering. A preference must never hide a relevant route.
 * Returning zero distinguishes a true no-match query from the full catalog
 * without fabricating eligibility or claim opportunities.
 */
export function matchingRoutesForSearch(
  intent: RecoveryIntent,
  search: string,
): readonly RecoveryRoute[] {
  const routes = routesForIntent(intent);
  const terms = normaliseSearch(search)
    .split(' ')
    .filter((term) => term.length >= 3 && !GENERIC_SEARCH_TERMS.has(term));
  if (terms.length === 0) return routes;

  return routes.filter((route) => {
    const searchable = normaliseSearch(
      [
        route.title,
        route.description,
        route.agency,
        route.nextStep,
        route.linkLabel,
        ...(SEARCH_SYNONYMS[route.id] ?? []),
      ].join(' '),
    );
    return terms.some((term) => searchable.includes(term));
  });
}
