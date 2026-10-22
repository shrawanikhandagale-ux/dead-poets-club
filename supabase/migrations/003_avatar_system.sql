-- Migration 003: Retro 8-bit Pixel RPG Avatar System Schema & Defaults
-- Dead Poets Club: Literary RPG Avatar Configuration

-- 1. Ensure avatar_config has sensible RPG defaults
ALTER TABLE public.profiles 
  ALTER COLUMN avatar_config SET DEFAULT '{
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
  }'::jsonb;

-- 2. Update existing records if avatar_config lacks full RPG keys
UPDATE public.profiles
SET avatar_config = jsonb_build_object(
  'skinTone', COALESCE(avatar_config->>'skinTone', '#EAD4BA'),
  'faceExpression', COALESCE(avatar_config->>'faceExpression', 'contemplative'),
  'facialDetails', COALESCE(avatar_config->>'facialDetails', 'freckles'),
  'hairStyle', COALESCE(avatar_config->>'hairStyle', 'shaggy_mess'),
  'hairColor', COALESCE(avatar_config->>'hairColor', '#443223'),
  'top', COALESCE(avatar_config->>'top', 'oversized_tee'),
  'topColor', COALESCE(avatar_config->>'topColor', '#1A1614'),
  'bottom', COALESCE(avatar_config->>'bottom', 'cargo_pants'),
  'bottomColor', COALESCE(avatar_config->>'bottomColor', '#DBC4A5'),
  'outerwear', COALESCE(avatar_config->>'outerwear', 'cozy_cardigan'),
  'outerwearColor', COALESCE(avatar_config->>'outerwearColor', '#72583E'),
  'shoes', COALESCE(avatar_config->>'shoes', 'combat_boots'),
  'shoesColor', COALESCE(avatar_config->>'shoesColor', '#1A1614'),
  'accessories', COALESCE(avatar_config->'accessories', '["round_spectacles"]'::jsonb),
  'heldItem', COALESCE(avatar_config->>'heldItem', 'antique_book'),
  'equippedBadge', COALESCE(avatar_config->>'equippedBadge', 'secret_society_key'),
  'mbti', COALESCE(avatar_config->>'mbti', 'INTJ'),
  'configured', COALESCE((avatar_config->>'configured')::boolean, true)
)
WHERE avatar_config IS NOT NULL;

-- 3. Validation helper function to verify avatar configuration structure
CREATE OR REPLACE FUNCTION public.validate_avatar_config(config JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF config IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Required core keys check
  IF NOT (
    config ? 'skinTone' AND
    config ? 'hairStyle' AND
    config ? 'top' AND
    config ? 'bottom' AND
    config ? 'shoes'
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
