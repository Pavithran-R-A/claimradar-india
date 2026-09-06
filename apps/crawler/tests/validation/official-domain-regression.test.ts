import { describe, expect, it } from 'vitest';
import { domainAllowlistValidator } from '../../src/validation/validators.js';

describe('official domain allowlist', () => {
  it.each(['ibbi.gov.in', 'www.ibbi.gov.in', 'trai.gov.in', 'www.trai.gov.in'])(
    'accepts official domain %s',
    (domain) => {
      expect(domainAllowlistValidator(domain).passed).toBe(true);
    },
  );

  it.each(['ibbi.gov.in.example.com', 'trai.gov.in.example.com'])(
    'rejects lookalike domain %s',
    (domain) => {
      expect(domainAllowlistValidator(domain).passed).toBe(false);
    },
  );
});
