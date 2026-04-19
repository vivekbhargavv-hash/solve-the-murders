-- ─────────────────────────────────────────────────────────────────────────────
-- SOLVE THE MURDERS — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  access_level  TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'full')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── CASES ───────────────────────────────────────────────────────────────────

CREATE TABLE public.cases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  difficulty          TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_free             BOOLEAN NOT NULL DEFAULT TRUE,
  order_index         INTEGER NOT NULL DEFAULT 1,
  setting             TEXT NOT NULL DEFAULT '',
  victim_name         TEXT NOT NULL DEFAULT '',
  victim_description  TEXT NOT NULL DEFAULT '',
  story_intro         TEXT NOT NULL DEFAULT '',
  cover_image_url     TEXT,
  -- Solution fields — NEVER exposed to client via API (server-side only)
  solution_killer     TEXT NOT NULL DEFAULT '',
  solution_motive     TEXT NOT NULL DEFAULT '',
  solution_method     TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUSPECTS ────────────────────────────────────────────────────────────────

CREATE TABLE public.suspects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  role              TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  personality       TEXT NOT NULL DEFAULT '',
  knowledge_base    JSONB NOT NULL DEFAULT '{}',
  hidden_truths     JSONB NOT NULL DEFAULT '{}',
  reveal_conditions JSONB NOT NULL DEFAULT '{}',
  is_killer         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suspects_case_id ON public.suspects(case_id);

-- ─── EVIDENCE ────────────────────────────────────────────────────────────────

CREATE TABLE public.evidence (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('physical', 'testimonial', 'documentary', 'forensic')),
  content          TEXT NOT NULL,
  relevance_score  FLOAT NOT NULL DEFAULT 0.5 CHECK (relevance_score BETWEEN 0 AND 1),
  is_red_herring   BOOLEAN NOT NULL DEFAULT FALSE,
  task_type        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_case_id ON public.evidence(case_id);

-- ─── USER CASE PROGRESS ───────────────────────────────────────────────────────

CREATE TABLE public.user_case_progress (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id           UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  points_remaining  INTEGER NOT NULL DEFAULT 25,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  attempts_used     INTEGER NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  solve_result      JSONB,
  UNIQUE(user_id, case_id)
);

CREATE INDEX idx_progress_user_id ON public.user_case_progress(user_id);
CREATE INDEX idx_progress_case_id ON public.user_case_progress(case_id);

-- ─── FACTS ───────────────────────────────────────────────────────────────────

CREATE TABLE public.facts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id          UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  fact_text        TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT '',
  relevance_score  FLOAT NOT NULL DEFAULT 0.5 CHECK (relevance_score BETWEEN 0 AND 1),
  discovered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facts_user_case ON public.facts(user_id, case_id);

-- ─── CHAT LOGS ───────────────────────────────────────────────────────────────

CREATE TABLE public.chat_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id     UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  character   TEXT NOT NULL,
  message     TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_user_case_char ON public.chat_logs(user_id, case_id, character);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────

CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id   TEXT UNIQUE,
  stripe_customer_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  access_level        TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'full')),
  amount_cents        INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_case_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments             ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE  USING (auth.uid() = id);

-- Cases: public read (auth required via middleware, but data itself is readable)
CREATE POLICY "cases_select_all"      ON public.cases    FOR SELECT  USING (TRUE);

-- Suspects: public read (hidden fields excluded by API layer, not RLS)
CREATE POLICY "suspects_select_all"   ON public.suspects FOR SELECT  USING (TRUE);

-- Evidence: public read
CREATE POLICY "evidence_select_all"   ON public.evidence FOR SELECT  USING (TRUE);

-- Progress: users own their progress
CREATE POLICY "progress_select_own"   ON public.user_case_progress FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own"   ON public.user_case_progress FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update_own"   ON public.user_case_progress FOR UPDATE  USING (auth.uid() = user_id);

-- Facts: users own their facts
CREATE POLICY "facts_select_own"      ON public.facts FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "facts_insert_own"      ON public.facts FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- Chat logs: users own their logs
CREATE POLICY "chat_select_own"       ON public.chat_logs FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "chat_insert_own"       ON public.chat_logs FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- Payments: users can see own
CREATE POLICY "payments_select_own"   ON public.payments FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own"   ON public.payments FOR INSERT  WITH CHECK (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_cases_updated_at     BEFORE UPDATE ON public.cases     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_payments_updated_at  BEFORE UPDATE ON public.payments  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
