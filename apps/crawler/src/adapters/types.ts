export interface CrawlContext {
  runId: string;
  dryRun: boolean;
  userAgent: string;
  contactEmail?: string;
  timeoutMs: number;
}

export interface DiscoveredDocument {
  url: string;
  title?: string;
  publishedAt?: string;
  sourceIdentifier?: string;
  description?: string;
  linkedDocumentUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface FetchedDocument {
  url: string;
  content: Buffer | string;
  contentType: string;
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
  fetchedAt: Date;
  metadata: Record<string, unknown>;
}

export interface SourceHealthResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
  feedValid?: boolean;
}

export interface SourceAdapter {
  sourceKey: string;
  discover(context: CrawlContext): Promise<DiscoveredDocument[]>;
  fetchDocument(document: DiscoveredDocument, context: CrawlContext): Promise<FetchedDocument>;
  healthCheck(context: CrawlContext): Promise<SourceHealthResult>;
}
