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
    description: 'Explore all eight official search, claim and complaint pathways.',
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
  forgotten: ['bank-deposits', 'shares-dividends', 'insurance', 'epf'],
  'follow-up': ['shares-dividends', 'epf', 'tax-refund', 'sahara'],
  dispute: ['consumer-dispute', 'securities-dispute'],
};

/** Guidance only, not eligibility determination; no identifiers or answers are transmitted. */
export function routesForIntent(intent: RecoveryIntent): readonly RecoveryRoute[] {
  const routes = officialRecoveryRoutes();
  if (intent === 'all') return routes;
  const matching = new Set(ROUTE_IDS[intent]);
  return routes.filter((route) => matching.has(route.id));
}
