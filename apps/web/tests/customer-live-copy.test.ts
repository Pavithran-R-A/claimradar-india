import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('ClaimKhoj customer-live copy', () => {
  it('contains no pre-launch language on the public contact surface', () => {
    const contact = read('../app/(public)/contact/page.tsx');
    expect(contact).not.toMatch(/before public launch/i);
    expect(contact).not.toMatch(/prior to unrestricted public release/i);
    expect(contact).not.toMatch(/pre-launch/i);
  });

  it('does not invent a support inbox when none is configured', () => {
    const contact = read('../app/(public)/contact/page.tsx');
    expect(contact).toContain('Direct email support is not currently offered');
    expect(contact).toContain('official authority');
  });
});
