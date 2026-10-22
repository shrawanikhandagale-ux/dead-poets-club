import {
  AvatarConfig,
  AvatarExpression,
  AvatarFacialDetail,
  AvatarHairStyle,
  AvatarTop,
  AvatarBottom,
  AvatarOuterwear,
  AvatarShoes,
  AvatarAccessory,
  AvatarHeldItem,
  AvatarBadge,
} from '../../types/profile';

// ==========================================
// COLOR PALETTES (Muted Earthy, 8-Bit & Monochrome)
// Inspired by handheld console games & dark academia paper
// ==========================================

export const SKIN_TONES = [
  { id: '#FFF0E5', name: 'Alabaster', hex: '#FFF0E5', shadow: '#E2CEBF' },
  { id: '#EAD4BA', name: 'Parchment', hex: '#EAD4BA', shadow: '#CBB296' },
  { id: '#D4AA7D', name: 'Warm Ochre', hex: '#D4AA7D', shadow: '#B2875D' },
  { id: '#A57451', name: 'Umber', hex: '#A57451', shadow: '#835535' },
  { id: '#66442E', name: 'Dark Chestnut', hex: '#66442E', shadow: '#4D301E' },
  { id: '#3B2418', name: 'Deep Espresso', hex: '#3B2418', shadow: '#22140C' },
];

export const HAIR_COLORS = [
  { id: '#1A1614', name: 'Charcoal Black', hex: '#1A1614', highlight: '#3E342B' },
  { id: '#443223', name: 'Café Noir', hex: '#443223', highlight: '#634B35' },
  { id: '#72583E', name: 'Clockwork Auburn', hex: '#72583E', highlight: '#957555' },
  { id: '#A08670', name: 'Weathered Ash', hex: '#A08670', highlight: '#C4AFA0' },
  { id: '#755151', name: 'Dusty Mauve', hex: '#755151', highlight: '#9C6F6F' },
  { id: '#8D3F37', name: 'Terracotta Red', hex: '#8D3F37', highlight: '#B8584E' },
  { id: '#DBC4A5', name: 'Wheat Blonde', hex: '#DBC4A5', highlight: '#EFE2CE' },
  { id: '#E8E2D8', name: 'Silver White', hex: '#E8E2D8', highlight: '#FFFFFF' },
];

export const CLOTHING_COLORS = [
  { id: '#1A1614', name: 'Ink Black', hex: '#1A1614', shadow: '#0D0B0A' },
  { id: '#443223', name: 'Old Leather', hex: '#443223', shadow: '#2E2015' },
  { id: '#755151', name: 'Vintage Wine', hex: '#755151', shadow: '#563838' },
  { id: '#44422D', name: 'Deep Olive', hex: '#44422D', shadow: '#2C2B1B' },
  { id: '#7C7960', name: 'Cedar Sage', hex: '#7C7960', shadow: '#595642' },
  { id: '#72583E', name: 'Bookbinder Brown', hex: '#72583E', shadow: '#513D29' },
  { id: '#DBC4A5', name: 'Latte Linen', hex: '#DBC4A5', shadow: '#BFA482' },
  { id: '#FCF8F2', name: 'Pressed Paper', hex: '#FCF8F2', shadow: '#DCD4C7' },
  { id: '#3B4D61', name: 'Faded Denim', hex: '#3B4D61', shadow: '#263444' },
];

// ==========================================
// CUSTOMIZATION OPTIONS METADATA
// ==========================================

export interface OptionMeta<T> {
  id: T;
  name: string;
  desc: string;
  icon?: string;
}

export const EXPRESSION_OPTIONS: OptionMeta<AvatarExpression>[] = [
  { id: 'contemplative', name: 'Contemplative', desc: 'Half-lidded gaze lost in poetry' },
  { id: 'neutral', name: 'Deadpan', desc: 'Quiet, observant, monochrome stoicism' },
  { id: 'smirk', name: 'Secret Smirk', desc: 'Witty edge, knows an unwritten line' },
  { id: 'melancholy', name: 'Melancholic', desc: 'Yearning, autumn mist in their eyes' },
  { id: 'focused', name: 'Archivist Focus', desc: 'Deep in crosswords and manuscripts' },
];

export const FACIAL_DETAIL_OPTIONS: OptionMeta<AvatarFacialDetail>[] = [
  { id: 'none', name: 'Clean', desc: 'Classic bare paper look' },
  { id: 'freckles', name: 'Ink Freckles', desc: 'Subtle dapples across the bridge of nose' },
  { id: 'blush', name: 'Dithered Blush', desc: 'Soft cheek tone from cold library wind' },
  { id: 'under_eye_shadow', name: 'Late-Night Shadows', desc: 'Hallmark of 3 AM reading sprees' },
  { id: 'beauty_mark', name: 'Beauty Mark', desc: 'Distinct vintage signature mark' },
];

export const HAIR_STYLE_OPTIONS: OptionMeta<AvatarHairStyle>[] = [
  { id: 'shaggy_mess', name: 'Shaggy Curtain', desc: 'Disheveled Indie front bangs' },
  { id: 'poet_curls', name: 'Poet Curls', desc: 'Voluminous textured 8-bit curls' },
  { id: 'classic_bob', name: 'Sharp Bob', desc: 'Architectural blunt Parisian cut' },
  { id: 'wavy_locks', name: 'Wavy Cascades', desc: 'Long strands falling over shoulders' },
  { id: 'side_part', name: 'Scholar Part', desc: 'Combed side silhouette' },
  { id: 'pixie', name: 'Cropped Pixie', desc: 'Short, rebellious counterculture chop' },
  { id: 'slick_back', name: 'Slicked Back', desc: 'Tucked behind the ears' },
];

export const TOP_OPTIONS: OptionMeta<AvatarTop>[] = [
  { id: 'oversized_tee', name: 'Boxy Graphic Tee', desc: 'Heavyweight drop-shoulder retro cut' },
  { id: 'turtleneck', name: 'Wool Turtleneck', desc: 'Classic French existentialist knit' },
  { id: 'button_oxford', name: 'Collar Oxford', desc: 'Button-down archival school shirt' },
  { id: 'knit_sweater', name: 'Crewneck Jumper', desc: 'Thrifted chunky ribbed pullover' },
  { id: 'striped_longsleeve', name: 'Breton Stripes', desc: 'Horizontal nautical indie stripes' },
];

export const BOTTOM_OPTIONS: OptionMeta<AvatarBottom>[] = [
  { id: 'cargo_pants', name: 'Wide Cargo Trousers', desc: 'Baggy utility fit with deep pockets' },
  { id: 'cuffed_jeans', name: 'Raw Cuffed Denim', desc: 'Straight-leg vintage selvedge' },
  { id: 'pleated_skirt', name: 'Pleated Tartan Skirt', desc: 'Structured academic pleats' },
  { id: 'tailored_slacks', name: 'Wool Tailored Slacks', desc: 'High-waisted tapered silhouette' },
];

export const OUTERWEAR_OPTIONS: OptionMeta<AvatarOuterwear>[] = [
  { id: 'none', name: 'No Outerwear', desc: 'Show off the base shirt' },
  { id: 'cozy_cardigan', name: 'Draped Cardigan', desc: 'Slouchy open-front knitwear' },
  { id: 'tweed_blazer', name: 'Welton Tweed Blazer', desc: 'Heavy notched lapel collegiate jacket' },
  { id: 'denim_jacket', name: 'Oversized Denim Jacket', desc: 'Grunge buttoned jacket' },
  { id: 'trench_coat', name: 'Inspector Trench', desc: 'Long archival storm overcoat' },
];

export const SHOES_OPTIONS: OptionMeta<AvatarShoes>[] = [
  { id: 'combat_boots', name: 'Heavy Combat Boots', desc: 'Chunky 8-hole lugged soles' },
  { id: 'penny_loafers', name: 'Penny Loafers', desc: 'Polished slip-ons with coin strap' },
  { id: 'retro_sneakers', name: 'Low-Top Canvas', desc: 'Worn-in skate/running profile' },
  { id: 'oxford_shoes', name: 'Derby Oxfords', desc: 'Laced formal library shoes' },
];

export const ACCESSORY_OPTIONS: OptionMeta<AvatarAccessory>[] = [
  { id: 'round_spectacles', name: 'Round Spectacles', desc: 'Classic tortoiseshell wire rounds' },
  { id: 'wire_rims', name: 'Wire-Rim Glasses', desc: 'Rectangular minimalist metal frames' },
  { id: 'over_ear_headphones', name: 'Retro Walkman Headphones', desc: 'Foam-padded metal band over ears' },
  { id: 'knit_beanie', name: 'Folded Knit Beanie', desc: 'Slouchy fisherman beanie' },
  { id: 'french_beret', name: 'Wool Poet Beret', desc: 'Angled Left Bank artist cap' },
  { id: 'silver_earring', name: 'Silver Dangle Earring', desc: 'Small gleaming pendant at the ear' },
  { id: 'neck_scarf', name: 'Knotted Scarf', desc: 'Soft patterned cowl scarf' },
];

export const HELD_ITEM_OPTIONS: OptionMeta<AvatarHeldItem>[] = [
  { id: 'none', name: 'Empty Hand', desc: 'Relaxed hands in pockets' },
  { id: 'antique_book', name: 'First Edition Book', desc: 'Hardbound gold-embossed volume' },
  { id: 'leather_journal', name: 'Moleskine Journal', desc: 'Black elastic strap notebook' },
  { id: 'steaming_coffee', name: 'Diner Mug of Coffee', desc: 'Ceramic mug with rising vapor' },
  { id: 'fountain_pen', name: 'Ink Quill & Pen', desc: 'Ready to annotate rare margins' },
  { id: 'walkman', name: 'Portable Cassette Player', desc: 'Analog tape deck on hip' },
];

export const BADGE_OPTIONS: OptionMeta<AvatarBadge>[] = [
  { id: 'secret_society_key', name: 'Academy Skeleton Key', desc: 'Unlocks the midnight cave archives' },
  { id: 'quill_crest', name: 'Gilded Quill Crest', desc: 'Honorary membership seal' },
  { id: 'raven', name: 'Poe’s Raven Sigil', desc: 'Symbol of midnight scholars' },
  { id: 'coffee_cup', name: 'Midnight Espresso Pin', desc: 'Night owl cafeteria patron' },
  { id: 'ivy_leaf', name: 'Gothic Ivy Emblem', desc: 'Ancient stone archway roots' },
];

export const MBTI_OPTIONS = [
  'INTJ', 'INFP', 'INFJ', 'INTP', 'ENTP', 'ENFP', 'ENFJ', 'ENTJ',
  'ISFP', 'ISFJ', 'ISTP', 'ISTJ', 'ESFP', 'ESFJ', 'ESTP', 'ESTJ'
];
