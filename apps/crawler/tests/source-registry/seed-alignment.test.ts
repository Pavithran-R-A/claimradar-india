import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const seedSql = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../../supabase/seed.sql'),
  'utf8',
);

describe('seed source registry alignment', () => {
  it('seeds only supported official adapter names and real authority domains', () => {
    expect(seedSql).not.toContain('pib_rss_demo');
    expect(seedSql).not.toContain('sebi_rss_demo');
    expect(seedSql).not.toContain('demo.pib.example.com');
    expect(seedSql).not.toContain('demo.sebi.example.com');
    expect(seedSql).toContain("'rss-pib'");
    expect(seedSql).toContain("'rss-sebi'");
    expect(seedSql).toContain("'ibbi-public-announcement'");
    expect(seedSql).toContain('"registryId":"trai-press-releases"');
  });
});
