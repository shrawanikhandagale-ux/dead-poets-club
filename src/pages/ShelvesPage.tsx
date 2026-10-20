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
  { id: 'read', label: 'Finished / Read', icon: CheckCircle2 },
  { id: 'abandoned', label: 'Abandoned', icon: Archive },
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
      <div className="border-b border-[#d3a66d]/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 mb-3 text-xs font-mono text-[#e8c18e]">
            <Bookmark className="w-3.5 h-3.5 text-[#d3a66d]" />
            <span>Personal Bookcases</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f0eae1]">
            My Private Shelves
          </h1>
          <p className="font-sans text-sm text-[#a39b8f] mt-1 max-w-xl">
            Organize your reading journey, active desks, backlogs, and conquered tomes.
          </p>
        </div>

        <NavLink to="/library" className="btn-primary text-xs py-2 px-4 self-start md:self-auto">
          <BookOpen className="w-3.5 h-3.5" />
          Add More Volumes
        </NavLink>
      </div>

      {/* Shelf Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#3e342b] pb-2">
        {SHELF_TABS.map(tab => {
          const Icon = tab.icon;
          const count = shelves.filter(s => s.status === tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-serif font-medium transition-all ${
                isActive
                  ? 'bg-[#784743] text-[#f0eae1] border border-[#d3a66d]/60 shadow-md'
                  : 'bg-[#1a1614] text-[#a39b8f] hover:text-[#f0eae1] hover:bg-[#26201b] border border-[#2e2621]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e8c18e]' : 'text-[#8e8578]'}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
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
        <div className="text-center py-20 bg-[#1a1614]/40 border border-[#3e342b] rounded-2xl">
          <Bookmark className="w-12 h-12 text-[#d3a66d]/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#f0eae1]">This shelf is currently quiet</h3>
          <p className="text-xs text-[#a39b8f] mt-1 max-w-sm mx-auto">
            No volumes are currently placed in your "{activeTab.replace(/_/g, ' ')}" stack.
          </p>
          <NavLink to="/library" className="btn-primary text-xs mt-4 inline-flex">
            Browse the Grand Library
          </NavLink>
        </div>
      )}

      {/* Book Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};
