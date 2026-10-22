import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, Feather, ArrowRight, Quote, Compass } from 'lucide-react';

interface AuthorProfile {
  id: string;
  name: string;
  tagline: string;
  portrait: string;
  bio: string;
  featuredBook: {
    title: string;
    year: number;
    cover: string;
    synopsis: string;
  };
  otherWorks: { title: string; cover: string; year: number }[];
  signatureGuide: {
    heading: string;
    intro: string;
    signs: { name: string; description: string }[];
    quote: string;
  };
}

const AUTHORS: AuthorProfile[] = [
  {
    id: 'murakami',
    name: 'Haruki Murakami',
    tagline: 'THE ARCHITECT OF OTHER REALITIES',
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
    bio: 'Haruki Murakami is not just a writer, he is a state of mind. A former jazz bar owner, marathon runner, and passionate vinyl collector, he has created a unique universe where cooking spaghetti is as important as talking to shadows.',
    featuredBook: {
      title: 'Norwegian Wood',
      year: 1987,
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      synopsis: 'Tor Watanabe looks back on his student days in Tokyo during the late 1960s, caught between his devotion to the fragile, grieving Naoko and his irresistible attraction to the fiercely independent Midori.',
    },
    otherWorks: [
      { title: 'The Wind-Up Bird Chronicle', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', year: 1994 },
      { title: '1Q84', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', year: 2009 },
      { title: 'Kafka on the Shore', cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', year: 2002 },
      { title: 'Dance Dance Dance', cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', year: 1988 },
      { title: 'Hard-Boiled Wonderland', cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80', year: 1985 },
    ],
    signatureGuide: {
      heading: 'Why is everything in his books not what it seems?',
      intro: 'To understand Murakami, you must learn to read between the lines and recognize his recurring literary motifs:',
      signs: [
        { name: 'Deep Wells', description: 'Portals to our subconscious; characters descend to confront the darkness of their unresolved grief.' },
        { name: 'Vinyl & Jazz', description: 'From Rossini to The Beatles, music is never just a backdrop, but an active compass shaping the rhythm of the narrative.' },
        { name: 'Two Moons & Parallel Realities', description: 'All it takes is taking a wrong turn or hearing a strange phone call to step into a reality with two moons in the sky.' },
        { name: 'Self-Sufficient Solitude', description: 'His protagonists cook alone, listen to records alone, and discover that loneliness is not a defect, but a sacred room for contemplation.' },
      ],
      quote: '“The world is a place where you have to constantly prove your existence.” — Haruki Murakami',
    },
  },
  {
    id: 'woolf',
    name: 'Virginia Woolf',
    tagline: 'THE CHRONICLER OF THE INNER PULSE',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    bio: 'Central figure of the Bloomsbury Group, Virginia Woolf pioneered the modernist stream-of-consciousness technique, capturing the luminous, fleeting texture of human awareness and memory across the passing minutes of an afternoon.',
    featuredBook: {
      title: 'To the Lighthouse',
      year: 1927,
      cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
      synopsis: 'A landmark exploration of time, art, and grief centred around the Ramsay family’s visits to the Isle of Skye, where the elusive beam of the lighthouse measures the quiet passage of mortal years.',
    },
    otherWorks: [
      { title: 'Mrs Dalloway', cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80', year: 1925 },
      { title: 'Orlando', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', year: 1928 },
      { title: 'The Waves', cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80', year: 1931 },
      { title: 'A Room of One’s Own', cover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80', year: 1929 },
    ],
    signatureGuide: {
      heading: 'How to experience Woolf’s luminous moments of being?',
      intro: 'Woolf did not write linear plots; she mapped the interior architecture of thought itself:',
      signs: [
        { name: 'The Chime of Big Ben', description: 'Time strikes relentlessly through the day, marking the boundary between external duty and inner freedom.' },
        { name: 'Luminous Halos', description: 'Life is not a series of gig lamps symmetrically arranged; life is a luminous halo, a semi-transparent envelope.' },
        { name: 'Canvas & Stroke', description: 'Lily Briscoe’s easel mirrors Woolf’s own question: how does one preserve love before it dissolves in time?' },
      ],
      quote: '“Lock up your libraries if you like; but there is no gate, no lock, no bolt that you can set upon the freedom of my mind.” — Virginia Woolf',
    },
  },
];

export const AuthorSpotlightPage: React.FC = () => {
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfile>(AUTHORS[0]);
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Author Switcher Ribbon */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 border-b-2 border-[#443223]">
        <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider flex-shrink-0">
          SPOTLIGHT ARCHIVE:
        </span>
        {AUTHORS.map(author => (
          <button
            key={author.id}
            onClick={() => {
              setSelectedAuthor(author);
              setFavorited(false);
            }}
            className={`px-3.5 py-1.5 rounded font-typewriter text-xs font-bold transition-all border-2 ${
              selectedAuthor.id === author.id
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
            }`}
          >
            {author.name}
          </button>
        ))}
      </div>

      {/* Main Author Showcase (Inspired by Murakami Reference Wireframe) */}
      <div className="catalog-card p-6 sm:p-10 bg-[#FCF8F2] border-2 border-[#443223] shadow-[5px_5px_0px_#443223] mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b-2 border-dashed border-[#A08670]">
          {/* Left: Author Headline & Bio */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 starburst-badge mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
              <span>DPC AUTHOR SPOTLIGHT</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#443223] tracking-tight mb-2">
              {selectedAuthor.name.toUpperCase()}
            </h1>

            <p className="font-typewriter text-xs sm:text-sm font-bold tracking-[0.2em] text-[#755151] uppercase mb-6">
              {selectedAuthor.tagline}
            </p>

            <p className="font-typewriter text-sm sm:text-base text-[#58432D] leading-relaxed max-w-xl">
              {selectedAuthor.bio}
            </p>
          </div>

          {/* Right: High Contrast Monochrome Author Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-xs aspect-[4/5] rounded border-3 border-[#443223] overflow-hidden shadow-[4px_4px_0px_#443223] bg-[#443223]">
              <img
                src={selectedAuthor.portrait}
                alt={selectedAuthor.name}
                className="w-full h-full object-cover grayscale contrast-125"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                <span className="font-typewriter text-xs text-[#FFF9F3] uppercase tracking-widest">
                  AUTHOR PORTRAIT · ARCHIVAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Book Section */}
        <div className="pt-8 pb-10 border-b-2 border-dashed border-[#A08670]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="w-48 aspect-[2/3] rounded border-2 border-[#443223] shadow-[4px_4px_0px_#443223] overflow-hidden">
                <img
                  src={selectedAuthor.featuredBook.cover}
                  alt={selectedAuthor.featuredBook.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8">
              <span className="font-typewriter text-xs font-bold text-[#72583E] uppercase tracking-wider">
                FEATURED MASTERWORK ({selectedAuthor.featuredBook.year})
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223] mt-1 mb-3">
                {selectedAuthor.featuredBook.title}
              </h2>
              <p className="font-typewriter text-sm text-[#58432D] leading-relaxed mb-6 max-w-xl">
                {selectedAuthor.featuredBook.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <NavLink to="/library" className="btn-primary text-xs py-2.5 px-5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start Reading in Library</span>
                </NavLink>

                <button
                  onClick={() => setFavorited(!favorited)}
                  className={`btn-secondary text-xs py-2.5 px-4 ${
                    favorited ? 'bg-[#755151] text-white border-[#443223]' : ''
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
                  <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Other Works Row */}
        <div className="pt-8 pb-10 border-b-2 border-[#443223]">
          <h3 className="font-editorial text-xl font-bold text-[#443223] mb-4">
            Essential Works by {selectedAuthor.name}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {selectedAuthor.otherWorks.map((work, idx) => (
              <div
                key={idx}
                className="group cursor-pointer flex flex-col items-center text-center p-2 rounded hover:bg-[#DBC4A5]/20 transition-colors"
              >
                <div className="w-full aspect-[2/3] rounded border-2 border-[#443223] shadow-[2px_2px_0px_#443223] overflow-hidden mb-2 group-hover:-translate-y-1 transition-transform">
                  <img src={work.cover} alt={work.title} className="w-full h-full object-cover" />
                </div>
                <span className="font-editorial text-xs font-bold text-[#443223] line-clamp-1">
                  {work.title}
                </span>
                <span className="font-typewriter text-[10px] text-[#72583E]">
                  {work.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Guide: "Why is everything in his books not what it seems?" */}
        <div className="pt-8">
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#443223] mb-2">
            {selectedAuthor.signatureGuide.heading}
          </h3>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mb-6">
            {selectedAuthor.signatureGuide.intro}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {selectedAuthor.signatureGuide.signs.map((sign, idx) => (
              <div key={idx} className="p-4 bg-[#FFF9F3] border-2 border-[#A08670] rounded">
                <span className="font-typewriter text-xs font-bold text-[#755151] block mb-1 uppercase tracking-wider">
                  ✦ {sign.name}
                </span>
                <p className="font-typewriter text-xs text-[#443223] leading-relaxed">
                  {sign.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stamped Author Quote */}
          <div className="p-4 bg-[#DBC4A5]/40 border-2 border-[#443223] rounded flex items-start gap-3">
            <Quote className="w-5 h-5 text-[#755151] flex-shrink-0 mt-0.5" />
            <span className="font-typewriter text-xs sm:text-sm italic font-semibold text-[#443223]">
              {selectedAuthor.signatureGuide.quote}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
