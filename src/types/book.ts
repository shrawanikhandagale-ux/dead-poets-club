export type ShelfStatus = 'want_to_read' | 'currently_reading' | 'read' | 'abandoned';

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  author_id?: string;
  description: string;
  cover_url: string;
  publication_year: number;
  publisher?: string;
  isbn?: string;
  language?: string;
  genres: string[];
  rating_avg: number;
  rating_count: number;
  pages: number;
  quote?: {
    text: string;
    speaker?: string;
  };
  featured?: boolean;
  homepage_collections?: string[];
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

// 9A. Community Letters from the Margins
export interface CommunityLetter {
  id: string;
  author_name: string;
  author_handle?: string;
  avatar_color?: string;
  is_anonymous: boolean;
  book_id?: string;
  book_title?: string;
  quote_or_page?: string;
  content: string;
  created_at: string;
  likes_count: number;
  liked_by_user?: boolean;
  replies?: Array<{
    id: string;
    author_name: string;
    content: string;
    created_at: string;
  }>;
}

// 9B. Dear Marginalia Daily Prompt & Responses
export interface MarginaliaPrompt {
  id: string;
  issue_number: number;
  date_string: string;
  prompt_text: string;
  editorial_note?: string;
  suggested_book_id?: string;
}

export interface MarginaliaResponse {
  id: string;
  prompt_id: string;
  user_id: string;
  username: string;
  display_name: string;
  content: string;
  is_private: boolean;
  book_id?: string;
  book_title?: string;
  created_at: string;
  likes_count: number;
  liked_by_user?: boolean;
}

// 9C. Leave This Book for Someone (Recommendation)
export interface BookRecommendation {
  id: string;
  token: string;
  book_id: string;
  sender_name?: string;
  is_anonymous: boolean;
  message: string;
  created_at: string;
  views_count?: number;
}

// 10. Private User-Created Annotations
export interface UserAnnotation {
  id: string;
  book_id: string;
  book_title: string;
  passage?: string;
  note: string;
  page_number?: number;
  created_at: string;
  updated_at?: string;
}

