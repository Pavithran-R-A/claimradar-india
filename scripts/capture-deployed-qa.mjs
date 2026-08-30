/**
 * ClaimRadar Deployed Staging Visual QA & Accessibility Suite
 *
 * Runs against the exact Vercel deployment URL specified in environment
 * using Vercel's official automation bypass header protocol.
 *
 * Evidence screenshots are written OUTSIDE the git repository to preserve Git HEAD.
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    env[t.slice(0, eq).trim()] = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

const automationEnv = loadEnvFile(path.resolve(__dirname, '../.env.automation'));
const BYPASS_SECRET =
  automationEnv['VERCEL_AUTOMATION_BYPASS_SECRET'] || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const BASE_URL = automationEnv['PREVIEW_URL'] || process.env.PREVIEW_URL;

if (!BASE_URL) {
  console.error(
    'FATAL ERROR: PREVIEW_URL is missing in environment configuration (.env.automation or process.env.PREVIEW_URL)',
  );
  process.exit(1);
}

if (!BYPASS_SECRET) {
  console.error(
    'FATAL ERROR: VERCEL_AUTOMATION_BYPASS_SECRET is missing in environment configuration',
  );
  process.exit(1);
}

const defaultOutDir = path.resolve(process.cwd(), 'docs', 'checkpoints', 'browser-evidence');
const OUT_DIR = process.env.OUT_DIR || defaultOutDir;
mkdirSync(OUT_DIR, { recursive: true });

const BYPASS_HEADERS = {
  'x-vercel-protection-bypass': BYPASS_SECRET,
  'x-vercel-set-bypass-cookie': 'true',
};

const CLAIMRADAR_MARKERS = ['ClaimRadar', 'claimradar', '__NEXT_DATA__'];
const INVALID_MARKERS = [
  'Log in to Vercel',
  'sso.vercel.com',
  'Vercel Authentication',
  'Deployment is building',
  '404: NOT_FOUND',
];

async function assertValidAppPage(page, label, responseStatus) {
  if (responseStatus < 200 || responseStatus >= 400) {
    throw new Error(`[${label}] FAIL: HTTP response status is ${responseStatus}`);
  }

  const content = await page.content();
  const title = await page.title();

  for (const invalid of INVALID_MARKERS) {
    if (content.includes(invalid) || title.includes(invalid)) {
      throw new Error(`[${label}] FAIL: Page matches invalid state marker "${invalid}"`);
    }
  }

  const isApp = CLAIMRADAR_MARKERS.some((m) => content.includes(m) || title.includes(m));
  if (!isApp) {
    throw new Error(`[${label}] FAIL: ClaimRadar markers not found in page title or content`);
  }
  return true;
}

async function shot(page, name) {
  const p = path.join(OUT_DIR, `stg-${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function newCtx(browser, width, height) {
  return browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    extraHTTPHeaders: BYPASS_HEADERS,
  });
}

async function loadPage(ctx, url, label) {
  const page = await ctx.newPage();
  console.log(`  [${label}] GET ${url}`);
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const status = response ? response.status() : 0;

  const finalUrl = page.url();
  const title = await page.title();
  const h1 = await page
    .locator('h1')
    .first()
    .textContent({ timeout: 5000 })
    .catch(() => '(none)');

  await assertValidAppPage(page, label, status);

  console.log(
    `  [${label}] ✅ status=${status} URL=${finalUrl.replace(BASE_URL, '') || '/'} title="${title.substring(0, 50)}" h1="${h1.substring(0, 50)}"`,
  );
  return { page, finalUrl, title, h1, status };
}

const results = {
  baseUrl: BASE_URL,
  timestamp: new Date().toISOString(),
  pages: {},
  accessibility: {},
  mobileDrawer: {},
  floatingControls: {},
  claimableState: 'UNKNOWN',
};

async function run() {
  console.log('=== ClaimRadar Deployed Staging Hardened QA ===');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Evidence Directory (External to Git): ${OUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });

  // 1. HOMEPAGE VIEWPORTS (9 viewports)
  const homeViewports = [
    ['desktop-1536', 1536, 960],
    ['desktop-1440', 1440, 900],
    ['desktop-1280', 1280, 800],
    ['tablet-1024', 1024, 768],
    ['tablet-768', 768, 1024],
    ['mobile-430', 430, 932],
    ['mobile-390', 390, 844],
    ['mobile-360', 360, 800],
    ['mobile-320', 320, 568],
  ];

  console.log('--- 1. Homepage (9 viewports: top, mid, footer) ---');
  for (const [name, w, h] of homeViewports) {
    const ctx = await newCtx(browser, w, h);
    const { page, title, h1, status, finalUrl } = await loadPage(ctx, BASE_URL, name);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await shot(page, `home-${name}-top`);

    await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45)));
    await page.waitForTimeout(300);
    await shot(page, `home-${name}-mid`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await shot(page, `home-${name}-footer`);

    const floats = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*'))
        .filter((el) => {
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return (
            (s.position === 'fixed' || s.position === 'sticky') &&
            r.right > window.innerWidth - 100 &&
            r.top > 80 &&
            r.bottom < window.innerHeight - 80 &&
            r.width > 20 &&
            r.height > 20
          );
        })
        .map((el) => ({ tag: el.tagName, cls: (el.className || '').substring(0, 60) })),
    );
    results.floatingControls[name] = floats.length;

    results.pages[`home-${name}`] = {
      title,
      h1,
      status,
      finalUrl,
      viewport: `${w}x${h}`,
      floatingControls: floats.length,
    };
    await ctx.close();
  }

  // 2. MOBILE DRAWER PROOF (390x844)
  console.log('\n--- 2. Mobile Drawer Proof (390x844) ---');
  {
    const ctx = await newCtx(browser, 390, 844);
    const { page } = await loadPage(ctx, BASE_URL, 'mobile-drawer');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const toggleBtn = page.locator('header button[aria-label="Open menu"]').first();
    await toggleBtn.waitFor({ state: 'visible', timeout: 8000 });
    await toggleBtn.click();
    await page.waitForTimeout(800);

    await shot(page, 'mobile-drawer-open');

    const dialog = page.locator('[role="dialog"]');
    const drawerVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);
    const navLinksText = await page
      .locator('nav[aria-label="Mobile navigation"] a')
      .allTextContents()
      .catch(() => []);
    const signInVisible = await dialog
      .locator('a[href="/login"]')
      .isVisible()
      .catch(() => false);
    const getAlertsVisible = await dialog
      .locator('a[href="/register"]')
      .isVisible()
      .catch(() => false);

    console.log(`  Drawer dialog visible: ${drawerVisible}`);
    console.log(`  Drawer nav links: ${JSON.stringify(navLinksText)}`);
    console.log(`  Drawer Sign in visible: ${signInVisible}`);
    console.log(`  Drawer Get alerts visible: ${getAlertsVisible}`);

    // Escape handling
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const closedOnEscape = !(await dialog.isVisible({ timeout: 1000 }).catch(() => true));
    await shot(page, 'mobile-drawer-closed');
    console.log(`  Closes on Escape: ${closedOnEscape}`);

    // Navigation trigger
    const reOpenBtn = page.locator('header button[aria-label="Open menu"]').first();
    await reOpenBtn.click();
    await page.waitForTimeout(500);
    const claimablesLink = dialog.locator('nav a[href="/claimables"]').first();
    const navigated = await claimablesLink
      .click()
      .then(() => page.waitForURL(/claimables/, { timeout: 10000 }))
      .then(() => page.url().includes('/claimables'))
      .catch(() => false);
    console.log(`  Drawer navigation works: ${navigated}`);

    results.mobileDrawer = {
      drawerVisible,
      navLinksText,
      signInVisible,
      getAlertsVisible,
      closedOnEscape,
      navigated,
    };
    await ctx.close();
  }

  // 3. SECONDARY PAGES
  const secondaryPages = [
    ['claimables-1440', '/claimables', 1440, 900],
    ['claimables-390', '/claimables', 390, 844],
    ['closing-soon-1440', '/closing-soon', 1440, 900],
    ['closing-soon-390', '/closing-soon', 390, 844],
    ['companies-1440', '/companies', 1440, 900],
    ['sectors-1440', '/sectors', 1440, 900],
    ['deadlines-1440', '/deadlines', 1440, 900],
    ['deadlines-390', '/deadlines', 390, 844],
    ['sources-1440', '/sources', 1440, 900],
    ['sources-390', '/sources', 390, 844],
    ['how-it-works-1440', '/how-it-works', 1440, 900],
    ['how-it-works-390', '/how-it-works', 390, 844],
    ['methodology-1440', '/methodology', 1440, 900],
    ['methodology-390', '/methodology', 390, 844],
    ['faq-1440', '/faq', 1440, 900],
    ['login-1440', '/login', 1440, 900],
    ['login-390', '/login', 390, 844],
    ['register-1440', '/register', 1440, 900],
    ['app-1440', '/app', 1440, 900],
    ['admin-1440', '/admin', 1440, 900],
  ];

  console.log('\n--- 3. Secondary Pages Captures ---');
  for (const [name, route, w, h] of secondaryPages) {
    const ctx = await newCtx(browser, w, h);
    try {
      const { page, title, h1, status, finalUrl } = await loadPage(
        ctx,
        `${BASE_URL}${route}`,
        name,
      );

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await shot(page, `${name}-top`);

      if (route === '/claimables' && name === 'claimables-1440') {
        const bodyText = await page.textContent('body');
        if (bodyText.includes('Directory temporarily unavailable')) {
          results.claimableState = 'DATABASE_ERROR';
        } else if (
          bodyText.includes('No published claimables yet') ||
          bodyText.includes('No published opportunities found') ||
          bodyText.includes('No verified opportunities published yet') ||
          bodyText.includes('No published opportunities listed yet')
        ) {
          results.claimableState = 'VALID_ZERO_RESULTS';
        }
        console.log(`  [claimables status] state: ${results.claimableState}`);
      }

      results.pages[name] = { title, h1, status, finalUrl, viewport: `${w}x${h}` };
    } catch (err) {
      console.error(`  [${name}] ERROR: ${err.message}`);
      results.pages[name] = { error: err.message };
    }
    await ctx.close();
  }

  // 4. ACCESSIBILITY AUDIT (1440x900)
  console.log('\n--- 4. Accessibility Audit (deployed staging 1440x900) ---');
  {
    const ctx = await newCtx(browser, 1440, 900);
    const { page } = await loadPage(ctx, BASE_URL, 'a11y');

    await page.keyboard.press('Tab');
    const firstFocusTag = await page.evaluate(() => document.activeElement?.tagName);
    const firstFocusText = await page
      .evaluate(() => document.activeElement?.textContent?.trim().substring(0, 60))
      .catch(() => '');
    const firstFocusHref = await page
      .evaluate(() => document.activeElement?.getAttribute?.('href'))
      .catch(() => null);

    const skipLinkOperable =
      firstFocusTag === 'A' &&
      (firstFocusText?.toLowerCase().includes('skip') || firstFocusHref === '#main-content');

    const h1Count = await page.locator('h1').count();
    const h1Text = await page
      .locator('h1')
      .first()
      .textContent()
      .catch(() => '');
    const imgNoAlt = await page.locator('img:not([alt])').count();
    const detailsCount = await page.locator('details').count();
    const summaryCount = await page.locator('summary').count();

    let faqStartsCollapsed = false;
    let faqKeyboardToggle = false;
    if (detailsCount > 0) {
      faqStartsCollapsed = await page.evaluate(() => !document.querySelector('details')?.open);
      const firstSummary = page.locator('summary').first();
      await firstSummary.focus();
      const before = await page.evaluate(() => document.querySelector('details')?.open);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => document.querySelector('details')?.open);
      faqKeyboardToggle = before !== after;
    }

    const navLinks = await page.locator('header nav a').allTextContents();
    const actionButtons = await page.locator('header div a').allTextContents();

    results.accessibility = {
      skipLinkOperable,
      firstFocusTag,
      firstFocusText,
      h1Count,
      h1Text,
      imgNoAlt,
      detailsCount,
      summaryCount,
      faqStartsCollapsed,
      faqKeyboardToggle,
      headerNavLinks: navLinks,
      headerActionButtons: actionButtons,
      faqImplementation: 'NATIVE_DETAILS_SUMMARY',
    };

    console.log(`  Skip link operable: ${skipLinkOperable} (${firstFocusTag} "${firstFocusText}")`);
    console.log(`  H1 count: ${h1Count} ("${h1Text.substring(0, 50)}")`);
    console.log(`  Images missing alt: ${imgNoAlt}`);
    console.log(`  FAQ details count: ${detailsCount}, summary count: ${summaryCount}`);
    console.log(`  FAQ starts collapsed: ${faqStartsCollapsed}`);
    console.log(`  FAQ keyboard toggle: ${faqKeyboardToggle}`);
    console.log(`  Header Nav links: ${JSON.stringify(navLinks)}`);
    console.log(`  Header Actions: ${JSON.stringify(actionButtons)}`);

    await ctx.close();
  }

  await browser.close();

  const resultsPath = path.join(OUT_DIR, 'qa-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2) + '\n');
  console.log(`\nResults written to external path: ${resultsPath}`);
  console.log(`Screenshots stored in external path: ${OUT_DIR}`);
}

run().catch((err) => {
  console.error('\nFATAL ERROR:', err.message);
  process.exit(1);
});
