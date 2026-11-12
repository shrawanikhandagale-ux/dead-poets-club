import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CafeRoomId,
  DeskTrinketId,
  ROOM_WHISPER_MAX_LENGTH,
  RoomInteractiveObject,
  RoomSeat,
  RoomWhisper,
  WhisperExpiryOption,
} from '../components/cafe/cafeTypes';
import { CAFE_ROOMS, DEMO_RESIDENT_WHISPERS } from '../components/cafe/cafeRooms';
import { CafeRoomSelect } from '../components/cafe/CafeRoomSelect';
import { CafeWalkableRoom } from '../components/cafe/CafeWalkableRoom';
import { CafeFirstPersonDesk } from '../components/cafe/CafeFirstPersonDesk';
import { RoomWhisperComposer } from '../components/cafe/RoomWhisperComposer';
import { soundEngine, SoundState } from '../lib/audioEngine';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CafeMode = 'select' | 'walk' | 'seated';

const EXPIRY_DURATION_MS: Record<Exclude<WhisperExpiryOption, 'session'>, number> = {
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

export const CafePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<CafeMode>('select');
  const [activeRoomId, setActiveRoomId] = useState<CafeRoomId>(() => {
    try {
      const saved = localStorage.getItem('dpc_cafe_room') as CafeRoomId;
      if (saved && CAFE_ROOMS[saved]) return saved;
    } catch {}
    return 'athenaeum';
  });

  const [activeSeat, setActiveSeat] = useState<RoomSeat | null>(null);
  const [savedWalkPos, setSavedWalkPos] = useState<{ x: number; y: number } | undefined>(undefined);
  const [quietMode, setQuietMode] = useState(false);
  const [whispersOpen, setWhispersOpen] = useState(false);
  const [inspectionToast, setInspectionToast] = useState<{
    title: string;
    note: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Desk keepsake customization persisted locally
  const [selectedTrinket, setSelectedTrinket] = useState<DeskTrinketId>(() => {
    try {
      return (localStorage.getItem('dpc_cafe_trinket') as DeskTrinketId) || 'candle';
    } catch {
      return 'candle';
    }
  });

  const handleSelectTrinket = (id: DeskTrinketId) => {
    setSelectedTrinket(id);
    try {
      localStorage.setItem('dpc_cafe_trinket', id);
    } catch {}
  };

  // Persistent Focus Timer across Sit / Stand transitions
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          soundEngine.playChime(783.99);
          setInspectionToast({
            title: 'Focus Session Complete',
            note: 'You stayed with the page. Stretch your shoulders before the next chapter.',
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const handleStartTimer = (minutes: number) => {
    soundEngine.playChime(587.33);
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
  };

  // Sound engine sync
  const [soundState, setSoundState] = useState<SoundState>(soundEngine.getState());
  useEffect(() => soundEngine.subscribe(setSoundState), []);

  // Room Whispers: single active ephemeral status bubble scoped to current Cafeteria room
  const [activeWhisper, setActiveWhisper] = useState<RoomWhisper | null>(null);
  const [mutedAuthorIds, setMutedAuthorIds] = useState<string[]>([]);
  const [reportedWhisperIds, setReportedWhisperIds] = useState<string[]>([]);

  const activeRoom = CAFE_ROOMS[activeRoomId];
  const userHandle = user?.username ? `@${user.username}` : profile?.display_name || 'You';

  // Expire active Room Whisper automatically when its TTL elapses
  useEffect(() => {
    if (!activeWhisper?.expiresAt) return;
    const msLeft = activeWhisper.expiresAt - Date.now();
    if (msLeft <= 0) {
      setActiveWhisper(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveWhisper(null);
    }, msLeft);
    return () => window.clearTimeout(timer);
  }, [activeWhisper]);

  // Ensure leaving the Cafeteria clears ephemeral room presence
  useEffect(() => {
    return () => {
      setActiveWhisper(null);
    };
  }, []);

  const handleEnterRoom = (roomId: CafeRoomId) => {
    setActiveRoomId(roomId);
    setActiveSeat(null);
    setActiveWhisper(null); // Clear active whisper on room switch so bubbles never duplicate across rooms
    setSavedWalkPos(CAFE_ROOMS[roomId].spawnPoint);
    setInspectionToast(null);
    setMode('walk');
    try {
      localStorage.setItem('dpc_cafe_room', roomId);
    } catch {}
    if (soundState.isPlaying) {
      soundEngine.playRoomPreset(CAFE_ROOMS[roomId].soundPreset);
    }
  };

  const handleSitAtSeat = useCallback((seat: RoomSeat, playerPos: { x: number; y: number }) => {
    setSavedWalkPos(playerPos);
    setActiveSeat(seat);
    setInspectionToast(null);
    setMode('seated');
  }, []);

  const handleStandUp = useCallback(() => {
    setMode('walk');
  }, []);

  const handleInspectObject = useCallback(
    (obj: RoomInteractiveObject) => {
      if (obj.actionType === 'open_whispers') {
        setWhispersOpen(true);
        setInspectionToast({
          title: obj.label,
          note: obj.inspectionNote,
        });
        return;
      }

      if (obj.actionType === 'toggle_audio') {
        if (!soundState.isPlaying) {
          soundEngine.playRoomPreset(activeRoom.soundPreset);
        } else {
          soundEngine.togglePlayPause();
        }
        setInspectionToast({
          title: obj.label,
          note: !soundState.isPlaying
            ? `${obj.inspectionNote} (Room ambience started)`
            : `${obj.inspectionNote} (Ambience paused)`,
        });
        return;
      }

      if (obj.actionType === 'open_library') {
        setInspectionToast({
          title: obj.label,
          note: obj.inspectionNote,
          actionLabel: 'Visit Library',
          onAction: () => navigate('/library'),
        });
        return;
      }

      setInspectionToast({
        title: obj.label,
        note: obj.inspectionNote,
      });
    },
    [activeRoom.soundPreset, navigate, soundState.isPlaying]
  );

  const handlePublishWhisper = useCallback(
    (rawText: string, expiryOption: WhisperExpiryOption) => {
      const cleaned = rawText.trim().slice(0, ROOM_WHISPER_MAX_LENGTH);
      if (!cleaned) return;
      soundEngine.playClick();
      const now = Date.now();
      const expiresAt =
        expiryOption === 'session' ? null : now + EXPIRY_DURATION_MS[expiryOption];

      setActiveWhisper({
        id: `rw-${activeRoomId}-${now}`,
        roomId: activeRoomId,
        authorId: user?.id || 'local-reader',
        authorName: userHandle,
        text: cleaned,
        createdAt: now,
        expiresAt,
        expiryOption,
        isSelf: true,
      });
    },
    [activeRoomId, user?.id, userHandle]
  );

  const handleClearWhisper = useCallback(() => {
    soundEngine.playClick();
    setActiveWhisper(null);
  }, []);

  const handleToggleMuteAuthor = useCallback((authorId: string) => {
    soundEngine.playClick();
    setMutedAuthorIds(prev =>
      prev.includes(authorId) ? prev.filter(id => id !== authorId) : [...prev, authorId]
    );
  }, []);

  const handleReportWhisper = useCallback((whisperId: string) => {
    soundEngine.playClick();
    setReportedWhisperIds(prev => (prev.includes(whisperId) ? prev : [...prev, whisperId]));
  }, []);

  if (mode === 'select') {
    return (
      <CafeRoomSelect
        onEnterRoom={handleEnterRoom}
        activeTimerSeconds={timerSeconds}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8 space-y-4">
      {/* Top Room Navigation & Atmosphere Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B59C84]/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveWhisper(null); // Leaving room clears active Room Whisper
              setMode('select');
              setActiveSeat(null);
            }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Rooms</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-[#2E2118]">
                {activeRoom.name}
              </h1>
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFE2CF] border border-[#B59C84] text-[#684F38]">
                {mode === 'seated' ? 'Seated POV' : 'Exploring'}
              </span>
            </div>
            <p className="text-xs font-sans text-[#684F38] hidden sm:block">
              {activeRoom.subtitle} · {activeRoom.demoPatrons.length} demo residents
            </p>
          </div>
        </div>

        {/* Right Controls: Timer Badge, Sound, Quiet Mode, Whispers */}
        <div className="flex flex-wrap items-center gap-2">
          {timerSeconds > 0 && (
            <div className="px-2.5 py-1.5 rounded bg-[#6E3E44] text-[#FAF3E8] border border-[#2E2118] font-mono text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E4A853]" />
              <span>
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                {(timerSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              if (!soundState.isPlaying) soundEngine.playRoomPreset(activeRoom.soundPreset);
              else soundEngine.togglePlayPause();
            }}
            className={`px-3 py-1.5 rounded border-2 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              soundState.isPlaying && !soundState.isMuted
                ? 'bg-[#3A4435] text-[#FAF3E8] border-[#2E2118]'
                : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84]'
            }`}
          >
            {soundState.isPlaying && !soundState.isMuted ? (
              <Volume2 className="w-3.5 h-3.5 text-[#E4A853]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{soundState.isPlaying ? 'Sound On' : 'Play Sound'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setQuietMode(prev => !prev);
            }}
            className={`px-3 py-1.5 rounded border-2 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              quietMode
                ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118]'
                : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84]'
            }`}
          >
            {quietMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{quietMode ? 'Quiet Mode' : 'Quiet Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setWhispersOpen(prev => !prev);
            }}
            className={`px-3 py-1.5 rounded border-2 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeWhisper
                ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118]'
                : 'bg-[#FCF7EE] text-[#2E2118] border-[#B59C84] hover:border-[#2E2118]'
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 ${activeWhisper ? 'text-[#E4A853]' : 'text-[#6E3E44]'}`} />
            <span>{activeWhisper ? 'Whispering' : 'Whisper'}</span>
          </button>
        </div>
      </div>

      {/* Main Play / First-Person Viewport + Optional Collapsible Room Whisper Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className={whispersOpen ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <AnimatePresence mode="wait">
            {mode === 'walk' ? (
              <motion.div
                key={`walk-${activeRoomId}`}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                <CafeWalkableRoom
                  room={activeRoom}
                  quietMode={quietMode}
                  initialPosition={savedWalkPos}
                  playerWhisper={activeWhisper && activeWhisper.roomId === activeRoomId ? activeWhisper : null}
                  residentWhispers={DEMO_RESIDENT_WHISPERS[activeRoomId]}
                  mutedAuthorIds={mutedAuthorIds}
                  onSitAtSeat={handleSitAtSeat}
                  onInspectObject={handleInspectObject}
                />
              </motion.div>
            ) : (
              activeSeat && (
                <motion.div
                  key={`seat-${activeRoomId}-${activeSeat.id}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <CafeFirstPersonDesk
                    room={activeRoom}
                    seat={activeSeat}
                    soundState={soundState}
                    timerSeconds={timerSeconds}
                    timerRunning={timerRunning}
                    activeWhisper={activeWhisper && activeWhisper.roomId === activeRoomId ? activeWhisper : null}
                    onOpenWhispers={() => setWhispersOpen(true)}
                    onStartTimer={handleStartTimer}
                    onToggleTimer={() => setTimerRunning(prev => !prev)}
                    onResetTimer={() => {
                      setTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    selectedTrinket={selectedTrinket}
                    onSelectTrinket={handleSelectTrinket}
                    onStandUp={handleStandUp}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Object Inspection Dialogue Banner */}
          <AnimatePresence>
            {inspectionToast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 p-3.5 rounded-lg bg-[#FCF7EE] border-2 border-[#2E2118] shadow-[3px_3px_0px_#2E2118] flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#6E3E44] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-mono text-[11px] font-medium text-[#6E3E44] uppercase tracking-wider block">
                      {inspectionToast.title}
                    </span>
                    <p className="text-sm font-sans text-[#2E2118]">{inspectionToast.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inspectionToast.actionLabel && inspectionToast.onAction && (
                    <button
                      type="button"
                      onClick={inspectionToast.onAction}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {inspectionToast.actionLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInspectionToast(null)}
                    className="p-1 rounded hover:bg-[#EFE2CF] cursor-pointer"
                    aria-label="Dismiss inspection note"
                  >
                    <X className="w-4 h-4 text-[#684F38]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsible Room Whisper Bubble Composer */}
        {whispersOpen && (
          <div className="lg:col-span-4">
            <RoomWhisperComposer
              room={activeRoom}
              userHandle={userHandle}
              activeWhisper={activeWhisper && activeWhisper.roomId === activeRoomId ? activeWhisper : null}
              roomResidentsWhispers={DEMO_RESIDENT_WHISPERS[activeRoomId]}
              mutedAuthorIds={mutedAuthorIds}
              reportedWhisperIds={reportedWhisperIds}
              quietMode={quietMode}
              onPublishWhisper={handlePublishWhisper}
              onClearWhisper={handleClearWhisper}
              onToggleMuteAuthor={handleToggleMuteAuthor}
              onReportWhisper={(whisperId) => handleReportWhisper(whisperId)}
              onClose={() => setWhispersOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
