import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_CRAWL_TIMEOUT_MS,
  resolveRailwayCrawlTimeoutMs,
} from './railway-crawl-budget.mjs';

test('default crawl budget allows intermittent official-source latency', () => {
  assert.equal(resolveRailwayCrawlTimeoutMs(undefined), 25 * 60 * 1000);
  assert.equal(resolveRailwayCrawlTimeoutMs(''), DEFAULT_CRAWL_TIMEOUT_MS);
});

test('explicit 25-minute Railway production override is accepted', () => {
  assert.equal(resolveRailwayCrawlTimeoutMs('1500000'), 1500000);
});

test('bounded 15–30 minute range preserves a six-hour cron interval', () => {
  assert.equal(resolveRailwayCrawlTimeoutMs('900000'), 900000);
  assert.equal(resolveRailwayCrawlTimeoutMs('1800000'), 1800000);
});

test('rejects accidental tiny, infinite, nonsensical and unbounded values', () => {
  for (const value of ['1', '899999', '1800001', '-1', 'NaN', 'Infinity', '1.5', '360000000', 'garbage']) {
    assert.throws(
      () => resolveRailwayCrawlTimeoutMs(value),
      /RAILWAY_SOAK_CRAWL_TIMEOUT_MS/,
      `Unexpectedly accepted: ${value}`,
    );
  }
});
