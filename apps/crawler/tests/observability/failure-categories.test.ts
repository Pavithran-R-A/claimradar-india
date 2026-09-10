import { describe, it, expect } from 'vitest';
import { classifyError, FAILURE_CATEGORIES } from '../../src/observability/failure-categories.js';

describe('Failure category classification', () => {
  it('classifies HTTP status codes directly', () => {
    expect(classifyError(undefined, 404)).toBe('HTTP_4XX');
    expect(classifyError(undefined, 403)).toBe('HTTP_4XX');
    expect(classifyError(undefined, 503)).toBe('HTTP_5XX');
    expect(classifyError('anything', 429)).toBe('RATE_LIMITED');
  });

  it('detects embedded HTTP status codes in messages', () => {
    expect(classifyError('HTTP 403 Forbidden')).toBe('HTTP_4XX');
    expect(classifyError('upstream returned 502')).toBe('HTTP_5XX');
    expect(classifyError('got 429 Too Many Requests')).toBe('RATE_LIMITED');
  });

  it('classifies TLS failures (CCI-style leaf chain errors)', () => {
    expect(classifyError('UNABLE_TO_VERIFY_LEAF_SIGNATURE')).toBe('TLS_ERROR');
    expect(classifyError('self signed certificate in chain')).toBe('TLS_ERROR');
    expect(classifyError('ERR_TLS_CERT_ALTNAME_INVALID')).toBe('TLS_ERROR');
  });

  it('classifies DNS, timeout, and connection errors', () => {
    expect(classifyError('getaddrinfo ENOTFOUND feeds.example.gov.in')).toBe('DNS_ERROR');
    expect(classifyError('UND_ERR_HEADERS_TIMEOUT')).toBe('TIMEOUT');
    expect(
      classifyError(
        'Connect Timeout Error (attempted address: www.trai.gov.in:443, timeout: 10000ms)',
      ),
    ).toBe('TIMEOUT');
    expect(classifyError('fetch failed: ECONNRESET')).toBe('CONNECTION_ERROR');
    expect(classifyError('socket hang up')).toBe('CONNECTION_ERROR');
  });

  it('classifies parse, database, AI, and configuration errors', () => {
    expect(classifyError('Invalid XML in feed')).toBe('PARSE_ERROR');
    expect(classifyError('relation "crawl_runs" does not exist')).toBe('DATABASE_ERROR');
    expect(classifyError('OpenRouter request failed: model overloaded')).toBe('AI_PROVIDER_ERROR');
    expect(classifyError('No feed URL configured')).toBe('CONFIGURATION_ERROR');
  });

  it('falls back to UNKNOWN for empty or unrecognized errors', () => {
    expect(classifyError(null)).toBe('UNKNOWN');
    expect(classifyError('')).toBe('UNKNOWN');
    expect(classifyError('some bizarre failure')).toBe('UNKNOWN');
  });

  it('returns only categories from the documented finite set', () => {
    const samples = [
      undefined,
      'timeout',
      'ENOTFOUND host',
      'certificate',
      'HTTP 404',
      'HTTP 500',
      'too many requests',
      'ECONNREFUSED',
      'malformed rss',
      'postgres down',
      'openrouter 500',
      'no feed url configured',
    ];
    for (const s of samples) {
      expect(FAILURE_CATEGORIES).toContain(classifyError(s ?? null));
    }
  });
});
