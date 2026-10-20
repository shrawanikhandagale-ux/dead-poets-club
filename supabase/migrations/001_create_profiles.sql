-- Migration 001: Profiles & Auth Triggers with Row-Level Security (RLS)
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username CITEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  reading_goal INTEGER DEFAULT 12,
  books_read_count INTEGER DEFAULT 0,
  favorite_genres TEXT[] DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"profile_public": true, "shelves_public": true, "stats_public": false}'::jsonb,
  avatar_config JSONB DEFAULT '{"baseId": "classic_scholar", "pose": "reading"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile upon auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    LOWER(COALESCE(NEW.raw_user_meta_data->>'username', 'poet_' || SUBSTRING(NEW.id::text, 1, 8))),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Fellow Poet')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public profiles; user can always view their own
CREATE POLICY "Public profiles are viewable by everyone or owner"
  ON public.profiles
  FOR SELECT
  USING (
    (privacy_settings->>'profile_public')::boolean = true
    OR (auth.uid() = id)
  );

-- Profiles: Only owner can update their profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
