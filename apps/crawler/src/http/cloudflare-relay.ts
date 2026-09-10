import { createHmac } from 'node:crypto';

const TRAI_HOSTS = new Set(['trai.gov.in', 'www.trai.gov.in']);

export function getTraiRelayTarget(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (!TRAI_HOSTS.has(parsed.hostname.toLowerCase())) return null;

  const allowedPath = parsed.pathname === '/rss.xml' || parsed.pathname.startsWith('/consumer/');
  if (!allowedPath) return null;

  return `${parsed.pathname}${parsed.search}`;
}

export function createRelaySignature(
  timestamp: string,
  nonce: string,
  method: 'GET' | 'HEAD',
  targetPath: string,
  sharedSecret: string,
): string {
  const canonical = `${timestamp}\n${nonce}\n${method}\n${targetPath}`;
  return createHmac('sha256', sharedSecret).update(canonical).digest('hex');
}

export function buildRelayUrl(endpoint: string, targetPath: string): string {
  const relayUrl = new URL(endpoint);
  relayUrl.searchParams.set('target', targetPath);
  return relayUrl.href;
}
