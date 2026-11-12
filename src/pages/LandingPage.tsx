import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book } from '../types/book';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { BookCoverImage } from '../components/books/BookCoverImage';
import { SanctuaryHero } from '../components/home/SanctuaryHero';
import { soundEngine } from '../lib/audioEngine';
import { useAuth } from '../context/AuthContext';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { ClubhousePoemCurio } from '../components/clubhouse/ClubhousePoemCurio';
import {
  BookOpen,
  Coffee,
  Grid3X3,
  Feather,
  Sparkles,
  ArrowRight,
  Bookmark,
  Quote,
  Star,
  Flame,
  Heart,
  Users,
  Clock,
  TrendingUp,
  MessageCircle,
  Mail,
  Palette,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GenreArtworkPoetry,
  GenreArtworkPhilosophy,
  GenreArtworkRomance,
  GenreArtworkMystery,
  GenreArtworkClassics,
  GenreArtworkFantasy,
  GenreArtworkLiteraryFiction,
} from '../components/landing/GenreArtwork';

interface ResidentFellow {
  id: string;
  name: string;
  book: string;
  location: string;
  whisper: string;
  avatar: any;
}

const RESIDENT_FELLOWS: ResidentFellow[] = [
  {
    id: 'eleanor_v',
    name: 'Eleanor Vance',
    book: 'Emma by Jane Austen',
    location: 'Fireplace Wing',
    whisper: '“Emma is behaving terribly again today. Naturally, I approve of everything she does.”',
    avatar: {
      skinTone: '#FFF0E5',
      hairStyle: 'classic_bob',
      hairColor: '#443223',
      accessories: ['round_spectacles'],
    },
  },
  {
    id: 'julian_m',
    name: 'Julian Morrow',
    book: 'The Secret History by Donna Tartt',
    location: 'Classics Desk',
    whisper: '“Greek syntax clarifies the mind; strong black tea keeps the hands from trembling.”',
    avatar: {
      skinTone: '#EAD4BA',
      hairStyle: 'shaggy_mess',
      hairColor: '#1A1614',
      accessories: ['wire_rims'],
    },
  },
  {
    id: 'beatrix_k',
    name: 'Beatrix Keene',
    book: 'Wuthering Heights by Emily Brontë',
    location: 'Window Bay',
    whisper: '“If you listen to the draft under the library sill, it sounds almost like heath wind.”',
    avatar: {
      skinTone: '#D4AA7D',
      hairStyle: 'wavy_locks',
      hairColor: '#8D3F37',
      accessories: ['french_beret'],
    },
  },
  {
    id: 'theodore_p',
    name: 'Theodore Finch',
    book: 'Crime and Punishment by Fyodor Dostoevsky',
    location: 'Under the Clock',
    whisper: '“I have dog-eared twenty pages already. The Welton archivist will banish me if she finds out.”',
    avatar: {
      skinTone: '#EAD4BA',
      hairStyle: 'side_part',
      hairColor: '#72583E',
      accessories: ['round_spectacles'],
    },
  },
];

const CLUB_EPIGRAPHS = [
  {
    quote: 'Words can be like X-rays if you use them properly—they’ll go through anything. You read and you’re pierced.',
    author: 'Aldous Huxley',
  },
  {
    quote: 'I have lived that moment already, in an older book whose title I have completely forgotten.',
    author: 'Jorge Luis Borges',
  },
  {
    quote: 'We read to know we are not alone. Even when the corridors are silent.',
    author: 'C.S. Lewis',
  },
];

const GENRE_COLLECTIONS = [
  {
    name: 'Poetry',
    accentColor: '#6E3E44',
    bgColor: '#FAF2EE',
    textColor: '#572E2E',
    patternStyle: 'radial-gradient(circle, #6E3E44 0.75px, transparent 0.75px)',
    Artwork: GenreArtworkPoetry,
    quote: '“Words and ideas can change the world.”',
    motif: 'Keats · Dickinson · Whitman',
    count: 18,
    borderStyle: 'border-[#6E3E44]',
  },
  {
    name: 'Philosophy',
    accentColor: '#3A4435',
    bgColor: '#EFF2EC',
    textColor: '#252D21',
    patternStyle: 'linear-gradient(135deg, rgba(58, 68, 53, 0.08) 25%, transparent 25%)',
    Artwork: GenreArtworkPhilosophy,
    quote: '“One must imagine Sisyphus happy.”',
    motif: 'Camus · Aurelius · Dostoevsky',
    count: 24,
    borderStyle: 'border-[#3A4435]',
  },
  {
    name: 'Romance',
    accentColor: '#755151',
    bgColor: '#FAF0F2',
    textColor: '#5E2835',
    patternStyle: 'radial-gradient(ellipse at top, rgba(117, 81, 81, 0.12), transparent 70%)',
    Artwork: GenreArtworkRomance,
    quote: '“Whatever our souls are made of, his and mine are the same.”',
    motif: 'Austen · Brontë · Miller',
    count: 22,
    borderStyle: 'border-[#755151]',
  },
  {
    name: 'Mystery & Thriller',
    accentColor: '#1E2D3D',
    bgColor: '#EEF2F7',
    textColor: '#152130',
    patternStyle: 'repeating-linear-gradient(45deg, rgba(30, 45, 61, 0.05) 0, rgba(30, 45, 61, 0.05) 1px, transparent 0, transparent 12px)',
    Artwork: GenreArtworkMystery,
    quote: '“Pain and suffering are always inevitable for a deep heart.”',
    motif: 'Tartt · Rio · Zafón',
    count: 29,
    borderStyle: 'border-[#1E2D3D]',
  },
  {
    name: 'Classics',
    accentColor: '#543B27',
    bgColor: '#F8F4EE',
    textColor: '#362316',
    patternStyle: 'radial-gradient(circle, rgba(84, 59, 39, 0.08) 1px, transparent 1px)',
    Artwork: GenreArtworkClassics,
    quote: '“I am no bird; and no net ensnares me.”',
    motif: 'Shelley · Wilde · Hugo',
    count: 42,
    borderStyle: 'border-[#543B27]',
  },
  {
    name: 'Fantasy',
    accentColor: '#4B3A5C',
    bgColor: '#F4F0F7',
    textColor: '#382845',
    patternStyle: 'radial-gradient(circle at 80% 20%, rgba(75, 58, 92, 0.15), transparent 60%)',
    Artwork: GenreArtworkFantasy,
    quote: '“We are all stardust and stories.”',
    motif: 'Clarke · Morgenstern · Kuang',
    count: 21,
    borderStyle: 'border-[#4B3A5C]',
  },
  {
    name: 'Literary Fiction',
    accentColor: '#6E7056',
    bgColor: '#F1F1E9',
    textColor: '#333425',
    patternStyle: 'linear-gradient(to right, rgba(110, 112, 86, 0.08) 1px, transparent 1px)',
    Artwork: GenreArtworkLiteraryFiction,
    quote: '“Life is not a series of gig lamps; it is a luminous halo.”',
    motif: 'Woolf · Murakami · Ishiguro',
    count: 36,
    borderStyle: 'border-[#6E7056]',
  },
];

type CuratedCollectionKey =
  | 'editors_picks'
  | 'new_additions'
  | 'classics'
  | 'poetry'
  | 'philosophy'
  | 'romance'
  | 'mystery'
  | 'community_favourites';

const CURATED_COLLECTIONS: { key: CuratedCollectionKey; label: string }[] = [
  { key: 'editors_picks', label: "Curators' Picks" },
  { key: 'classics', label: 'Classics' },
  { key: 'poetry', label: 'Poetry' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'mystery', label: 'Dark Academia & Mystery' },
  { key: 'romance', label: 'Romance' },
  { key: 'community_favourites', label: 'Most Shelved' },
];

export const LandingPage: React.FC = () => {
  const { user, profile, shelves } = useAuth();
  const [shelfMode, setShelfMode] = useState<'suggested' | 'top'>('suggested');
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<CuratedCollectionKey>('editors_picks');
  const [modalBook, setModalBook] = useState<Book | null>(null);

  const [activeWhisperFellow, setActiveWhisperFellow] = useState<ResidentFellow | null>(null);
  const [epigraphIndex, setEpigraphIndex] = useState(0);
  const [isNoteUnfolded, setIsNoteUnfolded] = useState(false);

  // Group shelves for Atrium Desk Folio
  const currentlyReadingShelves = shelves.filter(s => s.status === 'currently_reading');
  const readShelves = shelves.filter(s => s.status === 'read');
  const deskBook = currentlyReadingShelves.length > 0
    ? SEED_BOOKS.find(b => b.id === currentlyReadingShelves[0].book_id) || SEED_BOOKS[0]
    : SEED_BOOKS[0];

  const readingGoal = profile?.reading_goal || 12;
  const booksRead = readShelves.length;
  const goalPercentage = Math.min(100, Math.round((booksRead / readingGoal) * 100));

  const handleFellowClick = (fellow: ResidentFellow) => {
    soundEngine.playClick();
    if (activeWhisperFellow?.id === fellow.id) {
      setActiveWhisperFellow(null);
    } else {
      setActiveWhisperFellow(fellow);
    }
  };

  const handleCycleEpigraph = () => {
    soundEngine.playPageTurn();
    setEpigraphIndex(prev => (prev + 1) % CLUB_EPIGRAPHS.length);
  };

  const currentEpigraph = CLUB_EPIGRAPHS[epigraphIndex];

  const shelfBooks = shelfMode === 'suggested' ? SEED_BOOKS.slice(0, 10) : SEED_BOOKS.slice(4, 14);
  const activeBook = shelfBooks[selectedBookIndex] || shelfBooks[0];

  const collectionBooks = SEED_BOOKS.filter(b => {
    if (b.homepage_collections?.includes(selectedCollection)) return true;
    if (selectedCollection === 'poetry' && b.genres.includes('Poetry')) return true;
    if (selectedCollection === 'classics' && b.genres.includes('Classics')) return true;
    if (selectedCollection === 'philosophy' && b.genres.includes('Philosophy')) return true;
    if (selectedCollection === 'romance' && b.genres.includes('Romance')) return true;
    if (selectedCollection === 'mystery' && (b.genres.includes('Mystery') || b.genres.includes('Dark Academia'))) return true;
    return false;
  }).slice(0, 4);

  const spineColors = ['#4B3227', '#6E543B', '#6E3E44', '#2E2118', '#58412F', '#3A4435', '#233242', '#7A4950'];
  const featuredBook = SEED_BOOKS[0];

  const handleSelectSpine = (idx: number) => {
    soundEngine.playPageTurn();
    setSelectedBookIndex(idx);
  };

  return (
    <div className="min-h-screen text-[#2E2118] pb-20">
      {/* 1. UNIFIED FIRST-SCREEN SANCTUARY ENTRANCE */}
      <SanctuaryHero />

      {/* 2. THE ATRIUM: CENTRAL COMMON ROOM */}
      <section id="atrium-hall" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16 border-b border-[#B59C84]/40 space-y-8">
        {/* Atrium Header & Identity Badge */}
        <div className="border-b border-[#B59C84]/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Active Pixel Avatar Stamp */}
            <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg border-2 border-[#2E2118] bg-[#FAF3E8] flex flex-col items-center justify-center p-1 shadow-[2px_2px_0px_#2E2118] relative flex-shrink-0 group">
              <PixelAvatar
                config={profile?.avatar_config}
                size="sm"
                viewMode="full"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-[#2E2118] absolute -bottom-1 -right-1" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#6E3E44]/10 border border-[#6E3E44]/30 mb-1.5 text-xs font-mono text-[#6E3E44]">
                <Sparkles className="w-3.5 h-3.5 text-[#6E3E44]" />
                <span>The Atrium · Central Common Room</span>
              </div>
              <h2 className="type-section-title text-[#2E2118]">
                Greetings, {profile?.display_name || user?.username || 'Fellow Reader'}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#684F38] mt-1 max-w-xl">
                The central common space of the Dead Poets Club. Resident fellows lingering, an open desk folio, and the parlor Poem Jar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <NavLink
              to="/character-creator"
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Character Atelier</span>
            </NavLink>
            <NavLink
              to="/cafe"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Enter Cafeteria</span>
            </NavLink>
          </div>
        </div>

        {/* Resident Fellows Lingering in the Atrium */}
        <div className="catalog-card p-5 sm:p-6 bg-[#FCF8F2] border-2 border-[#2E2118] shadow-[4px_4px_0px_#2E2118] rounded space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-dashed border-[#B59C84]/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6E3E44]" />
              <h3 className="font-editorial text-2xl font-normal text-[#2E2118]">
                Fellows Lingering in The Atrium
              </h3>
            </div>
            <span className="text-xs font-mono text-[#4A6B53] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Hearth warm · 5 fellows seated</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* User Member Card */}
            <div className="p-3.5 rounded bg-[#F7EFE3] border border-[#B59C84] flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-[#2E2118] bg-[#FAF3E8] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                  <PixelAvatar
                    config={profile?.avatar_config}
                    size="xs"
                    viewMode="bust"
                  />
                  <span className="w-2 h-2 rounded-full bg-green-500 border border-[#2E2118] absolute bottom-0 right-0" />
                </div>
                <div className="truncate min-w-0">
                  <span className="font-sans text-xs font-semibold text-[#2E2118] block truncate">
                    {profile?.display_name || user?.username || 'You'} (You)
                  </span>
                  <span className="text-[11px] font-mono text-[#6E3E44] block truncate">
                    * At desk folio
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#B59C84]/40 flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#4A6B53] border border-[#4A6B53]/40 px-1.5 py-0.5 rounded font-bold">
                  SEATED
                </span>
                <NavLink
                  to="/shelves"
                  className="text-[11px] font-sans text-[#6E3E44] hover:underline font-medium"
                >
                  My Shelf →
                </NavLink>
              </div>
            </div>

            {/* Resident NPC Fellows */}
            {RESIDENT_FELLOWS.map(fellow => {
              const isSelected = activeWhisperFellow?.id === fellow.id;
              return (
                <button
                  key={fellow.id}
                  type="button"
                  onClick={() => handleFellowClick(fellow)}
                  className={`p-3.5 rounded text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#EFE2CF] border-[#2E2118] shadow-[2px_2px_0px_#2E2118] ring-1 ring-[#6E3E44]'
                      : 'bg-[#FDF9F3] border-[#B59C84] hover:border-[#2E2118] hover:bg-[#F7EFE3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-[#2E2118] bg-[#FAF3E8] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      <PixelAvatar
                        config={fellow.avatar}
                        size="xs"
                        viewMode="bust"
                      />
                      <span className="w-2 h-2 rounded-full bg-green-500 border border-[#2E2118] absolute bottom-0 right-0" />
                    </div>
                    <div className="truncate min-w-0">
                      <span className="font-sans text-xs font-semibold text-[#2E2118] block truncate">
                        {fellow.name}
                      </span>
                      <span className="text-[11px] font-sans text-[#72583E] block truncate">
                        {fellow.book}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#B59C84]/30 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#8C7158] uppercase">
                      {fellow.location}
                    </span>
                    <span className="font-mono text-[#6E3E44] flex items-center gap-0.5 font-medium">
                      <MessageCircle className="w-3 h-3" />
                      <span>{isSelected ? 'Listening' : 'Whisper'}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Whisper Balloon */}
          <AnimatePresence>
            {activeWhisperFellow && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded bg-[#FAF3E8] border-2 border-[#2E2118] shadow-[3px_3px_0px_#2E2118] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6E3E44] text-[#FAF3E8] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-semibold text-[#2E2118]">
                        {activeWhisperFellow.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#72583E]">
                        · Reading {activeWhisperFellow.book}
                      </span>
                    </div>
                    <p className="font-editorial text-base sm:text-lg italic text-[#2E2118] mt-1 leading-snug">
                      {activeWhisperFellow.whisper}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <NavLink
                    to={`/profile/${activeWhisperFellow.id}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    View Passport
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => setActiveWhisperFellow(null)}
                    className="p-1 rounded text-[#72583E] hover:text-[#2E2118] cursor-pointer"
                    title="Close whisper"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Core Atrium Highlights: Desk Folio & The Parlor Poem Jar Curio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: On Your Desk Right Now */}
          <div className="lg:col-span-7 catalog-card p-6 sm:p-7 bg-[#FCF8F2] border-2 border-[#2E2118] shadow-[4px_4px_0px_#2E2118] rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#B59C84]/40">
                <span className="text-xs font-mono tracking-widest text-[#6E3E44] uppercase font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6E3E44]" /> On Your Desk Right Now
                </span>
                <span className="text-xs font-mono text-[#4A6B53] bg-[#4A6B53]/10 px-2.5 py-0.5 rounded-full border border-[#4A6B53]/30 font-semibold">
                  Active Reading
                </span>
              </div>

              {deskBook ? (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div
                    onClick={() => setModalBook(deskBook)}
                    className="w-32 h-48 sm:w-36 sm:h-52 flex-shrink-0 cursor-pointer shadow-md rounded overflow-hidden border-2 border-[#2E2118]"
                  >
                    <BookCoverImage
                      book={deskBook}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3
                        onClick={() => setModalBook(deskBook)}
                        className="font-editorial text-2xl sm:text-3xl font-normal text-[#2E2118] hover:text-[#6E3E44] transition-colors cursor-pointer"
                      >
                        {deskBook.title}
                      </h3>
                      <p className="font-sans text-sm text-[#6E3E44] mt-1 font-semibold">
                        {deskBook.author} <span className="font-mono text-xs font-normal text-[#72583E]">· {deskBook.publication_year}</span>
                      </p>
                      <p className="font-sans text-xs text-[#684F38] mt-3 line-clamp-3 leading-relaxed">
                        {deskBook.description}
                      </p>
                    </div>

                    {deskBook.quote && (
                      <div className="mt-4 p-3 rounded bg-[#FAF3E8] border-l-3 border-[#6E3E44] text-sm sm:text-base font-editorial italic text-[#2E2118]">
                        &ldquo;{deskBook.quote.text}&rdquo;
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-[#B59C84]/40 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setModalBook(deskBook)}
                        className="text-xs font-sans font-semibold text-[#6E3E44] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        View Dossier &amp; Shelves <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono text-[#8C7158]">
                        {deskBook.pages} pages
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 text-[#6E3E44]/50 mx-auto mb-3" />
                  <p className="font-editorial text-xl font-normal text-[#2E2118]">No book currently on your desk.</p>
                  <NavLink to="/library" className="btn-primary text-xs mt-3 inline-flex">
                    Choose a Book from the Stacks
                  </NavLink>
                </div>
              )}
            </div>

            {/* Reading Goal Progress Footer */}
            <div className="mt-6 pt-5 border-t border-[#B59C84]/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6E3E44] font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Reading Goal
                </span>
                <span className="text-xs font-mono font-semibold text-[#2E2118]">
                  {booksRead} of {readingGoal} books ({goalPercentage}%)
                </span>
              </div>

              <div className="w-full bg-[#EFE2CF] h-2.5 rounded-full overflow-hidden border border-[#B59C84]">
                <div
                  className="bg-gradient-to-r from-[#6E3E44] via-[#A05C54] to-[#4A6B53] h-full rounded-full transition-all duration-700"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: The Embedded Parlor Poem Jar Curio */}
          <div className="lg:col-span-5">
            <ClubhousePoemCurio />
          </div>
        </div>

        {/* Discoveries: Epigraph & Secret Archival Note */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Epigraph */}
          <div className="md:col-span-7 p-5 rounded bg-[#FCF8F2] border-2 border-[#2E2118] shadow-[3px_3px_0px_#2E2118] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E3E44] font-bold flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5" /> Club Epigraph
                </span>
                <button
                  type="button"
                  onClick={handleCycleEpigraph}
                  className="text-[11px] font-mono text-[#6E3E44] hover:underline transition-colors cursor-pointer font-semibold"
                  title="Cycle epigraph"
                >
                  Next Thought →
                </button>
              </div>
              <p className="font-editorial text-lg sm:text-xl italic text-[#2E2118] leading-relaxed">
                &ldquo;{currentEpigraph.quote}&rdquo;
              </p>
            </div>
            <p className="text-xs font-sans text-[#72583E] mt-3 font-medium">
              — {currentEpigraph.author}
            </p>
          </div>

          {/* Hidden Archival Note Slip #1889 */}
          <div className="md:col-span-5 p-5 rounded bg-[#FCF8F2] border-2 border-dashed border-[#6E3E44] shadow-[3px_3px_0px_#2E2118] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E3E44] font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Archive Floor Lore
                </span>
                <span className="text-[9px] font-mono text-[#8C7158] font-bold">SLIP #1889</span>
              </div>

              {isNoteUnfolded ? (
                <div className="space-y-2 mt-2">
                  <p className="font-editorial italic text-base text-[#2E2118] leading-relaxed">
                    &ldquo;A secret society is not formed to hide from the world, but to preserve what the noisy streets forgot how to love.&rdquo;
                  </p>
                  <p className="text-[11px] font-mono text-[#6E3E44]">
                    — Pinned behind the third floor bookshelf, Welton
                  </p>
                </div>
              ) : (
                <p className="font-sans text-xs text-[#684F38] mt-1 leading-relaxed">
                  A folded piece of cream parchment sits tucked inside a leather folio on the Atrium reading desk.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playPageTurn();
                setIsNoteUnfolded(prev => !prev);
              }}
              className="text-xs font-sans text-[#6E3E44] hover:underline self-start pt-3 font-semibold cursor-pointer"
            >
              {isNoteUnfolded ? 'Fold Note Back' : 'Unfold Archival Note →'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. THE GRAND BOOKSHELF */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-b border-[#B59C84]/50">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="type-section-title text-[#2E2118]">
            The Grand Bookshelf
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShelfMode('suggested');
                setSelectedBookIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded font-sans text-xs font-semibold border-2 transition-all cursor-pointer ${
                shelfMode === 'suggested'
                  ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118] shadow-[2px_2px_0px_#2E2118]'
                  : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84] hover:border-[#2E2118]'
              }`}
            >
              Tonight&apos;s Stack
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShelfMode('top');
                setSelectedBookIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded font-sans text-xs font-semibold border-2 transition-all cursor-pointer ${
                shelfMode === 'top'
                  ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118] shadow-[2px_2px_0px_#2E2118]'
                  : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84] hover:border-[#2E2118]'
              }`}
            >
              Most Dog-Eared
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          {/* Accessible Book Spines on Wooden Ledge */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              className="w-full flex items-end justify-start sm:justify-center gap-1.5 sm:gap-2.5 px-3 pt-14 pb-0 overflow-x-auto select-none"
              role="group"
              aria-label="Bookshelf spines"
            >
              {shelfBooks.map((book, idx) => {
                const isSelected = selectedBookIndex === idx;
                const spineColor = spineColors[idx % spineColors.length];
                const height = 215 + (idx % 4) * 16;

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectSpine(idx)}
                    aria-pressed={isSelected}
                    aria-label={`Inspect ${book.title} by ${book.author}`}
                    className={`book-spine flex-shrink-0 w-10 sm:w-11 px-1.5 py-3 flex items-center justify-between text-[#FAF3E8] relative font-editorial ${
                      isSelected ? 'active' : ''
                    }`}
                    style={{
                      height: `${height}px`,
                      backgroundColor: spineColor,
                    }}
                  >
                    <span className="w-full h-1 bg-[#DFC9AA]/55 mb-2 block" />
                    <span className="text-[13px] font-normal tracking-wide line-clamp-1 truncate">
                      {book.title}
                    </span>
                    <span className="font-mono text-[9px] text-[#DFC9AA] truncate opacity-85">
                      {book.author}
                    </span>
                    <span className="w-full h-1 bg-[#DFC9AA]/55 mt-2 block" />
                  </button>
                );
              })}
            </div>

            <div className="wooden-shelf w-full h-8 rounded-b-md" />
          </div>

          {/* Pulled Book Reveal */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {activeBook && (
                <motion.div
                  key={activeBook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="catalog-card p-6 bg-[#FCF7EE]"
                >
                  <div className="flex gap-5">
                    <div className="w-28 sm:w-32 flex-shrink-0">
                      <BookCoverImage book={activeBook} className="w-full" priority={true} />
                    </div>

                    <div className="flex flex-col justify-between min-w-0">
                      <div>
                        <span className="font-mono text-[10px] font-medium text-[#6E3E44] uppercase tracking-wider">
                          {activeBook.genres[0]}
                        </span>
                        <h3 className="font-editorial text-2xl text-[#2E2118] leading-snug mt-0.5">
                          {activeBook.title}
                        </h3>
                        <p className="font-mono text-xs text-[#684F38] mt-1">
                          {activeBook.author} · {activeBook.publication_year}
                        </p>

                        <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-[#6E3E44] mt-2">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{activeBook.rating_avg}</span>
                        </div>
                      </div>

                      {activeBook.quote && (
                        <p className="font-handwritten text-xl text-[#684F38] leading-snug mt-3 line-clamp-2">
                          “{activeBook.quote.text}”
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-dashed border-[#B59C84]">
                    <button
                      type="button"
                      onClick={() => setModalBook(activeBook)}
                      className="btn-primary text-xs py-2 px-4 flex-1 justify-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Dossier</span>
                    </button>
                    <NavLink
                      to={`/reviews?bookId=${activeBook.id}`}
                      className="btn-secondary text-xs py-2 px-3.5"
                    >
                      Reviews
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. BOOK OF THE MONTH — EDITORIAL SPREAD */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-b border-[#B59C84]/50">
        <div className="catalog-card p-6 sm:p-10 lg:p-12 bg-[#FAF4EB] relative">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider bg-[#6E3E44] text-[#FAF3E8] px-3 py-1 border border-[#2E2118] shadow-[2px_2px_0px_#2E2118] inline-block mb-6">
            Book of the Month
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-44 sm:w-52 shadow-2xl">
                <BookCoverImage book={featuredBook} className="w-full" priority={true} />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div>
                <h2 className="type-page-title text-[#2E2118]">
                  {featuredBook.title}
                </h2>
                <p className="font-mono text-xs sm:text-sm text-[#6E3E44] mt-1.5">
                  {featuredBook.author} · {featuredBook.publication_year}
                </p>
              </div>

              {featuredBook.quote && (
                <blockquote className="pl-4 border-l-3 border-[#6E3E44] font-handwritten text-2xl text-[#2E2118]">
                  “{featuredBook.quote.text}”
                </blockquote>
              )}

              <p className="font-sans text-sm sm:text-base text-[#58432D] leading-relaxed max-w-2xl line-clamp-2">
                {featuredBook.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalBook(featuredBook)}
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Inspect Volume</span>
                </button>

                <NavLink
                  to="/authors?author=Donna%20Tartt"
                  className="font-sans text-xs font-semibold text-[#6E3E44] hover:underline underline-offset-4 px-2 py-2"
                >
                  Author Spotlight →
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED SHELVES & CHAPTERS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-b border-[#B59C84]/50 space-y-14">
        {/* Curated Shelves */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 className="type-section-title text-[#2E2118]">
              Curated Shelves
            </h2>
            <NavLink
              to="/library"
              className="font-sans text-xs font-semibold text-[#6E3E44] hover:underline underline-offset-4"
            >
              View full catalogue →
            </NavLink>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
            {CURATED_COLLECTIONS.map(col => {
              const isSelected = selectedCollection === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCollection(col.key);
                  }}
                  className={`px-3.5 py-1.5 rounded font-sans text-xs font-semibold transition-all border-2 cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118] shadow-[2px_2px_0px_#2E2118]'
                      : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84] hover:border-[#2E2118]'
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {collectionBooks.map(book => (
              <button
                key={book.id}
                type="button"
                onClick={() => setModalBook(book)}
                className="catalog-card p-4 text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="w-full mb-3 rounded overflow-hidden border border-[#2E2118]">
                  <BookCoverImage book={book} className="w-full" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg text-[#2E2118] group-hover:text-[#6E3E44] transition-colors leading-snug line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="font-mono text-xs text-[#684F38] mt-0.5 truncate">
                    {book.author}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Genre Collections — Distinct Visual Identities */}
        <div className="pt-8 border-t-2 border-dashed border-[#B59C84]/60">
          <div className="pb-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-semibold text-[#6E3E44] uppercase tracking-wider">
                GENRE ARCHIVES · DISTINCT IDENTITIES
              </span>
              <span className="font-handwritten text-base text-[#6E3E44] italic">
                “Every genre carries its own soul”
              </span>
            </div>
            <h2 className="type-section-title text-[#2E2118]">
              Distinct Illustrated Chapters
            </h2>
            <p className="font-sans text-xs text-[#684F38] mt-1 max-w-2xl">
              Vertical bookmark panels with bespoke textures, motifs, and abstract editorial artworks. Select any genre to open its complete collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {GENRE_COLLECTIONS.map(g => {
              const ArtworkComponent = g.Artwork;
              return (
                <NavLink
                  key={g.name}
                  to={`/library?genre=${encodeURIComponent(g.name)}`}
                  className="group p-3.5 rounded-lg flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:-translate-y-2 text-decoration-none border-2 border-[#2E2118] shadow-[3px_3px_0px_#2E2118] relative overflow-hidden"
                  style={{
                    backgroundColor: g.bgColor,
                    backgroundImage: g.patternStyle,
                  }}
                >
                  {/* Top Label Bookmark Stamp */}
                  <div
                    className="w-full py-1 px-2 text-center rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: g.accentColor }}
                  >
                    {g.name}
                  </div>

                  {/* Central Bespoke Abstract Artwork & Quote */}
                  <div className="py-2 text-center flex flex-col items-center flex-1 justify-center">
                    <div className="my-2 group-hover:scale-108 transition-transform duration-300">
                      <ArtworkComponent className="w-20 h-20" />
                    </div>

                    <h3
                      className="font-editorial text-lg leading-tight mb-1 mt-1"
                      style={{ color: g.textColor }}
                    >
                      {g.name}
                    </h3>

                    <p className="font-editorial italic text-xs leading-snug opacity-90 px-1 text-[#2E2118]">
                      {g.quote}
                    </p>
                  </div>

                  {/* Bottom Author Tagline & Volumes */}
                  <div className="pt-2 border-t border-dashed border-[#2E2118]/25 text-center mt-auto">
                    <span className="font-mono text-[9px] text-[#2E2118]/75 block truncate">
                      {g.motif}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#2E2118] block mt-1">
                      {g.count} Volumes →
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. OTHER ROOMS IN THE SANCTUARY */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavLink
            to="/cafe"
            className="catalog-card p-6 flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <Coffee className="w-5 h-5 text-[#6E3E44] mb-3" />
              <h3 className="font-editorial text-2xl text-[#2E2118] mb-1.5">
                The Cafeteria
              </h3>
              <p className="font-sans text-sm text-[#684F38]">
                A 2D pixel-art focus lounge with ambient hearth soundscapes, quiet co-presence, and study timers.
              </p>
            </div>
            <span className="font-sans text-xs font-semibold text-[#6E3E44] flex items-center gap-1.5 pt-4 mt-4 border-t border-dashed border-[#B59C84]">
              Take a Seat at a Desk <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          <NavLink
            to="/margins"
            className="catalog-card p-6 flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <Feather className="w-5 h-5 text-[#543B27] mb-3" />
              <h3 className="font-editorial text-2xl text-[#2E2118] mb-1.5">
                Community &amp; Margins
              </h3>
              <p className="font-sans text-sm text-[#684F38]">
                Unmailed letters, dog-eared confessions, and ink on the edges.
              </p>
            </div>
            <span className="font-sans text-xs font-semibold text-[#6E3E44] flex items-center gap-1.5 pt-4 mt-4 border-t border-dashed border-[#B59C84]">
              Read Community Letters <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          <NavLink
            to="/crossword"
            className="catalog-card p-6 flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <Grid3X3 className="w-5 h-5 text-[#3A4435] mb-3" />
              <h3 className="font-editorial text-2xl text-[#2E2118] mb-1.5">
                Daily Crossword
              </h3>
              <p className="font-sans text-sm text-[#684F38]">
                Ten by ten squares of literary trivia over morning tea.
              </p>
            </div>
            <span className="font-sans text-xs font-semibold text-[#6E3E44] flex items-center gap-1.5 pt-4 mt-4 border-t border-dashed border-[#B59C84]">
              Solve today&apos;s grid <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>
        </div>
      </section>

      {modalBook && (
        <BookDetailModal
          book={modalBook}
          isOpen={!!modalBook}
          onClose={() => setModalBook(null)}
        />
      )}
    </div>
  );
};
