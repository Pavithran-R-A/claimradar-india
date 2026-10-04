import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDisposableEmail,
  buildQaGuards,
  generateRuntimePassword,
  sanitizeQaSummary,
  VIEWPORTS,
} from './final-protected-browser-qa.mjs';

test('protected browser QA pins staging project guards', () => {
  assert.deepEqual(
    buildQaGuards({
      APP_ENV: 'staging',
      EXPECTED_STAGING_SUPABASE_PROJECT_REF: 'qsshiksnyflwsybjyzob',
      SUPABASE_URL: 'https://qsshiksnyflwsybjyzob.supabase.co',
    }),
    {
      appEnv: 'staging',
      projectRef: 'qsshiksnyflwsybjyzob',
      url: 'https://qsshiksnyflwsybjyzob.supabase.co',
    },
  );
});

test('protected browser QA identities use reserved disposable addresses', () => {
  assert.equal(
    buildDisposableEmail('TEST_USER_A', '12345', 'abc123'),
    'claimradar-test-user-a-12345-abc123@example.com',
  );
});

test('protected browser QA passwords are strong and unique', () => {
  const first = generateRuntimePassword();
  const second = generateRuntimePassword();
  assert.notEqual(first, second);
  assert.ok(first.length >= 32);
  assert.match(first, /[A-Z]/);
  assert.match(first, /[a-z]/);
  assert.match(first, /\d/);
  assert.match(first, /[^A-Za-z0-9]/);
});

test('protected browser QA sanitizes credentials', () => {
  const sanitized = sanitizeQaSummary({
    status: 'passed',
    identities: [{ email: 'secret@example.com', password: 'secret' }],
    credentials: { access_token: 'secret' },
  });
  assert.deepEqual(sanitized, { status: 'passed' });
});

test('protected browser QA covers required viewports', () => {
  assert.deepEqual(VIEWPORTS, [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]);
});
