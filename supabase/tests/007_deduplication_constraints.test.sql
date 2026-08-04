-- pgTAP Test 007: Content Cluster & Deduplication Constraints
BEGIN;
SELECT plan(3);

SELECT col_is_unique('public', 'content_clusters', 'canonical_hash', 'canonical_hash is unique on content_clusters');
SELECT fk_ok('public', 'content_cluster_members', 'cluster_id', 'public', 'content_clusters', 'id', 'cluster_id FK ok');
SELECT fk_ok('public', 'content_cluster_members', 'source_document_id', 'public', 'source_documents', 'id', 'source_document_id FK ok');

SELECT * FROM finish();
ROLLBACK;
