import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { InventoryPanel } from '../components/avatar/InventoryPanel';
import {
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  EXPRESSION_OPTIONS,
  FACIAL_DETAIL_OPTIONS,
  HAIR_STYLE_OPTIONS,
  TOP_OPTIONS,
  BOTTOM_OPTIONS,
  OUTERWEAR_OPTIONS,
  SHOES_OPTIONS,
  ACCESSORY_OPTIONS,
  HELD_ITEM_OPTIONS,
  BADGE_OPTIONS,
  MBTI_OPTIONS,
} from '../components/avatar/avatarData';
import {
  AvatarConfig,
  AvatarAccessory,
  DEFAULT_AVATAR_CONFIG,
} from '../types/profile';
import {
  Shuffle,
  RotateCcw,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Eye,
  Layers,
  Shirt,
  Scissors,
  Palette,
  Briefcase,
  Compass,
} from 'lucide-react';

type CreatorCategory = 'face' | 'hair' | 'attire' | 'shoes' | 'accessories' | 'inventory';

export const CharacterCreatorPage: React.FC = () => {
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  // Current working avatar state initialized from user's saved config or default
  const [config, setConfig] = useState<AvatarConfig>(() => {
    if (profile?.avatar_config) {
      return { ...DEFAULT_AVATAR_CONFIG, ...profile.avatar_config };
    }
    return DEFAULT_AVATAR_CONFIG;
  });

  // Active customizer category
  const [activeCategory, setActiveCategory] = useState<CreatorCategory>('face');

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state if profile loads asynchronously
  useEffect(() => {
    if (profile?.avatar_config && !config.configured) {
      setConfig({ ...DEFAULT_AVATAR_CONFIG, ...profile.avatar_config });
    }
  }, [profile]);

  // CATEGORIES DEFINITION
  const categories: { id: CreatorCategory; label: string; icon: React.ElementType }[] = [
    { id: 'face', label: 'Skin & Face', icon: Eye },
    { id: 'hair', label: 'Hair & Tone', icon: Scissors },
    { id: 'attire', label: 'Wardrobe', icon: Shirt },
    { id: 'shoes', label: 'Footwear', icon: Layers },
    { id: 'accessories', label: 'Glasses & Gear', icon: Sparkles },
    { id: 'inventory', label: 'Props & Relics', icon: Briefcase },
  ];

  // Randomize generator
  const handleRandomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Pick 1 or 2 accessories randomly
    const accCount = Math.floor(Math.random() * 2) + 1;
    const shuffledAcc = [...ACCESSORY_OPTIONS].sort(() => 0.5 - Math.random());
    const pickedAcc = shuffledAcc.slice(0, accCount).map(a => a.id);

    const randomConfig: AvatarConfig = {
      skinTone: randomItem(SKIN_TONES).id,
      faceExpression: randomItem(EXPRESSION_OPTIONS).id,
      facialDetails: randomItem(FACIAL_DETAIL_OPTIONS).id,
      hairStyle: randomItem(HAIR_STYLE_OPTIONS).id,
      hairColor: randomItem(HAIR_COLORS).id,
      top: randomItem(TOP_OPTIONS).id,
      topColor: randomItem(CLOTHING_COLORS).id,
      bottom: randomItem(BOTTOM_OPTIONS).id,
      bottomColor: randomItem(CLOTHING_COLORS).id,
      outerwear: randomItem(OUTERWEAR_OPTIONS).id,
      outerwearColor: randomItem(CLOTHING_COLORS).id,
      shoes: randomItem(SHOES_OPTIONS).id,
      shoesColor: randomItem(CLOTHING_COLORS).id,
      accessories: pickedAcc,
      heldItem: randomItem(HELD_ITEM_OPTIONS).id,
      equippedBadge: randomItem(BADGE_OPTIONS).id,
      mbti: randomItem(MBTI_OPTIONS),
      configured: true,
    };

    setConfig(randomConfig);
    setSaveSuccess(false);
  };

  // Reset to default
  const handleReset = () => {
    setConfig(DEFAULT_AVATAR_CONFIG);
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Save handler with debounce / lock
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedConfig: AvatarConfig = {
        ...config,
        configured: true,
      };

      await updateProfile({
        avatar_config: updatedConfig,
      });

      setSaveSuccess(true);

      // If user came from onboarding, route to Clubhouse or profile
      if (isOnboarding) {
        setTimeout(() => {
          navigate('/clubhouse');
        }, 1200);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to preserve avatar in archives. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Accessory toggle
  const toggleAccessory = (accId: AvatarAccessory) => {
    setConfig(prev => {
      const exists = prev.accessories.includes(accId);
      let updated: AvatarAccessory[];
      if (exists) {
        updated = prev.accessories.filter(a => a !== accId);
      } else {
        // Allow up to 3 accessories
        if (prev.accessories.length >= 3) {
          updated = [...prev.accessories.slice(1), accId];
        } else {
          updated = [...prev.accessories, accId];
        }
      }
      return { ...prev, accessories: updated };
    });
    setSaveSuccess(false);
  };

  // Next / Prev category helpers
  const handleCategoryNav = (direction: 'prev' | 'next') => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    if (direction === 'prev') {
      const nextIdx = (currentIndex - 1 + categories.length) % categories.length;
      setActiveCategory(categories[nextIdx].id);
    } else {
      const nextIdx = (currentIndex + 1) % categories.length;
      setActiveCategory(categories[nextIdx].id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-[#1A1614]">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>
              {isOnboarding
                ? 'FIRST-TIME INITIATION · CHARACTER ATELIER'
                : 'MEMBER PASSPORT · SPRITE CONFIGURATION'}
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1614] tracking-tight">
            Pixel RPG Character Atelier
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E]">
            Handcraft your 8-bit literary persona, equipment slots, and reading relics.
          </p>
        </div>

        {/* Action Controls: Randomize, Reset, Save */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRandomize}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Randomize Sprite"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Randomize</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Reset to Sensible Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer ${
              saveSuccess ? 'bg-green-800 border-green-950' : ''
            }`}
          >
            {isSaving ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#FFF9F3] border-t-transparent rounded-full" />
                <span>Inscribing...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#FFF9F3]" />
                <span>Saved & Synchronized</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Persona</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveError && (
        <div className="mb-6 p-4 rounded bg-[#755151]/20 border-2 border-[#755151] flex items-center gap-3 text-xs font-typewriter text-[#443223]">
          <AlertCircle className="w-4 h-4 text-[#755151] flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 rounded bg-green-50 border-2 border-green-800 flex items-center justify-between text-xs font-typewriter text-green-900 shadow-[2px_2px_0px_#1A1614]">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-green-800" />
            <span>Character saved to your identity! Ready for the cafeteria and shelves.</span>
          </div>
          {isOnboarding && (
            <span className="font-bold flex items-center gap-1 text-green-900">
              Entering Clubhouse <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}

      {/* Main Studio Grid: Left Preview & Inventory, Right Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: RETRO CHARACTER SCREEN (Like sugigore.jpg)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="catalog-card p-6 bg-[#FCF8F2] border-3 border-[#1A1614] shadow-[6px_6px_0px_#1A1614] rounded">
            {/* Top Nametag Box: [ NAME ] */}
            <div className="mb-4 text-center">
              <div className="inline-block border-3 border-[#1A1614] bg-[#FFF9F3] px-6 py-2 shadow-[3px_3px_0px_#1A1614]">
                <h2 className="font-mono text-lg sm:text-xl font-bold text-[#1A1614] tracking-widest uppercase">
                  [ {profile?.display_name || user?.displayName || 'POET'} ]
                </h2>
              </div>

              {/* Status / Traits Tags: e.g. * INTJ, * DPC-1889 */}
              <div className="flex items-center justify-center gap-4 mt-2 font-mono text-xs font-bold text-[#1A1614]">
                <span>* {config.mbti || 'INTJ'}</span>
                <span>* ID: {user?.username || 'member'}</span>
                <span>* LVL: {profile?.books_read_count || 1}</span>
              </div>
            </div>

            {/* Character Stage / Pedestal */}
            <div className="w-full bg-[#FFF9F3] border-2 border-[#1A1614] rounded p-6 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Halftone / Grid Background Effect */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#1A1614 1.5px, transparent 1.5px)',
                  backgroundSize: '12px 12px',
                }}
              />

              {/* Pixel Sprite (Large) */}
              <div className="py-2 z-10">
                <PixelAvatar
                  config={config}
                  size="xl"
                  viewMode="full"
                  animateIdle={false}
                />
              </div>

              {/* Grounding Shadow / Base Plate */}
              <div className="w-32 h-2.5 bg-[#1A1614]/20 rounded-full mt-2" />

              {/* Prompt Barcode / Badge */}
              <div className="w-full mt-4 pt-3 border-t-2 border-dashed border-[#A08670] flex items-center justify-between text-[10px] font-mono text-[#72583E]">
                <span>SCALE: 1:1 PIXEL CRUNCH</span>
                <span className="font-bold text-[#755151]">STATUS: EQUIPPED</span>
              </div>
            </div>
          </div>

          {/* Framed Equipment / Inventory Panel */}
          <InventoryPanel
            config={config}
            onSlotClick={slot => {
              if (slot === 'props') setActiveCategory('inventory');
              if (slot === 'accessories') setActiveCategory('accessories');
              if (slot === 'outerwear') setActiveCategory('attire');
              if (slot === 'badges') setActiveCategory('inventory');
            }}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: INTERACTIVE CUSTOMIZATION SELECTORS        */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 catalog-card p-6 sm:p-8 bg-[#FCF8F2] border-3 border-[#1A1614] shadow-[6px_6px_0px_#1A1614] rounded">
          {/* Category Tabs with Prev/Next Controls */}
          <div className="flex items-center justify-between border-b-2 border-[#1A1614] pb-3 mb-6 gap-2">
            <button
              type="button"
              onClick={() => handleCategoryNav('prev')}
              className="p-1.5 border border-[#1A1614] rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] transition-colors"
              title="Previous Category"
            >
              <ChevronLeft className="w-4 h-4 text-[#1A1614]" />
            </button>

            {/* Scrollable Category Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold border-2 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[2px_2px_0px_#755151]'
                        : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:border-[#1A1614] hover:bg-[#DBC4A5]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleCategoryNav('next')}
              className="p-1.5 border border-[#1A1614] rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] transition-colors"
              title="Next Category"
            >
              <ChevronRight className="w-4 h-4 text-[#1A1614]" />
            </button>
          </div>

          {/* ===================================================== */}
          {/* SECTION 1: SKIN & FACE                                */}
          {/* ===================================================== */}
          {activeCategory === 'face' && (
            <div className="space-y-6">
              {/* Skin Tone Selector */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  1. Parchment Skin Tone:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {SKIN_TONES.map(tone => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, skinTone: tone.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2 rounded border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        config.skinTone === tone.id
                          ? 'border-[#1A1614] ring-2 ring-[#755151] shadow-[2px_2px_0px_#1A1614] scale-105'
                          : 'border-[#1A1614]/40 hover:border-[#1A1614]'
                      }`}
                      style={{ backgroundColor: '#FFF9F3' }}
                    >
                      <span
                        className="w-8 h-8 rounded border border-[#1A1614]"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span className="font-mono text-[10px] text-[#1A1614] font-bold">
                        {tone.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facial Expression */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  2. Eyes & Expression:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXPRESSION_OPTIONS.map(expr => (
                    <button
                      key={expr.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, faceExpression: expr.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-3 rounded border-2 text-left transition-all cursor-pointer ${
                        config.faceExpression === expr.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{expr.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          config.faceExpression === expr.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {expr.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facial Details (Freckles, Blush, Shadows) */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  3. Facial Nuance & Ink Marks:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACIAL_DETAIL_OPTIONS.map(detail => (
                    <button
                      key={detail.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, facialDetails: detail.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2.5 rounded border-2 text-left transition-all cursor-pointer ${
                        config.facialDetails === detail.id
                          ? 'bg-[#755151] text-[#FFF9F3] border-[#1A1614] shadow-[2px_2px_0px_#1A1614]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/50 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{detail.name}</div>
                      <div
                        className={`text-[9px] mt-0.5 ${
                          config.facialDetails === detail.id ? 'text-[#FFF9F3]/80' : 'text-[#72583E]'
                        }`}
                      >
                        {detail.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MBTI Personality Tag */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  4. Literary MBTI Archetype:
                </label>
                <div className="flex flex-wrap gap-2">
                  {MBTI_OPTIONS.map(mbti => (
                    <button
                      key={mbti}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, mbti });
                        setSaveSuccess(false);
                      }}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                        config.mbti === mbti
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[2px_2px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/40 hover:border-[#1A1614]'
                      }`}
                    >
                      {mbti}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SECTION 2: HAIR & TONE                                */}
          {/* ===================================================== */}
          {activeCategory === 'hair' && (
            <div className="space-y-6">
              {/* Hair Color Palette */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  1. Hair Pigment:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {HAIR_COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, hairColor: color.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2 rounded border-2 flex items-center gap-2 transition-all cursor-pointer ${
                        config.hairColor === color.id
                          ? 'border-[#1A1614] ring-2 ring-[#755151] shadow-[2px_2px_0px_#1A1614] bg-[#DBC4A5]/30'
                          : 'border-[#1A1614]/40 bg-[#FFF9F3] hover:border-[#1A1614]'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded border border-[#1A1614] flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-mono text-[10px] text-[#1A1614] font-bold truncate">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle Selection */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  2. Cut & Hairstyle Silhouette:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HAIR_STYLE_OPTIONS.map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, hairStyle: style.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-3 rounded border-2 text-left transition-all cursor-pointer ${
                        config.hairStyle === style.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{style.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          config.hairStyle === style.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SECTION 3: WARDROBE (TOPS, BOTTOMS, OUTERWEAR)        */}
          {/* ===================================================== */}
          {activeCategory === 'attire' && (
            <div className="space-y-6">
              {/* Tops Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider">
                    1. Shirt / Top Layer:
                  </label>
                  {/* Top Color Swatches */}
                  <div className="flex gap-1.5">
                    {CLOTHING_COLORS.slice(0, 5).map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, topColor: col.id });
                          setSaveSuccess(false);
                        }}
                        className={`w-5 h-5 rounded border ${
                          config.topColor === col.id ? 'ring-2 ring-[#1A1614] scale-110' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TOP_OPTIONS.map(top => (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, top: top.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2.5 rounded border-2 text-left transition-all cursor-pointer ${
                        config.top === top.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{top.name}</div>
                      <div
                        className={`text-[10px] ${
                          config.top === top.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {top.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottoms Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider">
                    2. Trousers / Skirt:
                  </label>
                  {/* Bottom Color Swatches */}
                  <div className="flex gap-1.5">
                    {CLOTHING_COLORS.map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, bottomColor: col.id });
                          setSaveSuccess(false);
                        }}
                        className={`w-5 h-5 rounded border ${
                          config.bottomColor === col.id ? 'ring-2 ring-[#1A1614] scale-110' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BOTTOM_OPTIONS.map(bottom => (
                    <button
                      key={bottom.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, bottom: bottom.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2.5 rounded border-2 text-left transition-all cursor-pointer ${
                        config.bottom === bottom.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{bottom.name}</div>
                      <div
                        className={`text-[10px] ${
                          config.bottom === bottom.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {bottom.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outerwear Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider">
                    3. Outerwear (Coat, Blazer, Cardigan):
                  </label>
                  <div className="flex gap-1.5">
                    {CLOTHING_COLORS.slice(0, 5).map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, outerwearColor: col.id });
                          setSaveSuccess(false);
                        }}
                        className={`w-5 h-5 rounded border ${
                          config.outerwearColor === col.id ? 'ring-2 ring-[#1A1614] scale-110' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {OUTERWEAR_OPTIONS.map(outer => (
                    <button
                      key={outer.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, outerwear: outer.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-2.5 rounded border-2 text-left transition-all cursor-pointer ${
                        config.outerwear === outer.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{outer.name}</div>
                      <div
                        className={`text-[10px] ${
                          config.outerwear === outer.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {outer.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SECTION 4: FOOTWEAR                                   */}
          {/* ===================================================== */}
          {activeCategory === 'shoes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider">
                  Footwear & Soles:
                </label>
                <div className="flex gap-1.5">
                  {['#1A1614', '#443223', '#72583E', '#DBC4A5', '#FFF9F3'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, shoesColor: col });
                        setSaveSuccess(false);
                      }}
                      className={`w-5 h-5 rounded border ${
                        config.shoesColor === col ? 'ring-2 ring-[#1A1614] scale-110' : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SHOES_OPTIONS.map(shoe => (
                  <button
                    key={shoe.id}
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, shoes: shoe.id });
                      setSaveSuccess(false);
                    }}
                    className={`p-3 rounded border-2 text-left transition-all cursor-pointer ${
                      config.shoes === shoe.id
                        ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                        : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">{shoe.name}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        config.shoes === shoe.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                      }`}
                    >
                      {shoe.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SECTION 5: ACCESSORIES & HEADWEAR                     */}
          {/* ===================================================== */}
          {activeCategory === 'accessories' && (
            <div className="space-y-6">
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-1">
                  Spectacles, Headwear & Accents:
                </label>
                <p className="font-typewriter text-[11px] text-[#72583E] mb-3">
                  Equip up to 3 accessories. Click an active accessory to unequip.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACCESSORY_OPTIONS.map(acc => {
                    const isEquipped = config.accessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccessory(acc.id)}
                        className={`p-3 rounded border-2 text-left transition-all cursor-pointer flex items-start justify-between ${
                          isEquipped
                            ? 'bg-[#755151] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#1A1614]'
                            : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs font-bold">{acc.name}</div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              isEquipped ? 'text-[#FFF9F3]/80' : 'text-[#72583E]'
                            }`}
                          >
                            {acc.desc}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ml-2 ${
                            isEquipped
                              ? 'bg-[#1A1614] text-[#FFF9F3] border-[#FFF9F3]'
                              : 'bg-[#DBC4A5]/40 text-[#72583E] border-[#A08670]'
                          }`}
                        >
                          {isEquipped ? 'EQUIPPED' : 'ADD'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SECTION 6: INVENTORY & LITERARY PROPS                 */}
          {/* ===================================================== */}
          {activeCategory === 'inventory' && (
            <div className="space-y-6">
              {/* Handheld Literary Prop */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  1. Handheld Literary Artifact (Held in Hand):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HELD_ITEM_OPTIONS.map(prop => (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, heldItem: prop.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-3 rounded border-2 text-left transition-all cursor-pointer ${
                        config.heldItem === prop.id
                          ? 'bg-[#1A1614] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#755151]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{prop.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          config.heldItem === prop.id ? 'text-[#DBC4A5]' : 'text-[#72583E]'
                        }`}
                      >
                        {prop.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Society Relic / Badge */}
              <div>
                <label className="font-mono text-xs font-bold text-[#1A1614] uppercase tracking-wider block mb-2">
                  2. Secret Society Relic / Inventory Crest:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BADGE_OPTIONS.map(badge => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, equippedBadge: badge.id });
                        setSaveSuccess(false);
                      }}
                      className={`p-3 rounded border-2 text-left transition-all cursor-pointer ${
                        config.equippedBadge === badge.id
                          ? 'bg-[#755151] text-[#FFF9F3] border-[#1A1614] shadow-[3px_3px_0px_#1A1614]'
                          : 'bg-[#FFF9F3] text-[#1A1614] border-[#1A1614]/60 hover:bg-[#DBC4A5]/30'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{badge.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          config.equippedBadge === badge.id ? 'text-[#FFF9F3]/80' : 'text-[#72583E]'
                        }`}
                      >
                        {badge.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-8 pt-4 border-t-2 border-dashed border-[#A08670] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleCategoryNav('prev')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <span className="font-mono text-[11px] text-[#72583E]">
              Category {categories.findIndex(c => c.id === activeCategory) + 1} of {categories.length}
            </span>

            <button
              type="button"
              onClick={() => handleCategoryNav('next')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <span>Next Category</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
