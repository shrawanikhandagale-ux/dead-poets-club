import React, { useState } from 'react';
import { Book } from '../../types/book';
import { Feather } from 'lucide-react';

interface BookCoverImageProps {
  book: Pick<Book, 'id' | 'title' | 'author' | 'cover_url' | 'publication_year' | 'genres'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const PALETTES = [
  { bg: '#3D2A24', accent: '#DBC4A5', border: '#72583E' }, // Deep mahogany
  { bg: '#233027', accent: '#D1E0D4', border: '#4B6351' }, // Forest green
  { bg: '#3B1F2B', accent: '#F0D5DD', border: '#784659' }, // Burgundy wine
  { bg: '#1C2636', accent: '#CCD8E8', border: '#3F5675' }, // Archival navy
  { bg: '#4A3B2C', accent: '#F4E7D3', border: '#8C7053' }, // Aged leather
  { bg: '#2B2B28', accent: '#E8E6DF', border: '#616059' }, // Charcoal slate
];

export const BookCoverImage: React.FC<BookCoverImageProps> = ({
  book,
  className = '',
  size = 'md',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hash title for stable distinct fallback cover palette
  const hash = (book.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[3px] border border-[#382D24]/60 shadow-[3px_4px_10px_rgba(0,0,0,0.25)] select-none bg-[#2A231E] ${className}`}
    >
      {/* Fallback authentic typography cloth cover (always rendered as background layer or fallback) */}
      <div
        className="absolute inset-0 p-3 flex flex-col justify-between text-center"
        style={{
          backgroundColor: palette.bg,
          color: palette.accent,
        }}
      >
        {/* Ornamental Frame */}
        <div
          className="absolute inset-1.5 border border-dashed rounded pointer-events-none opacity-40"
          style={{ borderColor: palette.border }}
        />

        {/* Top Header Label */}
        <div className="pt-2 z-10">
          <span className="font-typewriter text-[8px] tracking-widest uppercase opacity-75 block truncate">
            {book.genres?.[0] || 'CLASSIC'} · {book.publication_year || 'ARCHIVE'}
          </span>
        </div>

        {/* Center Title & Seal */}
        <div className="my-auto z-10 px-1">
          <div className="w-6 h-6 mx-auto mb-1 rounded-full border border-current flex items-center justify-center opacity-60">
            <Feather className="w-3 h-3" />
          </div>
          <h4 className="font-editorial text-xs sm:text-sm font-bold leading-tight line-clamp-3">
            {book.title}
          </h4>
          <p className="font-typewriter text-[9px] mt-1 opacity-80 truncate">
            {book.author}
          </p>
        </div>

        {/* Bottom Seal */}
        <div className="pb-1 z-10">
          <span className="font-typewriter text-[7px] tracking-widest uppercase opacity-60">
            DEAD POETS CLUB
          </span>
        </div>
      </div>

      {/* Actual verified cover image */}
      {!hasError && book.cover_url && (
        <img
          src={book.cover_url}
          alt={`Front cover of ${book.title} by ${book.author}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Subtle Spine highlight shadow overlay */}
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_6px_rgba(0,0,0,0.3)] pointer-events-none" />
    </div>
  );
};
