import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDisposableEmail,
  buildRuntimeGuards,
  generateRuntimePassword,
  sanitizeRuntimeSummary,
} from './staging-auth-runtime-qa.mjs';

test('runtime guards pin staging and the expected project', () => {
  assert.deepEqual(
    buildRuntimeGuards({
      APP_ENV: 'staging',
      EXPECTED_STAGING_SUPABASE_PROJECT_REF: 'upvsfqufkywlpibbwrse',
    }),
    { APP_ENV: 'staging', EXPECTED_STAGING_SUPABASE_PROJECT_REF: 'upvsfqufkywlpibbwrse' },
  );
});

test('disposable addresses use the reserved example.com domain', () => {
  const email = buildDisposableEmail('TEST_USER_A', '12345', 'abc123');
  assert.match(email, /^claimradar-test-user-a-12345-abc123@example\.com$/);
});

test('runtime passwords are strong and unique', () => {
  const first = generateRuntimePassword();
  const second = generateRuntimePassword();
  assert.notEqual(first, second);
  assert.ok(first.length >= 32);
  assert.match(first, /[A-Z]/);
  assert.match(first, /[a-z]/);
  assert.match(first, /\d/);
  assert.match(first, /[^A-Za-z0-9]/);
});

test('sanitized summaries omit credentials and tokens', () => {
  const summary = sanitizeRuntimeSummary({
    status: 'passed',
    password: 'never-print-this',
    access_token: 'never-print-this-either',
    refresh_token: 'also-never-print-this',
    email: 'claimradar-test@example.com',
  });
  assert.deepEqual(summary, { status: 'passed' });
});
