-- Migration: Notification delivery log hardening and FK indexes
-- The delivery ledger remains server-only. The explicit service-role policy
-- documents that boundary and removes the advisor's no-policy information lint.

ALTER TABLE public.notification_delivery_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.notification_delivery_log FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.notification_delivery_log TO service_role;

DROP POLICY IF EXISTS notification_delivery_log_service_role_access
  ON public.notification_delivery_log;

CREATE POLICY notification_delivery_log_service_role_access
  ON public.notification_delivery_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY notification_delivery_log_service_role_access
  ON public.notification_delivery_log IS
  'Internal delivery ledger access is limited to trusted server-side service operations.';

-- These indexes cover common joins and parent-row deletes.
CREATE INDEX IF NOT EXISTS idx_claim_evidence_source_document
  ON public.claim_evidence(source_document_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_source_document
  ON public.claim_sources(source_document_id);
CREATE INDEX IF NOT EXISTS idx_correction_requests_submitted_by
  ON public.correction_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_editorial_notes_author_id
  ON public.editorial_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id
  ON public.notification_delivery_log(notification_id);
