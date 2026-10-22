import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Grid3X3, Trophy, Sparkles, HelpCircle, RotateCcw, CheckCircle2, Flame, Feather } from 'lucide-react';

interface CrosswordCell {
  row: number;
  col: number;
  char: string; // The correct letter
  number?: number;
  isBlocked: boolean;
}

// 10x10 Curated Literary Puzzle
// Theme: Romanticism, Classics & Literary Figures
const GRID_SIZE = 10;

// Correct letters map: row-col -> letter
const SOLUTION_GRID: Record<string, string> = {
  // Row 0
  '0-1': 'R', '0-2': 'O', '0-3': 'M', '0-4': 'E', '0-5': 'O',
  // Row 1
  '1-1': 'A',
  // Row 2
  '2-0': 'D', '2-1': 'A', '2-2': 'F', '2-3': 'F', '2-4': 'O', '2-5': 'D', '2-6': 'I', '2-7': 'L',
  // Row 3
  '3-0': 'A', '3-1': 'N',
  // Row 4
  '4-0': 'F', '4-1': 'D', '4-2': 'I', '4-3': 'S', '4-4': 'G', '4-5': 'U', '4-6': 'I', '4-7': 'S', '4-8': 'E', '4-9': 'D',
  // Row 5
  '5-0': 'F', '5-1': 'A', '5-4': 'H', '5-7': 'P',
  // Row 6
  '6-0': 'O', '6-1': 'L', '6-4': 'O', '6-5': 'N', '6-6': 'Y', '6-7': 'X',
  // Row 7
  '7-0': 'D', '7-2': 'S', '7-3': 'T', '7-4': 'A', '7-5': 'R', '7-7': 'R',
  // Row 8
  '8-0': 'I', '8-4': 'T', '8-7': 'A',
  // Row 9
  '9-0': 'L', '9-1': 'L', '9-2': 'O', '9-3': 'V', '9-4': 'E', '9-5': 'R', '9-6': 'S', '9-7': 'Y',
};

const CELL_NUMBERS: Record<string, number> = {
  '0-1': 1,
  '2-0': 2,
  '2-3': 3,
  '4-1': 4,
  '4-4': 5,
  '6-5': 6,
  '7-2': 7,
  '9-1': 8,
};

const CLUES = {
  across: [
    { num: 1, clue: 'Tragic Montague whose name echoes through Verona', word: 'ROMEO' },
    { num: 2, clue: 'Wordsworth’s dancing host beside the lake', word: 'DAFFODIL' },
    { num: 4, clue: 'How Shakespeare’s heroines often travel into the Forest of Arden', word: 'DISGUISED' },
    { num: 6, clue: 'Greek primordial goddess of the Night', word: 'NYX' },
    { num: 7, clue: '“It is the East, and Juliet is the sun”—celestial motif', word: 'STAR' },
    { num: 8, clue: 'Dead Poets and secret midnight meetings', word: 'LOVERS' },
  ],
  down: [
    { num: 1, clue: 'Where all literary roads eventually lead', word: 'ROAD' },
    { num: 2, clue: 'Narcissus’ doomed fixation on his own image', word: 'DEATH' },
    { num: 4, clue: 'Dante’s guide through the nine circles of Hell', word: 'DIS' },
    { num: 5, clue: 'Ghostly apparition haunting Hamlet’s battlement', word: 'GHOST' },
    { num: 7, clue: 'Device revealing what lies beneath the mortal ribs', word: 'XRAY' },
  ],
};

export const CrosswordPage: React.FC = () => {
  const [gridInput, setGridInput] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('dpc_crossword_progress') || '{}');
    } catch {
      return {};
    }
  });

  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({ row: 0, col: 1 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('dpc_crossword_streak') || '4', 10);
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [revealedCount, setRevealedCount] = useState<number>(0);

  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Check completion
  useEffect(() => {
    const keys = Object.keys(SOLUTION_GRID);
    const completed = keys.length > 0 && keys.every(key => gridInput[key]?.toUpperCase() === SOLUTION_GRID[key]);
    if (completed && !isCompleted) {
      setIsCompleted(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('dpc_crossword_streak', newStreak.toString());
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fca5a5', '#755151', '#443223', '#DBC4A5'],
      });
    }
  }, [gridInput, isCompleted, streak]);

  // Handle cell typing
  const handleInputChange = (r: number, c: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(char) && char !== '') return;

    const newInputs = { ...gridInput, [`${r}-${c}`]: char };
    setGridInput(newInputs);
    localStorage.setItem('dpc_crossword_progress', JSON.stringify(newInputs));

    // Auto-advance cursor
    if (char !== '') {
      if (direction === 'across') {
        advanceCursor(r, c + 1);
      } else {
        advanceCursor(r + 1, c);
      }
    }
  };

  const advanceCursor = (r: number, c: number) => {
    let nextR = r;
    let nextC = c;

    while (nextR < GRID_SIZE && nextC < GRID_SIZE && nextR >= 0 && nextC >= 0) {
      if (SOLUTION_GRID[`${nextR}-${nextC}`]) {
        setActiveCell({ row: nextR, col: nextC });
        cellRefs.current[`${nextR}-${nextC}`]?.focus();
        return;
      }
      if (direction === 'across') {
        nextC++;
        if (nextC >= GRID_SIZE) {
          nextC = 0;
          nextR++;
        }
      } else {
        nextR++;
        if (nextR >= GRID_SIZE) {
          nextR = 0;
          nextC++;
        }
      }
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (gridInput[`${r}-${c}`]) {
        const newInputs = { ...gridInput, [`${r}-${c}`]: '' };
        setGridInput(newInputs);
        localStorage.setItem('dpc_crossword_progress', JSON.stringify(newInputs));
      } else {
        // Move back
        if (direction === 'across' && c > 0) advanceCursor(r, c - 1);
        if (direction === 'down' && r > 0) advanceCursor(r - 1, c);
      }
    } else if (e.key === 'ArrowRight') {
      advanceCursor(r, c + 1);
    } else if (e.key === 'ArrowLeft') {
      advanceCursor(r, c - 1);
    } else if (e.key === 'ArrowDown') {
      advanceCursor(r + 1, c);
    } else if (e.key === 'ArrowUp') {
      advanceCursor(r - 1, c);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setDirection(direction === 'across' ? 'down' : 'across');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (activeCell.row === r && activeCell.col === c) {
      setDirection(direction === 'across' ? 'down' : 'across');
    } else {
      setActiveCell({ row: r, col: c });
    }
  };

  const revealHint = () => {
    const key = `${activeCell.row}-${activeCell.col}`;
    if (SOLUTION_GRID[key]) {
      const correctChar = SOLUTION_GRID[key];
      const newInputs = { ...gridInput, [key]: correctChar };
      setGridInput(newInputs);
      localStorage.setItem('dpc_crossword_progress', JSON.stringify(newInputs));
      setRevealedCount(prev => prev + 1);
    }
  };

  const resetPuzzle = () => {
    if (window.confirm('Reset crossword puzzle?')) {
      setGridInput({});
      localStorage.removeItem('dpc_crossword_progress');
      setIsCompleted(false);
      setActiveCell({ row: 0, col: 1 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {/* Editorial Header */}
      <div className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b-2 border-[#443223] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>DAILY LITERARY EDITION NO. 142</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            The Sunday Book Crossword
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E]">
            A daily literary puzzle over archival photography. Solved words unlock member stamps.
          </p>
        </div>

        {/* Streak and Completion Banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#DBC4A5] border-2 border-[#443223] shadow-[2px_2px_0px_#443223] rounded">
            <Flame className="w-4 h-4 text-[#755151]" />
            <span className="font-typewriter text-xs font-bold text-[#443223]">
              STREAK: {streak} DAYS
            </span>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border-2 border-green-800 text-green-900 text-xs font-typewriter font-bold rounded shadow-[2px_2px_0px_#14532d]">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>COMPLETED!</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The 10x10 Crossword Grid over Photo Layout */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="catalog-card p-4 sm:p-6 bg-[#FCF8F2] w-full max-w-lg border-2 border-[#443223] shadow-[5px_5px_0px_#443223] relative">
            {/* Archival Monochromatic Portrait Background — matching reference wireframe */}
            <div
              className="relative p-2 rounded border border-[#A08670] overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255, 249, 243, 0.45), rgba(255, 249, 243, 0.45)), url("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80")',
              }}
            >
              {/* Grid 10x10 */}
              <div
                className="grid gap-[2px] bg-[#443223] p-[2px] rounded"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: GRID_SIZE }).map((_, r) =>
                  Array.from({ length: GRID_SIZE }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const isPlayable = !!SOLUTION_GRID[key];
                    const num = CELL_NUMBERS[key];
                    const isActive = activeCell.row === r && activeCell.col === c;
                    const isWordMatch =
                      direction === 'across'
                        ? activeCell.row === r && !!SOLUTION_GRID[key]
                        : activeCell.col === c && !!SOLUTION_GRID[key];

                    if (!isPlayable) {
                      return (
                        <div
                          key={key}
                          className="aspect-square bg-black/40 backdrop-blur-[1px]"
                        />
                      );
                    }

                    return (
                      <div
                        key={key}
                        onClick={() => handleCellClick(r, c)}
                        className={`aspect-square relative cursor-pointer border border-[#443223]/30 transition-colors ${
                          isActive
                            ? 'bg-[#f472b6] shadow-inner' // Vibrant pink active cell
                            : isWordMatch
                            ? 'bg-[#fbcfe8]/85' // Light pink word highlight
                            : 'bg-white/85 hover:bg-white'
                        }`}
                      >
                        {num && (
                          <span className="absolute top-0.5 left-0.5 text-[9px] font-mono font-bold leading-none text-[#443223]">
                            {num}
                          </span>
                        )}

                        <input
                          ref={el => (cellRefs.current[key] = el)}
                          type="text"
                          maxLength={1}
                          value={gridInput[key] || ''}
                          onChange={e => handleInputChange(r, c, e.target.value)}
                          onKeyDown={e => handleKeyDown(r, c, e)}
                          className="w-full h-full text-center font-typewriter text-base sm:text-lg font-bold text-[#443223] bg-transparent outline-none uppercase pt-2 select-all"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center justify-between mt-4 text-xs font-typewriter text-[#72583E]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#443223]">DIRECTION:</span>
                <button
                  onClick={() => setDirection(direction === 'across' ? 'down' : 'across')}
                  className="px-2 py-0.5 bg-[#DBC4A5] border border-[#443223] rounded uppercase font-bold"
                >
                  {direction} (Click / Space to switch)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={revealHint}
                  className="flex items-center gap-1 hover:text-[#443223]"
                  title="Reveal letter"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Hint
                </button>
                <button
                  onClick={resetPuzzle}
                  className="flex items-center gap-1 hover:text-[#443223]"
                  title="Reset puzzle"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Across and Down Clues */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Across Clues */}
          <div className="catalog-card p-5 bg-[#FFFDF9] border-2 border-[#443223]">
            <div className="flex items-center gap-2 border-b-2 border-dashed border-[#A08670] pb-2 mb-3">
              <span className="font-editorial text-lg font-bold text-[#443223]">ACROSS</span>
              <span className="text-xs font-typewriter text-[#755151]">({CLUES.across.length} Clues)</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {CLUES.across.map(clue => (
                <div
                  key={clue.num}
                  className="text-xs font-typewriter text-[#443223] flex items-start gap-2 hover:bg-[#DBC4A5]/20 p-1 rounded cursor-pointer"
                >
                  <span className="font-bold text-[#755151] w-4 flex-shrink-0">{clue.num}</span>
                  <span className="leading-snug">{clue.clue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Down Clues */}
          <div className="catalog-card p-5 bg-[#FFFDF9] border-2 border-[#443223]">
            <div className="flex items-center gap-2 border-b-2 border-dashed border-[#A08670] pb-2 mb-3">
              <span className="font-editorial text-lg font-bold text-[#443223]">DOWN</span>
              <span className="text-xs font-typewriter text-[#755151]">({CLUES.down.length} Clues)</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {CLUES.down.map(clue => (
                <div
                  key={clue.num}
                  className="text-xs font-typewriter text-[#443223] flex items-start gap-2 hover:bg-[#DBC4A5]/20 p-1 rounded cursor-pointer"
                >
                  <span className="font-bold text-[#755151] w-4 flex-shrink-0">{clue.num}</span>
                  <span className="leading-snug">{clue.clue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crossword Notes */}
          <div className="p-4 bg-[#DBC4A5]/30 border-2 border-[#A08670] rounded text-xs font-typewriter text-[#58432D]">
            <p className="font-bold mb-1">PRO-TIP FOR POETS:</p>
            <p>
              Navigate using Arrow keys or click any letter. Pressing <kbd className="px-1 bg-white border border-[#443223] rounded">Space</kbd> toggles between Across and Down mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
