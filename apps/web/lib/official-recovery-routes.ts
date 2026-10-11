/**
 * Independently maintained links to official recovery / enquiry routes.
 * None of these portals proves the visitor is owed money or that any particular
 * compensation scheme is open. They must NEVER enter published claimables.
 */
export type RecoveryRouteKind = 'Search for unclaimed money' | 'Claim or track your money' | 'Report a dispute';

export interface RecoveryRoute {
  id: string;
  title: string;
  description: string;
  agency: string;
  kind: RecoveryRouteKind;
  nextStep: string;
  url: string;
  linkLabel: string;
}

export const OFFICIAL_RECOVERY_ROUTES: readonly RecoveryRoute[] = [
  {
    id: 'bank-deposits',
    title: 'Unclaimed bank deposits',
    description: 'Think an old bank account or fixed deposit was forgotten?',
    agency: 'Reserve Bank of India · UDGAM',
    kind: 'Search for unclaimed money',
    nextStep: 'Search across participating banks; any claim is settled by the bank, not UDGAM.',
    url: 'https://udgam.rbi.org.in/unclaimed-deposits/#/login',
    linkLabel: 'Search RBI UDGAM',
  },
  {
    id: 'shares-dividends',
    title: 'Unclaimed shares and dividends',
    description: 'Recover company dividends or shares transferred to the IEPF.',
    agency: 'Investor Education and Protection Fund Authority',
    kind: 'Claim or track your money',
    nextStep: 'Check the official IEPF-5 claim process and company verification requirements.',
    url: 'https://services.india.gov.in/service/detail/iepf-forms-by-investor-education-and-protection-fund-authority',
    linkLabel: 'View government IEPF service',
  },
  {
    id: 'insurance',
    title: 'Unclaimed insurance payouts',
    description: 'Look for policy proceeds that may remain unpaid to a policyholder or beneficiary.',
    agency: 'Insurance Regulatory and Development Authority of India',
    kind: 'Search for unclaimed money',
    nextStep: 'Use IRDAI links to insurers and enquire with the insurance company.',
    url: 'https://bimabharosa.irdai.gov.in/Home/UnclaimedAmountsQuery',
    linkLabel: 'Check IRDAI Bima Bharosa',
  },
  {
    id: 'epf',
    title: 'Provident fund and pension claims',
    description: 'Check or pursue money in an EPFO member account.',
    agency: 'Employees Provident Fund Organisation',
    kind: 'Claim or track your money',
    nextStep: 'Sign in to the official EPFO member portal for eligible services and claim status.',
    url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/',
    linkLabel: 'Open EPFO member portal',
  },
  {
    id: 'tax-refund',
    title: 'Failed income-tax refunds',
    description: 'Filed a return, but your refund failed or has not reached your bank?',
    agency: 'Income Tax Department',
    kind: 'Claim or track your money',
    nextStep: 'Check refund status; reissue is available when a previously issued refund failed.',
    url: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/refund-reissue-UM',
    linkLabel: 'See official refund-reissue steps',
  },
  {
    id: 'sahara',
    title: 'Eligible Sahara cooperative deposits',
    description: 'For depositors of the specified Sahara cooperative societies.',
    agency: 'Central Registrar of Cooperative Societies',
    kind: 'Claim or track your money',
    nextStep: 'Check the society and identity requirements on the government refund portal.',
    url: 'https://mocrefund.crcs.gov.in',
    linkLabel: 'Open official Sahara refund portal',
  },
  {
    id: 'consumer-dispute',
    title: 'Shopping, services and refund disputes',
    description: 'A seller, airline or service provider has not resolved your refund complaint?',
    agency: 'Department of Consumer Affairs · National Consumer Helpline',
    kind: 'Report a dispute',
    nextStep: 'File a grievance for assistance; filing does not guarantee compensation.',
    url: 'https://consumerhelpline.gov.in/',
    linkLabel: 'Contact National Consumer Helpline',
  },
  {
    id: 'securities-dispute',
    title: 'Investment and broker complaints',
    description: 'A listed company or SEBI-regulated intermediary has not resolved your issue?',
    agency: 'Securities and Exchange Board of India · SCORES',
    kind: 'Report a dispute',
    nextStep: 'Raise the issue with the entity first, then use SCORES if the issue remains unresolved.',
    url: 'https://scores.sebi.gov.in/',
    linkLabel: 'Open SEBI SCORES',
  },
];

export function officialRecoveryRoutes(): readonly RecoveryRoute[] {
  // Only HTTPS links to recognized government/authority hosts are presented.
  const domains = new Set([
    'udgam.rbi.org.in',
    'services.india.gov.in',
    'bimabharosa.irdai.gov.in',
    'unifiedportal-mem.epfindia.gov.in',
    'www.incometax.gov.in',
    'mocrefund.crcs.gov.in',
    'consumerhelpline.gov.in',
    'scores.sebi.gov.in',
  ]);
  return OFFICIAL_RECOVERY_ROUTES.filter((route) => {
    try {
      const url = new URL(route.url);
      return url.protocol === 'https:' && domains.has(url.hostname);
    } catch {
      return false;
    }
  });
}
