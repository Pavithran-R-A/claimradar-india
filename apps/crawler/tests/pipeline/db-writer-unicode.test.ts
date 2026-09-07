import { describe, expect, it } from 'vitest';
import type { SourceDocument } from '@claimradar/database';
import { DatabaseWriter } from '../../src/pipeline/db-writer.js';

type PersistedPayload = Omit<SourceDocument, 'created_at' | 'retrieved_at'> & {
  id: string;
  retrieved_at: string;
};

function sourceDocument(
  overrides: Partial<SourceDocument> = {},
): Omit<SourceDocument, 'id' | 'created_at' | 'retrieved_at'> {
  return {
    source_id: 'ibbi-public-announcements',
    canonical_url: 'https://ibbi.gov.in//uploads/announcement/121e37ea6e507c4fba1a52fac05d41b4.pdf',
    source_identifier: '121e37ea6e507c4fba1a52fac05d41b4',
    title: 'Corporate insolvency announcement',
    published_at: null,
    content_hash: 'pdf-content-hash',
    etag: null,
    last_modified: null,
    mime_type: 'application/pdf',
    language: 'en',
    raw_text: 'FINO PAYMENTS BANK LIMITED Registered Office',
    extraction_status: 'pending',
    raw_storage_path: null,
    metadata: {},
    ...overrides,
  };
}

function createWriter(capture: (payload: PersistedPayload) => void, error = null) {
  const client = {
    from: (table: string) => {
      expect(table).toBe('source_documents');
      return {
        upsert: (payload: PersistedPayload) => {
          capture(payload);
          return {
            select: () => ({
              maybeSingle: async () => ({ data: error ? null : { id: payload.id }, error }),
            }),
          };
        },
      };
    },
  };
  return new DatabaseWriter(client);
}

describe('DatabaseWriter source-document Unicode safety', () => {
  it('removes PostgreSQL-incompatible NUL characters from raw_text', async () => {
    let persisted: PersistedPayload | null = null;
    const rawText = 'FINO PAYMENTS BANK LIMITED Registered O\u0000ce\nभारत 🇮🇳 😀';

    await createWriter((payload) => {
      persisted = payload;
    }).insertSourceDocument(sourceDocument({ raw_text: rawText }));

    expect(persisted?.raw_text).toBe('FINO PAYMENTS BANK LIMITED Registered Oce\nभारत 🇮🇳 😀');
    expect(persisted?.raw_text).not.toContain('\u0000');
  });

  it('sanitizes nested metadata without changing valid Unicode', async () => {
    let persisted: PersistedPayload | null = null;

    await createWriter((payload) => {
      persisted = payload;
    }).insertSourceDocument(
      sourceDocument({
        metadata: {
          sourceText: 'कंपनी सूचना 🇮🇳',
          nested: { extracted: 'bad\u0000value' },
          pages: ['first\u0000page', 'दूसरा पृष्ठ 😀'],
        },
      }),
    );

    expect(persisted?.metadata).toEqual({
      sourceText: 'कंपनी सूचना 🇮🇳',
      nested: { extracted: 'badvalue' },
      pages: ['firstpage', 'दूसरा पृष्ठ 😀'],
    });
  });

  it('replaces unpaired surrogates while preserving valid non-BMP Unicode', async () => {
    let persisted: PersistedPayload | null = null;

    await createWriter((payload) => {
      persisted = payload;
    }).insertSourceDocument(sourceDocument({ raw_text: 'valid 😀 high\uD800 low\uDC00' }));

    expect(persisted?.raw_text).toBe('valid 😀 high� low�');
  });

  it('handles the exact IBBI regression payload without changing its URL', async () => {
    let persisted: PersistedPayload | null = null;
    const failingText =
      'FINO PAYMENTS BANK LIMITED Registered O\u0000ce: Mindspace Juinagar, 8 th Floor';
    const document = sourceDocument({ raw_text: failingText });

    await createWriter((payload) => {
      persisted = payload;
    }).insertSourceDocument(document);

    expect(persisted?.canonical_url).toBe(document.canonical_url);
    expect(persisted?.raw_text).toBe(
      'FINO PAYMENTS BANK LIMITED Registered Oce: Mindspace Juinagar, 8 th Floor',
    );
  });

  it('leaves normal multiline source documents unchanged', async () => {
    let persisted: PersistedPayload | null = null;
    const document = sourceDocument({
      raw_text: 'Line one\nLine two\nLine तीन',
      title: 'Normal notice — भारतीय सूचना',
      metadata: { pageCount: 3, language: 'hi' },
    });

    await createWriter((payload) => {
      persisted = payload;
    }).insertSourceDocument(document);

    expect(persisted).toMatchObject(document);
  });

  it('still propagates a persistence error after sanitization', async () => {
    const writer = createWriter(() => {}, {
      code: '22P05',
      message: 'unsupported Unicode escape sequence',
    });

    await expect(
      writer.insertSourceDocument(sourceDocument({ raw_text: 'bad\u0000value' })),
    ).rejects.toThrow('Failed to insert source_document');
  });
});
