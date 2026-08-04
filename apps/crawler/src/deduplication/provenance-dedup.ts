/**
 * Provenance-Safe Deduplication Runtime Module
 * Preserves raw source document rows for every distinct official URL while grouping matching hashes/topics into content clusters.
 */

export interface SourceDocumentInput {
  documentId: string;
  sourceId: string;
  url: string;
  canonicalUrl: string;
  contentHash: string;
  title: string;
  companyName?: string;
  matterId?: string;
  deadlineDate?: string;
}

export interface ContentCluster {
  clusterId: string;
  canonicalUrl: string;
  primaryHash: string;
  memberDocumentIds: string[];
  sourceIds: string[];
  crossSourceMatch: boolean;
}

export interface ClusteringState {
  clusters: Map<string, ContentCluster>; // clusterId -> ContentCluster
  docToClusterMap: Map<string, string>; // documentId -> clusterId
}

/**
 * Creates a new clustering state instance.
 */
export function createClusteringState(): ClusteringState {
  return {
    clusters: new Map(),
    docToClusterMap: new Map(),
  };
}

/**
 * Normalizes canonical URLs to prevent minor query param variants from splitting provenance.
 */
export function normalizeCanonicalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    // Strip tracking parameters while retaining path and essential query parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'].forEach((p) =>
      parsed.searchParams.delete(p),
    );
    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Processes a source document into the cluster state cleanly according to provenance-safe rules.
 */
export function assignToCluster(
  state: ClusteringState,
  doc: SourceDocumentInput,
): { clusterId: string; isNewCluster: boolean; isCrossSource: boolean } {
  const normUrl = normalizeCanonicalUrl(doc.canonicalUrl || doc.url);

  // Rule 1: Distinct official URLs remain distinct source documents (handled by caller keeping doc row)

  // Find existing cluster by canonical URL or exact content hash
  let targetCluster: ContentCluster | undefined;

  for (const cluster of state.clusters.values()) {
    // Rule 2: Identical hashes or canonical URLs share a cluster
    if (cluster.primaryHash === doc.contentHash || cluster.canonicalUrl === normUrl) {
      targetCluster = cluster;
      break;
    }
  }

  // Rule 4 & 5: Similar titles or same company alone do NOT merge unless hash/matter/url match
  if (targetCluster) {
    if (!targetCluster.memberDocumentIds.includes(doc.documentId)) {
      targetCluster.memberDocumentIds.push(doc.documentId);
    }
    if (!targetCluster.sourceIds.includes(doc.sourceId)) {
      targetCluster.sourceIds.push(doc.sourceId);
      // Rule 3: Cross-source match flag set when distinct source IDs contribute
      targetCluster.crossSourceMatch = true;
    }
    state.docToClusterMap.set(doc.documentId, targetCluster.clusterId);
    return {
      clusterId: targetCluster.clusterId,
      isNewCluster: false,
      isCrossSource: targetCluster.crossSourceMatch,
    };
  }

  // Create new cluster
  const clusterId = `cluster-${state.clusters.size + 1}-${doc.contentHash.slice(0, 8)}`;
  const newCluster: ContentCluster = {
    clusterId,
    canonicalUrl: normUrl,
    primaryHash: doc.contentHash,
    memberDocumentIds: [doc.documentId],
    sourceIds: [doc.sourceId],
    crossSourceMatch: false,
  };

  state.clusters.set(clusterId, newCluster);
  state.docToClusterMap.set(doc.documentId, clusterId);

  return {
    clusterId,
    isNewCluster: true,
    isCrossSource: false,
  };
}

/**
 * Rule 10: Reversibly splits a document out of a cluster without deleting the raw source document.
 */
export function splitCluster(
  state: ClusteringState,
  documentId: string,
): { oldClusterId?: string | undefined; newClusterId: string } {
  const oldClusterId = state.docToClusterMap.get(documentId);
  if (oldClusterId) {
    const oldCluster = state.clusters.get(oldClusterId);
    if (oldCluster) {
      oldCluster.memberDocumentIds = oldCluster.memberDocumentIds.filter((id) => id !== documentId);
    }
  }

  const newClusterId = `cluster-split-${Date.now()}-${documentId}`;
  state.clusters.set(newClusterId, {
    clusterId: newClusterId,
    canonicalUrl: `split://${documentId}`,
    primaryHash: `split-hash-${documentId}`,
    memberDocumentIds: [documentId],
    sourceIds: [],
    crossSourceMatch: false,
  });
  state.docToClusterMap.set(documentId, newClusterId);

  return { oldClusterId, newClusterId };
}
