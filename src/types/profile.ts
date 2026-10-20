export interface PrivacySettings {
  profile_public: boolean;
  shelves_public: boolean;
  stats_public: boolean;
}

export interface AvatarConfig {
  baseId?: string;
  hairId?: string;
  topId?: string;
  bottomId?: string;
  accessoryId?: string;
  pose?: 'reading' | 'coffee' | 'studying' | 'writing';
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  reading_goal: number;
  books_read_count: number;
  favorite_genres: string[];
  privacy_settings: PrivacySettings;
  avatar_config: AvatarConfig;
  created_at: string;
  updated_at: string;
}
