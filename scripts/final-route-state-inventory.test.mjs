import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'docs', 'checkpoints', 'final-route-state-inventory.json');
const matrixPath = path.join(root, 'docs', 'checkpoints', 'final-route-state-matrix.md');

test('final route inventory is valid and complete', () => {
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  assert.equal(inventory.page_route_count, 69);
  assert.equal(inventory.routes.length, inventory.page_route_count);
  assert.equal(new Set(inventory.routes.map(({ route }) => route)).size, inventory.routes.length);
  assert.equal(inventory.api_route_sources.length, 1);
  assert.equal(inventory.server_action_sources.length, 7);
  assert.ok(inventory.error_boundaries.includes('apps/web/app/not-found.tsx'));
  assert.ok(inventory.error_boundaries.includes('apps/web/app/global-error.tsx'));
  assert.equal(inventory.routes[0].route, '/');
  assert.equal(inventory.routes.at(-1).route, '/verify-email');
  assert.equal(
    fs
      .readFileSync(matrixPath, 'utf8')
      .split('\n')
      .filter((line) => line.startsWith('| /')).length,
    69,
  );
});
