import { pathToFileURL } from 'node:url';

const EXPECTED_STAGING_PROJECT_REF = 'upvsfqufkywlpibbwrse';
const FETCH_FREQUENCY_HOURS = new Map([
  ['pib-rss', 6],
  ['sebi-rss', 12],
  ['rbi-rss', 12],
  ['rbi-notifications-rss', 12],
  ['ibbi-public-announcements', 24],
  ['sebi-public-notices', 24],
  ['trai-press-releases', 24],
]);

export function buildStagingSourceRecord(source) {
  if (!source?.id?.trim()) {
    throw new Error('Source registry id is required');
  }

  return {
    name: source.name,
    domain: source.domain,
    base_url: source.baseUrl,
    source_type: source.sourceType,
    adapter_name: source.adapterType,
    trust_level: source.trustLevel,
    enabled: true,
    fetch_frequency_hours: FETCH_FREQUENCY_HOURS.get(source.id) ?? 24,
    rate_limit_per_minute: source.rateLimit.requestsPerMinute,
    metadata: {
      registryId: source.id,
      ...(source.feedUrl ? { feedUrl: source.feedUrl } : {}),
    },
  };
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function assertStagingTarget(url, projectRef) {
  if (projectRef !== EXPECTED_STAGING_PROJECT_REF) {
    throw new Error(`Refusing non-staging project: ${projectRef}`);
  }

  const parsed = new URL(url);
  const expectedHostname = `${projectRef}.supabase.co`;
  if (parsed.protocol !== 'https:' || parsed.hostname !== expectedHostname) {
    throw new Error(`Supabase URL does not match staging project ref: ${projectRef}`);
  }
}

export async function bootstrapStagingSources({ url, secretKey, projectRef }) {
  assertStagingTarget(url, projectRef);
  const { createClient } = await import(
    new URL(
      '../packages/database/node_modules/@supabase/supabase-js/dist/index.mjs',
      import.meta.url,
    )
  );
  const { initialSources } = await import(
    new URL('../packages/source-registry/dist/index.js', import.meta.url)
  );
  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingRows, error: readError } = await supabase
    .from('sources')
    .select('id, metadata');
  if (readError) throw new Error(`Could not read staging sources: ${readError.message}`);

  const existingByRegistryId = new Map(
    (existingRows ?? [])
      .map((row) => [row.metadata?.registryId, row.id])
      .filter(([registryId]) => typeof registryId === 'string' && registryId.length > 0),
  );

  let inserted = 0;
  let updated = 0;
  for (const source of initialSources) {
    const record = buildStagingSourceRecord(source);
    const existingId = existingByRegistryId.get(source.id);
    const result = existingId
      ? await supabase.from('sources').update(record).eq('id', existingId)
      : await supabase.from('sources').insert(record);
    if (result.error) {
      throw new Error(`Could not bootstrap ${source.id}: ${result.error.message}`);
    }
    if (existingId) updated += 1;
    else inserted += 1;
  }

  return { total: initialSources.length, inserted, updated };
}

async function main() {
  const result = await bootstrapStagingSources({
    url: requiredEnvironment('STAGING_SUPABASE_URL'),
    secretKey: requiredEnvironment('STAGING_SUPABASE_SECRET_KEY'),
    projectRef: requiredEnvironment('STAGING_SUPABASE_PROJECT_REF'),
  });
  console.log(
    `Staging source bootstrap passed: ${result.total} registry sources (${result.inserted} inserted, ${result.updated} updated).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Staging source bootstrap failed');
    process.exitCode = 1;
  });
}
