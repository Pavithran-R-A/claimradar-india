import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = process.cwd();
const inventoryPath = path.join(root, 'docs/checkpoints/final-route-state-inventory.json');
const outputPath = path.join(root, 'docs/checkpoints/final-route-browser-qa.json');
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];
const dynamicValues = {
  slug: 'iepf-unclaimed-dividends',
  id: '00000000-0000-0000-0000-000000000000',
  term: 'claim',
};
const protectedSurfaces = new Set(['admin', 'customer', 'onboarding']);
const protectedRouteQaEnabled = process.env.FINAL_ROUTE_QA_PROTECTED === 'true';
const expectedNotFoundRoutes = new Set([
  '/glossary/<term>',
  '/guides/<slug>',
  '/questions/<slug>',
  '/updates/<slug>',
]);

const routePath = (route) =>
  route.replace(/<([^>]+)>/g, (_, name) => dynamicValues[name] ?? 'test-value');

const waitForServer = async () => {
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
  throw new Error(`server did not respond: ${baseUrl}`);
};

const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
  cwd: path.join(root, 'apps/web'),
  stdio: 'ignore',
  env: { ...process.env, NODE_ENV: 'production' },
});
const result = {
  generated_at: new Date().toISOString(),
  base_url: baseUrl,
  route_count: inventory.routes.length,
  viewport_count: viewports.length,
  checks: [],
  failures: [],
};

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const entry of inventory.routes) {
      const route = routePath(entry.route);
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 240));
      });
      page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 240)));
      let response;
      try {
        response = await page.goto(`${baseUrl}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20_000,
        });
        if (response?.status() === 404) await page.waitForTimeout(300);
        await page.keyboard.press('Tab');
        const state = await page.evaluate(() => {
          const active = document.activeElement;
          const activeRect = active?.getBoundingClientRect();
          return {
            blank: !document.body?.innerText?.trim(),
            overflow:
              document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            activeVisible: Boolean(activeRect && activeRect.width > 0 && activeRect.height > 0),
          };
        });
        const protectedRoute = protectedSurfaces.has(entry.surface);
        const runProtectedChecks = protectedRouteQaEnabled || !protectedRoute;
        const expectedNotFound =
          expectedNotFoundRoutes.has(entry.route) && response?.status() === 404;
        const unexpectedConsoleErrors = consoleErrors.filter(
          (message) =>
            !(
              expectedNotFound &&
              message.includes('Failed to load resource: the server responded with a status of 404')
            ),
        );
        const axe = runProtectedChecks
          ? await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
          : { violations: [] };
        const check = {
          route: entry.route,
          resolved_route: route,
          surface: entry.surface,
          viewport: viewport.name,
          http_status: response?.status() ?? null,
          blank: state.blank,
          horizontal_overflow: state.overflow,
          active_focus_visible: state.activeVisible,
          verification: runProtectedChecks
            ? protectedRoute
              ? 'AUTHENTICATED_PROTECTED_ROUTE'
              : 'PUBLIC_OR_AUTH_ROUTE'
            : 'AUTHENTICATED_RUNTIME_REQUIRED',
          protected_route_skipped: protectedRoute && !runProtectedChecks,
          expected_not_found: expectedNotFound,
          axe_violations: axe.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            description: violation.description,
            nodes: violation.nodes.length,
            targets: violation.nodes.map((node) => node.target).slice(0, 10),
            failure_summaries: violation.nodes
              .map((node) => node.failureSummary)
              .filter(Boolean)
              .slice(0, 10),
          })),
          console_error_count: unexpectedConsoleErrors.length,
          expected_console_error_count: consoleErrors.length - unexpectedConsoleErrors.length,
          console_errors: consoleErrors.slice(0, 3),
          page_error_count: pageErrors.length,
          page_errors: pageErrors.slice(0, 3),
        };
        result.checks.push(check);
        if (!protectedRoute && (response?.status() ?? 599) >= 500)
          result.failures.push(`${viewport.name} ${entry.route}: HTTP ${response.status()}`);
        if (!protectedRoute && state.blank)
          result.failures.push(`${viewport.name} ${entry.route}: blank page`);
        if (!protectedRoute && state.overflow)
          result.failures.push(`${viewport.name} ${entry.route}: horizontal overflow`);
        if (!protectedRoute && !state.activeVisible)
          result.failures.push(`${viewport.name} ${entry.route}: invisible focus`);
        if (axe.violations.length)
          result.failures.push(`${viewport.name} ${entry.route}: axe violations`);
        if (runProtectedChecks && unexpectedConsoleErrors.length)
          result.failures.push(`${viewport.name} ${entry.route}: console errors`);
        if (runProtectedChecks && pageErrors.length)
          result.failures.push(`${viewport.name} ${entry.route}: page errors`);
      } catch (error) {
        result.failures.push(`${viewport.name} ${entry.route}: ${String(error).slice(0, 240)}`);
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(`Final route browser QA: ${result.checks.length} checks.`);
console.log(`Routes: ${result.route_count}; viewports: ${result.viewport_count}.`);
console.log(`Failures: ${result.failures.length}.`);
if (result.failures.length) {
  result.failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
