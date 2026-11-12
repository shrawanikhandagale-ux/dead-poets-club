import React, { useState } from 'react';
import { POEM_CORPUS, Poem } from '../../data/poems';
import confetti from 'canvas-confetti';
import { Sparkles, Bookmark, Copy, Check, RefreshCw, Feather, ScrollText, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../lib/audioEngine';

interface ClubhousePoemCurioProps {
  className?: string;
}

export const ClubhousePoemCurio: React.FC<ClubhousePoemCurioProps> = ({ className = '' }) => {
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [activeCapsuleColor, setActiveCapsuleColor] = useState<string>('#755151');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [savedPoemIds, setSavedPoemIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dpc_saved_poems') || '[]');
    } catch {
      return [];
    }
  });

  const pullPoem = () => {
    if (isDispensing) return;
    soundEngine.playClick();
    setIsDispensing(true);
    setCopied(false);
    setSaved(false);

    // Pick random poem from corpus
    const randomPoem = POEM_CORPUS[Math.floor(Math.random() * POEM_CORPUS.length)];
    setActiveCapsuleColor(randomPoem.capsuleColor);

    setTimeout(() => {
      setIsDispensing(false);
      setSelectedPoem(randomPoem);
      soundEngine.playPageTurn();
      confetti({
        particleCount: 36,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#755151', '#DBC4A5', '#72583E', '#443223', '#A08670'],
      });
    }, 950);
  };

  const handleCopy = (poem: Poem) => {
    soundEngine.playClick();
    const text = `${poem.title}\nby ${poem.poet} (${poem.period})\n\n${poem.lines.join('\n')}\n\n— Pulled from Dead Poets Club Poem Jar`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (poem: Poem) => {
    soundEngine.playClick();
    const updated = Array.from(new Set([...savedPoemIds, poem.id]));
    setSavedPoemIds(updated);
    localStorage.setItem('dpc_saved_poems', JSON.stringify(updated));
    setSaved(true);
  };

  const savedPoemsList = POEM_CORPUS.filter(p => savedPoemIds.includes(p.id));

  return (
    <div className={`parchment-card p-5 sm:p-6 rounded-2xl bg-[#1A1614] border border-[#d3a66d]/30 relative overflow-hidden ${className}`}>
      {/* Decorative curio plaque */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#d3a66d]/15">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-[#d3a66d]" />
          <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#f0eae1]">
            The Parlor Poem Jar
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsVaultOpen(true);
          }}
          className="text-xs font-mono text-[#d3a66d] hover:text-[#e8c18e] transition-colors flex items-center gap-1 cursor-pointer"
          title="Open your saved poems collection"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Vault ({savedPoemIds.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Curio Object Left: Miniature Mechanical Dispensary */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative flex flex-col items-center select-none">
            {/* Brass Dome Cap */}
            <div className="w-28 h-4 rounded-t-full bg-gradient-to-b from-[#8C7053] to-[#4A3B2C] border-2 border-[#1A1614] shadow-sm flex items-center justify-center">
              <div className="w-6 h-1 rounded-full bg-[#EAD4BA]/40" />
            </div>

            {/* Glass Globe with Colored Capsules */}
            <div className="w-32 h-36 rounded-xl border-2 border-[#1A1614] bg-gradient-to-b from-[#b8d2de]/40 via-[#9ebbc9]/25 to-[#7c9aa9]/40 relative shadow-inner overflow-hidden p-2 flex flex-col items-center justify-center">
              {/* Parchment POEMS Label (No fake price!) */}
              <div className="absolute z-20 -rotate-3 bg-[#FCF8F2] border border-[#2E2118] px-2.5 py-0.5 shadow-sm">
                <span className="font-mono text-[10px] font-bold text-[#2E2118] tracking-wider uppercase">
                  POEMS
                </span>
              </div>

              {/* Capsules Inside Globe */}
              <div className="grid grid-cols-3 gap-1.5 pt-4 opacity-90">
                {POEM_CORPUS.slice(0, 9).map((poem, i) => (
                  <motion.div
                    key={poem.id}
                    animate={
                      isDispensing
                        ? {
                            y: [0, -10, 5, -2, 0],
                            rotate: [0, i % 2 === 0 ? 25 : -25, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.7, delay: i * 0.04 }}
                    className="w-6 h-6 rounded-full border border-[#2E2118] shadow-xs flex flex-col overflow-hidden"
                    style={{ backgroundColor: poem.capsuleColor }}
                  >
                    <div className="w-full h-1/2 bg-white/40 border-b border-black/20" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Wooden Base with Brass Crank & Chute */}
            <div className="w-36 bg-[#5A382A] border-2 border-t-0 border-[#1A1614] rounded-b-xl p-2.5 flex flex-col items-center relative shadow-md">
              {/* Interactive Crank */}
              <div className="flex items-center justify-center mb-1.5">
                <motion.button
                  type="button"
                  onClick={pullPoem}
                  disabled={isDispensing}
                  animate={isDispensing ? { rotate: 720 } : {}}
                  transition={{ duration: 0.95, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EAD4BA] via-[#8C7053] to-[#4A3B2C] border-2 border-[#1A1614] shadow-sm flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-95"
                  title="Turn crank to dispense verse"
                >
                  <div className="w-6 h-2 bg-[#2E2118] rounded-xs relative">
                    <div className="w-2.5 h-3 bg-[#EAD4BA] border border-[#2E2118] rounded-xs absolute -right-1 -top-0.5" />
                  </div>
                </motion.button>
              </div>

              {/* Chute */}
              <div className="w-14 h-5 bg-[#1A120D] border border-[#1A1614] rounded-t flex items-center justify-center">
                {isDispensing ? (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-4 h-4 rounded-full border border-black"
                    style={{ backgroundColor: activeCapsuleColor }}
                  />
                ) : (
                  <span className="text-[8px] font-mono tracking-widest text-[#A08670]">
                    PULL
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={pullPoem}
            disabled={isDispensing}
            className="btn-secondary text-xs py-1.5 px-3 mt-3 w-full max-w-[144px] justify-center"
          >
            {isDispensing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-[#d3a66d]" />
                <span>Cranking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#d3a66d]" />
                <span>Turn Crank</span>
              </>
            )}
          </button>
        </div>

        {/* Revealed Poem Slip / Invitation Right */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {selectedPoem ? (
              <motion.div
                key={selectedPoem.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 sm:p-5 rounded-xl bg-[#221B17] border border-[#d3a66d]/40 shadow-inner space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#d3a66d]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: selectedPoem.capsuleColor }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#d3a66d]">
                      {selectedPoem.period}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1A1614] border border-[#d3a66d]/30 text-[#e8c18e]">
                    {selectedPoem.theme}
                  </span>
                </div>

                <div>
                  <h4 className="font-editorial text-lg sm:text-xl font-normal text-[#f0eae1] leading-tight">
                    {selectedPoem.title}
                  </h4>
                  <p className="font-sans text-xs text-[#d3a66d] mt-0.5 font-medium">
                    — {selectedPoem.poet}
                  </p>
                </div>

                {/* Excerpt lines */}
                <div className="p-3 rounded bg-[#161210] border-l-2 border-[#d3a66d] font-editorial text-base italic text-[#c7beaf] leading-relaxed max-h-36 overflow-y-auto space-y-0.5">
                  {selectedPoem.lines.slice(0, 5).map((line, idx) => (
                    <p key={idx} className={line === '' ? 'h-2' : ''}>
                      {line}
                    </p>
                  ))}
                  {selectedPoem.lines.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="font-sans text-[11px] text-[#e8c18e] hover:underline pt-1 block not-italic cursor-pointer"
                    >
                      ... read full poem ({selectedPoem.lines.length} lines)
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#d3a66d]/15">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSave(selectedPoem)}
                      className={`text-[11px] font-sans px-2.5 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                        saved || savedPoemIds.includes(selectedPoem.id)
                          ? 'bg-[#75816a]/30 border-[#75816a] text-[#d1e0d4]'
                          : 'bg-[#1A1614] border-[#3e342b] text-[#e8c18e] hover:border-[#d3a66d]'
                      }`}
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>{saved || savedPoemIds.includes(selectedPoem.id) ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(selectedPoem)}
                      className="text-[11px] font-sans px-2.5 py-1 rounded border border-[#3e342b] bg-[#1A1614] text-[#a39b8f] hover:text-[#f0eae1] flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-[11px] font-sans px-2.5 py-1 rounded border border-[#3e342b] bg-[#1A1614] text-[#a39b8f] hover:text-[#f0eae1] flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Full Text</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={pullPoem}
                    className="text-[11px] font-sans text-[#d3a66d] hover:text-[#e8c18e] flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Another</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="p-5 rounded-xl bg-[#201A16] border border-dashed border-[#3e342b] text-center flex flex-col items-center justify-center space-y-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2A221C] border border-[#d3a66d]/40 flex items-center justify-center">
                  <Feather className="w-4 h-4 text-[#d3a66d]" />
                </div>
                <h4 className="font-editorial text-lg text-[#f0eae1]">
                  A Curious Parlor Dispensary
                </h4>
                <p className="font-sans text-xs text-[#a39b8f] max-w-xs leading-relaxed">
                  Turn the brass crank to dispense an archival verse onto your desk. Side effects may include staring out the window.
                </p>
                <button
                  type="button"
                  onClick={pullPoem}
                  className="btn-primary text-xs py-1.5 px-3.5 inline-flex"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pull Today&apos;s Poem</span>
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Poem Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && selectedPoem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg parchment-card p-6 rounded-2xl bg-[#1A1614] border-2 border-[#d3a66d]/50 max-h-[85vh] flex flex-col justify-between shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#d3a66d]/20 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: selectedPoem.capsuleColor }}
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#d3a66d]">
                    {selectedPoem.period} · {selectedPoem.theme}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-[#a39b8f] hover:text-[#f0eae1] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 space-y-4">
                <div>
                  <h3 className="font-editorial text-2xl font-normal text-[#f0eae1]">
                    {selectedPoem.title}
                  </h3>
                  <p className="font-sans text-sm text-[#d3a66d] mt-1">
                    — {selectedPoem.poet}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#14100E] border border-[#3e342b] font-editorial text-lg text-[#f0eae1] leading-relaxed space-y-1">
                  {selectedPoem.lines.map((line, idx) => (
                    <p key={idx} className={line === '' ? 'h-3' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#d3a66d]/20 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave(selectedPoem)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{saved || savedPoemIds.includes(selectedPoem.id) ? 'Saved' : 'Save to Card'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedPoem)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Poems Vault Drawer / Overlay */}
      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full max-w-xl parchment-card p-6 rounded-2xl bg-[#1A1614] border-2 border-[#d3a66d]/50 max-h-[85vh] flex flex-col justify-between shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#d3a66d]/20 mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#d3a66d]" />
                  <h3 className="font-editorial text-2xl font-normal text-[#f0eae1]">
                    Saved Poems Vault
                  </h3>
                  <span className="font-mono text-xs text-[#a39b8f]">
                    ({savedPoemsList.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVaultOpen(false)}
                  className="p-1 rounded text-[#a39b8f] hover:text-[#f0eae1] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 space-y-3 max-h-[58vh]">
                {savedPoemsList.length > 0 ? (
                  savedPoemsList.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPoem(p);
                        setIsModalOpen(true);
                      }}
                      className="p-3.5 rounded-lg bg-[#221C18] border border-[#3e342b] hover:border-[#d3a66d]/60 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#d3a66d] block mb-0.5">
                          {p.period} · {p.theme}
                        </span>
                        <h4 className="font-editorial text-base text-[#f0eae1] group-hover:text-[#e8c18e]">
                          {p.title}
                        </h4>
                        <p className="font-sans text-xs text-[#a39b8f]">
                          by {p.poet}
                        </p>
                      </div>

                      <span className="font-sans text-xs text-[#d3a66d] group-hover:underline flex-shrink-0 pt-2">
                        Read →
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#a39b8f]">
                    <ScrollText className="w-8 h-8 text-[#d3a66d]/50 mx-auto mb-2" />
                    <p className="font-editorial text-lg text-[#f0eae1]">No poems preserved yet.</p>
                    <p className="font-sans text-xs text-[#a39b8f] mt-1">
                      Turn the parlor crank to draw your first verse and save it to your vault.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#d3a66d]/20 mt-4 flex items-center justify-between">
                <span className="font-sans text-xs text-[#a39b8f]">
                  Syncs with your Library Passport &amp; Profile
                </span>
                <button
                  type="button"
                  onClick={() => setIsVaultOpen(false)}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

