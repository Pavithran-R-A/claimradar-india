-- pgTAP Test 001: Schema Integrity & Core Tables
BEGIN;
SELECT plan(12);

SELECT has_table('public', 'companies', 'companies table exists');
SELECT has_table('public', 'sectors', 'sectors table exists');
SELECT has_table('public', 'sources', 'sources table exists');
SELECT has_table('public', 'source_documents', 'source_documents table exists');
SELECT has_table('public', 'claimables', 'claimables table exists');
SELECT has_table('public', 'candidate_documents', 'candidate_documents table exists');
SELECT has_table('public', 'ai_runs', 'ai_runs table exists');
SELECT has_table('public', 'content_clusters', 'content_clusters table exists');
SELECT has_table('public', 'content_cluster_members', 'content_cluster_members table exists');

SELECT col_is_pk('public', 'claimables', 'id', 'claimables primary key is id');
SELECT col_is_pk('public', 'sources', 'id', 'sources primary key is id');
SELECT col_is_pk('public', 'content_clusters', 'id', 'content_clusters primary key is id');

SELECT * FROM finish();
ROLLBACK;
