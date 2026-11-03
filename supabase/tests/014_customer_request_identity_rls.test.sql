-- Runtime RLS acceptance: disposable Supabase database only.
-- Never run this test on hosted staging/production.
-- Auth identities and support requests are synthetic and rolled back by pgTAP.
BEGIN;
SELECT plan(28);

-- Fixed, non-real IDs make test scoping deterministic. Inserting auth.users
-- fires the normal signup trigger that creates corresponding profiles.
INSERT INTO auth.users (id, email) VALUES
  ('bbbbbbbb-0000-4000-8000-000000000001', 'rls-owner-a@example.invalid'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'rls-owner-b@example.invalid'),
  ('bbbbbbbb-0000-4000-8000-000000000003', 'rls-admin@example.invalid'),
  ('bbbbbbbb-0000-4000-8000-000000000004', 'rls-researcher@example.invalid'),
  ('bbbbbbbb-0000-4000-8000-000000000005', 'rls-editor@example.invalid'),
  ('bbbbbbbb-0000-4000-8000-000000000006', 'rls-legal@example.invalid');

UPDATE public.profiles SET role = 'admin'
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000003';
UPDATE public.profiles SET role = 'researcher'
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000004';
UPDATE public.profiles SET role = 'editor'
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000005';
UPDATE public.profiles SET role = 'legal_reviewer'
 WHERE id = 'bbbbbbbb-0000-4000-8000-000000000006';

INSERT INTO public.user_correction_requests (id, user_id, target, description)
VALUES
 ('cccccccc-0000-4000-8000-000000000001',
  'bbbbbbbb-0000-4000-8000-000000000001','account','Owner A correction'),
 ('cccccccc-0000-4000-8000-000000000002',
  'bbbbbbbb-0000-4000-8000-000000000002','account','Owner B correction');

INSERT INTO public.grievance_contacts
 (id, user_id, subject, message, contact_email)
VALUES
 ('dddddddd-0000-4000-8000-000000000001',
  'bbbbbbbb-0000-4000-8000-000000000001',
  'Owner A complaint','Test message','rls-owner-a@example.invalid'),
 ('dddddddd-0000-4000-8000-000000000002',
  'bbbbbbbb-0000-4000-8000-000000000002',
  'Owner B complaint','Test message','rls-owner-b@example.invalid');

-- Customer A: see and submit own tickets, never mutate somebody else's.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
SELECT is((SELECT count(*)::int FROM public.user_correction_requests
 WHERE id IN ('cccccccc-0000-4000-8000-000000000001',
              'cccccccc-0000-4000-8000-000000000002')),
 1, 'owner A sees only own correction');
SELECT is((SELECT count(*)::int FROM public.grievance_contacts
 WHERE id IN ('dddddddd-0000-4000-8000-000000000001',
              'dddddddd-0000-4000-8000-000000000002')),
 1, 'owner A sees only own grievance');
SELECT is_empty($$SELECT id FROM public.user_correction_requests
 WHERE id = 'cccccccc-0000-4000-8000-000000000002'$$,
 'owner A cannot select owner B correction');
SELECT is_empty($$SELECT id FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000002'$$,
 'owner A cannot select owner B grievance');
SELECT lives_ok($$INSERT INTO public.user_correction_requests
 (user_id,target,description)
 VALUES ('bbbbbbbb-0000-4000-8000-000000000001','account','own insert')$$,
 'owner A can submit own correction');
SELECT lives_ok($$INSERT INTO public.grievance_contacts
 (user_id,subject,message,contact_email)
 VALUES ('bbbbbbbb-0000-4000-8000-000000000001',
         'own grievance','message','rls-owner-a@example.invalid')$$,
 'owner A can submit own grievance');
SELECT is_empty($$UPDATE public.user_correction_requests
 SET description = 'illegal cross-user update'
 WHERE id = 'cccccccc-0000-4000-8000-000000000002'
 RETURNING id$$, 'owner A cannot update owner B correction');
SELECT is_empty($$DELETE FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000002'
 RETURNING id$$, 'owner A cannot delete owner B grievance');
SELECT throws_ok($$INSERT INTO public.user_correction_requests
 (user_id,target,description)
 VALUES ('bbbbbbbb-0000-4000-8000-000000000002','account','spoofed owner')$$,
 '42501', NULL, 'customer cannot submit correction on behalf of another');
SELECT throws_ok($$INSERT INTO public.grievance_contacts
 (user_id,subject,message,contact_email)
 VALUES ('bbbbbbbb-0000-4000-8000-000000000002',
         'spoofed grievance','message','rls-owner-a@example.invalid')$$,
 '42501', NULL, 'customer cannot submit grievance on behalf of another');
RESET ROLE;

-- Customer B must independently retain access to the two seed rows.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
SELECT is((SELECT count(*)::int FROM public.user_correction_requests
 WHERE id = 'cccccccc-0000-4000-8000-000000000002'), 1,
 'owner B can read own correction');
SELECT is((SELECT count(*)::int FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000002'), 1,
 'owner B can read own grievance');
RESET ROLE;

-- Researcher: no global customer support access through direct SQL/Data API.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000004';
SELECT is_empty($$SELECT id FROM public.user_correction_requests
 WHERE id = 'cccccccc-0000-4000-8000-000000000001'$$,
 'researcher cannot read customer correction');
SELECT is_empty($$SELECT id FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000001'$$,
 'researcher cannot read customer grievance');
SELECT is_empty($$UPDATE public.user_correction_requests
 SET description = 'illegal researcher update'
 WHERE id = 'cccccccc-0000-4000-8000-000000000001' RETURNING id$$,
 'researcher cannot update customer correction');
SELECT is_empty($$DELETE FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000001' RETURNING id$$,
 'researcher cannot delete customer grievance');
RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000005';
SELECT is_empty($$SELECT id FROM public.user_correction_requests
 WHERE id = 'cccccccc-0000-4000-8000-000000000001'$$,
 'editor cannot read customer correction');
SELECT is_empty($$SELECT id FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000001'$$,
 'editor cannot read customer grievance');
RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000006';
SELECT is_empty($$SELECT id FROM public.user_correction_requests
 WHERE id = 'cccccccc-0000-4000-8000-000000000001'$$,
 'legal reviewer cannot read customer correction');
SELECT is_empty($$SELECT id FROM public.grievance_contacts
 WHERE id = 'dddddddd-0000-4000-8000-000000000001'$$,
 'legal reviewer cannot read customer grievance');
RESET ROLE;

-- Admin triage must remain functional. Changes are rolled back after test.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
SELECT is((SELECT count(*)::int FROM public.user_correction_requests
 WHERE id IN ('cccccccc-0000-4000-8000-000000000001',
              'cccccccc-0000-4000-8000-000000000002')), 2,
 'admin reads both customers corrections');
SELECT is((SELECT count(*)::int FROM public.grievance_contacts
 WHERE id IN ('dddddddd-0000-4000-8000-000000000001',
              'dddddddd-0000-4000-8000-000000000002')), 2,
 'admin reads both customers grievances');
SELECT results_eq($$UPDATE public.user_correction_requests
 SET status='in_review' WHERE id='cccccccc-0000-4000-8000-000000000001'
 RETURNING id$$,
 ARRAY['cccccccc-0000-4000-8000-000000000001'::uuid],
 'admin updates customer correction');
SELECT results_eq($$UPDATE public.grievance_contacts
 SET status='acknowledged' WHERE id='dddddddd-0000-4000-8000-000000000001'
 RETURNING id$$,
 ARRAY['dddddddd-0000-4000-8000-000000000001'::uuid],
 'admin updates customer grievance');
SELECT results_eq($$DELETE FROM public.user_correction_requests
 WHERE id='cccccccc-0000-4000-8000-000000000002' RETURNING id$$,
 ARRAY['cccccccc-0000-4000-8000-000000000002'::uuid],
 'admin deletes customer correction');
SELECT results_eq($$DELETE FROM public.grievance_contacts
 WHERE id='dddddddd-0000-4000-8000-000000000002' RETURNING id$$,
 ARRAY['dddddddd-0000-4000-8000-000000000002'::uuid],
 'admin deletes customer grievance');
RESET ROLE;

SET LOCAL ROLE anon;
SET LOCAL request.jwt.claim.sub = '';
SELECT is_empty($$SELECT id FROM public.user_correction_requests
 WHERE id='cccccccc-0000-4000-8000-000000000001'$$,
 'anonymous user cannot read customer correction');
SELECT is_empty($$SELECT id FROM public.grievance_contacts
 WHERE id='dddddddd-0000-4000-8000-000000000001'$$,
 'anonymous user cannot read customer grievance');
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
