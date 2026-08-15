/**
 * Production deadline status calculation for ClaimRadar India.
 *
 * Re-exports the single source of truth from @claimradar/shared-types.
 */

export {
  calculateDeadlineStatus,
  parseDeadlineDate,
  isClosingSoon,
  formatDeadlinePhrase,
  DEFAULT_DEADLINE_TIMEZONE,
  type DeadlineStatus,
  type DeadlineCalculationOptions,
  type DeadlineCalculationResult,
} from '@claimradar/shared-types';
