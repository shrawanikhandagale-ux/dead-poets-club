import React, { useState, useMemo } from 'react';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book } from '../types/book';
import { Search, Filter, BookOpen, Sparkles } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
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
        selectedGenre === 'All' || book.genres.includes(selectedGenre);

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
      <div className="border-b border-[#d3a66d]/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 mb-3 text-xs font-mono text-[#e8c18e]">
            <BookOpen className="w-3.5 h-3.5 text-[#d3a66d]" />
            <span>Curated Stacks</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f0eae1]">
            The Grand Library
          </h1>
          <p className="font-sans text-sm text-[#a39b8f] mt-1 max-w-xl">
            Explore 30+ literary monuments, dark academia classics, psychological thrillers, and evocative poetry.
          </p>
        </div>

        <div className="text-xs font-mono text-[#d3a66d] bg-[#1a1614] border border-[#d3a66d]/30 px-3.5 py-2 rounded-lg">
          Showing {filteredBooks.length} of {SEED_BOOKS.length} Volumes
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or passage..."
            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-[#1a1614] border border-[#3e342b] text-sm text-[#f0eae1] placeholder-[#6e6559] focus:outline-none focus:border-[#d3a66d] transition-colors"
          />
          <Search className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8e8578] uppercase">Genre:</span>
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="text-xs bg-[#1a1614] border border-[#3e342b] text-[#e8c18e] rounded-lg px-3 py-2 outline-none focus:border-[#d3a66d]"
            >
              {genres.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8e8578] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-[#1a1614] border border-[#3e342b] text-[#e8c18e] rounded-lg px-3 py-2 outline-none focus:border-[#d3a66d]"
            >
              <option value="rating">Top Rated</option>
              <option value="year">Publication Year</option>
              <option value="title">Alphabetical Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1a1614]/50 border border-[#3e342b] rounded-2xl">
          <BookOpen className="w-12 h-12 text-[#d3a66d]/40 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#f0eae1]">No volumes matched your inquiry</h3>
          <p className="text-xs text-[#a39b8f] mt-1">Try adjusting your search terms or genre filter.</p>
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
      )}

      {/* Book Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};
