-- Migration 011: Notification Types and Delivery Log
-- Restricts notifications.type to the seven product notification types and
-- adds notification_delivery_log — the idempotency/dedup ledger that makes
-- reprocessing safe (unique delivery key per user + type + subject entity +
-- window, one row per attempted channel delivery).
--
-- All statements are idempotent-safe: the migration can be re-applied to a
-- database that already contains parts of it without failing.

-- =============================================================================
-- 1. Notification type domain
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_type_check CHECK (type IN (
        'new_match',
        'status_change',
        'closing_soon_reminder',
        'deadline_reminder',
        'source_change_update',
        'weekly_digest',
        'correction_notice'
      ));
  END IF;
END
$$;

COMMENT ON CONSTRAINT notifications_type_check ON notifications IS
  'Restricts notification rows to the seven product notification types. The delivery engine rejects anything else.';

-- =============================================================================
-- 2. Delivery log (idempotency + dedup + frequency accounting)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id   UUID REFERENCES notifications(id) ON DELETE SET NULL,
  claimable_id      UUID REFERENCES claimables(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'new_match',
    'status_change',
    'closing_soon_reminder',
    'deadline_reminder',
    'source_change_update',
    'weekly_digest',
    'correction_notice'
  )),
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'browser', 'whatsapp')),
  dedup_key         TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'delivered'
                    CHECK (status IN ('delivered', 'failed', 'skipped')),
  skip_reason       TEXT,
  provider          TEXT,
  subject           TEXT,
  error             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notification_delivery_log IS
  'Immutable delivery ledger for the notification engine. The unique (user_id, dedup_key, channel) index is the idempotency guarantee: reprocessing the same trigger can never deliver twice.';

-- Idempotency / dedup guarantee: one delivery per user + dedup key + channel.
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_delivery_log_dedup
  ON notification_delivery_log(user_id, dedup_key, channel);

-- Frequency-limit accounting (per user + type per day) and claimable lookups.
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_frequency
  ON notification_delivery_log(user_id, notification_type, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_claimable
  ON notification_delivery_log(claimable_id);

-- =============================================================================
-- 3. Row Level Security — service-role only
-- =============================================================================
-- The delivery log is an internal ledger. RLS is enabled with NO policies,
-- so only the service-role key (used by the server-side delivery engine) can
-- read or write it. End users never see delivery internals.

ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Explicit privileges (mirrors migration 008 grant posture)
-- =============================================================================

GRANT SELECT, INSERT, UPDATE ON notification_delivery_log TO service_role;
