import React from 'react';
import { Book, ShelfStatus } from '../../types/book';
import { Star, Bookmark, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BookCoverImage } from './BookCoverImage';

interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { shelves, updateBookShelf } = useAuth();

  const currentShelf = shelves.find(s => s.book_id === book.id);
  const status = currentShelf?.status;

  const handleShelfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as ShelfStatus;
    if (newStatus) {
      updateBookShelf(book.id, newStatus);
    }
  };

  return (
    <div
      onClick={() => onSelect?.(book)}
      className="catalog-card flex flex-col justify-between p-4 cursor-pointer group transition-all duration-200 border-2 border-[#443223] shadow-[4px_4px_0px_#443223] bg-[#FCF8F2] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#443223]"
    >
      <div>
        {/* Cover Image with Heavy Outline */}
        <div className="w-full mb-4 relative overflow-hidden rounded border-2 border-[#443223] bg-[#2A231E]">
          <BookCoverImage book={book} className="w-full" />
          {book.featured && (
            <span className="absolute top-2 right-2 starburst-badge text-[9px] py-0.5 px-2 bg-[#755151] z-20">
              CLUB SELECT
            </span>
          )}
        </div>

        {/* Title & Author */}
        <div className="mb-2">
          <h3 className="font-editorial text-base font-bold text-[#443223] group-hover:text-[#755151] transition-colors leading-snug line-clamp-1">
            {book.title}
          </h3>
          <p className="font-typewriter text-xs text-[#72583E] mt-0.5">
            {book.author} · {book.publication_year}
          </p>
        </div>

        {/* Rating and Genre Tags */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-[#755151] text-xs font-typewriter font-bold">
            <Star className="w-3.5 h-3.5 fill-current text-[#755151]" />
            <span>{book.rating_avg.toFixed(1)}</span>
            <span className="text-[#A08670] text-[10px]">({book.rating_count})</span>
          </div>
          <span className="text-[#A08670]">•</span>
          <span className="text-[10px] font-typewriter font-bold text-[#443223] px-2 py-0.5 rounded bg-[#DBC4A5]/50 border border-[#A08670] truncate">
            {book.genres[0]}
          </span>
        </div>

        {/* Quote if available */}
        {book.quote && (
          <div className="p-2.5 rounded bg-[#FFF9F3] border-l-3 border-[#755151] border-t border-r border-b border-[#A08670] mb-3 text-xs italic text-[#443223] font-typewriter line-clamp-2">
            "{book.quote.text}"
          </div>
        )}
      </div>

      {/* Shelf Action Selector */}
      <div className="pt-3 border-t-2 border-dashed border-[#A08670] flex items-center justify-between mt-auto">
        <span className="text-[10px] font-typewriter uppercase tracking-wider text-[#72583E] flex items-center gap-1 font-bold">
          <Bookmark className="w-3 h-3 text-[#755151]" />
          {status ? status.replace(/_/g, ' ') : 'Not shelved'}
        </span>

        <select
          value={status || ''}
          onChange={handleShelfChange}
          onClick={e => e.stopPropagation()}
          className="text-xs font-typewriter font-bold bg-[#FFF9F3] text-[#443223] border border-[#443223] rounded px-2 py-1 outline-none cursor-pointer hover:bg-[#DBC4A5]/30 transition-colors"
        >
          <option value="" disabled>Shelve</option>
          <option value="want_to_read">Want to Read</option>
          <option value="currently_reading">Reading</option>
          <option value="read">Finished</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>
    </div>
  );
};
