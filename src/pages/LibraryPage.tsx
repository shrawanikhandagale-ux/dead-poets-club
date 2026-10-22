import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book } from '../types/book';
import { Search, Filter, BookOpen, Sparkles, Feather } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'All';

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('rating');

  // Extract all unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    SEED_BOOKS.forEach(b => b.genres.forEach(g => set.add(g)));
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Filter & sort books
  const filteredBooks = useMemo(() => {
    return SEED_BOOKS.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'All' || book.genres.some(g => g.toLowerCase().includes(selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
      if (sortBy === 'year') return b.publication_year - a.publication_year;
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, selectedGenre, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-[#443223] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>CURATED STACKS · ARCHIVAL REPOSITORY</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#443223]">
            The Grand Library Catalogue
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1 max-w-xl">
            Explore literary monuments, classics, dark academia reflections, and poetry. Every volume has a voice.
          </p>
        </div>

        <div className="text-xs font-typewriter font-bold text-[#443223] bg-[#DBC4A5] border-2 border-[#443223] shadow-[2px_2px_0px_#443223] px-3.5 py-2 rounded">
          {filteredBooks.length} OF {SEED_BOOKS.length} VOLUMES AVAILABLE
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="catalog-card p-4 bg-[#FCF8F2] border-2 border-[#443223] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or passage..."
            className="w-full px-4 py-2 pl-9 rounded font-typewriter text-xs sm:text-sm bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] placeholder-[#A08670] focus:outline-none focus:border-[#443223]"
          />
          <Search className="w-4 h-4 text-[#72583E] absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-typewriter font-bold text-[#72583E] uppercase">GENRE:</span>
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="text-xs font-typewriter font-bold bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] rounded px-3 py-1.5 outline-none focus:border-[#443223]"
            >
              {genres.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-typewriter font-bold text-[#72583E] uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'title' | 'year' | 'rating')}
              className="text-xs font-typewriter font-bold bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] rounded px-3 py-1.5 outline-none focus:border-[#443223]"
            >
              <option value="rating">Highest Rated</option>
              <option value="year">Publication Year</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="catalog-card p-12 text-center bg-[#FCF8F2] border-2 border-dashed border-[#A08670]">
          <BookOpen className="w-12 h-12 text-[#A08670] mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-[#443223] mb-1">
            No Books Found in the Stacks
          </h3>
          <p className="font-typewriter text-xs text-[#72583E]">
            Try adjusting your search query or reset the genre filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All');
            }}
            className="btn-secondary text-xs mt-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={setSelectedBook}
            />
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};
