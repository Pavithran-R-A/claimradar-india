-- pgTAP Test 008: Source Freshness Columns & Metrics
BEGIN;
SELECT plan(5);

SELECT has_column('public', 'sources', 'health_state', 'sources has health_state column');
SELECT has_column('public', 'sources', 'last_content_change_at', 'sources has last_content_change_at column');
SELECT has_column('public', 'sources', 'last_error_category', 'sources has last_error_category column');
SELECT has_column('public', 'claimables', 'deadline_verified_at', 'claimables has deadline_verified_at column');
SELECT has_column('public', 'claimables', 'review_age_days', 'claimables has review_age_days column');

SELECT * FROM finish();
ROLLBACK;
