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
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
