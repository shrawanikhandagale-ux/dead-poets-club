export type ShelfStatus = 'want_to_read' | 'currently_reading' | 'read' | 'abandoned';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  publication_year: number;
  genres: string[];
  rating_avg: number;
  rating_count: number;
  pages: number;
  quote?: {
    text: string;
    speaker?: string;
  };
  featured?: boolean;
}

export interface ShelfItem {
  id: string;
  user_id: string;
  book_id: string;
  status: ShelfStatus;
  started_at?: string;
  finished_at?: string;
  progress_pages?: number;
  created_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  rating: number; // 1-5
  headline: string;
  body: string;
  quote?: string;
  mood_tags: string[];
  is_spoiler: boolean;
  mode: 'shelf' | 'margins';
  created_at: string;
  likes_count: number;
}
