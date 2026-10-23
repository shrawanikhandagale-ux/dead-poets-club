import React, { useState } from 'react';
import { Book } from '../../types/book';
import { soundEngine } from '../../lib/audioEngine';
import { BookOpen, Star, RotateCw, Bookmark, Sparkles, Feather } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface ScrapbookCardData {
  id: string;
  book: Book;
  tagline: string;
  themeColor: {
    bg: string;
    text: string;
    accent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  rotation?: number;
}

export const SCRAPBOOK_THEMES = [
  // 1. Dusty Mauve
  {
    bg: '#755151',
    text: '#FFF9F3',
    accent: '#DBC4A5',
    border: '#443223',
    badgeBg: '#443223',
    badgeText: '#FFF9F3',
  },
  // 2. Aged Parchment
  {
    bg: '#FAF4EB',
    text: '#443223',
    accent: '#755151',
    border: '#443223',
    badgeBg: '#DBC4A5',
    badgeText: '#443223',
  },
  // 3. Deep Burgundy
  {
    bg: '#54232A',
    text: '#FFF9F3',
    accent: '#F3C99F',
    border: '#2E1216',
    badgeBg: '#2E1216',
    badgeText: '#FFF9F3',
  },
  // 4. Forest Green / Cedar
  {
    bg: '#3B4434',
    text: '#FFF9F3',
    accent: '#DBC4A5',
    border: '#21271D',
    badgeBg: '#21271D',
    badgeText: '#DBC4A5',
  },
  // 5. Muted Rose
  {
    bg: '#B27B7B',
    text: '#241414',
    accent: '#FFF9F3',
    border: '#472727',
    badgeBg: '#472727',
    badgeText: '#FFF9F3',
  },
  // 6. Warm Brown / Espresso
  {
    bg: '#72583E',
    text: '#FFF9F3',
    accent: '#FAF4EB',
    border: '#382A1B',
    badgeBg: '#382A1B',
    badgeText: '#FAF4EB',
  },
];

interface ScrapbookQuoteCardProps {
  card: ScrapbookCardData;
  isStacked?: boolean;
  isActiveInStack?: boolean;
  onStackSelect?: () => void;
  onOpenBookModal?: (book: Book) => void;
}

export const ScrapbookQuoteCard: React.FC<ScrapbookQuoteCardProps> = ({
  card,
  isStacked = false,
  isActiveInStack = false,
  onStackSelect,
  onOpenBookModal,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { book, tagline, themeColor } = card;

  const handleFlip = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    soundEngine.playPageTurn();
    setIsFlipped(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip(e);
    }
  };

  return (
    <div
      className={`scrapbook-card-container relative transition-all duration-300 select-none ${
        isStacked ? 'w-full h-80' : 'w-full h-80 sm:h-84'
      }`}
      style={{ perspective: '1200px' }}
      onClick={() => {
        if (isStacked && !isActiveInStack && onStackSelect) {
          onStackSelect();
        } else {
          handleFlip();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Flashcard for ${book.title}. Press Space or Enter to flip.`}
    >
      {/* 3D Flipping Flipper */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* =========================================
            FRONT FACE — QUOTE & SCRAPBOOK MARGINALIA
           ========================================= */}
        <div
          className="absolute inset-0 w-full h-full p-5 sm:p-6 rounded-md border-2 shadow-[4px_4px_0px_#443223] flex flex-col justify-between overflow-hidden cursor-pointer"
          style={{
            backgroundColor: themeColor.bg,
            color: themeColor.text,
            borderColor: themeColor.border,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Decorative Washi Tape on Top Left Corner */}
          <div
            className="absolute -top-3 left-6 w-16 h-6 bg-[#FAF4EB]/80 border-x border-[#443223]/30 shadow-xs rotate-[-3deg] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(68,50,35,0.08) 4px, rgba(68,50,35,0.08) 8px)',
            }}
          />

          {/* Top Stamp Header */}
          <div className="flex items-center justify-between border-b pb-2.5 pt-1" style={{ borderColor: `${themeColor.accent}40` }}>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-typewriter font-bold uppercase tracking-wider"
                style={{ backgroundColor: themeColor.badgeBg, color: themeColor.badgeText }}
              >
                {tagline}
              </span>
            </div>

            {/* Vintage Postmark / Stamp detail */}
            <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-mono">
              <Feather className="w-3 h-3" />
              <span>DPC NO. {book.publication_year}</span>
            </div>
          </div>

          {/* Main Book Quote Body */}
          <div className="my-auto py-2">
            <p className="font-typewriter text-xs sm:text-sm leading-relaxed tracking-wide font-medium italic">
              “{book.quote?.text || book.description.slice(0, 140) + '...'}”
            </p>
            {book.quote?.speaker && (
              <p className="font-handwritten text-sm sm:text-base mt-2.5 opacity-90 text-right tracking-wide">
                — {book.quote.speaker}
              </p>
            )}
          </div>

          {/* Front Footer: Source & Flip Prompt */}
          <div className="border-t border-dashed pt-2.5 flex items-center justify-between text-[11px] font-typewriter" style={{ borderColor: `${themeColor.accent}40` }}>
            <div className="truncate max-w-[200px]">
              <span className="font-bold underline decoration-dotted">{book.title}</span>
              <span className="opacity-75"> by {book.author}</span>
            </div>

            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider py-1 px-2 rounded hover:brightness-110 transition-all border border-current"
              title="Flip to read volume reflection"
            >
              <RotateCw className="w-3 h-3" />
              <span>Flip Card</span>
            </button>
          </div>
        </div>

        {/* =========================================
            BACK FACE — BOOK DETAILS & REFLECTIONS
           ========================================= */}
        <div
          className="absolute inset-0 w-full h-full p-5 sm:p-6 rounded-md border-2 shadow-[4px_4px_0px_#443223] flex flex-col justify-between overflow-hidden cursor-pointer"
          style={{
            backgroundColor: '#FCF8F2',
            color: '#443223',
            borderColor: '#443223',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Header on Reverse */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#A08670] pb-2 mb-2">
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#755151]" />
                ARCHIVAL VOLUME DOSSIER
              </span>
              <div className="flex items-center gap-1 text-xs font-typewriter font-bold text-[#755151]">
                <Star className="w-3 h-3 fill-current text-[#755151]" />
                <span>{book.rating_avg.toFixed(1)}</span>
                <span className="text-[#A08670] text-[10px]">({book.rating_count})</span>
              </div>
            </div>

            {/* Title & Author */}
            <h4 className="font-editorial text-base sm:text-lg font-bold text-[#443223] leading-tight line-clamp-1">
              {book.title}
            </h4>
            <p className="font-typewriter text-[11px] text-[#72583E] mb-2">
              {book.author} · Published {book.publication_year} · {book.pages} pages
            </p>

            {/* Genres */}
            <div className="flex flex-wrap gap-1 mb-2.5">
              {book.genres.slice(0, 3).map(genre => (
                <span
                  key={genre}
                  className="px-1.5 py-0.5 rounded text-[9px] font-typewriter font-bold bg-[#DBC4A5]/40 text-[#443223] border border-[#A08670]"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Editorial Reflection / Synopsis */}
            <p className="font-typewriter text-[11px] text-[#443223] leading-relaxed line-clamp-3 bg-[#FFF9F3] p-2.5 rounded border border-[#DBC4A5]">
              {book.description}
            </p>
          </div>

          {/* Reverse Footer: Library links and Flip Back */}
          <div className="border-t border-[#A08670] pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (onOpenBookModal) {
                  onOpenBookModal(book);
                }
              }}
              className="text-[10px] font-typewriter font-bold text-[#FFF9F3] bg-[#755151] px-2.5 py-1 rounded border border-[#443223] shadow-[1px_1px_0px_#443223] hover:brightness-110 flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              <span>Full Dossier</span>
            </button>

            <button
              type="button"
              onClick={handleFlip}
              className="inline-flex items-center gap-1 text-[10px] font-typewriter uppercase font-bold tracking-wider py-1 px-2.5 rounded bg-[#DBC4A5]/50 hover:bg-[#DBC4A5] text-[#443223] border border-[#443223] shadow-[1px_1px_0px_#443223]"
              title="Return to quote face"
            >
              <RotateCw className="w-3 h-3" />
              <span>Flip Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
