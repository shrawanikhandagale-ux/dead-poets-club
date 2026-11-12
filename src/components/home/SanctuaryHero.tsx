import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Coffee, Volume2, VolumeX, LampDesk } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { soundEngine, SoundState } from '../../lib/audioEngine';

/**
 * SanctuaryHero
 * Unified first-screen entrance for Dead Poets Club.
 * Combines painterly literary atmosphere, crisp pixel-art character presence,
 * and subtle interactive desk props without overwhelming text or clutter.
 */
export const SanctuaryHero: React.FC = () => {
  const { profile } = useAuth();
  const { isAfterHours } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lampLit, setLampLit] = useState(true);
  const [soundState, setSoundState] = useState<SoundState>(soundEngine.getState());

  useEffect(() => {
    return soundEngine.subscribe(setSoundState);
  }, []);

  // Lightweight atmospheric rain & drifting dust motes canvas (respects prefers-reduced-motion)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 640);
    let height = (canvas.height = canvas.offsetHeight || 420);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 640;
      height = canvas.height = canvas.offsetHeight || 420;
    };
    window.addEventListener('resize', handleResize);

    const drops = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 10 + Math.random() * 14,
      speed: 2.8 + Math.random() * 2.2,
    }));

    const motes = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.25,
      alpha: 0.25 + Math.random() * 0.45,
    }));

    let lastTick = 0;
    const render = (ts: number) => {
      animId = requestAnimationFrame(render);
      // Throttle to ~30fps for calm atmosphere and minimal CPU
      if (ts - lastTick < 32) return;
      lastTick = ts;

      ctx.clearRect(0, 0, width, height);

      // Rain streaks visible inside window region (approx center-right pane)
      ctx.strokeStyle = isAfterHours ? 'rgba(186, 210, 235, 0.24)' : 'rgba(235, 226, 212, 0.35)';
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= 0.45;
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * width;
        }
      }

      // Warm candlelit dust motes
      if (lampLit) {
        for (const m of motes) {
          ctx.fillStyle = `rgba(232, 184, 120, ${m.alpha})`;
          ctx.fillRect(Math.round(m.x), Math.round(m.y), Math.ceil(m.r), Math.ceil(m.r));
          m.x += m.vx;
          m.y += m.vy;
          if (m.y < 0) m.y = height;
          if (m.x < 0) m.x = width;
          if (m.x > width) m.x = 0;
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isAfterHours, lampLit]);

  const handleToggleLamp = () => {
    soundEngine.playClick();
    setLampLit(prev => !prev);
  };

  const handleToggleRainAudio = () => {
    soundEngine.playClick();
    if (soundState.isPlaying) {
      soundEngine.togglePlayPause();
    } else {
      soundEngine.playRoomPreset('athenaeum');
    }
  };

  return (
    <section
      aria-label="Welcome to Dead Poets Club"
      className="relative overflow-hidden bg-[#1D1510] text-[#F5ECE0] border-b-4 border-[#332216]"
    >
      {/* Atmospheric Multi-Stop Room Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isAfterHours
            ? 'radial-gradient(circle at 72% 38%, rgba(228, 168, 83, 0.16), rgba(22, 33, 51, 0.6) 45%, #110D0A 90%)'
            : 'radial-gradient(circle at 72% 38%, rgba(228, 168, 83, 0.22), rgba(56, 68, 52, 0.35) 48%, #1E1510 92%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 sm:pt-12 lg:pt-14 pb-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-end">
          {/* LEFT / EDITORIAL ANCHOR */}
          <div className="lg:col-span-6 pb-8 lg:pb-16 space-y-5">
            <div className="space-y-2">
              <h1 className="type-hero text-[#FAF3E8]">
                DEAD POETS{' '}
                <span className="italic text-[#E4A853]">CLUB</span>
              </h1>
              <p className="font-editorial italic text-xl sm:text-2xl text-[#E4A853]">
                Read a little, linger a lot.
              </p>
            </div>

            <p className="font-sans text-base sm:text-lg text-[#DFC9AA] max-w-md leading-relaxed">
              Someone left the library light on. Might as well stay.
            </p>

            {/* Maximum 2 Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <NavLink
                to="/cafe"
                onClick={() => soundEngine.playClick()}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded bg-[#7A4248] hover:bg-[#8E4F56] text-[#FAF3E8] border-2 border-[#E4A853]/70 shadow-[3px_3px_0px_#0D0907] font-sans font-semibold text-sm transition-transform hover:-translate-y-0.5 text-decoration-none"
              >
                <Coffee className="w-4 h-4 text-[#E4A853]" />
                <span>Enter the Cafeteria</span>
              </NavLink>

              <NavLink
                to="/library"
                onClick={() => soundEngine.playClick()}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded bg-[#2B2019]/90 hover:bg-[#3A2B22] text-[#F5ECE0] border-2 border-[#7C5C40] shadow-[3px_3px_0px_#0D0907] font-sans font-semibold text-sm transition-transform hover:-translate-y-0.5 text-decoration-none"
              >
                <BookOpen className="w-4 h-4 text-[#DFC9AA]" />
                <span>Browse the Stacks</span>
              </NavLink>
            </div>
          </div>

          {/* RIGHT / ILLUSTRATED PIXEL-ART STUDY SCENE */}
          <div className="lg:col-span-6 relative flex flex-col justify-end">
            <div
              className="relative w-full h-[270px] sm:h-[340px] lg:h-[420px] rounded-t-xl border-2 border-b-0 border-[#543B27] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.45)]"
              style={{
                background: isAfterHours ? '#101826' : '#242D3C',
              }}
            >
              {/* 1. PAINTERLY RAINY WINDOW + DISTANT SILHOUETTES (SVG Backdrop) */}
              <svg
                viewBox="0 0 640 420"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isAfterHours ? '#0D1524' : '#263547'} />
                    <stop offset="100%" stopColor={isAfterHours ? '#1B273A' : '#43525A'} />
                  </linearGradient>
                  <radialGradient id="lampHalo" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#F5BA62" stopOpacity={lampLit ? '0.45' : '0'} />
                    <stop offset="60%" stopColor="#D6873B" stopOpacity={lampLit ? '0.14' : '0'} />
                    <stop offset="100%" stopColor="#D6873B" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Wall interior */}
                <rect x="0" y="0" width="640" height="420" fill="#231913" />
                {/* Timber wainscot */}
                <rect x="0" y="290" width="640" height="130" fill="#1A120D" />
                <rect x="0" y="288" width="640" height="4" fill="#463122" />

                {/* Left Bookshelf Silhouette */}
                <g opacity="0.92">
                  <rect x="18" y="36" width="132" height="270" fill="#17100B" stroke="#3E2B1C" strokeWidth="3" />
                  <rect x="22" y="102" width="124" height="6" fill="#4A3423" />
                  <rect x="22" y="176" width="124" height="6" fill="#4A3423" />
                  <rect x="22" y="250" width="124" height="6" fill="#4A3423" />
                  {/* Pixel book spines */}
                  <rect x="30" y="54" width="12" height="48" fill="#6E3E44" />
                  <rect x="44" y="60" width="10" height="42" fill="#3A4435" />
                  <rect x="56" y="50" width="14" height="52" fill="#7D5C3E" />
                  <rect x="74" y="62" width="11" height="40" fill="#2A3A4A" />
                  <rect x="88" y="56" width="13" height="46" fill="#8C4E55" />
                  <rect x="108" y="64" width="16" height="38" fill="#5A412C" />

                  <rect x="32" y="128" width="14" height="48" fill="#4A3423" />
                  <rect x="48" y="120" width="11" height="56" fill="#6E7056" />
                  <rect x="62" y="132" width="13" height="44" fill="#6E3E44" />
                  <rect x="78" y="126" width="10" height="50" fill="#A07F5C" />
                  <rect x="92" y="136" width="20" height="40" fill="#322319" />

                  <rect x="30" y="200" width="13" height="50" fill="#3A4435" />
                  <rect x="46" y="206" width="11" height="44" fill="#7D5C3E" />
                  <rect x="60" y="196" width="15" height="54" fill="#633138" />
                  <rect x="80" y="208" width="12" height="42" fill="#4E5847" />
                </g>

                {/* Right Bookshelf Silhouette */}
                <g opacity="0.9">
                  <rect x="498" y="46" width="126" height="260" fill="#17100B" stroke="#3E2B1C" strokeWidth="3" />
                  <rect x="502" y="116" width="118" height="6" fill="#4A3423" />
                  <rect x="502" y="192" width="118" height="6" fill="#4A3423" />
                  <rect x="512" y="68" width="13" height="48" fill="#7D5C3E" />
                  <rect x="528" y="74" width="10" height="42" fill="#6E3E44" />
                  <rect x="542" y="64" width="14" height="52" fill="#384434" />
                  <rect x="562" y="76" width="12" height="40" fill="#543B27" />
                  <rect x="514" y="142" width="14" height="50" fill="#2A3A4A" />
                  <rect x="532" y="148" width="12" height="44" fill="#8C4E55" />
                  <rect x="548" y="138" width="13" height="54" fill="#747258" />
                </g>

                {/* Tall Arched Window */}
                <g>
                  <path
                    d="M180 288 L180 120 Q180 32 324 32 Q468 32 468 120 L468 288 Z"
                    fill="url(#skyGrad)"
                  />
                  {/* Distant rooftops & moon / streetlight */}
                  <circle cx="395" cy="96" r="18" fill={isAfterHours ? '#F3DFB8' : '#E8D8B8'} opacity="0.75" />
                  <path
                    d="M180 288 L180 225 L218 205 L254 222 L292 192 L338 214 L388 188 L434 212 L468 198 L468 288 Z"
                    fill="#111822"
                    opacity="0.85"
                  />
                  {/* Distant glowing café/apartment windows */}
                  <rect x="228" y="232" width="8" height="10" fill="#E4A853" opacity="0.65" />
                  <rect x="298" y="218" width="7" height="9" fill="#E4A853" opacity="0.55" />
                  <rect x="394" y="210" width="9" height="11" fill="#E4A853" opacity="0.7" />
                  <rect x="436" y="228" width="8" height="10" fill="#E4A853" opacity="0.5" />

                  {/* Window Mullions */}
                  <path
                    d="M180 288 L180 120 Q180 32 324 32 Q468 32 468 120 L468 288 Z"
                    fill="none"
                    stroke="#3B2A1E"
                    strokeWidth="10"
                  />
                  <line x1="324" y1="34" x2="324" y2="288" stroke="#3B2A1E" strokeWidth="6" />
                  <line x1="180" y1="150" x2="468" y2="150" stroke="#3B2A1E" strokeWidth="6" />
                  <line x1="180" y1="220" x2="468" y2="220" stroke="#3B2A1E" strokeWidth="5" />
                  {/* Window sill */}
                  <rect x="166" y="284" width="316" height="10" fill="#4E3726" />

                  {/* Swaying potted ivy on left sill */}
                  <g className="animate-foliage-sway" style={{ transformOrigin: '198px 284px' }}>
                    <rect x="188" y="266" width="20" height="18" fill="#6E3E44" stroke="#1B1410" strokeWidth="1.5" />
                    <path d="M192 266 Q184 250 176 242 M198 266 Q196 244 190 236 M204 266 Q214 252 218 242" stroke="#4D6644" strokeWidth="2.5" fill="none" />
                    <circle cx="176" cy="242" r="3" fill="#6E8B60" />
                    <circle cx="190" cy="236" r="3.5" fill="#5D7B51" />
                    <circle cx="218" cy="242" r="3" fill="#6E8B60" />
                  </g>

                  {/* Pixel Cat silhouette resting on right sill */}
                  <g transform="translate(414, 250)">
                    <rect x="6" y="14" width="22" height="20" rx="2" fill="#18120E" />
                    <rect x="10" y="6" width="14" height="10" fill="#18120E" />
                    <polygon points="10,6 10,0 15,6" fill="#18120E" />
                    <polygon points="24,6 24,0 19,6" fill="#18120E" />
                    {/* Blinking amber eyes */}
                    <rect x="13" y="9" width="2" height="2" fill="#E4A853" className="animate-candle-flicker" />
                    <rect x="19" y="9" width="2" height="2" fill="#E4A853" className="animate-candle-flicker" />
                    {/* Curled tail */}
                    <rect x="26" y="28" width="10" height="4" rx="2" fill="#18120E" />
                  </g>

                  {/* Brass Candle on Desk Edge */}
                  <g transform="translate(116, 260)">
                    <rect x="2" y="22" width="12" height="4" fill="#B58947" />
                    <rect x="5" y="10" width="6" height="12" fill="#EFE4D2" />
                    {lampLit && (
                      <g className="animate-candle-flicker">
                        <ellipse cx="8" cy="6" rx="3" ry="5" fill="#E4A853" />
                        <ellipse cx="8" cy="7" rx="1.5" ry="3" fill="#FFF7DE" />
                      </g>
                    )}
                  </g>
                </g>

                {/* Warm Lamp Light Halo */}
                <circle
                  cx="215"
                  cy="240"
                  r="175"
                  fill="url(#lampHalo)"
                  className={lampLit ? 'animate-candle-flicker' : ''}
                />
              </svg>

              {/* 2. RAIN & DUST MOTES CANVAS OVERLAY */}
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* 3. PIXEL-ART CHARACTER SEATED AT THE STUDY DESK */}
              <div className="absolute bottom-[54px] sm:bottom-[62px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="relative">
                  <PixelAvatar
                    config={profile?.avatar_config}
                    viewMode="seated"
                    customWidth={112}
                    animateIdle={true}
                    className="sm:hidden"
                  />
                  <PixelAvatar
                    config={profile?.avatar_config}
                    viewMode="seated"
                    customWidth={142}
                    animateIdle={true}
                    className="hidden sm:inline-flex"
                  />
                </div>
              </div>

              {/* 4. FOREGROUND WOODEN DESK & INTERACTIVE PROPS */}
              <div className="absolute bottom-0 inset-x-0 h-[66px] sm:h-[74px] bg-gradient-to-b from-[#66462E] via-[#4D3421] to-[#322014] border-t-4 border-[#8A6243] z-20 flex items-center justify-between px-5 sm:px-8 shadow-[inset_0_4px_10px_rgba(0,0,0,0.45)]">
                {/* Left Desk Prop: Interactive Green-Shaded Banker Lamp */}
                <button
                  type="button"
                  onClick={handleToggleLamp}
                  title={lampLit ? 'Dim desk lamp' : 'Light desk lamp'}
                  className="group flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#2A1D14]/80 hover:bg-[#3A281C] border border-[#8A6243]/60 text-xs font-sans font-medium text-[#F5ECE0] cursor-pointer transition-colors"
                >
                  <LampDesk className={`w-4 h-4 ${lampLit ? 'text-[#E4A853]' : 'text-[#9E856E]'}`} />
                  <span className="hidden sm:inline">{lampLit ? 'Lamp On' : 'Lamp Dim'}</span>
                </button>

                {/* Center: Open Book + Steaming Mug Pixel Props (Pure Visual) */}
                <div className="flex items-end gap-5 pointer-events-none" aria-hidden="true">
                  {/* Stacked books */}
                  <div className="hidden sm:flex flex-col items-start">
                    <div className="w-12 h-2.5 bg-[#6E3E44] border border-[#1B1410] rounded-xs" />
                    <div className="w-14 h-3 bg-[#384434] border border-[#1B1410] rounded-xs" />
                  </div>

                  {/* Open volume in front of character */}
                  <div className="flex items-center">
                    <div className="w-10 h-5 bg-[#F5ECE0] border-2 border-[#1B1410] rounded-l-sm -skew-y-3 shadow-sm" />
                    <div className="w-10 h-5 bg-[#EDE0CD] border-2 border-l-0 border-[#1B1410] rounded-r-sm skew-y-3 shadow-sm" />
                  </div>

                  {/* Steaming Mug */}
                  <div className="relative flex flex-col items-center">
                    <div className="flex gap-1 mb-0.5">
                      <span className="w-0.5 h-2 bg-[#DFC9AA]/70 rounded-full animate-steam-rise" />
                      <span
                        className="w-0.5 h-2.5 bg-[#DFC9AA]/60 rounded-full animate-steam-rise"
                        style={{ animationDelay: '0.8s' }}
                      />
                    </div>
                    <div className="w-4 h-4 bg-[#FAF3E8] border-2 border-[#1B1410] rounded-b-sm" />
                  </div>
                </div>

                {/* Right Desk Prop: Ambient Rain Audio Toggle */}
                <button
                  type="button"
                  onClick={handleToggleRainAudio}
                  title={soundState.isPlaying ? 'Pause ambient sound' : 'Listen to the rain'}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#2A1D14]/80 hover:bg-[#3A281C] border border-[#8A6243]/60 text-xs font-sans font-medium text-[#F5ECE0] cursor-pointer transition-colors"
                >
                  {soundState.isPlaying && !soundState.isMuted ? (
                    <Volume2 className="w-4 h-4 text-[#E4A853]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#9E856E]" />
                  )}
                  <span className="hidden sm:inline">
                    {soundState.isPlaying ? 'Rain Playing' : 'Hear Rain'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Aged-Timber Sill Transition into the Bookshelf Section */}
      <div className="h-3.5 w-full bg-gradient-to-b from-[#6B4A31] to-[#3B281A] border-t border-[#9C7453]/60 shadow-inner" />
    </section>
  );
};

