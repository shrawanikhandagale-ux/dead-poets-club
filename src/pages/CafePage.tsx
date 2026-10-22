import React, { useState, useEffect } from 'react';
import { soundEngine } from '../lib/audioEngine';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CafeRoom {
  id: 'cottagecore' | 'nylibrary' | 'jazzclub';
  title: string;
  tagline: string;
  readersCount: number;
  bgUrl: string;
  defaultSounds: { rain?: number; fireplace?: number; murmur?: number; vinyl?: number; piano?: number };
}

const ROOMS: CafeRoom[] = [
  {
    id: 'cottagecore',
    title: 'Cottagecore Reading Nook',
    tagline: 'Warm wooden hearth, rain against windowpanes, dried lavender, and hot herbal tea.',
    readersCount: 9,
    bgUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    defaultSounds: { rain: 0.6, fireplace: 0.5 },
  },
  {
    id: 'nylibrary',
    title: 'New York Grand Library',
    tagline: 'High arched stone ceilings, green banker lamps, quiet page turns, and gentle echoes.',
    readersCount: 14,
    bgUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    defaultSounds: { murmur: 0.35, rain: 0.2 },
  },
  {
    id: 'jazzclub',
    title: 'Midnight Jazz Club',
    tagline: 'Dim amber candlelight, crackling vinyl, velvet booths, and solitary readers at the bar.',
    readersCount: 7,
    bgUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    defaultSounds: { vinyl: 0.5, piano: 0.4 },
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

const INITIAL_READERS: Record<string, CafeReader[]> = {
  cottagecore: [
    {
      id: 'r1',
      name: 'Eleanor_V',
      avatarColor: '#755151',
      readingBook: 'Emma by Jane Austen',
      tablePosition: { x: 20, y: 65 },
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
      readingBook: 'The Secret History',
      tablePosition: { x: 48, y: 72 },
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
      tablePosition: { x: 75, y: 60 },
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
  nylibrary: [
    {
      id: 'r4',
      name: 'Theodore_P',
      avatarColor: '#7C7960',
      readingBook: 'Crime and Punishment',
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
      id: 'r5',
      name: 'Clara_O',
      avatarColor: '#A08670',
      readingBook: 'The Picture of Dorian Gray',
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
      name: 'James_A',
      avatarColor: '#443223',
      readingBook: 'Walden by Thoreau',
      tablePosition: { x: 80, y: 70 },
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
  jazzclub: [
    {
      id: 'r7',
      name: 'Miles_B',
      avatarColor: '#755151',
      readingBook: 'Norwegian Wood by Murakami',
      tablePosition: { x: 28, y: 64 },
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
      id: 'r8',
      name: 'Sora_L',
      avatarColor: '#44422D',
      readingBook: 'The Bell Jar by Sylvia Plath',
      tablePosition: { x: 68, y: 66 },
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
  const [activeRoomId, setActiveRoomId] = useState<'cottagecore' | 'nylibrary' | 'jazzclub'>('cottagecore');
  const [quietMode, setQuietMode] = useState<boolean>(false);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sound levels
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 0.5,
    fireplace: 0.4,
    murmur: 0.3,
    vinyl: 0.3,
    piano: 0.3,
  });

  const [activeTracks, setActiveTracks] = useState<{ [key: string]: boolean }>({
    rain: false,
    fireplace: false,
    murmur: false,
    vinyl: false,
    piano: false,
  });

  // Emote state
  const [readers, setReaders] = useState<CafeReader[]>(INITIAL_READERS[activeRoomId]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; text: string; time: string }>>([
    { user: 'Eleanor_V', text: 'The storm outside is incredible. Page 142 is breaking my heart.', time: '21:04' },
    { user: 'Julian_M', text: 'Has anyone finished Chapter 5 yet?', time: '21:08' },
  ]);

  const activeRoom = ROOMS.find(r => r.id === activeRoomId) || ROOMS[0];

  // Stop sounds on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAll();
    };
  }, []);

  // Update room readers with fellow poets + authenticated user
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

  const toggleTrack = (trackName: string) => {
    const isPlaying = activeTracks[trackName];
    if (isPlaying) {
      soundEngine.stopTrack(trackName);
      setActiveTracks({ ...activeTracks, [trackName]: false });
    } else {
      const vol = volumes[trackName] ?? 0.5;
      if (trackName === 'rain') soundEngine.startRain(vol);
      if (trackName === 'fireplace') soundEngine.startFireplace(vol);
      if (trackName === 'murmur') soundEngine.startCafeMurmur(vol);
      if (trackName === 'vinyl') soundEngine.startVinyl(vol);
      if (trackName === 'piano') soundEngine.startPiano(vol);
      setActiveTracks({ ...activeTracks, [trackName]: true });
    }
  };

  const handleVolumeChange = (trackName: string, vol: number) => {
    setVolumes({ ...volumes, [trackName]: vol });
    if (activeTracks[trackName]) {
      soundEngine.setTrackVolume(trackName, vol);
    }
  };

  const toggleMasterMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const triggerEmote = (emoteIcon: string) => {
    // Add emote to our user (r1)
    setReaders(prev =>
      prev.map(r => (r.id === 'r1' ? { ...r, currentEmote: emoteIcon } : r))
    );
    setTimeout(() => {
      setReaders(prev =>
        prev.map(r => (r.id === 'r1' ? { ...r, currentEmote: undefined } : r))
      );
    }, 2500);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { user: 'You', text: chatInput.trim(), time }]);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
      {/* Top Banner & Room Selector */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-2 border-[#443223] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 starburst-badge mb-2">
            <Coffee className="w-3.5 h-3.5 text-[#FFF9F3]" />
            <span>VIRTUAL CO-PRESENCE SANCTUARY</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#443223]">
            The Candlelit Reading Lounge
          </h1>
          <p className="font-typewriter text-xs sm:text-sm text-[#72583E]">
            Sit beside fellow bibliophiles in quiet focus. Ambient hearth audio, whisper presence, and tea.
          </p>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`px-3.5 py-1.5 rounded font-typewriter text-xs font-bold transition-all border-2 flex items-center gap-2 ${
                activeRoomId === room.id
                  ? 'bg-[#755151] text-[#FFF9F3] border-[#443223] shadow-[2px_2px_0px_#443223]'
                  : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670] hover:bg-[#DBC4A5]'
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
            className="w-full h-[460px] sm:h-[520px] rounded-lg border-3 border-[#443223] shadow-[5px_5px_0px_#443223] relative overflow-hidden bg-cover bg-center select-none"
            style={{ backgroundImage: `url(${activeRoom.bgUrl})` }}
          >
            {/* Atmospheric Tint Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            {/* Room Title Header inside canvas */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <div className="px-3 py-1 bg-[#2E2116]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-[#DBC4A5] backdrop-blur-sm">
                <span>ROOM: {activeRoom.title.toUpperCase()}</span>
              </div>
              <div className="px-2.5 py-1 bg-[#2E2116]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-green-400 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span>{activeRoom.readersCount} READERS ONLINE</span>
              </div>
            </div>

            {/* Quiet Mode Indicator */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setQuietMode(!quietMode)}
                className="px-3 py-1 bg-[#2E2116]/90 border border-[#DBC4A5]/50 rounded text-xs font-typewriter text-[#FFF9F3] flex items-center gap-1.5 backdrop-blur-sm hover:bg-[#443223]"
              >
                {quietMode ? <EyeOff className="w-3.5 h-3.5 text-yellow-400" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{quietMode ? 'Quiet Mode (Chat Hidden)' : 'Quiet Mode: Off'}</span>
              </button>
            </div>

            {/* Seated Readers with Pixel-Style Avatars & Now Reading Badges */}
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
                      animate={{ scale: 1.2, y: -25 }}
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
                      ? 'border-[#DBC4A5] bg-[#755151]/90 ring-2 ring-[#DBC4A5] shadow-[0px_4px_12px_rgba(219,196,165,0.4)]'
                      : 'border-[#443223] bg-[#1C1815]/85'
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
                <div className="mt-1.5 bg-[#1C1815]/90 border border-[#DBC4A5]/60 px-2 py-0.5 rounded text-center shadow-md max-w-[150px]">
                  <span className="font-typewriter text-[11px] font-bold text-[#FFF9F3] block truncate">
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
              <div className="flex items-center gap-2 bg-[#1C1815]/90 border border-[#DBC4A5]/40 p-1.5 rounded-lg backdrop-blur-md">
                <span className="text-[10px] font-typewriter uppercase tracking-wider text-[#DBC4A5] pl-2 hidden sm:inline">
                  QUICK EMOTE:
                </span>
                <button
                  onClick={() => triggerEmote('👋')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base"
                  title="Wave"
                >
                  👋
                </button>
                <button
                  onClick={() => triggerEmote('☕')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base"
                  title="Sip Tea"
                >
                  ☕
                </button>
                <button
                  onClick={() => triggerEmote('📖')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base"
                  title="Turn Page"
                >
                  📖
                </button>
                <button
                  onClick={() => triggerEmote('🕯️')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base"
                  title="Light Candle"
                >
                  🕯️
                </button>
                <button
                  onClick={() => triggerEmote('💭')}
                  className="px-2 py-1 hover:bg-white/10 rounded text-base"
                  title="Deep Thought"
                >
                  💭
                </button>
              </div>

              {/* Master Mute Button */}
              <button
                onClick={toggleMasterMute}
                className={`p-2 rounded-lg border font-typewriter text-xs flex items-center gap-1.5 backdrop-blur-md ${
                  isMuted
                    ? 'bg-red-950/90 text-red-200 border-red-700'
                    : 'bg-[#1C1815]/90 text-[#FFF9F3] border-[#DBC4A5]/40 hover:bg-[#2E2116]'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
              </button>
            </div>
          </div>

          {/* Procedural Web Audio Ambient Sound Mixer Panel (PRD Section 6.8) */}
          <div className="catalog-card p-5 bg-[#FFFDF9] border-2 border-[#443223]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#A08670] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#755151]" />
                <h3 className="font-editorial text-base font-bold text-[#443223]">
                  Ambient Sound Mixer (Multi-Channel Web Audio)
                </h3>
              </div>
              <span className="font-typewriter text-[11px] text-[#72583E]">
                Zero Autoplay · Royalty-Free CC0 Procedural Synthesizer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {/* Rain */}
              <div className="p-3 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <CloudRain className="w-5 h-5 text-blue-700 mb-1" />
                <span className="font-typewriter text-xs font-bold text-[#443223] mb-2">Rainstorm</span>
                <button
                  onClick={() => toggleTrack('rain')}
                  className={`w-full py-1 rounded text-[11px] font-typewriter font-bold mb-2 border ${
                    activeTracks['rain']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {activeTracks['rain'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes['rain']}
                  onChange={e => handleVolumeChange('rain', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Fireplace */}
              <div className="p-3 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Flame className="w-5 h-5 text-amber-700 mb-1" />
                <span className="font-typewriter text-xs font-bold text-[#443223] mb-2">Fireplace</span>
                <button
                  onClick={() => toggleTrack('fireplace')}
                  className={`w-full py-1 rounded text-[11px] font-typewriter font-bold mb-2 border ${
                    activeTracks['fireplace']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {activeTracks['fireplace'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes['fireplace']}
                  onChange={e => handleVolumeChange('fireplace', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Murmur */}
              <div className="p-3 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Coffee className="w-5 h-5 text-[#72583E] mb-1" />
                <span className="font-typewriter text-xs font-bold text-[#443223] mb-2">Café Murmur</span>
                <button
                  onClick={() => toggleTrack('murmur')}
                  className={`w-full py-1 rounded text-[11px] font-typewriter font-bold mb-2 border ${
                    activeTracks['murmur']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {activeTracks['murmur'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes['murmur']}
                  onChange={e => handleVolumeChange('murmur', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Vinyl */}
              <div className="p-3 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Disc className="w-5 h-5 text-[#443223] mb-1" />
                <span className="font-typewriter text-xs font-bold text-[#443223] mb-2">Vinyl Crackle</span>
                <button
                  onClick={() => toggleTrack('vinyl')}
                  className={`w-full py-1 rounded text-[11px] font-typewriter font-bold mb-2 border ${
                    activeTracks['vinyl']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {activeTracks['vinyl'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes['vinyl']}
                  onChange={e => handleVolumeChange('vinyl', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>

              {/* Piano Chords */}
              <div className="p-3 bg-[#FFF9F3] border border-[#A08670] rounded flex flex-col items-center text-center">
                <Music className="w-5 h-5 text-[#755151] mb-1" />
                <span className="font-typewriter text-xs font-bold text-[#443223] mb-2">Soft Piano</span>
                <button
                  onClick={() => toggleTrack('piano')}
                  className={`w-full py-1 rounded text-[11px] font-typewriter font-bold mb-2 border ${
                    activeTracks['piano']
                      ? 'bg-[#755151] text-white border-[#443223]'
                      : 'bg-[#DBC4A5]/40 text-[#443223] border-[#A08670]'
                  }`}
                >
                  {activeTracks['piano'] ? 'Playing' : 'Off'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes['piano']}
                  onChange={e => handleVolumeChange('piano', parseFloat(e.target.value))}
                  className="w-full accent-[#755151]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quiet Mode Reading Thoughts & Chat */}
        <div className="lg:col-span-4">
          <div className="catalog-card p-5 bg-[#FFFDF9] border-2 border-[#443223] flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#A08670] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#755151]" />
                <h3 className="font-editorial text-base font-bold text-[#443223]">
                  Lounge Reflections
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
                  Quiet Reading Mode
                </h4>
                <p className="font-typewriter text-xs text-[#72583E] leading-relaxed">
                  Chat stream is hidden so you can immerse completely in your book. Your co-presence with other readers remains active.
                </p>
                <button
                  onClick={() => setQuietMode(false)}
                  className="btn-secondary text-xs py-1.5 px-3 mt-4"
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
                        msg.user === 'You'
                          ? 'bg-[#DBC4A5]/30 border-[#A08670] ml-4'
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
                  <button type="submit" className="btn-primary text-xs py-2 px-3">
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
