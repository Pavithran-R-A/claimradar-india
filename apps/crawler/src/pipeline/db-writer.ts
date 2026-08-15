/**
 * Database write operations and dry-run storage adapters for the crawl pipeline.
 *
 * Provides IDatabaseWriter interface, DatabaseWriter for live Supabase interaction,
 * and InMemoryDryRunWriter for explicit dry-run operations without live database connections.
 */

import { createAdminClient } from '@claimradar/database';
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

export interface SourceDocumentDedupItem {
  id: string;
  source_id: string | null;
  canonical_url: string;
  content_hash: string;
  source_identifier: string | null;
  title: string | null;
  published_at: string | null;
}

export interface IDatabaseWriter {
  createCrawlRun(status: string): Promise<string>;
  updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void>;
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
  getDeferredCandidates(): Promise<CandidateDocument[]>;
}

export class DatabaseWriter implements IDatabaseWriter {
  private db: AnyClient;

  constructor(client?: AnyClient) {
    this.db = client ?? createAdminClient();
  }

  async createCrawlRun(status: string): Promise<string> {
    const id = crypto.randomUUID();
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
    const { data, error } = await this.db
      .from('source_documents')
      .upsert(
        { ...doc, id, retrieved_at: new Date().toISOString() },
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

  async getDeferredCandidates(): Promise<CandidateDocument[]> {
    const { data, error } = await this.db
      .from('candidate_documents')
      .select('*')
      .eq('ai_extraction_status', 'deferred');
    if (error) throw new Error(`Failed to fetch deferred candidates: ${error.message}`);
    return (data ?? []) as CandidateDocument[];
  }
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

  constructor(private initialSources?: Array<Record<string, unknown>>) {}

  async createCrawlRun(status: string): Promise<string> {
    const id = crypto.randomUUID();
    this.crawlRuns.set(id, { id, status, started_at: new Date().toISOString() });
    return id;
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<void> {
    const existing = this.crawlRuns.get(runId) ?? { id: runId };
    this.crawlRuns.set(runId, { ...existing, ...updates });
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
    const sourcesToMap: Array<Record<string, unknown>> =
      this.initialSources ??
      ((await import('@claimradar/source-registry')).initialSources as unknown as Array<
        Record<string, unknown>
      >);
    return sourcesToMap.map((s: Record<string, unknown>) => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      source_type: s.sourceType ?? s.source_type,
      adapter_name: s.adapterType ?? s.adapter_name,
      adapterType: s.adapterType ?? s.adapter_name,
      baseUrl: s.baseUrl ?? s.base_url,
      base_url: s.baseUrl ?? s.base_url,
      feedUrl: s.feedUrl ?? s.metadata?.feedUrl,
      trustLevel: s.trustLevel ?? s.trust_level,
      trust_level: s.trustLevel ?? s.trust_level,
      enabled: true,
      fetch_frequency_hours: 24,
      rate_limit_per_minute: s.rateLimit?.requestsPerMinute ?? s.rate_limit_per_minute ?? 10,
      robots_checked_at: null,
      terms_checked_at: null,
      last_run_at: null,
      last_success_at: null,
      failure_count: 0,
      metadata:
        s.feedUrl || s.metadata?.feedUrl ? { feedUrl: s.feedUrl || s.metadata?.feedUrl } : {},
      created_at: new Date().toISOString(),
    })) as unknown as Source[];
  }

  async getSourceDocumentsForDedup(_sourceId: string): Promise<SourceDocumentDedupItem[]> {
    return Array.from(this.sourceDocuments.values());
  }

  async getDeferredCandidates(): Promise<CandidateDocument[]> {
    return Array.from(this.candidateDocuments.values()).filter(
      (c) => c['ai_extraction_status'] === 'deferred',
    ) as unknown as CandidateDocument[];
  }
}
