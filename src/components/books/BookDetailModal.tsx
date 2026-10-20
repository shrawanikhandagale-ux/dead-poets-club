import React from 'react';
import { Book, ShelfStatus } from '../../types/book';
import { X, Star, Bookmark, BookOpen, Quote, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { triggerInkSplatter } from '../../lib/animeAnimations';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { shelves, updateBookShelf } = useAuth();

  if (!book) return null;

  const currentShelf = shelves.find(s => s.book_id === book.id);
  const status = currentShelf?.status;

  const handleShelfChange = (newStatus: ShelfStatus) => {
    updateBookShelf(book.id, newStatus);
    triggerInkSplatter(window.innerWidth / 2, window.innerHeight / 2);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#181412] border border-[#d3a66d]/40 rounded-2xl shadow-2xl p-6 md:p-8 text-[#f0eae1]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#241e1a] text-[#a39b8f] hover:text-[#f0eae1] hover:bg-[#342b25] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover & Shelf Status */}
            <div className="flex flex-col items-center">
              <div className="book-cover-wrap w-48 h-72 rounded-lg overflow-hidden shadow-2xl border border-[#3e342b] mb-4">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Shelf Selector Buttons */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <p className="text-[11px] font-mono text-center uppercase tracking-widest text-[#d3a66d]">
                  Personal Shelf
                </p>
                {(['want_to_read', 'currently_reading', 'read', 'abandoned'] as ShelfStatus[]).map(
                  s => {
                    const isSelected = status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleShelfChange(s)}
                        className={`py-2 px-3 rounded-lg text-xs font-sans tracking-wide transition-all border ${
                          isSelected
                            ? 'bg-[#784743] text-[#f0eae1] border-[#d3a66d] shadow-md'
                            : 'bg-[#221c19] text-[#a39b8f] border-[#382f28] hover:border-[#d3a66d]/50 hover:text-[#f0eae1]'
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
                    className="text-xs px-2.5 py-1 rounded-full bg-[#75816a]/20 border border-[#75816a]/40 text-[#c2d4b8] font-sans"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#f0eae1] leading-tight">
                {book.title}
              </h2>
              <p className="font-serif text-lg text-[#d3a66d] mt-1 mb-4">by {book.author}</p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#201a16] border border-[#d3a66d]/20 rounded-xl mb-6 text-center">
                <div>
                  <span className="block text-[11px] text-[#8e8578] uppercase font-mono">Rating</span>
                  <span className="font-serif text-base text-[#e8c18e] font-semibold flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-current text-[#d3a66d]" /> {book.rating_avg.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#8e8578] uppercase font-mono">Pages</span>
                  <span className="font-serif text-base text-[#e8c18e] font-semibold">
                    {book.pages}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#8e8578] uppercase font-mono">Published</span>
                  <span className="font-serif text-base text-[#e8c18e] font-semibold">
                    {book.publication_year}
                  </span>
                </div>
              </div>

              {/* Quote Block */}
              {book.quote && (
                <div className="p-4 rounded-xl bg-[#231b17] border-l-4 border-[#784743] mb-6 relative">
                  <Quote className="w-5 h-5 text-[#d3a66d]/40 absolute top-3 right-3" />
                  <p className="font-serif italic text-sm text-[#e8dfcb] leading-relaxed">
                    "{book.quote.text}"
                  </p>
                  {book.quote.speaker && (
                    <p className="font-sans text-xs text-[#d3a66d] mt-2 font-medium">
                      — {book.quote.speaker}
                    </p>
                  )}
                </div>
              )}

              {/* Synopsis */}
              <div>
                <h4 className="font-serif text-sm tracking-wider uppercase text-[#a39b8f] mb-2">
                  Synopsis
                </h4>
                <p className="font-sans text-sm text-[#cac1b3] leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
