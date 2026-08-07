import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x800', width: 360, height: 800 },
  { name: '320x568', width: 320, height: 568 },
];

const ROUTES = [
  { path: '/', name: 'homepage' },
  { path: '/claimables', name: 'claimables' },
  { path: '/companies', name: 'companies' },
  { path: '/deadlines', name: 'deadlines' },
  { path: '/sectors', name: 'sectors' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/app', name: 'customer-app' },
  { path: '/app/matches', name: 'customer-matches' },
  { path: '/app/watchlist', name: 'customer-watchlist' },
  { path: '/app/tracker', name: 'customer-tracker' },
  { path: '/admin', name: 'admin-dashboard' },
  { path: '/admin/candidates', name: 'admin-candidates' },
  { path: '/admin/sources', name: 'admin-sources' },
];

const OUTPUT_DIR = path.join(process.cwd(), 'docs', 'checkpoints', 'browser-evidence');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 302 || res.status === 404) {
        return true;
      }
    } catch {
      // ignore connection refused
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs}ms`);
}

async function main() {
  console.log('Starting Next.js production web server on port 3000...');

  const env = { ...process.env, PORT: '3000', NODE_ENV: 'production' };
  const serverProc = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: path.join(process.cwd(), 'apps', 'web'),
    stdio: 'ignore',
    shell: true,
    env,
  });

  try {
    console.log('Waiting for Next.js server on http://localhost:3000 ...');
    await waitForServer('http://localhost:3000');
    console.log('Next.js server is active!');

    console.log('Launching Playwright Chromium browser...');
    const browser = await chromium.launch({ headless: true });

    let totalScreenshots = 0;

    for (const route of ROUTES) {
      console.log(`\n--- Auditing Route: ${route.path} (${route.name}) ---`);

      // Standard viewports QA
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();

        try {
          await page.goto(`http://localhost:3000${route.path}`, {
            waitUntil: 'networkidle',
            timeout: 15000,
          });
        } catch {
          await page.goto(`http://localhost:3000${route.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });
        }

        const filename = `${route.name}-${vp.name}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: filepath, fullPage: false });
        totalScreenshots++;
        console.log(`Saved: ${filename}`);

        await context.close();
      }

      // Reduced motion test on Desktop viewport
      const rmContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      const rmPage = await rmContext.newPage();
      try {
        await rmPage.goto(`http://localhost:3000${route.path}`, { waitUntil: 'domcontentloaded' });
      } catch {
        // ok
      }
      const rmFilename = `${route.name}-reduced-motion.png`;
      await rmPage.screenshot({ path: path.join(OUTPUT_DIR, rmFilename) });
      totalScreenshots++;
      await rmContext.close();
    }

    console.log(
      `\nBrowser QA Completed! Generated ${totalScreenshots} screenshots in ${OUTPUT_DIR}`,
    );
    await browser.close();
  } finally {
    serverProc.kill();
  }
}

main().catch((err) => {
  console.error('Browser QA script failed:', err);
  process.exit(1);
});
