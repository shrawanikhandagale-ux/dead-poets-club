import React, { useState } from 'react';
import { ExternalBookResult } from '../../types/catalogue';
import {
  X,
  ExternalLink,
  Feather,
  Calendar,
  Layers,
  BookOpen,
  Tag,
  Globe,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExternalBookDetailModalProps {
  book: ExternalBookResult | null;
  isOpen?: boolean;
  onClose: () => void;
}

const PALETTES = [
  { bg: '#2C221E', accent: '#DBC4A5', border: '#5C4838' },
  { bg: '#1E2822', accent: '#C8DACD', border: '#3B4E42' },
  { bg: '#2B1B24', accent: '#EAD1DB', border: '#5A384A' },
  { bg: '#1A232E', accent: '#C6D4E4', border: '#35475E' },
  { bg: '#33271D', accent: '#F0E0CB', border: '#684F3B' },
];

export const ExternalBookDetailModal: React.FC<ExternalBookDetailModalProps> = ({
  book,
  onClose,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!book) return null;

  const hash = book.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = PALETTES[hash % PALETTES.length];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FCF8F2] border-3 border-[#443223] rounded-lg shadow-[8px_8px_0px_#443223] p-6 sm:p-8 text-[#443223]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close External Dossier"
            className="absolute top-5 right-5 p-2 rounded bg-[#FFF9F3] border-2 border-[#443223] text-[#443223] hover:bg-[#DBC4A5] shadow-[2px_2px_0px_#443223] transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Archival Status Banner */}
          <div className="mb-6 p-3.5 rounded bg-[#EAD4BA]/40 border-2 border-dashed border-[#A08670] flex items-start gap-3 text-xs text-[#5C4838]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#755151]" />
            <div>
              <p className="font-sans font-semibold text-[#443223]">
                External Archival Record · Not Yet Shelved in Sanctuary
              </p>
              <p className="font-sans text-[11px] text-[#72583E] mt-0.5 leading-relaxed">
                This volume was discovered in the Open Library global repository. It is accessible for reading exploration, but shelf tracking and borrower marginalia are currently reserved for canonical club stacks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Left: Cover & External Action */}
            <div className="flex flex-col items-center">
              <div className="w-40 sm:w-full aspect-[2/3] relative rounded overflow-hidden border-2 border-[#443223] bg-[#1A1614] shadow-[4px_4px_0px_#443223] mb-4">
                {/* Fallback cloth cover */}
                <div
                  className="absolute inset-0 p-3 flex flex-col justify-between text-center select-none"
                  style={{
                    backgroundColor: palette.bg,
                    color: palette.accent,
                  }}
                >
                  <div
                    className="absolute inset-1.5 border border-dashed rounded pointer-events-none opacity-40"
                    style={{ borderColor: palette.border }}
                  />
                  <span className="font-mono text-[8px] tracking-widest uppercase opacity-75">
                    {book.firstPublishYear || 'ARCHIVAL VOLUME'}
                  </span>
                  <div className="my-auto px-1">
                    <Feather className="w-4 h-4 mx-auto mb-1 opacity-60" />
                    <h4 className="font-editorial text-sm font-normal leading-tight line-clamp-3">
                      {book.title}
                    </h4>
                    <p className="font-mono text-[9px] mt-1 opacity-80 truncate">
                      {book.authors[0]?.name || 'Unknown Author'}
                    </p>
                  </div>
                  <span className="font-mono text-[7px] tracking-widest uppercase opacity-50">
                    OPEN LIBRARY
                  </span>
                </div>

                {/* Cover Image */}
                {!hasError && book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={`Front cover of ${book.title}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
              </div>

              {/* Direct Open Library External Link */}
              <a
                href={book.openLibraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded text-xs font-sans font-semibold text-center bg-[#755151] hover:bg-[#855d5d] text-[#FFF9F3] border-2 border-[#443223] shadow-[2px_2px_0px_#443223] flex items-center justify-center gap-1.5 text-decoration-none transition-all cursor-pointer"
              >
                <span>View on Open Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="font-mono text-[10px] text-[#A08670] text-center mt-2">
                Work ID: {book.workId}
              </p>
            </div>

            {/* Right: Rich Metadata Dossier */}
            <div className="sm:col-span-2 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#755151] uppercase tracking-wider mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Open Library Bibliographic Record</span>
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl text-[#443223] font-normal leading-tight">
                  {book.title}
                </h2>

                {book.subtitle && (
                  <p className="font-sans text-sm text-[#72583E] italic mt-1">
                    {book.subtitle}
                  </p>
                )}

                {/* Authors */}
                <div className="mt-3 pb-3 border-b border-dashed border-[#A08670]">
                  <p className="text-[11px] font-mono text-[#72583E] uppercase tracking-wider mb-1">
                    Inscribed Authors
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {book.authors.map((author, idx) => (
                      <span
                        key={idx}
                        className="font-sans text-sm font-semibold text-[#443223] flex items-center gap-1.5 bg-[#FFF9F3] px-2.5 py-1 rounded border border-[#A08670]/60 shadow-[1px_1px_0px_#443223]"
                      >
                        <Feather className="w-3 h-3 text-[#755151]" />
                        <span>{author.name}</span>
                        {author.id && (
                          <span className="text-[10px] font-mono text-[#A08670]">
                            ({author.id})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bibliographic Specs Grid */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  {book.firstPublishYear && (
                    <div className="p-2.5 rounded bg-[#FFF9F3] border border-[#A08670]/40">
                      <span className="text-[10px] font-mono text-[#72583E] uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#755151]" />
                        First Publication
                      </span>
                      <p className="font-sans text-xs font-semibold text-[#443223] mt-0.5">
                        {book.firstPublishYear}
                      </p>
                    </div>
                  )}

                  {book.editionCount && (
                    <div className="p-2.5 rounded bg-[#FFF9F3] border border-[#A08670]/40">
                      <span className="text-[10px] font-mono text-[#72583E] uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#755151]" />
                        Indexed Editions
                      </span>
                      <p className="font-sans text-xs font-semibold text-[#443223] mt-0.5">
                        {book.editionCount} editions
                      </p>
                    </div>
                  )}

                  {book.languages && book.languages.length > 0 && (
                    <div className="p-2.5 rounded bg-[#FFF9F3] border border-[#A08670]/40">
                      <span className="text-[10px] font-mono text-[#72583E] uppercase flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#755151]" />
                        Languages
                      </span>
                      <p className="font-sans text-xs font-semibold text-[#443223] mt-0.5 uppercase truncate">
                        {book.languages.join(', ')}
                      </p>
                    </div>
                  )}

                  {book.primaryIsbn && (
                    <div className="p-2.5 rounded bg-[#FFF9F3] border border-[#A08670]/40">
                      <span className="text-[10px] font-mono text-[#72583E] uppercase flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#755151]" />
                        Primary ISBN
                      </span>
                      <p className="font-mono text-xs font-semibold text-[#443223] mt-0.5 truncate">
                        {book.primaryIsbn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                {book.subjects && book.subjects.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-mono text-[#72583E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#755151]" />
                      <span>Subject Classifications</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {book.subjects.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EAD4BA]/40 border border-[#A08670]/50 text-[#443223]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attribution Citation */}
              <div className="pt-3 border-t border-dashed border-[#A08670] mt-2">
                <p className="font-sans text-[11px] text-[#72583E] leading-tight">
                  <span className="font-semibold text-[#443223]">Source Attribution: </span>
                  {book.sourceAttribution}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

