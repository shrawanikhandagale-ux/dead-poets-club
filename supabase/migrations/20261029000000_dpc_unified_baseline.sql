-- ==============================================================================
-- DEAD POETS CLUB (DPC) — UNIFIED BASELINE DATABASE MIGRATION
-- Migration File: 20261029000000_dpc_unified_baseline.sql
-- Target Engine: PostgreSQL 17.2 (Supabase Hosted Project qdnleqyiymddxoesicvj)
-- Status: Implementation Baseline Specification (Ready for controlled execution)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS (Order-sensitive prerequisites)
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ------------------------------------------------------------------------------
-- 2. PRIVATE INTERNAL SCHEMA (Unexposed to PostgREST HTTP Data API)
-- ------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;

-- ------------------------------------------------------------------------------
-- 3. DOMAIN 1: LITERARY CORE & TAXONOMY (9 Tables)
-- ------------------------------------------------------------------------------

-- Table 1: Authors
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 1),
  sort_name TEXT NOT NULL CHECK (char_length(trim(sort_name)) >= 1),
  nationality TEXT DEFAULT NULL,
  birth_year INTEGER DEFAULT NULL,
  death_year INTEGER DEFAULT NULL,
  biography TEXT NOT NULL DEFAULT '',
  portrait_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_author_lifespan CHECK (death_year IS NULL OR death_year >= birth_year)
);

-- Table 2: Author Aliases
CREATE TABLE IF NOT EXISTS public.author_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL CHECK (char_length(trim(alias_name)) >= 1),
  alias_type TEXT NOT NULL DEFAULT 'pseudonym' CHECK (alias_type IN ('pseudonym', 'legal_name', 'translation', 'variant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_author_alias UNIQUE (author_id, alias_name)
);

-- Table 3: Canonical Works
CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_code VARCHAR(10) UNIQUE DEFAULT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 1),
  subtitle TEXT DEFAULT NULL,
  original_title TEXT DEFAULT NULL,
  description TEXT NOT NULL DEFAULT '',
  first_published_year INTEGER DEFAULT NULL CHECK (first_published_year IS NULL OR first_published_year BETWEEN -3000 AND 2100),
  benchmark_rating NUMERIC(3,2) NOT NULL DEFAULT 0.0 CHECK (benchmark_rating BETWEEN 0.0 AND 5.0),
  benchmark_review_count INTEGER NOT NULL DEFAULT 0 CHECK (benchmark_review_count >= 0),
  featured_quote_text TEXT DEFAULT NULL,
  featured_quote_speaker TEXT DEFAULT NULL,
  is_club_select BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: Editions
CREATE TABLE IF NOT EXISTS public.editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  edition_title TEXT DEFAULT NULL,
  isbn_10 VARCHAR(10) DEFAULT NULL CHECK (isbn_10 IS NULL OR isbn_10 ~ '^[0-9X]{10}$'),
  isbn_13 VARCHAR(13) DEFAULT NULL CHECK (isbn_13 IS NULL OR isbn_13 ~ '^[0-9]{13}$'),
  publisher TEXT DEFAULT NULL,
  publication_date DATE DEFAULT NULL,
  language_code VARCHAR(10) NOT NULL DEFAULT 'en',
  page_count INTEGER DEFAULT NULL CHECK (page_count IS NULL OR page_count > 0),
  cover_url TEXT DEFAULT NULL,
  format TEXT NOT NULL DEFAULT 'paperback' CHECK (format IN ('hardcover', 'paperback', 'mass_market', 'ebook', 'audiobook')),
  is_canonical_edition BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_editions_id_work UNIQUE (id, work_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_canonical_edition_per_work 
  ON public.editions (work_id) 
  WHERE is_canonical_edition = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_editions_isbn13_unique 
  ON public.editions (isbn_13) 
  WHERE isbn_13 IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_editions_isbn10_unique 
  ON public.editions (isbn_10) 
  WHERE isbn_10 IS NOT NULL;

-- Table 5: Work Authors
CREATE TABLE IF NOT EXISTS public.work_authors (
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'co_author', 'translator', 'editor', 'illustrator', 'preface_by')),
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (work_id, author_id, role)
);

-- Table 6: Genres
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (char_length(trim(name)) >= 1),
  slug CITEXT UNIQUE NOT NULL
);

-- Table 7: Work Genres
CREATE TABLE IF NOT EXISTS public.work_genres (
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, genre_id)
);

-- Table 8: Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (char_length(trim(name)) >= 1),
  slug CITEXT UNIQUE NOT NULL
);

-- Table 9: Work Subjects
CREATE TABLE IF NOT EXISTS public.work_subjects (
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, subject_id)
);

-- ------------------------------------------------------------------------------
-- 4. DOMAIN 2: METADATA PROVENANCE & HARVESTING (3 Tables)
-- ------------------------------------------------------------------------------

-- Table 10: Metadata Sources
CREATE TABLE IF NOT EXISTS public.metadata_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key VARCHAR(50) UNIQUE NOT NULL,
  source_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  attribution_markdown TEXT NOT NULL,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  default_refresh_interval_days INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: External Identifiers (Exclusive Arc Mutex Pattern)
CREATE TABLE IF NOT EXISTS public.external_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.metadata_sources(id) ON DELETE RESTRICT,
  author_id UUID DEFAULT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  work_id UUID DEFAULT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  edition_id UUID DEFAULT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  external_key TEXT NOT NULL CHECK (char_length(trim(external_key)) >= 1),
  verified BOOLEAN NOT NULL DEFAULT false,
  last_verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_external_target_mutex CHECK (
    num_nonnulls(author_id, work_id, edition_id) = 1
  ),
  CONSTRAINT uq_provider_external_key UNIQUE (source_id, external_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ext_id_author ON public.external_identifiers (source_id, author_id) WHERE author_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ext_id_work ON public.external_identifiers (source_id, work_id) WHERE work_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ext_id_edition ON public.external_identifiers (source_id, edition_id) WHERE edition_id IS NOT NULL;

-- Table 12: Metadata Refresh Log
CREATE TABLE IF NOT EXISTS public.metadata_refresh_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.metadata_sources(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('author', 'work', 'edition')),
  entity_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'no_change', 'warning', 'error')),
  http_status INTEGER DEFAULT NULL,
  payload_hash TEXT DEFAULT NULL,
  message TEXT DEFAULT NULL,
  error_details JSONB DEFAULT NULL,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);

-- ------------------------------------------------------------------------------
-- 5. DOMAIN 3: EDITORIAL CURATION & READING SHELVES (3 Tables)
-- ------------------------------------------------------------------------------

-- Table 13: Collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug CITEXT UNIQUE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1),
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: Collection Works
CREATE TABLE IF NOT EXISTS public.collection_works (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, work_id)
);

-- ------------------------------------------------------------------------------
-- 6. DOMAIN 4: MEMBER IDENTITY & PRIVACY (2 Tables)
-- ------------------------------------------------------------------------------

-- Table 15: Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username CITEXT NOT NULL,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 1),
  avatar_config JSONB NOT NULL DEFAULT '{
    "skinTone": "#EAD4BA",
    "faceExpression": "contemplative",
    "facialDetails": "freckles",
    "hairStyle": "shaggy_mess",
    "hairColor": "#443223",
    "top": "oversized_tee",
    "topColor": "#1A1614",
    "bottom": "cargo_pants",
    "bottomColor": "#DBC4A5",
    "outerwear": "cozy_cardigan",
    "outerwearColor": "#72583E",
    "shoes": "combat_boots",
    "shoesColor": "#1A1614",
    "accessories": ["round_spectacles"],
    "heldItem": "antique_book",
    "equippedBadge": "secret_society_key",
    "mbti": "INTJ",
    "configured": false
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT chk_profiles_username_format CHECK (
    (username::text ~ '^[a-z0-9_]{3,30}$')
    AND (username::text = lower(username::text))
  )
);

-- Table 16: User Settings (Private Sanctuary)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  reading_goal INTEGER NOT NULL DEFAULT 12 CHECK (reading_goal > 0),
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  shelves_public BOOLEAN NOT NULL DEFAULT true,
  stats_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 17: Shelves (PostgreSQL 17 Target Deletion Semantics)
CREATE TABLE IF NOT EXISTS public.shelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  edition_id UUID DEFAULT NULL,
  status TEXT NOT NULL CHECK (status IN ('want_to_read', 'currently_reading', 'read', 'abandoned')),
  started_at DATE DEFAULT NULL,
  finished_at DATE DEFAULT NULL,
  progress_pages INTEGER NOT NULL DEFAULT 0 CHECK (progress_pages >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_work_shelf UNIQUE (user_id, work_id),
  CONSTRAINT chk_shelf_dates CHECK (
    (started_at IS NULL OR finished_at IS NULL) OR (finished_at >= started_at)
  ),
  CONSTRAINT fk_shelves_edition_work_pairing FOREIGN KEY (edition_id, work_id)
    REFERENCES public.editions(id, work_id)
    ON DELETE SET NULL (edition_id)
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE & SEARCH INDEXES
-- ------------------------------------------------------------------------------

-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_editions_work_fk ON public.editions (work_id);
CREATE INDEX IF NOT EXISTS idx_work_authors_author_fk ON public.work_authors (author_id);
CREATE INDEX IF NOT EXISTS idx_work_genres_genre_fk ON public.work_genres (genre_id);
CREATE INDEX IF NOT EXISTS idx_work_subjects_subject_fk ON public.work_subjects (subject_id);
CREATE INDEX IF NOT EXISTS idx_collection_works_work_fk ON public.collection_works (work_id);
CREATE INDEX IF NOT EXISTS idx_shelves_work_fk ON public.shelves (work_id);
CREATE INDEX IF NOT EXISTS idx_external_id_source_fk ON public.external_identifiers (source_id);
CREATE INDEX IF NOT EXISTS idx_refresh_log_source_fk ON public.metadata_refresh_log (source_id);

-- Operational Query Indexes
CREATE INDEX IF NOT EXISTS idx_shelves_user_status ON public.shelves (user_id, status);
CREATE INDEX IF NOT EXISTS idx_collection_works_position ON public.collection_works (collection_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_works_legacy_code ON public.works (legacy_code) WHERE legacy_code IS NOT NULL;

-- GIN Trigram Search Indexes
CREATE INDEX IF NOT EXISTS idx_works_title_trgm ON public.works USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_works_orig_title_trgm ON public.works USING gin (original_title gin_trgm_ops) WHERE original_title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_authors_name_trgm ON public.authors USING gin (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_author_aliases_name_trgm ON public.author_aliases USING gin (alias_name gin_trgm_ops);

-- ------------------------------------------------------------------------------
-- 8. HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Shelf Privacy Helper in Non-Exposed Schema
CREATE OR REPLACE FUNCTION private.is_shelf_public(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT shelves_public FROM public.user_settings WHERE user_id = p_user_id),
    false
  );
$$;

-- Collision-Safe Registration Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_raw_username TEXT;
  v_clean_username TEXT;
  v_candidate_username TEXT;
  v_display_name TEXT;
  v_suffix TEXT;
  v_attempt INTEGER := 0;
  v_inserted BOOLEAN := false;
  v_err_constraint TEXT;
BEGIN
  -- 1. Extract raw username candidate
  v_raw_username := pg_catalog.lower(coalesce(
    nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'username'), ''),
    nullif(pg_catalog.btrim(pg_catalog.split_part(NEW.email, '@', 1)), ''),
    'poet'
  ));

  -- 2. Sanitize to valid characters [a-z0-9_]
  v_clean_username := pg_catalog.regexp_replace(v_raw_username, '[^a-z0-9_]', '', 'g');

  -- Enforce minimum length of 3
  IF pg_catalog.char_length(v_clean_username) < 3 THEN
    v_clean_username := 'poet_' || pg_catalog.substring(pg_catalog.md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text), 1, 4);
  END IF;

  -- Clamp base to 20 chars
  v_clean_username := pg_catalog.substring(v_clean_username, 1, 20);
  v_candidate_username := v_clean_username;

  -- 3. Concurrency-Safe Subtransaction Insertion Loop
  WHILE NOT v_inserted LOOP
    v_attempt := v_attempt + 1;

    BEGIN
      INSERT INTO public.profiles (id, username, display_name)
      VALUES (
        NEW.id,
        v_candidate_username,
        coalesce(
          nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'display_name'), ''),
          nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'full_name'), ''),
          nullif(pg_catalog.btrim(NEW.raw_user_meta_data->>'name'), ''),
          'Fellow Poet'
        )
      );

      v_inserted := true;

    EXCEPTION WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_err_constraint = CONSTRAINT_NAME;

      -- Strict check: Retry ONLY on profiles_username_key
      IF v_err_constraint IS DISTINCT FROM 'profiles_username_key' THEN
        RAISE;
      END IF;

      -- Bounded retries: 5 attempts
      IF v_attempt >= 5 THEN
        RAISE EXCEPTION 'Registration failed: unable to allocate unique username after % attempts for user %', v_attempt, NEW.id;
      END IF;

      -- Generate 4-hex random suffix using pg_catalog functions (safe under empty search_path)
      v_suffix := '_' || pg_catalog.substring(pg_catalog.md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text), 1, 4);
      v_candidate_username := pg_catalog.substring(v_clean_username, 1, (30 - pg_catalog.char_length(v_suffix))) || v_suffix;
    END;
  END LOOP;

  -- 4. Atomic User Settings Creation
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. DEFENSE-IN-DEPTH PRIVILEGE RESET & EXPLICIT TABLE GRANTS
-- ------------------------------------------------------------------------------

-- 1. Full clean-slate revocation on public schema
REVOKE ALL ON SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- 2. Reset default privileges for future objects created by postgres or session role
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

-- 3. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 4. Private helper permissions
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_shelf_public(UUID) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_shelf_public(UUID) TO anon, authenticated, service_role;

-- 5. Public Catalogue Tables (SELECT only for anon & authenticated; ALL for service_role)
GRANT SELECT ON public.authors, public.author_aliases, public.works, public.editions,
                public.work_authors, public.genres, public.work_genres, public.subjects,
                public.work_subjects, public.metadata_sources, public.external_identifiers,
                public.collections, public.collection_works
TO anon, authenticated;

GRANT ALL ON public.authors, public.author_aliases, public.works, public.editions,
             public.work_authors, public.genres, public.work_genres, public.subjects,
             public.work_subjects, public.metadata_sources, public.external_identifiers,
             public.collections, public.collection_works
TO service_role;

-- 6. Operational Telemetry (service_role only)
GRANT ALL ON public.metadata_refresh_log TO service_role;

-- 7. Profiles
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 8. User Settings
GRANT SELECT, UPDATE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

-- 9. Shelves
GRANT SELECT ON public.shelves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelves TO authenticated;
GRANT ALL ON public.shelves TO service_role;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_refresh_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;

-- Public Catalogue Policies
CREATE POLICY "Public Read Authors" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Public Read Author Aliases" ON public.author_aliases FOR SELECT USING (true);
CREATE POLICY "Public Read Works" ON public.works FOR SELECT USING (true);
CREATE POLICY "Public Read Editions" ON public.editions FOR SELECT USING (true);
CREATE POLICY "Public Read Work Authors" ON public.work_authors FOR SELECT USING (true);
CREATE POLICY "Public Read Genres" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Public Read Work Genres" ON public.work_genres FOR SELECT USING (true);
CREATE POLICY "Public Read Subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Work Subjects" ON public.work_subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Metadata Sources" ON public.metadata_sources FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read External Identifiers" ON public.external_identifiers FOR SELECT USING (true);
CREATE POLICY "Public Read Collections" ON public.collections FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Collection Works" ON public.collection_works FOR SELECT USING (true);

-- Profiles Policies
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Owner Update Profiles" ON public.profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- User Settings Policies
CREATE POLICY "Owner Read User Settings" ON public.user_settings FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY "Owner Update User Settings" ON public.user_settings FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Shelves Policies
CREATE POLICY "Shelves SELECT Policy" ON public.shelves FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR private.is_shelf_public(user_id) = true
  );

CREATE POLICY "Shelves INSERT Policy" ON public.shelves FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Shelves UPDATE Policy" ON public.shelves FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Shelves DELETE Policy" ON public.shelves FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);
