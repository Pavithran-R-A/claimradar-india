import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const webRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webRoot, '../..');
const emails = ['recovery', 'confirmation', 'magic-link', 'invite', 'email-change'];

describe('ClaimKhoj branded authentication emails', () => {
  it('has a small PNG version of the actual logo for Gmail and other email clients', () => {
    const png = fs.readFileSync(path.join(webRoot, 'public/email/claimkhoj-mark.png'));
    expect(Array.from(png.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(png.byteLength).toBeLessThan(12_000);
  });

  for (const name of emails) {
    it(`${name} uses first-party brand assets and preserves Supabase action links`, () => {
      const template = fs.readFileSync(
        path.join(repoRoot, `supabase/email-templates/${name}.html`),
        'utf8',
      );

      expect(template).toContain('https://claimkhoj.app/email/claimkhoj-mark.png');
      expect(template).toContain('ClaimKhoj');
      expect(template).toContain('width="100%"');
      expect(template).toContain('role="presentation"');
      expect(template).toContain('href="{{ .ConfirmationURL }}"');
      expect(template).toContain('{{ .ConfirmationURL }}');
      expect(template).toContain('ClaimKhoj never asks');
      expect(template).not.toContain('claimradar-staging.vercel.app');
      expect(template).not.toContain('http://');
      expect(template).not.toContain('<script');
      expect(template).not.toContain('data:image');
    });
  }
});
