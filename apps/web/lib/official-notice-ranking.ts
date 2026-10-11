export interface SourceNoticeRow {
  title: string | null;
  canonical_url: string | null;
  published_at: string | null;
}
export interface RankedNotice {
  title: string;
  url: string;
  authority: string;
  publishedAt: string | null;
  topic: string;
}
const authorities: Record<string, string> = {
  'www.sebi.gov.in': 'SEBI',
  'sebi.gov.in': 'SEBI',
  'www.rbi.org.in': 'RBI',
  'rbi.org.in': 'RBI',
  'pib.gov.in': 'PIB',
  'www.pib.gov.in': 'PIB',
  'ibbi.gov.in': 'IBBI',
  'www.ibbi.gov.in': 'IBBI',
};
export function rankNotices(rows: SourceNoticeRow[], search = ''): RankedNotice[] {
  const groups = new Map<string, RankedNotice>();
  for (const row of rows) {
    let url: URL;
    try {
      url = new URL(row.canonical_url || '');
    } catch {
      continue;
    }
    const authority = authorities[url.hostname.toLowerCase()];
    if (url.protocol !== 'https:' || !authority || !row.title || row.title.trim().length < 10)
      continue;
    const title = row.title.trim();
    const name = title.toLowerCase();
    const topic = /citrus check inns|royal twinkle star/.test(name)
      ? 'citrus-royal'
      : /crcs|sahara/.test(name)
        ? 'crcs-sahara'
        : name.replace(/[^a-z0-9]+/g, ' ').trim();
    const concise =
      topic === 'citrus-royal'
        ? 'Citrus Check Inns & Royal Twinkle Star Club — refund'
        : topic === 'crcs-sahara'
          ? 'CRCS–Sahara refund portal'
          : title;
    const value = {
      title: concise,
      url: url.href,
      authority,
      publishedAt: row.published_at,
      topic,
    };
    const previous = groups.get(topic);
    const time = (v: string | null) => (v ? Date.parse(v) || 0 : 0);
    if (!previous || time(value.publishedAt) > time(previous.publishedAt)) groups.set(topic, value);
  }
  const term = search.trim().toLowerCase();
  return [...groups.values()]
    .filter(
      (x) => !term || (x.title + ' ' + x.authority + ' ' + x.topic).toLowerCase().includes(term),
    )
    .sort((a, b) => (Date.parse(b.publishedAt || '') || 0) - (Date.parse(a.publishedAt || '') || 0))
    .slice(0, 5);
}
