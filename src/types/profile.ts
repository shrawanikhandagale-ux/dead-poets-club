export interface PrivacySettings {
  profile_public: boolean;
  shelves_public: boolean;
  stats_public: boolean;
}


export type AvatarExpression = 'neutral' | 'contemplative' | 'smirk' | 'melancholy' | 'focused';
export type AvatarFacialDetail = 'none' | 'freckles' | 'blush' | 'under_eye_shadow' | 'beauty_mark';
export type AvatarHairStyle = 'shaggy_mess' | 'poet_curls' | 'classic_bob' | 'wavy_locks' | 'side_part' | 'pixie' | 'slick_back';
export type AvatarTop = 'oversized_tee' | 'turtleneck' | 'button_oxford' | 'knit_sweater' | 'striped_longsleeve';
export type AvatarBottom = 'cuffed_jeans' | 'cargo_pants' | 'pleated_skirt' | 'tailored_slacks';
export type AvatarOuterwear = 'none' | 'trench_coat' | 'tweed_blazer' | 'denim_jacket' | 'cozy_cardigan';
export type AvatarShoes = 'combat_boots' | 'penny_loafers' | 'retro_sneakers' | 'oxford_shoes';
export type AvatarAccessory = 'round_spectacles' | 'wire_rims' | 'over_ear_headphones' | 'knit_beanie' | 'french_beret' | 'silver_earring' | 'neck_scarf';
export type AvatarHeldItem = 'none' | 'antique_book' | 'leather_journal' | 'steaming_coffee' | 'fountain_pen' | 'walkman';
export type AvatarBadge = 'quill_crest' | 'raven' | 'coffee_cup' | 'secret_society_key' | 'ivy_leaf';

export interface AvatarConfig {
  skinTone: string;
  faceExpression: AvatarExpression;
  facialDetails: AvatarFacialDetail;
  hairStyle: AvatarHairStyle;
  hairColor: string;
  top: AvatarTop;
  topColor: string;
  bottom: AvatarBottom;
  bottomColor: string;
  outerwear: AvatarOuterwear;
  outerwearColor: string;
  shoes: AvatarShoes;
  shoesColor: string;
  accessories: AvatarAccessory[];
  heldItem: AvatarHeldItem;
  equippedBadge: AvatarBadge;
  mbti?: string;
  configured?: boolean;
  // Backward compatibility
  baseId?: string;
  pose?: 'reading' | 'coffee' | 'studying' | 'writing';
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: '#EAD4BA',
  faceExpression: 'contemplative',
  facialDetails: 'freckles',
  hairStyle: 'shaggy_mess',
  hairColor: '#443223',
  top: 'oversized_tee',
  topColor: '#1A1614',
  bottom: 'cargo_pants',
  bottomColor: '#DBC4A5',
  outerwear: 'cozy_cardigan',
  outerwearColor: '#72583E',
  shoes: 'combat_boots',
  shoesColor: '#1A1614',
  accessories: ['round_spectacles'],
  heldItem: 'antique_book',
  equippedBadge: 'secret_society_key',
  mbti: 'INTJ',
  configured: false,
  baseId: 'classic_scholar',
  pose: 'reading',
};

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

