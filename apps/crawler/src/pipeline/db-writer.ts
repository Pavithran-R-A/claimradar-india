/**
 * Database write operations and dry-run storage adapters for the crawl pipeline.
 *
 * Provides IDatabaseWriter interface, DatabaseWriter for live Supabase interaction,
 * and InMemoryDryRunWriter for explicit dry-run operations without live database connections.
 */

import { createAdminClient } from '@claimradar/database';
import type { SourceDefinition } from '@claimradar/source-registry';
import type {
  CrawlRun,
  CrawlRunSource,
  SourceDocument,
  CandidateDocument,
  AiRun,
  ValidationResult,
  PublicationEvent,
  SourceHealthEvent,
  Source,
} from '@claimradar/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

function sanitizePostgresText(value: string): string {
  let sanitized = '';
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit === 0) continue;

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        sanitized += (value[index] ?? '') + (value[index + 1] ?? '');
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

    sanitized += value[index] ?? '';
  }
  return sanitized;
}

function sanitizePostgresJson(value: unknown): unknown {
  if (typeof value === 'string') return sanitizePostgresText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizePostgresJson(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizePostgresJson(item)]),
    );
  }
  return value;
}

function sanitizeSourceDocument<T extends Record<string, unknown>>(doc: T): T {
  return Object.fromEntries(
    Object.entries(doc).map(([key, value]) => [
      key,
      key === 'metadata'
        ? sanitizePostgresJson(value)
        : typeof value === 'string'
          ? sanitizePostgresText(value)
          : value,
    ]),
  ) as T;
}

export interface SourceDocumentDedupItem {
  id: string;
  source_id: string | null;
  canonical_url: string;
  content_hash: string;
  source_identifier: string | null;
  title: string | null;
  published_at: string | null;
}

export interface ContentClusterAssignment {
  sourceDocumentId: string;
  sourceId: string;
  canonicalUrl: string;
  contentHash: string;
  title?: string;
}

export interface DeferredCandidateContext {
  candidate: CandidateDocument;
  sourceDocument: SourceDocument;
  source: Source | null;
}

export interface IDatabaseWriter {
  createCrawlRun(status: string, runId?: string): Promise<string>;
  updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void>;
  markStaleCrawlRuns(maxAgeMinutes: number): Promise<number>;
  createCrawlRunSource(runId: string, sourceId: string, status: string): Promise<string>;
  updateCrawlRunSource(id: string, updates: Partial<CrawlRunSource>): Promise<void>;
  insertCrawlError(
    runId: string,
    err: { source_id?: string; error_type: string; error_message: string; url?: string },
  ): Promise<void>;
  insertSourceDocument(
    doc: Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'>,
  ): Promise<string | null>;
  insertCandidateDocument(doc: Omit<CandidateDocument, 'id' | 'created_at'>): Promise<string>;
  updateCandidateDocument(id: string, updates: Partial<CandidateDocument>): Promise<void>;
  insertAiRun(run: Omit<AiRun, 'id' | 'created_at'>): Promise<string>;
  insertValidationResult(result: Omit<ValidationResult, 'id' | 'created_at'>): Promise<string>;
  insertPublicationEvent(event: Omit<PublicationEvent, 'id' | 'created_at'>): Promise<string>;
  insertSourceHealthEvent(event: Omit<SourceHealthEvent, 'id' | 'checked_at'>): Promise<string>;
  getEnabledSources(): Promise<Source[]>;
  getSourceDocumentsForDedup(sourceId: string): Promise<SourceDocumentDedupItem[]>;
  assignSourceDocumentToCluster?(assignment: ContentClusterAssignment): Promise<string>;
  getDeferredCandidates(): Promise<CandidateDocument[]>;
  getDeferredCandidateContexts(limit?: number): Promise<DeferredCandidateContext[]>;
}

export class DatabaseWriter implements IDatabaseWriter {
  private db: AnyClient;

  constructor(client?: AnyClient) {
    this.db = client ?? createAdminClient();
  }

  async createCrawlRun(status: string, runId?: string): Promise<string> {
    const id = runId ?? crypto.randomUUID();
    const { error } = await this.db.from('crawl_runs').insert({
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
    if (error) throw new Error(`Failed to create crawl_run: ${error.message}`);
    return id;
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void> {
    const { error } = await this.db.from('crawl_runs').update(updates).eq('id', runId);
    if (error) throw new Error(`Failed to update crawl_run: ${error.message}`);
  }

  async markStaleCrawlRuns(maxAgeMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000).toISOString();
    const { data: stale, error: selectError } = await this.db
      .from('crawl_runs')
      .select('id')
      .eq('status', 'running')
      .lt('started_at', cutoff);
    if (selectError) throw new Error(`Failed to query stale crawl_runs: ${selectError.message}`);

    const ids = (stale ?? []).map((row: { id: string }) => row.id);
    if (ids.length === 0) return 0;

    const { error } = await this.db
      .from('crawl_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
      })
      .in('id', ids);
    if (error) throw new Error(`Failed to close stale crawl_runs: ${error.message}`);
    return ids.length;
  }

  async createCrawlRunSource(runId: string, sourceId: string, status: string): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('crawl_run_sources').insert({
      id,
      crawl_run_id: runId,
      source_id: sourceId,
      status,
      documents_found: 0,
      error_message: null,
      started_at: new Date().toISOString(),
      completed_at: null,
    });
    if (error) throw new Error(`Failed to create crawl_run_source: ${error.message}`);
    return id;
  }

  async updateCrawlRunSource(id: string, updates: Partial<CrawlRunSource>): Promise<void> {
    const { error } = await this.db.from('crawl_run_sources').update(updates).eq('id', id);
    if (error) throw new Error(`Failed to update crawl_run_source: ${error.message}`);
  }

  async insertCrawlError(
    runId: string,
    err: { source_id?: string; error_type: string; error_message: string; url?: string },
  ): Promise<void> {
    const { error } = await this.db.from('crawl_errors').insert({
      crawl_run_id: runId,
      source_id: err.source_id ?? null,
      error_type: err.error_type,
      error_message: err.error_message,
      url: err.url ?? null,
    });
    if (error) throw new Error(`Failed to insert crawl_error: ${error.message}`);
  }

  async insertSourceDocument(
    doc: Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'>,
  ): Promise<string | null> {
    const id = crypto.randomUUID();
    const sanitizedDoc = sanitizeSourceDocument(doc);
    const { data, error } = await this.db
      .from('source_documents')
      .upsert(
        { ...sanitizedDoc, id, retrieved_at: new Date().toISOString() },
        { onConflict: 'source_id,content_hash', ignoreDuplicates: true },
      )
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') return null;
      throw new Error(`Failed to insert source_document: ${error.message}`);
    }
    return data?.id ?? null;
  }

  async insertCandidateDocument(
    doc: Omit<CandidateDocument, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('candidate_documents').insert({ ...doc, id });
    if (error) throw new Error(`Failed to insert candidate_document: ${error.message}`);
    return id;
  }

  async updateCandidateDocument(id: string, updates: Partial<CandidateDocument>): Promise<void> {
    const { error } = await this.db.from('candidate_documents').update(updates).eq('id', id);
    if (error) throw new Error(`Failed to update candidate_document: ${error.message}`);
  }

  async insertAiRun(run: Omit<AiRun, 'id' | 'created_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('ai_runs').insert({ ...run, id });
    if (error) throw new Error(`Failed to insert ai_run: ${error.message}`);
    return id;
  }

  async insertValidationResult(
    result: Omit<ValidationResult, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('validation_results').insert({ ...result, id });
    if (error) throw new Error(`Failed to insert validation_result: ${error.message}`);
    return id;
  }

  async insertPublicationEvent(
    event: Omit<PublicationEvent, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('publication_events').insert({ ...event, id });
    if (error) throw new Error(`Failed to insert publication_event: ${error.message}`);
    return id;
  }

  async insertSourceHealthEvent(
    event: Omit<SourceHealthEvent, 'id' | 'checked_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('source_health_events').insert({
      ...event,
      id,
      checked_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to insert source_health_event: ${error.message}`);
    return id;
  }

  async getEnabledSources(): Promise<Source[]> {
    const { data, error } = await this.db.from('sources').select('*').eq('enabled', true);
    if (error) throw new Error(`Failed to fetch sources: ${error.message}`);
    return (data ?? []) as Source[];
  }

  async getSourceDocumentsForDedup(_sourceId: string): Promise<SourceDocumentDedupItem[]> {
    const { data, error } = await this.db
      .from('source_documents')
      .select('id, source_id, canonical_url, content_hash, source_identifier, title, published_at');
    if (error) throw new Error(`Failed to fetch source_documents for dedup: ${error.message}`);
    return data ?? [];
  }

  async assignSourceDocumentToCluster(assignment: ContentClusterAssignment): Promise<string> {
    const clusterPayload = {
      canonical_hash: assignment.contentHash,
      cluster_title: assignment.title ?? null,
      canonical_url: assignment.canonicalUrl,
    };
    const { data: existing, error: lookupError } = await this.db
      .from('content_clusters')
      .select('id')
      .eq('canonical_hash', assignment.contentHash)
      .maybeSingle();
    if (lookupError) {
      throw new Error(`Failed to find content cluster: ${lookupError.message}`);
    }

    let clusterId = existing?.id as string | undefined;
    if (!clusterId) {
      const { data, error } = await this.db
        .from('content_clusters')
        .insert(clusterPayload)
        .select('id')
        .single();
      if (error && error.code !== '23505') {
        throw new Error(`Failed to create content cluster: ${error.message}`);
      }
      clusterId = data?.id as string | undefined;
      if (!clusterId) {
        const { data: retry, error: retryError } = await this.db
          .from('content_clusters')
          .select('id')
          .eq('canonical_hash', assignment.contentHash)
          .single();
        if (retryError || !retry?.id) {
          throw new Error(
            `Failed to resolve content cluster: ${retryError?.message ?? 'missing id'}`,
          );
        }
        clusterId = retry.id as string;
      }
    }

    const { error: memberError } = await this.db.from('content_cluster_members').upsert(
      {
        cluster_id: clusterId,
        source_document_id: assignment.sourceDocumentId,
      },
      { onConflict: 'cluster_id,source_document_id', ignoreDuplicates: true },
    );
    if (memberError) {
      throw new Error(`Failed to assign content cluster member: ${memberError.message}`);
    }
    return clusterId;
  }

  async getDeferredCandidates(): Promise<CandidateDocument[]> {
    const { data, error } = await this.db
      .from('candidate_documents')
      .select('*')
      .eq('ai_extraction_status', 'deferred');
    if (error) throw new Error(`Failed to fetch deferred candidates: ${error.message}`);
    return (data ?? []) as CandidateDocument[];
  }

  async getDeferredCandidateContexts(limit = 20): Promise<DeferredCandidateContext[]> {
    const { data, error } = await this.db
      .from('candidate_documents')
      .select('*, source_documents!inner(*, sources(*))')
      .in('ai_extraction_status', ['deferred', 'failed'])
      .lt('ai_retry_count', 2)
      // Prefer candidates not yet failed by the free model; preserve FIFO within each group.
      .order('ai_error_category', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true })
      .limit(Math.min(100, limit * 3));
    if (error) throw new Error(`Failed to fetch deferred candidate contexts: ${error.message}`);

    return ((data ?? []) as Array<Record<string, unknown>>)
      .map((row) => {
        const sourceDocument = row['source_documents'] as SourceDocument & {
          sources?: Source | null;
        };
        const { source_documents: _sourceDocuments, ...candidate } = row;
        return {
          candidate: candidate as unknown as CandidateDocument,
          sourceDocument,
          source: sourceDocument?.sources ?? null,
        };
      })
      .filter(
        (context) =>
          typeof context.sourceDocument?.raw_text === 'string' &&
          context.sourceDocument.raw_text.trim().length > 0,
      )
      .slice(0, limit);
  }
}

interface ProxyResponse<T> {
  ok: boolean;
  result?: T;
  error?: string;
}

export class ProxyDatabaseWriter implements IDatabaseWriter {
  private readonly proxyUrl: string;
  private readonly workerToken: string;

  constructor(
    proxyUrl = process.env['CRAWLER_DB_PROXY_URL']?.trim(),
    workerToken = process.env['CRAWLER_DB_PROXY_TOKEN']?.trim(),
  ) {
    if (!proxyUrl || !workerToken) {
      throw new Error(
        'Crawler database proxy requires CRAWLER_DB_PROXY_URL and CRAWLER_DB_PROXY_TOKEN',
      );
    }
    const parsed = new URL(proxyUrl);
    if (parsed.protocol !== 'https:') {
      throw new Error('Crawler database proxy URL must use HTTPS');
    }
    this.proxyUrl = parsed.toString();
    this.workerToken = workerToken;
  }

  private async call<T>(operation: string, args: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-claimradar-worker-token': this.workerToken,
      },
      body: JSON.stringify({ operation, args }),
      signal: AbortSignal.timeout(60_000),
    });

    let payload: ProxyResponse<T>;
    try {
      payload = (await response.json()) as ProxyResponse<T>;
    } catch {
      throw new Error(
        `Crawler database proxy returned non-JSON response (HTTP ${response.status})`,
      );
    }

    if (!response.ok || !payload.ok) {
      throw new Error(
        `Crawler database proxy ${operation} failed (HTTP ${response.status}): ${payload.error ?? 'unknown error'}`,
      );
    }
    if (payload.result === undefined) {
      throw new Error(`Crawler database proxy ${operation} returned no result`);
    }
    return payload.result;
  }

  async createCrawlRun(status: string, runId?: string): Promise<string> {
    const result = await this.call<{ id: string }>('createCrawlRun', { status, runId });
    return result.id;
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void> {
    await this.call('updateCrawlRun', { id: runId, updates });
  }

  async markStaleCrawlRuns(maxAgeMinutes: number): Promise<number> {
    const result = await this.call<{ count: number }>('markStaleCrawlRuns', { maxAgeMinutes });
    return result.count;
  }

  async createCrawlRunSource(runId: string, sourceId: string, status: string): Promise<string> {
    const result = await this.call<{ id: string }>('createCrawlRunSource', {
      runId,
      sourceId,
      status,
    });
    return result.id;
  }

  async updateCrawlRunSource(id: string, updates: Partial<CrawlRunSource>): Promise<void> {
    await this.call('updateCrawlRunSource', { id, updates });
  }

  async insertCrawlError(
    runId: string,
    err: { source_id?: string; error_type: string; error_message: string; url?: string },
  ): Promise<void> {
    await this.call('insertCrawlError', { runId, error: err });
  }

  async insertSourceDocument(
    doc: Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'>,
  ): Promise<string | null> {
    const result = await this.call<{ id: string | null }>('insertSourceDocument', {
      doc: sanitizeSourceDocument(doc as unknown as Record<string, unknown>),
    });
    return result.id;
  }

  async insertCandidateDocument(
    doc: Omit<CandidateDocument, 'id' | 'created_at'>,
  ): Promise<string> {
    const result = await this.call<{ id: string }>('insertCandidateDocument', { doc });
    return result.id;
  }

  async updateCandidateDocument(id: string, updates: Partial<CandidateDocument>): Promise<void> {
    await this.call('updateCandidateDocument', { id, updates });
  }

  async insertAiRun(run: Omit<AiRun, 'id' | 'created_at'>): Promise<string> {
    const result = await this.call<{ id: string }>('insertAiRun', { run });
    return result.id;
  }

  async insertValidationResult(
    result: Omit<ValidationResult, 'id' | 'created_at'>,
  ): Promise<string> {
    const response = await this.call<{ id: string }>('insertValidationResult', { result });
    return response.id;
  }

  async insertPublicationEvent(
    event: Omit<PublicationEvent, 'id' | 'created_at'>,
  ): Promise<string> {
    const result = await this.call<{ id: string }>('insertPublicationEvent', { event });
    return result.id;
  }

  async insertSourceHealthEvent(
    event: Omit<SourceHealthEvent, 'id' | 'checked_at'>,
  ): Promise<string> {
    const result = await this.call<{ id: string }>('insertSourceHealthEvent', { event });
    return result.id;
  }

  async getEnabledSources(): Promise<Source[]> {
    const result = await this.call<{ rows: Source[] }>('getEnabledSources');
    return result.rows;
  }

  async getSourceDocumentsForDedup(sourceId: string): Promise<SourceDocumentDedupItem[]> {
    const result = await this.call<{ rows: SourceDocumentDedupItem[] }>(
      'getSourceDocumentsForDedup',
      { sourceId },
    );
    return result.rows;
  }

  async assignSourceDocumentToCluster(assignment: ContentClusterAssignment): Promise<string> {
    const result = await this.call<{ id: string }>('assignSourceDocumentToCluster', {
      assignment,
    });
    return result.id;
  }

  async getDeferredCandidates(): Promise<CandidateDocument[]> {
    const result = await this.call<{ rows: CandidateDocument[] }>('getDeferredCandidates');
    return result.rows;
  }

  async getDeferredCandidateContexts(limit = 20): Promise<DeferredCandidateContext[]> {
    const result = await this.call<{ rows: DeferredCandidateContext[] }>(
      'getDeferredCandidateContexts',
      { limit },
    );
    return result.rows;
  }
}

export function createLiveDatabaseWriter(): IDatabaseWriter {
  const proxyUrl = process.env['CRAWLER_DB_PROXY_URL']?.trim();
  const proxyToken = process.env['CRAWLER_DB_PROXY_TOKEN']?.trim();

  if (proxyUrl || proxyToken) {
    if (!proxyUrl || !proxyToken) {
      throw new Error(
        'Both CRAWLER_DB_PROXY_URL and CRAWLER_DB_PROXY_TOKEN are required when using the crawler database proxy',
      );
    }
    return new ProxyDatabaseWriter(proxyUrl, proxyToken);
  }

  return new DatabaseWriter();
}

export class InMemoryDryRunWriter implements IDatabaseWriter {
  public crawlRuns: Map<string, Record<string, unknown>> = new Map();
  public crawlRunSources: Map<string, Record<string, unknown>> = new Map();
  public sourceDocuments: Map<string, SourceDocumentDedupItem> = new Map();
  public candidateDocuments: Map<string, Record<string, unknown>> = new Map();
  public errors: Array<Record<string, unknown>> = [];
  public aiRuns: Array<Record<string, unknown>> = [];
  public validationResults: Array<Record<string, unknown>> = [];
  public publicationEvents: Array<Record<string, unknown>> = [];
  public sourceHealthEvents: Array<Record<string, unknown>> = [];
  public contentClusters: Map<string, { id: string; canonical_hash: string }> = new Map();
  public contentClusterMembers: Set<string> = new Set();

  constructor(private initialSources?: SourceDefinition[]) {}

  async createCrawlRun(status: string, runId?: string): Promise<string> {
    const id = runId ?? crypto.randomUUID();
    this.crawlRuns.set(id, { id, status, started_at: new Date().toISOString() });
    return id;
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void> {
    const existing = this.crawlRuns.get(runId) ?? { id: runId };
    this.crawlRuns.set(runId, { ...existing, ...updates });
  }

  async markStaleCrawlRuns(_maxAgeMinutes: number): Promise<number> {
    return 0;
  }

  async createCrawlRunSource(runId: string, sourceId: string, status: string): Promise<string> {
    const id = crypto.randomUUID();
    this.crawlRunSources.set(id, { id, crawl_run_id: runId, source_id: sourceId, status });
    return id;
  }

  async updateCrawlRunSource(id: string, updates: Partial<CrawlRunSource>): Promise<void> {
    const existing = this.crawlRunSources.get(id) ?? { id };
    this.crawlRunSources.set(id, { ...existing, ...updates });
  }

  async insertCrawlError(
    runId: string,
    err: { source_id?: string; error_type: string; error_message: string; url?: string },
  ): Promise<void> {
    this.errors.push({ crawl_run_id: runId, ...err });
  }

  async insertSourceDocument(
    doc: Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'>,
  ): Promise<string | null> {
    for (const existing of this.sourceDocuments.values()) {
      if (existing.source_id === doc.source_id && existing.content_hash === doc.content_hash) {
        return null;
      }
    }
    const id = crypto.randomUUID();
    const item: SourceDocumentDedupItem = {
      id,
      source_id: doc.source_id ?? null,
      canonical_url: doc.canonical_url,
      content_hash: doc.content_hash,
      source_identifier: doc.source_identifier ?? null,
      title: doc.title ?? null,
      published_at: doc.published_at ?? null,
    };
    this.sourceDocuments.set(id, item);
    return id;
  }

  async insertCandidateDocument(
    doc: Omit<CandidateDocument, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    this.candidateDocuments.set(id, { ...doc, id });
    return id;
  }

  async updateCandidateDocument(id: string, updates: Partial<CandidateDocument>): Promise<void> {
    const existing = this.candidateDocuments.get(id) ?? { id };
    this.candidateDocuments.set(id, { ...existing, ...updates });
  }

  async insertAiRun(run: Omit<AiRun, 'id' | 'created_at'>): Promise<string> {
    const id = crypto.randomUUID();
    this.aiRuns.push({ ...run, id });
    return id;
  }

  async insertValidationResult(
    result: Omit<ValidationResult, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    this.validationResults.push({ ...result, id });
    return id;
  }

  async insertPublicationEvent(
    event: Omit<PublicationEvent, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    this.publicationEvents.push({ ...event, id });
    return id;
  }

  async insertSourceHealthEvent(
    event: Omit<SourceHealthEvent, 'id' | 'checked_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    this.sourceHealthEvents.push({ ...event, id });
    return id;
  }

  async getEnabledSources(): Promise<Source[]> {
    const sourcesToMap: SourceDefinition[] =
      this.initialSources ?? (await import('@claimradar/source-registry')).initialSources;
    return sourcesToMap.map((s) => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      source_type: s.sourceType,
      adapter_name: s.adapterType,
      adapterType: s.adapterType,
      baseUrl: s.baseUrl,
      base_url: s.baseUrl,
      feedUrl: s.feedUrl,
      trustLevel: s.trustLevel,
      trust_level: s.trustLevel,
      enabled: true,
      fetch_frequency_hours: 24,
      rate_limit_per_minute: s.rateLimit?.requestsPerMinute ?? 10,
      robots_checked_at: null,
      terms_checked_at: null,
      last_run_at: null,
      last_success_at: null,
      failure_count: 0,
      metadata: s.feedUrl ? { feedUrl: s.feedUrl } : {},
      created_at: new Date().toISOString(),
    })) as unknown as Source[];
  }

  async getSourceDocumentsForDedup(_sourceId: string): Promise<SourceDocumentDedupItem[]> {
    return Array.from(this.sourceDocuments.values());
  }

  async assignSourceDocumentToCluster(assignment: ContentClusterAssignment): Promise<string> {
    const existing = Array.from(this.contentClusters.values()).find(
      (cluster) => cluster.canonical_hash === assignment.contentHash,
    );
    const cluster = existing ?? {
      id: crypto.randomUUID(),
      canonical_hash: assignment.contentHash,
    };
    if (!existing) {
      this.contentClusters.set(cluster.id, cluster);
    }
    this.contentClusterMembers.add(`${cluster.id}:${assignment.sourceDocumentId}`);
    return cluster.id;
  }

  async getDeferredCandidates(): Promise<CandidateDocument[]> {
    return Array.from(this.candidateDocuments.values()).filter(
      (c) => c['ai_extraction_status'] === 'deferred',
    ) as unknown as CandidateDocument[];
  }

  async getDeferredCandidateContexts(_limit = 20): Promise<DeferredCandidateContext[]> {
    return [];
  }
}
