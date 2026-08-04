-- pgTAP Test 005: Ingestion Pipeline Table RLS
BEGIN;
SELECT plan(4);

SELECT table_privs_are('public', 'candidate_documents', 'service_role', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'service_role has full access to candidate_documents');
SELECT table_privs_are('public', 'ai_runs', 'service_role', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'service_role has full access to ai_runs');
SELECT table_privs_are('public', 'crawl_runs', 'service_role', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'service_role has full access to crawl_runs');
SELECT table_privs_are('public', 'content_clusters', 'service_role', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'service_role has full access to content_clusters');

SELECT * FROM finish();
ROLLBACK;
