import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Coffee,
  BookOpen,
  Users,
  MessageSquareQuote,
  Grid3X3,
  User,
  Feather,
  LogOut,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Sparkles,
  ScrollText,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { soundEngine, SoundState } from '../../lib/audioEngine';

export const SidebarNav: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  // Sound Engine global state sync
  const [soundState, setSoundState] = useState<SoundState>(soundEngine.getState());
  const [isAudioPanelExpanded, setIsAudioPanelExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe(state => {
      setSoundState(state);
    });
    return unsubscribe;
  }, []);

  // Primary destinations matching approved wireframe mockup order
  const primaryNavItems = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'Cafeteria', path: '/cafe', icon: Coffee },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'Community', path: '/clubhouse', icon: Users },
    { name: 'Reviews', path: '/library?tab=reviews', icon: MessageSquareQuote },
    { name: 'Crossword', path: '/crossword', icon: Grid3X3 },
    { name: 'Profile', path: user ? `/profile/${user.username}` : '/login', icon: User },
  ];

  // Secondary club quarters (preserved so no features are lost)
  const secondaryNavItems = [
    { name: 'Author Spotlight', path: '/authors', icon: Feather },
    { name: 'The Poem Jar', path: '/poems', icon: ScrollText },
    { name: 'Character Atelier', path: '/character-creator', icon: Sparkles },
    { name: 'My Shelves', path: '/shelves', icon: Bookmark },
  ];

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    soundEngine.togglePlayPause();
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    soundEngine.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundEngine.setMasterVolume(parseFloat(e.target.value));
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-[#1A1614] border-r border-[#382D24] z-40 text-[#FAF4EB] select-none p-5 justify-between shadow-[4px_0px_20px_rgba(0,0,0,0.35)] overflow-y-auto">
      <div>
        {/* Header Club Branding with Feather Motif */}
        <NavLink
          to="/"
          className="group flex items-center gap-3 pb-5 border-b border-[#382D24] cursor-pointer text-decoration-none"
        >
          <div className="w-10 h-10 rounded bg-[#58432D] border border-[#A08670] flex items-center justify-center shadow-[2px_2px_0px_#0D0B0A] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
            <Feather className="w-5 h-5 text-[#FAF4EB]" />
          </div>
          <div>
            <h1 className="font-editorial text-base tracking-wider font-bold text-[#FAF4EB] leading-tight">
              DEAD POETS CLUB
            </h1>
            <p className="text-[10px] font-typewriter text-[#DBC4A5]/70 tracking-widest uppercase">
              Sanctuary for Book Lovers
            </p>
          </div>
        </NavLink>

        {/* Primary Clean Navigation Links (Mockup layout without noisy badge labels) */}
        <nav className="mt-5 flex flex-col gap-1.5">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            // Handle active state including query params for reviews
            const isReviews = item.name === 'Reviews';
            const isActive = isReviews
              ? location.pathname === '/library' && location.search.includes('tab=reviews')
              : location.pathname === item.path && (!location.search.includes('tab=reviews') || item.path !== '/library');

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => soundEngine.playClick()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded font-typewriter text-xs font-semibold transition-all text-decoration-none border ${
                  isActive
                    ? 'bg-[#72583E] text-[#FFF9F3] border-[#A08670] shadow-[2px_2px_0px_#0D0B0A] font-bold'
                    : 'text-[#E0D5C7] border-transparent hover:bg-[#2A231E] hover:text-[#FAF4EB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#FAF4EB]' : 'text-[#C4A482]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {/* Subtle indicator for active route */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FAF4EB] shadow-[0_0_6px_#FAF4EB]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Delicate Separator */}
        <div className="my-4 border-t border-[#382D24]/80 flex items-center justify-between pt-3">
          <span className="text-[9px] font-typewriter uppercase tracking-widest text-[#A08670]">
            Club Quarters
          </span>
        </div>

        {/* Secondary Preserved Quarters */}
        <div className="flex flex-col gap-1">
          {secondaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => soundEngine.playClick()}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded font-typewriter text-[11px] transition-all text-decoration-none ${
                  isActive
                    ? 'text-[#FAF4EB] bg-[#2A231E] font-bold'
                    : 'text-[#A08670] hover:text-[#E0D5C7] hover:bg-[#2A231E]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#C4A482]/80" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: Real Audio Engine Controller + Identity Card */}
      <div className="border-t border-[#382D24] pt-4 mt-4 space-y-3">
        {/* Ambient Sound Dock & Controls */}
        <div className="p-3 bg-[#231D19] border border-[#382D24] rounded-md shadow-inner text-xs font-typewriter">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSoundToggle}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all border ${
                  soundState.isPlaying
                    ? 'bg-[#72583E] text-[#FFF9F3] border-[#A08670]'
                    : 'bg-[#1A1614] text-[#C4A482] border-[#382D24] hover:border-[#A08670]'
                }`}
                title={soundState.isPlaying ? 'Pause Ambient Sound' : 'Play Ambient Soundscape'}
                aria-label="Toggle Ambient Audio"
              >
                {soundState.isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
              <div>
                <span className="font-bold text-[#FAF4EB] block text-[11px] leading-tight">
                  {soundState.isPlaying ? 'Ambient Audio On' : 'Ambient Hearth'}
                </span>
                <span className="text-[9px] text-[#A08670] block capitalize">
                  {soundState.currentRoom?.replace(/_/g, ' ') || 'Calm reading'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleMuteToggle}
                className="p-1 text-[#C4A482] hover:text-[#FAF4EB] transition-colors"
                title={soundState.isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Mute toggle"
              >
                {soundState.isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-green-400" />
                )}
              </button>
              <button
                onClick={() => setIsAudioPanelExpanded(!isAudioPanelExpanded)}
                className="p-1 text-[#A08670] hover:text-[#FAF4EB] transition-colors"
                title="Sound Mixer Sliders"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master Volume Slider */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] text-[#A08670] font-mono">VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundState.masterVolume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-[#1A1614] rounded-lg appearance-none cursor-pointer accent-[#C4A482]"
              aria-label="Master Ambient Volume"
            />
          </div>

          {/* Expanded sound presets drawer */}
          {isAudioPanelExpanded && (
            <div className="mt-2.5 pt-2 border-t border-[#382D24] space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-[#A08670] block">
                Atmosphere Presets:
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => soundEngine.playRoomPreset('gazing_out')}
                  className="px-1.5 py-1 rounded text-[9px] bg-[#1A1614] border border-[#382D24] hover:border-[#A08670] text-[#DBC4A5] truncate text-center"
                >
                  Gazing Out
                </button>
                <button
                  onClick={() => soundEngine.playRoomPreset('writers_den')}
                  className="px-1.5 py-1 rounded text-[9px] bg-[#1A1614] border border-[#382D24] hover:border-[#A08670] text-[#DBC4A5] truncate text-center"
                >
                  Writers' Den
                </button>
                <button
                  onClick={() => soundEngine.playRoomPreset('quiet_reading')}
                  className="px-1.5 py-1 rounded text-[9px] bg-[#1A1614] border border-[#382D24] hover:border-[#A08670] text-[#DBC4A5] truncate text-center"
                >
                  Quiet Room
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Member Identity or Sign In */}
        <div>
          {user ? (
            <div className="p-2.5 bg-[#231D19] border border-[#382D24] rounded flex items-center justify-between">
              <NavLink
                to={`/profile/${user.username}`}
                onClick={() => soundEngine.playClick()}
                className="flex items-center gap-2 text-decoration-none group truncate"
              >
                <div className="w-8 h-8 rounded border border-[#A08670] bg-[#1A1614] flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  <PixelAvatar
                    config={profile?.avatar_config}
                    size="xs"
                    viewMode="bust"
                  />
                  <span className="w-2 h-2 rounded-full bg-green-500 border border-[#1A1614] absolute bottom-0 right-0" />
                </div>
                <div className="truncate max-w-[130px]">
                  <span className="font-typewriter text-xs font-bold text-[#FAF4EB] block truncate group-hover:text-[#DBC4A5]">
                    {profile?.display_name || user.username}
                  </span>
                  <span className="text-[9px] font-mono text-[#A08670]">
                    * {profile?.avatar_config?.mbti || 'Reader'}
                  </span>
                </div>
              </NavLink>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1 hover:bg-[#1A1614] rounded text-[#A08670] hover:text-red-400 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={() => soundEngine.playClick()}
              className="btn-primary w-full justify-center text-xs py-2 uppercase text-decoration-none"
            >
              <span>Sign In / Join</span>
            </NavLink>
          )}
        </div>
      </div>
    </aside>
  );
};
