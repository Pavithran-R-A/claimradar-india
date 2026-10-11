import { getAdminDb } from '@/lib/admin-db';
import { rankNotices, type SourceNoticeRow } from '@/lib/official-notice-ranking';

const referenceNotices: SourceNoticeRow[] = [
  {
    title: 'Citrus Check Inns and Royal Twinkle Star Club Phase-II refund notice',
    canonical_url:
      'https://www.sebi.gov.in/media-and-notifications/public-notices/sep-2026/public-notice-in-the-matter-of-citrus-check-inns-limited-and-royal-twinkle-star-club-pvt-ltd-for-refund-phase-ii-_104402.html',
    published_at: '2026-09-10T00:00:00.000Z',
  },
  {
    title: 'CRCS-Sahara refund portal — official Ministry of Cooperation notice',
    canonical_url: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2308015',
    published_at: null,
  },
];

async function loadNotices(): Promise<{ rows: SourceNoticeRow[]; offline: boolean }> {
  try {
    const { data, error } = await getAdminDb()
      .from('source_documents')
      .select('title,canonical_url,published_at')
      .ilike('title', '%refund%')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(100);
    if (error) {
      console.error('Official notices query failed', { code: error.code ?? 'unknown' });
      return { rows: referenceNotices, offline: true };
    }
    return { rows: (data ?? []) as SourceNoticeRow[], offline: false };
  } catch (error) {
    console.error('Official notices lookup failed', {
      errorName: error instanceof Error ? error.name : 'unknown',
    });
    return { rows: referenceNotices, offline: true };
  }
}

function displayDate(value: string | null): string | null {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Public government notice references, never approved claimables. */
export async function OfficialNoticesPreview({ search = '' }: { search?: string }) {
  const { rows, offline } = await loadNotices();
  const notices = rankNotices(rows, search);
  return (
    <section
      aria-labelledby="official-notices-title"
      className="rounded-md border border-border bg-surface p-5 sm:p-7"
    >
      <div className="border-b border-border pb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-trust-primary">
          0 published claimables · Publication review ongoing
        </p>
        <h2
          id="official-notices-title"
          className="mt-2 font-display text-xl font-bold text-text-primary sm:text-2xl"
        >
          Official refund notices under review
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
          ClaimKhoj has not yet approved any claimable listings. These are original government
          notices for reference, not confirmed eligibility or open applications. Always check the
          authority's website before taking action.
        </p>
      </div>
      {offline && (
        <p role="status" className="mt-4 text-xs text-text-secondary">
          The live notice feed is temporarily unavailable. Showing previously checked official
          source links for reference; their present status is not confirmed.
        </p>
      )}
      <div className="mt-3 divide-y divide-border">
        {notices.length === 0 ? (
          <p className="py-5 text-sm text-text-secondary">
            {search
              ? 'No monitored notices match this search. Try a broader term.'
              : 'No notices are currently available for reference.'}
          </p>
        ) : (
          notices.map((notice) => (
            <article key={notice.topic} className="py-4">
              <a
                href={notice.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm font-semibold leading-relaxed text-trust-primary underline-offset-2 hover:underline"
              >
                {notice.title}
              </a>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {notice.authority}
                {displayDate(notice.publishedAt)
                  ? ' · Notice dated ' + displayDate(notice.publishedAt)
                  : ''}
                {' · Not independently approved'}
              </p>
            </article>
          ))
        )}
      </div>
      <p className="mt-3 border-t border-border pt-4 text-xs leading-relaxed text-text-secondary">
        Latest notice per refund matter is shown. Older updates are grouped to avoid misleading
        duplicate opportunities. Status and eligibility require official confirmation.
      </p>
    </section>
  );
}
