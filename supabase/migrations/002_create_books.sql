-- Migration 002: Books Catalogue, Genres, and Shelves Schema
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  publication_year INTEGER,
  pages INTEGER DEFAULT 300,
  cover_url TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  quote_text TEXT,
  quote_speaker TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_genres (
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

CREATE TABLE IF NOT EXISTS public.shelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('want_to_read', 'currently_reading', 'read', 'abandoned')) NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  progress_pages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;

-- Public can read books, genres, and book_genres
CREATE POLICY "Public read books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Public read genres" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Public read book_genres" ON public.book_genres FOR SELECT USING (true);

-- Shelves RLS: Owner can view/insert/update/delete their shelves
CREATE POLICY "Users can manage their own shelves"
  ON public.shelves
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public shelves viewable if profile shelves_public is true"
  ON public.shelves
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = shelves.user_id
      AND (profiles.privacy_settings->>'shelves_public')::boolean = true
    )
  );
