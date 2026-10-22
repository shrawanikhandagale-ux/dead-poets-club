import React, { useState } from 'react';
import { POEM_CORPUS, Poem } from '../data/poems';
import confetti from 'canvas-confetti';
import { Sparkles, Bookmark, Copy, Check, RefreshCw, Feather, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PoemJarPage: React.FC = () => {
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [activeCapsuleColor, setActiveCapsuleColor] = useState<string>('#755151');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPoemIds, setSavedPoemIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dpc_saved_poems') || '[]');
    } catch {
      return [];
    }
  });

  const pullPoem = () => {
    if (isDispensing) return;
    setIsDispensing(true);
    setSelectedPoem(null);
    setCopied(false);
    setSaved(false);

    // Pick a random poem
    const randomPoem = POEM_CORPUS[Math.floor(Math.random() * POEM_CORPUS.length)];
    setActiveCapsuleColor(randomPoem.capsuleColor);

    // Mechanical dispensary delay
    setTimeout(() => {
      setIsDispensing(false);
      setSelectedPoem(randomPoem);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#755151', '#DBC4A5', '#72583E', '#443223', '#7C7960'],
      });
    }, 1200);
  };

  const handleCopy = (poem: Poem) => {
    const text = `${poem.title}\nby ${poem.poet} (${poem.period})\n\n${poem.lines.join('\n')}\n\n— Pulled from Dead Poets Club Poem Jar`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (poem: Poem) => {
    const updated = Array.from(new Set([...savedPoemIds, poem.id]));
    setSavedPoemIds(updated);
    localStorage.setItem('dpc_saved_poems', JSON.stringify(updated));
    setSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Header Stamp */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 starburst-badge mb-4">
          <Feather className="w-3.5 h-3.5 text-[#FFF9F3]" />
          <span>VINTAGE DISPENSARY · PUBLIC DOMAIN CORPUS</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#443223] tracking-tight mb-3">
          The Gumball Poem Jar
        </h1>
        <p className="font-typewriter text-sm sm:text-base text-[#72583E] leading-relaxed">
          Drop a coin, crank the lever, and pull an eternal verse from Keats, Shelley, Shakespeare, or Dickinson.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Mechanical Gumball Machine */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm catalog-card p-6 flex flex-col items-center relative overflow-hidden bg-[#FFFDF9]">
            {/* Metallic Dome Top */}
            <div className="w-48 h-8 rounded-t-full bg-gradient-to-b from-[#b0a89d] via-[#857b6f] to-[#595247] border-2 border-[#443223] shadow-md flex items-center justify-center">
              <div className="w-12 h-2 rounded-full bg-[#3d372e]/50" />
            </div>

            {/* Clear Globe with Colorful Capsules */}
            <div className="w-56 h-64 rounded-2xl border-4 border-[#443223] bg-gradient-to-b from-[#e8f1f5]/60 via-[#d3e3eb]/40 to-[#c2d7e2]/60 relative shadow-inner overflow-hidden flex items-center justify-center p-3">
              {/* Taped "POEMS" Paper Sign — Inspired by reference wireframe */}
              <div className="absolute z-20 -rotate-6 bg-[#FCF8F2] border-2 border-[#443223] px-4 py-1.5 shadow-[2px_2px_0px_#443223]">
                <span className="font-typewriter font-bold tracking-[0.25em] text-lg text-[#443223]">
                  POEMS 50¢
                </span>
                <div className="absolute -top-2 left-3 w-6 h-3 bg-[#e6d8c3]/80 -rotate-3 border-b border-[#a08670]" />
              </div>

              {/* Capsules Inside Globe */}
              <div className="grid grid-cols-4 gap-2.5 pt-8 opacity-90">
                {POEM_CORPUS.map((poem, i) => (
                  <motion.div
                    key={poem.id}
                    animate={
                      isDispensing
                        ? {
                            y: [0, -15, 8, -5, 0],
                            rotate: [0, (i % 2 === 0 ? 30 : -30), 0],
                            scale: [1, 1.1, 0.95, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="w-10 h-10 rounded-full border-2 border-[#443223] shadow-sm flex flex-col overflow-hidden"
                    style={{ backgroundColor: poem.capsuleColor }}
                  >
                    <div className="w-full h-1/2 bg-white/40 border-b border-[#443223]/30" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Red Vintage Mechanical Base */}
            <div className="w-60 bg-[#755151] border-4 border-t-0 border-[#443223] rounded-b-3xl p-5 shadow-[4px_4px_0px_#443223] flex flex-col items-center relative">
              {/* Turn Crank */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9b7a4] to-[#72583E] border-3 border-[#443223] shadow-inner flex items-center justify-center mb-4">
                <motion.div
                  animate={isDispensing ? { rotate: 720 } : {}}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                  className="w-12 h-3 bg-[#443223] rounded-sm relative cursor-pointer"
                  onClick={pullPoem}
                >
                  <div className="w-4 h-6 bg-[#DBC4A5] border border-[#443223] rounded-sm absolute -right-1 -top-1.5 shadow-sm" />
                </motion.div>
              </div>

              {/* Dispensary Chute */}
              <div className="w-24 h-12 bg-[#2E2116] border-2 border-[#443223] rounded-t-lg flex items-center justify-center relative overflow-hidden shadow-inner">
                {isDispensing ? (
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-8 h-8 rounded-full border border-black shadow"
                    style={{ backgroundColor: activeCapsuleColor }}
                  />
                ) : (
                  <span className="text-[10px] font-mono tracking-widest text-[#A08670] uppercase">
                    PULL
                  </span>
                )}
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="mt-6 w-full">
              <button
                onClick={pullPoem}
                disabled={isDispensing}
                className="btn-primary w-full justify-center text-sm py-3 uppercase tracking-wider"
              >
                {isDispensing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cranking the Jar...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Turn Crank & Pull Poem</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Unrolled Parchment Scroll Display */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedPoem ? (
              <motion.div
                key={selectedPoem.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="catalog-card p-6 sm:p-8 bg-[#FFFDF9] relative border-2 border-[#443223] shadow-[5px_5px_0px_#443223]"
              >
                {/* Top Catalog Metadata Ribbon */}
                <div className="flex flex-wrap items-center justify-between border-b-2 border-dashed border-[#A08670] pb-4 mb-6 gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-[#443223]"
                      style={{ backgroundColor: selectedPoem.capsuleColor }}
                    />
                    <span className="font-typewriter text-xs uppercase tracking-wider text-[#72583E]">
                      {selectedPoem.period}
                    </span>
                  </div>

                  <span className="font-typewriter text-xs font-bold px-2 py-0.5 bg-[#DBC4A5]/40 border border-[#72583E] text-[#443223]">
                    {selectedPoem.theme}
                  </span>
                </div>

                {/* Poem Title & Poet */}
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#443223] mb-1">
                  {selectedPoem.title}
                </h2>
                <p className="font-typewriter text-sm text-[#755151] font-semibold mb-6">
                  — {selectedPoem.poet}
                </p>

                {/* Stanzas in Typewriter Font */}
                <div className="bg-[#FFF9F3] p-5 sm:p-6 rounded border border-[#A08670] font-typewriter text-sm sm:text-base text-[#443223] leading-relaxed space-y-1 mb-8 shadow-inner select-text">
                  {selectedPoem.lines.map((line, idx) => (
                    <p key={idx} className={line === '' ? 'h-4' : ''}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* Actions: Save to Card & Copy */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#443223]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSave(selectedPoem)}
                      className={`btn-secondary text-xs py-2 px-3.5 ${
                        saved || savedPoemIds.includes(selectedPoem.id)
                          ? 'bg-[#7C7960] text-white border-[#443223]'
                          : ''
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>
                        {saved || savedPoemIds.includes(selectedPoem.id)
                          ? 'Saved to Library Card'
                          : 'Save to Library Card'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopy(selectedPoem)}
                      className="btn-secondary text-xs py-2 px-3.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Stanzas'}</span>
                    </button>
                  </div>

                  <button
                    onClick={pullPoem}
                    className="text-xs font-typewriter text-[#72583E] hover:text-[#443223] flex items-center gap-1 font-semibold underline underline-offset-4"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Pull Another Capsule</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="catalog-card p-10 bg-[#FFFDF9] border-2 border-dashed border-[#A08670] text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-[#DBC4A5]/40 border-2 border-[#443223] flex items-center justify-center mb-4">
                  <ScrollText className="w-8 h-8 text-[#72583E]" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#443223] mb-2">
                  The Scroll Awaits
                </h3>
                <p className="font-typewriter text-sm text-[#72583E] max-w-sm mb-6">
                  Turn the crank on the left to release a capsule from the Dead Poets vault into the reading room.
                </p>
                <button onClick={pullPoem} className="btn-primary text-xs py-2.5 px-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pull Your First Poem</span>
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
