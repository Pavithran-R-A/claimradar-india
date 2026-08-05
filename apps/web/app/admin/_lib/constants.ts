/** Shared constant lists for admin forms and selects. */

export const CLAIMABLE_STATUSES = [
  'detected',
  'official_update',
  'potential_claimable',
  'verified_claimable',
  'refund_ordered',
  'registration_open',
  'proposed_settlement',
  'collective_case_pending',
  'identified_users_only',
  'individual_judgment',
  'monitoring',
  'closed',
  'rejected',
  'uncertain',
] as const;

export const PROCEDURAL_STATUSES = [
  'final',
  'interim',
  'proposed',
  'appealed',
  'pending',
  'closed',
] as const;

export const PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const;

export const LEGAL_REVIEW_DECISIONS = [
  'clear_to_publish',
  'needs_changes',
  'legal_risk',
  'blocked',
] as const;

export const ASSIGNABLE_ROLES = ['user', 'researcher', 'editor', 'legal_reviewer', 'admin'];

export const AI_RESULT_STATUSES = ['success', 'failed', 'timeout', 'skipped'] as const;
