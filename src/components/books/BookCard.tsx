import React from 'react';
import { Book, ShelfStatus } from '../../types/book';
import { Star, Bookmark, Check, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerInkSplatter } from '../../lib/animeAnimations';

interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { shelves, updateBookShelf, user } = useAuth();

  const currentShelf = shelves.find(s => s.book_id === book.id);
  const status = currentShelf?.status;

  const handleShelfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as ShelfStatus;
    if (newStatus) {
      updateBookShelf(book.id, newStatus);
      triggerInkSplatter(window.innerWidth / 2, window.innerHeight / 2);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(book)}
      className="parchment-card book-item-card flex flex-col justify-between p-4 cursor-pointer group transition-all duration-300 hover:border-[#d3a66d]/60 rounded-xl bg-[#1b1714]/90"
    >
      <div>
        {/* Cover Image with 3D Spine Sheen */}
        <div className="book-cover-wrap w-full h-64 mb-4 relative overflow-hidden rounded-md bg-[#241f1c]">
          <img
            src={book.cover_url}
            alt={book.title}
            className="book-cover w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {book.featured && (
            <span className="absolute top-2 right-2 bg-[#784743]/90 text-[#f0eae1] border border-[#d3a66d]/50 text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 rounded shadow">
              Club Select
            </span>
          )}
        </div>

        {/* Title & Author */}
        <div className="mb-2">
          <h3 className="font-serif text-base font-semibold text-[#f0eae1] group-hover:text-[#e8c18e] transition-colors leading-snug line-clamp-1">
            {book.title}
          </h3>
          <p className="text-xs font-sans text-[#a39b8f] mt-0.5">{book.author} · {book.publication_year}</p>
        </div>

        {/* Rating and Genre Tags */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-[#d3a66d] text-xs font-mono">
            <Star className="w-3.5 h-3.5 fill-current text-[#d3a66d]" />
            <span>{book.rating_avg.toFixed(1)}</span>
            <span className="text-[#6e665a] text-[10px]">({book.rating_count})</span>
          </div>
          <span className="text-[#3e362e]">•</span>
          <span className="text-[11px] font-sans text-[#8e9c82] px-2 py-0.5 rounded-full bg-[#75816a]/15 border border-[#75816a]/30 truncate">
            {book.genres[0]}
          </span>
        </div>

        {/* Quote if available */}
        {book.quote && (
          <div className="p-2.5 rounded bg-[#151210] border-l-2 border-[#d3a66d]/40 mb-3 text-xs italic text-[#c7beaf] font-serif line-clamp-2">
            "{book.quote.text}"
          </div>
        )}
      </div>

      {/* Shelf Action Selector */}
      <div className="pt-3 border-t border-[#d3a66d]/15 flex items-center justify-between mt-auto">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#7a7164] flex items-center gap-1">
          <Bookmark className="w-3 h-3 text-[#d3a66d]" />
          {status ? status.replace(/_/g, ' ') : 'Not shelved'}
        </span>

        <select
          value={status || ''}
          onChange={handleShelfChange}
          onClick={e => e.stopPropagation()}
          className="text-xs bg-[#241e1a] text-[#e8c18e] border border-[#d3a66d]/30 rounded px-2 py-1 outline-none focus:border-[#d3a66d] cursor-pointer hover:bg-[#2c2520] transition-colors"
        >
          <option value="" disabled>Add to Shelf</option>
          <option value="want_to_read">Want to Read</option>
          <option value="currently_reading">Currently Reading</option>
          <option value="read">Finished / Read</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>
    </div>
  );
};
