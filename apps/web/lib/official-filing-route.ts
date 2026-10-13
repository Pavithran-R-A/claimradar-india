/**
 * Certain official information pages are not valid application destinations.
 * Being hosted on a regulator domain alone does not prove filing capability.
 *
 * Intentionally narrow: only proven misleading URLs are prohibited. Many
 * legitimate paper-based filings do not have an online submission endpoint.
 */
export function isKnownNonFilingInformationUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase().replace(/\/+$/, '');
    return (
      (host === 'ibbi.gov.in' || host === 'www.ibbi.gov.in') &&
      path === '/home/downloads'
    );
  } catch {
    return false;
  }
}
