import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { BookOpen, Sparkles, Feather, ArrowRight, Quote, Heart, Bookmark } from 'lucide-react';
import { BookDetailModal } from '../components/books/BookDetailModal';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book } from '../types/book';

interface AuthorProfile {
  id: string;
  name: string;
  nationality: string;
  lifespan: string;
  tagline: string;
  portrait: string;
  bio: string;
  featuredBook: {
    id?: string;
    title: string;
    year: number;
    cover: string;
    synopsis: string;
  };
  otherWorks: { id?: string; title: string; cover: string; year: number }[];
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
    nationality: 'Japanese',
    lifespan: 'b. 1949',
    tagline: 'THE ARCHITECT OF OTHER REALITIES',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/HarukiMurakami.png/480px-HarukiMurakami.png',
    bio: 'Haruki Murakami is a novelist, translator, and essayist. A former Tokyo jazz bar owner, marathon runner, and passionate vinyl collector, he constructs worlds where cooking spaghetti or finding a lost cat quietly crosses into alternate realities with two moons.',
    featuredBook: {
      id: 'b31',
      title: 'Norwegian Wood',
      year: 1987,
      cover: 'https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg',
      synopsis: 'Toru Watanabe reflects on his Tokyo student days in the late 1960s, navigating grief, desire, and the fragile memory of loved ones who slipped into the darkness.',
    },
    otherWorks: [
      { title: 'The Wind-Up Bird Chronicle', cover: 'https://covers.openlibrary.org/b/isbn/9780679775430-L.jpg', year: 1994 },
      { title: '1Q84', cover: 'https://covers.openlibrary.org/b/isbn/9780307593313-L.jpg', year: 2009 },
      { title: 'Kafka on the Shore', cover: 'https://covers.openlibrary.org/b/isbn/9781400079278-L.jpg', year: 2002 },
      { title: 'Hard-Boiled Wonderland', cover: 'https://covers.openlibrary.org/b/isbn/9780679743460-L.jpg', year: 1985 },
    ],
    signatureGuide: {
      heading: 'How to Recognize Murakami’s World:',
      intro: 'To understand Murakami, learn to read the recurring motifs threaded through his fiction:',
      signs: [
        { name: 'Deep Dry Wells', description: 'Subconscious descent: characters sit in darkness to face grief and uncover repressed memory.' },
        { name: 'Vinyl & Jazz Records', description: 'Music provides rhythm and spiritual compass—not backdrop, but an emotional pulse.' },
        { name: 'Two Moons in the Sky', description: 'The subtle borderland where ordinary reality gives way to magical alternate timelines.' },
        { name: 'Sacred Solitude', description: 'Characters prepare cutlets, iron shirts, and cherish loneliness as reflective space.' },
      ],
      quote: '“Death exists, not as the opposite but as a part of life.” — Haruki Murakami',
    },
  },
  {
    id: 'woolf',
    name: 'Virginia Woolf',
    nationality: 'British',
    lifespan: '1882 – 1941',
    tagline: 'THE CHRONICLER OF THE INNER PULSE',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg/440px-George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg',
    bio: 'Pioneering modernist author and central figure of the Bloomsbury Group. Woolf transformed the English novel by charting the luminous, streaming texture of human consciousness across single afternoons and passing years.',
    featuredBook: {
      id: 'b33',
      title: 'To the Lighthouse',
      year: 1927,
      cover: 'https://covers.openlibrary.org/b/isbn/9780156907392-L.jpg',
      synopsis: 'Centred on the Ramsay family’s visits to the Isle of Skye, this masterpiece meditates on art, love, and the relentless ticking of time between visits to the distant lighthouse.',
    },
    otherWorks: [
      { title: 'Mrs Dalloway', cover: 'https://covers.openlibrary.org/b/isbn/9780156628709-L.jpg', year: 1925 },
      { title: 'Orlando', cover: 'https://covers.openlibrary.org/b/isbn/9780156701600-L.jpg', year: 1928 },
      { title: 'The Waves', cover: 'https://covers.openlibrary.org/b/isbn/9780156949606-L.jpg', year: 1931 },
      { title: 'A Room of One’s Own', cover: 'https://covers.openlibrary.org/b/isbn/9780156030410-L.jpg', year: 1929 },
    ],
    signatureGuide: {
      heading: 'How to Enter Woolf’s Stream of Being:',
      intro: 'Woolf rejected rigid plot outlines to render the interior architecture of emotion:',
      signs: [
        { name: 'The Chime of Big Ben', description: 'External clock time strikes steadily against the infinite elastic expanse of inner thoughts.' },
        { name: 'Luminous Halos', description: 'Life as a transparent envelope surrounding consciousness from beginning to end.' },
        { name: 'Painterly Strokes', description: 'Lily Briscoe’s brush mirrors Woolf’s own search for lasting form amidst transience.' },
      ],
      quote: '“Lock up your libraries if you like; but there is no gate, no lock, no bolt that you can set upon the freedom of my mind.” — Virginia Woolf',
    },
  },
  {
    id: 'tartt',
    name: 'Donna Tartt',
    nationality: 'American',
    lifespan: 'b. 1963',
    tagline: 'THE ALCHEMIST OF MORAL OBSESSION',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Donna_Tartt_2014.jpg/440px-Donna_Tartt_2014.jpg',
    bio: 'Pulitzer Prize-winning author whose meticulously crafted novels appear once a decade. Tartt’s fiction fuses 19th-century Dickensian narrative grandeur with ancient Greek tragic fatalism and aesthetic obsession.',
    featuredBook: {
      id: 'b1',
      title: 'The Secret History',
      year: 1992,
      cover: 'https://covers.openlibrary.org/b/isbn/9780679744412-L.jpg',
      synopsis: 'A cloistered cohort of classics students at an elite Vermont college fall under the spell of their charismatic tutor, pursuing an ecstasy that crosses into homicide.',
    },
    otherWorks: [
      { id: 'b16', title: 'The Goldfinch', cover: 'https://covers.openlibrary.org/b/isbn/9780316055437-L.jpg', year: 2013 },
      { title: 'The Little Friend', cover: 'https://covers.openlibrary.org/b/isbn/9781400031696-L.jpg', year: 2002 },
    ],
    signatureGuide: {
      heading: 'Keys to the Tarttian Sensibility:',
      intro: 'Tartt explores how the worship of beauty blinds human beings to moral boundaries:',
      signs: [
        { name: 'Bacchic Ecstasy', description: 'Seeking release from ordinary humdrum existence through intoxicating rituals.' },
        { name: 'Curated Wardrobe', description: 'Wool trenchcoats, fountain pens, and tailored garments used as armor against the world.' },
        { name: 'Art as Talisman', description: 'Objects of master craftsmanship that outlive human grief and embody immortality.' },
      ],
      quote: '“Beauty is terror. Whatever we call beautiful, we quiver before it.” — Donna Tartt',
    },
  },
  {
    id: 'wilde',
    name: 'Oscar Wilde',
    nationality: 'Irish',
    lifespan: '1854 – 1900',
    tagline: 'THE HIGH PRIEST OF AESTHETIC DEFIANCE',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Oscar_Wilde_Sarony.jpg/440px-Oscar_Wilde_Sarony.jpg',
    bio: 'Playwright, poet, and icon of the Aesthetic movement. Wilde’s dazzling wit, razor-sharp epigrams, and defiant belief in art for art’s sake exposed the hypocrisy of Victorian morality.',
    featuredBook: {
      id: 'b3',
      title: 'The Picture of Dorian Gray',
      year: 1890,
      cover: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg',
      synopsis: 'A hedonistic young man sells his soul for eternal physical youth, while a hidden portrait in his attic bears the repulsive scars of his corruption.',
    },
    otherWorks: [
      { title: 'The Importance of Being Earnest', cover: 'https://covers.openlibrary.org/b/isbn/9780486264783-L.jpg', year: 1895 },
      { title: 'De Profundis', cover: 'https://covers.openlibrary.org/b/isbn/9780140439007-L.jpg', year: 1905 },
      { title: 'The Ballad of Reading Gaol', cover: 'https://covers.openlibrary.org/b/isbn/9780486270883-L.jpg', year: 1898 },
    ],
    signatureGuide: {
      heading: 'The Wildean Paradox:',
      intro: 'Behind every effortless quip lay a profound critique of Victorian conformity:',
      signs: [
        { name: 'Art Over Nature', description: 'Life imitates art far more than art imitates life.' },
        { name: 'The Mask of Irony', description: 'Man is least himself when he talks in his own person; give him a mask and he will tell you the truth.' },
        { name: 'The Cost of Sensation', description: 'To cure the soul by means of the senses, and the senses by means of the soul.' },
      ],
      quote: '“We are all in the gutter, but some of us are looking at the stars.” — Oscar Wilde',
    },
  },
  {
    id: 'camus',
    name: 'Albert Camus',
    nationality: 'French-Algerian',
    lifespan: '1913 – 1960',
    tagline: 'THE PHILOSOPHER OF THE INVINCIBLE SUMMER',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_la_cigarette_de_fumage.jpg/440px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_la_cigarette_de_fumage.jpg',
    bio: 'Nobel Laureate author and philosopher of the Absurd. Camus explored the fundamental human need for meaning in a silent, indifferent universe, finding dignity in lucid defiance and fraternal compassion.',
    featuredBook: {
      id: 'b32',
      title: 'The Stranger',
      year: 1942,
      cover: 'https://covers.openlibrary.org/b/isbn/9780679720201-L.jpg',
      synopsis: 'Meursault, who will not lie or play along with societal rituals, finds himself condemned as much for his emotional honesty as for his fateful act on a blazing Algerian beach.',
    },
    otherWorks: [
      { title: 'The Myth of Sisyphus', cover: 'https://covers.openlibrary.org/b/isbn/9780679733737-L.jpg', year: 1942 },
      { title: 'The Plague', cover: 'https://covers.openlibrary.org/b/isbn/9780679720218-L.jpg', year: 1947 },
      { title: 'The Fall', cover: 'https://covers.openlibrary.org/b/isbn/9780679720225-L.jpg', year: 1956 },
    ],
    signatureGuide: {
      heading: 'Camus and the Absurd:',
      intro: 'How to live with lucid joy in an indifferent world:',
      signs: [
        { name: 'The Rock of Sisyphus', description: 'The struggle itself toward the heights is enough to fill a man’s heart.' },
        { name: 'The Blinding Sun', description: 'Mediterranean light exposing unadorned physical existence without religious illusions.' },
        { name: 'The Invincible Summer', description: 'Inner resilience forged in times of political darkness and personal trial.' },
      ],
      quote: '“In the midst of winter, I found there was, within me, an invincible summer.” — Albert Camus',
    },
  },
];

export const AuthorSpotlightPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const authorQuery = searchParams.get('author')?.toLowerCase();

  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfile>(() => {
    if (authorQuery) {
      const match = AUTHORS.find(
        a => a.id.toLowerCase() === authorQuery || a.name.toLowerCase().includes(authorQuery)
      );
      if (match) return match;
    }
    return AUTHORS[0];
  });

  const [modalBook, setModalBook] = useState<Book | null>(null);
  const [portraitError, setPortraitError] = useState(false);

  // Sync when query param changes
  useEffect(() => {
    if (authorQuery) {
      const match = AUTHORS.find(
        a => a.id.toLowerCase() === authorQuery || a.name.toLowerCase().includes(authorQuery)
      );
      if (match) {
        setSelectedAuthor(match);
        setPortraitError(false);
      }
    }
  }, [authorQuery]);

  const handleSelectAuthor = (author: AuthorProfile) => {
    setSelectedAuthor(author);
    setPortraitError(false);
    setSearchParams({ author: author.id });
  };

  const handleOpenBook = (bookId?: string, fallbackTitle?: string) => {
    if (bookId) {
      const found = SEED_BOOKS.find(b => b.id === bookId);
      if (found) {
        setModalBook(found);
        return;
      }
    }
    if (fallbackTitle) {
      const found = SEED_BOOKS.find(b => b.title.toLowerCase() === fallbackTitle.toLowerCase());
      if (found) {
        setModalBook(found);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 text-[#443223]">
      {/* Editorial Headline Ribbon */}
      <div className="border-b-2 border-[#443223] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-3">
            <Feather className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>ARCHIVAL SPOTLIGHT · LITERARY MAGAZINE DOSSIER</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#443223]">
            Author Inquiries
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mt-1 max-w-xl">
            Factually verified literary portraits, recurring motifs, and archival editions from the Dead Poets Club repository.
          </p>
        </div>

        {/* Explore All in Library */}
        <NavLink
          to={`/library?search=${encodeURIComponent(selectedAuthor.name)}`}
          className="btn-secondary text-xs py-2 px-3 self-start md:self-auto inline-flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explore All {selectedAuthor.name.split(' ').pop()} Works</span>
        </NavLink>
      </div>

      {/* Author Switcher Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b-2 border-dashed border-[#A08670]">
        <span className="font-typewriter text-xs font-bold text-[#755151] uppercase tracking-wider flex-shrink-0 mr-2">
          SELECT AUTHOR:
        </span>
        {AUTHORS.map(author => (
          <button
            key={author.id}
            onClick={() => handleSelectAuthor(author)}
            className={`px-3.5 py-1.5 rounded font-typewriter text-xs font-bold transition-all border-2 cursor-pointer flex-shrink-0 ${
              selectedAuthor.id === author.id
                ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
            }`}
          >
            {author.name}
          </button>
        ))}
      </div>

      {/* Main Author Showcase (Inspired by Literary Magazine Profile Layout) */}
      <div className="catalog-card p-6 sm:p-10 bg-[#FCF8F2] border-2 border-[#443223] shadow-[5px_5px_0px_#443223] mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b-2 border-dashed border-[#A08670]">
          {/* Left: Author Headline & Bio */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 starburst-badge mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
              <span>{selectedAuthor.nationality.toUpperCase()} · {selectedAuthor.lifespan}</span>
            </div>

            <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-[#443223] tracking-tight mb-2">
              {selectedAuthor.name.toUpperCase()}
            </h2>

            <p className="font-typewriter text-xs sm:text-sm font-bold tracking-[0.2em] text-[#755151] uppercase mb-6">
              {selectedAuthor.tagline}
            </p>

            <p className="font-typewriter text-sm sm:text-base text-[#58432D] leading-relaxed max-w-xl">
              {selectedAuthor.bio}
            </p>
          </div>

          {/* Right: Verified Portrait / Classical Archival Fallback */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group p-2 bg-[#FFF9F3] border-3 border-[#443223] rounded shadow-[5px_5px_0px_#443223] -rotate-1 max-w-xs w-full">
              <div className="w-full h-80 bg-[#2A231E] rounded overflow-hidden border border-[#A08670] relative flex items-center justify-center">
                {!portraitError ? (
                  <img
                    src={selectedAuthor.portrait}
                    alt={`Authentic portrait of ${selectedAuthor.name}`}
                    onError={() => setPortraitError(true)}
                    className="w-full h-full object-cover grayscale contrast-115 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-6 text-center text-[#DBC4A5] flex flex-col items-center justify-center">
                    <Feather className="w-12 h-12 text-[#DBC4A5] mb-2 opacity-60" />
                    <span className="font-editorial text-lg font-bold">
                      {selectedAuthor.name}
                    </span>
                    <span className="font-typewriter text-[10px] uppercase opacity-75 mt-1">
                      Archival Record · Verified
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 bg-[#1A1614]/90 border border-[#DBC4A5]/40 text-[#FFF9F3] text-[9px] font-mono px-2 py-0.5 rounded">
                  {selectedAuthor.name} · Archival Print
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Literary Monument Work */}
        <div className="pt-8 pb-8 border-b-2 border-dashed border-[#A08670]">
          <span className="font-typewriter text-[10px] font-bold text-[#755151] uppercase tracking-wider block mb-4">
            FEATURED ARCHIVAL VOLUME:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FFF9F3] p-5 sm:p-6 rounded border-2 border-[#443223]">
            <div className="md:col-span-3 flex justify-center">
              <img
                src={selectedAuthor.featuredBook.cover}
                alt={selectedAuthor.featuredBook.title}
                className="w-32 h-48 object-cover rounded border-2 border-[#443223] shadow-md"
              />
            </div>
            <div className="md:col-span-9">
              <span className="font-typewriter text-[11px] font-bold text-[#755151] uppercase">
                FIRST PUBLISHED {selectedAuthor.featuredBook.year}
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#443223] mt-0.5 mb-2">
                {selectedAuthor.featuredBook.title}
              </h3>
              <p className="font-typewriter text-xs sm:text-sm text-[#58432D] leading-relaxed mb-4">
                {selectedAuthor.featuredBook.synopsis}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenBook(selectedAuthor.featuredBook.id, selectedAuthor.featuredBook.title)}
                  className="btn-primary text-xs py-2 px-4 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Volume Dossier</span>
                </button>
                <NavLink
                  to={`/library?search=${encodeURIComponent(selectedAuthor.featuredBook.title)}`}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Find in Stacks
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Guide to Recurring Motifs */}
        <div className="pt-8 pb-8 border-b-2 border-dashed border-[#A08670]">
          <h3 className="font-editorial text-2xl font-bold text-[#443223] mb-2">
            {selectedAuthor.signatureGuide.heading}
          </h3>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E] mb-6">
            {selectedAuthor.signatureGuide.intro}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {selectedAuthor.signatureGuide.signs.map((sign, idx) => (
              <div
                key={sign.name}
                className="p-4 rounded bg-[#FFF9F3] border-2 border-[#443223] shadow-[2px_2px_0px_#443223]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#755151]">
                    0{idx + 1}.
                  </span>
                  <h4 className="font-editorial text-base font-bold text-[#443223]">
                    {sign.name}
                  </h4>
                </div>
                <p className="font-typewriter text-xs text-[#58432D] leading-relaxed">
                  {sign.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pull Quote */}
          <div className="p-4 bg-[#FFF9F3] border-l-4 border-[#755151] border border-[#443223] rounded">
            <Quote className="w-4 h-4 text-[#755151] mb-1" />
            <p className="font-editorial text-sm italic text-[#443223]">
              {selectedAuthor.signatureGuide.quote}
            </p>
          </div>
        </div>

        {/* Notable Other Works Shelf */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-editorial text-xl font-bold text-[#443223]">
              Notable Works by {selectedAuthor.name}
            </h3>
            <span className="font-typewriter text-xs text-[#755151] font-bold">
              VERIFIED ARCHIVAL EDITIONS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {selectedAuthor.otherWorks.map(work => (
              <div
                key={work.title}
                onClick={() => handleOpenBook(work.id, work.title)}
                className="catalog-card p-3 bg-[#FFF9F3] border-2 border-[#443223] shadow-[3px_3px_0px_#443223] flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-all"
              >
                <div className="w-full h-44 rounded overflow-hidden border border-[#443223] mb-2 bg-[#2A231E]">
                  <img
                    src={work.cover}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-editorial text-sm font-bold text-[#443223] group-hover:text-[#755151] transition-colors line-clamp-1">
                    {work.title}
                  </h4>
                  <span className="font-typewriter text-[10px] text-[#72583E]">
                    {work.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
