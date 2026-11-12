import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CafeRoomDefinition,
  DemoNpcPatron,
  RectBox,
  RoomInteractiveObject,
  RoomSeat,
  RoomWhisper,
} from './cafeTypes';
import { WalkableRoomBackdrop, CafeWeatherCanvas } from './CafeSceneryPixel';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { PixelSpeechBubble } from './PixelSpeechBubble';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../../lib/audioEngine';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, MessageSquare, Sparkles } from 'lucide-react';

interface CafeWalkableRoomProps {
  room: CafeRoomDefinition;
  quietMode: boolean;
  initialPosition?: { x: number; y: number };
  playerWhisper?: RoomWhisper | null;
  residentWhispers?: RoomWhisper[];
  mutedAuthorIds?: string[];
  onSitAtSeat: (seat: RoomSeat, playerPos: { x: number; y: number }) => void;
  onInspectObject: (obj: RoomInteractiveObject) => void;
}

const PLAYER_SPEED = 230; // px per second in 1000x600 space
const INTERACT_RADIUS = 88;
const PLAYER_HITBOX = { halfW: 20, halfH: 14 };

function overlapsObstacle(x: number, y: number, obstacles: RectBox[]): boolean {
  const px1 = x - PLAYER_HITBOX.halfW;
  const px2 = x + PLAYER_HITBOX.halfW;
  const py1 = y - PLAYER_HITBOX.halfH;
  const py2 = y + PLAYER_HITBOX.halfH;

  return obstacles.some(o => px1 < o.x + o.w && px2 > o.x && py1 < o.y + o.h && py2 > o.y);
}

export const CafeWalkableRoom: React.FC<CafeWalkableRoomProps> = ({
  room,
  quietMode,
  initialPosition,
  playerWhisper = null,
  residentWhispers = [],
  mutedAuthorIds = [],
  onSitAtSeat,
  onInspectObject,
}) => {
  const { user, profile } = useAuth();
  const stageRef = useRef<HTMLDivElement>(null);

  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(
    initialPosition || room.spawnPoint
  );
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number } | null>(null);
  const [activeThoughtIdx, setActiveThoughtIdx] = useState(0);

  // NPC live positions (supports gentle wandering between waypoints)
  const [npcState, setNpcState] = useState<
    Record<string, { x: number; y: number; facing: 'left' | 'right'; wpIndex: number }>
  >(() => {
    const map: Record<string, { x: number; y: number; facing: 'left' | 'right'; wpIndex: number }> = {};
    room.demoPatrons.forEach(p => {
      map[p.id] = { x: p.x, y: p.y, facing: p.facing, wpIndex: 0 };
    });
    return map;
  });

  // Reset position & NPCs when changing rooms
  useEffect(() => {
    setPlayerPos(initialPosition || room.spawnPoint);
    setTargetPoint(null);
    const map: Record<string, { x: number; y: number; facing: 'left' | 'right'; wpIndex: number }> = {};
    room.demoPatrons.forEach(p => {
      map[p.id] = { x: p.x, y: p.y, facing: p.facing, wpIndex: 0 };
    });
    setNpcState(map);
  }, [room.id]);

  // Cycle subtle NPC thoughts every 7s
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveThoughtIdx(prev => prev + 1);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  // Obstacles derived from colliding objects
  const obstacles: RectBox[] = useMemo(() => {
    return room.objects
      .filter(o => o.collides)
      .map(o => ({ x: o.x, y: o.y, w: o.w, h: o.h }));
  }, [room.objects]);

  // Keyboard tracking
  const keysPressed = useRef<Set<string>>(new Set());
  const virtualInput = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const playerRef = useRef(playerPos);
  playerRef.current = playerPos;
  const targetRef = useRef(targetPoint);
  targetRef.current = targetPoint;

  // Nearest interactable (Seat takes gentle priority if closer)
  const nearbyTarget = useMemo(() => {
    let bestSeat: { seat: RoomSeat; dist: number } | null = null;
    for (const s of room.seats) {
      const dist = Math.hypot(playerPos.x - s.x, playerPos.y - s.y);
      if (dist <= INTERACT_RADIUS && (!bestSeat || dist < bestSeat.dist)) {
        bestSeat = { seat: s, dist };
      }
    }
    if (bestSeat) {
      return { type: 'seat' as const, item: bestSeat.seat, dist: bestSeat.dist };
    }

    let bestObj: { obj: RoomInteractiveObject; dist: number } | null = null;
    for (const o of room.objects) {
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;
      const dist = Math.hypot(playerPos.x - cx, playerPos.y - cy);
      if (dist <= INTERACT_RADIUS + Math.max(o.w, o.h) * 0.35 && (!bestObj || dist < bestObj.dist)) {
        bestObj = { obj: o, dist };
      }
    }
    if (bestObj) {
      return { type: 'object' as const, item: bestObj.obj, dist: bestObj.dist };
    }

    return null;
  }, [playerPos, room.seats, room.objects]);

  const nearbyRef = useRef(nearbyTarget);
  nearbyRef.current = nearbyTarget;

  // Keyboard listeners (WASD / Arrows / E)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA' || activeEl === 'SELECT') return;

      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        keysPressed.current.add(k);
        setTargetPoint(null);
      } else if (k === 'e' || k === 'enter') {
        const near = nearbyRef.current;
        if (near?.type === 'seat') {
          e.preventDefault();
          soundEngine.playChime(659.25);
          onSitAtSeat(near.item, playerRef.current);
        } else if (near?.type === 'object') {
          e.preventDefault();
          soundEngine.playClick();
          onInspectObject(near.item);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onSitAtSeat, onInspectObject]);

  // Main movement + NPC gentle patrol loop
  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      let dx = virtualInput.current.dx;
      let dy = virtualInput.current.dy;
      const keys = keysPressed.current;

      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;

      if (dx === 0 && dy === 0 && targetRef.current) {
        const tx = targetRef.current.x - playerRef.current.x;
        const ty = targetRef.current.y - playerRef.current.y;
        const dist = Math.hypot(tx, ty);
        if (dist > 8) {
          dx = tx / dist;
          dy = ty / dist;
        } else {
          setTargetPoint(null);
        }
      }

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        const stepX = (dx / len) * PLAYER_SPEED * dt;
        const stepY = (dy / len) * PLAYER_SPEED * dt;

        if (dx < -0.1) setFacing('left');
        else if (dx > 0.1) setFacing('right');

        setIsWalking(true);

        const cur = playerRef.current;
        const nextX = Math.max(room.bounds.minX, Math.min(room.bounds.maxX, cur.x + stepX));
        const nextY = Math.max(room.bounds.minY, Math.min(room.bounds.maxY, cur.y + stepY));

        let resolvedX = cur.x;
        let resolvedY = cur.y;

        if (!overlapsObstacle(nextX, cur.y, obstacles)) {
          resolvedX = nextX;
        }
        if (!overlapsObstacle(resolvedX, nextY, obstacles)) {
          resolvedY = nextY;
        }

        if (resolvedX !== cur.x || resolvedY !== cur.y) {
          setPlayerPos({ x: resolvedX, y: resolvedY });
        }
      } else {
        setIsWalking(false);
      }

      // Gentle NPC wandering along waypoints (paused under reduced-motion)
      if (!reducedMotion) {
        setNpcState(prev => {
          let changed = false;
          const next = { ...prev };
          for (const npc of room.demoPatrons) {
            if (npc.activity !== 'wandering' || !npc.waypoints || npc.waypoints.length === 0) continue;
            const cur = prev[npc.id];
            if (!cur) continue;
            const wp = npc.waypoints[cur.wpIndex % npc.waypoints.length];
            const ndx = wp.x - cur.x;
            const ndy = wp.y - cur.y;
            const dist = Math.hypot(ndx, ndy);
            if (dist < 6) {
              next[npc.id] = { ...cur, wpIndex: (cur.wpIndex + 1) % npc.waypoints.length };
              changed = true;
            } else {
              const speed = 38 * dt;
              next[npc.id] = {
                ...cur,
                x: cur.x + (ndx / dist) * speed,
                y: cur.y + (ndy / dist) * speed,
                facing: ndx < -0.5 ? 'left' : ndx > 0.5 ? 'right' : cur.facing,
              };
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [room, obstacles]);

  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * 1000;
    const vy = ((e.clientY - rect.top) / rect.height) * 600;
    setTargetPoint({
      x: Math.max(room.bounds.minX, Math.min(room.bounds.maxX, vx)),
      y: Math.max(room.bounds.minY, Math.min(room.bounds.maxY, vy)),
    });
  };

  const setVirtualDir = (dx: number, dy: number) => {
    virtualInput.current = { dx, dy };
    if (dx !== 0 || dy !== 0) setTargetPoint(null);
  };

  return (
    <div className="space-y-3">
      {/* Playable 1000x600 Room Stage */}
      <div
        ref={stageRef}
        onClick={handleFloorClick}
        className="relative w-full aspect-[16/10] min-h-[360px] max-h-[620px] rounded-xl border-3 border-[#2E2118] shadow-[6px_6px_0px_#1B1410] overflow-hidden cursor-crosshair select-none bg-[#16100C]"
        role="application"
        aria-label={`${room.name} interactive room. Use WASD or Arrow keys to move, E to interact.`}
      >
        {/* Architectural Room Backdrop */}
        <WalkableRoomBackdrop room={room} />

        {/* Atmospheric Weather Canvas */}
        <CafeWeatherCanvas roomId={room.id} intensity="walk" />

        {/* Click-to-Walk Target Indicator */}
        {targetPoint && (
          <div
            className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-[#E4A853] bg-[#E4A853]/25 animate-ping pointer-events-none z-10"
            style={{
              left: `${(targetPoint.x / 1000) * 100}%`,
              top: `${(targetPoint.y / 600) * 100}%`,
            }}
          />
        )}

        {/* Interactive Furniture Props */}
        {room.objects.map(obj => {
          const isNear = nearbyTarget?.type === 'object' && nearbyTarget.item.id === obj.id;
          return (
            <button
              key={obj.id}
              type="button"
              onClick={e => {
                e.stopPropagation();
                soundEngine.playClick();
                onInspectObject(obj);
              }}
              style={{
                left: `${(obj.x / 1000) * 100}%`,
                top: `${(obj.y / 600) * 100}%`,
                width: `${(obj.w / 1000) * 100}%`,
                height: `${(obj.h / 600) * 100}%`,
                zIndex: Math.round(obj.y),
              }}
              title={`${obj.label} — Click or press E`}
              className={`absolute rounded transition-all cursor-pointer group ${
                isNear
                  ? 'ring-2 ring-[#E4A853] bg-[#E4A853]/10'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Render visual pixel table / manuscripts / planter for midground props */}
              {obj.kind === 'bookshelf' && obj.y > 220 && (
                <div className="w-full h-full rounded bg-[#4A3222] border-2 border-[#1B1410] shadow-lg flex items-center justify-around px-3">
                  <div className="w-5 h-5 rounded-full bg-[#3E6B52] border border-[#1B1410] shadow-[0_0_12px_rgba(232,172,86,0.65)]" />
                  <div className="w-7 h-5 bg-[#FAF3E8] border border-[#1B1410] rounded-xs" />
                  <div className="w-5 h-5 rounded-full bg-[#3E6B52] border border-[#1B1410] shadow-[0_0_12px_rgba(232,172,86,0.65)]" />
                </div>
              )}

              {obj.kind === 'plants' && obj.y > 220 && (
                <div className="w-full h-full rounded-full bg-[#243831]/90 border-2 border-[#4B6B5C] flex items-center justify-center shadow-inner">
                  <div className="w-10 h-10 rounded-full bg-[#3A6347] border border-[#1B1410] animate-foliage-sway" />
                </div>
              )}

              {obj.kind === 'manuscripts' && (
                <div className="w-full h-full rounded bg-[#3A2229] border-2 border-[#6E454E] flex items-center justify-center gap-2 shadow-lg px-2">
                  <div className="w-6 h-5 bg-[#F5ECE0] border border-[#1B1410] -rotate-6" />
                  <div className="w-6 h-5 bg-[#DFC9AA] border border-[#1B1410] rotate-12" />
                  <div className="w-2 h-3 bg-[#E4A853] rounded-full animate-candle-flicker" />
                </div>
              )}

              {/* Hover label */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#140F0C]/90 border border-[#E4A853]/60 text-[11px] font-sans font-medium text-[#FAF3E8] pointer-events-none">
                {obj.label}
              </span>
            </button>
          );
        })}

        {/* Available Seats */}
        {room.seats.map(seat => {
          const isNear = nearbyTarget?.type === 'seat' && nearbyTarget.item.id === seat.id;
          return (
            <button
              key={seat.id}
              type="button"
              onClick={e => {
                e.stopPropagation();
                soundEngine.playChime(659.25);
                onSitAtSeat(seat, playerPos);
              }}
              style={{
                left: `${(seat.x / 1000) * 100}%`,
                top: `${(seat.y / 600) * 100}%`,
                zIndex: Math.round(seat.y),
              }}
              title={`Sit at ${seat.label}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center"
            >
              {/* Pixel Chair / Desk Icon */}
              <div
                className={`w-11 h-10 rounded-md border-2 flex flex-col items-center justify-center transition-transform group-hover:scale-110 shadow-md ${
                  isNear
                    ? 'bg-[#6E3E44] border-[#E4A853] ring-2 ring-[#E4A853]/60 scale-110'
                    : 'bg-[#3D291D]/95 border-[#8A6243]'
                }`}
              >
                <div className="w-6 h-2 bg-[#8A6243] rounded-t-xs mb-0.5" />
                <div className="w-7 h-3 bg-[#5A3E2B] rounded-xs" />
              </div>

              <span
                className={`mt-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium whitespace-nowrap border transition-opacity ${
                  isNear
                    ? 'opacity-100 bg-[#140F0C] text-[#E4A853] border-[#E4A853]'
                    : 'opacity-0 group-hover:opacity-100 bg-[#140F0C]/90 text-[#FAF3E8] border-[#7C5C40]'
                }`}
              >
                {seat.label}
              </span>
            </button>
          );
        })}

        {/* Demo NPC Patrons */}
        {room.demoPatrons.map((npc: DemoNpcPatron, idx: number) => {
          const live = npcState[npc.id] || { x: npc.x, y: npc.y, facing: npc.facing };
          const residentWhisper = residentWhispers.find(
            w => w.authorId === npc.id && w.roomId === room.id
          );
          const bubbleText = residentWhisper?.text || npc.thoughts[(activeThoughtIdx + idx) % npc.thoughts.length];
          const isMuted = mutedAuthorIds.includes(npc.id);
          const tooCloseToPlayerBubble =
            !!playerWhisper && Math.hypot(live.x - playerPos.x, live.y - playerPos.y) < 165;
          const showBubble =
            !quietMode &&
            !isMuted &&
            !tooCloseToPlayerBubble &&
            (activeThoughtIdx + idx) % 2 === 0;

          return (
            <div
              key={npc.id}
              style={{
                left: `${(live.x / 1000) * 100}%`,
                top: `${(live.y / 600) * 100}%`,
                zIndex: showBubble ? Math.round(live.y) + 8 : Math.round(live.y),
              }}
              className="absolute -translate-x-1/2 -translate-y-3/4 flex flex-col items-center pointer-events-none"
            >
              <AnimatePresence>
                {showBubble && (
                  <div className="mb-1.5">
                    <PixelSpeechBubble
                      text={bubbleText}
                      isDemo={true}
                      compact={true}
                      maxWidthClass="max-w-[170px]"
                    />
                  </div>
                )}
              </AnimatePresence>

              <PixelAvatar
                config={npc.avatarConfig}
                viewMode={npc.activity === 'wandering' ? 'full' : 'seated'}
                customWidth={npc.activity === 'wandering' ? 42 : 46}
                facing={live.facing}
                isWalking={npc.activity === 'wandering'}
                animateIdle={npc.activity !== 'wandering'}
              />

              <div className="mt-0.5 px-2 py-0.5 rounded bg-[#140F0C]/85 border border-[#7C5C40]/60 text-[11px] font-sans font-medium text-[#DFC9AA] flex items-center gap-1 whitespace-nowrap">
                <span>{npc.name}</span>
                <span className="font-mono text-[9px] text-[#9E856E] uppercase">· Demo</span>
              </div>
            </div>
          );
        })}

        {/* Controllable Player Pixel Avatar */}
        <div
          style={{
            left: `${(playerPos.x / 1000) * 100}%`,
            top: `${(playerPos.y / 600) * 100}%`,
            zIndex: playerWhisper ? Math.round(playerPos.y) + 25 : Math.round(playerPos.y) + 1,
          }}
          className="absolute -translate-x-1/2 -translate-y-3/4 flex flex-col items-center pointer-events-none"
        >
          {/* Floating Room Whisper Speech Bubble above the reader's sprite */}
          <AnimatePresence>
            {playerWhisper && playerWhisper.roomId === room.id && (
              <div className="mb-1.5">
                <PixelSpeechBubble
                  text={playerWhisper.text}
                  isSelf={true}
                  maxWidthClass="max-w-[196px]"
                />
              </div>
            )}
          </AnimatePresence>

          {/* Ground shadow */}
          <div className="absolute bottom-3 w-8 h-2.5 rounded-full bg-black/45 blur-[1px]" />

          <PixelAvatar
            config={profile?.avatar_config}
            viewMode="full"
            customWidth={48}
            facing={facing}
            isWalking={isWalking}
            animateIdle={!isWalking}
          />

          <div className="px-2 py-0.5 rounded bg-[#6E3E44] border border-[#E4A853] text-[11px] font-sans font-semibold text-[#FAF3E8] shadow-sm whitespace-nowrap">
            {user ? `@${user.username}` : 'You'}
          </div>
        </div>

        {/* Contextual [E] Interaction Prompt */}
        {nearbyTarget && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#140F0C]/95 border-2 border-[#E4A853] text-[#FAF3E8] shadow-xl">
            <kbd className="px-2 py-0.5 rounded bg-[#E4A853] text-[#140F0C] font-mono text-xs font-semibold">
              E
            </kbd>
            <span className="font-mono text-xs">
              {nearbyTarget.type === 'seat'
                ? `Sit at ${nearbyTarget.item.label}`
                : `${nearbyTarget.item.promptText} (${nearbyTarget.item.label})`}
            </span>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (nearbyTarget.type === 'seat') {
                  soundEngine.playChime(659.25);
                  onSitAtSeat(nearbyTarget.item, playerPos);
                } else {
                  soundEngine.playClick();
                  onInspectObject(nearbyTarget.item);
                }
              }}
              className="ml-1 px-2.5 py-0.5 rounded bg-[#6E3E44] hover:bg-[#824B52] text-xs font-sans font-semibold cursor-pointer"
            >
              {nearbyTarget.type === 'seat' ? 'Sit' : 'Inspect'}
            </button>
          </div>
        )}

        {/* Mobile Touch D-Pad (shown on touch / smaller screens) */}
        <div
          onClick={e => e.stopPropagation()}
          className="md:hidden absolute bottom-3 right-3 z-30 grid grid-cols-3 gap-1 w-24 h-24 opacity-90"
        >
          <div />
          <button
            type="button"
            aria-label="Move up"
            onPointerDown={() => setVirtualDir(0, -1)}
            onPointerUp={() => setVirtualDir(0, 0)}
            onPointerLeave={() => setVirtualDir(0, 0)}
            className="rounded bg-[#140F0C]/85 border border-[#DFC9AA]/50 text-[#FAF3E8] flex items-center justify-center active:bg-[#6E3E44]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Move left"
            onPointerDown={() => setVirtualDir(-1, 0)}
            onPointerUp={() => setVirtualDir(0, 0)}
            onPointerLeave={() => setVirtualDir(0, 0)}
            className="rounded bg-[#140F0C]/85 border border-[#DFC9AA]/50 text-[#FAF3E8] flex items-center justify-center active:bg-[#6E3E44]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Move right"
            onPointerDown={() => setVirtualDir(1, 0)}
            onPointerUp={() => setVirtualDir(0, 0)}
            onPointerLeave={() => setVirtualDir(0, 0)}
            className="rounded bg-[#140F0C]/85 border border-[#DFC9AA]/50 text-[#FAF3E8] flex items-center justify-center active:bg-[#6E3E44]"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Move down"
            onPointerDown={() => setVirtualDir(0, 1)}
            onPointerUp={() => setVirtualDir(0, 0)}
            onPointerLeave={() => setVirtualDir(0, 0)}
            className="rounded bg-[#140F0C]/85 border border-[#DFC9AA]/50 text-[#FAF3E8] flex items-center justify-center active:bg-[#6E3E44]"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <div />
        </div>
      </div>

      {/* Quick Control Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-[#684F38]">
        <div className="flex flex-wrap items-center gap-3">
          <span>Move: <strong className="font-mono text-[11px]">WASD / Arrows</strong> or <strong className="font-medium">Click Floor</strong></span>
          <span>·</span>
          <span>Sit / Inspect: <strong className="font-mono text-[11px]">E</strong> or <strong className="font-medium">Click Seat</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#6E3E44]" />
          <span>{room.seats.length} seats available</span>
          <span aria-hidden="true">·</span>
          <BookOpen className="w-3.5 h-3.5 text-[#3A4435]" />
          <span>{room.demoPatrons.length} demo residents</span>
        </div>
      </div>
    </div>
  );
};

