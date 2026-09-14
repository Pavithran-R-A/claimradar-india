import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../app/admin/editorial-actions.ts'),
  'utf8',
);

describe('editorial IndexNow publication hook', () => {
  it('submits the public claim URL after explicit publication approval', () => {
    expect(source).toContain("import { brandConfig } from '@claimradar/config'");
    expect(source).toContain("import { submitIndexNowUrls } from '@/lib/indexnow'");
    expect(source).toContain(".select('id, slug, status, publication_status, first_published_at')");
    expect(source).toContain('await submitIndexNowUrls([`${brandConfig.url}/claimables/${claimable.slug}`])');
  });

  it('notifies discovery systems when an already-public claim is archived', () => {
    expect(source).toContain(".select('id, slug, status, publication_status')");
    expect(source.match(/await submitIndexNowUrls\(\[`${brandConfig\.url}\/claimables\/\$\{claimable\.slug\}`\]\)/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('revalidates the public directory and claim dossier when publication state changes', () => {
    expect(source.match(/revalidatePath\('\/claimables'\)/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source.match(/revalidatePath\(`\/claimables\/\$\{claimable\.slug\}`\)/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
