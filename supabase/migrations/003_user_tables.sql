-- Migration 003: User Tables
-- Profiles, watchlists, answers, matches, trackers, notifications, consent, and account lifecycle.

-- =============================================================================
-- Profiles
-- =============================================================================

CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  display_name        TEXT,
  role                TEXT NOT NULL DEFAULT 'user',
  subscription_tier   TEXT NOT NULL DEFAULT 'free',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  email_verified_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Extended user profile linked 1:1 to auth.users — stores role, tier, and onboarding state.';

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role  ON profiles(role);

-- =============================================================================
-- User Company Watchlists
-- =============================================================================

CREATE TABLE user_company_watchlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

COMMENT ON TABLE user_company_watchlists IS 'Users follow specific companies to receive alerts about new claimables.';

CREATE INDEX idx_user_company_watchlists_user    ON user_company_watchlists(user_id);
CREATE INDEX idx_user_company_watchlists_company ON user_company_watchlists(company_id);

-- =============================================================================
-- User Sector Watchlists
-- =============================================================================

CREATE TABLE user_sector_watchlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sector_id   UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sector_id)
);

COMMENT ON TABLE user_sector_watchlists IS 'Users follow specific sectors to receive alerts about new claimables in those industries.';

CREATE INDEX idx_user_sector_watchlists_user   ON user_sector_watchlists(user_id);
CREATE INDEX idx_user_sector_watchlists_sector ON user_sector_watchlists(sector_id);

-- =============================================================================
-- User Answers
-- =============================================================================

CREATE TABLE user_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimable_id  UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  question_key  TEXT NOT NULL,
  answer_value  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_answers IS 'User-provided answers to eligibility questions for specific claimables.';

CREATE INDEX idx_user_answers_user       ON user_answers(user_id);
CREATE INDEX idx_user_answers_claimable  ON user_answers(claimable_id);
CREATE UNIQUE INDEX idx_user_answers_unique ON user_answers(user_id, claimable_id, question_key);

-- =============================================================================
-- Claim Matches
-- =============================================================================

CREATE TABLE claim_matches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimable_id      UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  confidence        TEXT NOT NULL,
  match_reasons     JSONB NOT NULL DEFAULT '[]',
  first_matched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_checked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified          BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE claim_matches IS 'Computed matches between user profiles and claimables based on eligibility answers.';

CREATE INDEX idx_claim_matches_user       ON claim_matches(user_id);
CREATE INDEX idx_claim_matches_claimable ON claim_matches(claimable_id);
CREATE UNIQUE INDEX idx_claim_matches_unique ON claim_matches(user_id, claimable_id);

-- =============================================================================
-- Claim Trackers
-- =============================================================================

CREATE TABLE claim_trackers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimable_id      UUID NOT NULL REFERENCES claimables(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'saved',
  notes             TEXT,
  external_reference TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE claim_trackers IS 'User-initiated tracking of claimables they intend to act on (saved, in-progress, completed).';

CREATE INDEX idx_claim_trackers_user       ON claim_trackers(user_id);
CREATE INDEX idx_claim_trackers_claimable ON claim_trackers(claimable_id);

-- =============================================================================
-- Notification Preferences
-- =============================================================================

CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled     BOOLEAN NOT NULL DEFAULT true,
  browser_enabled   BOOLEAN NOT NULL DEFAULT false,
  whatsapp_enabled  BOOLEAN NOT NULL DEFAULT false,
  digest_frequency  TEXT NOT NULL DEFAULT 'weekly',
  quiet_hours_start TIME,
  quiet_hours_end   TIME,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notification_preferences IS 'Per-user notification channel and digest preferences (one row per user).';

-- =============================================================================
-- Notifications
-- =============================================================================

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  claimable_id  UUID REFERENCES claimables(id) ON DELETE SET NULL,
  read_at       TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'Outbound notification queue — emails, push, and in-app alerts sent to users.';

CREATE INDEX idx_notifications_user       ON notifications(user_id);
CREATE INDEX idx_notifications_read       ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_claimable  ON notifications(claimable_id);

-- =============================================================================
-- Consent Events
-- =============================================================================

CREATE TABLE consent_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type  TEXT NOT NULL,
  granted       BOOLEAN NOT NULL,
  details       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE consent_events IS 'Immutable audit log of user consent decisions (cookie, marketing, data processing).';

CREATE INDEX idx_consent_events_user ON consent_events(user_id);

-- =============================================================================
-- Account Export Requests
-- =============================================================================

CREATE TABLE account_export_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',
  completed_at  TIMESTAMPTZ,
  export_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE account_export_requests IS 'GDPR/DPDP-compliant data export requests — tracks status and download URL.';

CREATE INDEX idx_account_export_requests_user ON account_export_requests(user_id);

-- =============================================================================
-- Account Deletion Requests
-- =============================================================================

CREATE TABLE account_deletion_requests (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status                  TEXT NOT NULL DEFAULT 'pending',
  scheduled_deletion_at   TIMESTAMPTZ,
  reason                  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE account_deletion_requests IS 'Right-to-erasure requests — tracks scheduling and status of account deletion.';

CREATE INDEX idx_account_deletion_requests_user ON account_deletion_requests(user_id);
