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

  it('does not advertise unavailable subscriptions or automated alerts', () => {
    const faq = read('../app/(public)/faq/page.tsx');
    const about = read('../app/(public)/about/page.tsx');
    const policy = read('../app/(public)/subscription-policy/page.tsx');
    const refunds = read('../app/(public)/refund-policy/page.tsx');
    for (const page of [faq, about, policy, refunds]) {
      expect(page).not.toMatch(/₹149|₹999|Plus subscribers|automatically renew/i);
    }
    expect(faq).toContain('Plus is not currently available');
    expect(faq).toContain('direct submission channel is not currently configured');
    expect(faq).toContain('automated outbound email alerts are not currently offered');
    expect(about).toContain('Paid subscriptions, checkout');
    expect(policy).toContain('No paid subscriptions');
    expect(refunds).toContain('not offering or');
  });

  it('does not invent a support inbox when none is configured', () => {
    const contact = read('../app/(public)/contact/page.tsx');
    expect(contact).toContain('Direct email support is not currently offered');
    expect(contact).toContain('official authority');
  });
});
