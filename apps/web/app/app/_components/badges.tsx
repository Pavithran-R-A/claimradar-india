import { Badge } from '@claimradar/design-system';
import { MatchConfidence, TrackerStatus } from '@claimradar/shared-types';
import { matchOutcomeMeta, trackerStatusMeta } from '@/lib/constants';

type BadgeVariant =
  'default' | 'secondary' | 'success' | 'deadline' | 'warning' | 'danger' | 'info' | 'neutral';

const OUTCOME_VARIANTS: Record<string, BadgeVariant> = {
  [MatchConfidence.StrongPotentialMatch]: 'success',
  [MatchConfidence.PossibleMatch]: 'info',
  [MatchConfidence.InsufficientInformation]: 'warning',
  [MatchConfidence.NotMatched]: 'neutral',
};

const TRACKER_VARIANTS: Record<string, BadgeVariant> = {
  [TrackerStatus.Saved]: 'secondary',
  [TrackerStatus.Reviewing]: 'info',
  [TrackerStatus.GatheringProof]: 'warning',
  [TrackerStatus.SubmittedExternally]: 'info',
  [TrackerStatus.AwaitingResponse]: 'warning',
  [TrackerStatus.Approved]: 'success',
  [TrackerStatus.Rejected]: 'danger',
  [TrackerStatus.Closed]: 'neutral',
};

export function MatchOutcomeBadge({ confidence }: { confidence: string }) {
  const meta = matchOutcomeMeta(confidence);
  return (
    <Badge variant={OUTCOME_VARIANTS[confidence] ?? 'neutral'}>{meta?.label ?? confidence}</Badge>
  );
}

export function TrackerStatusBadge({ status }: { status: string }) {
  const meta = trackerStatusMeta(status);
  return <Badge variant={TRACKER_VARIANTS[status] ?? 'neutral'}>{meta?.label ?? status}</Badge>;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000));
}

export function isClosingSoon(deadline: string | null, withinDays = 14): boolean {
  const days = daysUntil(deadline);
  return days !== null && days >= 0 && days <= withinDays;
}
