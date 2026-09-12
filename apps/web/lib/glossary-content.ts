/**
 * Glossary content.
 *
 * Every entry below is a genuine, human-written definition of a core term
 * used across the platform. This is static editorial content — it is not
 * generated programmatically and contains no invented data.
 */

export interface GlossaryTerm {
  /** URL-safe identifier used in /glossary/[term]. */
  slug: string;
  /** Display name of the term. */
  term: string;
  /** A short, plain-language definition. */
  definition: string;
  /** One or two sentences of additional context. */
  context: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: 'settlement',
    term: 'Settlement',
    definition:
      'An agreement that resolves a dispute between parties, typically involving the payment of money or other relief, without a full trial on the merits.',
    context:
      'In the context of consumer and investor claims, a settlement often arises from a court-approved order or a regulator-directed scheme. Eligible individuals may need to file a claim within a defined window to receive their share.',
  },
  {
    slug: 'refund-scheme',
    term: 'Refund scheme',
    definition:
      'A structured programme through which an entity returns money to affected customers, investors or subscribers, usually following an order by a court, regulator or the entity itself.',
    context:
      'Refund schemes specify who is eligible, how much is refunded, the documentation required and the deadline for submitting a claim. Official scheme documents are the authoritative source for these details.',
  },
  {
    slug: 'compensation-fund',
    term: 'Compensation fund',
    definition:
      'A pool of money set aside to compensate individuals who have suffered a loss, often funded by penalties, recovered amounts or statutory contributions.',
    context:
      'Regulators and courts may establish or administer compensation funds to distribute relief to affected parties. Distribution is governed by the rules laid out in the establishing order or notification.',
  },
  {
    slug: 'claim-window',
    term: 'Claim window',
    definition:
      'The defined period during which eligible individuals may submit a claim to receive relief under a scheme or settlement.',
    context:
      'Claims submitted after the window closes are generally not accepted. The opening and closing dates are published in the official scheme document or order.',
  },
  {
    slug: 'official-source',
    term: 'Official source',
    definition:
      'An authoritative document or channel issued by a government body, court, tribunal, regulator or the concerned company, such as an order, notification, press release or public notice.',
    context:
      'ClaimKhoj links every listing back to its official sources so users can verify the information independently. We do not treat third-party commentary or news reports as official sources.',
  },
  {
    slug: 'disgorgement',
    term: 'Disgorgement',
    definition:
      'The repayment of ill-gotten gains imposed on a wrongdoer, so that the improperly obtained money can be returned to affected investors or depositors.',
    context:
      'Financial regulators may direct a company or individual to disgorge funds collected unlawfully. The recovered amount is often used to refund eligible investors through a claims process.',
  },
  {
    slug: 'unclaimed-deposits',
    term: 'Unclaimed deposits',
    definition:
      'Deposits or balances held by a bank or company that have remained inoperative or unclaimed by their owners for a prescribed period.',
    context:
      'Institutions are required to report and, in many cases, transfer such amounts to a designated fund. Owners or their heirs can typically reclaim the amounts by submitting proof of entitlement.',
  },
  {
    slug: 'grievance-redressal',
    term: 'Grievance redressal',
    definition:
      'The formal process by which an organisation receives, investigates and resolves complaints raised by customers or stakeholders.',
    context:
      'Many regulated entities must maintain a grievance redressal mechanism with defined timelines. Escalation paths often include an internal officer, an ombudsman and, ultimately, a consumer forum or court.',
  },
  {
    slug: 'limitation-period',
    term: 'Limitation period',
    definition:
      'The legally prescribed time limit within which a legal action or claim must be initiated, after which the claim may become time-barred.',
    context:
      'Different forums and causes of action carry different limitation periods. Acting within the applicable period is essential to preserving a right to claim.',
  },
  {
    slug: 'class-action',
    term: 'Class action',
    definition:
      'A legal proceeding in which one or a few representatives bring a claim on behalf of a larger group of people who share the same grievance.',
    context:
      'Class actions allow many affected individuals to pursue relief collectively. Outcomes may create a settlement or compensation scheme that individual members can claim against.',
  },
];

export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((entry) => entry.slug === slug);
}
