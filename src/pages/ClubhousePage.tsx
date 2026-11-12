import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book } from '../types/book';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { ClubhousePoemCurio } from '../components/clubhouse/ClubhousePoemCurio';
import { soundEngine } from '../lib/audioEngine';
import {
  BookOpen,
  Clock,
  Sparkles,
  Quote,
  ArrowRight,
  TrendingUp,
  Palette,
  Users,
  Feather,
  Mail,
  X,
  MessageCircle,
} from 'lucide-react';
import { triggerInkSplatter } from '../lib/animeAnimations';
import { motion, AnimatePresence } from 'motion/react';

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

export const ClubhousePage: React.FC = () => {
  const { user, profile, shelves } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeWhisperFellow, setActiveWhisperFellow] = useState<ResidentFellow | null>(null);
  const [epigraphIndex, setEpigraphIndex] = useState(0);
  const [isNoteUnfolded, setIsNoteUnfolded] = useState(false);

  // Group shelves
  const currentlyReadingShelves = shelves.filter(s => s.status === 'currently_reading');
  const wantToReadShelves = shelves.filter(s => s.status === 'want_to_read');
  const readShelves = shelves.filter(s => s.status === 'read');

  const activeBook = currentlyReadingShelves.length > 0
    ? SEED_BOOKS.find(b => b.id === currentlyReadingShelves[0].book_id)
    : SEED_BOOKS[0];

  const readingGoal = profile?.reading_goal || 12;
  const booksRead = readShelves.length;
  const goalPercentage = Math.min(100, Math.round((booksRead / readingGoal) * 100));

  const handleFellowClick = (fellow: ResidentFellow) => {
    soundEngine.playClick();
    setActiveWhisperFellow(prev => (prev?.id === fellow.id ? null : fellow));
  };

  const handleCycleEpigraph = () => {
    soundEngine.playPageTurn();
    setEpigraphIndex(prev => (prev + 1) % CLUB_EPIGRAPHS.length);
  };

  const currentEpigraph = CLUB_EPIGRAPHS[epigraphIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. EDITORIAL HEADER GREETING & SANCTUARY STATUS */}
      <div className="border-b border-[#d3a66d]/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Active Pixel Avatar Stamp */}
          <div className="w-16 h-20 rounded-lg border-2 border-[#d3a66d] bg-[#1a1614] flex flex-col items-center justify-center p-1 shadow-lg relative flex-shrink-0 group">
            <PixelAvatar
              config={profile?.avatar_config}
              size="sm"
              viewMode="full"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-[#141210] absolute -bottom-1 -right-1" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 mb-1.5 text-xs font-mono text-[#e8c18e]">
              <Sparkles className="w-3.5 h-3.5 text-[#d3a66d]" />
              <span>The Atrium · * {profile?.avatar_config?.mbti || 'INTJ'}</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#f0eae1]">
              Greetings, {profile?.display_name || user?.displayName || 'Fellow Poet'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#a39b8f] mt-0.5 max-w-xl">
              &ldquo;{profile?.bio || 'Haunting dusty libraries, listening for echoes in the margins.'}&rdquo;
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
            to="/library"
            onClick={(e) => triggerInkSplatter(e.clientX, e.clientY)}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Stacks</span>
          </NavLink>
        </div>
      </div>

      {/* 2. THE COMMON ROOM — INTERACTIVE RESIDENT INHABITANTS */}
      <div className="parchment-card p-6 rounded-2xl bg-[#1a1614] border border-[#d3a66d]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#d3a66d]/15">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#d3a66d]" />
            <h2 className="font-editorial text-2xl font-normal text-[#f0eae1]">
              The Atrium · Fellows Lingering Here
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8e9c82] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Hearth burning · 5 fellows seated</span>
          </span>
        </div>

        {/* Residents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Member 1: Current User */}
          <div className="p-3.5 rounded-xl bg-[#241e1a] border border-[#d3a66d]/60 flex flex-col justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border border-[#d3a66d] bg-[#141210] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                <PixelAvatar
                  config={profile?.avatar_config}
                  size="xs"
                  viewMode="bust"
                />
                <span className="w-2 h-2 rounded-full bg-green-500 border border-[#141210] absolute bottom-0 right-0" />
              </div>
              <div className="truncate min-w-0">
                <span className="font-sans text-xs font-semibold text-[#f0eae1] block truncate">
                  {profile?.display_name || user?.displayName || 'You'} (You)
                </span>
                <span className="text-[11px] font-mono text-[#8e9c82] block truncate">
                  * At desk folio
                </span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#d3a66d]/15 flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#d3a66d] border border-[#d3a66d]/40 px-1.5 py-0.5 rounded">
                ONLINE
              </span>
              <NavLink
                to="/shelves"
                className="text-[11px] font-sans text-[#e8c18e] hover:underline"
              >
                My Shelf →
              </NavLink>
            </div>
          </div>

          {/* NPCs 2-5 */}
          {RESIDENT_FELLOWS.map(fellow => {
            const isSelected = activeWhisperFellow?.id === fellow.id;
            return (
              <button
                key={fellow.id}
                type="button"
                onClick={() => handleFellowClick(fellow)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2E241E] border-[#d3a66d] ring-1 ring-[#d3a66d]/60 shadow-lg'
                    : 'bg-[#201a17] border-[#3e342b] hover:border-[#d3a66d]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-[#3e342b] bg-[#141210] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                    <PixelAvatar
                      config={fellow.avatar}
                      size="xs"
                      viewMode="bust"
                    />
                    <span className="w-2 h-2 rounded-full bg-green-500 border border-[#141210] absolute bottom-0 right-0" />
                  </div>
                  <div className="truncate min-w-0">
                    <span className="font-sans text-xs font-semibold text-[#f0eae1] block truncate group-hover:text-[#d3a66d]">
                      {fellow.name}
                    </span>
                    <span className="text-[11px] font-sans text-[#a39b8f] block truncate">
                      {fellow.book}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#3e342b] flex items-center justify-between text-[10px]">
                  <span className="font-mono text-[#8e8578] uppercase">
                    {fellow.location}
                  </span>
                  <span className="font-mono text-[#d3a66d] flex items-center gap-0.5">
                    <MessageCircle className="w-3 h-3" />
                    <span>{isSelected ? 'Listening' : 'Whisper'}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Fellow Whisper Balloon */}
        <AnimatePresence>
          {activeWhisperFellow && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 p-4 rounded-xl bg-[#28201A] border-2 border-[#d3a66d]/60 shadow-[3px_3px_0px_#14100E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1614] border border-[#d3a66d] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Feather className="w-4 h-4 text-[#e8c18e]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-semibold text-[#f0eae1]">
                      {activeWhisperFellow.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#a39b8f]">
                      · Reading {activeWhisperFellow.book}
                    </span>
                  </div>
                  <p className="font-editorial text-base sm:text-lg italic text-[#e8c18e] mt-1 leading-snug">
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
                  className="p-1 rounded text-[#a39b8f] hover:text-[#f0eae1] cursor-pointer"
                  title="Close whisper"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. CORE HIGHLIGHTS GRID: DESK FOIL & PARLOR POEM JAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Currently Reading Hero Card */}
        <div className="lg:col-span-7 parchment-card p-6 sm:p-7 rounded-2xl bg-[#1a1614] border border-[#d3a66d]/30 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d3a66d]/15">
              <span className="text-xs font-mono tracking-widest text-[#d3a66d] uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d3a66d]" /> On Your Desk Right Now
              </span>
              <span className="text-xs font-mono text-[#8e9c82] bg-[#75816a]/20 px-2.5 py-0.5 rounded-full border border-[#75816a]/30">
                Active Reading
              </span>
            </div>

            {activeBook ? (
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div
                  onClick={() => setSelectedBook(activeBook)}
                  className="w-32 h-48 sm:w-36 sm:h-52 flex-shrink-0 cursor-pointer book-cover-wrap shadow-xl rounded overflow-hidden"
                >
                  <img
                    src={activeBook.cover_url}
                    alt={activeBook.title}
                    className="book-cover w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <h3
                      onClick={() => setSelectedBook(activeBook)}
                      className="font-editorial text-2xl sm:text-3xl font-normal text-[#f0eae1] hover:text-[#e8c18e] transition-colors cursor-pointer"
                    >
                      {activeBook.title}
                    </h3>
                    <p className="font-sans text-sm text-[#d3a66d] mt-1 font-medium">
                      {activeBook.author} <span className="font-mono text-xs">· {activeBook.publication_year}</span>
                    </p>
                    <p className="font-sans text-xs text-[#a39b8f] mt-3 line-clamp-3 leading-relaxed">
                      {activeBook.description}
                    </p>
                  </div>

                  {activeBook.quote && (
                    <div className="mt-4 p-3 rounded-lg bg-[#141210] border-l-2 border-[#d3a66d] text-base font-editorial italic text-[#c7beaf]">
                      &ldquo;{activeBook.quote.text}&rdquo;
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#d3a66d]/15 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedBook(activeBook)}
                      className="text-xs font-sans font-medium text-[#e8c18e] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      View Details &amp; Update Shelf <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-[#8e8578]">
                      {activeBook.pages} pages total
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 text-[#d3a66d]/50 mx-auto mb-3" />
                <p className="font-editorial text-xl font-normal text-[#f0eae1]">No books currently on your desk.</p>
                <NavLink to="/library" className="btn-primary text-xs mt-3 inline-flex">
                  Choose a Book from the Stacks
                </NavLink>
              </div>
            )}
          </div>

          {/* Reading Goal Progress Footer */}
          <div className="mt-6 pt-5 border-t border-[#d3a66d]/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#d3a66d] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Reading Goal
              </span>
              <span className="text-xs font-mono text-[#e8c18e]">
                {booksRead} of {readingGoal} books ({goalPercentage}%)
              </span>
            </div>

            <div className="w-full bg-[#241e1a] h-2 rounded-full overflow-hidden border border-[#3e342b]">
              <div
                className="bg-gradient-to-r from-[#784743] via-[#d3a66d] to-[#8e9c82] h-full rounded-full transition-all duration-700"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: The Poem Jar Parlor Discovery */}
        <div className="lg:col-span-5">
          <ClubhousePoemCurio />
        </div>
      </div>

      {/* 4. DISCOVERIES, EPIGRAPH & SECRET ARCHIVAL NOTE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Epigraph of the Day */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-[#151210] border border-[#d3a66d]/25 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d3a66d] flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#d3a66d]" /> Club Epigraph
              </span>
              <button
                type="button"
                onClick={handleCycleEpigraph}
                className="text-[11px] font-mono text-[#a39b8f] hover:text-[#e8c18e] transition-colors cursor-pointer"
                title="Cycle epigraph"
              >
                Next Thought →
              </button>
            </div>
            <p className="font-editorial text-lg sm:text-xl italic text-[#f0eae1] leading-relaxed">
              &ldquo;{currentEpigraph.quote}&rdquo;
            </p>
          </div>
          <p className="text-xs font-sans text-[#a39b8f] mt-3 font-medium">
            — {currentEpigraph.author}
          </p>
        </div>

        {/* Hidden Note from Archives (Easter Egg) */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-[#1C1713] border border-dashed border-[#784743]/60 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E4A853] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Note from the Archive Floor
              </span>
              <span className="text-[9px] font-mono text-[#8e8578]">SLIP #1889</span>
            </div>

            {isNoteUnfolded ? (
              <div className="space-y-2 mt-2">
                <p className="font-editorial italic text-base text-[#FAF3E8] leading-relaxed">
                  &ldquo;A secret society is not formed to hide from the world, but to preserve what the noisy streets forgot how to love.&rdquo;
                </p>
                <p className="text-[11px] font-mono text-[#d3a66d]">
                  — Pinned behind the third floor bookshelf, Welton
                </p>
              </div>
            ) : (
              <p className="font-sans text-xs text-[#a39b8f] mt-1 leading-relaxed">
                A folded piece of cream parchment sits tucked inside a leather notebook on the parlor side-table.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playPageTurn();
              setIsNoteUnfolded(prev => !prev);
            }}
            className="text-xs font-sans text-[#e8c18e] hover:underline self-start pt-3 font-medium cursor-pointer"
          >
            {isNoteUnfolded ? 'Fold Note Back' : 'Unfold Archival Note →'}
          </button>
        </div>
      </div>

      {/* 5. GATEWAYS TO PRIMARY SANCTUARIES & ACTIVITIES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-2xl font-normal text-[#f0eae1]">
            Curated Stacks for You
          </h2>
          <NavLink to="/library" className="text-xs font-sans font-medium text-[#d3a66d] hover:underline">
            View All Stacks →
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SEED_BOOKS.slice(1, 5).map(book => (
            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
        </div>
      </div>

      {/* Book Dossier Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};

export const AtriumPage = ClubhousePage;
