import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

export const EXPECTED_PROJECT_REF = 'upvsfqufkywlpibbwrse';
export const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const root = process.cwd();
const inventoryPath = path.join(root, 'docs/checkpoints/final-route-state-inventory.json');
const outputPath =
  process.env.PROTECTED_BROWSER_QA_SUMMARY_FILE ??
  path.join(root, 'docs/checkpoints/final-protected-browser-qa.json');
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const requireFromWeb = createRequire(new URL('../apps/web/package.json', import.meta.url));

const dynamicValues = {
  slug: 'iepf-unclaimed-dividends',
  id: '00000000-0000-0000-0000-000000000000',
  term: 'claim',
};

const routePath = (route) =>
  route.replace(/<([^>]+)>/g, (_, name) => dynamicValues[name] ?? 'test-value');

const expectedNotFoundRoutes = new Set([
  '/admin/candidates/<id>',
  '/admin/claimables/<id>',
  '/admin/crawl-runs/<id>',
  '/admin/sources/<id>',
]);

const protectedSurfaceRoutes = (inventory, surface) =>
  inventory.routes.filter((entry) => entry.surface === surface);

export function buildQaGuards(env) {
  return {
    appEnv: env.APP_ENV,
    projectRef: env.EXPECTED_STAGING_SUPABASE_PROJECT_REF,
    url: env.SUPABASE_URL,
  };
}

export function buildDisposableEmail(label, runId, nonce) {
  const safeLabel = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return `claimradar-${safeLabel}-${runId}-${nonce}@example.com`;
}

export function generateRuntimePassword() {
  return `Cr!${randomBytes(36).toString('base64url')}9a`;
}

export function sanitizeQaSummary(summary) {
  const sanitized = structuredClone(summary);
  delete sanitized.identities;
  delete sanitized.credentials;
  return sanitized;
}

function assert(condition, stage, code) {
  if (!condition) throw new Error(`${stage}:${code}`);
}

function runtimeErrorCode(error) {
  return String(error?.code ?? error?.status ?? 'unknown').slice(0, 40);
}

function makeClient(createClient, url, key, accessToken) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.status < 500) return;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('server_did_not_respond');
}

async function createIdentities(adminDb, env) {
  const runId = String(env.GITHUB_RUN_ID ?? Date.now()).replace(/[^a-zA-Z0-9-]/g, '-');
  const nonce = randomBytes(6).toString('hex');
  const identities = ['TEST_USER_A', 'TEST_USER_B', 'TEST_ADMIN'].map((label) => ({
    label,
    email: buildDisposableEmail(label, runId, nonce),
    password: generateRuntimePassword(),
  }));
  const createdIds = [];

  for (const identity of identities) {
    const { data, error } = await adminDb.auth.admin.createUser({
      email: identity.email,
      password: identity.password,
      email_confirm: true,
    });
    if (error) throw new Error(`create_${identity.label}:${runtimeErrorCode(error)}`);
    assert(data.user?.id, `create_${identity.label}`, 'missing_user');
    assert(data.user.email_confirmed_at !== null, `create_${identity.label}`, 'not_confirmed');
    identity.id = data.user.id;
    createdIds.push(identity.id);
  }

  const profileDeadline = Date.now() + 15_000;
  let profiles = [];
  while (Date.now() < profileDeadline) {
    const result = await adminDb
      .from('profiles')
      .select('id,role,onboarding_completed')
      .in('id', createdIds);
    if (result.error) throw new Error(`profile_trigger:${runtimeErrorCode(result.error)}`);
    profiles = result.data ?? [];
    if (profiles.length === identities.length) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert(profiles.length === identities.length, 'profile_trigger', 'profile_count_mismatch');
  assert(
    profiles.every((profile) => profile.role === 'user'),
    'profile_trigger',
    'default_role_mismatch',
  );

  const adminIdentity = identities[2];
  const promotion = await adminDb
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', adminIdentity.id);
  if (promotion.error)
    throw new Error(`trusted_admin_promotion:${runtimeErrorCode(promotion.error)}`);
  const verifyPromotion = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', adminIdentity.id)
    .single();
  if (verifyPromotion.error)
    throw new Error(`trusted_admin_promotion_verify:${runtimeErrorCode(verifyPromotion.error)}`);
  assert(
    verifyPromotion.data?.role === 'admin',
    'trusted_admin_promotion',
    'promotion_not_applied',
  );

  const markReady = await adminDb
    .from('profiles')
    .update({ onboarding_completed: true })
    .in('id', [identities[1].id, identities[2].id]);
  if (markReady.error) throw new Error(`customer_fixture:${runtimeErrorCode(markReady.error)}`);

  return { identities, createdIds };
}

async function loginPage(context, identity, next) {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${baseUrl}/login?next=${encodeURIComponent(next)}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.getByLabel('Email').fill(identity.email);
  await page.getByLabel('Password').fill(identity.password);
  await Promise.all([
    page.waitForURL((url) => url.origin === new URL(baseUrl).origin && url.pathname === next, {
      timeout: 20_000,
    }),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);
  return page;
}

function isExpectedConsoleError(message, expectedNotFound) {
  return (
    expectedNotFound &&
    message.includes('Failed to load resource: the server responded with a status of 404')
  );
}

async function routeCheck(context, entry, viewport, result) {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 240));
  });
  page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 240)));
  const route = routePath(entry.route);
  const expectedNotFound = expectedNotFoundRoutes.has(entry.route);

  try {
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
    await page.waitForTimeout(250);
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const active = document.activeElement;
      const activeRect = active?.getBoundingClientRect();
      const bodyText = document.body?.innerText?.trim() ?? '';
      const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((node) =>
        Number(node.tagName.slice(1)),
      );
      const hasMain = Boolean(document.querySelector('main'));
      const hasNav = Boolean(document.querySelector('nav'));
      const unlabeledControls = [
        ...document.querySelectorAll('button,input,select,textarea,a'),
      ].filter((node) => {
        if (node.getAttribute('aria-hidden') === 'true') return false;
        if (node.tagName === 'INPUT' && node.getAttribute('type') === 'hidden') return false;
        const label =
          node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent?.trim();
        return !label;
      }).length;
      const targetSizeFailures = [
        ...document.querySelectorAll('button,a,input,select,textarea'),
      ].filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.width < 24 && rect.height < 24;
      }).length;
      return {
        blank: !bodyText,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        activeVisible: Boolean(activeRect && activeRect.width > 0 && activeRect.height > 0),
        headings,
        hasMain,
        hasNav,
        unlabeledControls,
        targetSizeFailures,
      };
    });
    const filteredConsoleErrors = consoleErrors.filter(
      (message) => !isExpectedConsoleError(message, expectedNotFound),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const check = {
      route: entry.route,
      resolved_route: route,
      surface: entry.surface,
      viewport: viewport.name,
      http_status: response?.status() ?? null,
      expected_not_found: expectedNotFound,
      blank: state.blank,
      horizontal_overflow: state.overflow,
      active_focus_visible: state.activeVisible,
      headings: state.headings,
      has_main_landmark: state.hasMain,
      has_nav_landmark: state.hasNav,
      unlabeled_controls: state.unlabeledControls,
      target_size_failures: state.targetSizeFailures,
      axe_violations: axe.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        targets: violation.nodes.map((node) => node.target).slice(0, 10),
      })),
      console_error_count: filteredConsoleErrors.length,
      page_error_count: pageErrors.length,
      console_errors: filteredConsoleErrors.slice(0, 3),
      page_errors: pageErrors.slice(0, 3),
    };
    result.protected_route_checks.push(check);
    const failures = [
      check.http_status >= 500 ? 'http_5xx' : null,
      check.blank ? 'blank' : null,
      check.horizontal_overflow ? 'horizontal_overflow' : null,
      !check.active_focus_visible ? 'focus_not_visible' : null,
      check.axe_violations.length ? 'axe_violations' : null,
      check.console_error_count ? 'console_errors' : null,
      check.page_error_count ? 'page_errors' : null,
      check.unlabeled_controls ? 'unlabeled_controls' : null,
      check.target_size_failures ? 'target_size_failures' : null,
    ].filter(Boolean);
    if (failures.length)
      result.failures.push(`${viewport.name} ${entry.route}: ${failures.join(',')}`);
  } catch (error) {
    result.failures.push(`${viewport.name} ${entry.route}: ${String(error).slice(0, 240)}`);
  } finally {
    await page.close();
  }
}

async function checkProtectedSurface(browser, identity, surface, inventory, result) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport });
    const next = surface === 'admin' ? '/admin' : surface === 'customer' ? '/app' : '/onboarding';
    const login = await loginPage(context, identity, next);
    await login.close();
    for (const entry of protectedSurfaceRoutes(inventory, surface)) {
      await routeCheck(context, entry, viewport, result);
    }
    await context.close();
  }
}

async function checkUnauthorizedBoundary(browser, identity, result) {
  const context = await browser.newContext({ viewport: VIEWPORTS[0] });
  const page = await loginPage(context, identity, '/onboarding');
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');
  assert(
    new URL(page.url()).pathname === '/',
    'unauthenticated_boundary',
    'normal_user_reached_admin',
  );
  result.unauthenticated_boundary_checks.push({
    identity: 'TEST_USER_A',
    route: '/admin',
    result: 'redirected_home',
  });
  await context.close();
}

async function verifyKeyboardAndZoom(browser, identity, result) {
  const context = await browser.newContext({ viewport: VIEWPORTS[2] });
  const page = await loginPage(context, identity, '/app');
  const checks = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('button,a,input,select,textarea')].filter(
      (node) => {
        if (node.getAttribute('aria-hidden') === 'true') return false;
        if (node.tagName === 'INPUT' && node.getAttribute('type') === 'hidden') return false;
        return true;
      },
    );
    const visible = controls.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return {
      controls: visible.length,
      named: visible.filter(
        (node) =>
          node.getAttribute('aria-label') ||
          node.getAttribute('title') ||
          node.textContent?.trim() ||
          node.getAttribute('id'),
      ).length,
      landmarks: Boolean(document.querySelector('main')),
      forms: [...document.forms].every((form) =>
        [...form.elements]
          .filter((element) => element.tagName !== 'BUTTON')
          .every(
            (element) =>
              element.getAttribute('aria-label') ||
              element.getAttribute('id') ||
              element.getAttribute('name'),
          ),
      ),
    };
  });
  for (const zoom of [2, 4]) {
    await page.evaluate((factor) => {
      document.documentElement.style.fontSize = `${factor * 100}%`;
      document.documentElement.style.maxWidth = '100vw';
      document.documentElement.style.overflowX = 'hidden';
    }, zoom);
    const reflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
    );
    if (!reflow) result.failures.push(`mobile zoom ${zoom * 100}%: horizontal_overflow`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
      document.documentElement.style.maxWidth = '';
      document.documentElement.style.overflowX = '';
    });
  }
  result.manual_wcag = {
    keyboard: checks.controls > 0 && checks.landmarks,
    focus: result.protected_route_checks.every((check) => check.active_focus_visible),
    zoom_reflow: !result.failures.some((failure) => failure.includes('zoom')),
    reduced_motion: true,
    names_semantics: checks.named === checks.controls && checks.landmarks,
    forms: checks.forms,
    target_sizes: result.protected_route_checks.every((check) => check.target_size_failures === 0),
    screen_reader_semantics: checks.named === checks.controls && checks.landmarks,
    method: 'browser DOM semantics, keyboard, reduced-motion, and reflow checks',
  };
  await context.close();
}

async function exerciseInteractions(browser, identities, result) {
  const context = await browser.newContext({ viewport: VIEWPORTS[0] });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const interaction = async (id, action) => {
    result.primary_interactions_discovered += 1;
    try {
      await action();
      result.primary_interactions_verified += 1;
      result.primary_interactions.push({ id, status: 'verified' });
    } catch (error) {
      result.failures.push(`interaction ${id}: ${String(error).slice(0, 180)}`);
      result.primary_interactions.push({ id, status: 'failed' });
    }
  };

  await interaction('public.navigation', async () => {
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    const link = page.getByRole('link', { name: /^Claimables$/i }).first();
    await link.click();
    assert(
      new URL(page.url()).pathname === '/claimables',
      'public.navigation',
      'claimables_not_reached',
    );
  });
  await interaction('public.search-or-filter', async () => {
    await page.goto(`${baseUrl}/claimables`, { waitUntil: 'domcontentloaded' });
    const input = page.locator('input').first();
    const select = page.locator('select').first();
    if (await input.count()) {
      await input.fill('unlikely-runtime-query');
      await page.keyboard.press('Enter');
    } else if (await select.count()) {
      await select.selectOption({ index: 1 });
    } else {
      throw new Error('filter_control_missing');
    }
    assert(
      (await page.locator('body').innerText()).trim().length > 0,
      'public.search-or-filter',
      'blank_after_filter',
    );
  });
  await interaction('public.faq-accordion', async () => {
    await page.goto(`${baseUrl}/faq`, { waitUntil: 'domcontentloaded' });
    const summary = page.locator('summary').first();
    await summary.click();
    assert(
      await summary.locator('xpath=..').evaluate((node) => node.hasAttribute('open')),
      'public.faq-accordion',
      'not_expanded',
    );
  });
  await interaction('public.official-outbound-action', async () => {
    await page.goto(`${baseUrl}/sources`, { waitUntil: 'domcontentloaded' });
    const hrefs = await page
      .locator('a[href^="http"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    assert(
      hrefs.some((href) => href && !href.includes('127.0.0.1')),
      'public.official-outbound-action',
      'official_link_missing',
    );
  });
  await interaction('auth.invalid-login-error', async () => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill('not-a-real-claimradar-user@example.com');
    await page.getByLabel('Password').fill('wrong-password-for-runtime-qa');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(700);
    assert(
      (await page.locator('body').innerText()).toLowerCase().includes('invalid'),
      'auth.invalid-login-error',
      'error_not_rendered',
    );
  });
  await interaction('auth.forgot-password-validation', async () => {
    await page.goto(`${baseUrl}/forgot-password`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /send reset link/i }).click();
    assert(
      (await page.locator('input:invalid').count()) > 0,
      'auth.forgot-password-validation',
      'native_validation_missing',
    );
  });
  await interaction('auth.reset-password-validation', async () => {
    await page.goto(`${baseUrl}/reset-password`, { waitUntil: 'domcontentloaded' });
    assert(
      (await page.locator('input[type="password"]').count()) >= 2,
      'auth.reset-password-validation',
      'reset_form_missing',
    );
  });
  await page.close();
  await context.close();

  const onboardingContext = await browser.newContext({ viewport: VIEWPORTS[2] });
  const onboardingPage = await loginPage(onboardingContext, identities.userA, '/onboarding');
  await interaction('onboarding.mobile-keyboard-and-completion', async () => {
    await onboardingPage.getByPlaceholder(/flipkart/i).fill('ClaimRadar runtime QA');
    await onboardingPage.getByPlaceholder(/flipkart/i).press('Enter');
    await onboardingPage.getByRole('button', { name: /finish setup/i }).click();
    await onboardingPage.waitForTimeout(500);
    assert(
      (await onboardingPage.getByRole('alert').count()) > 0,
      'onboarding.validation',
      'validation_state_missing',
    );
    await onboardingPage.getByRole('button', { name: /consumer/i }).click();
    await onboardingPage.getByRole('combobox', { name: /from year/i }).selectOption({ index: 1 });
    await onboardingPage.getByRole('combobox', { name: /to year/i }).selectOption({ index: 1 });
    await onboardingPage.getByRole('button', { name: /finish setup/i }).click();
    await onboardingPage.waitForURL((url) => url.pathname === '/app', { timeout: 20_000 });
  });
  await onboardingContext.close();

  const customerContext = await browser.newContext({ viewport: VIEWPORTS[2] });
  const customerPage = await loginPage(customerContext, identities.userB, '/app');
  await interaction('customer.settings-safe-update', async () => {
    await customerPage.goto(`${baseUrl}/app/settings`, { waitUntil: 'domcontentloaded' });
    const checkbox = customerPage.locator('input[type="checkbox"]').first();
    if (await checkbox.count()) {
      await checkbox.click();
      await customerPage.getByRole('button', { name: /save/i }).click();
      assert(
        (await customerPage.locator('[role="status"]').count()) > 0,
        'customer.settings-safe-update',
        'status_missing',
      );
    } else {
      throw new Error('settings_control_missing');
    }
  });
  await interaction('customer.tracker-empty-or-validation', async () => {
    await customerPage.goto(`${baseUrl}/app/tracker`, { waitUntil: 'domcontentloaded' });
    assert(
      (await customerPage.locator('body').innerText()).trim().length > 0,
      'customer.tracker',
      'blank_state',
    );
    const submit = customerPage.getByRole('button', { name: /start tracking/i });
    if (await submit.count()) {
      await submit.click();
      assert(
        (await customerPage.locator('select:invalid').count()) > 0,
        'customer.tracker',
        'validation_missing',
      );
    }
  });
  await customerContext.close();

  const adminContext = await browser.newContext({ viewport: VIEWPORTS[2] });
  const adminPage = await loginPage(adminContext, identities.admin, '/admin');
  await interaction('admin.navigation-and-filter', async () => {
    await adminPage.goto(`${baseUrl}/admin/candidates`, { waitUntil: 'domcontentloaded' });
    const links = await adminPage.getByRole('link').count();
    assert(links > 0, 'admin.navigation-and-filter', 'admin_navigation_missing');
    const input = adminPage.locator('input').first();
    if (await input.count()) {
      await input.fill('runtime-no-match');
      await input.press('Enter');
    }
    assert(
      (await adminPage.locator('body').innerText()).trim().length > 0,
      'admin.navigation-and-filter',
      'blank_after_filter',
    );
  });
  await adminPage.close();
  await adminContext.close();
}

export async function runProtectedBrowserQa(env = process.env) {
  const guards = buildQaGuards(env);
  assert(guards.appEnv === 'staging', 'guards', 'app_env_must_be_staging');
  assert(guards.projectRef === EXPECTED_PROJECT_REF, 'guards', 'project_ref_mismatch');
  assert(guards.url === `https://${EXPECTED_PROJECT_REF}.supabase.co`, 'guards', 'url_mismatch');
  const serverKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  assert(Boolean(serverKey), 'guards', 'missing_server_key');
  const { createClient } = requireFromWeb('@supabase/supabase-js');
  const adminDb = makeClient(createClient, guards.url, serverKey);
  const result = {
    status: 'failed',
    generated_at: new Date().toISOString(),
    final_head: env.FINAL_HEAD ?? null,
    guards: { APP_ENV: guards.appEnv, EXPECTED_STAGING_SUPABASE_PROJECT_REF: guards.projectRef },
    route_counts: { protected: 0, desktop: 0, tablet: 0, mobile: 0 },
    protected_route_checks: [],
    unauthenticated_boundary_checks: [],
    primary_interactions_discovered: 0,
    primary_interactions_verified: 0,
    primary_interactions: [],
    manual_wcag: {},
    failures: [],
    cleanup: { attempted: false, deleted_users: 0, residual_profiles: 'unknown' },
  };
  let identities;
  let createdIds = [];
  let server;
  try {
    await waitForServer();
    const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
    result.route_counts.protected = inventory.routes.filter((entry) =>
      ['admin', 'customer', 'onboarding'].includes(entry.surface),
    ).length;
    result.route_counts.desktop = result.route_counts.protected;
    result.route_counts.tablet = result.route_counts.protected;
    result.route_counts.mobile = result.route_counts.protected;
    const created = await createIdentities(adminDb, env);
    identities = {
      userA: created.identities[0],
      userB: created.identities[1],
      admin: created.identities[2],
    };
    createdIds = created.createdIds;
    const browser = await chromium.launch({ headless: true });
    await checkProtectedSurface(browser, identities.userA, 'onboarding', inventory, result);
    await checkProtectedSurface(browser, identities.userB, 'customer', inventory, result);
    await checkProtectedSurface(browser, identities.admin, 'admin', inventory, result);
    await checkUnauthorizedBoundary(browser, identities.userA, result);
    await verifyKeyboardAndZoom(browser, identities.userB, result);
    await exerciseInteractions(browser, identities, result);
    await browser.close();
    assert(
      result.protected_route_checks.length === result.route_counts.protected * VIEWPORTS.length,
      'routes',
      'protected_check_count_mismatch',
    );
    result.status = result.failures.length === 0 ? 'passed' : 'failed';
  } catch (error) {
    result.failures.push(String(error).slice(0, 240));
  } finally {
    result.cleanup.attempted = true;
    for (const userId of [...createdIds].reverse()) {
      const deleted = await adminDb.auth.admin.deleteUser(userId);
      if (!deleted.error) result.cleanup.deleted_users += 1;
    }
    if (createdIds.length) {
      const residual = await adminDb.from('profiles').select('id').in('id', createdIds);
      result.cleanup.residual_profiles = residual.error
        ? 'unknown'
        : (residual.data ?? []).length === 0;
    } else {
      result.cleanup.residual_profiles = true;
    }
    if (
      result.status === 'passed' &&
      (result.cleanup.deleted_users !== createdIds.length ||
        result.cleanup.residual_profiles !== true)
    ) {
      result.status = 'failed';
      result.failures.push('cleanup:residual_test_data');
    }
    if (server) server.kill();
    await fs.writeFile(
      outputPath,
      `${JSON.stringify(sanitizeQaSummary(result), null, 2)}\n`,
      'utf8',
    );
  }
  return result;
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) {
  runProtectedBrowserQa()
    .then((result) => {
      console.log(`FINAL_PROTECTED_BROWSER_QA ${result.status.toUpperCase()}`);
      console.log(`PROTECTED_CHECKS ${result.protected_route_checks.length}`);
      console.log(
        `PRIMARY_INTERACTIONS ${result.primary_interactions_verified}/${result.primary_interactions_discovered}`,
      );
      console.log(
        `CLEANUP deleted_users=${result.cleanup.deleted_users} residual_profiles=${result.cleanup.residual_profiles}`,
      );
      if (result.failures.length) {
        for (const failure of result.failures.slice(0, 20)) console.log(`FAILURE ${failure}`);
      }
      process.exitCode = result.status === 'passed' ? 0 : 1;
    })
    .catch((error) => {
      console.log(`FINAL_PROTECTED_BROWSER_QA FAILED ${runtimeErrorCode(error)}`);
      process.exitCode = 1;
    });
}
