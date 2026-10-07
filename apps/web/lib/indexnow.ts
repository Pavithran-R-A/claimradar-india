import { brandConfig } from '@claimradar/config';

export const DEFAULT_INDEXNOW_KEY = 'b56d9d0ae68f4c70a6452d0a68f5c4f1';

interface SubmitOptions {
  key?: string | null;
}

export async function submitIndexNowUrls(
  urls: string[],
  options: SubmitOptions = {},
): Promise<{ attempted: number; submitted: boolean; reason?: string }> {
  const attempted = urls.length;
  if (attempted === 0) return { attempted: 0, submitted: false, reason: 'no_urls' };

  const key =
    options.key === undefined ? process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY : options.key;
  if (!key) return { attempted, submitted: false, reason: 'missing_key' };

  const origin = new URL(brandConfig.url);
  const normalized = [...new Set(urls)];
  for (const value of normalized) {
    try {
      const candidate = new URL(value);
      if (candidate.host !== origin.host || candidate.protocol !== origin.protocol) {
        return { attempted, submitted: false, reason: 'wrong_host' };
      }
    } catch {
      return { attempted, submitted: false, reason: 'invalid_url' };
    }
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: origin.host,
        key,
        keyLocation: `${brandConfig.url}/indexnow-key.txt`,
        urlList: normalized,
      }),
    });

    if (!response.ok) {
      console.warn('IndexNow submission was not accepted', { status: response.status, attempted });
      return { attempted, submitted: false, reason: `http_${response.status}` };
    }

    return { attempted, submitted: true };
  } catch {
    console.warn('IndexNow submission failed due to a network error', { attempted });
    return { attempted, submitted: false, reason: 'network_error' };
  }
}
