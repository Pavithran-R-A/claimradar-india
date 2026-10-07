import { createClient } from 'npm:@supabase/supabase-js@2.110.8';

const EXPECTED_PROJECT_REF = 'upvsfqufkywlpibbwrse';
const WORKER_TOKEN_SHA256 = '3d3f338a002b404bb3595680daf1ba7670b86c9b4b8c59cca120119ffd8b909a';
const MAX_BODY_BYTES = 12 * 1024 * 1024;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function authorize(request: Request): Promise<boolean> {
  const token = request.headers.get('x-claimradar-worker-token') ?? '';
  if (token.length < 32 || token.length > 256) return false;
  const digest = await sha256Hex(token);
  return timingSafeEqualHex(digest, WORKER_TOKEN_SHA256);
}

function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  if (url !== `https://${EXPECTED_PROJECT_REF}.supabase.co`) {
    throw new Error('PROJECT_REF_MISMATCH');
  }

  let secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const secretKeysJson = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeysJson) {
    const parsed = JSON.parse(secretKeysJson) as Record<string, string>;
    secretKey = parsed.default ?? Object.values(parsed)[0] ?? secretKey;
  }
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY_UNAVAILABLE');

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function sanitizeText(value: string): string {
  let sanitized = '';
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit === 0) continue;
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        sanitized += value[index] + value[index + 1];
        index += 1;
      } else {
        sanitized += '\ufffd';
      }
      continue;
    }
    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      sanitized += '\ufffd';
      continue;
    }
    sanitized += value[index];
  }
  return sanitized;
}

function sanitizeJson(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeText(value);
  if (Array.isArray(value)) return value.map(sanitizeJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeJson(item)]),
    );
  }
  return value;
}

function sanitizeRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      key === 'metadata'
        ? sanitizeJson(value)
        : typeof value === 'string'
          ? sanitizeText(value)
          : value,
    ]),
  );
}

function requireObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`INVALID_${name.toUpperCase()}`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`INVALID_${name.toUpperCase()}`);
  return value;
}

function dbError(label: string, error: { message?: string; code?: string } | null): never {
  throw new Error(`${label}:${error?.code ?? 'DB_ERROR'}:${error?.message ?? 'unknown'}`);
}

async function executeOperation(
  db: ReturnType<typeof getAdminClient>,
  operation: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (operation) {
    case 'createCrawlRun': {
      const id = typeof args.runId === 'string' && args.runId ? args.runId : crypto.randomUUID();
      const status = requireString(args.status, 'status');
      const { error } = await db.from('crawl_runs').insert({
        id,
        started_at: new Date().toISOString(),
        status,
        sources_attempted: 0,
        sources_succeeded: 0,
        documents_discovered: 0,
        candidates_created: 0,
        ai_budget_used: 0,
        metadata: {},
      });
      if (error) dbError('CREATE_CRAWL_RUN', error);
      return { id };
    }

    case 'updateCrawlRun': {
      const id = requireString(args.id, 'id');
      const updates = requireObject(args.updates, 'updates');
      const { error } = await db.from('crawl_runs').update(updates).eq('id', id);
      if (error) dbError('UPDATE_CRAWL_RUN', error);
      return { ok: true };
    }

    case 'createCrawlRunSource': {
      const id = crypto.randomUUID();
      const runId = requireString(args.runId, 'runId');
      const sourceId = requireString(args.sourceId, 'sourceId');
      const status = requireString(args.status, 'status');
      const { error } = await db.from('crawl_run_sources').insert({
        id,
        crawl_run_id: runId,
        source_id: sourceId,
        status,
        documents_found: 0,
        error_message: null,
        started_at: new Date().toISOString(),
        completed_at: null,
      });
      if (error) dbError('CREATE_CRAWL_RUN_SOURCE', error);
      return { id };
    }

    case 'updateCrawlRunSource': {
      const id = requireString(args.id, 'id');
      const updates = requireObject(args.updates, 'updates');
      const { error } = await db.from('crawl_run_sources').update(updates).eq('id', id);
      if (error) dbError('UPDATE_CRAWL_RUN_SOURCE', error);
      return { ok: true };
    }

    case 'insertCrawlError': {
      const runId = requireString(args.runId, 'runId');
      const err = requireObject(args.error, 'error');
      const { error } = await db.from('crawl_errors').insert({
        crawl_run_id: runId,
        source_id: typeof err.source_id === 'string' ? err.source_id : null,
        error_type: requireString(err.error_type, 'error_type'),
        error_message: requireString(err.error_message, 'error_message'),
        url: typeof err.url === 'string' ? err.url : null,
      });
      if (error) dbError('INSERT_CRAWL_ERROR', error);
      return { ok: true };
    }

    case 'insertSourceDocument': {
      const raw = requireObject(args.doc, 'doc');
      const doc = sanitizeRecord(raw);
      const id = crypto.randomUUID();
      const { data, error } = await db
        .from('source_documents')
        .upsert(
          { ...doc, id, retrieved_at: new Date().toISOString() },
          { onConflict: 'source_id,content_hash', ignoreDuplicates: true },
        )
        .select('id')
        .maybeSingle();
      if (error) {
        if (error.code === '23505') return { id: null };
        dbError('INSERT_SOURCE_DOCUMENT', error);
      }
      return { id: data?.id ?? null };
    }

    case 'insertCandidateDocument': {
      const doc = requireObject(args.doc, 'doc');
      const id = crypto.randomUUID();
      const { error } = await db.from('candidate_documents').insert({ ...doc, id });
      if (error) dbError('INSERT_CANDIDATE_DOCUMENT', error);
      return { id };
    }

    case 'updateCandidateDocument': {
      const id = requireString(args.id, 'id');
      const updates = requireObject(args.updates, 'updates');
      const { error } = await db.from('candidate_documents').update(updates).eq('id', id);
      if (error) dbError('UPDATE_CANDIDATE_DOCUMENT', error);
      return { ok: true };
    }

    case 'insertAiRun': {
      const run = requireObject(args.run, 'run');
      const id = crypto.randomUUID();
      const { error } = await db.from('ai_runs').insert({ ...run, id });
      if (error) dbError('INSERT_AI_RUN', error);
      return { id };
    }

    case 'insertValidationResult': {
      const result = requireObject(args.result, 'result');
      const id = crypto.randomUUID();
      const { error } = await db.from('validation_results').insert({ ...result, id });
      if (error) dbError('INSERT_VALIDATION_RESULT', error);
      return { id };
    }

    case 'insertPublicationEvent': {
      const event = requireObject(args.event, 'event');
      const id = crypto.randomUUID();
      const { error } = await db.from('publication_events').insert({ ...event, id });
      if (error) dbError('INSERT_PUBLICATION_EVENT', error);
      return { id };
    }

    case 'insertSourceHealthEvent': {
      const event = requireObject(args.event, 'event');
      const id = crypto.randomUUID();
      const { error } = await db.from('source_health_events').insert({
        ...event,
        id,
        checked_at: new Date().toISOString(),
      });
      if (error) dbError('INSERT_SOURCE_HEALTH_EVENT', error);
      return { id };
    }

    case 'getEnabledSources': {
      const { data, error } = await db.from('sources').select('*').eq('enabled', true);
      if (error) dbError('GET_ENABLED_SOURCES', error);
      return { rows: data ?? [] };
    }

    case 'getSourceDocumentsForDedup': {
      const { data, error } = await db
        .from('source_documents')
        .select('id, source_id, canonical_url, content_hash, source_identifier, title, published_at');
      if (error) dbError('GET_SOURCE_DOCUMENTS_FOR_DEDUP', error);
      return { rows: data ?? [] };
    }

    case 'assignSourceDocumentToCluster': {
      const assignment = requireObject(args.assignment, 'assignment');
      const sourceDocumentId = requireString(assignment.sourceDocumentId, 'sourceDocumentId');
      const canonicalUrl = requireString(assignment.canonicalUrl, 'canonicalUrl');
      const contentHash = requireString(assignment.contentHash, 'contentHash');
      const title = typeof assignment.title === 'string' ? assignment.title : null;

      const { data: existing, error: lookupError } = await db
        .from('content_clusters')
        .select('id')
        .eq('canonical_hash', contentHash)
        .maybeSingle();
      if (lookupError) dbError('LOOKUP_CONTENT_CLUSTER', lookupError);

      let clusterId = existing?.id as string | undefined;
      if (!clusterId) {
        const { data, error } = await db
          .from('content_clusters')
          .insert({
            canonical_hash: contentHash,
            cluster_title: title,
            canonical_url: canonicalUrl,
          })
          .select('id')
          .single();

        if (error && error.code !== '23505') dbError('CREATE_CONTENT_CLUSTER', error);
        clusterId = data?.id as string | undefined;

        if (!clusterId) {
          const { data: retry, error: retryError } = await db
            .from('content_clusters')
            .select('id')
            .eq('canonical_hash', contentHash)
            .single();
          if (retryError || !retry?.id) dbError('RESOLVE_CONTENT_CLUSTER', retryError);
          clusterId = retry!.id as string;
        }
      }

      const { error: memberError } = await db.from('content_cluster_members').upsert(
        {
          cluster_id: clusterId,
          source_document_id: sourceDocumentId,
        },
        { onConflict: 'cluster_id,source_document_id', ignoreDuplicates: true },
      );
      if (memberError) dbError('ASSIGN_CONTENT_CLUSTER_MEMBER', memberError);
      return { id: clusterId };
    }

    case 'getDeferredCandidates': {
      const { data, error } = await db
        .from('candidate_documents')
        .select('*')
        .eq('ai_extraction_status', 'deferred');
      if (error) dbError('GET_DEFERRED_CANDIDATES', error);
      return { rows: data ?? [] };
    }

    default:
      throw new Error('OPERATION_NOT_ALLOWED');
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') {
    return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);
  }

  if (!(await authorize(request))) {
    return json({ error: 'UNAUTHORIZED' }, 401);
  }

  try {
    const body = await request.json();
    const input = requireObject(body, 'body');
    const operation = requireString(input.operation, 'operation');
    const args = input.args && typeof input.args === 'object' && !Array.isArray(input.args)
      ? input.args as Record<string, unknown>
      : {};
    const db = getAdminClient();
    const result = await executeOperation(db, operation, args);
    return json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.error('crawler-db-proxy request failed', { message });
    return json({ ok: false, error: message.slice(0, 500) }, 500);
  }
});
