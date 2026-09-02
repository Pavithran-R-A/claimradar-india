import { lookup, resolve4, resolve6 } from 'node:dns/promises';
import { isIP } from 'node:net';

export interface SsrfValidationResult {
  safe: boolean;
  reason?: string;
}

export function validateUrl(url: string): SsrfValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { safe: false, reason: 'Invalid URL' };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { safe: false, reason: `Disallowed protocol: ${protocol}` };
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
  if (!hostname) {
    return { safe: false, reason: 'Missing hostname' };
  }

  // Direct IP check
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return { safe: false, reason: `Private IP blocked: ${hostname}` };
    }
  }

  return { safe: true };
}

export function isPrivateIp(ip: string): boolean {
  // IPv6-mapped IPv4 check: ::ffff:127.0.0.1 → extract and validate the IPv4 part
  if (isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    const mappedPrefix = '::ffff:';
    if (normalized.startsWith(mappedPrefix)) {
      const mappedIpv4 = normalized.slice(mappedPrefix.length);
      if (isIP(mappedIpv4) === 4) {
        return isPrivateIp(mappedIpv4);
      }
    }
  }

  // IPv4 checks
  if (isIP(ip) === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    // 0.0.0.0
    if (ip === '0.0.0.0') return true;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 127.0.0.0/8
    if (a === 127) return true;
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
    return false;
  }

  // IPv6 checks
  if (isIP(ip) === 6) {
    const normalized = ip.toLowerCase();
    // ::1 loopback
    if (normalized === '::1') return true;
    // fc00::/7 unique local (fc00:: and fd00::)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // fe80::/10 link-local
    if (
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
    )
      return true;
    // :: unspecified
    if (normalized === '::') return true;
    return false;
  }

  return false;
}

export async function resolveAndValidate(hostname: string): Promise<void> {
  // If hostname is already an IP, validate directly
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error(`SSRF blocked: private IP address ${hostname}`);
    }
    return;
  }

  // Resolve IPv4 addresses
  let ipv4Addresses: string[] = [];
  try {
    ipv4Addresses = await resolve4(hostname);
  } catch {
    // No IPv4 records — that's okay
  }

  // Resolve IPv6 addresses
  let ipv6Addresses: string[] = [];
  try {
    ipv6Addresses = await resolve6(hostname);
  } catch {
    // No IPv6 records — that's okay
  }

  const allIps = [...ipv4Addresses, ...ipv6Addresses];

  if (allIps.length === 0) {
    // Fallback: try lookup
    try {
      const result = await lookup(hostname, { all: true });
      for (const entry of result) {
        if (isPrivateIp(entry.address)) {
          throw new Error(`SSRF blocked: ${hostname} resolves to private IP ${entry.address}`);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('SSRF blocked:')) {
        throw err;
      }
      throw new Error(`SSRF blocked: unable to resolve hostname ${hostname}`);
    }
    return;
  }

  for (const ip of allIps) {
    if (isPrivateIp(ip)) {
      throw new Error(`SSRF blocked: ${hostname} resolves to private IP ${ip}`);
    }
  }
}
