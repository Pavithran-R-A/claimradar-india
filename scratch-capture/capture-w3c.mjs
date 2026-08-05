// Live capture of the W3C news feed for generic-rss commissioning evidence.
// Transparent UA, standard TLS verification, no special flags.
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const url = 'https://www.w3.org/news/feed/';
const start = Date.now();
const res = await fetch(url, {
  redirect: 'follow',
  headers: {
    'user-agent': 'ClaimRadar India Bot/1.0 (+https://claimradar.in)',
    accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
  },
});
const body = await res.text();
const durationMs = Date.now() - start;

const meta = {
  requestedUrl: url,
  finalUrl: res.url,
  redirected: res.redirected,
  httpStatus: res.status,
  contentType: res.headers.get('content-type'),
  bodySizeBytes: Buffer.byteLength(body, 'utf-8'),
  sha256: createHash('sha256').update(body, 'utf-8').digest('hex'),
  etag: res.headers.get('etag'),
  lastModified: res.headers.get('last-modified'),
  durationMs,
  capturedAt: new Date().toISOString(),
  userAgent: 'ClaimRadar India Bot/1.0 (+https://claimradar.in)',
};

writeFileSync(new URL('./w3c-news-feed.xml', import.meta.url), body);
writeFileSync(new URL('./w3c-news-feed.meta.json', import.meta.url), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));

// Item quality scan
const links = [...body.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
const pubDates = [...body.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => m[1]);
const guids = [...body.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1]);
console.log('link tags (incl channel):', links.length);
console.log('first 3 item links:', links.slice(1, 4));
console.log('pubDates:', pubDates.length, '| newest:', pubDates[0], '| oldest:', pubDates.at(-1));
console.log('guids:', guids.length);
console.log('parseable dates:', pubDates.filter((d) => !Number.isNaN(Date.parse(d))).length);
