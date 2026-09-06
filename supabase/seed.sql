-- Seed Data for ClaimRadar India
-- All data is DEMO / SAMPLE — not real companies, claims, or users.
-- Idempotent: safe to run multiple times via ON CONFLICT DO NOTHING.

-- =============================================================================
-- Sectors
-- =============================================================================

INSERT INTO sectors (id, name, slug, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'E-commerce',   'e-commerce',   'Online retail and marketplace platforms.'),
  ('a0000000-0000-0000-0000-000000000002', 'Airlines',      'airlines',      'Commercial aviation and air travel services.'),
  ('a0000000-0000-0000-0000-000000000003', 'Telecom',       'telecom',       'Telecommunications and internet service providers.'),
  ('a0000000-0000-0000-0000-000000000004', 'Banking',       'banking',       'Retail and commercial banking institutions.'),
  ('a0000000-0000-0000-0000-000000000005', 'Fintech',       'fintech',       'Financial technology and digital payments.'),
  ('a0000000-0000-0000-0000-000000000006', 'Insurance',     'insurance',     'Life, health, and general insurance providers.'),
  ('a0000000-0000-0000-0000-000000000007', 'Education',     'education',     'EdTech platforms, universities, and training providers.'),
  ('a0000000-0000-0000-0000-000000000008', 'Real Estate',   'real-estate',   'Residential and commercial real estate developers.')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Companies (Demo)
-- =============================================================================

INSERT INTO companies (id, legal_name, display_name, slug, aliases, sector_id, official_domain, description, logo_usage_status, publication_status) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'MetroRide Demo Pvt. Ltd.',
   'MetroRide Demo',
   'metroride-demo',
   ARRAY['MetroRide Demo Airlines', 'MR Demo'],
   'a0000000-0000-0000-0000-000000000002',
   'demo.metroride.example.com',
   '[DEMO] Fictional airline used for demonstration purposes only.',
   'text_monogram',
   'published'),

  ('b0000000-0000-0000-0000-000000000002',
   'SampleLearn Demo Pvt. Ltd.',
   'SampleLearn Demo',
   'samplelearn-demo',
   ARRAY['SampleLearn Demo EdTech'],
   'a0000000-0000-0000-0000-000000000007',
   'demo.samplelearn.example.com',
   '[DEMO] Fictional education platform used for demonstration purposes only.',
   'text_monogram',
   'published'),

  ('b0000000-0000-0000-0000-000000000003',
   'ShopSquare Demo Pvt. Ltd.',
   'ShopSquare Demo',
   'shopsquare-demo',
   ARRAY['ShopSquare Demo Mart', 'SS Demo'],
   'a0000000-0000-0000-0000-000000000001',
   'demo.shopsquare.example.com',
   '[DEMO] Fictional e-commerce platform used for demonstration purposes only.',
   'text_monogram',
   'published')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Sources (configured registry records; claim rows remain demo-only)
-- =============================================================================

INSERT INTO sources (id, name, domain, base_url, source_type, adapter_name, trust_level, fetch_frequency_hours, metadata) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'Press Information Bureau RSS',
   'pib.gov.in',
   'https://www.pib.gov.in',
   'rss',
   'rss-pib',
   'official',
   6, '{"registryId":"pib-rss","feedUrl":"https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000002',
   'SEBI RSS Feed',
   'sebi.gov.in',
   'https://www.sebi.gov.in',
   'rss',
   'rss-sebi',
   'official',
   12, '{"registryId":"sebi-rss","feedUrl":"https://www.sebi.gov.in/sebirss.xml"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000003',
   'Reserve Bank of India RSS',
   'rbi.org.in',
   'https://www.rbi.org.in',
   'rss',
   'rss-rbi',
   'official',
   12, '{"registryId":"rbi-rss","feedUrl":"https://www.rbi.org.in/pressreleases_rss.xml"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000004',
   'RBI Consumer Protection & Ombudsman Notifications',
   'rbi.org.in',
   'https://www.rbi.org.in',
   'rss',
   'rss-rbi',
   'official',
   12, '{"registryId":"rbi-notifications-rss","feedUrl":"https://www.rbi.org.in/notifications_rss.xml"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000005',
   'IBBI Corporate Insolvency Creditor Claims Notices',
   'ibbi.gov.in',
   'https://ibbi.gov.in',
   'html_listing',
   'ibbi-public-announcement',
   'official',
   24, '{"registryId":"ibbi-public-announcements"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000006',
   'SEBI Public Notices & Investor Refund Orders',
   'sebi.gov.in',
   'https://www.sebi.gov.in',
   'html_listing',
   'sebi-public-notices',
   'official',
   24, '{"registryId":"sebi-public-notices"}'::jsonb),

  ('c0000000-0000-0000-0000-000000000007',
   'TRAI Telecom Tariff Refund & Overcharge Directives',
   'trai.gov.in',
   'https://www.trai.gov.in',
   'rss',
   'rss-generic',
   'official',
   24, '{"registryId":"trai-press-releases","feedUrl":"https://www.trai.gov.in/rss.xml"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Claimables (5 demo entries with varied statuses)
-- =============================================================================

INSERT INTO claimables (id, company_id, slug, public_title, summary, status, procedural_status, authority, jurisdiction, affected_group, relief_type, relief_description, claimability_score, confidence, publication_status, deadline, first_published_at, last_verified_at) VALUES
  -- 1. MetroRide Demo Refund Programme — verified_claimable
  ('d0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'metroride-demo-refund-cancelled-bookings',
   'MetroRide Demo Refund Programme for Cancelled Bookings',
   '[DEMO] Passengers whose MetroRide Demo flights were cancelled between Jan–Jun 2026 may be eligible for a full refund under DGCA regulations.',
   'verified_claimable',
   'final',
   'DGCA (Demo)',
   'India',
   'Passengers with cancelled MetroRide Demo bookings (Jan–Jun 2026)',
   'Full refund',
   'Full ticket price refund plus applicable taxes.',
   78,
   92,
   'published',
   now() + INTERVAL '90 days',
   now() - INTERVAL '14 days',
   now() - INTERVAL '2 days'),

  -- 2. ShopSquare Demo Compensation — potential_claimable
  ('d0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000003',
   'shopsquare-demo-compensation-defective-products',
   'ShopSquare Demo Compensation for Defective Products',
   '[DEMO] Consumers who purchased defective electronics from ShopSquare Demo between Mar–Aug 2025 may qualify for compensation or replacement.',
   'potential_claimable',
   'pending',
   'National Consumer Helpline (Demo)',
   'India',
   'Buyers of defective electronics from ShopSquare Demo (Mar–Aug 2025)',
   'Compensation or replacement',
   'Product replacement or monetary compensation up to purchase price.',
   62,
   74,
   'published',
   NULL,
   now() - INTERVAL '7 days',
   now() - INTERVAL '3 days'),

  -- 3. SampleLearn Demo Fee Refund — official_update
  ('d0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000002',
   'samplelearn-demo-fee-refund-cancelled-courses',
   'SampleLearn Demo Fee Refund for Cancelled Courses',
   '[DEMO] Students enrolled in SampleLearn Demo courses that were cancelled mid-session may receive a pro-rata fee refund.',
   'official_update',
   'interim',
   'UGC (Demo)',
   'India',
   'Students enrolled in cancelled SampleLearn Demo courses',
   'Pro-rata refund',
   'Refund proportional to uncompleted course duration.',
   45,
   60,
   'published',
   NULL,
   now() - INTERVAL '21 days',
   now() - INTERVAL '5 days'),

  -- 4. MetroRide Demo Individual Complaint — individual_judgment
  ('d0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000001',
   'metroride-demo-individual-complaint-award',
   'MetroRide Demo Individual Complaint Award',
   '[DEMO] A consumer forum awarded ₹15,000 compensation to an individual passenger for denied boarding on a MetroRide Demo flight.',
   'individual_judgment',
   'final',
   'District Consumer Forum (Demo)',
   'Delhi, India',
   'Individual passenger — denied boarding incident',
   'Monetary award',
   '₹15,000 compensation + ₹2,000 litigation costs.',
   30,
   85,
   'published',
   NULL,
   now() - INTERVAL '30 days',
   now() - INTERVAL '10 days'),

  -- 5. ShopSquare Demo Data Breach Settlement — registration_open
  ('d0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000003',
   'shopsquare-demo-data-breach-settlement',
   'ShopSquare Demo Data Breach Settlement Registration',
   '[DEMO] ShopSquare Demo has opened registration for affected users to claim compensation following a data breach in late 2025.',
   'registration_open',
   'proposed',
   'CERT-In (Demo)',
   'India',
   'Users whose personal data was exposed in the ShopSquare Demo breach (Oct–Dec 2025)',
   'Settlement compensation',
   'Variable compensation based on severity of data exposure.',
   70,
   80,
   'published',
   now() + INTERVAL '30 days',
   now() - INTERVAL '3 days',
   now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Eligibility Rules (Demo — for claimable #1)
-- =============================================================================

INSERT INTO eligibility_rules (id, claimable_id, rule_key, operator, expected_value, question_text, display_order, required) VALUES
  ('e0000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'had_booking',
   'equals',
   'yes',
   'Did you have a MetroRide Demo booking that was cancelled?',
   1, true),
  ('e0000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000001',
   'booking_period',
   'between',
   '2026-01-01,2026-06-30',
   'Was your booking made between January and June 2026?',
   2, true),
  ('e0000000-0000-0000-0000-000000000003',
   'd0000000-0000-0000-0000-000000000001',
   'refund_received',
   'equals',
   'no',
   'Have you already received a refund for this booking?',
   3, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Plans (Demo)
-- =============================================================================

INSERT INTO plans (id, name, slug, tier, price_monthly, price_yearly, features, max_watchlists) VALUES
  ('f0000000-0000-0000-0000-000000000001',
   'Free',
   'free',
   'free',
   0,
   0,
   '["5 watchlists", "Email alerts", "Basic eligibility check"]'::jsonb,
   5),
  ('f0000000-0000-0000-0000-000000000002',
   'Pro',
   'pro',
   'pro',
   29900,
   299000,
   '["Unlimited watchlists", "Priority alerts", "Full eligibility engine", "WhatsApp alerts"]'::jsonb,
   NULL),
  ('f0000000-0000-0000-0000-000000000003',
   'Enterprise',
   'enterprise',
   'enterprise',
   99900,
   999000,
   '["Everything in Pro", "API access", "Dedicated support", "Custom reports"]'::jsonb,
   NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Demo Users
-- Seed auth.users first so profile foreign keys and triggers are satisfied.
-- =============================================================================

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-free@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', now(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"display_name":"Demo Free User"}', now(), now(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-admin@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', now(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"display_name":"Demo Admin User"}', now(), now(), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-editor@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', now(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"display_name":"Demo Editor User"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, display_name, role, subscription_tier, onboarding_completed) VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo-free@example.com', 'Demo Free User', 'user', 'free', true),
  ('22222222-2222-2222-2222-222222222222', 'demo-admin@example.com', 'Demo Admin User', 'admin', 'enterprise', true),
  ('33333333-3333-3333-3333-333333333333', 'demo-editor@example.com', 'Demo Editor User', 'editor', 'pro', true)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  subscription_tier = EXCLUDED.subscription_tier,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- =============================================================================
-- Demo Notification Preferences
-- =============================================================================

INSERT INTO notification_preferences (user_id, email_enabled, browser_enabled, digest_frequency) VALUES
  ('11111111-1111-1111-1111-111111111111', true,  false, 'weekly'),
  ('22222222-2222-2222-2222-222222222222', true,  true,  'daily'),
  ('33333333-3333-3333-3333-333333333333', true,  true,  'weekly')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- Demo Watchlist Entries
-- =============================================================================

INSERT INTO user_company_watchlists (user_id, company_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000003')
ON CONFLICT (user_id, company_id) DO NOTHING;

INSERT INTO user_sector_watchlists (user_id, sector_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, sector_id) DO NOTHING;
