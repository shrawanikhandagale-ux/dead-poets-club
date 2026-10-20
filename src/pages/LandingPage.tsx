import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThreeBookHero } from '../components/three/ThreeBookHero';
import { BookCard } from '../components/books/BookCard';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book } from '../types/book';
import { Compass, BookOpen, Coffee, Feather, ArrowRight, Sparkles, Quote, ShieldCheck } from 'lucide-react';
import { playHeroEntrance } from '../lib/gsapTimelines';
import { triggerInkSplatter } from '../lib/animeAnimations';

export const LandingPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const featuredBooks = SEED_BOOKS.slice(0, 4);

  useEffect(() => {
    playHeroEntrance('#landing-hero', {
      badges: '#hero-badge',
      title: '#hero-title',
      subtitle: '#hero-subtitle',
      actions: '#hero-actions',
    });
  }, []);

  const handleSplatter = (e: React.MouseEvent) => {
    triggerInkSplatter(e.clientX, e.clientY);
  };

  return (
    <div className="min-h-screen text-[#f0eae1] pb-24 lg:pb-12">
      {/* Hero Section */}
      <section
        id="landing-hero"
        ref={heroRef}
        className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-[#d3a66d]/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 flex flex-col items-start z-10">
              <div
                id="hero-badge"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d3a66d]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#e8c18e]">
                  A Little World for Literary Souls
                </span>
              </div>

              <h1
                id="hero-title"
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] text-[#f0eae1] tracking-tight mb-5"
              >
                For people who feel{' '}
                <span className="italic text-[#d3a66d] underline decoration-[#784743] decoration-2 underline-offset-8">
                  a little too much
                </span>{' '}
                about books.
              </h1>

              <p
                id="hero-subtitle"
                className="font-sans text-base sm:text-lg text-[#b8afa3] leading-relaxed max-w-2xl mb-8"
              >
                Step out of the noisy feeds and into an atmospheric sanctuary. Track personal reading shelves, dwell in the quiet candlelight of our virtual café, unravel daily book crosswords, and share unvarnished reviews in the margins.
              </p>

              {/* Action Buttons */}
              <div id="hero-actions" className="flex flex-wrap items-center gap-4">
                <NavLink
                  to="/library"
                  onClick={handleSplatter}
                  className="btn-primary text-base py-3 px-6 shadow-xl text-decoration-none"
                >
                  <BookOpen className="w-4 h-4" />
                  Explore Library
                </NavLink>

                <NavLink
                  to="/clubhouse"
                  onClick={handleSplatter}
                  className="btn-secondary text-base py-3 px-6 text-decoration-none"
                >
                  <Compass className="w-4 h-4" />
                  Enter Clubhouse
                </NavLink>
              </div>

              {/* Editorial Quote Ribbon */}
              <div className="mt-10 pt-6 border-t border-[#d3a66d]/15 flex items-start gap-3 text-xs font-serif text-[#a39b8f] italic">
                <Quote className="w-4 h-4 text-[#d3a66d] flex-shrink-0 mt-0.5" />
                <span>
                  "No matter what anybody tells you, words and ideas can change the world." — Dead Poets Society
                </span>
              </div>
            </div>

            {/* Right Column: 3D Interactive Antique Book (Three.js) */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#784743]/20 via-[#d3a66d]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <ThreeBookHero />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Works Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#d3a66d]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d3a66d] mb-1">
              <Feather className="w-3.5 h-3.5" /> THE MASTERWORKS
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#f0eae1]">
              Curated Volumes from the Vault
            </h2>
          </div>
          <NavLink
            to="/library"
            onClick={handleSplatter}
            className="inline-flex items-center gap-1.5 text-sm font-serif text-[#e8c18e] hover:text-[#f0eae1] transition-colors text-decoration-none"
          >
            View all 30+ volumes in Library <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
        </div>
      </section>

      {/* Four Pillars of DPC Section */}
      <section className="py-16 bg-[#161210] border-y border-[#d3a66d]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#d3a66d]">
              COMMUNITY PRINCIPLES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f0eae1] mt-2 mb-4">
              A Haven Built on Literary Solitude & Quiet Togetherness
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#a39b8f]">
              We believe in real connections without fabricated metrics, algorithmic outrage, or intrusive tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#1c1815] border border-[#d3a66d]/20 shadow-md">
              <div className="w-12 h-12 rounded-lg bg-[#784743]/30 border border-[#784743] flex items-center justify-center text-[#e8c18e] mb-4">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#f0eae1] mb-2">The Atmospheric Café</h3>
              <p className="font-sans text-xs text-[#a39b8f] leading-relaxed">
                Claim a quiet seat at the window, choose cozy lo-fi ambient rain, run a focus timer, and read alongside peers in respectful silence.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#1c1815] border border-[#d3a66d]/20 shadow-md">
              <div className="w-12 h-12 rounded-lg bg-[#75816a]/30 border border-[#75816a] flex items-center justify-center text-[#c2d4b8] mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#f0eae1] mb-2">The Shelf & The Margins</h3>
              <p className="font-sans text-xs text-[#a39b8f] leading-relaxed">
                Review books with precision, or write expressive handwritten-style margin annotations. Full spoiler gatekeeping protects first-time readers.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#1c1815] border border-[#d3a66d]/20 shadow-md">
              <div className="w-12 h-12 rounded-lg bg-[#d3a66d]/20 border border-[#d3a66d] flex items-center justify-center text-[#e8c18e] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#f0eae1] mb-2">Authentic & Privacy-First</h3>
              <p className="font-sans text-xs text-[#a39b8f] leading-relaxed">
                Strict Row-Level Security ensures your private reading logs, personal study history, and private shelves belong exclusively to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Detail Modal */}
      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
};
