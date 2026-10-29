import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Book, ShelfStatus } from '../../types/book';
import { X, Star, Bookmark, BookOpen, Quote, Calendar, Layers, Feather, Share2, PenTool, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { BookCoverImage } from './BookCoverImage';

interface BookDetailModalProps {
  book: Book | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const { shelves, updateBookShelf } = useAuth();
  const [annotationText, setAnnotationText] = useState('');
  const [annotationSaved, setAnnotationSaved] = useState(false);

  if (!book) return null;

  const currentShelf = shelves.find(s => s.book_id === book.id);
  const status = currentShelf?.status;

  const handleShelfChange = (newStatus: ShelfStatus) => {
    updateBookShelf(book.id, newStatus);
  };

  const handleSaveAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annotationText.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('dpc_user_annotations') || '[]');
      const newNote = {
        id: `note-${Date.now()}`,
        book_id: book.id,
        book_title: book.title,
        note: annotationText.trim(),
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('dpc_user_annotations', JSON.stringify([newNote, ...existing]));
      setAnnotationSaved(true);
      setTimeout(() => setAnnotationSaved(false), 2500);
      setAnnotationText('');
    } catch {
      // Storage error
    }
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
            aria-label="Close Book Dossier"
            className="absolute top-5 right-5 p-2 rounded bg-[#FFF9F3] border-2 border-[#443223] text-[#443223] hover:bg-[#DBC4A5] shadow-[2px_2px_0px_#443223] transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover & Shelf Status */}
            <div className="flex flex-col items-center">
              <div className="w-48 mb-4">
                <BookCoverImage book={book} className="w-48" />
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
                        className={`py-1.5 px-3 rounded text-xs font-typewriter font-bold tracking-wide transition-all border-2 cursor-pointer ${
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

                {/* Direct Action: Leave This Book for Someone */}
                <NavLink
                  to={`/margins?section=leave-book&bookId=${book.id}`}
                  onClick={onClose}
                  className="mt-2 py-2 px-3 rounded text-xs font-typewriter font-bold text-center bg-[#755151] text-[#FFF9F3] border-2 border-[#443223] shadow-[2px_2px_0px_#443223] flex items-center justify-center gap-1.5 text-decoration-none hover:bg-[#855d5d]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Leave for Someone</span>
                </NavLink>
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

              {/* Author link */}
              <div className="mt-1 mb-4 flex items-center gap-2">
                <span className="font-editorial text-lg text-[#755151] font-semibold">
                  by
                </span>
                <NavLink
                  to={`/authors?author=${encodeURIComponent(book.author)}`}
                  onClick={onClose}
                  className="font-editorial text-lg text-[#755151] font-bold underline decoration-[#755151] hover:text-[#443223] transition-colors"
                >
                  {book.author}
                </NavLink>
              </div>

              {/* Bibliographic Details Bar */}
              <div className="flex flex-wrap items-center gap-3 py-3 border-y-2 border-dashed border-[#A08670] mb-5 text-xs font-typewriter">
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
                {book.isbn && (
                  <>
                    <span>•</span>
                    <span className="text-[#A08670]">ISBN {book.isbn}</span>
                  </>
                )}
                {book.publisher && (
                  <>
                    <span>•</span>
                    <span className="text-[#72583E] italic">{book.publisher}</span>
                  </>
                )}
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

                {/* Private Marginalia Note Form (Section 10: User Created Annotation) */}
                <div className="p-4 bg-[#FAF4EB] border-2 border-[#443223] rounded shadow-[2px_2px_0px_#443223]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-typewriter text-xs font-bold text-[#755151] uppercase flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" /> Private Marginalia & Notes
                    </span>
                    <span className="text-[10px] font-typewriter text-[#A08670] italic">
                      Saved to your personal shelf
                    </span>
                  </div>
                  <form onSubmit={handleSaveAnnotation} className="space-y-2">
                    <textarea
                      value={annotationText}
                      onChange={e => setAnnotationText(e.target.value)}
                      placeholder="Write your private note, reflections, or page quotes on this book..."
                      className="w-full p-2.5 text-xs font-typewriter border border-[#A08670] rounded bg-[#FFF9F3] text-[#443223] focus:outline-none focus:border-[#755151] min-h-[60px]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!annotationText.trim()}
                        className="btn-secondary text-[11px] py-1 px-3 disabled:opacity-50"
                      >
                        {annotationSaved ? (
                          <>
                            <Check className="w-3 h-3 text-green-700" />
                            <span>Saved to My Shelf!</span>
                          </>
                        ) : (
                          <span>Save Private Note</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Borrower Reviews & Marginalia */}
                <div className="pt-4 border-t-2 border-dashed border-[#A08670]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-typewriter uppercase tracking-wider text-[#72583E] font-bold">
                      BORROWER REVIEWS:
                    </h4>
                    <NavLink
                      to={`/reviews?bookId=${book.id}`}
                      onClick={onClose}
                      className="font-typewriter text-[11px] text-[#755151] font-bold hover:underline"
                    >
                      Browse All Reviews →
                    </NavLink>
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
                            <span className="font-mono text-[9px] text-[#755151]">@eleanor_v · Welton Fellow</span>
                          </div>
                        </div>

                        <div className="flex text-amber-700 text-xs">
                          ★★★★★
                        </div>
                      </div>
                      <p className="font-typewriter text-xs text-[#443223] italic leading-relaxed">
                        "Unputdownable prose that echoes through the corridors. An essential piece of literature for anyone living between lines."
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
