import React from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, Grid3X3, Sparkles, ArrowLeft, BookOpen } from 'lucide-react';

interface PlaceholderRoomPageProps {
  type: 'cafe' | 'crossword';
}

export const PlaceholderRoomPage: React.FC<PlaceholderRoomPageProps> = ({ type }) => {
  const isCafe = type === 'cafe';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#784743] to-[#3a1b18] border border-[#d3a66d]/50 flex items-center justify-center shadow-xl">
        {isCafe ? (
          <Coffee className="w-10 h-10 text-[#e8c18e]" />
        ) : (
          <Grid3X3 className="w-10 h-10 text-[#8e9c82]" />
        )}
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#784743]/20 border border-[#d3a66d]/40 text-xs font-mono text-[#e8c18e]">
        <Sparkles className="w-3.5 h-3.5 text-[#d3a66d]" />
        <span>{isCafe ? 'Phase 5 Roadmap: Virtual Café' : 'Phase 4 Roadmap: Daily Crossword'}</span>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#f0eae1]">
        {isCafe ? 'The Candlelit Virtual Café' : 'The Daily Literary Crossword'}
      </h1>

      <p className="font-sans text-sm sm:text-base text-[#a39b8f] max-w-lg mx-auto leading-relaxed">
        {isCafe
          ? 'An atmospheric 2D focus lounge with ambient crackling hearth audio, quiet co-presence, and reading session timers. Coming in Phase 5.'
          : 'A daily book-title puzzle curated with literary clues, automated completion validation, and unbroken streak rewards. Coming in Phase 4.'}
      </p>

      <div className="flex items-center justify-center gap-4 pt-4">
        <NavLink to="/clubhouse" className="btn-secondary text-xs py-2.5 px-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clubhouse
        </NavLink>
        <NavLink to="/library" className="btn-primary text-xs py-2.5 px-4">
          <BookOpen className="w-3.5 h-3.5" /> Explore Grand Library
        </NavLink>
      </div>
    </div>
  );
};
