import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  ChevronLeft,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Landmark,
  ListChecks,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { PublishedClaimable } from '@/lib/claimables-repository';
import { getPublishedClaimableBySlug, getPublishedClaimables } from '@/lib/claimables-repository';
import { ClaimableRow } from '@/components/directory/claimable-card';
import { StatusBadge } from '@/components/directory/status-badge';
import { DataUnavailableNotice, DemoDataBanner } from '@/components/repository-states';
import { deadlinePhrase, formatIstDate, formatIstDateTime } from '@/lib/dates';

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

// Detail content comes from the live publication database.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const outcome = await getPublishedClaimableBySlug(slug);
  if (!outcome.ok || !outcome.data) {
    return {
      title: 'Claim Not Found | ClaimRadar India',
      robots: { index: false, follow: false },
    };
  }
  const claim = outcome.data;
  return {
    title: `${claim.title} — Official Claim Details | ClaimRadar India`,
    description: `${claim.statusExplanation} Verification and official source links for ${claim.companyName}.`,
    alternates: {
      canonical: `https://claimradar.in/claimables/${claim.slug}`,
    },
  };
}

export default async function ClaimableDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const outcome = await getPublishedClaimableBySlug(slug);

  if (outcome.ok && !outcome.data) {
    notFound();
  }

  if (!outcome.ok) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <BackLink />
        <div className="mt-6">
          <DataUnavailableNotice message={outcome.error} />
        </div>
      </div>
    );
  }

  const claim = outcome.data!;

  // Related records: same company first, then same sector (real records only).
  const relatedOutcome = await getPublishedClaimables({ limit: 500 });
  const related = relatedOutcome.ok
    ? relatedOutcome.data.items
        .filter((c) => c.id !== claim.id)
        .filter((c) => c.companySlug === claim.companySlug || c.sectorSlug === claim.sectorSlug)
        .sort((a, b) => {
          const aSameCompany = a.companySlug === claim.companySlug ? 0 : 1;
          const bSameCompany = b.companySlug === claim.companySlug ? 0 : 1;
          return aSameCompany - bSameCompany;
        })
        .slice(0, 3)
    : [];

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
      <BackLink />
      {outcome.demo && (
        <div className="mt-6">
          <DemoDataBanner />
        </div>
      )}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ClaimableDetail claim={claim} related={related} />
        <SummaryPanel claim={claim} />
      </div>
      <DisclaimerFooter />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/claimables"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
    >
      <ChevronLeft aria-hidden className="h-4 w-4" />
      Back to directory
    </Link>
  );
}

function SectionHeading({ icon: Icon, children }: { icon: typeof Users; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
      <Icon aria-hidden className="h-5 w-5 text-trust-primary" />
      {children}
    </h2>
  );
}

function ClaimableDetail({
  claim,
  related,
}: {
  claim: PublishedClaimable;
  related: PublishedClaimable[];
}) {
  const deadline = formatIstDate(claim.deadlineDate);

  return (
    <article className="min-w-0">
      {/* Direct-answer header */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={claim.status} />
          <span className="text-xs font-medium text-text-muted">{claim.statusDetail}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
          {claim.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          {claim.statusExplanation}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
          {claim.companySlug ? (
            <Link
              href={`/companies/${claim.companySlug}`}
              className="font-medium text-trust-primary underline-offset-2 hover:underline"
            >
              {claim.companyName}
            </Link>
          ) : (
            <span className="font-medium text-text-secondary">{claim.companyName}</span>
          )}
          <span aria-hidden>·</span>
          {claim.sectorSlug ? (
            <Link
              href={`/sectors/${claim.sectorSlug}`}
              className="underline-offset-2 hover:text-trust-primary hover:underline"
            >
              {claim.sector}
            </Link>
          ) : (
            <span>{claim.sector}</span>
          )}
        </div>
      </header>

      {claim.freshnessWarning && (
        <div
          role="note"
          className="mt-6 rounded-card border border-deadline/40 bg-deadline-background p-4 text-sm"
        >
          <p className="flex items-center gap-2 font-semibold text-text-primary">
            <TriangleAlert aria-hidden className="h-4 w-4 text-deadline" />
            Freshness advisory
          </p>
          <p className="mt-1 text-text-secondary">{claim.freshnessWarning}</p>
        </div>
      )}

      <div className="mt-10 space-y-10">
        {/* Who may qualify */}
        <section aria-labelledby="who-qualifies">
          <SectionHeading icon={Users}>
            <span id="who-qualifies">Who may qualify</span>
          </SectionHeading>
          <p className="mt-3 rounded-card border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary shadow-card">
            {claim.affectedGroup}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Publication of this record is not a determination of eligibility. The official scheme
            terms always decide.
          </p>
        </section>

        {/* Relief */}
        <section aria-labelledby="relief">
          <SectionHeading icon={ClipboardCheck}>
            <span id="relief">Relief stated</span>
          </SectionHeading>
          <p className="mt-3 rounded-card border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary shadow-card">
            {claim.reliefAmount ||
              'No specific amount is stated in the sources we reviewed. Refer to the official order for the exact terms.'}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            We only show relief figures or terms that appear in the official record — never
            estimates.
          </p>
        </section>

        {/* Proof needed */}
        <section aria-labelledby="proof">
          <SectionHeading icon={ListChecks}>
            <span id="proof">Proof you may need</span>
          </SectionHeading>
          {claim.proofRequirements.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {claim.proofRequirements.map((req) => (
                <li
                  key={req}
                  className="flex items-start gap-2.5 rounded-card border border-border bg-surface px-4 py-3 text-sm text-text-secondary shadow-card"
                >
                  <FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                  {req}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">
              No specific proof requirements are recorded yet. The official route below will state
              what evidence is needed.
            </p>
          )}
        </section>

        {/* Official action route */}
        <section aria-labelledby="action-route">
          <SectionHeading icon={Landmark}>
            <span id="action-route">Official action route</span>
          </SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{claim.actionRoute}</p>
          {claim.officialRouteUrl ? (
            <a
              href={claim.officialRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-field bg-trust-primary px-5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
            >
              Go to the official portal
              <ExternalLink aria-hidden className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-3 rounded-card border border-dashed border-border bg-surface p-4 text-xs text-text-muted">
              No official claim portal URL is recorded for this listing yet. Refer to the source
              documents below.
            </p>
          )}
          <p className="mt-2 text-xs text-text-muted">
            You submit directly to the company or authority. ClaimRadar never files claims on your
            behalf.
          </p>
        </section>

        {/* Evidence summary */}
        <section aria-labelledby="evidence">
          <SectionHeading icon={ShieldCheck}>
            <span id="evidence">How we verified this</span>
          </SectionHeading>
          <p className="mt-3 rounded-card border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary shadow-card">
            {claim.evidenceSummary}
          </p>
        </section>

        {/* Sources */}
        <section aria-labelledby="sources">
          <SectionHeading icon={FileText}>
            <span id="sources">Official sources</span>
          </SectionHeading>
          {claim.officialSources.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">
              Source documents for this record have not been linked yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {claim.officialSources.map((src) => (
                <li key={`${src.name}-${src.url}`}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card transition-colors duration-fast hover:border-trust-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text-primary group-hover:text-trust-primary">
                        {src.name}
                      </span>
                      {src.publishedAt && (
                        <span className="text-xs text-text-muted">
                          Source dated{' '}
                          <time dateTime={src.publishedAt}>
                            {formatIstDate(src.publishedAt) ?? src.publishedAt}
                          </time>
                        </span>
                      )}
                    </span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Update history (record timeline) */}
        <section aria-labelledby="update-history">
          <SectionHeading icon={CalendarClock}>
            <span id="update-history">Record timeline</span>
          </SectionHeading>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'First published', value: claim.publishedAt },
              { label: 'Last checked against sources', value: claim.lastCheckedAt },
              { label: 'Last verified by editors', value: claim.lastVerifiedAt },
            ].map((entry) => (
              <div
                key={entry.label}
                className="rounded-card border border-border bg-surface p-4 shadow-card"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {entry.label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-text-primary">
                  <time dateTime={entry.value}>
                    {formatIstDateTime(entry.value) ?? entry.value}
                  </time>
                </dd>
              </div>
            ))}
          </dl>
          {deadline && claim.deadlineDate && (
            <p className="mt-3 text-sm text-text-secondary">
              Recorded deadline:{' '}
              <time dateTime={claim.deadlineDate} className="font-semibold text-deadline">
                {deadline}
              </time>{' '}
              {deadlinePhrase(claim.deadlineDate) && (
                <span className="text-text-muted">({deadlinePhrase(claim.deadlineDate)})</span>
              )}{' '}
              — confirm on the official source before relying on this date.
            </p>
          )}
        </section>

        {/* Corrections */}
        <section aria-labelledby="corrections">
          <SectionHeading icon={TriangleAlert}>
            <span id="corrections">Spotted an error?</span>
          </SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            If something here is inaccurate or out of date, submit a correction and our editors will
            re-check the record against its official sources.
          </p>
          <Link
            href="/corrections"
            className="mt-3 inline-flex h-11 items-center rounded-field border border-border bg-surface px-5 text-sm font-semibold text-text-primary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary"
          >
            Submit a correction
          </Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section aria-labelledby="related">
            <SectionHeading icon={ListChecks}>
              <span id="related">Related records</span>
            </SectionHeading>
            <div className="mt-3 space-y-3">
              {related.map((item) => (
                <ClaimableRow key={item.id} claim={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function SummaryPanel({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  return (
    <aside aria-label="Record summary" className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          At a glance
        </h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs text-text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={claim.status} />
            </dd>
          </div>
          {deadline && claim.deadlineDate && (
            <div>
              <dt className="text-xs text-text-muted">Deadline</dt>
              <dd className="mt-1 font-semibold text-deadline">
                <time dateTime={claim.deadlineDate}>{deadline}</time>
                {deadlinePhrase(claim.deadlineDate) && (
                  <span className="ml-1.5 font-normal text-text-muted">
                    · {deadlinePhrase(claim.deadlineDate)}
                  </span>
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-text-muted">Company</dt>
            <dd className="mt-1 font-medium text-text-primary">{claim.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Sector</dt>
            <dd className="mt-1 font-medium text-text-primary">{claim.sector}</dd>
          </div>
          {claim.geographicScope && (
            <div>
              <dt className="text-xs text-text-muted">Geographic scope</dt>
              <dd className="mt-1 font-medium text-text-primary">{claim.geographicScope}</dd>
            </div>
          )}
          {claim.jurisdiction && (
            <div>
              <dt className="text-xs text-text-muted">Jurisdiction</dt>
              <dd className="mt-1 font-medium text-text-primary">{claim.jurisdiction}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-text-muted">Last verified</dt>
            <dd className="mt-1 font-medium text-text-primary">
              <time dateTime={claim.lastVerifiedAt}>
                {formatIstDateTime(claim.lastVerifiedAt) ?? claim.lastVerifiedAt}
              </time>
            </dd>
          </div>
        </dl>

        {claim.officialRouteUrl ? (
          <a
            href={claim.officialRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field bg-trust-primary px-4 text-sm font-semibold text-white transition-colors duration-fast hover:bg-trust-primary-hover"
          >
            Official portal
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        ) : null}

        <Link
          href="/register"
          className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-border px-4 text-sm font-semibold text-text-primary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary"
        >
          <BellRing aria-hidden className="h-4 w-4" />
          Watch this company
        </Link>
        <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
          Watching alerts you when new records are published. It does not guarantee eligibility.
        </p>
      </div>
    </aside>
  );
}

function DisclaimerFooter() {
  return (
    <div className="mt-12 rounded-card border border-border bg-background-elevated p-5 text-center text-xs leading-relaxed text-text-muted">
      <strong className="font-semibold text-text-secondary">
        Independent information disclaimer:
      </strong>{' '}
      ClaimRadar India is an independent informational tracking service. We are not a law firm, a
      claim filing agent or a government authority. Publication does not mean you are eligible.
      Submit all claims directly through official government or company portals.
    </div>
  );
}
