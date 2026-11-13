import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { localService } from '../lib/supabase';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { ExternalBookCard } from '../components/books/ExternalBookCard';
import { ExternalBookDetailModal } from '../components/books/ExternalBookDetailModal';
import { Book } from '../types/book';
import { ExternalBookResult } from '../types/catalogue';
import { openLibraryService } from '../services/externalCatalogueService';
import {
  Search,
  Filter,
  BookOpen,
  Sparkles,
  Feather,
  MessageSquareQuote,
  Star,
  Compass,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Library,
} from 'lucide-react';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { soundEngine } from '../lib/audioEngine';

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'books';
  const initialGenre = searchParams.get('genre') || 'All';

  const [books, setBooks] = useState<Book[]>(SEED_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('rating');

  // External Discovery (Open Library) State
  const initialExtQuery = searchParams.get('extQuery') || '';
  const [extQuery, setExtQuery] = useState(initialExtQuery);
  const [extSearchType, setExtSearchType] = useState<'all' | 'title' | 'author'>('all');
  const [extPage, setExtPage] = useState(1);
  const [extLoading, setExtLoading] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);
  const [extResults, setExtResults] = useState<ExternalBookResult[]>([]);
  const [extTotalFound, setExtTotalFound] = useState(0);
  const [extTotalPages, setExtTotalPages] = useState(0);
  const [extHasSearched, setExtHasSearched] = useState(false);
  const [extLastSearched, setExtLastSearched] = useState('');
  const [selectedExternalBook, setSelectedExternalBook] = useState<ExternalBookResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;
    localService.getBooks().then(data => {
      if (isMounted && data && data.length > 0) {
        setBooks(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const performExternalSearch = async (
    queryText: string,
    type: 'all' | 'title' | 'author' = extSearchType,
    pageToLoad = 1
  ) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setExtResults([]);
      setExtTotalFound(0);
      setExtTotalPages(0);
      setExtHasSearched(false);
      setExtError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setExtLoading(true);
    setExtError(null);
    setExtHasSearched(true);
    setExtLastSearched(trimmed);
    setExtPage(pageToLoad);

    try {
      const searchParamsObj: any = {
        searchType: type,
        page: pageToLoad,
        limit: 24,
      };
      if (type === 'title') {
        searchParamsObj.title = trimmed;
      } else if (type === 'author') {
        searchParamsObj.author = trimmed;
      } else {
        searchParamsObj.query = trimmed;
      }

      const response = await openLibraryService.searchBooks(searchParamsObj, controller.signal);
      setExtResults(response.results);
      setExtTotalFound(response.totalFound);
      setExtTotalPages(response.totalPages);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setExtError(err?.message || 'Failed to search Open Library archive.');
      setExtResults([]);
    } finally {
      setExtLoading(false);
    }
  };

  // Auto-search if navigated with ?tab=discovery&extQuery=...
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const queryParam = searchParams.get('extQuery');
    if (tabParam === 'discovery' && queryParam && queryParam !== extLastSearched) {
      setExtQuery(queryParam);
      performExternalSearch(queryParam, extSearchType, 1);
    }
  }, [searchParams]);

  // Extract all unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => b.genres.forEach(g => set.add(g)));
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Filter & sort books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        (book.isbn && book.isbn.toLowerCase().includes(q));

      const matchesGenre =
        selectedGenre === 'All' || book.genres.some(g => g.toLowerCase().includes(selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
      if (sortBy === 'year') return b.publication_year - a.publication_year;
      return a.title.localeCompare(b.title);
    });
  }, [books, searchQuery, selectedGenre, sortBy]);

  const handleTabChange = (tab: 'books' | 'reviews' | 'discovery', defaultQuery?: string) => {
    soundEngine.playClick();
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'reviews') {
      newParams.set('tab', 'reviews');
      newParams.delete('extQuery');
    } else if (tab === 'discovery') {
      newParams.set('tab', 'discovery');
      if (defaultQuery) {
        newParams.set('extQuery', defaultQuery);
      }
    } else {
      newParams.delete('tab');
      newParams.delete('extQuery');
    }
    setSearchParams(newParams);

    if (tab === 'discovery' && defaultQuery) {
      setExtQuery(defaultQuery);
      performExternalSearch(defaultQuery, 'all', 1);
    }
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
            {currentTab === 'discovery' ? (
              <Compass className="w-3.5 h-3.5 text-[#FFF9F3]" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-[#FFF9F3]" />
            )}
            <span>
              {currentTab === 'discovery'
                ? 'GLOBAL OPEN ARCHIVE · WIDER STACKS'
                : 'CURATED STACKS · ARCHIVAL REPOSITORY'}
            </span>
          </div>
          <h1 className="type-page-title text-[#443223]">
            {currentTab === 'reviews'
              ? 'Borrower Reviews & Marginalia'
              : currentTab === 'discovery'
              ? 'The Wider Stacks'
              : 'The Grand Library Catalogue'}
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#72583E] mt-1.5 max-w-xl leading-relaxed">
            {currentTab === 'reviews'
              ? 'Go on. Read what the books did to everyone else.'
              : currentTab === 'discovery'
              ? 'Search millions of archival editions across the Open Library open repository.'
              : 'Another room full of things we swear we’ll finish before winter.'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTabChange('books')}
            className={`px-4 py-2 rounded font-sans text-xs font-semibold border-2 transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'books'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Volumes ({books.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('reviews')}
            className={`px-4 py-2 rounded font-sans text-xs font-semibold border-2 transition-all cursor-pointer flex items-center gap-2 ${currentTab === 'reviews'
              ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
              : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]/40'
              }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Borrower Reviews ({curatedReviews.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('discovery')}
            className={`px-4 py-2 rounded font-sans text-xs font-semibold border-2 transition-all cursor-pointer flex items-center gap-2 ${
              currentTab === 'discovery'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Wider Stacks</span>
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
                        <span className="font-sans text-xs font-semibold text-[#443223] block leading-tight">
                          {rev.author}
                        </span>
                        <span className="font-mono text-[10px] text-[#755151]">
                          @{rev.username} · {rev.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-medium text-[#755151]">
                      <Star className="w-3.5 h-3.5 fill-current text-[#755151]" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Book Reference */}
                  <div className="mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#A08670] block">
                      MARGINALIA ON
                    </span>
                    <button
                      onClick={() => setSelectedBook(rev.book)}
                      className="font-editorial text-lg text-[#755151] hover:underline text-left block"
                    >
                      {rev.book.title}
                    </button>
                  </div>

                  {/* Review Text */}
                  <p className="font-sans text-sm text-[#443223] leading-relaxed bg-[#FFF9F3] p-3 rounded border border-[#DBC4A5]">
                    “{rev.text}”
                  </p>
                </div>

                <div className="pt-3 border-t border-[#A08670] mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#72583E]">
                    VERIFIED BORROWER
                  </span>
                  <button
                    onClick={() => setSelectedBook(rev.book)}
                    className="text-xs font-sans font-semibold text-[#FFF9F3] bg-[#755151] px-2.5 py-1 rounded border border-[#443223] hover:brightness-110"
                  >
                    View Volume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentTab === 'discovery' ? (
        /* Wider Stacks Discovery View */
        <div className="space-y-6">
          {/* Discovery Search Box */}
          <div className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={extQuery}
                  onChange={e => setExtQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      performExternalSearch(extQuery, extSearchType, 1);
                    }
                  }}
                  placeholder="Search Open Library by title, author, or subject..."
                  className="w-full px-4 py-2.5 pl-10 rounded font-sans text-sm bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] placeholder-[#A08670] focus:outline-none focus:border-[#443223]"
                />
                <Search className="w-4 h-4 text-[#72583E] absolute left-3.5 top-3.5" />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={extSearchType}
                  onChange={e => setExtSearchType(e.target.value as 'all' | 'title' | 'author')}
                  className="h-full py-2.5 px-3 rounded text-xs font-sans font-semibold bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] outline-none focus:border-[#443223]"
                >
                  <option value="all">All Fields</option>
                  <option value="title">By Title</option>
                  <option value="author">By Author</option>
                </select>

                <button
                  type="button"
                  disabled={extLoading || !extQuery.trim()}
                  onClick={() => performExternalSearch(extQuery, extSearchType, 1)}
                  className="py-2.5 px-5 rounded bg-[#755151] hover:bg-[#855d5d] disabled:opacity-50 text-[#FFF9F3] font-sans text-xs font-semibold border-2 border-[#443223] shadow-[2px_2px_0px_#443223] transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  {extLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search Stacks</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Source Notice & Scope Explanation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-dashed border-[#A08670]/60 text-[11px] font-mono text-[#72583E]">
              <div className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#755151]" />
                <span>SOURCE: Internet Archive Open Library API (Open Data) · Read-Only Discovery Stacks</span>
              </div>
              <span className="text-[#A08670]">External volumes cannot be shelved or reviewed until ingested</span>
            </div>
          </div>

          {/* Error Banner */}
          {extError && (
            <div className="p-4 rounded bg-[#FFF0F0] border-2 border-[#C97A7E] flex items-start justify-between gap-3 text-xs text-[#5C2328]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#C97A7E] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#8B3A3E]">Archive Discovery Error</p>
                  <p className="mt-0.5 text-[#5C2328]">{extError}</p>
                </div>
              </div>
              <button
                onClick={() => performExternalSearch(extLastSearched || extQuery, extSearchType, extPage)}
                className="px-3 py-1 rounded bg-[#8B3A3E] text-[#FFF9F3] font-sans text-xs font-semibold hover:brightness-110 flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {extLoading && (
            <div className="catalog-card p-16 text-center bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223]">
              <Loader2 className="w-10 h-10 text-[#755151] animate-spin mx-auto mb-4" />
              <h3 className="font-editorial text-2xl text-[#443223] mb-1">
                Consulting the Open Library Archives...
              </h3>
              <p className="font-sans text-sm text-[#72583E]">
                Paging through millions of historical volumes, editions, and manuscripts.
              </p>
            </div>
          )}

          {/* Initial Exploration Prompt (No search performed yet) */}
          {!extLoading && !extHasSearched && (
            <div className="catalog-card p-10 bg-[#FCF8F2] border-2 border-dashed border-[#A08670] text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#EAD4BA]/40 border-2 border-[#443223] flex items-center justify-center mx-auto text-[#755151]">
                <Library className="w-6 h-6" />
              </div>
              <div className="max-w-lg mx-auto">
                <h3 className="font-editorial text-2xl text-[#443223] mb-2">
                  Step Beyond the Sanctuary Walls
                </h3>
                <p className="font-sans text-sm text-[#72583E] leading-relaxed">
                  The Dead Poets Club sanctuary curates 34 hand-selected classics. Through this gateway to the Internet Archive’s Open Library, you can search and discover millions of archival editions from around the globe.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] text-[#A08670] uppercase tracking-wider mb-2.5">
                  Suggested Curiosities
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'Franz Kafka',
                    'Virginia Woolf',
                    'Albert Camus',
                    'Fyodor Dostoevsky',
                    'Gothic Fiction',
                    'James Joyce',
                    'Mary Shelley',
                    'Edgar Allan Poe',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setExtQuery(suggestion);
                        performExternalSearch(suggestion, 'all', 1);
                      }}
                      className="px-3 py-1.5 rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] border border-[#443223] font-sans text-xs font-semibold text-[#443223] shadow-[1px_1px_0px_#443223] transition-all cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Zero Results State */}
          {!extLoading && extHasSearched && extResults.length === 0 && !extError && (
            <div className="catalog-card p-12 text-center bg-[#FCF8F2] border-2 border-dashed border-[#A08670]">
              <BookOpen className="w-12 h-12 text-[#A08670] mx-auto mb-3" />
              <h3 className="font-editorial text-2xl text-[#443223] mb-1">
                No volumes discovered in the wider stacks.
              </h3>
              <p className="font-sans text-sm text-[#72583E] max-w-md mx-auto">
                We couldn’t locate any Open Library editions matching “{extLastSearched}”. Try broadening your keywords or searching under a different field.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setExtQuery('');
                    setExtHasSearched(false);
                    setExtResults([]);
                  }}
                  className="btn-secondary text-xs"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {!extLoading && extResults.length > 0 && (
            <div className="space-y-6">
              {/* Meta bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <p className="font-sans text-xs text-[#72583E]">
                  Discovered{' '}
                  <span className="font-semibold text-[#443223]">
                    {extTotalFound.toLocaleString()}
                  </span>{' '}
                  archival volumes for “<span className="text-[#443223] font-medium">{extLastSearched}</span>”
                </p>
                <span className="font-mono text-xs text-[#755151]">
                  Page {extPage} of {extTotalPages || 1}
                </span>
              </div>

              {/* External Books Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {extResults.map(book => (
                  <ExternalBookCard
                    key={book.workId || book.workKey}
                    book={book}
                    onSelect={setSelectedExternalBook}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {extTotalPages > 1 && (
                <div className="catalog-card p-4 bg-[#FCF8F2] border-2 border-[#443223] flex items-center justify-between">
                  <button
                    disabled={extPage <= 1 || extLoading}
                    onClick={() => {
                      const prevPage = extPage - 1;
                      performExternalSearch(extLastSearched, extSearchType, prevPage);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[#443223] font-sans text-xs font-semibold text-[#443223] shadow-[2px_2px_0px_#443223] transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous 24</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-[#443223]">
                      Page {extPage} of {extTotalPages}
                    </span>
                  </div>

                  <button
                    disabled={extPage >= extTotalPages || extLoading}
                    onClick={() => {
                      const nextPage = extPage + 1;
                      performExternalSearch(extLastSearched, extSearchType, nextPage);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded bg-[#FFF9F3] hover:bg-[#DBC4A5] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[#443223] font-sans text-xs font-semibold text-[#443223] shadow-[2px_2px_0px_#443223] transition-all flex items-center gap-1.5"
                  >
                    <span>Next 24</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
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
                placeholder="Looking for a particular rabbit hole?"
                className="w-full px-4 py-2 pl-9 rounded font-sans text-sm bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] placeholder-[#A08670] focus:outline-none focus:border-[#443223]"
              />
              <Search className="w-4 h-4 text-[#72583E] absolute left-3 top-2.5" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Genre select */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium text-[#72583E] uppercase">Genre</span>
                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  className="text-xs font-sans font-semibold bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] rounded px-3 py-1.5 outline-none focus:border-[#443223]"
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
                <span className="text-[11px] font-mono font-medium text-[#72583E] uppercase">Sort</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'title' | 'year' | 'rating')}
                  className="text-xs font-sans font-semibold bg-[#FFF9F3] border-2 border-[#A08670] text-[#443223] rounded px-3 py-1.5 outline-none focus:border-[#443223]"
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
              <h3 className="font-editorial text-2xl text-[#443223] mb-1">
                This book has wandered off.
              </h3>
              <p className="font-sans text-sm text-[#72583E] max-w-md mx-auto">
                Authors are notoriously difficult to keep in one place. Try another shelf, reset your filters, or search the global Open Library stacks.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                  }}
                  className="btn-secondary text-xs"
                >
                  Reset Local Filters
                </button>
                {searchQuery.trim() && (
                  <button
                    onClick={() => handleTabChange('discovery', searchQuery.trim())}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Search Wider Stacks for "{searchQuery.trim()}"</span>
                  </button>
                )}
              </div>
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

      {/* External Book Detail Modal */}
      {selectedExternalBook && (
        <ExternalBookDetailModal
          book={selectedExternalBook}
          isOpen={!!selectedExternalBook}
          onClose={() => setSelectedExternalBook(null)}
        />
      )}
    </div>
  );
};
