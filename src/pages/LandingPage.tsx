import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book } from '../types/book';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { BookCoverImage } from '../components/books/BookCoverImage';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
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
  ScrollText,
  User,
  Heart,
  Share2,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrapbookQuoteCard, ScrapbookCardData, SCRAPBOOK_THEMES } from '../components/books/ScrapbookQuoteCard';

// 5. Distinct Visual Genre Panels (Section 5 Specification)
const GENRE_COLLECTIONS = [
  {
    name: 'Poetry',
    accentColor: '#755151',
    bgColor: '#FAF2EE',
    textColor: '#572E2E',
    patternStyle: 'radial-gradient(circle, #755151 0.75px, transparent 0.75px)',
    icon: Feather,
    quote: '“Words and ideas can change the world.”',
    motif: 'Keats · Dickinson · Whitman',
    count: 18,
    borderStyle: 'border-[#755151]',
  },
  {
    name: 'Philosophy',
    accentColor: '#44422D',
    bgColor: '#F3F4EE',
    textColor: '#333221',
    patternStyle: 'linear-gradient(135deg, rgba(68, 66, 45, 0.08) 25%, transparent 25%)',
    icon: Quote,
    quote: '“One must imagine Sisyphus happy.”',
    motif: 'Camus · Aurelius · Dostoevsky',
    count: 24,
    borderStyle: 'border-[#44422D]',
  },
  {
    name: 'Romance',
    accentColor: '#8C4F5E',
    bgColor: '#FAF0F2',
    textColor: '#5E2835',
    patternStyle: 'radial-gradient(ellipse at top, rgba(140, 79, 94, 0.12), transparent 70%)',
    icon: Heart,
    quote: '“Whatever our souls are made of, his and mine are the same.”',
    motif: 'Austen · Brontë · Miller',
    count: 22,
    borderStyle: 'border-[#8C4F5E]',
  },
  {
    name: 'Mystery & Thriller',
    accentColor: '#1D2A3A',
    bgColor: '#EEF2F7',
    textColor: '#152130',
    patternStyle: 'repeating-linear-gradient(45deg, rgba(29, 42, 58, 0.05) 0, rgba(29, 42, 58, 0.05) 1px, transparent 0, transparent 12px)',
    icon: Flame,
    quote: '“Pain and suffering are always inevitable for a deep heart.”',
    motif: 'Tartt · Rio · Zafón',
    count: 29,
    borderStyle: 'border-[#1D2A3A]',
  },
  {
    name: 'Classics',
    accentColor: '#443223',
    bgColor: '#F8F4EE',
    textColor: '#362316',
    patternStyle: 'radial-gradient(circle, rgba(68, 50, 35, 0.08) 1px, transparent 1px)',
    icon: BookOpen,
    quote: '“I am no bird; and no net ensnares me.”',
    motif: 'Shelley · Wilde · Hugo',
    count: 42,
    borderStyle: 'border-[#443223]',
  },
  {
    name: 'Fantasy',
    accentColor: '#4D3C5C',
    bgColor: '#F4F0F7',
    textColor: '#382845',
    patternStyle: 'radial-gradient(circle at 80% 20%, rgba(77, 60, 92, 0.15), transparent 60%)',
    icon: Sparkles,
    quote: '“We are all stardust and stories.”',
    motif: 'Clarke · Morgenstern · Kuang',
    count: 21,
    borderStyle: 'border-[#4D3C5C]',
  },
  {
    name: 'Literary Fiction',
    accentColor: '#7C7960',
    bgColor: '#F5F5ED',
    textColor: '#403E2E',
    patternStyle: 'linear-gradient(to right, rgba(124, 121, 96, 0.08) 1px, transparent 1px)',
    icon: Bookmark,
    quote: '“Life is not a series of gig lamps; it is a luminous halo.”',
    motif: 'Woolf · Murakami · Ishiguro',
    count: 36,
    borderStyle: 'border-[#7C7960]',
  },
];

// Curated Collection Tabs (Section 4 Specification)
type CuratedCollectionKey =
  | 'editors_picks'
  | 'new_additions'
  | 'classics'
  | 'poetry'
  | 'philosophy'
  | 'romance'
  | 'mystery'
  | 'community_favourites';

const CURATED_COLLECTIONS: { key: CuratedCollectionKey; label: string; description: string }[] = [
  { key: 'editors_picks', label: "Editor's Picks", description: 'Hand-selected literary monuments chosen by Welton Academy curators.' },
  { key: 'new_additions', label: 'New Additions', description: 'Freshly catalogued volumes, recent editions, and rediscovered gems.' },
  { key: 'classics', label: 'Classics', description: 'Time-tested works that have haunted cloisters and libraries for centuries.' },
  { key: 'poetry', label: 'Poetry', description: 'Lyric verse, transcendental anthems, and delicate sonnets.' },
  { key: 'philosophy', label: 'Philosophy & Existentialism', description: 'Deep inquiries into the absurd, moral beauty, and self-possession.' },
  { key: 'romance', label: 'Romance & Longing', description: 'Destructive passions, Regency wit, and tender confessions.' },
  { key: 'mystery', label: 'Mystery & Literary Fiction', description: 'Enigmatic murders, classical tragedies, and Gothic estates.' },
  { key: 'community_favourites', label: 'Community Favourites', description: 'The most shelved, annotated, and loved volumes in the club.' },
];

export const LandingPage: React.FC = () => {
  const [shelfMode, setShelfMode] = useState<'suggested' | 'top'>('suggested');
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<CuratedCollectionKey>('editors_picks');
  const [modalBook, setModalBook] = useState<Book | null>(null);

  // Bookshelf list
  const shelfBooks = shelfMode === 'suggested' ? SEED_BOOKS.slice(0, 10) : SEED_BOOKS.slice(4, 14);
  const activeBook = shelfBooks[selectedBookIndex] || shelfBooks[0];

  // Curated collections filter
  const collectionBooks = SEED_BOOKS.filter(b => {
    if (b.homepage_collections?.includes(selectedCollection)) return true;
    if (selectedCollection === 'poetry' && b.genres.includes('Poetry')) return true;
    if (selectedCollection === 'classics' && b.genres.includes('Classics')) return true;
    if (selectedCollection === 'philosophy' && b.genres.includes('Philosophy')) return true;
    if (selectedCollection === 'romance' && b.genres.includes('Romance')) return true;
    if (selectedCollection === 'mystery' && (b.genres.includes('Mystery') || b.genres.includes('Dark Academia'))) return true;
    return false;
  }).slice(0, 8);

  const spineColors = ['#44322D', '#72583E', '#755151', '#443223', '#5D4532', '#7C7960', '#302F1F', '#855D5D'];

  // Featured Book of the Month (Section 4)
  const featuredBookOfTheMonth = SEED_BOOKS[0]; // The Secret History

  return (
    <div className="min-h-screen text-[#443223] pb-20">
      {/* 1. Signature Marquee Ticker Strip */}
      <div className="w-full bg-[#443223] text-[#FFF9F3] border-b-2 border-[#2E2116] overflow-hidden py-2 select-none relative z-20 shadow-sm">
        <div className="ticker-track flex items-center gap-8 font-typewriter text-xs font-bold tracking-wider">
          <div className="flex items-center gap-8 flex-shrink-0">
            <span className="starburst-badge py-0.5 px-2 bg-[#755151] text-[10px]">NEW EDITION</span>
            <span>⭐ NOW READING: THE SECRET HISTORY (1,420 READERS)</span>
            <span>✦ DAILY CROSSWORD STREAK: 142 COMPLETED</span>
            <span className="starburst-badge py-0.5 px-2 bg-[#7C7960] text-[10px]">VIRTUAL CAFÉ</span>
            <span>☕ 31 MEMBERS GATHERED IN THE READING LOUNGE</span>
            <span>📜 THE MARGINS: 84 NEW LETTERS PINNED</span>
            <span>✦ "LIVING IN THE BOOKS."</span>
          </div>
          <div className="flex items-center gap-8 flex-shrink-0">
            <span className="starburst-badge py-0.5 px-2 bg-[#755151] text-[10px]">NEW EDITION</span>
            <span>⭐ NOW READING: THE SECRET HISTORY (1,420 READERS)</span>
            <span>✦ DAILY CROSSWORD STREAK: 142 COMPLETED</span>
            <span className="starburst-badge py-0.5 px-2 bg-[#7C7960] text-[10px]">VIRTUAL CAFÉ</span>
            <span>☕ 31 MEMBERS GATHERED IN THE READING LOUNGE</span>
            <span>📜 THE MARGINS: 84 NEW LETTERS PINNED</span>
            <span>✦ "LIVING IN THE BOOKS."</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Editorial Light Academia */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16 border-b-2 border-[#443223]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 starburst-badge mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
              <span>A LITERARY COMMUNITY YOU CAN SIT IN</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-[#443223] tracking-tight mb-4">
              A little world for people who feel{' '}
              <span className="italic underline decoration-[#755151] decoration-4 underline-offset-8">
                a little too much
              </span>{' '}
              about books.
            </h1>

            <p className="font-typewriter text-sm sm:text-base text-[#72583E] leading-relaxed max-w-2xl mb-8">
              Step out of the noisy feeds. Pull weathered volumes from our interactive bookshelf, listen to raindrops at the café window, inscribe confessions in The Margins, and flip through Goodreads-style review keepsakes.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <NavLink to="/library" className="btn-primary text-xs py-3 px-5">
                <BookOpen className="w-4 h-4" />
                <span>Browse Grand Library</span>
              </NavLink>

              <NavLink to="/cafe" className="btn-secondary text-xs py-3 px-5">
                <Coffee className="w-4 h-4" />
                <span>Enter Candlelit Café</span>
              </NavLink>

              <NavLink to="/margins" className="btn-secondary text-xs py-3 px-5">
                <Feather className="w-4 h-4 text-[#755151]" />
                <span>The Margins</span>
              </NavLink>

              <NavLink to="/reviews" className="btn-secondary text-xs py-3 px-5">
                <span>Review Flashcards</span>
              </NavLink>
            </div>
          </div>

          {/* Right: Literary Seal with Pixel Avatar */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="catalog-card p-6 bg-[#FCF8F2] border-3 border-[#443223] shadow-[6px_6px_0px_#443223] rotate-2 max-w-xs text-center flex flex-col items-center">
              <div className="w-24 h-32 rounded border-2 border-[#1A1614] bg-[#FFF9F3] flex flex-col items-center justify-center mb-3 shadow-[2px_2px_0px_#1A1614] overflow-hidden p-1 relative">
                <PixelAvatar size="md" viewMode="full" />
                <span className="absolute bottom-1 bg-[#1A1614] text-[#FFF9F3] text-[8px] font-mono px-1 rounded uppercase font-bold">
                  Welton Archivist
                </span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#443223]">
                DEAD POETS CLUB
              </h3>
              <p className="font-typewriter text-xs text-[#755151] font-bold uppercase tracking-wider mb-2">
                FOUNDED 1889 · NOCTURNAL SANCTUARY
              </p>
              <NavLink
                to="/shelves"
                className="btn-secondary text-[11px] py-1.5 px-3 uppercase mt-1 inline-flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#755151]" />
                <span>Open My Shelf</span>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BOOKSHELF (Section 4 Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-2 border-dashed border-[#A08670] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
                INTERACTIVE BOOKSHELF
              </span>
              <span className="font-handwritten text-lg text-[#755151] italic">
                “Pull a volume to inspect its cloth cover”
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
              The Grand Bookshelf
            </h2>
            <p className="font-typewriter text-xs text-[#72583E]">
              Select any spine to slide it from the oak foundation and reveal its verified cover.
            </p>
          </div>

          {/* Shelf Mode Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShelfMode('suggested');
                setSelectedBookIndex(0);
              }}
              className={`px-3 py-1.5 rounded font-typewriter text-xs font-bold border-2 transition-all cursor-pointer ${
                shelfMode === 'suggested'
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#FCF8F2] text-[#443223] border-[#A08670]'
              }`}
            >
              Suggested for You
            </button>
            <button
              onClick={() => {
                setShelfMode('top');
                setSelectedBookIndex(0);
              }}
              className={`px-3 py-1.5 rounded font-typewriter text-xs font-bold border-2 transition-all cursor-pointer ${
                shelfMode === 'top'
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#FCF8F2] text-[#443223] border-[#A08670]'
              }`}
            >
              This Week’s Top Spines
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Spines on the Wooden Foundation */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* The Shelf Row */}
            <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 px-4 pt-16 pb-0 overflow-x-auto select-none">
              {shelfBooks.map((book, idx) => {
                const isSelected = selectedBookIndex === idx;
                const spineColor = spineColors[idx % spineColors.length];
                const height = 230 + (idx % 4) * 16;

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookIndex(idx)}
                    className={`book-spine flex-shrink-0 w-8 sm:w-11 px-1.5 py-3 flex items-center justify-between text-[#FFF9F3] relative font-typewriter ${
                      isSelected ? 'active' : ''
                    }`}
                    style={{
                      height: `${height}px`,
                      backgroundColor: spineColor,
                    }}
                    title={`${book.title} by ${book.author}`}
                  >
                    {/* Top Gold Embossed Band */}
                    <div className="w-full h-1 bg-[#DBC4A5]/60 mb-2" />

                    {/* Vertical Title & Author */}
                    <span className="text-[11px] sm:text-xs font-bold tracking-wider line-clamp-1 truncate uppercase">
                      {book.title}
                    </span>
                    <span className="text-[9px] text-[#DBC4A5] truncate opacity-90">
                      {book.author}
                    </span>

                    {/* Bottom Gold Embossed Band */}
                    <div className="w-full h-1 bg-[#DBC4A5]/60 mt-2" />
                  </div>
                );
              })}
            </div>

            {/* Wooden Base of the Bookshelf */}
            <div className="wooden-shelf w-full h-10 rounded-b-md flex items-center justify-between px-6">
              <span className="font-typewriter text-[10px] text-[#DBC4A5]/70 tracking-widest uppercase">
                OAK FOUNDATION · TIER II
              </span>
              <span className="font-typewriter text-[10px] text-[#DBC4A5]/70 tracking-widest uppercase">
                {shelfBooks.length} VOLUMES STACKED
              </span>
            </div>
          </div>

          {/* Right Column: Prominent Front Cover Reveal Card (Inspired by reference 3) */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {activeBook && (
                <motion.div
                  key={activeBook.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="catalog-card p-5 bg-[#FCF8F2] border-3 border-[#443223] shadow-[6px_6px_0px_#443223] relative"
                >
                  {/* Decorative Handwritten Marginal Note */}
                  <span className="font-handwritten text-base text-[#755151] italic absolute -top-3.5 right-4 bg-[#FCF8F2] px-2 border border-[#443223] rounded">
                    ← Pulled from the stacks
                  </span>

                  <div className="flex gap-4 mb-4">
                    <div className="w-28 sm:w-32 flex-shrink-0">
                      <BookCoverImage book={activeBook} className="w-full" priority={true} />
                    </div>

                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                          {activeBook.genres[0]}
                        </span>
                        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#443223] leading-snug">
                          {activeBook.title}
                        </h3>
                        <p className="font-typewriter text-xs text-[#72583E] mb-2">
                          by {activeBook.author} ({activeBook.publication_year})
                        </p>

                        <div className="flex items-center gap-1 text-xs font-bold text-[#755151]">
                          <Star className="w-3.5 h-3.5 fill-current text-[#755151]" />
                          <span>{activeBook.rating_avg}</span>
                          <span className="text-[#A08670] font-normal">({activeBook.rating_count} reviews)</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="font-handwritten text-sm text-[#755151] italic">
                          "Read this one slowly."
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="font-typewriter text-xs text-[#58432D] leading-relaxed line-clamp-3 mb-4 border-t border-dashed border-[#A08670] pt-2">
                    {activeBook.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setModalBook(activeBook)}
                      className="btn-primary text-xs py-2 px-3 flex-1 justify-center cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Book Dossier</span>
                    </button>
                    <NavLink
                      to={`/reviews?bookId=${activeBook.id}`}
                      className="btn-secondary text-xs py-2 px-3"
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

      {/* 4. FEATURED BOOK OF THE MONTH (Section 4 Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="catalog-card p-6 sm:p-10 bg-[#FAF4EB] border-3 border-[#443223] shadow-[6px_6px_0px_#443223]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-48 sm:w-56 shadow-2xl">
                <BookCoverImage book={featuredBookOfTheMonth} className="w-full" priority={true} />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 starburst-badge bg-[#755151]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
                <span>BOOK OF THE MONTH · EDITORIAL SELECTION</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#443223] leading-tight">
                {featuredBookOfTheMonth.title}
              </h2>

              <p className="font-editorial text-lg text-[#755151] font-semibold">
                by {featuredBookOfTheMonth.author} ({featuredBookOfTheMonth.publication_year}) · {featuredBookOfTheMonth.publisher}
              </p>

              <p className="font-typewriter text-xs sm:text-sm text-[#58432D] leading-relaxed max-w-2xl">
                {featuredBookOfTheMonth.description}
              </p>

              {featuredBookOfTheMonth.quote && (
                <div className="p-4 bg-[#FFF9F3] border-l-4 border-[#755151] border border-[#443223] rounded">
                  <p className="font-handwritten text-xl text-[#3D2B1F] italic">
                    "{featuredBookOfTheMonth.quote.text}"
                  </p>
                  <p className="font-typewriter text-[10px] text-[#755151] font-bold mt-1 text-right">
                    — {featuredBookOfTheMonth.quote.speaker}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setModalBook(featuredBookOfTheMonth)}
                  className="btn-primary text-xs py-2.5 px-5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Inspect Volume Dossier</span>
                </button>

                <NavLink
                  to="/margins?section=leave-book&bookId=b1"
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Pass to a Friend</span>
                </NavLink>

                <NavLink
                  to="/authors?author=Donna%20Tartt"
                  className="btn-secondary text-xs py-2.5 px-4"
                >
                  <span>About Donna Tartt →</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CURATED EDITORIAL HOMEPAGE SHELVES (Section 4 Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="pb-4 mb-6 border-b-2 border-dashed border-[#A08670]">
          <div className="flex items-center gap-2">
            <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
              CURATED SHELVES
            </span>
            <span className="font-handwritten text-base text-[#755151] italic">
              “Sourced directly from the verified library catalogue”
            </span>
          </div>
          <h2 className="font-editorial text-3xl font-bold text-[#443223]">
            Curated Collections
          </h2>
          <p className="font-typewriter text-xs text-[#72583E]">
            Selected reading pathways categorized by historical, emotional, and aesthetic moods.
          </p>
        </div>

        {/* Collection Ribbon Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
          {CURATED_COLLECTIONS.map(col => {
            const isSelected = selectedCollection === col.key;
            return (
              <button
                key={col.key}
                onClick={() => setSelectedCollection(col.key)}
                className={`px-3 py-1.5 rounded font-typewriter text-xs font-bold transition-all border-2 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                    : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
                }`}
              >
                {col.label}
              </button>
            );
          })}
        </div>

        {/* Curated Shelf Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {collectionBooks.map(book => (
            <div
              key={book.id}
              onClick={() => setModalBook(book)}
              className="catalog-card p-4 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="w-full mb-3 rounded overflow-hidden border border-[#443223] bg-[#2A231E]">
                  <BookCoverImage book={book} className="w-full" />
                </div>
                <h4 className="font-editorial text-base font-bold text-[#443223] group-hover:text-[#755151] transition-colors leading-snug line-clamp-1">
                  {book.title}
                </h4>
                <p className="font-typewriter text-xs text-[#72583E] mt-0.5">
                  {book.author} · {book.publication_year}
                </p>
              </div>

              <div className="pt-3 border-t border-dashed border-[#A08670] mt-3 flex items-center justify-between text-xs font-typewriter">
                <span className="text-[#755151] font-bold">★ {book.rating_avg}</span>
                <span className="text-[11px] text-[#72583E] group-hover:text-[#443223] font-bold">
                  Inspect →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GENRE COLLECTIONS — DISTINCT VISUAL IDENTITIES (Section 5 Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="pb-4 mb-8 border-b-2 border-dashed border-[#A08670]">
          <div className="flex items-center gap-2">
            <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
              GENRE ARCHIVES · DISTINCT IDENTITIES
            </span>
            <span className="font-handwritten text-base text-[#755151] italic">
              “Every genre carries its own soul”
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            Distinct Illustrated Chapters
          </h2>
          <p className="font-typewriter text-xs text-[#72583E]">
            Vertical bookmark panels with bespoke textures, motifs, and typography. Select any genre to open its complete collection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {GENRE_COLLECTIONS.map(g => {
            const Icon = g.icon;
            return (
              <NavLink
                key={g.name}
                to={`/library?genre=${encodeURIComponent(g.name)}`}
                className={`group p-4 rounded flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:-translate-y-2 text-decoration-none border-2 border-[#443223] shadow-[4px_4px_0px_#443223] relative overflow-hidden`}
                style={{
                  backgroundColor: g.bgColor,
                  backgroundImage: g.patternStyle,
                }}
              >
                {/* Top Label Bookmark Stamp */}
                <div
                  className="w-full py-1 px-2 text-center rounded text-[10px] font-typewriter font-bold text-white uppercase shadow-sm"
                  style={{ backgroundColor: g.accentColor }}
                >
                  {g.name}
                </div>

                {/* Central Emblem & Quote */}
                <div className="py-4 text-center flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-[#443223] flex items-center justify-center mb-3 bg-white/80 shadow-sm group-hover:scale-110 transition-transform"
                    style={{ color: g.accentColor }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3
                    className="font-editorial text-base sm:text-lg font-bold leading-tight mb-2"
                    style={{ color: g.textColor }}
                  >
                    {g.name}
                  </h3>

                  <p className="font-handwritten text-sm italic leading-tight opacity-90 mb-2 px-1 text-[#443223]">
                    {g.quote}
                  </p>
                </div>

                {/* Bottom Author Tagline & Volumes */}
                <div className="pt-2 border-t border-dashed border-[#443223]/30 text-center">
                  <span className="font-mono text-[9px] text-[#443223]/75 block truncate">
                    {g.motif}
                  </span>
                  <span className="font-typewriter text-[10px] font-bold text-[#443223] block mt-1">
                    {g.count} Volumes →
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </section>

      {/* 7. Feature Teasers: The Margins, Crossword, Café */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* The Margins Card */}
          <NavLink
            to="/margins"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-[#755151]/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Feather className="w-5 h-5 text-[#755151]" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                COMMUNITY SANCTUARY
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                The Margins
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                Letters between lines, daily Marginalia journal prompts, and the thoughtful "Leave This Book for Someone" recommendation engine.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Enter The Margins <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          {/* Daily Crossword Card */}
          <NavLink
            to="/crossword"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-pink-700/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Grid3X3 className="w-5 h-5 text-pink-700" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                DAILY PUZZLE
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                Literary Crossword
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                Solved over archival photo prints. Earn streak stamps on your library card for Romeo, Keats, Wordsworth, and Shakespeare clues.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Solve Today’s Grid <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          {/* Virtual Cafeteria Card */}
          <NavLink
            to="/cafe"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-[#44422D]/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5 text-[#44422D]" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                STUDY SPACE
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                Candlelit Cafeteria
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                Atmospheric rain falling on street cobbles, warm coffeehouse patrons, looping cinema marquees, and rich binaural ambient hearths.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Take a Seat at the Café <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>
        </div>
      </section>

      {/* Book Detail Modal */}
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
