import React from 'react';
import { Book, ShelfStatus } from '../../types/book';
import { X, Star, Bookmark, BookOpen, Quote, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';

interface BookDetailModalProps {
  book: Book | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { shelves, updateBookShelf } = useAuth();

  if (!book) return null;

  const currentShelf = shelves.find(s => s.book_id === book.id);
  const status = currentShelf?.status;

  const handleShelfChange = (newStatus: ShelfStatus) => {
    updateBookShelf(book.id, newStatus);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FCF8F2] border-3 border-[#443223] rounded-lg shadow-[8px_8px_0px_#443223] p-6 md:p-8 text-[#443223]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded bg-[#FFF9F3] border-2 border-[#443223] text-[#443223] hover:bg-[#DBC4A5] shadow-[2px_2px_0px_#443223] transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover & Shelf Status */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-72 rounded border-2 border-[#443223] overflow-hidden shadow-[4px_4px_0px_#443223] mb-4 bg-[#DBC4A5]">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Shelf Selector Buttons */}
              <div className="w-full flex flex-col gap-1.5 mt-2">
                <p className="text-[10px] font-typewriter text-center uppercase tracking-widest text-[#72583E] font-bold">
                  SHELVE IN LIBRARY
                </p>
                {(['want_to_read', 'currently_reading', 'read', 'abandoned'] as ShelfStatus[]).map(
                  s => {
                    const isSelected = status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleShelfChange(s)}
                        className={`py-1.5 px-3 rounded text-xs font-typewriter font-bold tracking-wide transition-all border-2 ${
                          isSelected
                            ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                            : 'bg-[#FFF9F3] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {s.replace(/_/g, ' ').toUpperCase()}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="md:col-span-2 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-3">
                {book.genres.map(g => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-0.5 rounded bg-[#DBC4A5]/50 border border-[#72583E] text-[#443223] font-typewriter font-bold"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-[#443223] leading-tight">
                {book.title}
              </h2>
              <p className="font-editorial text-lg text-[#755151] font-semibold mt-1 mb-4">
                by {book.author}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 py-3 border-y-2 border-dashed border-[#A08670] mb-5 text-xs font-typewriter">
                <div className="flex items-center gap-1.5 font-bold text-[#755151]">
                  <Star className="w-4 h-4 fill-current text-[#755151]" />
                  <span>{book.rating_avg.toFixed(1)} / 5.0</span>
                  <span className="text-[#A08670]">({book.rating_count} reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-[#72583E]">
                  <Calendar className="w-4 h-4" />
                  <span>{book.publication_year}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-[#72583E]">
                  <Layers className="w-4 h-4" />
                  <span>{book.pages} pages</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-typewriter uppercase tracking-wider text-[#72583E] font-bold mb-1">
                    SYNOPSIS:
                  </h4>
                  <p className="font-typewriter text-xs sm:text-sm text-[#443223] leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Pull Quote Note Card */}
                {book.quote && (
                  <div className="p-4 bg-[#FFF9F3] border-l-4 border-[#755151] border-2 border-[#443223] rounded shadow-[2px_2px_0px_#443223]">
                    <Quote className="w-4 h-4 text-[#755151] mb-1" />
                    <p className="font-typewriter text-xs italic text-[#443223] leading-relaxed">
                      "{book.quote.text}"
                    </p>
                    {book.quote.speaker && (
                      <p className="font-typewriter text-[10px] text-[#755151] font-bold mt-1 text-right">
                        — {book.quote.speaker}
                      </p>
                    )}
                  </div>
                )}

                {/* Member Reviews & Marginalia with Pixel Avatars */}
                <div className="pt-4 border-t-2 border-dashed border-[#A08670]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-typewriter uppercase tracking-wider text-[#72583E] font-bold">
                      BORROWER REVIEWS & MARGINALIA:
                    </h4>
                    <span className="font-mono text-[10px] text-[#755151] font-bold">
                      ARCHIVAL VERIFIED
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Review Slip 1 */}
                    <div className="p-3 bg-[#FCF8F2] border-2 border-[#443223] rounded shadow-[2px_2px_0px_#443223]">
                      <div className="flex items-center justify-between border-b border-dashed border-[#A08670] pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded border border-[#1A1614] bg-[#FFF9F3] overflow-hidden flex items-center justify-center">
                            <PixelAvatar
                              config={{
                                skinTone: '#FFF0E5',
                                hairStyle: 'classic_bob',
                                hairColor: '#443223',
                                accessories: ['round_spectacles'],
                              }}
                              size="xs"
                              viewMode="bust"
                            />
                          </div>
                          <div>
                            <span className="font-typewriter text-xs font-bold text-[#443223] block leading-tight">
                              Eleanor Vance
                            </span>
                            <span className="font-mono text-[9px] text-[#755151]">@eleanor_v · Oct 1889</span>
                          </div>
                        </div>

                        <div className="flex text-amber-700 text-xs">
                          ★★★★★
                        </div>
                      </div>
                      <p className="font-typewriter text-xs text-[#443223] italic leading-relaxed">
                        "The tension is palpable from the first lecture. Unputdownable prose that echoes through the corridors."
                      </p>
                    </div>

                    {/* Review Slip 2 */}
                    <div className="p-3 bg-[#FCF8F2] border-2 border-[#443223] rounded shadow-[2px_2px_0px_#443223]">
                      <div className="flex items-center justify-between border-b border-dashed border-[#A08670] pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded border border-[#1A1614] bg-[#FFF9F3] overflow-hidden flex items-center justify-center">
                            <PixelAvatar
                              config={{
                                skinTone: '#EAD4BA',
                                hairStyle: 'shaggy_mess',
                                hairColor: '#1A1614',
                                accessories: ['wire_rims'],
                              }}
                              size="xs"
                              viewMode="bust"
                            />
                          </div>
                          <div>
                            <span className="font-typewriter text-xs font-bold text-[#443223] block leading-tight">
                              Julian Morrow
                            </span>
                            <span className="font-mono text-[9px] text-[#755151]">@julian_m · Nov 1889</span>
                          </div>
                        </div>

                        <div className="flex text-amber-700 text-xs">
                          ★★★★☆
                        </div>
                      </div>
                      <p className="font-typewriter text-xs text-[#443223] italic leading-relaxed">
                        "Morality dissolves like sugar in tea. A haunting tribute to Greek tragedy in modern attire."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
