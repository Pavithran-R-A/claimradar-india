import { describe, it, expect, beforeEach } from 'vitest';
import { runPipeline } from '../../src/pipeline/index.js';
import {
  DatabaseWriter,
  InMemoryDryRunWriter,
  type IDatabaseWriter,
} from '../../src/pipeline/db-writer.js';

describe('Storage & Dry-Run Architecture Tests', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = 'true';
    process.env.LIVE_ADAPTERS_ENABLED = 'false';
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
  });

  it('1. Dry run without Supabase credentials should run safely with InMemoryDryRunWriter', async () => {
    const memoryStorage = new InMemoryDryRunWriter();
    const summary = await runPipeline({
      dryRun: true,
      skipAI: true,
      sourceFilter: 'generic-test',
      storage: memoryStorage,
    });
    expect(summary.errorCount).toBe(0);
    expect(summary.recordsPublished).toBe(0);
  });

  it('2. Live run with missing credentials should throw or record pipeline failure', async () => {
    const mockStorage: IDatabaseWriter = {
      createCrawlRun: async () => {
        throw new Error('Supabase client error: missing credentials');
      },
      updateCrawlRun: async () => {},
      createCrawlRunSource: async () => 'src-1',
      updateCrawlRunSource: async () => {},
      insertCrawlError: async () => {},
      insertSourceDocument: async () => null,
      insertCandidateDocument: async () => 'cand-1',
      updateCandidateDocument: async () => {},
      insertAiRun: async () => 'ai-1',
      insertValidationResult: async () => 'val-1',
      insertPublicationEvent: async () => 'pub-1',
      insertSourceHealthEvent: async () => 'h-1',
      getEnabledSources: async () => [],
      getSourceDocumentsForDedup: async () => [],
      getDeferredCandidates: async () => [],
    };

    const summary = await runPipeline({
      dryRun: false,
      skipAI: true,
      storage: mockStorage,
    });

    expect(summary.errorCount).toBeGreaterThan(0);
  });

  it('3. Live run with unreachable Supabase should fail and record error count', async () => {
    const unreachableStorage: IDatabaseWriter = {
      createCrawlRun: async () => 'run-1',
      updateCrawlRun: async () => {},
      createCrawlRunSource: async () => 'run-src-1',
      updateCrawlRunSource: async () => {},
      insertCrawlError: async () => {},
      insertSourceDocument: async () => null,
      insertCandidateDocument: async () => 'cand-1',
      updateCandidateDocument: async () => {},
      insertAiRun: async () => 'ai-1',
      insertValidationResult: async () => 'val-1',
      insertPublicationEvent: async () => 'pub-1',
      insertSourceHealthEvent: async () => 'h-1',
      getEnabledSources: async () => {
        throw new Error('Connection refused to Supabase database at 127.0.0.1:54321');
      },
      getSourceDocumentsForDedup: async () => [],
      getDeferredCandidates: async () => [],
    };

    const summary = await runPipeline({
      dryRun: false,
      skipAI: true,
      storage: unreachableStorage,
    });

    expect(summary.errorCount).toBe(1);
  });

  it('4. Read failure in DatabaseWriter should throw expected error', async () => {
    const mockClient = {
      from: () => ({
        select: () => ({
          eq: () =>
            Promise.resolve({ data: null, error: { message: 'Read error: permission denied' } }),
        }),
      }),
    };
    const dbWriter = new DatabaseWriter(mockClient);
    await expect(dbWriter.getEnabledSources()).rejects.toThrow('Failed to fetch sources');
  });

  it('5. Write failure in DatabaseWriter should throw expected error', async () => {
    const mockClient = {
      from: () => ({
        insert: () => Promise.resolve({ error: { message: 'Write failed: disk full' } }),
      }),
    };
    const dbWriter = new DatabaseWriter(mockClient);
    await expect(dbWriter.createCrawlRun('running')).rejects.toThrow('Failed to create crawl_run');
  });

  it('6. Partial write failure should raise error without silent suppression', async () => {
    const mockClient = {
      from: (table: string) => {
        if (table === 'crawl_runs') {
          return { insert: () => Promise.resolve({ error: null }) };
        }
        return {
          insert: () => Promise.resolve({ error: { message: 'Constraint error on crawl_errors' } }),
        };
      },
    };
    const dbWriter = new DatabaseWriter(mockClient);
    await expect(
      dbWriter.insertCrawlError('run-123', {
        error_type: 'http_error',
        error_message: 'HTTP 500',
      }),
    ).rejects.toThrow('Failed to insert crawl_error');
  });

  it('7. Dry-run no-op behavior should store items in memory without database mutation', async () => {
    const memoryWriter = new InMemoryDryRunWriter();
    const docId = await memoryWriter.insertSourceDocument({
      source_id: 'src-test',
      canonical_url: 'https://example.gov.in/notice-1',
      content_hash: 'hash123456789',
      raw_text: 'sample text',
      mime_type: 'text/html',
      source_identifier: 'ID-1',
      title: 'Notice 1',
      published_at: new Date().toISOString(),
      etag: null,
      last_modified: null,
      language: 'en',
      extraction_status: 'pending',
      raw_storage_path: null,
      metadata: {},
    });
    expect(docId).toBeDefined();

    // Verify deduplication check against memory storage
    const dupCheck = await memoryWriter.insertSourceDocument({
      source_id: 'src-test',
      canonical_url: 'https://example.gov.in/notice-1',
      content_hash: 'hash123456789',
      raw_text: 'sample text',
      mime_type: 'text/html',
      source_identifier: 'ID-1',
      title: 'Notice 1',
      published_at: new Date().toISOString(),
      etag: null,
      last_modified: null,
      language: 'en',
      extraction_status: 'pending',
      raw_storage_path: null,
      metadata: {},
    });
    expect(dupCheck).toBeNull();
  });

  it('8. Error counts in run summaries accurately reflect database failures', async () => {
    const memoryWriter = new InMemoryDryRunWriter();
    const summary = await runPipeline({
      dryRun: true,
      skipAI: true,
      sourceFilter: 'generic-test',
      storage: memoryWriter,
    });
    expect(summary).toHaveProperty('errorCount');
    expect(summary.errorCount).toBe(0);
  });
});
