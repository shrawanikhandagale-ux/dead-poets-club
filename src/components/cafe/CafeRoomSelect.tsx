import React from 'react';
import { NavLink } from 'react-router-dom';
import { CafeRoomDefinition, CafeRoomId } from './cafeTypes';
import { CAFE_ROOMS } from './cafeRooms';
import { WalkableRoomBackdrop } from './CafeSceneryPixel';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../lib/audioEngine';
import { Coffee, Sparkles, Volume2, ArrowRight, Palette, Info } from 'lucide-react';

interface CafeRoomSelectProps {
  onEnterRoom: (roomId: CafeRoomId) => void;
  activeTimerSeconds: number;
}

export const CafeRoomSelect: React.FC<CafeRoomSelectProps> = ({
  onEnterRoom,
  activeTimerSeconds,
}) => {
  const { user, profile } = useAuth();
  const rooms = Object.values(CAFE_ROOMS);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#B59C84]/60 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6E3E44] font-medium">
            <Coffee className="w-4 h-4" />
            <span>The Literary Cafeteria</span>
          </div>
          <h1 className="type-page-title text-[#2E2118]">
            Choose a room to disappear into.
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#684F38] max-w-2xl leading-relaxed">
            Walk around with <span className="font-mono font-medium">WASD</span> or arrow keys, inspect the furniture, claim a chair, and settle into first-person study mode.
          </p>
        </div>

        {/* Character Preview & Customize Shortcut */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FCF7EE] border-2 border-[#2E2118] shadow-[3px_3px_0px_#2E2118]">
          <div className="w-11 h-14 rounded bg-[#1B1410] border border-[#7C5C40] flex items-center justify-center overflow-hidden">
            <PixelAvatar config={profile?.avatar_config} size="sm" viewMode="full" />
          </div>
          <div className="min-w-0">
            <span className="font-sans text-sm font-semibold text-[#2E2118] block truncate">
              {user ? profile?.display_name || user.displayName : 'Guest Wanderer'}
            </span>
            <NavLink
              to="/character-creator"
              className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[#6E3E44] hover:underline mt-0.5"
            >
              <Palette className="w-3 h-3" />
              <span>Dress your character</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Honest Prototype Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-md bg-[#EFE2CF] border border-[#B59C84] font-sans text-xs text-[#58432D]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#6E3E44] flex-shrink-0" />
          <span>
            <strong>Local Sanctuary Mode:</strong> Other readers inside each room are local demo residents while live multiplayer co-presence is in development.
          </span>
        </div>
        {activeTimerSeconds > 0 && (
          <span className="font-mono font-medium text-[#6E3E44]">
            Focus timer still running ({Math.floor(activeTimerSeconds / 60)}m left)
          </span>
        )}
      </div>

      {/* 3 Room Doors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {rooms.map((room: CafeRoomDefinition) => (
          <article
            key={room.id}
            className="catalog-card overflow-hidden flex flex-col justify-between bg-[#FCF7EE]"
          >
            <div>
              {/* Live Pixel-Art Preview Window */}
              <div
                onClick={() => {
                  soundEngine.playChime(523.25);
                  onEnterRoom(room.id);
                }}
                className="relative h-52 w-full overflow-hidden border-b-2 border-[#2E2118] cursor-pointer group"
              >
                <WalkableRoomBackdrop room={room} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#140F0C]/85 border border-[#DFC9AA]/40 text-[10px] font-mono text-[#FAF3E8]">
                  <Sparkles className="w-3 h-3 text-[#E4A853]" />
                  <span>{room.seats.length} Seats · {room.demoPatrons.length} Demo Residents</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#E4A853] block">
                      {room.subtitle}
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-[#FAF3E8] group-hover:text-[#E4A853] transition-colors">
                      {room.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Description & Tags */}
              <div className="p-5 space-y-4">
                <p className="font-sans text-sm text-[#58432D] leading-relaxed">
                  {room.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {room.atmosphereTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE2CF] border border-[#B59C84] font-sans text-[11px] font-medium text-[#2E2118]"
                    >
                      <Volume2 className="w-2.5 h-2.5 text-[#6E3E44]" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playChime(587.33);
                  onEnterRoom(room.id);
                }}
                className="btn-primary w-full justify-center text-xs py-2.5"
              >
                <span>Enter {room.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

