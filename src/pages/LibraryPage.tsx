import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book } from '../types/book';
import { Search, Filter, BookOpen, Sparkles, Feather, MessageSquareQuote, Star } from 'lucide-react';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { soundEngine } from '../lib/audioEngine';

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'books';
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

  const handleTabChange = (tab: 'books' | 'reviews') => {
    soundEngine.playClick();
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'reviews') {
      newParams.set('tab', 'reviews');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  // Sample curated reviews for the Reviews tab
  const curatedReviews: Array<{
    id: string;
    book: Book;
    author: string;
    username: string;
    date: string;
    rating: number;
    avatar: Partial<import('../types/profile').AvatarConfig>;
    text: string;
  }> = [
    {
      id: 'rev-1',
      book: SEED_BOOKS[0],
      author: 'Eleanor Vance',
      username: 'eleanor_v',
      date: 'Autumn 1889',
      rating: 5,
      avatar: { skinTone: '#FFF0E5', hairStyle: 'classic_bob', hairColor: '#443223', accessories: ['round_spectacles'] },
      text: 'The tension in Tartt’s prose is palpable from Julian’s first lecture on terror and beauty. A transcendent masterpiece that echoes endlessly through academic cloisters.',
    },
    {
      id: 'rev-2',
      book: SEED_BOOKS[1],
      author: 'Julian Morrow',
      username: 'julian_m',
      date: 'Winter 1889',
      rating: 5,
      avatar: { skinTone: '#EAD4BA', hairStyle: 'shaggy_mess', hairColor: '#1A1614', accessories: ['wire_rims'] },
      text: 'Words and ideas truly can change the world. Keating taught us that poetry is the very essence of human passion and freedom.',
    },
    {
      id: 'rev-3',
      book: SEED_BOOKS[2],
      author: 'Beatrix King',
      username: 'beatrix_k',
      date: 'Spring 1890',
      rating: 4.8,
      avatar: { skinTone: '#D4AA7D', hairStyle: 'wavy_locks', hairColor: '#8D3F37', accessories: ['french_beret'] },
      text: 'Wilde’s aesthetic philosophy is razor-sharp. Dorian’s portrait becomes the ultimate psychological mirror of artistic corruption.',
    },
    {
      id: 'rev-4',
      book: SEED_BOOKS[3],
      author: 'Miles Bennett',
      username: 'miles_b',
      date: 'Autumn 2017',
      rating: 4.7,
      avatar: { skinTone: '#66442E', hairStyle: 'slick_back', hairColor: '#1A1614', accessories: ['wire_rims'] },
      text: 'Seven Shakespearean actors playing tragic roles that bleed into real life. Rio weaves theatrical passion with devastating dark academia suspense.',
    },
    {
      id: 'rev-5',
      book: SEED_BOOKS[4],
      author: 'Sora Lin',
      username: 'sora_l',
      date: 'Winter 1987',
      rating: 4.9,
      avatar: { skinTone: '#FFF0E5', hairStyle: 'classic_bob', hairColor: '#1A1614', accessories: ['round_spectacles'] },
      text: 'Murakami writes loneliness and memory with acoustic purity. The vinyl record hiss and rainy Tokyo streets linger long after the final page.',
    },
    {
      id: 'rev-6',
      book: SEED_BOOKS[5],
      author: 'Theodore Price',
      username: 'theodore_p',
      date: 'Spring 1987',
      rating: 5,
      avatar: { skinTone: '#EAD4BA', hairStyle: 'side_part', hairColor: '#72583E', accessories: ['round_spectacles'] },
      text: 'Toni Morrison’s Beloved is profound, haunted, and unflinching. Claiming ownership of oneself is the truest poetic defiance.',
    },
  ];

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
            {currentTab === 'reviews' ? 'Borrower Reviews & Marginalia' : 'The Grand Library Catalogue'}
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1 max-w-xl">
            {currentTab === 'reviews'
              ? 'Handwritten reflections, stamped ratings, and marginalia left by fellow poets in the library stacks.'
              : 'Explore literary monuments, classics, dark academia reflections, and poetry. Every volume has a voice.'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('books')}
            className={`px-4 py-2 rounded font-typewriter text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-2 ${
              currentTab !== 'reviews'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Volumes ({SEED_BOOKS.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('reviews')}
            className={`px-4 py-2 rounded font-typewriter text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'reviews'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]/40'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Borrower Reviews ({curatedReviews.length})</span>
          </button>
        </div>
      </div>

      {currentTab === 'reviews' ? (
        /* Reviews View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedReviews.map(rev => (
              <div
                key={rev.id}
                className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-center justify-between border-b border-dashed border-[#A08670] pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded border border-[#1A1614] bg-[#FFF9F3] overflow-hidden flex items-center justify-center">
                        <PixelAvatar config={rev.avatar} size="xs" viewMode="bust" />
                      </div>
                      <div>
                        <span className="font-typewriter text-xs font-bold text-[#443223] block leading-tight">
                          {rev.author}
                        </span>
                        <span className="font-mono text-[9px] text-[#755151]">
                          @{rev.username} · {rev.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-typewriter font-bold text-[#755151]">
                      <Star className="w-3.5 h-3.5 fill-current text-[#755151]" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Book Reference */}
                  <div className="mb-2">
                    <span className="font-typewriter text-[10px] uppercase tracking-wider text-[#A08670] block">
                      MARGINALIA ON:
                    </span>
                    <button
                      onClick={() => setSelectedBook(rev.book)}
                      className="font-editorial text-sm font-bold text-[#755151] hover:underline text-left block"
                    >
                      {rev.book.title}
                    </button>
                  </div>

                  {/* Review Text */}
                  <p className="font-typewriter text-xs text-[#443223] italic leading-relaxed bg-[#FFF9F3] p-3 rounded border border-[#DBC4A5]">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#A08670] mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#72583E]">
                    ARCHIVAL VERIFIED BORROWER
                  </span>
                  <button
                    onClick={() => setSelectedBook(rev.book)}
                    className="text-[10px] font-typewriter font-bold text-[#FFF9F3] bg-[#755151] px-2 py-0.5 rounded border border-[#443223] hover:brightness-110"
                  >
                    View Volume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Catalogue Books View */
        <>
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
        </>
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
