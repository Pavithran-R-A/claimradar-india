-- Migration 004: Billing Tables
-- Plans, subscriptions, payments (Razorpay integration), webhook events, and entitlements.

-- =============================================================================
-- Plans
-- =============================================================================

CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  tier          TEXT NOT NULL,
  price_monthly INT NOT NULL,
  price_yearly  INT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'INR',
  features      JSONB NOT NULL DEFAULT '[]',
  max_watchlists INT,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE plans IS 'Subscription plan catalogue — defines tiers, pricing, and feature gates.';

CREATE INDEX idx_plans_tier    ON plans(tier);
CREATE INDEX idx_plans_enabled ON plans(enabled);

-- =============================================================================
-- Subscriptions
-- =============================================================================

CREATE TABLE subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                   UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  billing_cycle             TEXT NOT NULL DEFAULT 'monthly',
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancelled_at              TIMESTAMPTZ,
  payment_provider          TEXT NOT NULL DEFAULT 'razorpay',
  provider_subscription_id  TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE subscriptions IS 'Active and historical subscription records linking users to plans via a payment provider.';

CREATE INDEX idx_subscriptions_user    ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan    ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions(status);

-- =============================================================================
-- Payment Customers
-- =============================================================================

CREATE TABLE payment_customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  provider              TEXT NOT NULL,
  provider_customer_id  TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE payment_customers IS 'Maps internal users to external payment provider customer IDs (e.g. Razorpay customer).';

-- =============================================================================
-- Payment Events
-- =============================================================================

CREATE TABLE payment_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  event_type          TEXT NOT NULL,
  amount              INT,
  currency            TEXT NOT NULL DEFAULT 'INR',
  provider_event_id   TEXT UNIQUE,
  metadata            JSONB NOT NULL DEFAULT '{}',
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE payment_events IS 'Normalised payment lifecycle events from the payment provider (charged, refunded, failed).';

CREATE INDEX idx_payment_events_subscription ON payment_events(subscription_id);
CREATE INDEX idx_payment_events_type         ON payment_events(event_type);

-- =============================================================================
-- Webhook Events
-- =============================================================================

CREATE TABLE webhook_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider            TEXT NOT NULL,
  provider_event_id   TEXT NOT NULL UNIQUE,
  event_type          TEXT NOT NULL,
  payload             JSONB NOT NULL,
  processed           BOOLEAN NOT NULL DEFAULT false,
  processed_at        TIMESTAMPTZ,
  error_message       TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE webhook_events IS 'Raw inbound webhook payloads — idempotent ingestion with processing status tracking.';

CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, received_at);

-- =============================================================================
-- Entitlements
-- =============================================================================

CREATE TABLE entitlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL,
  granted         BOOLEAN NOT NULL DEFAULT true,
  source          TEXT NOT NULL,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  UNIQUE (user_id, entitlement_key)
);

COMMENT ON TABLE entitlements IS 'Fine-grained feature flags granted to users via subscription, manual override, or promotion.';

CREATE INDEX idx_entitlements_user    ON entitlements(user_id);
CREATE INDEX idx_entitlements_key     ON entitlements(entitlement_key);
CREATE INDEX idx_entitlements_expires ON entitlements(expires_at);
