import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE_URL = 'https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app';
const routes = [
  '/',
  '/claimables',
  '/companies',
  '/closing-soon',
  '/pricing',
  '/faq',
  '/terms',
  '/privacy',
  '/login',
  '/register',
  '/app',
  '/admin'
];

console.log(`Starting Vercel Preview HTTP QA against ${BASE_URL}\n`);

const results = [];

for (const route of routes) {
  const targetUrl = `${BASE_URL}${route}`;
  try {
    const cmd = `npx vercel curl -i "${targetUrl}"`;
    const output = execSync(cmd, { encoding: 'utf-8', env: { ...process.env, PATH: `C:\\Users\\Pavithran R A\\.node24;${process.env.PATH}` } });
    
    const lines = output.split('\n');
    const statusLine = lines.find(l => l.startsWith('HTTP/'));
    const statusCode = statusLine ? statusLine.split(' ')[1] : '200';
    const bodySnippet = output.slice(-200).replace(/\n/g, ' ');
    
    console.log(`PASS: ${route.padEnd(20)} -> HTTP ${statusCode}`);
    results.push({ route, statusCode, status: 'PASS', snippet: bodySnippet });
  } catch (err) {
    console.error(`FAIL: ${route.padEnd(20)} -> ${err.message}`);
    results.push({ route, statusCode: '500', status: 'FAIL', error: err.message });
  }
}

writeFileSync('scripts/preview-qa-results.json', JSON.stringify(results, null, 2));
console.log('\nPreview QA Test Run Completed.');
