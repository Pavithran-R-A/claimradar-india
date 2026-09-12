/**
 * Product constants for the authenticated user experience.
 * Brand text must come from @claimradar/config — this file holds only
 * non-brand option lists and UI metadata.
 */

import { MatchConfidence, TrackerStatus } from '@claimradar/shared-types';

/** Fallback sector options (mirrors seed sectors) when the DB is unreachable. */
export const SECTOR_OPTIONS = [
  'E-commerce',
  'Airlines',
  'Telecom',
  'Banking',
  'Fintech',
  'Insurance',
  'Education',
  'Real Estate',
] as const;

/** Indian states and union territories (approximate purchase location). */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export type ReceiptAvailability = 'yes' | 'no' | 'unsure';
export type NotificationChannelPreference = 'email' | 'in_app' | 'none';

export const AVAILABILITY_OPTIONS: { value: ReceiptAvailability; label: string }[] = [
  { value: 'yes', label: 'Yes, I have it' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const NOTIFICATION_CHANNEL_OPTIONS: {
  value: NotificationChannelPreference;
  label: string;
}[] = [
  { value: 'email', label: 'Email me about matches' },
  { value: 'in_app', label: 'In-app notifications only' },
  { value: 'none', label: 'No notifications for now' },
];

/** Earliest plausible purchase year offered in onboarding. */
export const PURCHASE_YEAR_MIN = 1995;

export interface TrackerStatusMeta {
  value: TrackerStatus;
  label: string;
  description: string;
}

/**
 * The eight user-reported tracker statuses.
 * "Submitted externally" is always user-reported — ClaimKhoj never files
 * claims with any company or authority on a user's behalf.
 */
export const TRACKER_STATUSES: TrackerStatusMeta[] = [
  {
    value: TrackerStatus.Saved,
    label: 'Saved',
    description: 'Bookmarked for later review.',
  },
  {
    value: TrackerStatus.Reviewing,
    label: 'Reviewing',
    description: 'You are checking whether you are affected.',
  },
  {
    value: TrackerStatus.GatheringProof,
    label: 'Gathering proof',
    description: 'Collecting receipts, references, or other evidence.',
  },
  {
    value: TrackerStatus.SubmittedExternally,
    label: 'Submitted externally (user-reported)',
    description:
      'You told us you filed this claim with the company or authority yourself. ClaimKhoj does not file claims.',
  },
  {
    value: TrackerStatus.AwaitingResponse,
    label: 'Awaiting response',
    description: 'Waiting for the company or authority to respond.',
  },
  {
    value: TrackerStatus.Approved,
    label: 'Approved',
    description: 'Your claim was accepted (user-reported).',
  },
  {
    value: TrackerStatus.Rejected,
    label: 'Rejected',
    description: 'Your claim was declined (user-reported).',
  },
  {
    value: TrackerStatus.Closed,
    label: 'Closed',
    description: 'You are done tracking this item.',
  },
];

export interface MatchOutcomeMeta {
  value: MatchConfidence;
  label: string;
  description: string;
}

export const MATCH_OUTCOMES: MatchOutcomeMeta[] = [
  {
    value: MatchConfidence.StrongPotentialMatch,
    label: 'Strong potential match',
    description: 'Your profile aligns with this claimable on every checked dimension.',
  },
  {
    value: MatchConfidence.PossibleMatch,
    label: 'Possible match',
    description: 'Some dimensions align; review the details before acting.',
  },
  {
    value: MatchConfidence.InsufficientInformation,
    label: 'Insufficient information',
    description: 'Add more detail in onboarding or settings to resolve this result.',
  },
  {
    value: MatchConfidence.NotMatched,
    label: 'Not matched',
    description: 'Your profile does not align with this claimable.',
  },
];

export function trackerStatusMeta(value: string): TrackerStatusMeta | undefined {
  return TRACKER_STATUSES.find((s) => s.value === value);
}

export function matchOutcomeMeta(value: string): MatchOutcomeMeta | undefined {
  return MATCH_OUTCOMES.find((o) => o.value === value);
}
