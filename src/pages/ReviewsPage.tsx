import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book, Review } from '../types/book';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { BookCoverImage } from '../components/books/BookCoverImage';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../lib/audioEngine';
import {
  MessageSquareQuote,
  Star,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Plus,
  Trash2,
  BookOpen,
  Feather,
  Heart,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewCardItem {
  id: string;
  book: Book;
  reviewerName: string;
  reviewerHandle: string;
  date: string;
  rating: number;
  headline: string;
  body: string;
  quote?: string;
  tagline: string;
  themeBg: string;
  themeAccent: string;
  themeBorder: string;
  rotation: number;
}

const INITIAL_REVIEW_DECK: ReviewCardItem[] = [
  {
    id: 'rev-1',
    book: SEED_BOOKS[0], // The Secret History
    reviewerName: 'Eleanor Vance',
    reviewerHandle: 'eleanor_v',
    date: 'Autumn 1889',
    rating: 5,
    headline: 'Beauty, Terror, and the Cost of Transgression',
    body: 'The tension in Tartt’s prose is palpable from Julian’s first lecture on Greek terror and beauty. Henry, Francis, Charles, and Camilla are terrifying because they make intellectual detachment feel like salvation. A transcendent masterpiece that echoes through academic cloisters.',
    quote: 'Beauty is terror. Whatever we call beautiful, we quiver before it.',
    tagline: 'Julian on... THE TERROR OF BEAUTY',
    themeBg: '#3D2A24', // Deep Mahogany
    themeAccent: '#FFF9F3',
    themeBorder: '#72583E',
    rotation: -2,
  },
  {
    id: 'rev-2',
    book: SEED_BOOKS[1], // Dead Poets Society
    reviewerName: 'Julian Morrow',
    reviewerHandle: 'julian_m',
    date: 'Winter 1889',
    rating: 5,
    headline: 'O Captain, My Captain: Sucking the Marrow Out of Life',
    body: 'Words and ideas truly can change the world. Keating taught us that poetry is the very essence of human passion and freedom, not an engineering problem to be graphed on a Pritchard scale. A foundational text for this entire club.',
    quote: 'No matter what anybody tells you, words and ideas can change the world.',
    tagline: 'Keating on... WORDS AND IDEAS',
    themeBg: '#44422D', // Forest Olive
    themeAccent: '#FFF9F3',
    themeBorder: '#7C7960',
    rotation: 2.5,
  },
  {
    id: 'rev-3',
    book: SEED_BOOKS[2], // The Picture of Dorian Gray
    reviewerName: 'Beatrix King',
    reviewerHandle: 'beatrix_k',
    date: 'Spring 1890',
    rating: 4.8,
    headline: 'The Ultimate Psychological Mirror of Corruption',
    body: 'Wilde’s aesthetic philosophy is razor-sharp. Dorian’s portrait in the locked schoolroom becomes the ultimate indictment of artistic hedonism without empathy. Every paragraph contains at least three epigrams that pierce straight to the bone.',
    quote: 'Those who find ugly meanings in beautiful things are corrupt without being charming.',
    tagline: 'Wilde on... SINS OF BEAUTY',
    themeBg: '#592938', // Deep Burgundy
    themeAccent: '#FFF9F3',
    themeBorder: '#8A4A5D',
    rotation: -1.5,
  },
  {
    id: 'rev-4',
    book: SEED_BOOKS[3], // If We Were Villains
    reviewerName: 'Miles Bennett',
    reviewerHandle: 'miles_b',
    date: 'Autumn 2017',
    rating: 4.7,
    headline: 'When the Tragedy Bleeds Off the Stage',
    body: 'Seven young Shakespearean actors at Dellecher Conservatory playing tragic roles that inevitably bleed into real murder. Rio weaves theatrical obsession with devastating dark academia suspense. The final pages left me breathless.',
    quote: 'For someone who loved words as much as I did, it was embarrassing how rarely they did what I wanted.',
    tagline: 'Oliver on... TRAGEDY & TIME',
    themeBg: '#2D3B36', // Pine Slate
    themeAccent: '#FFF9F3',
    themeBorder: '#536961',
    rotation: 3,
  },
  {
    id: 'rev-5',
    book: SEED_BOOKS[30], // Norwegian Wood
    reviewerName: 'Sora Lin',
    reviewerHandle: 'sora_l',
    date: 'Winter 1987',
    rating: 4.9,
    headline: 'Acoustic Loneliness in the Tokyo Rains',
    body: 'Murakami writes grief and memory with acoustic purity. The vinyl record hiss, the smell of damp coats, and the quiet weight of remembering someone who chose not to grow old. A profoundly gentle, devastating companion.',
    quote: 'Death exists, not as the opposite but as a part of life.',
    tagline: 'Toru on... GRIEF & MEMORY',
    themeBg: '#4A3428', // Weathered Mocha
    themeAccent: '#FFF9F3',
    themeBorder: '#785A48',
    rotation: -2.5,
  },
  {
    id: 'rev-6',
    book: SEED_BOOKS[7], // Beloved / Piranesi
    reviewerName: 'Theodore Price',
    reviewerHandle: 'theodore_p',
    date: 'Autumn 2020',
    rating: 5,
    headline: 'The House is Immeasurable and Kind',
    body: 'Piranesi lives in an infinite labyrinth of classical halls with statues and ocean tides surging through the lower floors. Susanna Clarke’s prose feels carved out of ancient marble and cold sea foam. An antidote to modern cynicism.',
    quote: 'The Beauty of the House is immeasurable; its Kindness infinite.',
    tagline: 'Piranesi on... SOLITUDE & WONDER',
    themeBg: '#362B45', // Archival Plum
    themeAccent: '#FFF9F3',
    themeBorder: '#635378',
    rotation: 1.8,
  },
];

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const bookIdFilter = searchParams.get('bookId');

  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [modalBook, setModalBook] = useState<Book | null>(null);

  // User reviews state
  const [userReviews, setUserReviews] = useState<ReviewCardItem[]>(() => {
    try {
      const stored = localStorage.getItem('dpc_user_reviews');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // All combined reviews
  const allCards = [...userReviews, ...INITIAL_REVIEW_DECK];

  // Active review card in deck
  const currentCard = allCards[deckIndex % allCards.length] || INITIAL_REVIEW_DECK[0];

  // Review Form Modal
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>(bookIdFilter || SEED_BOOKS[0].id);
  const [formRating, setFormRating] = useState<number>(5);
  const [formHeadline, setFormHeadline] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Set initial book if query param present
  useEffect(() => {
    if (bookIdFilter) {
      const targetIdx = allCards.findIndex(c => c.book.id === bookIdFilter);
      if (targetIdx !== -1) {
        setDeckIndex(targetIdx);
      }
    }
  }, [bookIdFilter]);

  const handleNextCard = () => {
    soundEngine.playClick();
    setSlideDirection('next');
    setIsFlipped(false); // Reset flip state for new card
    setDeckIndex(prev => (prev + 1) % allCards.length);
  };

  const handlePrevCard = () => {
    soundEngine.playClick();
    setSlideDirection('prev');
    setIsFlipped(false); // Reset flip state for new card
    setDeckIndex(prev => (prev - 1 + allCards.length) % allCards.length);
  };

  const handleToggleFlip = () => {
    soundEngine.playClick();
    setIsFlipped(prev => !prev);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHeadline.trim() || !formBody.trim()) return;

    const book = SEED_BOOKS.find(b => b.id === selectedBookId) || SEED_BOOKS[0];

    const newReviewItem: ReviewCardItem = {
      id: `user-rev-${Date.now()}`,
      book,
      reviewerName: user?.displayName || user?.username || 'Fellow Poet',
      reviewerHandle: user?.username || 'member',
      date: 'Just Now',
      rating: formRating,
      headline: formHeadline.trim(),
      body: formBody.trim(),
      quote: formQuote.trim() || undefined,
      tagline: `${(user?.displayName || 'Poet').toUpperCase()} on... ${formHeadline.slice(0, 24).toUpperCase()}`,
      themeBg: '#44322D',
      themeAccent: '#FFF9F3',
      themeBorder: '#7C7960',
      rotation: (Math.random() - 0.5) * 4,
    };

    const updated = [newReviewItem, ...userReviews];
    setUserReviews(updated);
    try {
      localStorage.setItem('dpc_user_reviews', JSON.stringify(updated));
    } catch {
      // storage error
    }

    setDeckIndex(0);
    setIsFlipped(false);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsWriteModalOpen(false);
      setFormHeadline('');
      setFormBody('');
      setFormQuote('');
    }, 1200);
  };

  const handleDeleteReview = (id: string) => {
    const updated = userReviews.filter(r => r.id !== id);
    setUserReviews(updated);
    try {
      localStorage.setItem('dpc_user_reviews', JSON.stringify(updated));
    } catch {
      // storage error
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 text-[#443223]">
      {/* Header */}
      <div className="border-b-2 border-[#443223] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>GOODREADS-STYLE SEQUENTIAL FLASHCARD DECK</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#443223]">
            Borrower Reviews & Flashcards
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1 max-w-xl">
            Physical layered paper deck. Click the card to flip between reviewer reflection and book archival context, then slide forward through the stack.
          </p>
        </div>

        {/* Action Button: Write a Review */}
        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="btn-primary text-xs py-2.5 px-4 self-start md:self-auto cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* SECTION 8: FLIP AND SLIDE SEQUENTIAL DECK */}
      <div className="bg-[#FCF8F2] border-3 border-[#443223] rounded-lg shadow-[6px_6px_0px_#443223] p-6 sm:p-10 mb-12">
        {/* Deck Header & Position Indicator */}
        <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-2 border-dashed border-[#A08670] gap-4">
          <div className="flex items-center gap-3">
            <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider">
              VOLUME {deckIndex + 1} OF {allCards.length}
            </span>
            <span className="text-[#A08670]">•</span>
            <span className="font-typewriter text-xs text-[#72583E]">
              {isFlipped ? 'REVERSE SIDE (FULL REVIEW)' : 'FRONT FACE (PULL QUOTE & DOSSIER)'}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {allCards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSlideDirection(idx > deckIndex ? 'next' : 'prev');
                  setIsFlipped(false);
                  setDeckIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === deckIndex ? 'w-5 bg-[#755151]' : 'bg-[#DBC4A5]'
                }`}
                title={`Go to Review #${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* THE MAIN CARD (With Perspective, 3D Flip, and Smooth Slide Animation) */}
        <div className="relative min-h-[460px] flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{
                opacity: 0,
                x: slideDirection === 'next' ? 120 : -120,
                scale: 0.92,
                rotate: currentCard.rotation * 1.5,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                rotate: currentCard.rotation,
              }}
              exit={{
                opacity: 0,
                x: slideDirection === 'next' ? -120 : 120,
                scale: 0.92,
                rotate: -currentCard.rotation * 1.5,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-2xl cursor-pointer select-none"
              onClick={handleToggleFlip}
              style={{ perspective: '1200px' }}
            >
              {/* 3D Flippable Paper Container */}
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full min-h-[420px] rounded-lg border-3 border-[#443223] shadow-[8px_8px_0px_#443223] relative p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  transformStyle: 'preserve-3d',
                  backgroundColor: currentCard.themeBg,
                  color: currentCard.themeAccent,
                }}
              >
                {/* FRONT FACE (Displayed when isFlipped is false) */}
                <div
                  className="w-full h-full flex flex-col justify-between"
                  style={{
                    backfaceVisibility: 'hidden',
                    display: isFlipped ? 'none' : 'flex',
                  }}
                >
                  {/* Top Bar of Front Face */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                    <span className="font-typewriter text-[11px] font-bold tracking-widest uppercase opacity-85">
                      {currentCard.tagline}
                    </span>
                    <div className="flex items-center gap-1 text-amber-300 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(currentCard.rating) ? 'fill-current' : 'opacity-40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Middle Section: Book cover + Pull quote */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto">
                    <div className="sm:col-span-4 flex justify-center">
                      <div className="w-28 sm:w-32 shadow-xl">
                        <BookCoverImage book={currentCard.book} className="w-full" />
                      </div>
                    </div>

                    <div className="sm:col-span-8 space-y-3">
                      <span className="font-typewriter text-[10px] uppercase tracking-wider text-amber-200/80 block">
                        PULL QUOTE FROM ARCHIVES:
                      </span>
                      <p className="font-editorial text-xl sm:text-2xl font-bold leading-snug italic text-white">
                        "{currentCard.quote || currentCard.headline}"
                      </p>
                      <p className="font-typewriter text-xs text-white/80">
                        {currentCard.book.title} by {currentCard.book.author} ({currentCard.book.publication_year})
                      </p>
                    </div>
                  </div>

                  {/* Bottom Bar: Flip affordance + Reviewer info */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-4 text-xs font-typewriter">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                        {currentCard.reviewerName.charAt(0)}
                      </div>
                      <span className="opacity-90">{currentCard.reviewerName} · {currentCard.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/15 border border-white/30 text-[11px] font-bold uppercase tracking-wider">
                      <RotateCw className="w-3 h-3 animate-spin-slow" />
                      <span>Click to Read Review</span>
                    </div>
                  </div>
                </div>

                {/* REVERSE FACE (Displayed when isFlipped is true) */}
                <div
                  className="w-full h-full flex flex-col justify-between"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: isFlipped ? 'flex' : 'none',
                  }}
                >
                  {/* Top Bar of Reverse Face */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                    <div>
                      <span className="font-editorial text-base sm:text-lg font-bold block text-white">
                        {currentCard.headline}
                      </span>
                      <span className="font-typewriter text-[10px] text-white/70">
                        Review for {currentCard.book.title} · Rated {currentCard.rating}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-300 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(currentCard.rating) ? 'fill-current' : 'opacity-40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="my-auto py-2">
                    <p className="font-typewriter text-xs sm:text-sm leading-relaxed text-white/95 whitespace-pre-line">
                      {currentCard.body}
                    </p>
                  </div>

                  {/* Bottom Bar: Action buttons */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/20 mt-4 gap-2 text-xs font-typewriter">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalBook(currentCard.book);
                      }}
                      className="px-3 py-1.5 rounded bg-white text-[#443223] font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Book Dossier</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] opacity-75">
                        Tap anywhere to flip back
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CONTROLS: PREVIOUS, FLIP, NEXT (Physically advancing through the stack) */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-[#A08670] mt-4">
          <button
            onClick={handlePrevCard}
            className="btn-secondary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Card</span>
          </button>

          <button
            onClick={handleToggleFlip}
            className="btn-secondary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>{isFlipped ? 'Show Front Cover' : 'Flip to Review'}</span>
          </button>

          <button
            onClick={handleNextCard}
            className="btn-primary text-xs py-2.5 px-5 cursor-pointer flex items-center gap-2"
          >
            <span>Next Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ALL REVIEWS ARCHIVE LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#443223] pb-4">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#443223]">
              Clubhouse Review Archive ({allCards.length})
            </h3>
            <p className="font-typewriter text-xs text-[#72583E]">
              All reflections catalogued in the Dead Poets Club registry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allCards.map((card, idx) => (
            <div
              key={card.id}
              className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#A08670] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 flex-shrink-0">
                      <BookCoverImage book={card.book} className="w-10" />
                    </div>
                    <div>
                      <h4 className="font-editorial text-base font-bold text-[#443223] line-clamp-1">
                        {card.headline}
                      </h4>
                      <p className="font-typewriter text-xs text-[#72583E]">
                        {card.book.title} · by {card.book.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex text-amber-700 text-xs flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(card.rating) ? 'fill-current' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="font-typewriter text-xs text-[#58432D] leading-relaxed line-clamp-3 mb-3">
                  {card.body}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#A08670] text-xs font-typewriter">
                <span className="text-[11px] text-[#755151] font-bold">
                  @{card.reviewerHandle} · {card.date}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDeckIndex(idx);
                      setIsFlipped(true);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold text-[#755151] hover:underline cursor-pointer"
                  >
                    View in Deck →
                  </button>
                  {card.id.startsWith('user-rev-') && (
                    <button
                      onClick={() => handleDeleteReview(card.id)}
                      className="text-red-700 hover:text-red-900 p-1 cursor-pointer"
                      title="Delete your review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FCF8F2] border-3 border-[#443223] rounded-lg shadow-[8px_8px_0px_#443223] p-6 text-[#443223]">
            <div className="flex items-center justify-between border-b-2 border-[#443223] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#755151]" />
                <h3 className="font-editorial text-xl font-bold">
                  Write a Borrower Review
                </h3>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-xs font-typewriter font-bold px-2 py-1 border border-[#443223] rounded bg-[#FFF9F3] cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 font-typewriter text-xs">
              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  SELECT VOLUME:
                </label>
                <select
                  value={selectedBookId}
                  onChange={e => setSelectedBookId(e.target.value)}
                  className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-typewriter font-bold"
                >
                  {SEED_BOOKS.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.author}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  STAR RATING (1 TO 5):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className={`p-1.5 rounded border cursor-pointer ${
                        formRating >= star
                          ? 'bg-[#755151] text-amber-300 border-[#443223]'
                          : 'bg-[#FFF9F3] text-[#A08670] border-[#A08670]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="font-bold text-[#755151] ml-2">
                    {formRating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  HEADLINE / CORE THOUGHT:
                </label>
                <input
                  type="text"
                  required
                  value={formHeadline}
                  onChange={e => setFormHeadline(e.target.value)}
                  placeholder="e.g. A haunting meditation on moral vanity..."
                  className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  FAVOURITE SHORT QUOTE (OPTIONAL):
                </label>
                <input
                  type="text"
                  value={formQuote}
                  onChange={e => setFormQuote(e.target.value)}
                  placeholder="e.g. Beauty is terror..."
                  className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  YOUR FULL REVIEW / THOUGHTS:
                </label>
                <textarea
                  required
                  rows={4}
                  value={formBody}
                  onChange={e => setFormBody(e.target.value)}
                  placeholder="Write your reflection in the margins. How did this book make you feel?"
                  className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-[#A08670]">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 cursor-pointer"
                >
                  {formSubmitted ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-300" />
                      <span>Review Inscribed!</span>
                    </>
                  ) : (
                    <span>Inscribe to Deck</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {modalBook && (
        <BookDetailModal
          book={modalBook}
          isOpen={!!modalBook}
          onClose={() => setModalBook(null)}
        />
      )}
    </div>
  );
};
