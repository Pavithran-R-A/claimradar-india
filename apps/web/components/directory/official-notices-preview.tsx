import { getAdminDb } from '@/lib/admin-db';

interface OfficialNotice {
  title: string;
  url: string;
  authority: string;
}

const PUBLIC_SOURCE_HOSTS = new Set([
  'www.sebi.gov.in',
  'sebi.gov.in',
  'www.rbi.org.in',
  'rbi.org.in',
  'www.ibbi.gov.in',
  'ibbi.gov.in',
  'pib.gov.in',
  'www.pib.gov.in',
]);

function safeOfficialUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !PUBLIC_SOURCE_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

const OFFICIAL_SOURCE_NAMES: Readonly<Record<string, string>> = {
  'www.sebi.gov.in': 'Securities and Exchange Board of India (SEBI)',
  'sebi.gov.in': 'Securities and Exchange Board of India (SEBI)',
  'www.rbi.org.in': 'Reserve Bank of India (RBI)',
  'rbi.org.in': 'Reserve Bank of India (RBI)',
  'www.ibbi.gov.in': 'Insolvency and Bankruptcy Board of India (IBBI)',
  'ibbi.gov.in': 'Insolvency and Bankruptcy Board of India (IBBI)',
  'pib.gov.in': 'Press Information Bureau (PIB)',
  'www.pib.gov.in': 'Press Information Bureau (PIB)',
};

async function getMonitoredRefundNotices(): Promise<OfficialNotice[]> {
  try {
    const db = getAdminDb();
    const { data, error } = await db
      .from('source_documents')
      // Avoid a joined-relationship failure hiding all genuine official notices.
      // The approved HTTPS government-host allowlist below is authoritative.
      .select('title,canonical_url')
      .ilike('title', '%refund%')
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) {
      console.error('Official notice directory query failed', { code: error.code ?? 'unknown' });
      return [];
    }

    const notices: OfficialNotice[] = [];
    const seen = new Set<string>();
    for (const row of data ?? []) {
      const url = safeOfficialUrl(row.canonical_url);
      const title = typeof row.title === 'string' ? row.title.trim() : '';
      const authority = url ? OFFICIAL_SOURCE_NAMES[new URL(url).hostname.toLowerCase()] : null;
      if (!url || title.length < 10 || !authority || seen.has(url)) continue;
      seen.add(url);
      notices.push({ title, url, authority });
      if (notices.length >= 5) break;
    }
    if (notices.length === 0) {
      console.warn('No official refund notices passed strict source link filters', {
        rowsReturned: (data ?? []).length,
      });
    }
    return notices;
  } catch (error) {
    console.error('Official notice directory lookup failed', {
      errorName: error instanceof Error ? error.name : 'unknown',
    });
    return [];
  }
}

/**
 * Raw source notices are NOT eligible claims and must never be placed inside
 * getPublishedClaimables or marked verified. This is only a transparent path
 * to the original government publications during the editorial review period.
 */
export async function OfficialNoticesPreview() {
  const notices = await getMonitoredRefundNotices();
  if (notices.length === 0) return null;

  return (
    <section
      aria-labelledby="monitored-official-notices"
      className="mt-8 rounded-md border border-border bg-surface p-5 sm:p-6"
    >
      <h2 id="monitored-official-notices" className="text-lg font-bold text-text-primary">
        Official refund notices currently monitored
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        These are links to original government notices, NOT published or verified ClaimKhoj
        opportunities. Eligibility, deadlines and whether applications remain open have not yet been
        verified by ClaimKhoj. Check each authority&apos;s original publication before acting.
      </p>
      <ul className="mt-4 divide-y divide-border">
        {notices.map((notice) => (
          <li key={notice.url} className="py-3">
            <a
              href={notice.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm font-semibold text-trust-primary underline-offset-2 hover:underline"
            >
              {notice.title}
            </a>
            <p className="mt-1 text-xs text-text-secondary">
              {notice.authority} · Official notice under review
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
