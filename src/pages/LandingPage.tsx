import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book } from '../types/book';
import { BookDetailModal } from '../components/books/BookDetailModal';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Chapter-style genre column definitions (PRD Section 6.2 & wireframe)
const GENRE_CHAPTERS = [
  { chapter: 'Chapter I', name: 'Poetry', color: '#755151', icon: Feather, count: 18 },
  { chapter: 'Chapter II', name: 'Classics', color: '#443223', icon: BookOpen, count: 42 },
  { chapter: 'Chapter III', name: 'Dark Academia & Mystery', color: '#44422D', icon: Flame, count: 29 },
  { chapter: 'Chapter IV', name: 'Philosophy', color: '#72583E', icon: Quote, count: 24 },
  { chapter: 'Chapter V', name: 'Gothic & Longing', color: '#7C7960', icon: Heart, count: 16 },
  { chapter: 'Chapter VI', name: 'Speculative', color: '#A08670', icon: Sparkles, count: 21 },
];

// Stacked Typewriter Quote Cards (PRD Section 6.3 & wireframe reference)
const STACKED_QUOTES = [
  {
    id: 1,
    title: 'Paul on... FINDING INSPIRATION EVERYWHERE',
    text: 'The good thing about looking through the viewfinder of a film camera is it really helps you look and see. I think one of my best points over the years has been the ability to see.',
    book: 'Camera Lucida by Roland Barthes',
    color: '#DBC4A5',
    rotation: -4,
  },
  {
    id: 2,
    title: 'Donna on... THE TERROR OF BEAUTY',
    text: 'Beauty is terror. Whatever we call beautiful, we quiver before it. And what could be more terrifying and beautiful, to souls like the Greeks or our own, than to lose control completely?',
    book: 'The Secret History by Donna Tartt',
    color: '#FCF8F2',
    rotation: 3,
  },
  {
    id: 3,
    title: 'Keating on... WORDS AND IDEAS',
    text: 'We don’t read and write poetry because it’s cute. We read and write poetry because we are members of the human race. And the human race is filled with passion.',
    book: 'Dead Poets Society by N.H. Kleinbaum',
    color: '#F5ECE1',
    rotation: -2,
  },
  {
    id: 4,
    title: 'Wilde on... THE SINS OF BEAUTY',
    text: 'Those who find ugly meanings in beautiful things are corrupt without being charming. This is a fault. Those who find beautiful meanings in beautiful things are the cultivated.',
    book: 'The Picture of Dorian Gray by Oscar Wilde',
    color: '#EAD4BA',
    rotation: 5,
  },
];

export const LandingPage: React.FC = () => {
  const [shelfMode, setShelfMode] = useState<'suggested' | 'top'>('suggested');
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);
  const [modalBook, setModalBook] = useState<Book | null>(null);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);

  // Shelf books
  const shelfBooks = shelfMode === 'suggested' ? SEED_BOOKS.slice(0, 10) : SEED_BOOKS.slice(3, 13);
  const activeBook = shelfBooks[selectedBookIndex] || shelfBooks[0];

  const spineColors = ['#44322D', '#72583E', '#755151', '#443223', '#5D4532', '#7C7960', '#302F1F', '#855D5D'];

  return (
    <div className="min-h-screen text-[#443223] pb-20">
      {/* 1. Signature Element: Marquee Ticker Strip (PRD Section 4 & 6.1) */}
      <div className="w-full bg-[#443223] text-[#FFF9F3] border-b-2 border-[#2E2116] overflow-hidden py-2 select-none relative z-20 shadow-sm">
        <div className="ticker-track flex items-center gap-8 font-typewriter text-xs font-bold tracking-wider">
          <div className="flex items-center gap-8 flex-shrink-0">
            <span className="starburst-badge py-0.5 px-2 bg-[#755151] text-[10px]">NEW EDITION</span>
            <span>⭐ NOW READING: THE SECRET HISTORY (1,420 READERS)</span>
            <span>✦ DAILY CROSSWORD STREAK: 142 COMPLETED</span>
            <span className="starburst-badge py-0.5 px-2 bg-[#7C7960] text-[10px]">VIRTUAL CAFÉ</span>
            <span>☕ 31 MEMBERS GATHERED IN THE READING LOUNGE</span>
            <span>📜 POEM JAR: NEW KEATS SONNET UNLOCKED</span>
            <span>✦ "LIVING IN THE BOOKS."</span>
          </div>
          {/* Duplicate track for seamless infinite scroll loop */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <span className="starburst-badge py-0.5 px-2 bg-[#755151] text-[10px]">NEW EDITION</span>
            <span>⭐ NOW READING: THE SECRET HISTORY (1,420 READERS)</span>
            <span>✦ DAILY CROSSWORD STREAK: 142 COMPLETED</span>
            <span className="starburst-badge py-0.5 px-2 bg-[#7C7960] text-[10px]">VIRTUAL CAFÉ</span>
            <span>☕ 31 MEMBERS GATHERED IN THE READING LOUNGE</span>
            <span>📜 POEM JAR: NEW KEATS SONNET UNLOCKED</span>
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
              Step out of the noisy feeds. Browse weathered spines on a wooden shelf, pull random public-domain sonnets from a gumball jar, unravel daily literary crosswords, and sit in our candlelit café with fellow readers.
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

              <NavLink to="/poems" className="btn-secondary text-xs py-3 px-5">
                <ScrollText className="w-4 h-4" />
                <span>Pull a Poem (50¢)</span>
              </NavLink>
            </div>
          </div>

          {/* Right Stamp Seal */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="catalog-card p-6 bg-[#FCF8F2] border-3 border-[#443223] shadow-[6px_6px_0px_#443223] rotate-2 max-w-xs text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#755151] border-2 border-[#443223] flex items-center justify-center text-white mb-3 shadow-sm">
                <Feather className="w-8 h-8" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#443223]">
                DEAD POETS SOCIETY
              </h3>
              <p className="font-typewriter text-xs text-[#755151] font-bold uppercase tracking-wider mb-2">
                ESTABLISHED 1889
              </p>
              <p className="font-typewriter text-[11px] text-[#72583E] italic leading-snug">
                “Words and ideas can change the world.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Wooden Bookshelf Carousel (PRD Section 6.1 & Reference Wireframe) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-2 border-dashed border-[#A08670] gap-4">
          <div>
            <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
              PRD SECTION 6.1 · THE LIBRARY CAROUSEL
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#443223]">
              The Grand Bookshelf
            </h2>
            <p className="font-typewriter text-xs text-[#72583E]">
              Select any book spine to pull it from the shelf and reveal its catalog card.
            </p>
          </div>

          {/* Two Modes Toggle: Suggested for you & This week's top books */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShelfMode('suggested')}
              className={`px-3 py-1.5 rounded font-typewriter text-xs font-bold border-2 transition-all ${
                shelfMode === 'suggested'
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
              }`}
            >
              Suggested for You
            </button>
            <button
              onClick={() => setShelfMode('top')}
              className={`px-3 py-1.5 rounded font-typewriter text-xs font-bold border-2 transition-all ${
                shelfMode === 'top'
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
              }`}
            >
              This Week’s Top Spines
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Spines on the Wooden Base */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* The Shelf Row */}
            <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 px-4 pt-16 pb-0 overflow-x-auto select-none">
              {shelfBooks.map((book, idx) => {
                const isSelected = selectedBookIndex === idx;
                const spineColor = spineColors[idx % spineColors.length];
                const height = 230 + (idx % 4) * 16; // variable spine heights for authentic library feel

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

          {/* Right Column: Pull-Out Detail Card for Selected Spine */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {activeBook && (
                <motion.div
                  key={activeBook.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223] shadow-[5px_5px_0px_#443223]"
                >
                  <div className="flex gap-4 mb-4">
                    <img
                      src={activeBook.cover_url}
                      alt={activeBook.title}
                      className="w-24 h-36 object-cover rounded border-2 border-[#443223] shadow-md flex-shrink-0"
                    />
                    <div>
                      <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                        {activeBook.genres[0]}
                      </span>
                      <h3 className="font-editorial text-lg font-bold text-[#443223] leading-snug">
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
                  </div>

                  <p className="font-typewriter text-xs text-[#58432D] leading-relaxed line-clamp-3 mb-4 border-t border-dashed border-[#A08670] pt-2">
                    {activeBook.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setModalBook(activeBook)}
                      className="btn-primary text-xs py-2 px-3 flex-1 justify-center"
                    >
                      <span>Read Reviews & Quotes</span>
                    </button>
                    <NavLink
                      to="/library"
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      Library
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. Chapter-Style Genre Columns (PRD Section 6.2 & wireframe reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="pb-4 mb-8 border-b-2 border-dashed border-[#A08670]">
          <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
            PRD SECTION 6.2 · GENRE ARCHIVES
          </span>
          <h2 className="font-editorial text-3xl font-bold text-[#443223]">
            Curated Chapters
          </h2>
          <p className="font-typewriter text-xs text-[#72583E]">
            Vertical bookmark columns mapping the literary moods of the club.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {GENRE_CHAPTERS.map(g => {
            const Icon = g.icon;
            return (
              <NavLink
                key={g.chapter}
                to={`/library?genre=${encodeURIComponent(g.name)}`}
                className="group catalog-card p-4 flex flex-col justify-between h-56 transition-all hover:-translate-y-2 text-decoration-none border-2 border-[#443223] shadow-[3px_3px_0px_#443223]"
                style={{ backgroundColor: '#FCF8F2' }}
              >
                {/* Bookmark Tab */}
                <div
                  className="w-full py-1 text-center rounded text-[10px] font-typewriter font-bold text-white uppercase shadow-sm"
                  style={{ backgroundColor: g.color }}
                >
                  {g.chapter}
                </div>

                <div className="py-4 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#443223] flex items-center justify-center mb-2 bg-[#FFF9F3] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-[#443223]" />
                  </div>
                  <h3 className="font-editorial text-base font-bold text-[#443223] leading-snug">
                    {g.name}
                  </h3>
                </div>

                <span className="font-typewriter text-[10px] text-center text-[#72583E] border-t border-dashed border-[#A08670] pt-1">
                  {g.count} Curated Volumes →
                </span>
              </NavLink>
            );
          })}
        </div>
      </section>

      {/* 5. Stacked Typewriter Quote Cards (PRD Section 6.3 & wireframe reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b-2 border-[#443223]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
              PRD SECTION 6.3 · MARGINALIA
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223] mb-3">
              Stacked Typewriter Index Cards
            </h2>
            <p className="font-typewriter text-xs sm:text-sm text-[#72583E] leading-relaxed mb-6">
              Like index cards pinned in a researcher’s study. Click or tap any card in the stack to bring it to the top.
            </p>
            <div className="inline-flex items-center gap-2 starburst-badge">
              <Quote className="w-3.5 h-3.5 text-[#FFF9F3]" />
              <span>FAN-OUT INTERACTION ENABLED</span>
            </div>
          </div>

          {/* Interactive Stacked Note Cards */}
          <div className="lg:col-span-7 flex justify-center py-8">
            <div className="relative w-full max-w-md h-72">
              {STACKED_QUOTES.map((q, idx) => {
                const isActive = activeQuoteIndex === idx;
                const offset = (idx - activeQuoteIndex) * 12;

                return (
                  <motion.div
                    key={q.id}
                    onClick={() => setActiveQuoteIndex(idx)}
                    animate={{
                      y: isActive ? -10 : offset,
                      rotate: isActive ? 0 : q.rotation,
                      scale: isActive ? 1.03 : 0.98,
                      zIndex: isActive ? 30 : 20 - Math.abs(idx - activeQuoteIndex),
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="note-card absolute inset-0 p-6 rounded cursor-pointer select-none border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between"
                    style={{ backgroundColor: q.color }}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#443223] pb-2 mb-3">
                        <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase tracking-widest">
                          {q.title}
                        </span>
                        <span className="font-mono text-xs text-[#443223]">#{idx + 1}</span>
                      </div>

                      <p className="font-typewriter text-xs sm:text-sm text-[#443223] leading-relaxed italic">
                        “{q.text}”
                      </p>
                    </div>

                    <div className="border-t border-dashed border-[#A08670] pt-2 flex items-center justify-between text-[11px] font-typewriter text-[#72583E]">
                      <span>{q.book}</span>
                      <span className="text-[10px] font-bold uppercase">Click to flip</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Teasers: Crossword, Poem Jar, Author Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Crossword Card */}
          <NavLink
            to="/crossword"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-[#f472b6]/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Grid3X3 className="w-5 h-5 text-[#f472b6]" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                DAILY PUZZLE
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                Sunday Literary Crossword
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                Solved over archival photo prints with pink highlights. Earn streak stamps on your library card.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Play Today’s Grid <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          {/* Gumball Poem Jar Card */}
          <NavLink
            to="/poems"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-[#755151]/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ScrollText className="w-5 h-5 text-[#755151]" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                VINTAGE GUMBALL
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                The Poem Jar (50¢)
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                Drop a coin and turn the crank. Pull public-domain sonnets by Keats, Shelley, and Dickinson.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Crank Lever & Pull <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </NavLink>

          {/* Author Spotlight Card */}
          <NavLink
            to="/authors"
            className="catalog-card p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between group text-decoration-none"
          >
            <div>
              <div className="w-10 h-10 rounded bg-[#44422D]/20 border-2 border-[#443223] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Feather className="w-5 h-5 text-[#44422D]" />
              </div>
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase">
                AUTHOR SPOTLIGHT
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#443223] mb-2">
                Haruki Murakami
              </h3>
              <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                The Architect of Other Realities. Explore recurring motifs: deep wells, jazz, and two moons.
              </p>
            </div>
            <span className="font-typewriter text-xs font-bold text-[#755151] flex items-center gap-1 pt-4 border-t border-dashed border-[#A08670]">
              Read Spotlight <ArrowRight className="w-3.5 h-3.5" />
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
