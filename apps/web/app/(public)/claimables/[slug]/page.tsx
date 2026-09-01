import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  Landmark,
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
    title: `${claim.title} — Official Claim Dossier | ClaimRadar India`,
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

  // Related records: same company first, then same sector
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
        <div className="mt-4">
          <DemoDataBanner />
        </div>
      )}

      {/* Main Dossier Grid */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px] items-start">
        <ClaimableDossier claim={claim} related={related} />
        <DossierSidebar claim={claim} />
      </div>

      <DisclaimerFooter />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/claimables"
      className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-trust-primary transition-colors"
    >
      <ChevronLeft aria-hidden className="h-4 w-4" />
      Back to claims directory
    </Link>
  );
}

function DossierSectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border pb-2.5 mb-4">
      <span className="font-mono text-xs font-bold text-trust-primary">{number}</span>
      <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">{title}</h2>
    </div>
  );
}

function ClaimableDossier({
  claim,
  related,
}: {
  claim: PublishedClaimable;
  related: PublishedClaimable[];
}) {
  return (
    <article className="min-w-0">
      {/* Dossier Top Ledger Header */}
      <header className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <StatusBadge status={claim.status} />
            <span className="font-mono text-xs text-text-muted">REF: {claim.slug}</span>
          </div>
          <span className="text-text-muted">
            Verified:{' '}
            <time dateTime={claim.lastVerifiedAt}>{formatIstDate(claim.lastVerifiedAt)}</time>
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight tracking-tight text-text-primary">
          {claim.title}
        </h1>

        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          {claim.statusExplanation}
        </p>

        {/* Entity & Sector Attribution */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-text-muted">
          <span>
            Entity:{' '}
            {claim.companySlug ? (
              <Link
                href={`/companies/${claim.companySlug}`}
                className="font-bold text-trust-primary hover:underline"
              >
                {claim.companyName}
              </Link>
            ) : (
              <strong className="text-text-primary">{claim.companyName}</strong>
            )}
          </span>
          <span aria-hidden>•</span>
          <span>
            Sector:{' '}
            {claim.sectorSlug ? (
              <Link
                href={`/sectors/${claim.sectorSlug}`}
                className="hover:text-trust-primary hover:underline"
              >
                {claim.sector}
              </Link>
            ) : (
              <span>{claim.sector}</span>
            )}
          </span>
        </div>
      </header>

      {/* Freshness Advisory if present */}
      {claim.freshnessWarning && (
        <div
          role="note"
          className="mt-6 rounded-md border border-deadline/40 bg-deadline-background p-4 text-xs sm:text-sm"
        >
          <p className="flex items-center gap-2 font-bold text-text-primary">
            <TriangleAlert aria-hidden className="h-4 w-4 text-deadline" />
            Freshness Advisory
          </p>
          <p className="mt-1 text-text-secondary">{claim.freshnessWarning}</p>
        </div>
      )}

      {/* Dossier Structured Sections */}
      <div className="mt-8 space-y-8">
        {/* Section 1: Who May Qualify */}
        <section aria-labelledby="who-qualifies">
          <DossierSectionHeading number="01" title="Who May Qualify" />
          <div className="rounded-md border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary">
            <p>{claim.affectedGroup}</p>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Publication of this record is not a legal determination of eligibility. Official scheme
            terms decide.
          </p>
        </section>

        {/* Section 2: Relief Stated */}
        <section aria-labelledby="relief">
          <DossierSectionHeading number="02" title="Relief Stated in Official Record" />
          <div className="rounded-md border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary">
            <p className="font-semibold text-text-primary">
              {claim.reliefAmount ||
                'No specific compensation figure is stated in the sources reviewed. Refer to the official order for exact terms.'}
            </p>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            ClaimRadar only publishes figures explicitly stated in the regulatory order — never
            estimates.
          </p>
        </section>

        {/* Section 3: Proof Requirements */}
        <section aria-labelledby="proof">
          <DossierSectionHeading number="03" title="Evidentiary Proof & Documents Required" />
          {claim.proofRequirements.length > 0 ? (
            <ul className="space-y-2">
              {claim.proofRequirements.map((req, idx) => (
                <li
                  key={req}
                  className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary"
                >
                  <span className="font-mono text-xs font-bold text-trust-primary mt-0.5">
                    {idx + 1}.
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-border bg-surface p-4 text-xs text-text-muted">
              No specific proof requirements are recorded in this notice. Refer to the official
              portal below.
            </p>
          )}
        </section>

        {/* Section 4: Official Action Pathway */}
        <section aria-labelledby="action-route">
          <DossierSectionHeading number="04" title="Official Action Pathway" />
          <div className="rounded-md border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary">
            <p>{claim.actionRoute}</p>
            {claim.officialRouteUrl ? (
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href={claim.officialRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-trust-primary px-5 text-sm font-bold text-white transition-colors hover:bg-trust-primary-hover shadow-sm"
                >
                  <span>Go to official authority portal</span>
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="mt-3 text-xs text-text-muted">
                No direct digital filing URL is available. Refer to the official source documents
                below.
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            You submit your claim directly to the company or statutory regulator. ClaimRadar never
            collects claim documents or acts as a broker.
          </p>
        </section>

        {/* Section 5: Official Source Documents */}
        <section aria-labelledby="sources">
          <DossierSectionHeading number="05" title="Authenticated Regulatory Documents" />
          {claim.officialSources.length === 0 ? (
            <p className="text-xs text-text-muted">Source documents are undergoing indexing.</p>
          ) : (
            <ul className="space-y-2">
              {claim.officialSources.map((src) => (
                <li key={`${src.name}-${src.url}`}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-trust-primary/40 hover:bg-surface-strong/40"
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text-primary group-hover:text-trust-primary">
                        {src.name}
                      </span>
                      {src.publishedAt && (
                        <span className="text-xs text-text-muted">
                          Dated:{' '}
                          <time dateTime={src.publishedAt}>{formatIstDate(src.publishedAt)}</time>
                        </span>
                      )}
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-text-muted group-hover:text-trust-primary"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 6: Editorial Verification Statement */}
        <section aria-labelledby="verification">
          <DossierSectionHeading number="06" title="Editorial Verification Statement" />
          <div className="rounded-md border border-border bg-surface-strong/50 p-4 text-xs text-text-secondary leading-relaxed">
            <p className="flex items-center gap-1.5 font-bold text-text-primary mb-1">
              <ShieldCheck className="h-4 w-4 text-trust-primary" />
              Human Editorial Review Completed
            </p>
            <p>{claim.evidenceSummary}</p>
          </div>
        </section>

        {/* Related Claims in Same Sector / Entity */}
        {related.length > 0 && (
          <section aria-labelledby="related" className="pt-6 border-t border-border">
            <h3 id="related" className="text-base font-bold text-text-primary mb-3">
              Related Opportunities
            </h3>
            <div className="space-y-3">
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

function DossierSidebar({ claim }: { claim: PublishedClaimable }) {
  const deadline = formatIstDate(claim.deadlineDate);
  const phrase = deadlinePhrase(claim.deadlineDate);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      {/* Dossier Action Card */}
      <div className="rounded-md border border-border bg-surface p-5 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
          Claim Summary
        </span>

        <dl className="space-y-3.5 text-xs">
          <div>
            <dt className="text-text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={claim.status} />
            </dd>
          </div>

          <div className="border-t border-border pt-3">
            <dt className="text-text-muted">Recorded Deadline</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {deadline ? (
                <div>
                  <time dateTime={claim.deadlineDate!}>{deadline}</time>
                  {phrase && (
                    <span className="block text-deadline text-xs font-bold mt-0.5">{phrase}</span>
                  )}
                </div>
              ) : (
                'No statutory deadline recorded'
              )}
            </dd>
          </div>

          <div className="border-t border-border pt-3">
            <dt className="text-text-muted">Monitored Authority</dt>
            <dd className="mt-1 font-semibold text-text-primary flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-trust-primary" />
              {claim.companyName || 'Official Regulatory Authority'}
            </dd>
          </div>
        </dl>

        {claim.officialRouteUrl && (
          <div className="mt-5 pt-4 border-t border-border">
            <a
              href={claim.officialRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-trust-primary px-4 text-xs font-bold text-white transition-colors hover:bg-trust-primary-hover shadow-sm"
            >
              <span>Submit on official portal</span>
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Record Provenance Timeline */}
      <div className="rounded-md border border-border bg-surface p-4 text-xs">
        <span className="font-bold uppercase tracking-wider text-text-muted block mb-2.5 text-xs">
          Record Provenance
        </span>
        <dl className="space-y-2 text-xs">
          <div className="flex justify-between">
            <dt className="text-text-muted">First Published:</dt>
            <dd className="font-mono text-text-primary">{formatIstDateTime(claim.publishedAt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Last Verified:</dt>
            <dd className="font-mono text-text-primary">
              {formatIstDateTime(claim.lastVerifiedAt)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Last Source Check:</dt>
            <dd className="font-mono text-text-primary">
              {formatIstDateTime(claim.lastCheckedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Correction Link */}
      <div className="text-center">
        <Link
          href="/corrections"
          className="text-xs text-text-muted hover:text-trust-primary hover:underline transition-colors"
        >
          Found an error? Submit an editorial correction →
        </Link>
      </div>
    </aside>
  );
}

function DisclaimerFooter() {
  return (
    <footer className="mt-12 border-t border-border pt-6 text-xs text-text-muted">
      <p>
        <strong>Legal notice: </strong> ClaimRadar India is an independent information service. We
        are not affiliated with any court, tribunal, regulatory body, or corporate entity. We do not
        guarantee individual claim outcomes or provide legal representation. Always verify all
        instructions and deadlines on the official authority portal.
      </p>
    </footer>
  );
}
