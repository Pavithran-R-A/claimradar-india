import { describe, expect, it } from 'vitest';
import { domainAllowlistValidator } from '../../src/validation/validators.js';
import { LEGAL_SAFETY } from '@claimradar/shared-types';

describe('official source domain allowlist', () => {
  it('accepts official IBBI and TRAI domains', () => {
    expect(domainAllowlistValidator('ibbi.gov.in').passed).toBe(true);
    expect(domainAllowlistValidator('trai.gov.in').passed).toBe(true);
    expect(LEGAL_SAFETY.OFFICIAL_DOMAINS).toEqual(
      expect.arrayContaining(['ibbi.gov.in', 'trai.gov.in']),
    );
  });
});
