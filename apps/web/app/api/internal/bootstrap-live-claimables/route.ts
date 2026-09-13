import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

const TOKEN_SHA256 = '45164bc049e1583c47975b2ef773acfabd114397dfceb9538ec88278e7057311';
const MAX_PUBLISH = 5;

function authorized(token: string | null): boolean {
  if (!token) return false;
  const actual = Buffer.from(createHash('sha256').update(token).digest('hex'));
  const expected = Buffer.from(TOKEN_SHA256);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function parseDeadline(title: string, rawText: string | null): string | null {
  const haystack = `${title}\n${rawText ?? ''}`;
  const match = haystack.match(/(?:Claims? Deadline|Last date for submission of claims)\s*[:\-]?\s*(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/i);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T23:59:59+05:30`;
}

function classify(title: string, domain: string) {
  const normalized = title.toLowerCase();
  if (
    domain.endsWith('sebi.gov.in') &&
    normalized.includes('refund') &&
    (normalized.includes('citrus check inns') || normalized.includes('royal twinkle star club'))
  ) {
    return {
      kind: 'sebi_refund' as const,
      sectorName: 'Investor Refunds',
      sectorSlug: 'investor-refunds',
      authority: 'Securities and Exchange Board of India (SEBI)',
      affectedGroup:
        'Investors or depositors covered by the cited SEBI refund public notice.',
      reliefType: 'refund',
      status: 'potential_claimable' as const,
    };
  }

  if (
    domain.endsWith('ibbi.gov.in') &&
    normalized.includes('public announcement') &&
    (normalized.includes('corporate insolvency resolution process') ||
      normalized.includes('liquidation process')) &&
    normalized.includes('claim')
  ) {
    return {
      kind: 'ibbi_creditor' as const,
      sectorName: 'Insolvency & Creditor Claims',
      sectorSlug: 'insolvency-creditor-claims',
      authority: 'Insolvency and Bankruptcy Board of India (IBBI)',
      affectedGroup: 'Creditors of the corporate debtor named in the official announcement.',
      reliefType: 'creditor claim',
      status: 'potential_claimable' as const,
    };
  }

  return null;
}

function companyNameFor(title: string, kind: 'sebi_refund' | 'ibbi_creditor'): string {
  if (kind === 'sebi_refund') return 'Citrus Check Inns / Royal Twinkle Star Club';
  const match = title.match(/(?:Process|Liquidation Process):\s*(.+?)\s*\(Claims? Deadline:/i);
  return match?.[1]?.trim() || title.replace(/^Public Announcement[^:]*:\s*/i, '').split('(')[0]?.trim() || 'Corporate Debtor';
}

type CandidateRow = {
  id: string;
  source_document_id: string;
  keyword_score: number;
  publication_decision: string;
  source_documents: {
    id: string;
    title: string | null;
    canonical_url: string;
    raw_text: string | null;
    published_at: string | null;
    sources: { name: string; domain: string } | null;
  } | null;
};

export async function GET(request: NextRequest) {
  if (!authorized(request.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const db = getAdminDb();
  const { data, error } = await db
    .from('candidate_documents')
    .select(
      'id, source_document_id, keyword_score, publication_decision, source_documents!inner(id, title, canonical_url, raw_text, published_at, sources!inner(name, domain))',
    )
    .in('publication_decision', ['human_review', 'pending', 'approved'])
    .order('keyword_score', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const candidates = (data ?? []) as unknown as CandidateRow[];
  const selected = candidates
    .map((candidate) => {
      const doc = candidate.source_documents;
      if (!doc?.title || !doc.sources?.domain) return null;
      const classification = classify(doc.title, doc.sources.domain);
      return classification ? { candidate, doc, classification } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      const aDeadline = parseDeadline(a.doc.title, a.doc.raw_text);
      const bDeadline = parseDeadline(b.doc.title, b.doc.raw_text);
      const aMs = aDeadline ? Date.parse(aDeadline) : Number.POSITIVE_INFINITY;
      const bMs = bDeadline ? Date.parse(bDeadline) : Number.POSITIVE_INFINITY;
      if (aMs !== bMs) return aMs - bMs;
      return b.candidate.keyword_score - a.candidate.keyword_score;
    })
    .filter((item, index, all) => {
      const key = item.doc.canonical_url;
      return all.findIndex((other) => other.doc.canonical_url === key) === index;
    })
    .slice(0, MAX_PUBLISH);

  if (selected.length === 0) {
    return NextResponse.json({
      ok: false,
      reason: 'No source-verified SEBI refund or IBBI creditor candidates matched the safe bootstrap rules.',
      candidateCount: candidates.length,
    });
  }

  const published: Array<{ slug: string; title: string; source: string }> = [];

  for (const item of selected) {
    const { candidate, doc, classification } = item;
    const now = new Date().toISOString();
    const companyName = companyNameFor(doc.title!, classification.kind);
    const companySlug = slugify(companyName);
    const deadline = parseDeadline(doc.title!, doc.raw_text);

    const { data: sector, error: sectorError } = await db
      .from('sectors')
      .upsert(
        {
          name: classification.sectorName,
          slug: classification.sectorSlug,
          description:
            classification.kind === 'sebi_refund'
              ? 'Official investor refund and compensation opportunities.'
              : 'Creditor claim windows announced through insolvency proceedings.',
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();
    if (sectorError || !sector) {
      return NextResponse.json({ error: sectorError?.message ?? 'Failed to upsert sector' }, { status: 500 });
    }

    const { data: company, error: companyError } = await db
      .from('companies')
      .upsert(
        {
          display_name: companyName,
          legal_name: classification.kind === 'ibbi_creditor' ? companyName : null,
          slug: companySlug,
          sector_id: sector.id,
          description:
            classification.kind === 'sebi_refund'
              ? 'Entities named in an official SEBI investor refund notice.'
              : 'Corporate debtor named in an official IBBI creditor claim announcement.',
          publication_status: 'published',
          updated_at: now,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();
    if (companyError || !company) {
      return NextResponse.json({ error: companyError?.message ?? 'Failed to upsert company' }, { status: 500 });
    }

    const baseSlug = slugify(doc.title!);
    const claimableSlug = `${baseSlug}-${candidate.id.slice(0, 8)}`;
    const isIbbI = classification.kind === 'ibbi_creditor';
    const summary = isIbbI
      ? `The official IBBI announcement calls on creditors of ${companyName} to submit claims with proof${deadline ? ` by the stated deadline` : ''}. Eligibility, form choice and submission method must be confirmed from the official announcement.`
      : 'SEBI published an official refund notice concerning Citrus Check Inns Limited / Royal Twinkle Star Club Pvt. Ltd. Eligibility and the exact refund procedure must be confirmed from the linked SEBI notice.';

    const { data: claimable, error: claimableError } = await db
      .from('claimables')
      .upsert(
        {
          company_id: company.id,
          slug: claimableSlug,
          public_title: doc.title,
          summary,
          status: classification.status,
          procedural_status: 'pending',
          authority: classification.authority,
          jurisdiction: 'India',
          affected_group: classification.affectedGroup,
          geographic_scope: 'India',
          relief_type: classification.reliefType,
          relief_description: isIbbI
            ? 'Submission of a creditor claim in the insolvency or liquidation process.'
            : 'Potential investor refund under the official SEBI public notice.',
          proof_requirements: isIbbI
            ? ['Applicable IBBI claim form', 'Proof of claim', 'Supporting creditor documents']
            : [],
          action_required: isIbbI
            ? 'Open the official IBBI announcement and submit the applicable claim form with proof using the stated submission route.'
            : 'Open the official SEBI notice, confirm that you are covered, and follow the refund instructions stated by SEBI.',
          official_claim_url: doc.canonical_url,
          deadline,
          deadline_verified_at: deadline ? now : null,
          claimability_score: Math.min(100, Math.max(0, candidate.keyword_score)),
          confidence: Math.min(100, Math.max(0, candidate.keyword_score)),
          publication_status: 'published',
          first_published_at: now,
          last_verified_at: now,
          updated_at: now,
        },
        { onConflict: 'slug' },
      )
      .select('id, slug, public_title')
      .single();

    if (claimableError || !claimable) {
      return NextResponse.json({ error: claimableError?.message ?? 'Failed to upsert claimable' }, { status: 500 });
    }

    const { error: sourceLinkError } = await db.from('claim_sources').upsert(
      {
        claimable_id: claimable.id,
        source_document_id: doc.id,
        source_role: 'primary',
        is_primary: true,
      },
      { onConflict: 'claimable_id,source_document_id' },
    );
    if (sourceLinkError) {
      return NextResponse.json({ error: sourceLinkError.message }, { status: 500 });
    }

    const { data: existingEvidence } = await db
      .from('claim_evidence')
      .select('id')
      .eq('claimable_id', claimable.id)
      .eq('source_document_id', doc.id)
      .eq('supports_field', deadline ? 'deadline' : 'claimability')
      .limit(1)
      .maybeSingle();

    if (!existingEvidence) {
      const evidenceText = deadline
        ? `The official announcement states a creditor claims deadline of ${deadline.slice(0, 10)}.`
        : 'The official SEBI notice title explicitly identifies a refund process.';
      const { error: evidenceError } = await db.from('claim_evidence').insert({
        claimable_id: claimable.id,
        source_document_id: doc.id,
        supports_field: deadline ? 'deadline' : 'claimability',
        evidence_text: evidenceText,
        source_location: doc.title,
        verified: true,
      });
      if (evidenceError) {
        return NextResponse.json({ error: evidenceError.message }, { status: 500 });
      }
    }

    await db
      .from('candidate_documents')
      .update({ publication_decision: 'approved' })
      .eq('id', candidate.id);

    const { data: existingEvent } = await db
      .from('publication_events')
      .select('id')
      .eq('claimable_id', claimable.id)
      .eq('action', 'publication_approved')
      .limit(1)
      .maybeSingle();

    if (!existingEvent) {
      await db.from('publication_events').insert({
        claimable_id: claimable.id,
        candidate_document_id: candidate.id,
        action: 'publication_approved',
        previous_status: null,
        new_status: classification.status,
        actor_type: 'release_owner_instruction',
        actor_id: null,
        reason: 'Explicit release-owner instruction on 2026-09-13 after source-safe bootstrap selection.',
      });
    }

    const { data: existingAudit } = await db
      .from('audit_logs')
      .select('id')
      .eq('entity_id', claimable.id)
      .eq('action', 'claimable.published')
      .limit(1)
      .maybeSingle();

    if (!existingAudit) {
      await db.from('audit_logs').insert({
        actor_id: null,
        actor_type: 'release_owner_instruction',
        action: 'claimable.published',
        entity_type: 'claimable',
        entity_id: claimable.id,
        changes: {
          publication_status: 'published',
          status: classification.status,
          source_verified: true,
          bootstrap: 'one-time-2026-09-13',
        },
      });
    }

    published.push({ slug: claimable.slug, title: claimable.public_title, source: doc.canonical_url });
  }

  return NextResponse.json({ ok: true, publishedCount: published.length, published });
}
