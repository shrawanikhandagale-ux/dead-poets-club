import React, { useEffect, useState } from 'react';
import {
  CafeRoomDefinition,
  DeskTrinketId,
  RoomSeat,
  RoomWhisper,
} from './cafeTypes';
import { DESK_TRINKETS } from './cafeRooms';
import { FirstPersonRoomBackdrop } from './CafeSceneryPixel';
import { Book } from '../../types/book';
import { UserAnnotation } from '../../types/book';
import { SEED_BOOKS } from '../../data/seedBooks';
import { useAuth } from '../../context/AuthContext';
import { soundEngine, SoundState } from '../../lib/audioEngine';
import { BookCoverImage } from '../books/BookCoverImage';
import { BookDetailModal } from '../books/BookDetailModal';
import {
  BookOpen,
  Clock,
  Coffee,
  Feather,
  Flame,
  Footprints,
  LampDesk,
  MessageSquare,
  Music,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DeskPanel = 'none' | 'book_notes' | 'timer' | 'sound' | 'trinkets';

interface CafeFirstPersonDeskProps {
  room: CafeRoomDefinition;
  seat: RoomSeat;
  soundState: SoundState;
  timerSeconds: number;
  timerRunning: boolean;
  activeWhisper?: RoomWhisper | null;
  onOpenWhispers?: () => void;
  onStartTimer: (minutes: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  selectedTrinket: DeskTrinketId;
  onSelectTrinket: (id: DeskTrinketId) => void;
  onStandUp: () => void;
}

const SOUND_TRACKS: { key: string; label: string }[] = [
  { key: 'rain', label: 'Rain' },
  { key: 'fireplace', label: 'Fireplace' },
  { key: 'murmur', label: 'Murmur' },
  { key: 'typing', label: 'Typing' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'piano', label: 'Piano' },
  { key: 'street', label: 'Wind' },
  { key: 'roomtone', label: 'Room Tone' },
];

export const CafeFirstPersonDesk: React.FC<CafeFirstPersonDeskProps> = ({
  room,
  seat,
  soundState,
  timerSeconds,
  timerRunning,
  activeWhisper = null,
  onOpenWhispers,
  onStartTimer,
  onToggleTimer,
  onResetTimer,
  selectedTrinket,
  onSelectTrinket,
  onStandUp,
}) => {
  const { shelves } = useAuth();
  const [lampLit, setLampLit] = useState(true);
  const [activePanel, setActivePanel] = useState<DeskPanel>('none');
  const [deskWhisper, setDeskWhisper] = useState<string>(seat.whisper);
  const [steamBurst, setSteamBurst] = useState(false);

  // Active book tied to user's real currently_reading shelf if available
  const currentlyReadingShelf = shelves.find(s => s.status === 'currently_reading');
  const defaultBook =
    (currentlyReadingShelf && SEED_BOOKS.find(b => b.id === currentlyReadingShelf.book_id)) ||
    SEED_BOOKS[0];

  const [activeBookId, setActiveBookId] = useState<string>(defaultBook.id);
  const [modalBook, setModalBook] = useState<Book | null>(null);
  const activeBook = SEED_BOOKS.find(b => b.id === activeBookId) || defaultBook;

  // Persistent personal annotations (shared with ShelvesPage & BookDetailModal)
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<UserAnnotation[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dpc_user_annotations') || '[]');
    } catch {
      return [];
    }
  });
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // Escape key returns to exploration (when no modal/input focused)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modalBook) {
        setModalBook(null);
        return;
      }
      if (activePanel !== 'none') {
        setActivePanel('none');
        return;
      }
      soundEngine.playClick();
      onStandUp();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalBook, activePanel, onStandUp]);

  const togglePanel = (panel: DeskPanel) => {
    soundEngine.playClick();
    setActivePanel(prev => (prev === panel ? 'none' : panel));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    soundEngine.playPageTurn();
    const newNote: UserAnnotation = {
      id: `note-cafe-${Date.now()}`,
      book_id: activeBook.id,
      book_title: activeBook.title,
      note: noteInput.trim(),
      created_at: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem('dpc_user_annotations', JSON.stringify(updated));
    } catch {}
    setNoteInput('');
    setNoteSavedToast(true);
    setDeskWhisper('Note tucked safely into My Shelf.');
    setTimeout(() => setNoteSavedToast(false), 2200);
  };

  const toggleTrack = (track: string) => {
    soundEngine.playClick();
    if (soundState.activeTracks[track]) {
      soundEngine.stopTrack(track);
    } else {
      if (track === 'rain') soundEngine.startRain();
      else if (track === 'street') soundEngine.startStreet();
      else if (track === 'murmur') soundEngine.startCafeMurmur();
      else if (track === 'typing') soundEngine.startTyping();
      else if (track === 'roomtone') soundEngine.startRoomTone();
      else if (track === 'fireplace') soundEngine.startFireplace();
      else if (track === 'vinyl') soundEngine.startVinyl();
      else if (track === 'piano') soundEngine.startPiano();
    }
  };

  const formatClock = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentTrinket = DESK_TRINKETS.find(t => t.id === selectedTrinket) || DESK_TRINKETS[0];

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-xl border-3 border-[#2E2118] shadow-[6px_6px_0px_#1B1410] overflow-hidden bg-[#110D0A] select-none flex flex-col justify-between">
      {/* 1. FIRST-PERSON WINDOW & INTERIOR SCENE */}
      <div className="absolute inset-0">
        <FirstPersonRoomBackdrop
          room={room}
          lampLit={lampLit}
          demoPatrons={room.demoPatrons}
        />
      </div>

      {/* 2. TOP HUD OVERLAY */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-[#140F0C]/85 border border-[#DFC9AA]/40 backdrop-blur-sm text-xs font-sans text-[#FAF3E8]">
            <span className="text-[#E4A853] font-semibold">{seat.label}</span>
            <span className="hidden sm:inline text-[#DFC9AA]/80 font-mono text-[11px]"> · {room.name}</span>
          </div>

          {activeWhisper && activeWhisper.roomId === room.id && (
            <button
              type="button"
              onClick={onOpenWhispers}
              title="View or edit your active Room Whisper"
              className="px-2.5 py-1.5 rounded-md bg-[#FFFDF9]/95 border-2 border-[#6E3E44] text-[11px] font-sans font-medium text-[#2E2118] shadow-[2px_2px_0px_#1B1410] flex items-center gap-1.5 max-w-[230px] cursor-pointer hover:bg-[#FAF3E8]"
            >
              <MessageSquare className="w-3 h-3 text-[#6E3E44] flex-shrink-0" />
              <span className="truncate">{activeWhisper.text}</span>
            </button>
          )}

          {timerSeconds > 0 && (
            <button
              type="button"
              onClick={() => togglePanel('timer')}
              className="px-3 py-1.5 rounded-md bg-[#6E3E44]/90 border border-[#E4A853]/70 text-xs font-mono font-semibold text-[#FAF3E8] flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#E4A853]" />
              <span>{formatClock(timerSeconds)}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              if (!soundState.isPlaying) soundEngine.playRoomPreset(room.soundPreset);
              else soundEngine.toggleMute();
            }}
            className="p-2 rounded-md bg-[#140F0C]/85 border border-[#DFC9AA]/40 text-[#FAF3E8] hover:border-[#E4A853] cursor-pointer"
            title={soundState.isMuted ? 'Unmute ambience' : 'Mute / Toggle ambience'}
          >
            {soundState.isPlaying && !soundState.isMuted ? (
              <Volume2 className="w-4 h-4 text-[#E4A853]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#9E856E]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onStandUp();
            }}
            className="px-3.5 py-1.5 rounded-md bg-[#140F0C]/90 hover:bg-[#2A1D16] border border-[#E4A853]/70 text-xs font-sans font-semibold text-[#FAF3E8] flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Footprints className="w-3.5 h-3.5 text-[#E4A853]" />
            <span>Stand Up</span>
          </button>
        </div>
      </div>

      {/* Desk whisper caption */}
      <div className="relative z-20 mx-auto mt-auto mb-3 px-3.5 py-1 rounded-full bg-[#140F0C]/75 border border-[#DFC9AA]/30 backdrop-blur-sm">
        <p className="font-handwritten text-lg text-[#FAF3E8]">
          {deskWhisper}
        </p>
      </div>

      {/* 3. COLLAPSIBLE STUDY DRAWER (Only shown when a desk tool is opened) */}
      <AnimatePresence>
        {activePanel !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2 }}
            className={`relative z-30 mx-3 sm:mx-6 mb-2 p-4 sm:p-5 rounded-lg border-2 shadow-[5px_5px_0px_#140F0C] max-h-[340px] overflow-y-auto ${
              activePanel === 'sound'
                ? 'cafeteria-mixer-panel bg-[#1D1612] text-[#FAF3E8] border-[#7C5C40]'
                : 'bg-[#FCF7EE]/98 text-[#2E2118] border-[#2E2118]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2.5 mb-3 ${
              activePanel === 'sound' ? 'border-[#4A382A]' : 'border-dashed border-[#B59C84]'
            }`}>
              <span className="font-editorial text-xl flex items-center gap-2">
                {activePanel === 'book_notes' && (
                  <>
                    <BookOpen className="w-4 h-4 text-[#6E3E44]" /> Desk Book & Marginalia
                  </>
                )}
                {activePanel === 'timer' && (
                  <>
                    <Clock className="w-4 h-4 text-[#6E3E44]" /> Study Focus Timer
                  </>
                )}
                {activePanel === 'sound' && (
                  <>
                    <Sliders className="w-4 h-4 text-[#E4A853]" /> Room Ambience Mixer
                  </>
                )}
                {activePanel === 'trinkets' && (
                  <>
                    <Sparkles className="w-4 h-4 text-[#6E3E44]" /> Desk Keepsakes
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setActivePanel('none')}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activePanel === 'sound'
                    ? 'hover:bg-[#2A1F18] text-[#DFC9AA] hover:text-[#FAF3E8]'
                    : 'hover:bg-[#EFE2CF] text-[#2E2118]'
                }`}
                aria-label="Close desk panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PANEL: BOOK & PERSISTENT NOTES */}
            {activePanel === 'book_notes' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 flex gap-3 items-start">
                  <div className="w-16 flex-shrink-0">
                    <BookCoverImage book={activeBook} className="w-full" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <select
                      value={activeBookId}
                      onChange={e => setActiveBookId(e.target.value)}
                      className="w-full text-xs font-sans font-semibold p-1.5 rounded border border-[#2E2118] bg-[#F7EFE3]"
                      aria-label="Select book on desk"
                    >
                      {SEED_BOOKS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                    <p className="font-mono text-[11px] text-[#684F38]">
                      by {activeBook.author}
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalBook(activeBook)}
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      Open Dossier
                    </button>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2">
                  <form onSubmit={handleSaveNote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Jot down a passing line or half-baked thought..."
                      className="w-full p-2 text-xs font-sans rounded border border-[#2E2118] bg-[#F7EFE3] focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#684F38]">
                        {noteSavedToast ? 'Saved to My Shelf.' : 'Synced to Private Annotations'}
                      </span>
                      <button type="submit" className="btn-primary text-xs py-1 px-3">
                        <Feather className="w-3 h-3" /> Save Note
                      </button>
                    </div>
                  </form>

                  {notes.slice(0, 2).map(n => (
                    <div
                      key={n.id}
                      className="p-2 rounded bg-[#EFE2CF]/60 border border-[#B59C84] text-xs font-sans"
                    >
                      <span className="font-semibold text-[#6E3E44]">{n.book_title}: </span>
                      <span>{n.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL: FOCUS TIMER */}
            {activePanel === 'timer' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="font-mono text-3xl font-semibold text-[#2E2118]">
                    {timerSeconds > 0 ? formatClock(timerSeconds) : '00:00'}
                  </div>
                  <p className="font-sans text-xs text-[#684F38]">
                    Timer keeps running even if you stand up to wander the room.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onStartTimer(25)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    25m Reading
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartTimer(50)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    50m Deep Study
                  </button>
                  {timerSeconds > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={onToggleTimer}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{timerRunning ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={onResetTimer}
                        className="p-1.5 rounded border border-[#2E2118] bg-[#EFE2CF] cursor-pointer"
                        title="Reset timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PANEL: SOUND MIXER (High-Contrast Dark Warm Ambience Surface) */}
            {activePanel === 'sound' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#3D2B1F]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        soundEngine.playRoomPreset(room.soundPreset);
                      }}
                      className="px-3 py-1.5 rounded bg-[#2D2018] hover:bg-[#3D2C22] text-[#FAF3E8] border border-[#E4A853]/60 text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Music className="w-3.5 h-3.5 text-[#E4A853]" />
                      <span>Restore {room.name} Preset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        soundEngine.toggleMute();
                      }}
                      className={`px-3 py-1.5 rounded border text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                        soundState.isMuted
                          ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#FAF3E8]'
                          : 'bg-[#241C17] text-[#DFC9AA] border-[#4A382A] hover:border-[#E4A853]'
                      }`}
                    >
                      {soundState.isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-300" />
                          <span>Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-green-400" />
                          <span>Unmuted</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Master Volume with High-Contrast Slider */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#18120F] border border-[#3D2B1F] text-xs font-sans">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFC9AA]">Master</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundState.masterVolume}
                      onChange={e => soundEngine.setMasterVolume(parseFloat(e.target.value))}
                      className="accent-[#E4A853] w-24 h-1.5 rounded-lg cursor-pointer"
                      aria-label="Master volume"
                    />
                    <span className="font-mono text-[11px] text-[#E4A853] w-8 text-right font-bold">
                      {Math.round(soundState.masterVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* 8 Track Sliders */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SOUND_TRACKS.map(t => {
                    const active = !!soundState.activeTracks[t.key];
                    const vol = soundState.volumes[t.key] ?? 0.4;
                    return (
                      <div
                        key={t.key}
                        className={`p-2.5 rounded border transition-all flex flex-col gap-2 ${
                          active
                            ? 'bg-[#251D18] border-[#E4A853] shadow-[0_0_8px_rgba(228,168,83,0.2)]'
                            : 'bg-[#18120F] border-[#3D2B1F]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-sans text-xs font-semibold ${active ? 'text-[#FAF3E8]' : 'text-[#DFC9AA]/75'}`}>
                            {t.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleTrack(t.key)}
                            aria-label={`Toggle ${t.label} track`}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                              active
                                ? 'bg-[#E4A853] text-[#140F0C] border border-[#FAF3E8]'
                                : 'bg-[#221A15] text-[#DFC9AA]/60 border border-[#3D2B1F] hover:border-[#E4A853]'
                            }`}
                          >
                            {active ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={vol}
                            onChange={e => soundEngine.setTrackVolume(t.key, parseFloat(e.target.value))}
                            className="w-full h-1.5 accent-[#E4A853] rounded-lg cursor-pointer"
                            aria-label={`${t.label} volume`}
                          />
                          <span className="font-mono text-[10px] text-[#DFC9AA] w-7 text-right">
                            {Math.round(vol * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PANEL: DESK KEEPSAKES / CUSTOMIZATION */}
            {activePanel === 'trinkets' && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {DESK_TRINKETS.map(tr => {
                  const chosen = tr.id === selectedTrinket;
                  return (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playChime(659.25);
                        onSelectTrinket(tr.id);
                        setDeskWhisper(tr.note);
                      }}
                      className={`p-2.5 rounded border-2 text-left cursor-pointer transition-all ${
                        chosen
                          ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118]'
                          : 'bg-[#F7EFE3] text-[#2E2118] border-[#B59C84] hover:border-[#2E2118]'
                      }`}
                    >
                      <span className="font-sans text-xs font-semibold block">{tr.label}</span>
                      <span className="font-sans text-[11px] opacity-80 block mt-0.5">{tr.note}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FOREGROUND FIRST-PERSON DESK SURFACE & INTERACTIVE TABLETOP OBJECTS */}
      <div
        className="relative z-20 px-3 sm:px-6 py-3 border-t-4 shadow-[inset_0_12px_24px_rgba(0,0,0,0.55)] transition-all select-none"
        style={{
          borderColor: room.palette.deskTrim,
          background: lampLit
            ? `radial-gradient(ellipse 420px 180px at 18% 100%, rgba(245, 186, 98, 0.28), transparent 75%), linear-gradient(to bottom, ${room.palette.deskSurface}, #18110D)`
            : `linear-gradient(to bottom, ${room.palette.deskSurface}, #140E0A)`,
        }}
      >
        {/* Tabletop Perspective Objects Row */}
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-2 sm:gap-4 pb-2">
          {/* Object 1: Green-Shaded Banker's Lamp */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setLampLit(prev => !prev);
              setDeskWhisper(!lampLit ? 'Green banker lamp lit. Good light for reading.' : 'Lamp turned down to room light.');
            }}
            title="Toggle Banker Lamp (Click to switch)"
            aria-label={lampLit ? 'Turn off Banker Lamp' : 'Turn on Banker Lamp'}
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            {/* Lamp Graphic */}
            <div className="relative w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center">
              {lampLit && (
                <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md animate-pulse pointer-events-none" />
              )}
              <svg viewBox="0 0 56 64" className="w-full h-full drop-shadow-md">
                {/* Heavy Brass Base */}
                <ellipse cx="28" cy="58" rx="16" ry="4" fill="#8A6635" stroke="#4A3416" strokeWidth="1.5" />
                <rect x="26" y="32" width="4" height="26" fill="#C4A482" />
                {/* Curved Brass Neck */}
                <path d="M28 32 C 28 20, 28 16, 28 14" stroke="#C4A482" strokeWidth="3" fill="none" />
                {/* Emerald Glass Shade */}
                <path
                  d="M12 20 Q 28 8 44 20 L 41 26 Q 28 17 15 26 Z"
                  fill={lampLit ? '#2E7D52' : '#173623'}
                  stroke={lampLit ? '#E4A853' : '#3E2A18'}
                  strokeWidth="1.5"
                />
                {/* Pull Chain */}
                <line x1="36" y1="24" x2="36" y2="42" stroke="#E4A853" strokeWidth="1" strokeDasharray="1,1" />
                <circle cx="36" cy="43" r="1.5" fill="#E4A853" />
                {/* Lamp Bulb Glow */}
                {lampLit && (
                  <ellipse cx="28" cy="22" rx="10" ry="2" fill="#FFF2B2" opacity="0.8" />
                )}
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853] mt-0.5">
              {lampLit ? 'Lamp: Lit' : 'Lamp: Dim'}
            </span>
          </button>

          {/* Object 2: Steaming Ceramic Teacup */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playChime(783.99);
              setSteamBurst(true);
              setDeskWhisper('Tea is still warm enough to pretend it is fresh.');
              setTimeout(() => setSteamBurst(false), 1600);
            }}
            title="Sip warm tea"
            aria-label="Sip warm tea"
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5 relative"
          >
            {/* Animated Steam */}
            <div className="h-4 flex items-end justify-center gap-1 overflow-hidden pointer-events-none">
              <motion.span
                animate={steamBurst ? { y: [-2, -14], opacity: [0.8, 0] } : { y: [0, -8], opacity: [0.3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1 h-3 rounded-full bg-white/60 blur-[0.5px]"
              />
              <motion.span
                animate={steamBurst ? { y: [-1, -16], opacity: [0.9, 0] } : { y: [0, -9], opacity: [0.4, 0] }}
                transition={{ duration: 1.4, delay: 0.3, repeat: Infinity }}
                className="w-1 h-4 rounded-full bg-white/70 blur-[0.5px]"
              />
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
              <svg viewBox="0 0 48 40" className="w-full h-full drop-shadow">
                {/* Saucer */}
                <ellipse cx="24" cy="34" rx="18" ry="4" fill="#D4BEA9" stroke="#5A4331" strokeWidth="1.5" />
                {/* Cup Body */}
                <path d="M12 18 Q 12 32 24 32 Q 36 32 36 18 Z" fill="#F4EAE0" stroke="#5A4331" strokeWidth="1.5" />
                {/* Tea Liquid */}
                <ellipse cx="24" cy="18" rx="11" ry="3" fill="#6B3A23" />
                {/* Cup Handle */}
                <path d="M35 20 C 42 20 42 28 34 29" stroke="#5A4331" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853]">
              Sip Tea
            </span>
          </button>

          {/* Object 3: Open Hardcover Book & Fountain Pen Pad */}
          <button
            type="button"
            onClick={() => togglePanel('book_notes')}
            title={`Open Book & Margins: ${activeBook.title}`}
            aria-label="Open Desk Book and Notes drawer"
            className={`group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5 px-2 py-1 rounded ${
              activePanel === 'book_notes' ? 'ring-1 ring-[#E4A853]' : ''
            }`}
          >
            <div className="w-16 h-12 sm:w-20 sm:h-14 flex items-center justify-center">
              <svg viewBox="0 0 72 48" className="w-full h-full drop-shadow">
                {/* Desk blotter pad */}
                <rect x="2" y="6" width="68" height="38" rx="2" fill="#2E1F18" stroke="#4D3524" strokeWidth="1.5" />
                {/* Left Page */}
                <path d="M8 12 Q 22 10 35 13 L 35 38 Q 22 35 8 37 Z" fill="#FAF3E8" stroke="#3D291F" strokeWidth="1" />
                {/* Right Page */}
                <path d="M64 12 Q 50 10 37 13 L 37 38 Q 50 35 64 37 Z" fill="#FAF3E8" stroke="#3D291F" strokeWidth="1" />
                {/* Book Spine Center */}
                <line x1="36" y1="12" x2="36" y2="38" stroke="#7A4248" strokeWidth="2" />
                {/* Ribbon Bookmark */}
                <path d="M36 12 C 34 26 40 32 38 42" stroke="#E4A853" strokeWidth="1.5" fill="none" />
                {/* Fountain pen */}
                <line x1="56" y1="36" x2="66" y2="24" stroke="#C4A482" strokeWidth="2" />
                <polygon points="56,36 54,38 57,39" fill="#140F0C" />
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853] max-w-[110px] truncate text-center">
              Book &amp; Notes
            </span>
          </button>

          {/* Object 4: Desk Timepiece / Hourglass */}
          <button
            type="button"
            onClick={() => togglePanel('timer')}
            title="Focus Timer"
            aria-label="Toggle Focus Timer drawer"
            className={`group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5 px-2 py-1 rounded ${
              activePanel === 'timer' ? 'ring-1 ring-[#E4A853]' : ''
            }`}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
              <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow">
                {/* Brass pocket watch casing */}
                <circle cx="22" cy="24" r="16" fill="#241B16" stroke="#C4A482" strokeWidth="2" />
                {/* Watch crown */}
                <rect x="20" y="4" width="4" height="4" fill="#C4A482" />
                <circle cx="22" cy="4" r="3" fill="none" stroke="#C4A482" strokeWidth="1.5" />
                {/* Dial face */}
                <circle cx="22" cy="24" r="12" fill="#FAF3E8" />
                {/* Watch hands */}
                <line x1="22" y1="24" x2="22" y2="16" stroke="#2E2118" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="22" y1="24" x2="27" y2="24" stroke="#6E3E44" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="24" r="1.5" fill="#C4A482" />
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853]">
              {timerRunning ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}` : 'Focus Timer'}
            </span>
          </button>

          {/* Object 5: Selected Keepsake */}
          <button
            type="button"
            onClick={() => togglePanel('trinkets')}
            title={`Desk Keepsake: ${currentTrinket.label} (Click to change)`}
            aria-label="Change desk keepsake"
            className={`group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5 px-2 py-1 rounded ${
              activePanel === 'trinkets' ? 'ring-1 ring-[#E4A853]' : ''
            }`}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
              {selectedTrinket === 'candle' && (
                <svg viewBox="0 0 36 44" className="w-full h-full drop-shadow">
                  <ellipse cx="18" cy="38" rx="12" ry="3" fill="#8A6635" stroke="#4A3416" strokeWidth="1" />
                  <rect x="15" y="16" width="6" height="22" fill="#EAE2D1" stroke="#5A4331" strokeWidth="1" />
                  <line x1="18" y1="16" x2="18" y2="12" stroke="#1A1614" strokeWidth="1" />
                  <path d="M18 6 Q 22 10 18 13 Q 14 10 18 6 Z" fill="#F5BA62" className="animate-pulse" />
                </svg>
              )}
              {selectedTrinket === 'teacup' && (
                <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow">
                  <ellipse cx="18" cy="30" rx="12" ry="3" fill="#D4BEA9" stroke="#5A4331" strokeWidth="1" />
                  <path d="M9 16 Q 9 28 18 28 Q 27 28 27 16 Z" fill="#F4EAE0" stroke="#5A4331" strokeWidth="1" />
                  <ellipse cx="18" cy="16" rx="9" ry="2" fill="#4B2D1B" />
                  <path d="M26 18 C 31 18 31 24 25 25" stroke="#5A4331" strokeWidth="1.5" fill="none" />
                </svg>
              )}
              {selectedTrinket === 'fern' && (
                <svg viewBox="0 0 36 40" className="w-full h-full drop-shadow">
                  <path d="M18 36 Q 16 20 22 8" stroke="#3D5A45" strokeWidth="1.5" fill="none" />
                  <ellipse cx="16" cy="22" rx="4" ry="1.5" fill="#4A6B53" transform="rotate(-30 16 22)" />
                  <ellipse cx="22" cy="18" rx="4" ry="1.5" fill="#4A6B53" transform="rotate(30 22 18)" />
                  <ellipse cx="18" cy="14" rx="3.5" ry="1.5" fill="#4A6B53" transform="rotate(-20 18 14)" />
                  <ellipse cx="22" cy="10" rx="3" ry="1.2" fill="#4A6B53" transform="rotate(25 22 10)" />
                </svg>
              )}
              {selectedTrinket === 'inkwell' && (
                <svg viewBox="0 0 36 40" className="w-full h-full drop-shadow">
                  <rect x="10" y="22" width="16" height="14" rx="2" fill="#2E241E" stroke="#C4A482" strokeWidth="1.5" />
                  <rect x="14" y="18" width="8" height="4" fill="#C4A482" />
                  <line x1="20" y1="20" x2="30" y2="6" stroke="#FAF3E8" strokeWidth="1.5" />
                  <path d="M30 6 L 32 4 L 28 8 Z" fill="#FAF3E8" />
                </svg>
              )}
              {selectedTrinket === 'walkman' && (
                <svg viewBox="0 0 40 36" className="w-full h-full drop-shadow">
                  <rect x="6" y="8" width="28" height="22" rx="2" fill="#3A4D5F" stroke="#22303D" strokeWidth="1.5" />
                  <rect x="10" y="12" width="20" height="12" rx="1" fill="#1C2733" />
                  <circle cx="16" cy="18" r="3" fill="#D4BEA9" />
                  <circle cx="24" cy="18" r="3" fill="#D4BEA9" />
                </svg>
              )}
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853]">
              {currentTrinket.label.split(' ')[0]}
            </span>
          </button>

          {/* Object 6: Antique Audio Ambience Console */}
          <button
            type="button"
            onClick={() => togglePanel('sound')}
            title="Room Ambience Mixer"
            aria-label="Toggle Room Ambience Mixer drawer"
            className={`group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-0.5 px-2 py-1 rounded ${
              activePanel === 'sound' ? 'ring-1 ring-[#E4A853]' : ''
            }`}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center">
              <svg viewBox="0 0 44 40" className="w-full h-full drop-shadow">
                {/* Wooden radio console */}
                <rect x="4" y="8" width="36" height="24" rx="2" fill="#3D291F" stroke="#8A6635" strokeWidth="1.5" />
                {/* Speaker fabric */}
                <rect x="8" y="12" width="16" height="16" rx="1" fill="#1D140F" />
                <line x1="12" y1="12" x2="12" y2="28" stroke="#4A3426" strokeWidth="1" />
                <line x1="16" y1="12" x2="16" y2="28" stroke="#4A3426" strokeWidth="1" />
                <line x1="20" y1="12" x2="20" y2="28" stroke="#4A3426" strokeWidth="1" />
                {/* Tuning Knobs */}
                <circle cx="32" cy="16" r="3" fill="#C4A482" stroke="#241B16" strokeWidth="1" />
                <circle cx="32" cy="24" r="3" fill="#C4A482" stroke="#241B16" strokeWidth="1" />
              </svg>
            </div>
            <span className="font-mono text-[10px] text-[#DFC9AA] group-hover:text-[#E4A853]">
              Ambience
            </span>
          </button>
        </div>

        {/* Accessible Quick Touch Bar (for mobile & screen readers) */}
        <div className="pt-2 border-t border-[#DFC9AA]/20 flex items-center justify-center gap-2 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => togglePanel('book_notes')}
            className={`px-3 py-1 rounded border text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer ${
              activePanel === 'book_notes'
                ? 'bg-[#E4A853] text-[#140F0C] border-[#140F0C] font-semibold'
                : 'bg-[#140F0C]/80 text-[#FAF3E8] border-[#DFC9AA]/30 hover:border-[#E4A853]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Book &amp; Notes</span>
          </button>

          <button
            type="button"
            onClick={() => togglePanel('timer')}
            className={`px-3 py-1 rounded border text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer ${
              activePanel === 'timer'
                ? 'bg-[#E4A853] text-[#140F0C] border-[#140F0C] font-semibold'
                : 'bg-[#140F0C]/80 text-[#FAF3E8] border-[#DFC9AA]/30 hover:border-[#E4A853]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus Timer</span>
          </button>

          <button
            type="button"
            onClick={() => togglePanel('sound')}
            className={`px-3 py-1 rounded border text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer ${
              activePanel === 'sound'
                ? 'bg-[#E4A853] text-[#140F0C] border-[#140F0C] font-semibold'
                : 'bg-[#140F0C]/80 text-[#FAF3E8] border-[#DFC9AA]/30 hover:border-[#E4A853]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ambience Mixer</span>
          </button>

          <button
            type="button"
            onClick={() => togglePanel('trinkets')}
            className={`px-3 py-1 rounded border text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer ${
              activePanel === 'trinkets'
                ? 'bg-[#E4A853] text-[#140F0C] border-[#140F0C] font-semibold'
                : 'bg-[#140F0C]/80 text-[#FAF3E8] border-[#DFC9AA]/30 hover:border-[#E4A853]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#E4A853]" />
            <span>Keepsakes</span>
          </button>
        </div>
      </div>

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

