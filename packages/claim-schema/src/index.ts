import { z } from 'zod';
import { ClaimableStatus, ProceduralStatus } from '@claimradar/shared-types';

export const evidenceSchema = z.object({
  field: z.string().describe('The extraction field this evidence supports'),
  excerpt: z.string().describe('Short quoted text from the source document'),
  page: z.number().nullable().optional().describe('Page number in PDF, null for HTML/RSS'),
  start_offset: z.number().nullable().optional().describe('Character start offset in source text'),
  end_offset: z.number().nullable().optional().describe('Character end offset in source text'),
  // Keep backward compat aliases
  type: z.string().optional(),
  value: z.string().optional(),
  source: z.string().optional(),
});

export const extractionSchema = z.object({
  is_relevant: z.boolean(),
  company_names: z.array(z.string()).nullable().optional(),
  legal_case_title: z.string().nullable().optional(),
  case_number: z.string().nullable().optional(),
  authority: z.string().nullable().optional(),
  document_type: z.string().nullable().optional(),
  procedural_status: z.nativeEnum(ProceduralStatus).nullable().optional(),
  claimability_status: z.nativeEnum(ClaimableStatus).nullable().optional(),
  affected_group: z.string().nullable().optional(),
  geographic_scope: z.string().nullable().optional(),
  relevant_period_start: z.string().nullable().optional(),
  relevant_period_end: z.string().nullable().optional(),
  relief_type: z.string().nullable().optional(),
  relief_description: z.string().nullable().optional(),
  official_amount: z.number().nullable().optional(),
  amount_currency: z.string().default('INR'),
  proof_requirements: z.array(z.string()).nullable().optional(),
  action_required: z.string().nullable().optional(),
  official_claim_url: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  appeal_or_pending_issue: z.string().nullable().optional(),
  reason_not_publicly_claimable: z.string().nullable().optional(),
  evidence: z.array(evidenceSchema).min(0),
  confidence: z.number().min(0).max(1),
});

export const eligibilityRuleSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'in', 'contains', 'gte', 'lte']),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

export const claimableValidationSchema = z.object({
  companyId: z.string().min(1),
  slug: z.string().min(1),
  publicTitle: z.string().min(1),
  status: z.nativeEnum(ClaimableStatus),
  proceduralStatus: z.nativeEnum(ProceduralStatus).optional(),
  summary: z.string().optional(),
  affectedGroup: z.string().optional(),
  reliefType: z.string().optional(),
  deadline: z.date().optional(),
});

export type Extraction = z.infer<typeof extractionSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type EligibilityRule = z.infer<typeof eligibilityRuleSchema>;
export type ClaimableValidation = z.infer<typeof claimableValidationSchema>;
