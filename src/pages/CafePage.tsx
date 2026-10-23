import React, { useState, useEffect } from 'react';
import { soundEngine, SoundState, RoomSoundPreset } from '../lib/audioEngine';
import { useAuth } from '../context/AuthContext';
import { PixelAvatar } from '../components/avatar/PixelAvatar';
import { AvatarConfig } from '../types/profile';
import {
  Coffee,
  Volume2,
  VolumeX,
  Sliders,
  Users,
  MessageSquare,
  Sparkles,
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Flame,
  CloudRain,
  Disc,
  Music,
  Wind,
  Keyboard,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type RoomId = 'gazing_out' | 'writers_den' | 'quiet_reading';

interface CafeRoom {
  id: RoomId;
  title: string;
  tagline: string;
  readersCount: number;
  bgUrl: string;
  soundPreset: RoomSoundPreset;
  atmosphereDescription: string;
}

const ROOMS: CafeRoom[] = [
  {
    id: 'gazing_out',
    title: 'Gazing Out',
    tagline: 'Sitting inside a warm café, gazing out at rain-slicked European cobblestones and distant amber streetlights.',
    readersCount: 12,
    bgUrl: '/cafeteria/gazing-out.gif',
    soundPreset: 'gazing_out',
    atmosphereDescription: 'Cinematic rain reflections & nostalgic street window view',
  },
  {
    id: 'writers_den',
    title: "The Writers' Den",
    tagline: 'Rich bohemian loft, overflowing bookshelves, lush plants, fairy lights, rugs, and shared creative fervor.',
    readersCount: 17,
    bgUrl: '/cafeteria/writers-den.jpg',
    soundPreset: 'writers_den',
    atmosphereDescription: 'Warm burgundy tones, fairy lights & typewriter clatter',
  },
  {
    id: 'quiet_reading',
    title: 'The Quiet Reading Room',
    tagline: 'Midnight blue, muted slate teal, soft pendant illumination, and peaceful silence for deep uninterrupted focus.',
    readersCount: 9,
    bgUrl: '/cafeteria/quiet-reading-room.jpg',
    soundPreset: 'quiet_reading',
    atmosphereDescription: 'Warm pendant lights, calm indie pixel stillness & room tone',
  },
];

interface CafeReader {
  id: string;
  name: string;
  avatarColor: string;
  readingBook: string;
  tablePosition: { x: number; y: number }; // percentage
  currentEmote?: string;
  avatarConfig?: Partial<AvatarConfig>;
  isCurrentUser?: boolean;
}

const INITIAL_READERS: Record<RoomId, CafeReader[]> = {
  gazing_out: [
    {
      id: 'r1',
      name: 'Eleanor_V',
      avatarColor: '#755151',
      readingBook: 'Camera Lucida by Roland Barthes',
      tablePosition: { x: 22, y: 64 },
      avatarConfig: {
        skinTone: '#FFF0E5',
        hairStyle: 'classic_bob',
        hairColor: '#443223',
        top: 'turtleneck',
        topColor: '#1A1614',
        bottom: 'pleated_skirt',
        bottomColor: '#755151',
        outerwear: 'cozy_cardigan',
        outerwearColor: '#72583E',
        accessories: ['round_spectacles'],
        heldItem: 'antique_book',
        faceExpression: 'contemplative',
      },
    },
    {
      id: 'r2',
      name: 'Julian_M',
      avatarColor: '#44422D',
      readingBook: 'The Secret History by Donna Tartt',
      tablePosition: { x: 50, y: 72 },
      avatarConfig: {
        skinTone: '#EAD4BA',
        hairStyle: 'shaggy_mess',
        hairColor: '#1A1614',
        top: 'button_oxford',
        topColor: '#FCF8F2',
        bottom: 'cargo_pants',
        bottomColor: '#DBC4A5',
        outerwear: 'tweed_blazer',
        outerwearColor: '#44422D',
        accessories: ['wire_rims'],
        heldItem: 'steaming_coffee',
        faceExpression: 'focused',
      },
    },
    {
      id: 'r3',
      name: 'Beatrix_K',
      avatarColor: '#72583E',
      readingBook: 'Wuthering Heights',
      tablePosition: { x: 78, y: 62 },
      avatarConfig: {
        skinTone: '#D4AA7D',
        hairStyle: 'wavy_locks',
        hairColor: '#8D3F37',
        top: 'striped_longsleeve',
        topColor: '#1A1614',
        bottom: 'cuffed_jeans',
        bottomColor: '#3B4D61',
        outerwear: 'none',
        accessories: ['french_beret', 'silver_earring'],
        heldItem: 'leather_journal',
        faceExpression: 'melancholy',
      },
    },
  ],
  writers_den: [
    {
      id: 'r4',
      name: 'Miles_B',
      avatarColor: '#755151',
      readingBook: 'Norwegian Wood by Murakami',
      tablePosition: { x: 26, y: 66 },
      avatarConfig: {
        skinTone: '#66442E',
        hairStyle: 'slick_back',
        hairColor: '#1A1614',
        top: 'turtleneck',
        topColor: '#1A1614',
        bottom: 'tailored_slacks',
        bottomColor: '#443223',
        outerwear: 'tweed_blazer',
        outerwearColor: '#755151',
        accessories: ['wire_rims'],
        heldItem: 'steaming_coffee',
        faceExpression: 'contemplative',
      },
    },
    {
      id: 'r5',
      name: 'Clara_O',
      avatarColor: '#A08670',
      readingBook: 'If We Were Villains',
      tablePosition: { x: 55, y: 62 },
      avatarConfig: {
        skinTone: '#A57451',
        hairStyle: 'poet_curls',
        hairColor: '#1A1614',
        top: 'oversized_tee',
        topColor: '#755151',
        bottom: 'cargo_pants',
        bottomColor: '#1A1614',
        outerwear: 'denim_jacket',
        outerwearColor: '#3B4D61',
        accessories: ['over_ear_headphones'],
        heldItem: 'walkman',
        faceExpression: 'contemplative',
      },
    },
    {
      id: 'r6',
      name: 'Oliver_S',
      avatarColor: '#443223',
      readingBook: 'The Picture of Dorian Gray',
      tablePosition: { x: 82, y: 70 },
      avatarConfig: {
        skinTone: '#EAD4BA',
        hairStyle: 'pixie',
        hairColor: '#443223',
        top: 'knit_sweater',
        topColor: '#44422D',
        bottom: 'cuffed_jeans',
        bottomColor: '#3B4D61',
        outerwear: 'none',
        accessories: ['knit_beanie'],
        heldItem: 'antique_book',
        faceExpression: 'neutral',
      },
    },
  ],
  quiet_reading: [
    {
      id: 'r7',
      name: 'Theodore_P',
      avatarColor: '#7C7960',
      readingBook: 'Dead Poets Society',
      tablePosition: { x: 25, y: 68 },
      avatarConfig: {
        skinTone: '#EAD4BA',
        hairStyle: 'side_part',
        hairColor: '#72583E',
        top: 'button_oxford',
        topColor: '#FCF8F2',
        bottom: 'tailored_slacks',
        bottomColor: '#1A1614',
        outerwear: 'trench_coat',
        outerwearColor: '#7C7960',
        accessories: ['round_spectacles'],
        heldItem: 'fountain_pen',
        faceExpression: 'focused',
      },
    },
    {
      id: 'r8',
      name: 'Sora_L',
      avatarColor: '#44422D',
      readingBook: 'The Bell Jar by Sylvia Plath',
      tablePosition: { x: 72, y: 66 },
      avatarConfig: {
        skinTone: '#FFF0E5',
        hairStyle: 'classic_bob',
        hairColor: '#1A1614',
        top: 'oversized_tee',
        topColor: '#1A1614',
        bottom: 'pleated_skirt',
        bottomColor: '#755151',
        outerwear: 'cozy_cardigan',
        outerwearColor: '#44422D',
        accessories: ['round_spectacles'],
        heldItem: 'leather_journal',
        faceExpression: 'melancholy',
      },
    },
  ],
};

export const CafePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState<RoomId>('gazing_out');
  const [quietMode, setQuietMode] = useState<boolean>(false);

  // Sound Engine subscriber state
  const [soundState, setSoundState] = useState<SoundState>(soundEngine.getState());

  useEffect(() => {
    const unsub = soundEngine.subscribe(state => {
      setSoundState(state);
    });
    return unsub;
  }, []);

  // Readers & Emotes
  const [readers, setReaders] = useState<CafeReader[]>(INITIAL_READERS[activeRoomId]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; text: string; time: string }>>([
    { user: 'Eleanor_V', text: 'The rain against the glass is mesmerizing tonight. On chapter 7.', time: '21:04' },
    { user: 'Julian_M', text: '“Beauty is terror.” Finding new depth on every reread.', time: '21:08' },
  ]);

  const activeRoom = ROOMS.find(r => r.id === activeRoomId) || ROOMS[0];

  // Room transition handler
  const handleSelectRoom = (roomId: RoomId) => {
    soundEngine.playClick();
    setActiveRoomId(roomId);
    const room = ROOMS.find(r => r.id === roomId);
    if (room && soundState.isPlaying) {
      soundEngine.playRoomPreset(room.soundPreset);
    }
  };

  // Sync user presence into room
  useEffect(() => {
    const baseReaders = [...(INITIAL_READERS[activeRoomId] || [])];
    if (user) {
      baseReaders.push({
        id: user.id,
        name: `${profile?.display_name || user.displayName || 'You'} (You)`,
        avatarColor: '#755151',
        readingBook: 'The Secret History (Desk)',
        tablePosition: { x: 50, y: 78 },
        avatarConfig: profile?.avatar_config,
        isCurrentUser: true,
      });
    }
    setReaders(baseReaders);
  }, [activeRoomId, user, profile]);

  const toggleSoundTrack = (trackName: string) => {
    soundEngine.playClick();
    const isPlaying = soundState.activeTracks[trackName];
    if (isPlaying) {
      soundEngine.stopTrack(trackName);
    } else {
      if (trackName === 'rain') soundEngine.startRain();
      else if (trackName === 'street') soundEngine.startStreet();
      else if (trackName === 'murmur') soundEngine.startCafeMurmur();
      else if (trackName === 'typing') soundEngine.startTyping();
      else if (trackName === 'roomtone') soundEngine.startRoomTone();
      else if (trackName === 'fireplace') soundEngine.startFireplace();
      else if (trackName === 'vinyl') soundEngine.startVinyl();
      else if (trackName === 'piano') soundEngine.startPiano();
    }
  };

  const handleTrackVolumeChange = (trackName: string, vol: number) => {
    soundEngine.setTrackVolume(trackName, vol);
  };

  const toggleMasterSound = () => {
    soundEngine.playClick();
    if (!soundState.isPlaying) {
      soundEngine.playRoomPreset(activeRoom.soundPreset);
    } else {
      soundEngine.togglePlayPause();
    }
  };

  const toggleMasterMute = () => {
    soundEngine.playClick();
    soundEngine.toggleMute();
  };

  const triggerEmote = (emoteIcon: string) => {
    soundEngine.playClick();
    setReaders(prev =>
      prev.map(r => (r.isCurrentUser || r.id === 'r1' ? { ...r, currentEmote: emoteIcon } : r))
    );
    setTimeout(() => {
      setReaders(prev =>
        prev.map(r => (r.isCurrentUser || r.id === 'r1' ? { ...r, currentEmote: undefined } : r))
      );
    }, 2500);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    soundEngine.playClick();
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { user: profile?.display_name || 'You', text: chatInput.trim(), time }]);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      {/* Top Banner & Room Selector */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-2 border-[#443223] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-2">
            <Coffee className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>CAFETERIA CO-PRESENCE SANCTUARY</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            The Literary Cafeteria
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E]">
            {activeRoom.tagline}
          </p>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`px-3.5 py-2 rounded font-typewriter text-xs font-bold transition-all border-2 flex items-center gap-2 cursor-pointer ${
                activeRoomId === room.id
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#FCF8F2] text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
              }`}
            >
              <span>{room.title}</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] opacity-80">{room.readersCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Room Viewport & Presence Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Atmospheric Room Scene */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className="w-full h-[460px] sm:h-[530px] rounded-lg border-3 border-[#443223] shadow-[5px_5px_0px_#443223] relative overflow-hidden bg-cover bg-center select-none bg-neutral-900"
            style={{
              backgroundImage: `url("${activeRoom.bgUrl}")`,
            }}
          >
            {/* Room-Specific Atmosphere Overlays */}
            {activeRoom.id === 'gazing_out' && (
              <>
                {/* Street Window Rain & Amber Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30 pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(255, 190, 120, 0.4) 0%, transparent 60%)',
                  }}
                />
              </>
            )}

            {activeRoom.id === 'writers_den' && (
              <>
                {/* Cozy Loft Burgundy & Fairy Lights Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#3B151E]/20 to-black/25 pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none opacity-25 animate-pulse"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 75% 25%, rgba(255, 220, 160, 0.45) 0%, transparent 40%)',
                    animationDuration: '4s',
                  }}
                />
              </>
            )}

            {activeRoom.id === 'quiet_reading' && (
              <>
                {/* Midnight Blue & Soft Pendant Lamp Light Cone */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#132533]/30 to-black/30 pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(ellipse at 50% 12%, rgba(255, 230, 170, 0.5) 0%, transparent 55%)',
                  }}
                />
              </>
            )}

            {/* Room Title Header inside canvas */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
              <div className="px-3 py-1 bg-[#1C1815]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-[#FAF4EB] backdrop-blur-sm shadow-md">
                <span className="font-bold">ROOM: {activeRoom.title.toUpperCase()}</span>
              </div>
              <div className="px-2.5 py-1 bg-[#1C1815]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-green-400 flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span>{activeRoom.readersCount} READERS ONLINE</span>
              </div>
            </div>

            {/* Quiet Mode Indicator */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setQuietMode(!quietMode)}
                className="px-3 py-1.5 bg-[#1C1815]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-[#FAF4EB] flex items-center gap-1.5 backdrop-blur-sm hover:bg-[#2E2722] transition-colors cursor-pointer shadow-md"
              >
                {quietMode ? <EyeOff className="w-3.5 h-3.5 text-yellow-400" /> : <Eye className="w-3.5 h-3.5 text-[#DBC4A5]" />}
                <span>{quietMode ? 'Quiet Mode (Chat Hidden)' : 'Quiet Mode: Off'}</span>
              </button>
            </div>

            {/* Seated Readers with Pixel-Style Avatars */}
            {readers.map(reader => (
              <div
                key={reader.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300"
                style={{ left: `${reader.tablePosition.x}%`, top: `${reader.tablePosition.y}%` }}
              >
                {/* Emote Bubble */}
                <AnimatePresence>
                  {reader.currentEmote && (
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1.25, y: -25 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-3xl mb-1 filter drop-shadow-md z-30"
                    >
                      {reader.currentEmote}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pixel Avatar Representation */}
                <div
                  className={`p-1 rounded-lg border-2 shadow-xl flex flex-col items-center justify-center backdrop-blur-md transition-all group-hover:scale-110 ${
                    reader.isCurrentUser
                      ? 'border-[#DBC4A5] bg-[#755151]/95 ring-2 ring-[#DBC4A5] shadow-[0px_4px_14px_rgba(219,196,165,0.5)]'
                      : 'border-[#443223] bg-[#1A1614]/90'
                  }`}
                >
                  <PixelAvatar
                    config={reader.avatarConfig || {}}
                    size="sm"
                    viewMode="bust"
                  />
                  {reader.isCurrentUser && (
                    <span className="text-[8px] font-mono font-bold text-[#DBC4A5] uppercase tracking-wider mt-0.5">
                      YOU
                    </span>
                  )}
                </div>

                {/* Reader Name & Now Reading Bubble */}
                <div className="mt-1.5 bg-[#1A1614]/90 border border-[#DBC4A5]/60 px-2 py-0.5 rounded text-center shadow-md max-w-[155px]">
                  <span className="font-typewriter text-[11px] font-bold text-[#FAF4EB] block truncate">
                    {reader.name}
                  </span>
                  <span className="font-sans text-[9px] text-[#DBC4A5] flex items-center justify-center gap-1 truncate">
                    <BookOpen className="w-2.5 h-2.5 text-[#A08670] flex-shrink-0" />
                    <span>{reader.readingBook}</span>
                  </span>
                </div>
              </div>
            ))}

            {/* Bottom Floating Emotes Dock */}
            <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#1A1614]/90 border border-[#DBC4A5]/40 p-1.5 rounded-lg backdrop-blur-md shadow-lg">
                <span className="text-[10px] font-typewriter uppercase tracking-wider text-[#DBC4A5] pl-1.5 hidden sm:inline">
                  EMOTE:
                </span>
                <button
                  onClick={() => triggerEmote('👋')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base cursor-pointer"
                  title="Wave"
                >
                  👋
                </button>
                <button
                  onClick={() => triggerEmote('☕')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base cursor-pointer"
                  title="Sip Tea / Coffee"
                >
                  ☕
                </button>
                <button
                  onClick={() => triggerEmote('📖')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base cursor-pointer"
                  title="Turn Page"
                >
                  📖
                </button>
                <button
                  onClick={() => triggerEmote('🕯️')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base cursor-pointer"
                  title="Light Candle"
                >
                  🕯️
                </button>
                <button
                  onClick={() => triggerEmote('💭')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base cursor-pointer"
                  title="Deep Thought"
                >
                  💭
                </button>
              </div>

              {/* Master Audio Toggle Button in Canvas */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMasterSound}
                  className={`px-3 py-1.5 rounded-lg border font-typewriter text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md ${
                    soundState.isPlaying
                      ? 'bg-[#755151]/95 text-[#FFF9F3] border-[#FAF4EB]'
                      : 'bg-[#1A1614]/90 text-[#DBC4A5] border-[#DBC4A5]/40 hover:bg-[#2E2722]'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-green-400" />
                  <span>{soundState.isPlaying ? 'Ambience Playing' : 'Start Room Sound'}</span>
                </button>

                <button
                  onClick={toggleMasterMute}
                  className={`p-2 rounded-lg border font-typewriter text-xs flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md ${
                    soundState.isMuted
                      ? 'bg-red-950/90 text-red-200 border-red-700'
                      : 'bg-[#1A1614]/90 text-[#FFF9F3] border-[#DBC4A5]/40 hover:bg-[#2E2722]'
                  }`}
                  title={soundState.isMuted ? 'Unmute' : 'Mute'}
                >
                  {soundState.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#DBC4A5]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Full Procedural Ambient Sound Mixer Panel */}
          <div className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#A08670] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#755151]" />
                <h3 className="font-editorial text-base font-bold text-[#443223]">
                  Atmospheric Sound Mixer (Procedural Web Audio Engine)
                </h3>
              </div>
              <span className="font-typewriter text-[11px] text-[#72583E]">
                Preset: {activeRoom.title}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Rain */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <CloudRain className="w-4 h-4 text-blue-700 mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Rainstorm</span>
                <button
                  onClick={() => toggleSoundTrack('rain')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['rain']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['rain'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['rain'] ?? 0.5}
                  onChange={e => handleTrackVolumeChange('rain', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Distant Street / Breeze */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Wind className="w-4 h-4 text-teal-700 mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Street / Wind</span>
                <button
                  onClick={() => toggleSoundTrack('street')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['street']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['street'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['street'] ?? 0.35}
                  onChange={e => handleTrackVolumeChange('street', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Café Murmur */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Coffee className="w-4 h-4 text-[#72583E] mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Café Murmur</span>
                <button
                  onClick={() => toggleSoundTrack('murmur')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['murmur']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['murmur'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['murmur'] ?? 0.3}
                  onChange={e => handleTrackVolumeChange('murmur', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Typewriter / Writing */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Keyboard className="w-4 h-4 text-[#58432D] mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Typewriter</span>
                <button
                  onClick={() => toggleSoundTrack('typing')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['typing']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['typing'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['typing'] ?? 0.25}
                  onChange={e => handleTrackVolumeChange('typing', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Quiet Room Tone */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Compass className="w-4 h-4 text-slate-700 mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Room Tone</span>
                <button
                  onClick={() => toggleSoundTrack('roomtone')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['roomtone']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['roomtone'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['roomtone'] ?? 0.4}
                  onChange={e => handleTrackVolumeChange('roomtone', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Fireplace */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Flame className="w-4 h-4 text-amber-700 mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Fireplace</span>
                <button
                  onClick={() => toggleSoundTrack('fireplace')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['fireplace']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['fireplace'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['fireplace'] ?? 0.35}
                  onChange={e => handleTrackVolumeChange('fireplace', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Vinyl */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Disc className="w-4 h-4 text-[#443223] mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Vinyl Clicks</span>
                <button
                  onClick={() => toggleSoundTrack('vinyl')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['vinyl']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['vinyl'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['vinyl'] ?? 0.25}
                  onChange={e => handleTrackVolumeChange('vinyl', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Soft Piano */}
              <div className="p-2.5 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Music className="w-4 h-4 text-[#755151] mb-1" />
                <span className="font-typewriter text-[11px] font-bold text-[#443223] mb-1.5">Piano Chords</span>
                <button
                  onClick={() => toggleSoundTrack('piano')}
                  className={`w-full py-0.5 rounded text-[10px] font-typewriter font-bold mb-1.5 border cursor-pointer ${
                    soundState.activeTracks['piano']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {soundState.activeTracks['piano'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundState.volumes['piano'] ?? 0.3}
                  onChange={e => handleTrackVolumeChange('piano', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quiet Mode Reading Thoughts & Live Chat */}
        <div className="lg:col-span-4">
          <div className="catalog-card p-5 bg-[#FCF8F2] border-2 border-[#443223] flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#A08670] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#755151]" />
                <h3 className="font-editorial text-base font-bold text-[#443223]">
                  Cafeteria Whispers
                </h3>
              </div>
              <span className="font-typewriter text-[10px] text-[#72583E]">
                {quietMode ? 'Quiet Mode Active' : 'Live Room Feed'}
              </span>
            </div>

            {quietMode ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#FFF9F3] border border-[#A08670] rounded">
                <Coffee className="w-8 h-8 text-[#A08670] mb-2" />
                <h4 className="font-editorial text-base font-bold text-[#443223] mb-1">
                  Quiet Focus Sanctuary
                </h4>
                <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                  Chat stream is hidden so you can immerse completely in your volume. Your co-presence with fellow poets remains active.
                </p>
                <button
                  onClick={() => setQuietMode(false)}
                  className="btn-secondary text-xs py-1.5 px-3 mt-4 cursor-pointer"
                >
                  Show Room Chat
                </button>
              </div>
            ) : (
              <>
                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded border text-xs font-typewriter ${
                        msg.user === 'You' || (profile?.display_name && msg.user === profile.display_name)
                          ? 'bg-[#DBC4A5]/35 border-[#A08670] ml-4'
                          : 'bg-[#FFF9F3] border-[#DBC4A5] mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#755151]">{msg.user}</span>
                        <span className="text-[10px] text-[#A08670]">{msg.time}</span>
                      </div>
                      <p className="text-[#443223] leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={sendChatMessage} className="flex gap-2 pt-2 border-t border-[#A08670]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Whisper a reading thought..."
                    className="flex-1 px-3 py-2 text-xs font-typewriter bg-[#FFF9F3] border border-[#A08670] rounded text-[#443223] focus:outline-none focus:border-[#443223]"
                  />
                  <button type="submit" className="btn-primary text-xs py-2 px-3 cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
