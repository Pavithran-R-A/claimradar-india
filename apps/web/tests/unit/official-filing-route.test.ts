import { describe, expect, it } from 'vitest';
import { isKnownNonFilingInformationUrl } from '../../lib/official-filing-route';

describe('public-safe claim filing destinations', () => {
  it('blocks both versions of the IBBI generic downloads directory', () => {
    expect(isKnownNonFilingInformationUrl('https://www.ibbi.gov.in/home/downloads')).toBe(true);
    expect(isKnownNonFilingInformationUrl('https://ibbi.gov.in/home/downloads/')).toBe(true);
    expect(
      isKnownNonFilingInformationUrl('https://www.ibbi.gov.in/home/downloads?ref=claim'),
    ).toBe(true);
  });

  it('does not treat every official IBBI reference document as the generic downloads page', () => {
    expect(
      isKnownNonFilingInformationUrl(
        'https://ibbi.gov.in/uploads/announcement/2026-10-09-official.pdf',
      ),
    ).toBe(false);
    expect(
      isKnownNonFilingInformationUrl('https://www.ibbi.gov.in/home/downloads/claim-specific'),
    ).toBe(false);
  });

  it('handles missing and malformed URLs without inventing an official filing link', () => {
    expect(isKnownNonFilingInformationUrl(null)).toBe(false);
    expect(isKnownNonFilingInformationUrl('not-a-url')).toBe(false);
    expect(isKnownNonFilingInformationUrl('https://consumerhelpline.gov.in/')).toBe(false);
  });
});
