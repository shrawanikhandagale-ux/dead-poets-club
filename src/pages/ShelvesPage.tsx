import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book, ShelfStatus } from '../types/book';
import { Bookmark, BookOpen, Clock, CheckCircle2, Archive, Sparkles } from 'lucide-react';

const SHELF_TABS: { id: ShelfStatus; label: string; icon: any }[] = [
  { id: 'currently_reading', label: 'Currently Reading', icon: Clock },
  { id: 'want_to_read', label: 'Want to Read', icon: Bookmark },
  { id: 'read', label: 'Finished / Conquered', icon: CheckCircle2 },
  { id: 'abandoned', label: 'Set Aside', icon: Archive },
];

export const ShelvesPage: React.FC = () => {
  const { shelves } = useAuth();
  const [activeTab, setActiveTab] = useState<ShelfStatus>('currently_reading');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filter books matching current tab
  const shelfItems = shelves.filter(s => s.status === activeTab);
  const booksInShelf = shelfItems
    .map(item => SEED_BOOKS.find(b => b.id === item.book_id))
    .filter((b): b is Book => Boolean(b));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#443223] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-3">
            <Bookmark className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>PERSONAL BORROWER ARCHIVES</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            My Reading Shelves
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1 max-w-xl">
            Track active reading desks, to-be-read backlogs, and conquered literary treasures.
          </p>
        </div>

        <NavLink to="/library" className="btn-primary text-xs py-2.5 px-4 self-start md:self-auto">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Add More Volumes</span>
        </NavLink>
      </div>

      {/* Shelf Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-dashed border-[#A08670] pb-4">
        {SHELF_TABS.map(tab => {
          const Icon = tab.icon;
          const count = shelves.filter(s => s.status === tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-typewriter font-bold transition-all border-2 ${
                isActive
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[3px_3px_0px_#443223]'
                  : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFF9F3]' : 'text-[#755151]'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#DBC4A5] text-[#443223]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Shelved Books */}
      {booksInShelf.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {booksInShelf.map(book => (
            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
        </div>
      ) : (
        <div className="catalog-card p-12 text-center bg-[#FCF8F2] border-2 border-dashed border-[#A08670]">
          <Bookmark className="w-12 h-12 text-[#A08670] mx-auto mb-3" />
          <h3 className="font-editorial text-xl font-bold text-[#443223]">This shelf is currently quiet</h3>
          <p className="font-typewriter text-xs text-[#72583E] mt-1 max-w-sm mx-auto">
            No volumes are currently placed in your "{activeTab.replace(/_/g, ' ')}" stack.
          </p>
          <NavLink to="/library" className="btn-secondary text-xs mt-4 inline-flex">
            Browse the Grand Library
          </NavLink>
        </div>
      )}

      {/* Book Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};
