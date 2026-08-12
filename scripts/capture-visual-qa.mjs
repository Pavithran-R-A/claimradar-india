/**
 * ClaimRadar Visual QA Screenshot Capture
 * Uses x-vercel-protection-bypass cookie to bypass Deployment Protection
 * and capture actual application screenshots.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

const automationEnv = loadEnvFile(path.resolve(__dirname, '../.env.automation'));
const BYPASS_SECRET =
  automationEnv['VERCEL_AUTOMATION_BYPASS_SECRET'] || process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const BASE_URL =
  automationEnv['PREVIEW_URL'] ||
  'https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app';

if (!BYPASS_SECRET) {
  console.error('VERCEL_AUTOMATION_BYPASS_SECRET missing from .env.automation');
  process.exit(1);
}

const OUT_DIR = path.resolve(__dirname, '../docs/checkpoints/browser-evidence');
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const hostname = new URL(BASE_URL).hostname;

// Bypass cookie that Vercel Deployment Protection respects
const BYPASS_COOKIE = {
  name: 'x-vercel-protection-bypass',
  value: BYPASS_SECRET,
  domain: hostname,
  path: '/',
  httpOnly: false,
  secure: true,
  sameSite: 'None',
};

// Also send as header on every request
const EXTRA_HEADERS = {
  'x-vercel-protection-bypass': BYPASS_SECRET,
};

const VIEWPORTS = [
  { name: 'desktop-1536', width: 1536, height: 960 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
];

const CLAIMRADAR_MARKERS = ['ClaimRadar', 'claimradar', '__NEXT_DATA__'];

async function verifyIsClaimRadar(page) {
  const content = await page.content();
  return CLAIMRADAR_MARKERS.some((m) => content.includes(m));
}

async function run() {
  console.log('=== ClaimRadar Visual QA Screenshot Capture ===');
  console.log(`Target: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });

  const floatingSummary = [];
  const a11ySummary = {};

  // === Homepage at each viewport ===
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      extraHTTPHeaders: EXTRA_HEADERS,
    });
    await context.addCookies([BYPASS_COOKIE]);

    const page = await context.newPage();

    console.log(`[${vp.name}] Loading ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const isApp = await verifyIsClaimRadar(page);
    console.log(`[${vp.name}] ClaimRadar app confirmed: ${isApp}`);

    if (!isApp) {
      console.warn(`[${vp.name}] WARNING: Not showing ClaimRadar app - may still be blocked`);
      // Try reloading with explicit bypass header navigation
      await page.setExtraHTTPHeaders(EXTRA_HEADERS);
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    }
    // Wait for Next.js app shell to hydrate
    await page
      .waitForFunction(
        () => document.querySelector('main, #main-content, [data-testid]') !== null,
        { timeout: 10000 },
      )
      .catch(() => {});

    // Top-of-page (hero + first content)
    await page.screenshot({
      path: path.join(OUT_DIR, `home-${vp.name}-top.png`),
      fullPage: false,
    });

    // Footer (scroll to bottom)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT_DIR, `home-${vp.name}-footer.png`),
      fullPage: false,
    });

    // Full page
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(OUT_DIR, `home-${vp.name}-full.png`),
      fullPage: true,
    });

    // Mobile: try to open menu
    if (vp.width <= 768) {
      const menuBtn = await page.$(
        '[aria-label="Open menu"], [aria-label="Toggle menu"], button[class*="menu"]',
      );
      if (menuBtn) {
        await menuBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({
          path: path.join(OUT_DIR, `home-${vp.name}-menu-open.png`),
          fullPage: false,
        });
        console.log(`[${vp.name}] Mobile menu screenshot captured`);
      }
    }

    // Check for floating right-side controls
    const floats = await page.$$eval('*', (els) =>
      els
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
        .slice(0, 5)
        .map((el) => ({
          tag: el.tagName,
          cls: el.className?.substring(0, 60),
          txt: el.innerText?.substring(0, 30),
        })),
    );
    floatingSummary.push({ viewport: vp.name, count: floats.length, details: floats });

    await context.close();
  }

  // === Claimables directory ===
  console.log('\nLoading /claimables at 1440x900...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([BYPASS_COOKIE]);
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/claimables`, { waitUntil: 'networkidle', timeout: 30000 });
    const isApp = await verifyIsClaimRadar(page);
    console.log(`  ClaimRadar confirmed: ${isApp}`);
    await page.screenshot({ path: path.join(OUT_DIR, 'directory-1440-top.png'), fullPage: false });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, 'directory-1440-footer.png'),
      fullPage: false,
    });
    await ctx.close();
  }

  // === Claimables directory at mobile ===
  console.log('Loading /claimables at 390x844...');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addCookies([BYPASS_COOKIE]);
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/claimables`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(OUT_DIR, 'directory-390-top.png'), fullPage: false });
    await ctx.close();
  }

  // === Login ===
  console.log('Loading /login at 1440x900...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([BYPASS_COOKIE]);
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const isApp = await verifyIsClaimRadar(page);
    console.log(`  ClaimRadar confirmed: ${isApp}`);
    await page.screenshot({ path: path.join(OUT_DIR, 'login-1440.png'), fullPage: false });
    await ctx.close();
  }

  // === Register ===
  console.log('Loading /register at 1440x900...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([BYPASS_COOKIE]);
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join(OUT_DIR, 'register-1440.png'), fullPage: false });
    await ctx.close();
  }

  // === Accessibility DOM audit on homepage ===
  console.log('\nRunning Accessibility DOM Audit...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([BYPASS_COOKIE]);
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Tab to first element
    await page.keyboard.press('Tab');
    const firstFocusTag = await page.evaluate(() => document.activeElement?.tagName);
    const firstFocusText = await page.evaluate(() => document.activeElement?.textContent?.trim());

    const h1Count = await page.$$eval('h1', (els) => els.length);
    const imgNoAlt = await page.$$eval('img:not([alt])', (els) => els.length);
    const h1Text = await page.$$eval('h1', (els) => els.map((e) => e.textContent?.trim()));

    // Check FAQ is native details/summary
    const faqDetails = await page.$$eval('details', (els) => els.length);
    const faqSummary = await page.$$eval('summary', (els) => els.length);

    a11ySummary.firstFocusTag = firstFocusTag;
    a11ySummary.firstFocusText = firstFocusText;
    a11ySummary.skipLinkOperable =
      firstFocusTag === 'A' &&
      (firstFocusText?.includes('Skip') || firstFocusText?.includes('content'));
    a11ySummary.h1Count = h1Count;
    a11ySummary.h1Text = h1Text;
    a11ySummary.imgNoAlt = imgNoAlt;
    a11ySummary.faqDetailsElements = faqDetails;
    a11ySummary.faqSummaryElements = faqSummary;

    // FAQ toggle keyboard test
    if (faqDetails > 0) {
      const firstSummary = await page.$('summary');
      if (firstSummary) {
        await firstSummary.focus();
        const openBefore = await page.$eval('details', (el) => el.open);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        const openAfter = await page.$eval('details', (el) => el.open);
        a11ySummary.faqKeyboardToggle = openBefore !== openAfter;
      }
    }

    await ctx.close();
  }

  await browser.close();

  // === Print summary ===
  console.log('\n=== VISUAL QA RESULTS SUMMARY ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Viewports Tested: ${VIEWPORTS.length}`);
  console.log('\nAccessibility:');
  console.log(
    `  Skip Link Operable: ${a11ySummary.skipLinkOperable ? 'YES' : 'NO'} (first focus: ${a11ySummary.firstFocusTag} "${a11ySummary.firstFocusText}")`,
  );
  console.log(`  H1 Count: ${a11ySummary.h1Count} — "${a11ySummary.h1Text?.[0]}"`);
  console.log(`  Images Missing Alt: ${a11ySummary.imgNoAlt}`);
  console.log(`  FAQ <details> elements: ${a11ySummary.faqDetailsElements}`);
  console.log(`  FAQ <summary> elements: ${a11ySummary.faqSummaryElements}`);
  console.log(`  FAQ Keyboard Toggle Works: ${a11ySummary.faqKeyboardToggle ? 'YES' : 'NO'}`);

  console.log('\nFloating Controls:');
  for (const f of floatingSummary) {
    console.log(`  [${f.viewport}]: ${f.count} fixed right controls`);
    if (f.count > 0) console.log('    Details:', f.details);
  }

  console.log('\nScreenshots saved to:', OUT_DIR);
}

run().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
