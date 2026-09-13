-- DROID88: Supabase PostgreSQL Schema & Storage Setup
-- Run this in your Supabase Project -> SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Users & Developer Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- matches auth.users.id or custom ID
  name TEXT NOT NULL,
  developer_account_name TEXT,
  email TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('developer', 'tester')),
  tester_tier TEXT NOT NULL DEFAULT 'tier_1_standard' CHECK (tester_tier IN ('tier_1_standard', 'tier_2_verified', 'tier_3_core')),
  reputation_score INTEGER NOT NULL DEFAULT 500,
  bio TEXT DEFAULT 'Android software developer building for Google Play closed testing tracks.',
  website TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  google_play_console_dev_id TEXT DEFAULT '',
  company TEXT DEFAULT '',
  verified_developer BOOLEAN DEFAULT true,
  device_info JSONB DEFAULT '{"model":"Google Pixel 8 Pro","osVersion":"Android 14","manufacturer":"Google"}'::jsonb,
  enrolled_app_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. APPS (Closed Testing Track Listings)
CREATE TABLE IF NOT EXISTS public.apps (
  id TEXT PRIMARY KEY DEFAULT ('app_' || floor(extract(epoch from now()) * 1000)::text),
  developer_id TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  developer_avatar TEXT,
  name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  version_name TEXT NOT NULL DEFAULT '1.0.0-rc1',
  version_code INTEGER NOT NULL DEFAULT 1,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Productivity',
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  testing_track_url TEXT NOT NULL,
  google_group_url TEXT,
  required_tier TEXT NOT NULL DEFAULT 'tier_1_standard',
  target_testers INTEGER NOT NULL DEFAULT 20,
  current_testers INTEGER NOT NULL DEFAULT 0,
  test_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  test_duration_days INTEGER NOT NULL DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'active_testing' CHECK (status IN ('active_testing', 'target_met', 'completed', 'paused')),
  testing_focus TEXT[] DEFAULT ARRAY['General app stability and performance'],
  min_android_version TEXT DEFAULT 'Android 11 (API 30)+',
  screenshots TEXT[] DEFAULT '{}',
  average_rating NUMERIC(3, 2) DEFAULT 5.0,
  ratings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ENROLLMENTS (Tester 14-day tracking & Daily check-ins)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY DEFAULT ('enr_' || floor(extract(epoch from now()) * 1000)::text),
  app_id TEXT NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  tester_id TEXT NOT NULL,
  tester_name TEXT NOT NULL,
  tester_avatar TEXT,
  tester_email TEXT NOT NULL,
  tester_tier TEXT NOT NULL DEFAULT 'tier_1_standard',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_model TEXT NOT NULL,
  os_version TEXT NOT NULL,
  days_active INTEGER NOT NULL DEFAULT 1,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_checkins DATE[] DEFAULT ARRAY[CURRENT_DATE],
  completed_feedbacks TEXT[] DEFAULT '{}'
);

-- 4. BUG REPORTS (Issue tracking with screenshot attachment)
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id TEXT PRIMARY KEY DEFAULT ('bug_' || floor(extract(epoch from now()) * 1000)::text),
  app_id TEXT NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  tester_id TEXT NOT NULL,
  tester_name TEXT NOT NULL,
  tester_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  severity TEXT NOT NULL DEFAULT 'major' CHECK (severity IN ('blocker', 'major', 'minor', 'cosmetic')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'fix_in_next_build', 'resolved', 'closed')),
  device_model TEXT NOT NULL,
  os_version TEXT NOT NULL,
  app_version TEXT NOT NULL,
  screenshot_url TEXT,
  developer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUTOMATED FEEDBACK SUBMISSIONS (Milestone feedback: Day 1, 3, 7, 14)
CREATE TABLE IF NOT EXISTS public.automated_feedbacks (
  id TEXT PRIMARY KEY DEFAULT ('fb_' || floor(extract(epoch from now()) * 1000)::text),
  app_id TEXT NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  tester_id TEXT NOT NULL,
  tester_name TEXT NOT NULL,
  tester_tier TEXT NOT NULL DEFAULT 'tier_1_standard',
  phase TEXT NOT NULL DEFAULT 'day_1' CHECK (phase IN ('day_1', 'day_3', 'day_7', 'day_14', 'ad_hoc')),
  stability_rating INTEGER NOT NULL DEFAULT 5 CHECK (stability_rating BETWEEN 1 AND 5),
  battery_impact_rating INTEGER NOT NULL DEFAULT 1 CHECK (battery_impact_rating BETWEEN 1 AND 5),
  ui_intuitiveness_rating INTEGER NOT NULL DEFAULT 5 CHECK (ui_intuitiveness_rating BETWEEN 1 AND 5),
  crash_encountered BOOLEAN NOT NULL DEFAULT false,
  crash_details TEXT,
  favorite_features TEXT,
  confusing_areas TEXT,
  net_promoter_score INTEGER NOT NULL DEFAULT 10 CHECK (net_promoter_score BETWEEN 0 AND 10),
  device_model TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FEATURE FEEDBACK & IDEAS
CREATE TABLE IF NOT EXISTS public.feature_feedbacks (
  id TEXT PRIMARY KEY DEFAULT ('feat_' || floor(extract(epoch from now()) * 1000)::text),
  app_id TEXT NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL DEFAULT 'developer',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'improvement' CHECK (category IN ('feature_request', 'improvement', 'general_feedback', 'ux_issue')),
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'planned', 'in_progress', 'completed', 'declined')),
  likes INTEGER NOT NULL DEFAULT 1,
  liked_by TEXT[] DEFAULT '{}',
  comments_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FEEDBACK COMMENTS
CREATE TABLE IF NOT EXISTS public.feedback_comments (
  id TEXT PRIMARY KEY DEFAULT ('comm_' || floor(extract(epoch from now()) * 1000)::text),
  feedback_id TEXT NOT NULL REFERENCES public.feature_feedbacks(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL DEFAULT 'developer',
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- Public read access policies for all community listings
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles can be inserted or updated by authenticated users" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Apps are viewable by everyone" ON public.apps FOR SELECT USING (true);
CREATE POLICY "Apps can be created and modified" ON public.apps FOR ALL USING (true);

CREATE POLICY "Enrollments viewable by all" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Enrollments insert and update" ON public.enrollments FOR ALL USING (true);

CREATE POLICY "Bug reports viewable by all" ON public.bug_reports FOR SELECT USING (true);
CREATE POLICY "Bug reports insert and update" ON public.bug_reports FOR ALL USING (true);

CREATE POLICY "Automated feedbacks viewable by all" ON public.automated_feedbacks FOR SELECT USING (true);
CREATE POLICY "Automated feedbacks insert and update" ON public.automated_feedbacks FOR ALL USING (true);

CREATE POLICY "Feature feedbacks viewable by all" ON public.feature_feedbacks FOR SELECT USING (true);
CREATE POLICY "Feature feedbacks insert and update" ON public.feature_feedbacks FOR ALL USING (true);

CREATE POLICY "Comments viewable by all" ON public.feedback_comments FOR SELECT USING (true);
CREATE POLICY "Comments insert and update" ON public.feedback_comments FOR ALL USING (true);

-- STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('app-icons', 'app-icons', true),
  ('bug-screenshots', 'bug-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
CREATE POLICY "Public Access to App Icons" ON storage.objects FOR SELECT USING (bucket_id = 'app-icons');
CREATE POLICY "Public Upload to App Icons" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-icons');
CREATE POLICY "Public Access to Bug Screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'bug-screenshots');
CREATE POLICY "Public Upload to Bug Screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bug-screenshots');
