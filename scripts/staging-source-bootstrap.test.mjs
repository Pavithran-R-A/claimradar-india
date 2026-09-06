import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStagingTarget, buildStagingSourceRecord } from './staging-source-bootstrap.mjs';

test('builds only registry-backed source configuration', () => {
  const source = {
    id: 'pib-rss',
    name: 'Press Information Bureau RSS',
    domain: 'pib.gov.in',
    sourceType: 'rss',
    adapterType: 'rss-pib',
    baseUrl: 'https://www.pib.gov.in',
    feedUrl: 'https://www.pib.gov.in/RssMain.aspx?ModId=6',
    trustLevel: 'official',
    rateLimit: { requestsPerMinute: 10 },
  };

  assert.deepEqual(buildStagingSourceRecord(source), {
    name: source.name,
    domain: source.domain,
    base_url: source.baseUrl,
    source_type: source.sourceType,
    adapter_name: source.adapterType,
    trust_level: source.trustLevel,
    enabled: true,
    fetch_frequency_hours: 6,
    rate_limit_per_minute: 10,
    metadata: {
      registryId: 'pib-rss',
      feedUrl: source.feedUrl,
    },
  });
});

test('rejects registry records without a stable identifier', () => {
  assert.throws(
    () => buildStagingSourceRecord({ id: '', name: 'invalid' }),
    /source registry id is required/i,
  );
});

test('rejects a staging ref paired with another Supabase host', () => {
  assert.throws(
    () => assertStagingTarget('https://different-project.supabase.co', 'upvsfqufkywlpibbwrse'),
    /does not match staging project ref/i,
  );
});
