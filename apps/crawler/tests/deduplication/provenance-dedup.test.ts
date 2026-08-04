import { describe, it, expect, beforeEach } from 'vitest';
import {
  createClusteringState,
  assignToCluster,
  normalizeCanonicalUrl,
  splitCluster,
  type ClusteringState,
} from '../../src/deduplication/provenance-dedup.js';

describe('Provenance-Safe Deduplication Runtime Module', () => {
  let state: ClusteringState;

  beforeEach(() => {
    state = createClusteringState();
  });

  it('Rule 1: Distinct official URLs remain distinct source documents', () => {
    const doc1 = {
      documentId: 'doc-1',
      sourceId: 'sebi-rss',
      url: 'https://sebi.gov.in/orders/101.pdf',
      canonicalUrl: 'https://sebi.gov.in/orders/101.pdf',
      contentHash: 'hash-abc-111',
      title: 'SEBI Order Company A',
    };
    const doc2 = {
      documentId: 'doc-2',
      sourceId: 'sebi-rss',
      url: 'https://sebi.gov.in/orders/102.pdf',
      canonicalUrl: 'https://sebi.gov.in/orders/102.pdf',
      contentHash: 'hash-xyz-222',
      title: 'SEBI Order Company B',
    };

    const res1 = assignToCluster(state, doc1);
    const res2 = assignToCluster(state, doc2);

    expect(res1.clusterId).not.toBe(res2.clusterId);
    expect(state.clusters.size).toBe(2);
  });

  it('Rule 2 & 3: Identical hashes across different sources share cluster with crossSourceMatch=true', () => {
    const docRegulator = {
      documentId: 'doc-sebi-1',
      sourceId: 'sebi-rss',
      url: 'https://sebi.gov.in/press/2026/01.pdf',
      canonicalUrl: 'https://sebi.gov.in/press/2026/01.pdf',
      contentHash: 'shared-hash-999',
      title: 'Disgorgement Notice - Firm X',
    };
    const docMirror = {
      documentId: 'doc-pib-1',
      sourceId: 'pib-rss',
      url: 'https://pib.gov.in/release/12345.html',
      canonicalUrl: 'https://pib.gov.in/release/12345.html',
      contentHash: 'shared-hash-999',
      title: 'PIB Mirror of SEBI Disgorgement Notice',
    };

    assignToCluster(state, docRegulator);
    const resMirror = assignToCluster(state, docMirror);

    expect(resMirror.isNewCluster).toBe(false);
    expect(resMirror.isCrossSource).toBe(true);
  });

  it('Rules 4 & 5: Similar titles and same company alone do not merge without matching hash or canonical URL', () => {
    const docCompanyCase1 = {
      documentId: 'doc-comp-1',
      sourceId: 'rbi-rss',
      url: 'https://rbi.org.in/press/case1.pdf',
      canonicalUrl: 'https://rbi.org.in/press/case1.pdf',
      contentHash: 'hash-matter-1',
      title: 'Penalty on XYZ Bank - FY24 Inspection',
      companyName: 'XYZ Bank',
    };
    const docCompanyCase2 = {
      documentId: 'doc-comp-2',
      sourceId: 'rbi-rss',
      url: 'https://rbi.org.in/press/case2.pdf',
      canonicalUrl: 'https://rbi.org.in/press/case2.pdf',
      contentHash: 'hash-matter-2',
      title: 'Penalty on XYZ Bank - KYC Violation',
      companyName: 'XYZ Bank',
    };

    const res1 = assignToCluster(state, docCompanyCase1);
    const res2 = assignToCluster(state, docCompanyCase2);

    expect(res1.clusterId).not.toBe(res2.clusterId);
  });

  it('Rule 8 & 9: Canonical URL normalization strips tracking params while retaining provenance', () => {
    const rawUrl1 = 'https://sebi.gov.in/notice.html?utm_source=rss&ref=123';
    const rawUrl2 = 'https://sebi.gov.in/notice.html';

    expect(normalizeCanonicalUrl(rawUrl1)).toBe(normalizeCanonicalUrl(rawUrl2));
  });

  it('Rule 10: Grouping can be undone without deleting raw source document', () => {
    const doc1 = {
      documentId: 'doc-merge-1',
      sourceId: 'sebi-rss',
      url: 'https://sebi.gov.in/order1.pdf',
      canonicalUrl: 'https://sebi.gov.in/order1.pdf',
      contentHash: 'hash-shared-777',
      title: 'SEBI Order 1',
    };
    const doc2 = {
      documentId: 'doc-merge-2',
      sourceId: 'pib-rss',
      url: 'https://pib.gov.in/release1.html',
      canonicalUrl: 'https://pib.gov.in/release1.html',
      contentHash: 'hash-shared-777',
      title: 'PIB Order 1',
    };

    assignToCluster(state, doc1);
    assignToCluster(state, doc2);

    const splitResult = splitCluster(state, 'doc-merge-2');
    expect(splitResult.newClusterId).toBeDefined();
    expect(state.docToClusterMap.get('doc-merge-2')).toBe(splitResult.newClusterId);
  });

  it('Rule 11: Immediate reprocessing of identical document is idempotent', () => {
    const doc = {
      documentId: 'doc-reprocess-1',
      sourceId: 'rbi-rss',
      url: 'https://rbi.org.in/press/10.pdf',
      canonicalUrl: 'https://rbi.org.in/press/10.pdf',
      contentHash: 'hash-idempotent-555',
      title: 'RBI Press Release 10',
    };

    const res1 = assignToCluster(state, doc);
    const res2 = assignToCluster(state, doc);

    expect(res1.clusterId).toBe(res2.clusterId);
    expect(res2.isNewCluster).toBe(false);
  });
});
