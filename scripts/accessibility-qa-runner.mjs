import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';


const ACCESSIBILITY_ROUTES = [
  '/',
  '/claimables',
  '/companies',
  '/deadlines',
  '/sectors',
  '/login',
  '/app',
  '/admin',
];

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 302 || res.status === 404) {
        return true;
      }
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server failed to start at ${url}`);
}

async function auditAccessibility() {
  console.log('Starting Next.js web server on port 3000 for Accessibility Audit...');
  const env = { ...process.env, PORT: '3000', NODE_ENV: 'production' };
  const serverProc = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: path.join(process.cwd(), 'apps', 'web'),
    stdio: 'ignore',
    shell: true,
    env,
  });


  try {
    await waitForServer('http://localhost:3000');
    console.log('Next.js server is ready.');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const auditResults = [];

    for (const routePath of ACCESSIBILITY_ROUTES) {
      console.log(`\nAuditing Accessibility on Route: ${routePath}`);
      await page.goto(`http://localhost:3000${routePath}`, { waitUntil: 'domcontentloaded' });

      // Run DOM accessibility checks
      const domAudit = await page.evaluate(() => {
        const issues = [];

        // 1. Heading hierarchy check
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const h1s = headings.filter((h) => h.tagName === 'H1');
        if (h1s.length === 0) issues.push('Missing H1 heading on page');
        if (h1s.length > 1) issues.push(`Multiple H1 headings found (${h1s.length})`);

        // 2. Image alt tags
        const images = Array.from(document.querySelectorAll('img'));
        const missingAlt = images.filter((img) => !img.hasAttribute('alt'));
        if (missingAlt.length > 0) issues.push(`${missingAlt.length} image(s) missing alt attribute`);

        // 3. Form input labels
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        const unlabelled = inputs.filter(
          (input) =>
            !input.getAttribute('aria-label') &&
            !input.getAttribute('aria-labelledby') &&
            !input.id &&
            !document.querySelector(`label[for="${input.id}"]`)
        );
        if (unlabelled.length > 0) issues.push(`${unlabelled.length} form input(s) missing label or aria-label`);

        // 4. Duplicate ID check
        const allIds = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
        const dupes = allIds.filter((id, index) => id && allIds.indexOf(id) !== index);
        if (dupes.length > 0) issues.push(`Duplicate IDs found: ${Array.from(new Set(dupes)).join(', ')}`);

        // 5. Interactive elements touch target size
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const smallTargets = buttons.filter((btn) => {
          const rect = btn.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
        });
        if (smallTargets.length > 0) {
          issues.push(`${smallTargets.length} interactive button(s)/link(s) below recommended 24px target height`);
        }

        return {
          h1Count: h1s.length,
          headingsCount: headings.length,
          imagesCount: images.length,
          inputsCount: inputs.length,
          issues,
        };
      });

      console.log(`  - H1 Count: ${domAudit.h1Count}`);
      console.log(`  - Total Headings: ${domAudit.headingsCount}`);
      console.log(`  - Issues Detected: ${domAudit.issues.length}`);
      if (domAudit.issues.length > 0) {
        domAudit.issues.forEach((iss) => console.log(`    * WARNING: ${iss}`));
      } else {
        console.log(`    ✓ Clean DOM accessibility compliance!`);
      }

      auditResults.push({ route: routePath, ...domAudit });
    }

    await browser.close();
    return auditResults;
  } finally {
    serverProc.kill();
  }
}

auditAccessibility()
  .then(() => console.log('\nAutomated Accessibility Audit Finished.'))
  .catch((err) => console.error('Accessibility Audit failed:', err));
