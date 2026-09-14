import { afterEach, describe, expect, it, vi } from 'vitest';
import { brandConfig } from '@claimradar/config';
import { DEFAULT_INDEXNOW_KEY, submitIndexNowUrls } from '../lib/indexnow';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('IndexNow discovery notifications', () => {
  it('no-ops when explicitly configured without a key', async () => {
    const result = await submitIndexNowUrls([`${brandConfig.url}/claimables/example`], {
      key: null,
    });
    expect(result).toEqual({ attempted: 1, submitted: false, reason: 'missing_key' });
  });

  it('rejects URLs outside the configured public host', async () => {
    const result = await submitIndexNowUrls(['https://example.com/claimables/example'], {
      key: DEFAULT_INDEXNOW_KEY,
    });
    expect(result).toEqual({ attempted: 1, submitted: false, reason: 'wrong_host' });
  });

  it('submits changed same-host URLs using the hosted key location', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const url = `${brandConfig.url}/claimables/example`;

    const result = await submitIndexNowUrls([url], { key: DEFAULT_INDEXNOW_KEY });
    expect(result).toEqual({ attempted: 1, submitted: true });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      host: new URL(brandConfig.url).host,
      key: DEFAULT_INDEXNOW_KEY,
      keyLocation: `${brandConfig.url}/indexnow-key.txt`,
      urlList: [url],
    });
  });

  it('fails open on remote 4xx and network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    await expect(
      submitIndexNowUrls([`${brandConfig.url}/claimables/example`], { key: DEFAULT_INDEXNOW_KEY }),
    ).resolves.toEqual({ attempted: 1, submitted: false, reason: 'http_403' });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(
      submitIndexNowUrls([`${brandConfig.url}/claimables/example`], { key: DEFAULT_INDEXNOW_KEY }),
    ).resolves.toEqual({ attempted: 1, submitted: false, reason: 'network_error' });
  });
});
