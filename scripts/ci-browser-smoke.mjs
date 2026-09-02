import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const routes = [
  '/',
  '/claimables',
  '/closing-soon',
  '/companies',
  '/sectors',
  '/how-it-works',
  '/methodology',
  '/sources',
  '/login',
  '/register',
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

function commandName() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

async function waitForServer(url) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server did not respond: ${url}`);
}

const server = spawn(commandName(), ['next', 'start', '-p', '3000'], {
  cwd: 'apps/web',
  stdio: 'ignore',
  env: { ...process.env, NODE_ENV: 'production' },
});

try {
  await waitForServer(`${baseUrl}/`);
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      const errorText = request.failure()?.errorText || '';
      if (!errorText.includes('ERR_ABORTED')) {
        failedRequests.push(`${request.method()} ${request.url()}: ${errorText}`);
      }
    });

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        errorPage: /application error|internal server error|404 not found/i.test(
          document.body?.innerText || '',
        ),
      }));
      if (!response || response.status() >= 400) {
        failures.push(`${viewport.name} ${route}: HTTP ${response?.status() ?? 'no response'}`);
      }
      if (state.overflow) failures.push(`${viewport.name} ${route}: horizontal overflow`);
      if (state.errorPage) failures.push(`${viewport.name} ${route}: error page text`);
    }

    if (consoleErrors.length > 0) {
      failures.push(`${viewport.name}: console errors: ${consoleErrors.join(' | ')}`);
    }
    if (failedRequests.length > 0) {
      failures.push(`${viewport.name}: failed requests: ${failedRequests.join(' | ')}`);
    }
    await context.close();
  }

  await browser.close();
  if (failures.length > 0) {
    console.error('Browser smoke failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else {
    console.log(`Browser smoke passed: ${routes.length} routes across two viewports.`);
  }
} finally {
  server.kill();
}
