/**
 * Zod schemas validating every server-action boundary for the user product.
 */

import { z } from 'zod';
import { TrackerStatus } from '@claimradar/shared-types';
import { INDIAN_STATES, PURCHASE_YEAR_MIN } from '@/lib/constants';

const yearSchema = z.coerce.number().int().min(PURCHASE_YEAR_MIN).max(new Date().getFullYear());

const availabilitySchema = z.enum(['yes', 'no', 'unsure']);

/* -------------------------------- Onboarding ------------------------------ */

export const onboardingSchema = z
  .object({
    companiesUsed: z
      .array(z.string().trim().min(1).max(120))
      .max(20, 'Please list at most 20 companies.')
      .default([]),
    sectorsUsed: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
    purchasePeriodStart: yearSchema.nullable(),
    purchasePeriodEnd: yearSchema.nullable(),
    state: z.enum(INDIAN_STATES).nullable(),
    receiptAvailability: availabilitySchema,
    referenceAvailability: availabilitySchema,
    notificationPreference: z.enum(['email', 'in_app', 'none']),
  })
  .refine(
    (value) =>
      value.purchasePeriodStart === null ||
      value.purchasePeriodEnd === null ||
      value.purchasePeriodStart <= value.purchasePeriodEnd,
    { message: 'Purchase period start must be before end.', path: ['purchasePeriodEnd'] },
  );

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/* -------------------------------- Watchlist ------------------------------- */

export const watchCompanyIdSchema = z.object({
  companyId: z.string().uuid(),
});

export const watchSectorIdSchema = z.object({
  sectorId: z.string().uuid(),
});

export type WatchCompanyIdInput = z.infer<typeof watchCompanyIdSchema>;
export type WatchSectorIdInput = z.infer<typeof watchSectorIdSchema>;

/* --------------------------------- Tracker -------------------------------- */

export const createTrackerSchema = z.object({
  claimableId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateTrackerSchema = z.object({
  trackerId: z.string().uuid(),
  status: z.nativeEnum(TrackerStatus),
  notes: z.string().trim().max(2000).nullable().optional(),
  externalReference: z.string().trim().max(200).nullable().optional(),
});

export const deleteTrackerSchema = z.object({
  trackerId: z.string().uuid(),
});

export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;
export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;

/* ------------------------------- Preferences ------------------------------ */

export const notificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  browserEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  digestFrequency: z.enum(['daily', 'weekly', 'monthly', 'never']),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

/* --------------------------------- Profile -------------------------------- */

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().max(80).nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/* --------------------------------- Privacy -------------------------------- */

export const correctionRequestSchema = z.object({
  target: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(4000),
});

export const consentWithdrawalSchema = z.object({
  consentType: z.string().trim().min(2).max(60),
  reason: z.string().trim().max(2000).optional(),
});

export const grievanceSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(4000),
  contactEmail: z.string().trim().email().max(254),
});

export const deletionRequestSchema = z.object({
  reason: z.string().trim().max(2000).optional(),
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm account deletion.' }),
  }),
});

export type CorrectionRequestInput = z.infer<typeof correctionRequestSchema>;
export type ConsentWithdrawalInput = z.infer<typeof consentWithdrawalSchema>;
export type GrievanceInput = z.infer<typeof grievanceSchema>;
export type DeletionRequestInput = z.infer<typeof deletionRequestSchema>;

/* ------------------------------ Notifications ----------------------------- */

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
