# Source Adapter Guide

## Overview

Source adapters are the interface between external data sources (RSS feeds, HTML pages, PDF indexes) and the crawler pipeline. Each adapter knows how to discover, fetch, and health-check documents from a specific source type.

## SourceAdapter Interface

Defined in `adapters/types.ts`:

```typescript
interface SourceAdapter {
  sourceKey: string;
  discover(context: CrawlContext): Promise<DiscoveredDocument[]>;
  fetchDocument(document: DiscoveredDocument, context: CrawlContext): Promise<FetchedDocument>;
  healthCheck(context: CrawlContext): Promise<SourceHealthResult>;
}
```

### CrawlContext

```typescript
interface CrawlContext {
  runId: string;
  dryRun: boolean;
  userAgent: string;
  contactEmail?: string;
  timeoutMs: number;
}
```

### DiscoveredDocument

```typescript
interface DiscoveredDocument {
  url: string;
  title?: string;
  publishedAt?: string;
  sourceIdentifier?: string;
  description?: string;
  linkedDocumentUrl?: string;
}
```

### FetchedDocument

```typescript
interface FetchedDocument {
  url: string;
  content: Buffer | string;
  contentType: string;
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
  fetchedAt: Date;
  metadata: Record<string, unknown>;
}
```

## Existing Adapters

| Adapter Type   | Class                | File                       |
| -------------- | -------------------- | -------------------------- |
| `rss`          | `BaseRssAdapter`     | `adapters/rss/base.ts`     |
| `rss-pib`      | `PibRssAdapter`      | `adapters/rss/pib.ts`      |
| `rss-sebi`     | `SebiRssAdapter`     | `adapters/rss/sebi.ts`     |
| `rss-rbi`      | `RbiRssAdapter`      | `adapters/rss/rbi.ts`      |
| `rss-generic`  | `GenericRssAdapter`  | `adapters/rss/generic.ts`  |
| `html_listing` | `HtmlListingAdapter` | `adapters/html/listing.ts` |
| `html_detail`  | `HtmlDetailAdapter`  | `adapters/html/detail.ts`  |
| `pdf_index`    | `PdfIndexAdapter`    | `adapters/pdf/index.ts`    |

## Adding a New Adapter

### Step 1: Create the adapter class

Create a new file under the appropriate adapter directory. For example, a new RSS source:

```typescript
// apps/crawler/src/adapters/rss/my-source.ts
import { BaseRssAdapter } from './base.js';
import type { SourceDefinition } from '@claimradar/source-registry';

export class MySourceAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }

  // Override discover/fetchDocument/healthCheck as needed
}
```

For HTML adapters, extend or reference `HtmlListingAdapter` / `HtmlDetailAdapter`. For PDF sources, reference `PdfIndexAdapter`.

### Step 2: Register in the registry

Add a case to `adapters/registry.ts`:

```typescript
import { MySourceAdapter } from './rss/my-source.js';

export function getAdapter(source: SourceDefinition): SourceAdapter {
  switch (source.adapterType) {
    // ... existing cases ...
    case 'rss-my-source':
      return new MySourceAdapter(source);
    default:
      throw new Error(`Unknown adapter type: ${source.adapterType}`);
  }
}
```

### Step 3: Add source definition

Add the source to `packages/source-registry/src/index.ts`:

```typescript
export const mySource: SourceDefinition = {
  id: 'my-source-rss',
  name: 'My Source',
  domain: 'mysource.gov.in',
  sourceType: 'rss',
  adapterType: 'rss-my-source',
  baseUrl: 'https://mysource.gov.in',
  trustLevel: 'official',
  rateLimit: { requestsPerMinute: 30 },
  feedUrl: 'https://mysource.gov.in/feed.xml',
};
```

Add it to the `initialSources` array.

### Step 4: Test with fixtures

Create test fixtures under `apps/crawler/tests/fixtures/`:

```
tests/fixtures/
├── rss/
│   └── my-source-feed.xml     # Sample RSS feed
└── ai/
    └── my-source-doc.json     # Expected AI extraction
```

Write tests that use these fixtures to verify:

- `discover()` correctly parses the feed
- `fetchDocument()` extracts content properly
- `healthCheck()` returns valid results

## Disabling a Broken Source

To disable a source without code changes, update the database:

```sql
UPDATE sources SET enabled = false WHERE id = 'my-source-rss';
```

The pipeline only processes sources where `enabled = true`. The `failure_count` column tracks consecutive failures for monitoring.

To re-enable:

```sql
UPDATE sources SET enabled = true, failure_count = 0 WHERE id = 'my-source-rss';
```

## Adapter Patterns

### RSS Pattern

1. `discover()`: Parse RSS/Atom feed using `rss-parser`, return items as `DiscoveredDocument[]`
2. `fetchDocument()`: Fetch the item URL via `HttpClient`, extract HTML content
3. `healthCheck()`: HEAD request to feed URL, validate response

### HTML Listing Pattern

1. `discover()`: Fetch listing page, parse with `cheerio`, extract document links
2. `fetchDocument()`: Fetch individual document URL
3. `healthCheck()`: HEAD request to listing page

### PDF Index Pattern

1. `discover()`: Fetch index page, find PDF links
2. `fetchDocument()`: Download PDF, extract text with `pdfjs-dist`
3. `healthCheck()`: HEAD request to index page
