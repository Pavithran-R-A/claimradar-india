import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

export const EXPECTED_PROJECT_REF = 'upvsfqufkywlpibbwrse';

export function buildRuntimeGuards(env) {
  return {
    APP_ENV: env.APP_ENV,
    EXPECTED_STAGING_SUPABASE_PROJECT_REF: env.EXPECTED_STAGING_SUPABASE_PROJECT_REF,
  };
}

export function buildDisposableEmail(label, runId, nonce) {
  const safeLabel = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return `claimradar-${safeLabel}-${runId}-${nonce}@example.com`;
}

export function generateRuntimePassword() {
  const random = randomBytes(36).toString('base64url');
  return `Cr!${random}9a`;
}

export function sanitizeRuntimeSummary(summary) {
  const safe = {};
  for (const [key, value] of Object.entries(summary ?? {})) {
    if (/password|token|secret|key|email/i.test(key)) continue;
    safe[key] = value;
  }
  return safe;
}

function runtimeErrorCode(error) {
  return String(error?.code ?? error?.status ?? 'unknown').slice(0, 32);
}

function requireEnv(env, name) {
  const value = env[name];
  if (!value) throw new Error(`missing_${name.toLowerCase()}`);
  return value;
}

function expect(condition, stage, code = 'assertion_failed') {
  if (!condition) throw new Error(`${stage}:${code}`);
}

async function expectCall(stage, callback) {
  try {
    const result = await callback();
    if (result?.error) throw new Error(`${stage}:${runtimeErrorCode(result.error)}`);
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(`${stage}:`)) throw error;
    throw new Error(`${stage}:${runtimeErrorCode(error)}`);
  }
}

function makeClient(createClient, url, key, accessToken) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

async function signIn(createClient, url, key, identity) {
  const client = makeClient(createClient, url, key);
  const result = await expectCall(`signin_${identity.label}`, () =>
    client.auth.signInWithPassword({ email: identity.email, password: identity.password }),
  );
  expect(result.data?.user?.id === identity.id, `signin_${identity.label}`, 'wrong_user');
  expect(Boolean(result.data?.session?.access_token), `signin_${identity.label}`, 'no_session');
  return { ...identity, session: result.data.session };
}

async function queryRows(client, stage, table, columns, userId) {
  const result = await expectCall(stage, () =>
    client.from(table).select(columns).eq('user_id', userId),
  );
  return result.data ?? [];
}

async function runRuntimeQa(env = process.env) {
  const guards = buildRuntimeGuards(env);
  expect(guards.APP_ENV === 'staging', 'guards', 'app_env_must_be_staging');
  expect(
    guards.EXPECTED_STAGING_SUPABASE_PROJECT_REF === EXPECTED_PROJECT_REF,
    'guards',
    'project_ref_mismatch',
  );

  const url = requireEnv(env, 'SUPABASE_URL');
  expect(url === `https://${EXPECTED_PROJECT_REF}.supabase.co`, 'guards', 'url_mismatch');
  const secretKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  expect(Boolean(secretKey), 'guards', 'missing_server_key');

  const { createClient } = await import('@supabase/supabase-js');
  const runId = String(env.GITHUB_RUN_ID ?? Date.now()).replace(/[^a-zA-Z0-9-]/g, '-');
  const nonce = randomBytes(6).toString('hex');
  const adminDb = makeClient(createClient, url, secretKey);
  const identities = [
    { label: 'TEST_USER_A' },
    { label: 'TEST_USER_B' },
    { label: 'TEST_ADMIN' },
  ].map((identity) => ({
    ...identity,
    email: buildDisposableEmail(identity.label, runId, nonce),
    password: generateRuntimePassword(),
  }));
  const createdIds = [];
  const summary = {
    status: 'failed',
    guards,
    stages: {},
    cleanup: { attempted: false, deletedUsers: 0, residualProfiles: 'unknown' },
  };

  const pass = (stage, details = {}) => {
    summary.stages[stage] = { status: 'passed', ...details };
  };

  try {
    for (const identity of identities) {
      const created = await expectCall(`create_${identity.label}`, () =>
        adminDb.auth.admin.createUser({
          email: identity.email,
          password: identity.password,
          email_confirm: true,
        }),
      );
      const user = created.data?.user;
      expect(Boolean(user?.id), `create_${identity.label}`, 'missing_user');
      expect(user.email_confirmed_at !== null, `create_${identity.label}`, 'not_confirmed');
      identity.id = user.id;
      createdIds.push(user.id);
    }
    pass('AUTH_RUNTIME_CREATE', { usersCreated: createdIds.length, emailConfirmed: true });

    const profileResult = await expectCall('profile_trigger', () =>
      adminDb.from('profiles').select('id,role').in('id', createdIds),
    );
    const profiles = profileResult.data ?? [];
    expect(profiles.length === 3, 'profile_trigger', 'profile_count_mismatch');
    expect(
      profiles.every((profile) => profile.role === 'user'),
      'profile_trigger',
      'default_role_mismatch',
    );
    pass('AUTH_RUNTIME_PROFILES', { profilesCreated: profiles.length, defaultRole: 'user' });

    const adminIdentity = identities[2];
    await expectCall('trusted_admin_promotion', () =>
      adminDb.from('profiles').update({ role: 'admin' }).eq('id', adminIdentity.id),
    );
    const promoted = await expectCall('trusted_admin_promotion_verify', () =>
      adminDb.from('profiles').select('role').eq('id', adminIdentity.id).single(),
    );
    expect(promoted.data?.role === 'admin', 'trusted_admin_promotion', 'promotion_not_applied');
    pass('AUTH_RUNTIME_ADMIN_PROMOTION', { path: 'service_role_profile_update' });

    const signedIn = [];
    for (const identity of identities) {
      signedIn.push(await signIn(createClient, url, secretKey, identity));
    }
    pass('AUTH_RUNTIME_SIGN_IN', { sessions: signedIn.length });

    const [userA, userB, testAdmin] = signedIn;
    const userAClient = makeClient(
      createClient,
      url,
      env.SUPABASE_PUBLISHABLE_KEY ?? secretKey,
      userA.session.access_token,
    );
    const userBClient = makeClient(
      createClient,
      url,
      env.SUPABASE_PUBLISHABLE_KEY ?? secretKey,
      userB.session.access_token,
    );
    const adminClient = makeClient(
      createClient,
      url,
      env.SUPABASE_PUBLISHABLE_KEY ?? secretKey,
      testAdmin.session.access_token,
    );

    const onboardingRow = (userId, state) => ({
      user_id: userId,
      companies_used: ['ClaimRadar runtime fixture'],
      sectors_used: ['consumer'],
      purchase_period_start: 2020,
      purchase_period_end: 2021,
      state,
      receipt_availability: 'unsure',
      reference_availability: 'unsure',
      notification_preference: 'in_app',
    });
    await expectCall('customer_onboarding_user_a', () =>
      userAClient
        .from('user_onboarding_responses')
        .upsert(onboardingRow(userA.id, 'KA'), { onConflict: 'user_id' }),
    );
    await expectCall('customer_onboarding_user_b', () =>
      userBClient
        .from('user_onboarding_responses')
        .upsert(onboardingRow(userB.id, 'TN'), { onConflict: 'user_id' }),
    );
    const ownOnboarding = await queryRows(
      userAClient,
      'customer_onboarding_own_read',
      'user_onboarding_responses',
      'user_id,state',
      userA.id,
    );
    const privateOnboarding = await queryRows(
      userAClient,
      'customer_onboarding_cross_read',
      'user_onboarding_responses',
      'user_id,state',
      userB.id,
    );
    expect(ownOnboarding.length === 1, 'customer_onboarding', 'own_row_missing');
    expect(privateOnboarding.length === 0, 'customer_onboarding', 'cross_user_row_visible');
    pass('CUSTOMER_RUNTIME', { ownDataVisible: true, crossUserDataHidden: true });

    const selfPromote = await userAClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userA.id)
      .select('id,role');
    expect(
      Boolean(selfPromote.error) || (selfPromote.data ?? []).length === 0,
      'role_escalation',
      'self_promotion_accepted',
    );
    const userARole = await expectCall('role_escalation_verify', () =>
      adminDb.from('profiles').select('role').eq('id', userA.id).single(),
    );
    expect(userARole.data?.role === 'user', 'role_escalation', 'user_role_changed');
    pass('SECURITY_ROLE_ESCALATION', { selfPromotionBlocked: true });

    const adminSources = await expectCall('admin_surface_sources', () =>
      adminClient.from('sources').select('id').limit(1),
    );
    expect((adminSources.data ?? []).length > 0, 'admin_surface_sources', 'admin_surface_empty');
    const userSources = await userAClient.from('sources').select('id').limit(1);
    expect(
      Boolean(userSources.error) || (userSources.data ?? []).length === 0,
      'admin_surface_sources',
      'user_source_access_granted',
    );
    const adminCrawlRuns = await expectCall('admin_surface_crawl_runs', () =>
      adminClient.from('crawl_runs').select('id').limit(1),
    );
    expect(
      (adminCrawlRuns.data ?? []).length > 0,
      'admin_surface_crawl_runs',
      'admin_crawl_surface_empty',
    );
    const userCrawlRuns = await userAClient.from('crawl_runs').select('id').limit(1);
    expect(
      Boolean(userCrawlRuns.error) || (userCrawlRuns.data ?? []).length === 0,
      'admin_surface_crawl_runs',
      'user_crawl_access_granted',
    );
    pass('ADMIN_RUNTIME', {
      adminSourcesVisible: true,
      adminCrawlRunsVisible: true,
      normalUserBlocked: true,
    });
    pass('API_RUNTIME', { credentialedAuthAndRls: true });

    const notificationRows = [];
    for (const identity of [userA, userB]) {
      const notification = await expectCall(`notification_insert_${identity.label}`, () =>
        adminDb
          .from('notifications')
          .insert({
            user_id: identity.id,
            type: 'new_match',
            title: 'ClaimRadar runtime test',
            body: 'Disposable staging notification.',
            claimable_id: null,
            delivery_status: 'delivered',
            sent_at: new Date().toISOString(),
          })
          .select('id')
          .single(),
      );
      notificationRows.push({ userId: identity.id, id: notification.data.id });
    }
    const ownNotifications = await queryRows(
      userAClient,
      'notification_own_read',
      'notifications',
      'id,user_id',
      userA.id,
    );
    const privateNotifications = await queryRows(
      userAClient,
      'notification_cross_read',
      'notifications',
      'id,user_id',
      userB.id,
    );
    expect(
      ownNotifications.some((row) => row.id === notificationRows[0].id),
      'notification_runtime',
      'own_notification_missing',
    );
    expect(
      privateNotifications.length === 0,
      'notification_runtime',
      'cross_user_notification_visible',
    );
    await expectCall('notification_mark_read', () =>
      userAClient
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationRows[0].id),
    );
    const dedupKey = `claimradar-runtime-${runId}-${nonce}`;
    const deliveryEntry = {
      user_id: userA.id,
      notification_id: notificationRows[0].id,
      notification_type: 'new_match',
      channel: 'browser',
      dedup_key: dedupKey,
      status: 'delivered',
    };
    await expectCall('notification_delivery_first', () =>
      adminDb.from('notification_delivery_log').insert(deliveryEntry),
    );
    const duplicate = await adminDb.from('notification_delivery_log').insert(deliveryEntry);
    expect(duplicate.error?.code === '23505', 'notification_runtime', 'dedup_not_enforced');
    const userDelivery = await userAClient.from('notification_delivery_log').select('id').limit(1);
    expect(
      Boolean(userDelivery.error) || (userDelivery.data ?? []).length === 0,
      'notification_runtime',
      'delivery_log_exposed',
    );
    pass('NOTIFICATION_RUNTIME', {
      ownRead: true,
      crossUserHidden: true,
      dedupBlocked: true,
      deliveryLogPrivate: true,
    });

    summary.status = 'passed';
  } catch (error) {
    const message = String(error?.message ?? 'runtime_failed');
    const separator = message.indexOf(':');
    summary.failure = {
      stage: separator > 0 ? message.slice(0, separator) : 'unknown',
      code: separator > 0 ? message.slice(separator + 1, separator + 40) : 'runtime_failed',
    };
  } finally {
    summary.cleanup.attempted = true;
    for (const userId of createdIds.reverse()) {
      const deleted = await adminDb.auth.admin.deleteUser(userId);
      if (!deleted.error) summary.cleanup.deletedUsers += 1;
    }
    const residual = await adminDb.from('profiles').select('id').in('id', createdIds);
    summary.cleanup.residualProfiles = residual.error
      ? 'unknown'
      : (residual.data ?? []).length === 0;
    if (
      summary.status === 'passed' &&
      (summary.cleanup.deletedUsers !== 3 || summary.cleanup.residualProfiles !== true)
    ) {
      summary.status = 'failed';
      summary.failure = { stage: 'cleanup', code: 'residual_test_data' };
    }
    const outputFile = env.RUNTIME_QA_SUMMARY_FILE ?? 'staging-auth-runtime-summary.json';
    await writeFile(
      outputFile,
      `${JSON.stringify(sanitizeRuntimeSummary(summary), null, 2)}\n`,
      'utf8',
    );
  }
  return summary;
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  runRuntimeQa()
    .then((summary) => {
      console.log(`STAGING_AUTH_RUNTIME_QA ${summary.status.toUpperCase()}`);
      for (const [stage, result] of Object.entries(summary.stages)) {
        console.log(`${stage} ${result.status.toUpperCase()}`);
      }
      if (summary.failure) console.log(`FAILURE ${summary.failure.stage} ${summary.failure.code}`);
      console.log(
        `CLEANUP deleted_users=${summary.cleanup.deletedUsers} residual_profiles=${summary.cleanup.residualProfiles}`,
      );
      process.exitCode = summary.status === 'passed' ? 0 : 1;
    })
    .catch((error) => {
      console.log(`STAGING_AUTH_RUNTIME_QA FAILED ${runtimeErrorCode(error)}`);
      process.exitCode = 1;
    });
}

export { runRuntimeQa };
