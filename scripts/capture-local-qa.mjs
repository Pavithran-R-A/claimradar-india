import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:3099';
const OUT = path.resolve(__dirname, '../docs/checkpoints/browser-evidence');
mkdirSync(OUT, { recursive: true });

const VPS = [
  ['desktop-1536', 1536, 960],
  ['desktop-1440', 1440, 900],
  ['tablet-1024', 1024, 768],
  ['tablet-768', 768, 1024],
  ['mobile-430', 430, 932],
  ['mobile-390', 390, 844],
  ['mobile-360', 360, 800],
];

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: false });
}

const browser = await chromium.launch({ headless: true });

// --- Homepage at all viewports ---
for (const [name, w, h] of VPS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  console.log(`[${name}] Loading homepage...`);
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000); // let Next.js hydrate

  const title = await page.title();
  const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
  console.log(`  title="${title.substring(0, 60)}" h1="${h1.substring(0, 60)}"`);

  // top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot(page, `qa-home-${name}-top`);

  // mid
  await page.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45)));
  await page.waitForTimeout(300);
  await shot(page, `qa-home-${name}-mid`);

  // footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await shot(page, `qa-home-${name}-footer`);

  // mobile menu
  if (w <= 768) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const btn = page.locator('button[aria-label*="menu" i], button[aria-label*="nav" i]').first();
    const visible = await btn.isVisible().catch(() => false);
    if (visible) {
      await btn.click();
      await page.waitForTimeout(500);
      await shot(page, `qa-home-${name}-menu-open`);
      console.log(`  Mobile menu captured`);
    }
  }

  // floating right controls
  const floats = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (s.position === 'fixed' || s.position === 'sticky')
          && r.right > window.innerWidth - 100
          && r.top > 80 && r.bottom < window.innerHeight - 80
          && r.width > 20 && r.height > 20;
      })
      .slice(0, 5)
      .map(el => ({ tag: el.tagName, cls: (el.className || '').substring(0, 60) }));
  });
  console.log(`  Floating controls: ${floats.length}`);
  if (floats.length) console.log('  ', JSON.stringify(floats));

  await ctx.close();
}

// --- Claimables ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log('\nLoading /claimables 1440x900...');
  await page.goto(BASE + '/claimables', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
  console.log(`  h1="${h1.substring(0, 80)}"`);
  await shot(page, 'qa-claimables-1440-top');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await shot(page, 'qa-claimables-1440-footer');
  await ctx.close();
}

// --- Claimables mobile ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  console.log('Loading /claimables 390x844...');
  await page.goto(BASE + '/claimables', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await shot(page, 'qa-claimables-390-top');
  await ctx.close();
}

// --- Login ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log('Loading /login 1440x900...');
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
  console.log(`  h1="${h1}"`);
  await shot(page, 'qa-login-1440');
  await ctx.close();
}

// --- Register ---
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log('Loading /register 1440x900...');
  await page.goto(BASE + '/register', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await shot(page, 'qa-register-1440');
  await ctx.close();
}

// --- Accessibility audit ---
{
  console.log('\nAccessibility audit...');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.keyboard.press('Tab');
  const focusTag = await page.evaluate(() => document.activeElement?.tagName);
  const focusText = await page.evaluate(() => document.activeElement?.textContent?.trim().substring(0, 50));
  const h1Count = await page.locator('h1').count();
  const imgNoAlt = await page.locator('img:not([alt])').count();
  const detailsCount = await page.locator('details').count();
  const summaryCount = await page.locator('summary').count();

  console.log(`  First Tab focus: ${focusTag} "${focusText}"`);
  console.log(`  H1 count: ${h1Count}`);
  console.log(`  Images missing alt: ${imgNoAlt}`);
  console.log(`  FAQ <details>: ${detailsCount}, <summary>: ${summaryCount}`);

  let faqKb = 'N/A (no details)';
  if (detailsCount > 0) {
    const summary = page.locator('summary').first();
    await summary.focus();
    const before = await page.locator('details').first().getAttribute('open');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const after = await page.locator('details').first().getAttribute('open');
    faqKb = before !== after ? 'YES' : 'NO';
  }
  console.log(`  FAQ keyboard toggle: ${faqKb}`);

  await ctx.close();
}

await browser.close();
console.log('\nAll screenshots saved to:', OUT);
