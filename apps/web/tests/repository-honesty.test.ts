import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  getPublishedClaimables,
  getPublishedClaimableBySlug,
  isDemoDataEnabled,
  __setDbClientFactoryForTests,
  __resetDbClientFactoryForTests,
} from '../lib/claimables-repository';
import { DEMO_CLAIMABLES } from '../lib/demo-claimables';
import { makeValidRow, fakeDbClient, throwingDbClient } from './fixtures';

const originalDemoFlag = process.env.ENABLE_DEMO_DATA;

beforeEach(() => {
  delete process.env.ENABLE_DEMO_DATA;
});

afterEach(() => {
  __resetDbClientFactoryForTests();
  if (originalDemoFlag === undefined) {
    delete process.env.ENABLE_DEMO_DATA;
  } else {
    process.env.ENABLE_DEMO_DATA = originalDemoFlag;
  }
});

describe('Honest error behaviour (no fictional fallback)', () => {
  it('returns an error outcome when the database is not configured', async () => {
    __setDbClientFactoryForTests(() => {
      throw new Error('Missing SUPABASE_URL environment variable');
    });

    const result = await getPublishedClaimables();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not configured/i);
      expect(result.demo).toBe(false);
    }
  });

  it('returns an error outcome when the database query fails', async () => {
    __setDbClientFactoryForTests(() =>
      fakeDbClient({ data: null, error: { message: 'connection refused' } }),
    );

    const result = await getPublishedClaimables();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  });

  it('returns an error outcome when the database connection throws', async () => {
    __setDbClientFactoryForTests(throwingDbClient);

    const result = await getPublishedClaimables();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/unreachable/i);
    }
  });

  it('never fabricates records when the database has none', async () => {
    __setDbClientFactoryForTests(() => fakeDbClient({ data: [], error: null }));

    const result = await getPublishedClaimables();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.demo).toBe(false);
      expect(result.data.items).toHaveLength(0);
      expect(result.data.total).toBe(0);
    }
  });

  it('slug lookups degrade to honest errors instead of invented pages', async () => {
    __setDbClientFactoryForTests(throwingDbClient);

    const result = await getPublishedClaimableBySlug('anything');
    expect(result.ok).toBe(false);
  });

  it('skips malformed rows without failing the whole directory', async () => {
    __setDbClientFactoryForTests(() =>
      fakeDbClient({
        data: [{ id: 42, garbage: true }, makeValidRow({ id: 'good', slug: 'good-row' })],
        error: null,
      }),
    );

    const result = await getPublishedClaimables({ limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.slug).toBe('good-row');
    }
  });
});

describe('Demo data gating', () => {
  it('is disabled unless the explicit flag is set outside production', () => {
    expect(isDemoDataEnabled()).toBe(false);
    process.env.ENABLE_DEMO_DATA = 'true';
    // vitest runs with NODE_ENV=test, never production
    expect(isDemoDataEnabled()).toBe(true);
  });

  it('never serves demo records without the flag, even on DB failure', async () => {
    __setDbClientFactoryForTests(throwingDbClient);

    const result = await getPublishedClaimables();
    expect(result.ok).toBe(false);
  });

  it('serves labelled demo records on DB failure only when flagged', async () => {
    process.env.ENABLE_DEMO_DATA = 'true';
    __setDbClientFactoryForTests(throwingDbClient);

    const result = await getPublishedClaimables({ limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.demo).toBe(true);
      expect(result.data.items).toHaveLength(DEMO_CLAIMABLES.length);
      for (const item of result.data.items) {
        expect(item.title).toContain('[DEMO]');
      }
    }
  });

  it('serves labelled demo records on an empty database only when flagged', async () => {
    process.env.ENABLE_DEMO_DATA = 'true';
    __setDbClientFactoryForTests(() => fakeDbClient({ data: [], error: null }));

    const result = await getPublishedClaimables({ limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.demo).toBe(true);
      expect(result.data.items.length).toBeGreaterThan(0);
    }
  });

  it('prefers real database records over demo records', async () => {
    process.env.ENABLE_DEMO_DATA = 'true';
    __setDbClientFactoryForTests(() =>
      fakeDbClient({ data: [makeValidRow({ slug: 'real-record' })], error: null }),
    );

    const result = await getPublishedClaimables({ limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.demo).toBe(false);
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.slug).toBe('real-record');
    }
  });
});
