/**
 * Database write operations for the crawl pipeline.
 *
 * Wraps the Supabase admin client (bypasses RLS).
 * Type assertions are used on Supabase calls because the Database type
 * doesn't perfectly align with supabase-js GenericDatabase constraints.
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

export class DatabaseWriter {
  private db: AnyClient;

  constructor() {
    this.db = createAdminClient();
  }

  // -----------------------------------------------------------------------
  // crawl_runs
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // crawl_run_sources
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // crawl_errors
  // -----------------------------------------------------------------------

  async insertCrawlError(
    runId: string,
    err: { source_id?: string; error_type: string; error_message: string; url?: string },
  ): Promise<void> {
    await this.db.from('crawl_errors').insert({
      crawl_run_id: runId,
      source_id: err.source_id ?? null,
      error_type: err.error_type,
      error_message: err.error_message,
      url: err.url ?? null,
    });
  }

  // -----------------------------------------------------------------------
  // source_documents  (ON CONFLICT DO NOTHING via upsert ignoreDuplicates)
  // -----------------------------------------------------------------------

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
      // Unique constraint violation
      if (error.code === '23505') return null;
      throw new Error(`Failed to insert source_document: ${error.message}`);
    }
    // ignoreDuplicates returns null data on conflict
    return data?.id ?? null;
  }

  // -----------------------------------------------------------------------
  // candidate_documents
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // ai_runs
  // -----------------------------------------------------------------------

  async insertAiRun(run: Omit<AiRun, 'id' | 'created_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('ai_runs').insert({ ...run, id });
    if (error) throw new Error(`Failed to insert ai_run: ${error.message}`);
    return id;
  }

  // -----------------------------------------------------------------------
  // validation_results
  // -----------------------------------------------------------------------

  async insertValidationResult(
    result: Omit<ValidationResult, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('validation_results').insert({ ...result, id });
    if (error) throw new Error(`Failed to insert validation_result: ${error.message}`);
    return id;
  }

  // -----------------------------------------------------------------------
  // publication_events
  // -----------------------------------------------------------------------

  async insertPublicationEvent(
    event: Omit<PublicationEvent, 'id' | 'created_at'>,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const { error } = await this.db.from('publication_events').insert({ ...event, id });
    if (error) throw new Error(`Failed to insert publication_event: ${error.message}`);
    return id;
  }

  // -----------------------------------------------------------------------
  // source_health_events
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Query helpers
  // -----------------------------------------------------------------------

  async getEnabledSources(): Promise<Source[]> {
    const { data, error } = await this.db.from('sources').select('*').eq('enabled', true);
    if (error) throw new Error(`Failed to fetch sources: ${error.message}`);
    return (data ?? []) as Source[];
  }

  async getSourceDocumentsForDedup(_sourceId: string): Promise<
    Array<{
      id: string;
      source_id: string | null;
      canonical_url: string;
      content_hash: string;
      source_identifier: string | null;
      title: string | null;
      published_at: string | null;
    }>
  > {
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
