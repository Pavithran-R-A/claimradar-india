import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

const TOKEN_SHA256 = '2e12dab802ac8f2f3a9942389317a2e0680591dafce9a30f1636250bed7bb559';
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

function classify(title: string, domain: string) {
  const t = title.toLowerCase();
  if (
    domain.endsWith('sebi.gov.in') &&
    t.includes('refund') &&
    (t.includes('citrus check inns') || t.includes('royal twinkle star club'))
  ) {
    return {
      kind: 'sebi_refund' as const,
      sectorName: 'Investor Refunds',
      sectorSlug: 'investor-refunds',
      authority: 'Securities and Exchange Board of India (SEBI)',
      affectedGroup: 'Investors or depositors covered by the cited SEBI refund public notice.',
      reliefType: 'refund',
      status: 'potential_claimable' as const,
    };
  }

  if (
    domain.endsWith('ibbi.gov.in') &&
    t.includes('public announcement') &&
    (t.includes('corporate insolvency resolution process') || t.includes('liquidation process')) &&
    t.includes('claim')
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
  return (
    title.match(/(?:Process|Liquidation Process):\s*(.+?)\s*\(Claims? Deadline:/i)?.[1]?.trim() ||
    title.replace(/^Public Announcement[^:]*:\s*/i, '').split('(')[0]?.trim() ||
    'Corporate Debtor'
  );
}

function parseDeadline(title: string): string | null {
  const match = title.match(/Claims? Deadline:\s*(\d{1,2})[./-](\d{1,2})[./-](\d{4})/i);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T23:59:59+05:30`;
}

type Candidate = {
  id: string;
  source_document_id: string;
  keyword_score: number;
  publication_decision: string;
};

type SourceDocument = {
  id: string;
  title: string | null;
  canonical_url: string;
  published_at: string | null;
  source_id: string;
};

type Source = { name: string; domain: string };

export async function GET(request: NextRequest) {
  if (!authorized(request.nextUrl.searchParams.get('token'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const db = getAdminDb();
  const { data: candidatesRaw, error: candidatesError } = await db
    .from('candidate_documents')
    .select('id, source_document_id, keyword_score, publication_decision')
    .in('publication_decision', ['human_review', 'pending', 'approved'])
    .order('keyword_score', { ascending: false })
    .limit(100);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }

  const candidates = (candidatesRaw ?? []) as Candidate[];
  const matches: Array<{
    candidate: Candidate;
    doc: SourceDocument;
    source: Source;
    classification: NonNullable<ReturnType<typeof classify>>;
  }> = [];

  for (const candidate of candidates) {
    const { data: docRaw } = await db
      .from('source_documents')
      .select('id, title, canonical_url, published_at, source_id')
      .eq('id', candidate.source_document_id)
      .maybeSingle();
    const doc = docRaw as SourceDocument | null;
    if (!doc?.title || !doc.source_id) continue;

    const { data: sourceRaw } = await db
      .from('sources')
      .select('name, domain')
      .eq('id', doc.source_id)
      .maybeSingle();
    const source = sourceRaw as Source | null;
    if (!source?.domain) continue;

    const classification = classify(doc.title, source.domain);
    if (classification) matches.push({ candidate, doc, source, classification });
  }

  const selected = matches
    .filter((item, index, all) =>
      all.findIndex((other) => other.doc.canonical_url === item.doc.canonical_url) === index,
    )
    .slice(0, MAX_PUBLISH);

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.(?:co|in)/)?.[1] ?? 'unknown';

  if (request.nextUrl.searchParams.get('mode') !== 'run') {
    return NextResponse.json({
      ok: true,
      mode: 'inspect',
      projectRef,
      candidateCount: candidates.length,
      matchedCount: matches.length,
      selected: selected.map(({ candidate, doc, source, classification }) => ({
        candidateId: candidate.id,
        title: doc.title,
        url: doc.canonical_url,
        source: source.name,
        domain: source.domain,
        kind: classification.kind,
        score: candidate.keyword_score,
      })),
    });
  }

  if (projectRef !== 'qsshiksnyflwsybjyzob') {
    return NextResponse.json(
      { ok: false, error: `Refusing mutation: unexpected Supabase project ${projectRef}` },
      { status: 409 },
    );
  }

  if (selected.length === 0) {
    return NextResponse.json({ ok: false, projectRef, error: 'No source-safe candidates matched.' }, { status: 409 });
  }

  const published: Array<{ slug: string; title: string; source: string }> = [];

  for (const item of selected) {
    const { candidate, doc, classification } = item;
    const now = new Date().toISOString();
    const companyName = companyNameFor(doc.title!, classification.kind);
    const companySlug = slugify(companyName);
    const deadline = parseDeadline(doc.title!);

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

    const claimableSlug = `${slugify(doc.title!)}-${candidate.id.slice(0, 8)}`;
    const isIbbi = classification.kind === 'ibbi_creditor';
    const summary = isIbbi
      ? `The official IBBI announcement calls on creditors of ${companyName} to submit claims with proof. Eligibility, form choice and submission method must be confirmed from the official announcement.`
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
          relief_description: isIbbi
            ? 'Submission of a creditor claim in the insolvency or liquidation process.'
            : 'Potential investor refund under the official SEBI public notice.',
          proof_requirements: isIbbi
            ? ['Applicable IBBI claim form', 'Proof of claim', 'Supporting creditor documents']
            : [],
          action_required: isIbbi
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
      .limit(1)
      .maybeSingle();

    if (!existingEvidence) {
      const { error: evidenceError } = await db.from('claim_evidence').insert({
        claimable_id: claimable.id,
        source_document_id: doc.id,
        supports_field: deadline ? 'deadline' : 'claimability',
        evidence_text: deadline
          ? `The official announcement states a creditor claim deadline of ${deadline.slice(0, 10)}.`
          : 'The official SEBI notice title explicitly identifies a refund process.',
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

    published.push({ slug: claimable.slug, title: claimable.public_title, source: doc.canonical_url });
  }

  return NextResponse.json({ ok: true, mode: 'run', projectRef, publishedCount: published.length, published });
}
