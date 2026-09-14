import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { brandConfig } from '@claimradar/config';
import {
  buildBreadcrumbListJsonLd,
  buildCollectionPageJsonLd,
  buildDefinedTermJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
} from '@claimradar/seo';
import { safeJsonLdStringify } from '../components/seo/json-ld';

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('ClaimKhoj structured data', () => {
  it('escapes less-than signs so JSON-LD cannot terminate its script element', () => {
    const serialized = safeJsonLdStringify({ name: '</script><script>alert(1)</script>' });
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script>');
    expect(JSON.parse(serialized)).toEqual({ name: '</script><script>alert(1)</script>' });
  });

  it('builds site identity on the configured ClaimKhoj origin', () => {
    expect(buildOrganizationJsonLd({ name: brandConfig.siteName, url: brandConfig.url })).toMatchObject({
      '@type': 'Organization',
      name: 'ClaimKhoj',
      url: brandConfig.url,
    });
    expect(buildWebSiteJsonLd({ name: brandConfig.siteName, url: brandConfig.url })).toMatchObject({
      '@type': 'WebSite',
      name: 'ClaimKhoj',
      url: brandConfig.url,
    });
  });

  it('provides truthful page, breadcrumb, collection, item-list, and glossary schemas', () => {
    expect(buildWebPageJsonLd({ name: 'Example', url: `${brandConfig.url}/example` })['@type']).toBe('WebPage');
    expect(buildBreadcrumbListJsonLd([{ name: 'Home', url: brandConfig.url }])['@type']).toBe('BreadcrumbList');
    expect(buildCollectionPageJsonLd({ name: 'Claims', url: `${brandConfig.url}/claimables` })['@type']).toBe('CollectionPage');
    expect(buildItemListJsonLd({ name: 'Claims', url: `${brandConfig.url}/claimables`, items: [{ name: 'One', url: `${brandConfig.url}/claimables/one` }] })['@type']).toBe('ItemList');
    expect(buildDefinedTermJsonLd({ name: 'Claimable', description: 'A published opportunity.', url: `${brandConfig.url}/glossary/claimable` })['@type']).toBe('DefinedTerm');
  });

  it('renders site-level and route-level JSON-LD from server components', () => {
    const layout = read('../app/layout.tsx');
    const detail = read('../app/(public)/claimables/[slug]/page.tsx');
    expect(layout).toContain('<JsonLd');
    expect(layout).toContain('buildOrganizationJsonLd');
    expect(layout).toContain('buildWebSiteJsonLd');
    expect(detail).toContain('buildBreadcrumbListJsonLd');
    expect(detail).toContain('buildWebPageJsonLd');
  });
});
