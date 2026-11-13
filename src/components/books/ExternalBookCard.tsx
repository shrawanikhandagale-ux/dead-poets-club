import React, { useState } from 'react';
import { ExternalBookResult } from '../../types/catalogue';
import { Feather, BookOpen, ExternalLink, Calendar, Layers, Tag } from 'lucide-react';

interface ExternalBookCardProps {
  book: ExternalBookResult;
  onSelect: (book: ExternalBookResult) => void;
}

const PALETTES = [
  { bg: '#2C221E', accent: '#DBC4A5', border: '#5C4838' }, // Dark Walnut
  { bg: '#1E2822', accent: '#C8DACD', border: '#3B4E42' }, // Muted Moss
  { bg: '#2B1B24', accent: '#EAD1DB', border: '#5A384A' }, // Deep Plum
  { bg: '#1A232E', accent: '#C6D4E4', border: '#35475E' }, // Archival Slate
  { bg: '#33271D', accent: '#F0E0CB', border: '#684F3B' }, // Antique Parchment
];

export const ExternalBookCard: React.FC<ExternalBookCardProps> = ({ book, onSelect }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive stable fallback palette from title
  const hash = book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];
  const primaryAuthor = book.authors[0]?.name || 'Unknown Author';

  return (
    <div
      onClick={() => onSelect(book)}
      className="catalog-card group relative bg-[#FCF8F2] border-2 border-[#443223] rounded p-4 flex flex-col justify-between shadow-[4px_4px_0px_#443223] hover:shadow-[6px_6px_0px_#443223] transition-all cursor-pointer select-none"
    >
      <div>
        {/* Source Badge */}
        <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-dashed border-[#A08670]/60">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#443223] text-[#FCF8F2]">
            <ExternalLink className="w-2.5 h-2.5" />
            <span>Open Library Archive</span>
          </span>
          {book.editionCount && (
            <span className="text-[10px] font-mono text-[#72583E] flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#A08670]" />
              <span>{book.editionCount} {book.editionCount === 1 ? 'edition' : 'editions'}</span>
            </span>
          )}
        </div>

        {/* Cover Preview & Metadata side-by-side or stacked */}
        <div className="flex gap-3.5 mb-3">
          {/* Cover */}
          <div className="w-20 sm:w-24 flex-shrink-0 aspect-[2/3] relative rounded overflow-hidden border border-[#443223]/80 bg-[#1A1614] shadow-[2px_2px_0px_#443223]">
            {/* Fallback cloth cover */}
            <div
              className="absolute inset-0 p-2 flex flex-col justify-between text-center select-none"
              style={{
                backgroundColor: palette.bg,
                color: palette.accent,
              }}
            >
              <div
                className="absolute inset-1 border border-dashed rounded pointer-events-none opacity-40"
                style={{ borderColor: palette.border }}
              />
              <span className="font-mono text-[7px] tracking-widest uppercase opacity-75 truncate">
                {book.firstPublishYear || 'ARCHIVE'}
              </span>
              <div className="my-auto px-0.5">
                <Feather className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                <p className="font-editorial text-[10px] leading-tight line-clamp-2">
                  {book.title}
                </p>
              </div>
              <span className="font-mono text-[6px] tracking-widest uppercase opacity-50">
                OPEN LIBRARY
              </span>
            </div>

            {/* Live cover image if available */}
            {!hasError && book.coverUrl && (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h4 className="font-editorial text-base sm:text-lg text-[#443223] font-normal leading-snug line-clamp-2 group-hover:text-[#755151] transition-colors">
                {book.title}
              </h4>
              {book.subtitle && (
                <p className="font-sans text-[11px] text-[#72583E] italic mt-0.5 line-clamp-1">
                  {book.subtitle}
                </p>
              )}
              <p className="font-sans text-xs text-[#755151] font-medium mt-1.5 flex items-center gap-1 truncate">
                <Feather className="w-3 h-3 flex-shrink-0 text-[#A08670]" />
                <span className="truncate">{primaryAuthor}</span>
                {book.authors.length > 1 && (
                  <span className="text-[10px] text-[#A08670]">+{book.authors.length - 1}</span>
                )}
              </p>
            </div>

            {book.firstPublishYear && (
              <div className="mt-2 text-[11px] font-mono text-[#72583E] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#A08670]" />
                <span>First printed {book.firstPublishYear}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subjects Tags */}
        {book.subjects && book.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 mb-3">
            {book.subjects.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EAD4BA]/40 border border-[#A08670]/40 text-[#443223]"
              >
                <Tag className="w-2.5 h-2.5 text-[#72583E]" />
                <span className="truncate max-w-[120px]">{subject}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2.5 border-t border-dashed border-[#A08670]/60 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-[#72583E] italic">
          External Discovery
        </span>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSelect(book);
          }}
          className="px-2.5 py-1 rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] border border-[#443223] font-sans text-xs font-semibold text-[#443223] shadow-[1px_1px_0px_#443223] transition-all cursor-pointer flex items-center gap-1"
        >
          <span>Inspect Dossier</span>
          <BookOpen className="w-3 h-3 text-[#72583E]" />
        </button>
      </div>
    </div>
  );
};

