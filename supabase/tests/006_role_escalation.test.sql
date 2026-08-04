-- pgTAP Test 006: Role Escalation Prevention Trigger
BEGIN;
SELECT plan(2);

SELECT has_trigger('public', 'profiles', 'trg_prevent_role_escalation', 'trg_prevent_role_escalation exists on profiles');
SELECT has_function('public', 'prevent_role_escalation', 'prevent_role_escalation function exists');

SELECT * FROM finish();
ROLLBACK;
