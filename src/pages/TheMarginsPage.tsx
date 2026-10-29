import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book, CommunityLetter, MarginaliaPrompt, MarginaliaResponse, BookRecommendation } from '../types/book';
import { BookCoverImage } from '../components/books/BookCoverImage';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../lib/audioEngine';
import {
  Feather,
  Send,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Flame,
  Plus,
  Trash2,
  Lock,
  Globe,
  Quote,
  CornerDownRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Seed community letters for 9A
const INITIAL_LETTERS: CommunityLetter[] = [
  {
    id: 'let-1',
    author_name: 'Eleanor Vance',
    author_handle: 'eleanor_v',
    avatar_color: '#755151',
    is_anonymous: false,
    book_id: 'b1',
    book_title: 'The Secret History',
    quote_or_page: 'Page 39',
    content: 'I think I loved Julian’s students because they made all my worst, most pretentious qualities feel forgivable. When you are nineteen and lonely, obsession looks identical to love.',
    created_at: '2 hours ago',
    likes_count: 24,
    liked_by_user: false,
    replies: [
      {
        id: 'rep-1-1',
        author_name: 'Julian_M',
        content: '“Obsession looks identical to love.” Exactly that. It is the Greek definition of mania.',
        created_at: '1 hour ago',
      },
    ],
  },
  {
    id: 'let-2',
    author_name: 'Anonymous',
    is_anonymous: true,
    book_id: 'b31',
    book_title: 'Norwegian Wood',
    quote_or_page: 'Chapter 3',
    content: 'To whoever is reading this at 2 AM in a cold room: I hope tomorrow is gentler with you. Books are the only rooms where you never have to explain why you are quiet.',
    created_at: '5 hours ago',
    likes_count: 47,
    liked_by_user: true,
  },
  {
    id: 'let-3',
    author_name: 'Beatrix King',
    author_handle: 'beatrix_k',
    avatar_color: '#44422D',
    is_anonymous: false,
    book_id: 'b4',
    book_title: 'If We Were Villains',
    quote_or_page: 'Act IV',
    content: 'Did anyone else feel like the ending was sad because it was inevitable, not because it was cruel? Tragedies aren’t unfair; they are just honest about gravity.',
    created_at: 'Yesterday',
    likes_count: 19,
    liked_by_user: false,
  },
  {
    id: 'let-4',
    author_name: 'Miles B.',
    author_handle: 'miles_b',
    avatar_color: '#72583E',
    is_anonymous: false,
    book_id: 'b8',
    book_title: 'Piranesi',
    quote_or_page: 'Second Entry',
    content: 'The Beauty of the House is that it asks for nothing from you. You do not have to perform sanity for statues.',
    created_at: '2 days ago',
    likes_count: 31,
    liked_by_user: false,
  },
];

// Seed Daily Prompts for 9B
const DAILY_PROMPTS: MarginaliaPrompt[] = [
  {
    id: 'prompt-today',
    issue_number: 142,
    date_string: 'October 24, 2026',
    prompt_text: 'What single sentence from a book made you stop, put the volume down on your chest, and stare at the ceiling?',
    editorial_note: 'Leave a little piece of yourself here. Someone might need it tomorrow.',
    suggested_book_id: 'b1',
  },
  {
    id: 'prompt-yesterday',
    issue_number: 141,
    date_string: 'October 23, 2026',
    prompt_text: 'If you had to hide one letter inside a library book for a stranger to find fifty years from now, which volume would you choose and why?',
    editorial_note: 'Archived Issue',
    suggested_book_id: 'b3',
  },
  {
    id: 'prompt-prev',
    issue_number: 140,
    date_string: 'October 22, 2026',
    prompt_text: 'What literary character felt less like an imaginary figure and more like someone standing directly behind your shoulder?',
    editorial_note: 'Archived Issue',
    suggested_book_id: 'b9',
  },
];

const INITIAL_PROMPT_RESPONSES: MarginaliaResponse[] = [
  {
    id: 'resp-1',
    prompt_id: 'prompt-today',
    user_id: 'u1',
    username: 'eleanor_v',
    display_name: 'Eleanor Vance',
    content: '“I took a deep breath and listened to the old brag of my heart: I am, I am, I am.” Sylvia Plath in The Bell Jar. It felt like someone physically placed a hand on my pulse.',
    is_private: false,
    book_title: 'The Bell Jar',
    created_at: '3 hours ago',
    likes_count: 14,
  },
  {
    id: 'resp-2',
    prompt_id: 'prompt-today',
    user_id: 'u2',
    username: 'julian_m',
    display_name: 'Julian Morrow',
    content: '“Beauty is terror. Whatever we call beautiful, we quiver before it.” It made me realize that high aesthetics can be a polite mask for ruthlessness.',
    is_private: false,
    book_title: 'The Secret History',
    created_at: '5 hours ago',
    likes_count: 9,
  },
];

export const TheMarginsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section') || 'letters';
  const preselectedBookId = searchParams.get('bookId');

  const [activeSection, setActiveSection] = useState<'letters' | 'marginalia' | 'leave-book'>(
    (sectionParam === 'marginalia' || sectionParam === 'leave-book') ? sectionParam : 'letters'
  );

  const [modalBook, setModalBook] = useState<Book | null>(null);

  // 9A Letters state
  const [letters, setLetters] = useState<CommunityLetter[]>(() => {
    try {
      const saved = localStorage.getItem('dpc_community_letters');
      return saved ? JSON.parse(saved) : INITIAL_LETTERS;
    } catch {
      return INITIAL_LETTERS;
    }
  });
  const [isWritingLetter, setIsWritingLetter] = useState(false);
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterBookId, setNewLetterBookId] = useState(preselectedBookId || '');
  const [newLetterQuote, setNewLetterQuote] = useState('');
  const [newLetterAnonymous, setNewLetterAnonymous] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 9B Dear Marginalia state
  const [selectedPrompt, setSelectedPrompt] = useState<MarginaliaPrompt>(DAILY_PROMPTS[0]);
  const [responses, setResponses] = useState<MarginaliaResponse[]>(() => {
    try {
      const saved = localStorage.getItem('dpc_marginalia_responses');
      return saved ? JSON.parse(saved) : INITIAL_PROMPT_RESPONSES;
    } catch {
      return INITIAL_PROMPT_RESPONSES;
    }
  });
  const [responseContent, setResponseContent] = useState('');
  const [responseIsPrivate, setResponseIsPrivate] = useState(false);
  const [responseBookTitle, setResponseBookTitle] = useState('');
  const [marginaliaStreak, setMarginaliaStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('dpc_marginalia_streak') || '5', 10);
  });
  const [responseSubmitted, setResponseSubmitted] = useState(false);

  // 9C Leave a book state
  const [recBookId, setRecBookId] = useState<string>(preselectedBookId || SEED_BOOKS[0].id);
  const [recMessage, setRecMessage] = useState('');
  const [recIsAnonymous, setRecIsAnonymous] = useState(false);
  const [generatedShareToken, setGeneratedShareToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedRecBook = SEED_BOOKS.find(b => b.id === recBookId) || SEED_BOOKS[0];

  useEffect(() => {
    if (sectionParam === 'marginalia' || sectionParam === 'leave-book' || sectionParam === 'letters') {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const handleSectionTab = (sec: 'letters' | 'marginalia' | 'leave-book') => {
    soundEngine.playClick();
    setActiveSection(sec);
    setSearchParams({ section: sec });
  };

  // 9A: Post a Letter
  const handlePostLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetterContent.trim()) return;

    const book = SEED_BOOKS.find(b => b.id === newLetterBookId);

    const newLetter: CommunityLetter = {
      id: `letter-${Date.now()}`,
      author_name: newLetterAnonymous ? 'Anonymous' : (user?.displayName || user?.username || 'Fellow Poet'),
      author_handle: newLetterAnonymous ? undefined : (user?.username || 'member'),
      avatar_color: '#755151',
      is_anonymous: newLetterAnonymous,
      book_id: book?.id,
      book_title: book?.title,
      quote_or_page: newLetterQuote.trim() || undefined,
      content: newLetterContent.trim(),
      created_at: 'Just Now',
      likes_count: 1,
      liked_by_user: true,
    };

    const updated = [newLetter, ...letters];
    setLetters(updated);
    try {
      localStorage.setItem('dpc_community_letters', JSON.stringify(updated));
    } catch {
      // storage error
    }

    setNewLetterContent('');
    setNewLetterQuote('');
    setIsWritingLetter(false);
  };

  const handleLikeLetter = (letterId: string) => {
    soundEngine.playClick();
    setLetters(prev =>
      prev.map(l => {
        if (l.id === letterId) {
          const liked = !l.liked_by_user;
          return {
            ...l,
            liked_by_user: liked,
            likes_count: liked ? l.likes_count + 1 : l.likes_count - 1,
          };
        }
        return l;
      })
    );
  };

  const handleAddReply = (letterId: string) => {
    if (!replyContent.trim()) return;

    setLetters(prev =>
      prev.map(l => {
        if (l.id === letterId) {
          const newReply = {
            id: `rep-${Date.now()}`,
            author_name: user?.displayName || user?.username || 'Fellow Poet',
            content: replyContent.trim(),
            created_at: 'Just Now',
          };
          return {
            ...l,
            replies: [...(l.replies || []), newReply],
          };
        }
        return l;
      })
    );

    setReplyContent('');
    setActiveReplyId(null);
  };

  // 9B: Post Marginalia Prompt Response
  const handleSubmitPromptResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseContent.trim()) return;

    const newResp: MarginaliaResponse = {
      id: `m-resp-${Date.now()}`,
      prompt_id: selectedPrompt.id,
      user_id: user?.id || 'anon',
      username: user?.username || 'member',
      display_name: user?.displayName || user?.username || 'Fellow Poet',
      content: responseContent.trim(),
      is_private: responseIsPrivate,
      book_title: responseBookTitle.trim() || undefined,
      created_at: 'Just Now',
      likes_count: 1,
      liked_by_user: true,
    };

    const updated = [newResp, ...responses];
    setResponses(updated);
    try {
      localStorage.setItem('dpc_marginalia_responses', JSON.stringify(updated));
    } catch {
      // storage error
    }

    // Increment participation streak
    const newStreak = marginaliaStreak + 1;
    setMarginaliaStreak(newStreak);
    localStorage.setItem('dpc_marginalia_streak', newStreak.toString());

    setResponseSubmitted(true);
    setTimeout(() => {
      setResponseSubmitted(false);
      setResponseContent('');
      setResponseBookTitle('');
    }, 1500);
  };

  // 9C: Generate Recommendation Link
  const handleGenerateRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 10);
    const recData: BookRecommendation = {
      id: `rec-${Date.now()}`,
      token,
      book_id: recBookId,
      sender_name: recIsAnonymous ? 'Someone' : (user?.displayName || user?.username || 'A fellow reader'),
      is_anonymous: recIsAnonymous,
      message: recMessage.trim() || 'I left this book for you between the lines of the club.',
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('dpc_book_recommendations') || '[]');
      localStorage.setItem('dpc_book_recommendations', JSON.stringify([recData, ...existing]));
    } catch {
      // storage error
    }

    setGeneratedShareToken(token);
  };

  const copyShareLink = () => {
    if (!generatedShareToken) return;
    const shareUrl = `${window.location.origin}/margins?section=leave-book&token=${generatedShareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 text-[#443223]">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#443223] pb-6 mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 starburst-badge mb-3">
          <Feather className="w-3.5 h-3.5 text-[#FFF9F3]" />
          <span>LITERARY JOURNAL & COMMUNITY PASSAGES</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#443223] tracking-tight">
          THE MARGINS
        </h1>

        <p className="font-handwritten text-xl sm:text-2xl text-[#755151] mt-1 italic">
          Some thoughts belong between the lines.
        </p>

        {/* Small internal sub-navigation bar for the 3 distinct destinations */}
        <div className="mt-8 flex items-center justify-center sm:justify-start gap-2 border-b-2 border-dashed border-[#A08670] pb-4 overflow-x-auto">
          <button
            onClick={() => handleSectionTab('letters')}
            className={`px-4 py-2 rounded text-xs font-typewriter font-bold transition-all border-2 cursor-pointer flex items-center gap-2 ${
              activeSection === 'letters'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[3px_3px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Letters from the Margins</span>
            <span className="text-[10px] font-mono opacity-80">({letters.length})</span>
          </button>

          <button
            onClick={() => handleSectionTab('marginalia')}
            className={`px-4 py-2 rounded text-xs font-typewriter font-bold transition-all border-2 cursor-pointer flex items-center gap-2 ${
              activeSection === 'marginalia'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[3px_3px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dear Marginalia</span>
            <span className="text-[10px] bg-amber-200/50 text-[#755151] px-1.5 py-0.5 rounded font-mono font-bold">
              Streak: {marginaliaStreak}
            </span>
          </button>

          <button
            onClick={() => handleSectionTab('leave-book')}
            className={`px-4 py-2 rounded text-xs font-typewriter font-bold transition-all border-2 cursor-pointer flex items-center gap-2 ${
              activeSection === 'leave-book'
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[3px_3px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Leave This Book for Someone</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 9A: LETTERS FROM THE MARGINS
          ========================================================================= */}
      {activeSection === 'letters' && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dashed border-[#A08670]">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#443223]">
                Community Letter Wall
              </h2>
              <p className="font-typewriter text-xs text-[#72583E]">
                Pinned letters, personal confessions, and midnight thoughts left between pages.
              </p>
            </div>

            <button
              onClick={() => setIsWritingLetter(!isWritingLetter)}
              className="btn-primary text-xs py-2 px-4 cursor-pointer self-start sm:self-auto flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isWritingLetter ? 'Close Inscription' : 'Inscribe a Letter'}</span>
            </button>
          </div>

          {/* Letter Composition Drawer */}
          {isWritingLetter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="catalog-card p-6 bg-[#FCF8F2] border-3 border-[#443223] shadow-[5px_5px_0px_#443223]"
            >
              <h3 className="font-editorial text-lg font-bold mb-3 flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#755151]" />
                <span>Write to the Margins</span>
              </h3>

              <form onSubmit={handlePostLetter} className="space-y-4 font-typewriter text-xs">
                <div>
                  <label className="block font-bold text-[#72583E] mb-1">
                    ASSOCIATED BOOK (OPTIONAL):
                  </label>
                  <select
                    value={newLetterBookId}
                    onChange={e => setNewLetterBookId(e.target.value)}
                    className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-typewriter font-bold"
                  >
                    <option value="">No specific volume (General Literary Letter)</option>
                    {SEED_BOOKS.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#72583E] mb-1">
                    SHORT QUOTE OR PAGE REFERENCE (OPTIONAL):
                  </label>
                  <input
                    type="text"
                    value={newLetterQuote}
                    onChange={e => setNewLetterQuote(e.target.value)}
                    placeholder="e.g. Page 142 or “Death exists not as the opposite...”"
                    className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#72583E] mb-1">
                    YOUR LETTER CONTENT:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newLetterContent}
                    onChange={e => setNewLetterContent(e.target.value)}
                    placeholder="Inscribe your thought, question, or reflection here..."
                    className="w-full p-3 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-handwritten text-lg leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#72583E]">
                    <input
                      type="checkbox"
                      checked={newLetterAnonymous}
                      onChange={e => setNewLetterAnonymous(e.target.checked)}
                      className="accent-[#755151]"
                    />
                    <span>Post Anonymously</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWritingLetter(false)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-xs py-1.5 px-4 cursor-pointer"
                    >
                      Pin to Wall
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Pinned Letter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {letters.map((letter, idx) => (
              <div
                key={letter.id}
                className="relative p-6 bg-[#FCF8F2] border-2 border-[#443223] shadow-[4px_4px_0px_#443223] rounded flex flex-col justify-between"
                style={{
                  transform: `rotate(${(idx % 3 - 1) * 0.8}deg)`,
                }}
              >
                {/* Visual Stamp / Pin Accent */}
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#755151] text-[#FFF9F3] text-[9px] font-mono tracking-widest uppercase border border-[#443223] shadow-sm">
                  PINNED NOTE
                </div>

                <div>
                  {/* Book Reference Tag */}
                  {letter.book_title && (
                    <div className="mb-3 pt-1 flex items-center justify-between text-xs font-typewriter">
                      <span className="font-bold text-[#755151] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {letter.book_title}
                      </span>
                      {letter.quote_or_page && (
                        <span className="text-[10px] text-[#A08670] italic">
                          {letter.quote_or_page}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Letter Text (Handwritten Aesthetic) */}
                  <p className="font-handwritten text-xl sm:text-2xl text-[#3D2B1F] leading-relaxed mb-4">
                    "{letter.content}"
                  </p>
                </div>

                <div>
                  {/* Letter Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#A08670] text-xs font-typewriter">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: letter.avatar_color || '#72583E' }}
                      >
                        {letter.author_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold block leading-tight text-[#443223]">
                          {letter.author_name}
                        </span>
                        <span className="text-[9px] text-[#A08670]">{letter.created_at}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeLetter(letter.id)}
                        className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                          letter.liked_by_user ? 'text-red-700' : 'text-[#72583E] hover:text-red-700'
                        }`}
                        title="Appreciate this letter"
                      >
                        <Heart className={`w-3.5 h-3.5 ${letter.liked_by_user ? 'fill-current' : ''}`} />
                        <span>{letter.likes_count}</span>
                      </button>

                      <button
                        onClick={() => setActiveReplyId(activeReplyId === letter.id ? null : letter.id)}
                        className="text-xs font-bold text-[#72583E] hover:text-[#755151] flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply ({letter.replies?.length || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Replies List */}
                  {letter.replies && letter.replies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#A08670]/60 space-y-2">
                      {letter.replies.map(rep => (
                        <div key={rep.id} className="pl-3 border-l-2 border-[#755151] text-xs font-typewriter">
                          <span className="font-bold text-[#755151] block text-[10px]">
                            {rep.author_name} · {rep.created_at}
                          </span>
                          <p className="text-[#443223] italic mt-0.5">
                            "{rep.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Form */}
                  {activeReplyId === letter.id && (
                    <div className="mt-3 pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder="Write a gentle reply..."
                        className="flex-1 p-1.5 text-xs font-typewriter border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                      />
                      <button
                        onClick={() => handleAddReply(letter.id)}
                        className="btn-primary text-[11px] py-1.5 px-3 cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 9B: DEAR MARGINALIA (Daily Literary Prompt)
          ========================================================================= */}
      {activeSection === 'marginalia' && (
        <section className="space-y-8">
          <div className="catalog-card p-6 sm:p-10 bg-[#FCF8F2] border-3 border-[#443223] shadow-[6px_6px_0px_#443223]">
            {/* Header Stamp */}
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b-2 border-dashed border-[#A08670] gap-4">
              <div>
                <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider block mb-1">
                  ISSUE NO. {selectedPrompt.issue_number} · {selectedPrompt.date_string}
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
                  DEAR MARGINALIA
                </h2>
                <p className="font-handwritten text-lg text-[#755151] italic mt-0.5">
                  Leave a little piece of yourself here. Someone might need it tomorrow.
                </p>
              </div>

              {/* Streak Tracker Badge */}
              <div className="p-3 bg-[#FFF9F3] border-2 border-[#443223] rounded shadow-[2px_2px_0px_#443223] text-center flex items-center gap-3">
                <Flame className="w-6 h-6 text-amber-600 fill-amber-500 animate-pulse" />
                <div className="text-left font-typewriter">
                  <span className="text-[10px] uppercase text-[#72583E] block font-bold">
                    Marginalia Streak
                  </span>
                  <span className="font-editorial text-lg font-bold text-[#443223]">
                    {marginaliaStreak} Days Inscribed
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Featured Prompt */}
            <div className="p-6 bg-[#FFF9F3] border-2 border-[#443223] rounded shadow-[3px_3px_0px_#443223] mb-8">
              <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase tracking-wider block mb-2">
                TODAY'S LITERARY INVITATION:
              </span>
              <p className="font-editorial text-xl sm:text-2xl font-bold text-[#443223] leading-snug">
                "{selectedPrompt.prompt_text}"
              </p>
            </div>

            {/* User Response Form */}
            <form onSubmit={handleSubmitPromptResponse} className="space-y-4 font-typewriter text-xs">
              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  MENTION A VOLUME (OPTIONAL):
                </label>
                <input
                  type="text"
                  value={responseBookTitle}
                  onChange={e => setResponseBookTitle(e.target.value)}
                  placeholder="e.g. The Secret History or Meditations..."
                  className="w-full p-2 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#72583E] mb-1">
                  YOUR RESPONSE (JOURNAL ENTRY):
                </label>
                <textarea
                  required
                  rows={4}
                  value={responseContent}
                  onChange={e => setResponseContent(e.target.value)}
                  placeholder="Inscribe your reflection as if writing in a quiet notebook..."
                  className="w-full p-3 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-handwritten text-lg leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#72583E]">
                  <input
                    type="checkbox"
                    checked={responseIsPrivate}
                    onChange={e => setResponseIsPrivate(e.target.checked)}
                    className="accent-[#755151]"
                  />
                  {responseIsPrivate ? (
                    <span className="flex items-center gap-1 text-[#755151]">
                      <Lock className="w-3.5 h-3.5" /> Private to My Shelf only (Still advances streak!)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-green-700" /> Public Club Response
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 cursor-pointer flex items-center gap-2"
                >
                  {responseSubmitted ? (
                    <>
                      <Check className="w-4 h-4 text-green-300" />
                      <span>Inscribed & Streak Updated!</span>
                    </>
                  ) : (
                    <>
                      <Feather className="w-4 h-4" />
                      <span>Inscribe Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Public Responses to Prompt */}
          <div className="space-y-4">
            <h3 className="font-editorial text-xl font-bold text-[#443223] border-b-2 border-[#443223] pb-3">
              Member Inscriptions ({responses.filter(r => !r.is_private).length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responses
                .filter(r => !r.is_private)
                .map(r => (
                  <div
                    key={r.id}
                    className="p-5 bg-[#FCF8F2] border-2 border-[#443223] rounded shadow-[3px_3px_0px_#443223] flex flex-col justify-between"
                  >
                    <div>
                      {r.book_title && (
                        <span className="text-[10px] font-typewriter font-bold text-[#755151] block mb-2">
                          RE: {r.book_title}
                        </span>
                      )}
                      <p className="font-handwritten text-lg text-[#3D2B1F] leading-relaxed mb-3">
                        "{r.content}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#A08670] text-xs font-typewriter">
                      <span className="text-[#72583E] font-bold">
                        {r.display_name} · {r.created_at}
                      </span>
                      <span className="text-[#755151] text-xs flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" /> {r.likes_count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 9C: LEAVE THIS BOOK FOR SOMEONE
          ========================================================================= */}
      {activeSection === 'leave-book' && (
        <section className="space-y-8">
          <div className="catalog-card p-6 sm:p-10 bg-[#FCF8F2] border-3 border-[#443223] shadow-[6px_6px_0px_#443223]">
            <div className="border-b-2 border-dashed border-[#A08670] pb-6 mb-8">
              <div className="inline-flex items-center gap-2 starburst-badge mb-3">
                <Share2 className="w-3.5 h-3.5 text-[#FFF9F3]" />
                <span>BOOK SHARING RECOMMENDATION ENGINE</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
                Leave This Book for Someone
              </h2>
              <p className="font-handwritten text-xl text-[#755151] italic mt-1">
                Some books are better when they find their way to someone else.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleGenerateRecommendation} className="space-y-4 font-typewriter text-xs">
                  <div>
                    <label className="block font-bold text-[#72583E] mb-1">
                      1. SELECT VOLUME FROM CATALOGUE:
                    </label>
                    <select
                      value={recBookId}
                      onChange={e => {
                        setRecBookId(e.target.value);
                        setGeneratedShareToken(null);
                      }}
                      className="w-full p-2.5 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-typewriter font-bold"
                    >
                      {SEED_BOOKS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title} — {b.author} ({b.publication_year})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#72583E] mb-1">
                      2. WHY ARE YOU LEAVING THIS BOOK FOR THEM?
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={recMessage}
                      onChange={e => {
                        setRecMessage(e.target.value);
                        setGeneratedShareToken(null);
                      }}
                      placeholder="Write your note: 'I remembered you loved autumn rains, and this novel carries that exact fragrance...'"
                      className="w-full p-3 border border-[#443223] rounded bg-[#FFF9F3] text-[#443223] font-handwritten text-lg leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#72583E]">
                      <input
                        type="checkbox"
                        checked={recIsAnonymous}
                        onChange={e => {
                          setRecIsAnonymous(e.target.checked);
                          setGeneratedShareToken(null);
                        }}
                        className="accent-[#755151]"
                      />
                      <span>Leave Anonymously (Hide sender name on recommendation card)</span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-primary text-xs py-2.5 px-5 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Seal Recommendation & Generate Link</span>
                    </button>
                  </div>
                </form>

                {/* Share Link Result Banner */}
                {generatedShareToken && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#FFF9F3] border-2 border-[#755151] rounded shadow-[3px_3px_0px_#443223] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-typewriter text-xs font-bold text-[#755151] uppercase flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-green-700" /> Recommendation Sealed!
                      </span>
                      <span className="font-mono text-[10px] text-[#A08670]">
                        TOKEN #{generatedShareToken}
                      </span>
                    </div>

                    <p className="font-typewriter text-xs text-[#58432D]">
                      Share this unique unlisted link with a friend. When they open it, they’ll discover your note and this volume:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/margins?section=leave-book&token=${generatedShareToken}`}
                        className="flex-1 p-2 border border-[#443223] rounded bg-white text-xs font-mono text-[#443223]"
                      />
                      <button
                        onClick={copyShareLink}
                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Live Recipient Experience Preview */}
              <div className="lg:col-span-5">
                <span className="font-typewriter text-[11px] font-bold text-[#755151] uppercase tracking-wider block mb-2">
                  RECIPIENT PREVIEW CARD:
                </span>

                <div className="p-6 bg-[#FCF8F2] border-3 border-[#443223] rounded-lg shadow-[6px_6px_0px_#443223] space-y-4">
                  <div className="border-b border-dashed border-[#A08670] pb-3">
                    <span className="text-[10px] font-typewriter uppercase tracking-widest text-[#72583E] block">
                      A BOOK WAS LEFT FOR YOU BY:
                    </span>
                    <h3 className="font-editorial text-xl font-bold text-[#755151]">
                      {recIsAnonymous ? 'A Fellow Reader in the Shadows' : (user?.displayName || user?.username || 'Eleanor Vance')}
                    </h3>
                  </div>

                  {/* Book Card in Recipient Preview */}
                  <div className="flex items-center gap-4 p-3 bg-[#FFF9F3] border-2 border-[#443223] rounded">
                    <div className="w-16 flex-shrink-0">
                      <BookCoverImage book={selectedRecBook} className="w-16" />
                    </div>
                    <div>
                      <h4 className="font-editorial text-base font-bold text-[#443223] leading-snug">
                        {selectedRecBook.title}
                      </h4>
                      <p className="font-typewriter text-xs text-[#72583E]">
                        by {selectedRecBook.author} ({selectedRecBook.publication_year})
                      </p>
                      <button
                        onClick={() => setModalBook(selectedRecBook)}
                        className="text-[10px] font-typewriter font-bold text-[#755151] hover:underline mt-1 block cursor-pointer"
                      >
                        Inspect Book Dossier →
                      </button>
                    </div>
                  </div>

                  {/* Message in Handwriting */}
                  <div className="p-4 bg-[#FFF9F3] border-l-3 border-[#755151] rounded border border-[#A08670]">
                    <Quote className="w-4 h-4 text-[#755151] mb-1" />
                    <p className="font-handwritten text-xl text-[#3D2B1F] leading-relaxed">
                      "{recMessage || 'I left this book for you. Read it slowly when the world feels too noisy.'}"
                    </p>
                  </div>

                  <div className="pt-2 text-center">
                    <NavLink
                      to="/library"
                      className="btn-secondary text-xs w-full justify-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Enter the Grand Library</span>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
