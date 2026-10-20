import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEED_BOOKS } from '../data/seedBooks';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { Book } from '../types/book';
import {
  Compass,
  BookOpen,
  Coffee,
  Grid3X3,
  Bookmark,
  Award,
  Clock,
  Sparkles,
  Quote,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { triggerInkSplatter } from '../lib/animeAnimations';

export const ClubhousePage: React.FC = () => {
  const { user, profile, shelves } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Group shelves
  const currentlyReadingShelves = shelves.filter(s => s.status === 'currently_reading');
  const wantToReadShelves = shelves.filter(s => s.status === 'want_to_read');
  const readShelves = shelves.filter(s => s.status === 'read');

  const activeBook = currentlyReadingShelves.length > 0
    ? SEED_BOOKS.find(b => b.id === currentlyReadingShelves[0].book_id)
    : SEED_BOOKS[0];

  const readingGoal = profile?.reading_goal || 12;
  const booksRead = readShelves.length;
  const goalPercentage = Math.min(100, Math.round((booksRead / readingGoal) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Editorial Header Greeting */}
      <div className="border-b border-[#d3a66d]/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 mb-3 text-xs font-mono text-[#e8c18e]">
            <Sparkles className="w-3.5 h-3.5 text-[#d3a66d]" />
            <span>Poet's Quarters</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f0eae1]">
            Greetings, {profile?.display_name || user?.displayName || 'Fellow Poet'}
          </h1>
          <p className="font-sans text-sm text-[#a39b8f] mt-1 max-w-xl">
            "{profile?.bio || 'Haunting dusty libraries, listening for echoes in the margins.'}"
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/library"
            onClick={(e) => triggerInkSplatter(e.clientX, e.clientY)}
            className="btn-primary text-xs py-2 px-4"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse Stacks
          </NavLink>
          <NavLink
            to="/shelves"
            className="btn-secondary text-xs py-2 px-4"
          >
            <Bookmark className="w-3.5 h-3.5" />
            My Shelves ({shelves.length})
          </NavLink>
        </div>
      </div>

      {/* Primary Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Currently Reading Hero Card */}
        <div className="lg:col-span-8 parchment-card p-6 sm:p-7 rounded-2xl bg-[#1a1614] border border-[#d3a66d]/30 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d3a66d]/15">
            <span className="text-xs font-mono tracking-widest text-[#d3a66d] uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d3a66d]" /> On Your Desk Right Now
            </span>
            <span className="text-xs font-mono text-[#8e9c82] bg-[#75816a]/20 px-2.5 py-0.5 rounded-full border border-[#75816a]/30">
              Active Reading
            </span>
          </div>

          {activeBook ? (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div
                onClick={() => setSelectedBook(activeBook)}
                className="w-32 h-48 sm:w-36 sm:h-52 flex-shrink-0 cursor-pointer book-cover-wrap shadow-xl rounded overflow-hidden"
              >
                <img
                  src={activeBook.cover_url}
                  alt={activeBook.title}
                  className="book-cover w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <h3
                    onClick={() => setSelectedBook(activeBook)}
                    className="font-serif text-xl sm:text-2xl font-bold text-[#f0eae1] hover:text-[#e8c18e] transition-colors cursor-pointer"
                  >
                    {activeBook.title}
                  </h3>
                  <p className="font-sans text-sm text-[#d3a66d] mt-1 font-medium">
                    {activeBook.author} · {activeBook.publication_year}
                  </p>
                  <p className="font-sans text-xs text-[#a39b8f] mt-3 line-clamp-3 leading-relaxed">
                    {activeBook.description}
                  </p>
                </div>

                {activeBook.quote && (
                  <div className="mt-4 p-3 rounded-lg bg-[#141210] border-l-2 border-[#d3a66d] text-xs font-serif italic text-[#c7beaf]">
                    "{activeBook.quote.text}"
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#d3a66d]/15 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBook(activeBook)}
                    className="text-xs font-serif text-[#e8c18e] hover:underline flex items-center gap-1.5"
                  >
                    View Details & Update Shelf <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-[#8e8578]">
                    {activeBook.pages} pages total
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <BookOpen className="w-10 h-10 text-[#d3a66d]/50 mx-auto mb-3" />
              <p className="font-serif text-base text-[#f0eae1]">No books currently on your desk.</p>
              <NavLink to="/library" className="btn-primary text-xs mt-3 inline-flex">
                Choose a Book from the Stacks
              </NavLink>
            </div>
          )}
        </div>

        {/* Right Column: Goal Tracker & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Annual Reading Goal Card */}
          <div className="parchment-card p-5 rounded-2xl bg-[#1a1614] border border-[#d3a66d]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#d3a66d] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Reading Goal
              </span>
              <span className="text-xs font-mono text-[#e8c18e]">
                {booksRead} of {readingGoal} books
              </span>
            </div>

            <div className="w-full bg-[#241e1a] h-2.5 rounded-full overflow-hidden border border-[#3e342b] mb-2">
              <div
                className="bg-gradient-to-r from-[#784743] via-[#d3a66d] to-[#8e9c82] h-full rounded-full transition-all duration-700"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>

            <p className="text-[11px] font-sans text-[#a39b8f]">
              {goalPercentage >= 100
                ? '🏆 Goal conquered! You have devoured your literary objective.'
                : `${readingGoal - booksRead} more book${readingGoal - booksRead === 1 ? '' : 's'} to reach your annual goal.`}
            </p>
          </div>

          {/* Quick Rooms Access */}
          <div className="grid grid-cols-2 gap-3">
            <NavLink
              to="/cafe"
              className="p-4 rounded-xl bg-[#1a1614] border border-[#784743]/40 hover:border-[#d3a66d] transition-all group flex flex-col justify-between text-decoration-none"
            >
              <Coffee className="w-6 h-6 text-[#d3a66d] group-hover:scale-110 transition-transform mb-3" />
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#f0eae1]">The Café</h4>
                <p className="text-[10px] text-[#8e8578] mt-0.5">Atmospheric focus room</p>
              </div>
            </NavLink>

            <NavLink
              to="/crossword"
              className="p-4 rounded-xl bg-[#1a1614] border border-[#75816a]/40 hover:border-[#d3a66d] transition-all group flex flex-col justify-between text-decoration-none"
            >
              <Grid3X3 className="w-6 h-6 text-[#8e9c82] group-hover:scale-110 transition-transform mb-3" />
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#f0eae1]">Crossword</h4>
                <p className="text-[10px] text-[#8e8578] mt-0.5">Daily literary puzzle</p>
              </div>
            </NavLink>
          </div>

          {/* Quote of the Day */}
          <div className="p-4 rounded-xl bg-[#151210] border border-[#d3a66d]/20 relative">
            <Quote className="w-5 h-5 text-[#d3a66d]/40 absolute top-3 right-3" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d3a66d]">
              Club Epigraph
            </span>
            <p className="font-serif text-xs italic text-[#f0eae1] mt-2 leading-relaxed">
              "Words can be like X-rays if you use them properly—they'll go through anything. You read and you're pierced."
            </p>
            <p className="text-[11px] font-sans text-[#a39b8f] mt-1.5">— Aldous Huxley</p>
          </div>
        </div>
      </div>

      {/* Recommended for Your Shelves */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-[#f0eae1]">
            Curated Stacks for You
          </h2>
          <NavLink to="/library" className="text-xs font-serif text-[#d3a66d] hover:underline">
            View All Stacks →
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SEED_BOOKS.slice(1, 5).map(book => (
            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
        </div>
      </div>

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};
