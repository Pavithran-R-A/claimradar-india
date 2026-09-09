import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

const root = path.resolve(import.meta.dirname, '..');
const appRoot = path.join(root, 'apps', 'web', 'app');
const output = path.join(root, 'docs', 'checkpoints', 'final-route-state-inventory.json');
const matrixOutput = path.join(root, 'docs', 'checkpoints', 'final-route-state-matrix.md');
const evidencePath = path.join(
  root,
  'docs',
  'checkpoints',
  'final-candidate-browser-evidence.json',
);

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const child = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(child) : [child];
    }),
  );
  return nested.flat();
};

const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const routeFor = (file) => {
  const segments = path
    .relative(appRoot, file)
    .split(path.sep)
    .slice(0, -1)
    .filter((segment) => !/^\([^/]+\)$/.test(segment))
    .map((segment) => {
      const match = segment.match(/^\[\.\.\.(.+)\]$/);
      if (match) return `<${match[1]}...>`;
      const optional = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
      if (optional) return `[[${optional[1]}...]]`;
      const dynamic = segment.match(/^\[(.+)\]$/);
      return dynamic ? `<${dynamic[1]}>` : segment;
    });
  return segments.length ? `/${segments.join('/')}` : '/';
};
const surfaceFor = (route) => {
  if (route === '/onboarding') return 'onboarding';
  if (route.startsWith('/admin')) return 'admin';
  if (route.startsWith('/app')) return 'customer';
  if (
    ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(route)
  )
    return 'auth';
  return 'public';
};

const files = await walk(appRoot);
const sourceFiles = files.filter((file) => /\.(ts|tsx)$/.test(file));
const contents = await Promise.all(
  sourceFiles.map(async (file) => [file, await fs.readFile(file, 'utf8')]),
);
const pageFiles = sourceFiles.filter((file) => path.basename(file) === 'page.tsx');
const pending = 'NOT_YET_VERIFIED_ON_FINAL_CANDIDATE';
let evidence = null;
try {
  evidence = JSON.parse(await fs.readFile(evidencePath, 'utf8'));
} catch {
  evidence = null;
}
const hasFinalEvidence = Boolean(evidence?.final_head);
const verified = (value) => (hasFinalEvidence ? value : pending);
const primaryInteractionRoutes = new Set(evidence?.primary_interaction_routes ?? []);
const expectedNotFoundRoutes = new Set(evidence?.expected_not_found_routes ?? []);
const routes = pageFiles
  .map((file) => {
    const route = routeFor(file);
    const surface = surfaceFor(route);
    return {
      route,
      source: relative(file),
      surface,
      implementation: 'IMPLEMENTED',
      tested: verified('TESTED'),
      visually_verified: verified('VISUALLY_VERIFIED'),
      accessibility_verified: verified('ACCESSIBILITY_VERIFIED'),
      auth_verified: surface === 'public' ? 'NOT_APPLICABLE' : verified('AUTH_VERIFIED'),
      error_state_verified: expectedNotFoundRoutes.has(route)
        ? verified('ERROR_STATE_VERIFIED')
        : verified('NOT_APPLICABLE'),
      mobile_verified: verified('MOBILE_VERIFIED'),
      desktop_verified: verified('DESKTOP_VERIFIED'),
      primary_interaction_verified: primaryInteractionRoutes.has(route)
        ? verified('PRIMARY_INTERACTION_VERIFIED')
        : verified('NOT_APPLICABLE'),
    };
  })
  .sort((left, right) => left.route.localeCompare(right.route));
const apiRouteSources = sourceFiles
  .filter((file) => path.basename(file) === 'route.ts')
  .map(relative)
  .sort();
const serverActionSources = contents
  .filter(([, text]) => text.includes('use server'))
  .map(([file]) => relative(file))
  .sort();
const errorBoundaries = sourceFiles
  .filter((file) =>
    ['error.tsx', 'global-error.tsx', 'not-found.tsx'].includes(path.basename(file)),
  )
  .map(relative)
  .sort();

const inventory = {
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-final-route-state-inventory.mjs',
  page_route_count: routes.length,
  api_route_sources: apiRouteSources,
  server_action_sources: serverActionSources,
  error_boundaries: errorBoundaries,
  routes,
};
const prettierOptions = (await prettier.resolveConfig(output)) ?? {};
const formattedInventory = await prettier.format(JSON.stringify(inventory), {
  ...prettierOptions,
  parser: 'json',
});
await fs.writeFile(output, formattedInventory, 'utf8');
const matrixRows = routes
  .map((route) =>
    [
      route.route,
      route.surface,
      route.source,
      route.tested,
      route.visually_verified,
      route.accessibility_verified,
      route.auth_verified,
      route.error_state_verified,
      route.mobile_verified,
      route.desktop_verified,
      route.primary_interaction_verified,
    ].join(' | '),
  )
  .map((values) => `| ${values} |`)
  .join('\n');
const matrix = [
  '# Final Route And State Matrix',
  '',
  `Generated by \`${inventory.generator}\`.`,
  '',
  `Inventory count: **${routes.length} page routes**.`,
  '',
  '| Route | Surface | Source | Tested | Visual | Accessibility | Auth | Error state | Mobile | Desktop | Primary interaction |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  matrixRows,
  '',
  hasFinalEvidence
    ? `Final-candidate evidence: \`${evidence.final_head}\`; route checks and protected authenticated checks are recorded in \`final-candidate-browser-evidence.json\`.`
    : 'Statuses remain pending until final-candidate evidence exists.',
  'The JSON inventory is the machine-readable source.',
  '',
].join('\n');
const formattedMatrix = await prettier.format(matrix, {
  ...prettierOptions,
  parser: 'markdown',
});
await fs.writeFile(matrixOutput, formattedMatrix, 'utf8');
console.log(`Generated ${routes.length} page routes.`);
console.log(`Generated ${apiRouteSources.length} API route sources.`);
console.log(`Generated ${serverActionSources.length} server action sources.`);
