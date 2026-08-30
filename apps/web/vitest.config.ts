import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for apps/web.
 *
 * Includes every unit test under `tests/`, which covers both the repository
 * unit tests at `tests/*.test.ts` (publication filter, mapping integrity,
 * honest-error behaviour and demo gating — these inject a fake DB client and
 * do NOT require a live database) and the tests under `tests/unit/`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@claimradar/source-registry': path.resolve(
        __dirname,
        '../../packages/source-registry/src/index.ts',
      ),
      '@claimradar/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      '@claimradar/design-system': path.resolve(
        __dirname,
        '../../packages/design-system/src/index.tsx',
      ),
      '@claimradar/shared-types': path.resolve(
        __dirname,
        '../../packages/shared-types/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
