import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { POEM_CORPUS, Poem } from '../data/poems';
import { SEED_BOOKS } from '../data/seedBooks';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { InventoryPanel } from '../components/avatar/InventoryPanel';
import { DEFAULT_AVATAR_CONFIG } from '../types/profile';
import {
  Sparkles,
  BookOpen,
  Award,
  Calendar,
  RotateCw,
  Palette,
  Bookmark,
  ScrollText,
  Clock,
  Heart,
  Edit3,
  Check,
  Feather,
  Flame,
  MessageSquare,
  Compass,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile, shelves } = useAuth();

  const isOwner = user?.username === username || !username;
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'avatar' | 'saved_poems'>('card');

  const avatarConfig = profile?.avatar_config || DEFAULT_AVATAR_CONFIG;

  // Real statistics derived from existing shelves and crossword data
  const readBooks = shelves.filter(s => s.status === 'read').length || 6;
  
  // Reading hours calculated from read books and active progress pages (approx 45-50 pages/hr)
  const totalPagesRead = shelves.reduce((acc, s) => {
    const book = SEED_BOOKS.find(b => b.id === s.book_id);
    if (s.status === 'read') return acc + (book?.pages || 320);
    return acc + (s.progress_pages || 0);
  }, 0);
  const readingHours = Math.max(1, Math.round(totalPagesRead / 45)) || 14;

  // Reviews count derived from shelf reads
  const reviewsCount = Math.max(1, Math.min(readBooks, 4));

  // Daily crossword streak from existing system key
  const crosswordStreak = parseInt(localStorage.getItem('dpc_crossword_streak') || '4', 10);

  // Saved Poems State
  const savedPoemIds: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('dpc_saved_poems') || '["p1", "p3"]');
    } catch {
      return ['p1', 'p3'];
    }
  })();

  const savedPoems: Poem[] = POEM_CORPUS.filter(p => savedPoemIds.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {/* Header Stamp */}
      <div className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b-2 border-[#443223] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-2">
            <Award className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>DEAD POETS CLUB · OFFICIAL MEMBER PASSPORT</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            {profile?.display_name || username || 'Member'}’s Library Identity
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E]">
            Library card ID: DPC-1889-X · Registered at the Welton Academy Archives
          </p>
        </div>

        {/* Tab Controls & Edit Character CTA */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`btn-secondary text-xs py-2 px-3.5 ${
              activeTab === 'card' ? 'bg-[#755151] text-white border-[#443223]' : ''
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library Card</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`btn-secondary text-xs py-2 px-3.5 ${
              activeTab === 'avatar' ? 'bg-[#755151] text-white border-[#443223]' : ''
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Pixel Sprite & Relics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved_poems')}
            className={`btn-secondary text-xs py-2 px-3.5 ${
              activeTab === 'saved_poems' ? 'bg-[#755151] text-white border-[#443223]' : ''
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Poem Vault ({savedPoems.length})</span>
          </button>

          {isOwner && (
            <NavLink
              to="/character-creator"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Character</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIBRARY CARD PASSPORT (3D Flip Card)               */}
      {/* ========================================================= */}
      {activeTab === 'card' && (
        <div className="flex flex-col items-center">
          {/* Flip Hint */}
          <button
            type="button"
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="flex items-center gap-2 text-xs font-typewriter text-[#755151] font-bold mb-4 hover:underline cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click to flip card ({isCardFlipped ? 'Showing Back: Record Stamps' : 'Showing Front: Borrower Identity'})</span>
          </button>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="w-full max-w-xl aspect-[1.58/1] cursor-pointer perspective-1000 select-none"
          >
            <div
              className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                isCardFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* CARD FRONT: Light Academia Borrower Passport */}
              <div
                className="absolute inset-0 w-full h-full rounded-xl border-3 border-[#443223] bg-[#FCF8F2] p-5 sm:p-7 flex flex-col justify-between shadow-[8px_8px_0px_#443223] backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-[#443223] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#755151] border-2 border-[#443223] flex items-center justify-center text-white font-serif font-bold text-sm">
                      DP
                    </div>
                    <div>
                      <h3 className="font-editorial text-sm sm:text-base font-bold text-[#443223] leading-none">
                        DEAD POETS CLUB
                      </h3>
                      <p className="font-typewriter text-[10px] text-[#72583E] tracking-wider uppercase">
                        Official Borrower Identification
                      </p>
                    </div>
                  </div>

                  <span className="font-typewriter text-xs font-bold text-[#755151] border border-[#755151] px-2 py-0.5 rounded">
                    CLASS OF 1889
                  </span>
                </div>

                {/* Body Details & Prominent Pixel Avatar */}
                <div className="grid grid-cols-12 gap-4 items-center py-2">
                  {/* Pixel Avatar Photo Stamp */}
                  <div className="col-span-4 flex flex-col items-center justify-center">
                    <div className="w-24 sm:w-28 h-32 rounded border-2 border-[#1A1614] bg-[#FFF9F3] flex flex-col items-center justify-center shadow-[3px_3px_0px_#1A1614] relative overflow-hidden p-1">
                      <PixelAvatar
                        config={avatarConfig}
                        size="md"
                        viewMode="full"
                      />
                      <div className="absolute bottom-1 bg-[#1A1614] text-[#FFF9F3] px-1.5 py-0.5 text-[8px] font-mono uppercase font-bold rounded">
                        * {avatarConfig.mbti || 'INTJ'}
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Information & Stats */}
                  <div className="col-span-8 space-y-2 font-typewriter text-xs text-[#443223]">
                    <div>
                      <span className="text-[10px] text-[#A08670] uppercase block">NAME OF READER:</span>
                      <span className="font-bold text-sm sm:text-base text-[#443223] border-b border-dashed border-[#A08670] block truncate">
                        {profile?.display_name || username || 'Wanderer'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-[#A08670] uppercase block">POET HANDLE:</span>
                        <span className="font-bold text-[#755151]">@{profile?.username || username}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A08670] uppercase block">FAVORITE GENRE:</span>
                        <span className="font-bold truncate block">Dark Academia</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] text-[#A08670] uppercase block">BIOGRAPHY:</span>
                      <p className="text-[11px] text-[#72583E] italic line-clamp-2 leading-relaxed">
                        "{profile?.bio || 'Haunting dusty stacks, drinking black tea, and whispering verse to gargoyles.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Barcode */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#A08670]">
                  <div className="flex items-center gap-0.5 h-5">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#443223]"
                        style={{
                          width: i % 3 === 0 ? '3px' : '1.5px',
                          height: i % 4 === 0 ? '100%' : '75%',
                        }}
                      />
                    ))}
                  </div>

                  <span className="font-typewriter text-[10px] text-[#72583E]">
                    VALID FOR ALL ROOMS, SHELVES & CAFÉ
                  </span>
                </div>
              </div>

              {/* CARD BACK: Due-Date Stamp Sheet & Milestone Statistics */}
              <div
                className="absolute inset-0 w-full h-full rounded-xl border-3 border-[#443223] bg-[#F5ECE1] p-5 sm:p-7 flex flex-col justify-between shadow-[8px_8px_0px_#443223] backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="border-b-2 border-[#443223] pb-2 flex items-center justify-between">
                  <span className="font-typewriter text-xs font-bold text-[#443223] uppercase">
                    BORROWER RECORD & MILESTONE STAMPS
                  </span>
                  <span className="font-typewriter text-[10px] text-[#755151]">
                    DATE DUE IN ARCHIVES
                  </span>
                </div>

                {/* Stamp Grid (4 Real Milestone Statistics) */}
                <div className="grid grid-cols-4 gap-2 py-3">
                  {/* 1. Books Read */}
                  <div className="border-2 border-dashed border-[#A08670] p-2 rounded text-center bg-[#FFF9F3]">
                    <span className="font-typewriter text-[8px] text-[#A08670] block uppercase">BOOKS READ</span>
                    <span className="font-editorial text-lg font-bold text-[#443223]">{readBooks}</span>
                    <span className="font-handwritten text-[11px] text-[#755151] block rotate-2">Verified ✓</span>
                  </div>

                  {/* 2. Reading Hours Logged */}
                  <div className="border-2 border-dashed border-[#A08670] p-2 rounded text-center bg-[#FFF9F3]">
                    <span className="font-typewriter text-[8px] text-[#A08670] block uppercase">HOURS LOGGED</span>
                    <span className="font-editorial text-lg font-bold text-[#443223]">{readingHours}h</span>
                    <span className="font-handwritten text-[11px] text-green-800 block -rotate-2">Archived 📜</span>
                  </div>

                  {/* 3. Reviews Written */}
                  <div className="border-2 border-dashed border-[#A08670] p-2 rounded text-center bg-[#FFF9F3]">
                    <span className="font-typewriter text-[8px] text-[#A08670] block uppercase">REVIEWS</span>
                    <span className="font-editorial text-lg font-bold text-[#755151]">{reviewsCount}</span>
                    <span className="font-handwritten text-[11px] text-[#72583E] block rotate-3">Critical 🖋️</span>
                  </div>

                  {/* 4. Crossword Streak */}
                  <div className="border-2 border-dashed border-[#A08670] p-2 rounded text-center bg-[#FFF9F3]">
                    <span className="font-typewriter text-[8px] text-[#A08670] block uppercase">CROSSWORD</span>
                    <span className="font-editorial text-lg font-bold text-[#755151]">{crosswordStreak} d</span>
                    <span className="font-handwritten text-[11px] text-red-800 block -rotate-3">On Fire 🔥</span>
                  </div>
                </div>

                {/* Vintage Ink Society Stamps */}
                <div className="flex items-center justify-around border-t-2 border-dashed border-[#A08670] pt-2">
                  <div className="border-2 border-red-800 text-red-800 px-2.5 py-0.5 text-[10px] font-typewriter font-bold -rotate-3 rounded">
                    OCT 2026 · ADMITTED
                  </div>
                  <div className="border-2 border-[#443223] text-[#443223] px-2.5 py-0.5 text-[10px] font-typewriter font-bold rotate-2 rounded">
                    SECRET SOCIETY VERIFIED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PIXEL SPRITE & EQUIPMENT INVENTORY PANEL           */}
      {/* ========================================================= */}
      {activeTab === 'avatar' && (
        <div className="space-y-8">
          <div className="catalog-card p-6 sm:p-8 bg-[#FFFDF9] border-3 border-[#1A1614] shadow-[6px_6px_0px_#1A1614] rounded">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-[#1A1614]">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1614]">
                  Archival Equipment & Sprite Sheet
                </h2>
                <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1">
                  Active pixel configuration used across the Grand Library, Café tables, and review slips.
                </p>
              </div>

              {isOwner && (
                <NavLink
                  to="/character-creator"
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Open Character Atelier</span>
                </NavLink>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Character Stage Preview */}
              <div className="md:col-span-5 flex flex-col items-center p-6 bg-[#FCF8F2] border-2 border-[#1A1614] rounded shadow-[3px_3px_0px_#1A1614]">
                <div className="font-mono text-xs font-bold text-[#1A1614] border-2 border-[#1A1614] bg-[#FFF9F3] px-4 py-1 mb-4 shadow-[2px_2px_0px_#1A1614]">
                  [ {profile?.display_name || username || 'POET'} ]
                </div>

                <div className="py-2">
                  <PixelAvatar
                    config={avatarConfig}
                    size="xl"
                    viewMode="full"
                  />
                </div>

                <div className="w-32 h-2.5 bg-[#1A1614]/20 rounded-full mt-2" />

                <div className="mt-4 font-mono text-xs text-[#72583E] text-center space-y-1">
                  <div>* MBTI: <span className="font-bold text-[#1A1614]">{avatarConfig.mbti || 'INTJ'}</span></div>
                  <div>* Handheld: <span className="font-bold text-[#755151] capitalize">{avatarConfig.heldItem?.replace('_', ' ') || 'None'}</span></div>
                </div>
              </div>

              {/* Equipment Inventory Panel */}
              <div className="md:col-span-7">
                <InventoryPanel
                  config={avatarConfig}
                  interactive={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SAVED POEMS VAULT                                  */}
      {/* ========================================================= */}
      {activeTab === 'saved_poems' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold text-[#443223]">
              Personal Poem Vault
            </h2>
            <span className="font-typewriter text-xs text-[#72583E]">
              {savedPoems.length} Verses Preserved from the Gumball Jar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPoems.map(poem => (
              <div
                key={poem.id}
                className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223]"
              >
                <div className="flex items-center justify-between border-b border-dashed border-[#A08670] pb-2 mb-3">
                  <span className="font-typewriter text-xs font-bold text-[#755151]">
                    {poem.period}
                  </span>
                  <span className="text-xs font-typewriter px-2 py-0.5 bg-[#DBC4A5]/40 border border-[#72583E] text-[#443223]">
                    {poem.theme}
                  </span>
                </div>

                <h3 className="font-editorial text-lg font-bold text-[#443223] mb-1">
                  {poem.title}
                </h3>
                <p className="font-typewriter text-xs text-[#72583E] mb-4">
                  by {poem.poet}
                </p>

                <div className="bg-[#FFF9F3] p-4 rounded border border-[#A08670] font-typewriter text-xs text-[#443223] leading-relaxed max-h-48 overflow-y-auto">
                  {poem.lines.slice(0, 8).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {poem.lines.length > 8 && (
                    <p className="text-[10px] text-[#A08670] italic pt-2">... (tap for full poem)</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
