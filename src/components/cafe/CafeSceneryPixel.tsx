import React, { useEffect, useRef } from 'react';
import { CafeRoomDefinition, DemoNpcPatron } from './cafeTypes';
import { PixelAvatar } from '../avatar/PixelAvatar';

interface WeatherCanvasProps {
  roomId: CafeRoomDefinition['id'];
  lampLit?: boolean;
  intensity?: 'walk' | 'first_person';
}

/**
 * Lightweight, reduced-motion-aware atmospheric particle canvas
 * (Rain streaks, glass droplets, hearth embers, nocturnal dust motes)
 */
export const CafeWeatherCanvas: React.FC<WeatherCanvasProps> = ({
  roomId,
  lampLit = true,
  intensity = 'walk',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 960);
    let height = (canvas.height = canvas.offsetHeight || 560);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 960;
      height = canvas.height = canvas.offsetHeight || 560;
    };
    window.addEventListener('resize', onResize);

    const dropCount = roomId === 'conservatory' ? (intensity === 'first_person' ? 85 : 65) : 36;
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 10 + Math.random() * 18,
      speed: roomId === 'conservatory' ? 5 + Math.random() * 4 : 3.2 + Math.random() * 2.5,
    }));

    // Glass surface droplets for Conservatory & First-Person windows
    const glassDroplets = Array.from({ length: roomId === 'conservatory' ? 22 : 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      speed: 0.25 + Math.random() * 0.55,
      size: 2 + Math.random() * 1.5,
    }));

    // Warm dust motes or hearth embers
    const motes = Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: roomId === 'athenaeum' ? -0.3 - Math.random() * 0.35 : -0.15 - Math.random() * 0.2,
      alpha: 0.25 + Math.random() * 0.45,
      size: 1.5 + Math.random() * 1.5,
    }));

    let lastTick = 0;
    const draw = (ts: number) => {
      animId = requestAnimationFrame(draw);
      if (ts - lastTick < 32) return;
      lastTick = ts;

      ctx.clearRect(0, 0, width, height);

      // Rain outside/glass zone
      ctx.strokeStyle =
        roomId === 'conservatory'
          ? 'rgba(195, 226, 238, 0.34)'
          : roomId === 'nocturne'
            ? 'rgba(162, 188, 224, 0.2)'
            : 'rgba(196, 214, 232, 0.24)';
      ctx.lineWidth = 1.2;

      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2.5, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= 0.7;
        if (d.y > height * (intensity === 'walk' ? 0.42 : 0.85)) {
          d.y = -d.len;
          d.x = Math.random() * (width + 60);
        }
      }

      // Slow trickling droplets on glass
      ctx.fillStyle = 'rgba(218, 238, 248, 0.35)';
      for (const g of glassDroplets) {
        ctx.fillRect(Math.round(g.x), Math.round(g.y), Math.ceil(g.size), Math.ceil(g.size * 1.5));
        g.y += g.speed;
        if (g.y > height * 0.65) {
          g.y = 0;
          g.x = Math.random() * width;
        }
      }

      // Warm embers & dust motes
      if (lampLit) {
        for (const m of motes) {
          ctx.fillStyle =
            roomId === 'athenaeum'
              ? `rgba(244, 178, 92, ${m.alpha})`
              : roomId === 'nocturne'
                ? `rgba(240, 200, 130, ${m.alpha * 0.85})`
                : `rgba(235, 216, 164, ${m.alpha * 0.65})`;
          ctx.fillRect(Math.round(m.x), Math.round(m.y), Math.ceil(m.size), Math.ceil(m.size));
          m.x += m.vx;
          m.y += m.vy;
          if (m.y < 0) m.y = height * 0.9;
          if (m.x < 0) m.x = width;
          if (m.x > width) m.x = 0;
        }
      }
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [roomId, lampLit, intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};

/**
 * 2.5D Walkable Room Architectural Backdrop (1000x600 coordinate space)
 */
export const WalkableRoomBackdrop: React.FC<{ room: CafeRoomDefinition }> = ({ room }) => {
  const { id, palette } = room;

  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pixel-crisp select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={palette.lampGlow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.lampGlow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.windowSkyTop} />
          <stop offset="100%" stopColor={palette.windowSkyBottom} />
        </linearGradient>
      </defs>

      {/* Back Wall */}
      <rect x="0" y="0" width="1000" height="205" fill={palette.wallTop} />
      <rect x="0" y="165" width="1000" height="40" fill={palette.wallBottom} />
      <rect x="0" y="201" width="1000" height="6" fill={palette.trim} />

      {/* Floor */}
      <rect x="0" y="205" width="1000" height="395" fill={palette.floorBase} />

      {/* Floor Texture Pattern */}
      {id === 'athenaeum' && (
        <g opacity="0.5">
          {[245, 295, 345, 395, 445, 495, 545].map(y => (
            <rect key={y} x="0" y={y} width="1000" height="2" fill={palette.floorAccent} />
          ))}
          {/* Oxblood Woven Library Rug */}
          <rect x="275" y="265" width="450" height="230" fill="#4A2126" stroke="#8C5D43" strokeWidth="4" />
          <rect x="295" y="285" width="410" height="190" fill="none" stroke="#C9985A" strokeWidth="2" strokeDasharray="8 6" />
        </g>
      )}

      {id === 'conservatory' && (
        <g>
          {/* Wet slate floor tiles */}
          {[250, 310, 370, 430, 490, 550].map(y => (
            <rect key={y} x="0" y={y} width="1000" height="2" fill={palette.floorAccent} />
          ))}
          {[120, 240, 360, 480, 600, 720, 840].map(x => (
            <rect key={x} x={x} y="205" width="2" height="395" fill={palette.floorAccent} opacity="0.65" />
          ))}
          {/* Rain puddles & wet reflections */}
          <ellipse cx="290" cy="390" rx="46" ry="16" fill="#4A6B78" opacity="0.35" />
          <ellipse cx="290" cy="390" rx="28" ry="8" fill="#89B3C4" opacity="0.22" />
          <ellipse cx="640" cy="485" rx="58" ry="18" fill="#4A6B78" opacity="0.32" />
          <ellipse cx="640" cy="485" rx="30" ry="9" fill="#E8B878" opacity="0.2" />
        </g>
      )}

      {id === 'nocturne' && (
        <g>
          {[250, 300, 350, 400, 450, 500, 550].map(y => (
            <rect key={y} x="0" y={y} width="1000" height="2" fill={palette.floorAccent} />
          ))}
          {/* Midnight Velvet Runner */}
          <rect x="305" y="275" width="390" height="210" fill="#2A1724" stroke="#6E454E" strokeWidth="3" />
          <rect x="320" y="290" width="360" height="180" fill="none" stroke="#B5825A" strokeWidth="1.5" opacity="0.5" />
        </g>
      )}

      {/* ================================================= */}
      {/* ROOM-SPECIFIC ARCHITECTURAL WALL & PROP ART       */}
      {/* ================================================= */}

      {id === 'athenaeum' && (
        <g>
          {/* Overhead Heavy Arched Dark Oak Vaulting & Ceiling Beams */}
          <path
            d="M0 0 Q500 48 1000 0 L1000 26 Q500 74 0 26 Z"
            fill="#2A1B12"
            stroke="#160E08"
            strokeWidth="3"
          />
          {/* Vertical Timber Corbel Brackets */}
          <polygon points="150,22 175,22 170,55 155,55" fill="#20140D" stroke="#160E08" strokeWidth="1.5" />
          <polygon points="320,24 345,24 340,62 325,62" fill="#20140D" stroke="#160E08" strokeWidth="1.5" />
          <polygon points="655,24 680,24 675,62 660,62" fill="#20140D" stroke="#160E08" strokeWidth="1.5" />
          <polygon points="825,22 850,22 845,55 830,55" fill="#20140D" stroke="#160E08" strokeWidth="1.5" />

          {/* Double-Height Towering Oak Bookshelf (Floor to Roofline) */}
          <rect x="35" y="18" width="235" height="186" fill="#18100B" stroke="#4D3524" strokeWidth="5" />
          {/* Upper Gallery Balustrade Rail */}
          <rect x="30" y="80" width="245" height="8" fill="#5A3E2B" stroke="#241710" strokeWidth="1.5" />
          {[42, 68, 94, 120, 146, 172, 198, 224, 250].map(rx => (
            <line key={`bal-${rx}`} x1={rx} y1="80" x2={rx} y2="92" stroke="#3D291C" strokeWidth="2.5" />
          ))}

          {/* Shelf Dividers */}
          {[50, 118, 158].map(sy => (
            <rect key={sy} x="40" y={sy} width="225" height="6" fill="#5A3E2B" />
          ))}
          {/* Pixel Books Spines (Tier 1 - Upper Gallery) */}
          {[46, 62, 78, 96, 112, 128, 146, 164, 182, 202, 222, 242].map((bx, i) => (
            <rect
              key={`b1-${bx}`}
              x={bx}
              y={24 + (i % 3) * 3}
              width="12"
              height={26 - (i % 3) * 3}
              fill={['#6E3E44', '#3A4435', '#8C6239', '#2B3A4A', '#7A4950'][i % 5]}
            />
          ))}
          {/* Pixel Books (Tier 2) */}
          {[48, 66, 86, 104, 124, 142, 164, 186, 210, 234].map((bx, i) => (
            <rect
              key={`b2-${bx}`}
              x={bx}
              y={88 + (i % 2) * 5}
              width="14"
              height={30 - (i % 2) * 5}
              fill={['#3A4435', '#6E3E44', '#5A3E2B', '#A0784E'][i % 4]}
            />
          ))}
          {/* Pixel Books (Tier 3) */}
          {[50, 72, 92, 116, 136, 158, 178, 204, 228].map((bx, i) => (
            <rect
              key={`b3-${bx}`}
              x={bx}
              y={124 + (i % 3) * 3}
              width="15"
              height={34 - (i % 3) * 3}
              fill={['#8C4E55', '#2A3A4A', '#6E7056', '#7A5438'][i % 4]}
            />
          ))}
          {/* Pixel Books (Tier 4 - Lower Folios) */}
          {[52, 76, 100, 126, 152, 180, 208, 236].map((bx, i) => (
            <rect
              key={`b4-${bx}`}
              x={bx}
              y={164}
              width="18"
              height="40"
              fill={['#44322D', '#2B3A4A', '#543B27', '#6E3E44'][i % 4]}
            />
          ))}

          {/* Leaning Brass-Rung Library Ladder */}
          <line x1="228" y1="28" x2="252" y2="204" stroke="#8C6A3C" strokeWidth="3" />
          <line x1="242" y1="28" x2="266" y2="204" stroke="#8C6A3C" strokeWidth="3" />
          {[55, 85, 115, 145, 175].map(ly => (
            <line key={`lad-${ly}`} x1={224 + (ly - 28) * 0.136} y1={ly} x2={238 + (ly - 28) * 0.136} y2={ly} stroke="#C9985A" strokeWidth="2" />
          ))}

          {/* Center Grand Multipaned Rainy Arched Window */}
          <path
            d="M325 204 L325 76 Q325 18 490 18 Q655 18 655 76 L655 204 Z"
            fill={`url(#sky-${id})`}
            stroke="#4A3423"
            strokeWidth="9"
          />
          {/* Inner Stone Arch Chamfer */}
          <path
            d="M334 204 L334 78 Q334 27 490 27 Q646 27 646 78 L646 204"
            fill="none"
            stroke="#2E1C12"
            strokeWidth="3"
          />
          {/* Window Mullions */}
          <line x1="490" y1="20" x2="490" y2="204" stroke="#4A3423" strokeWidth="6" />
          <line x1="410" y1="52" x2="410" y2="204" stroke="#4A3423" strokeWidth="4" />
          <line x1="570" y1="52" x2="570" y2="204" stroke="#4A3423" strokeWidth="4" />
          <line x1="325" y1="110" x2="655" y2="110" stroke="#4A3423" strokeWidth="5" />
          <line x1="325" y1="160" x2="655" y2="160" stroke="#4A3423" strokeWidth="4" />
          {/* Distant warm streetlights and gas lanterns outside */}
          <circle cx="395" cy="155" r="5" fill="#E8AC56" opacity="0.75" />
          <circle cx="490" cy="172" r="4" fill="#F0B865" opacity="0.6" />
          <circle cx="585" cy="150" r="5" fill="#E8AC56" opacity="0.7" />

          {/* Right Carved Stone & Brick Hearth */}
          <rect x="715" y="52" width="205" height="152" fill="#2E2622" stroke="#4D4039" strokeWidth="4" />
          {/* Carved Classical Stone Mantlepiece with Relief Cornice */}
          <rect x="698" y="42" width="238" height="14" fill="#52433B" stroke="#221A15" strokeWidth="2" />
          <rect x="708" y="56" width="218" height="6" fill="#3D322C" />
          {/* Firebox Arched Brick Interior */}
          <path d="M752 204 L752 120 Q752 98 817 98 Q882 98 882 120 L882 204 Z" fill="#140D09" stroke="#3D291D" strokeWidth="3" />
          {/* Brick Joint Lines */}
          <line x1="758" y1="135" x2="876" y2="135" stroke="#261A12" strokeWidth="1.5" />
          <line x1="758" y1="165" x2="876" y2="165" stroke="#261A12" strokeWidth="1.5" />
          {/* Burning Logs & Animated Flames */}
          <rect x="780" y="196" width="75" height="8" rx="2" fill="#3A1C0E" stroke="#1E0D06" strokeWidth="1.5" />
          <g className="animate-candle-flicker">
            <polygon points="785,200 808,148 830,200" fill="#D9682B" />
            <polygon points="808,200 830,136 852,200" fill="#F09B38" />
            <polygon points="818,200 830,165 842,200" fill="#FDE08D" />
          </g>
          {/* Radial Fire Glow */}
          <circle cx="817" cy="170" r="150" fill={`url(#glow-${id})`} />

          {/* Iconic Emerald Green Banker Lamps */}
          {/* Lamp 1: Desk Lamp on Reading Table (Center-North Table) */}
          <g transform="translate(485, 316)">
            {/* Brass Stand & Stem */}
            <rect x="0" y="0" width="4" height="18" fill="#C9985A" stroke="#7A5626" strokeWidth="0.8" />
            <ellipse cx="2" cy="18" rx="8" ry="3" fill="#C9985A" stroke="#7A5626" strokeWidth="0.8" />
            {/* Curved Emerald Green Glass Shade */}
            <path d="M-12 0 Q2 -6 16 0 L14 6 Q2 3 -10 6 Z" fill="#1C6B43" stroke="#0E3B24" strokeWidth="1" />
            <path d="M-10 1 Q2 -4 14 1 L13 3 Q2 0 -9 3 Z" fill="#34A86A" opacity="0.85" />
            {/* Warm downward task light cone */}
            <polygon points="-8,6 12,6 30,36 -26,36" fill="#F5D078" opacity="0.25" />
          </g>

          {/* Lamp 2: Banker Lamp at Window Desk */}
          <g transform="translate(195, 275)">
            <rect x="0" y="0" width="3" height="16" fill="#C9985A" stroke="#7A5626" strokeWidth="0.75" />
            <ellipse cx="1.5" cy="16" rx="6" ry="2.5" fill="#C9985A" stroke="#7A5626" strokeWidth="0.75" />
            <path d="M-9 0 Q1.5 -5 12 0 L10 5 Q1.5 2 -7 5 Z" fill="#1C6B43" stroke="#0E3B24" strokeWidth="0.8" />
            <polygon points="-6,5 9,5 22,28 -19,28" fill="#F5D078" opacity="0.22" />
          </g>

          {/* Noticeboard on left wall */}
          <rect x="75" y="405" width="96" height="68" fill="#4D3423" stroke="#241812" strokeWidth="3" />
          <rect x="87" y="416" width="26" height="22" fill="#F5ECE0" />
          <rect x="122" y="420" width="32" height="24" fill="#DFC9AA" />
          <rect x="98" y="445" width="30" height="18" fill="#FAF3E8" />
        </g>
      )}

      {id === 'conservatory' && (
        <g>
          {/* Sloped Glass-and-Iron Greenhouse Skylight Truss (Pitched Roof Silhouette) */}
          {/* Iron Truss Gable Apex at (500, 10) sloping down to (0, 110) and (1000, 110) */}
          <polygon
            points="0,110 500,10 1000,110 1000,204 0,204"
            fill={`url(#sky-${id})`}
            stroke="#263A32"
            strokeWidth="6"
          />

          {/* Sloping Iron Rafters */}
          <line x1="500" y1="10" x2="0" y2="110" stroke="#263A32" strokeWidth="6" />
          <line x1="500" y1="10" x2="1000" y2="110" stroke="#263A32" strokeWidth="6" />
          <line x1="500" y1="10" x2="500" y2="204" stroke="#263A32" strokeWidth="5" />

          {/* Angled Glass Struts */}
          {[120, 240, 360].map(x => (
            <g key={`l-strut-${x}`}>
              <line x1={x} y1={110 - (x * 0.2)} x2={x} y2="204" stroke="#2E483E" strokeWidth="4" />
              <line x1={x} y1={110 - (x * 0.2)} x2={500} y2="10" stroke="#22362E" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            </g>
          ))}
          {[640, 760, 880].map(x => (
            <g key={`r-strut-${x}`}>
              <line x1={x} y1={10 + ((x - 500) * 0.2)} x2={x} y2="204" stroke="#2E483E" strokeWidth="4" />
              <line x1={x} y1={10 + ((x - 500) * 0.2)} x2={500} y2="10" stroke="#22362E" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
            </g>
          ))}
          {/* Horizontal Glass Purlins */}
          <line x1="120" y1="86" x2="880" y2="86" stroke="#2E483E" strokeWidth="4" />
          <line x1="40" y1="145" x2="960" y2="145" stroke="#2E483E" strokeWidth="4" />

          {/* Misty Dark Rain-Drenched Garden Tree Silhouettes Outside */}
          <path
            d="M0 204 L0 145 Q80 115 160 148 Q250 100 350 145 Q440 92 530 140 Q630 96 730 146 Q840 105 920 142 L1000 135 L1000 204 Z"
            fill="#0F1B1F"
            opacity="0.88"
          />

          {/* Cascading Trailing Ferns & Ivy Hanging from Truss Framework */}
          {[160, 350, 650, 840].map((px, i) => (
            <g key={`fern-${px}`} className="animate-foliage-sway">
              {/* Hanging Brass Planter Chains */}
              <line x1={px} y1={i % 2 === 0 ? 55 : 42} x2={px - 14} y2={i % 2 === 0 ? 90 : 75} stroke="#8C744A" strokeWidth="1.5" />
              <line x1={px} y1={i % 2 === 0 ? 55 : 42} x2={px + 14} y2={i % 2 === 0 ? 90 : 75} stroke="#8C744A" strokeWidth="1.5" />
              {/* Planter Pot */}
              <polygon
                points={`${px - 16},${i % 2 === 0 ? 90 : 75} ${px + 16},${i % 2 === 0 ? 90 : 75} ${px + 11},${i % 2 === 0 ? 104 : 89} ${px - 11},${i % 2 === 0 ? 104 : 89}`}
                fill="#C9985A"
                stroke="#543C1E"
                strokeWidth="1.5"
              />
              {/* Trailing Fern Fronds & Hanging Ivy Vines */}
              <circle cx={px} cy={i % 2 === 0 ? 86 : 72} r={18} fill="#244D37" />
              <circle cx={px - 10} cy={i % 2 === 0 ? 92 : 78} r={14} fill="#35694B" />
              <circle cx={px + 10} cy={i % 2 === 0 ? 92 : 78} r={15} fill="#4E8C66" />
              {/* Long dangling vines */}
              <path
                d={`M${px - 8} ${i % 2 === 0 ? 95 : 82} Q${px - 14} ${i % 2 === 0 ? 125 : 110} ${px - 6} ${i % 2 === 0 ? 148 : 132}`}
                stroke="#2F6647"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d={`M${px + 6} ${i % 2 === 0 ? 95 : 82} Q${px + 12} ${i % 2 === 0 ? 130 : 115} ${px + 4} ${i % 2 === 0 ? 156 : 140}`}
                stroke="#437E5A"
                strokeWidth="2"
                fill="none"
              />
            </g>
          ))}

          {/* Hanging Industrial Edison Bulb Cages */}
          {[250, 500, 750].map(lx => (
            <g key={lx}>
              <line x1={lx} y1="0" x2={lx} y2="52" stroke="#1E2A24" strokeWidth="2" />
              <rect x={lx - 6} y="48" width="12" height="14" rx="2" fill="none" stroke="#68543B" strokeWidth="1.5" />
              <circle cx={lx} cy="55" r="5" fill="#F5C77E" className="animate-candle-flicker" />
              <circle cx={lx} cy="55" r="55" fill={`url(#glow-${id})`} />
            </g>
          ))}

          {/* Right Tea & Brass Kettle Bar */}
          <rect x="805" y="128" width="140" height="75" fill="#2E3F38" stroke="#5C7567" strokeWidth="3" />
          <rect x="835" y="102" width="32" height="26" fill="#C9985A" stroke="#1E140E" strokeWidth="2" />
          <rect x="884" y="110" width="18" height="18" fill="#FAF3E8" />
        </g>
      )}

      {id === 'nocturne' && (
        <g>
          {/* Asymmetrical Midnight Salon: Sweeping Theatrical Velvet Drapery Swags */}
          {/* Top Velvet Swags with Deep Shadow Folds */}
          <path
            d="M0 0 Q250 68 500 24 Q750 68 1000 0 L1000 48 Q750 98 500 52 Q250 98 0 48 Z"
            fill="#3B1425"
            stroke="#1E0A13"
            strokeWidth="3"
          />
          {/* Velvet Fold Highlights */}
          <path
            d="M0 12 Q250 78 500 36 Q750 78 1000 12"
            fill="none"
            stroke="#632641"
            strokeWidth="3"
            opacity="0.8"
          />
          {/* Golden Bullion Tassel Fringe */}
          <path
            d="M0 48 Q250 98 500 52 Q750 98 1000 48"
            fill="none"
            stroke="#C9985A"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />

          {/* Side Cascade Drapes with Braided Tiebacks */}
          {/* Left Curtain Stack */}
          <path
            d="M0 0 L65 0 L58 115 Q75 125 54 135 L62 204 L0 204 Z"
            fill="#30101E"
            stroke="#1E0A13"
            strokeWidth="3"
          />
          <line x1="45" y1="120" x2="68" y2="128" stroke="#C9985A" strokeWidth="3" />

          {/* Right Curtain Stack */}
          <path
            d="M1000 0 L935 0 L942 115 Q925 125 946 135 L938 204 L1000 204 Z"
            fill="#30101E"
            stroke="#1E0A13"
            strokeWidth="3"
          />
          <line x1="955" y1="120" x2="932" y2="128" stroke="#C9985A" strokeWidth="3" />

          {/* Carved Walnut Boiserie Wainscot Panelling on Back Wall */}
          <rect x="70" y="145" width="860" height="58" fill="#24151C" stroke="#3D2330" strokeWidth="3" />
          {[90, 240, 420, 600, 770].map(px => (
            <rect
              key={`pan-${px}`}
              x={px}
              y="152"
              width="135"
              height="44"
              fill="#1C1016"
              stroke="#4D2E3E"
              strokeWidth="2"
              rx="2"
            />
          ))}

          {/* Left Midnight Poetry Cabinet */}
          <rect x="75" y="48" width="165" height="152" fill="#171015" stroke="#4D323A" strokeWidth="4" />
          {[88, 128].map(sy => (
            <rect key={sy} x="80" y={sy} width="155" height="5" fill="#4D323A" />
          ))}
          {[88, 106, 126, 146, 166, 186, 208].map((bx, i) => (
            <rect
              key={`nb-${bx}`}
              x={bx}
              y={58 + (i % 3) * 3}
              width="13"
              height={30 - (i % 3) * 3}
              fill={['#7A4958', '#233242', '#6E543B', '#3A4435'][i % 4]}
            />
          ))}
          {/* Beeswax Taper Candle on shelf */}
          <rect x="105" y="110" width="6" height="18" fill="#FAF3E8" />
          <circle cx="108" cy="106" r="4" fill="#F2B25C" className="animate-candle-flicker" />
          <circle cx="108" cy="106" r="45" fill={`url(#glow-${id})`} />

          {/* Moonlit Tall Casement Window (Midnight Sky, Crescent Moon & Constellations) */}
          <rect x="330" y="24" width="330" height="172" fill={`url(#sky-${id})`} stroke="#3B2A36" strokeWidth="7" />
          <line x1="495" y1="24" x2="495" y2="196" stroke="#3B2A36" strokeWidth="5" />
          <line x1="330" y1="110" x2="660" y2="110" stroke="#3B2A36" strokeWidth="4" />
          {/* Silver-Gilded Crescent Moon */}
          <circle cx="585" cy="68" r="18" fill="#F2DFB4" />
          <circle cx="593" cy="64" r="16" fill={palette.windowSkyTop} />
          {/* Twinkling Starfield Constellation */}
          <rect x="365" y="48" width="3" height="3" fill="#F2DFB4" opacity="0.85" />
          <rect x="425" y="76" width="2" height="2" fill="#F2DFB4" opacity="0.75" />
          <rect x="525" y="44" width="3" height="3" fill="#F2DFB4" opacity="0.85" />
          <rect x="620" y="88" width="2" height="2" fill="#F2DFB4" opacity="0.65" />
          <circle cx="460" cy="52" r="1.5" fill="#FFF8EB" />
          <circle cx="395" cy="85" r="1.2" fill="#FFF8EB" />

          {/* Right Mahogany Turntable Console & Candelabra */}
          <rect x="745" y="118" width="165" height="84" fill="#2A191F" stroke="#6E454E" strokeWidth="3" />
          {/* Vinyl Platter with Tone Arm */}
          <rect x="765" y="94" width="56" height="26" fill="#4D323A" stroke="#161015" strokeWidth="2" />
          <ellipse cx="793" cy="107" rx="19" ry="8" fill="#111113" />
          <ellipse cx="793" cy="107" rx="5" ry="2.5" fill="#7A4958" />
          <line x1="815" y1="98" x2="800" y2="108" stroke="#C9985A" strokeWidth="2" />

          {/* Multi-Armed Brass Candelabra */}
          <rect x="865" y="90" width="5" height="28" fill="#C9985A" stroke="#7A5626" strokeWidth="1" />
          <ellipse cx="867.5" cy="118" rx="10" ry="3.5" fill="#C9985A" stroke="#7A5626" strokeWidth="1" />
          {/* Left Branch */}
          <path d="M867 104 Q852 104 852 92" stroke="#C9985A" strokeWidth="2" fill="none" />
          <rect x="850" y="82" width="4" height="10" fill="#FAF3E8" />
          <circle cx="852" cy="78" r="3.5" fill="#F2B25C" className="animate-candle-flicker" />
          {/* Right Branch */}
          <path d="M867 104 Q882 104 882 92" stroke="#C9985A" strokeWidth="2" fill="none" />
          <rect x="880" y="82" width="4" height="10" fill="#FAF3E8" />
          <circle cx="882" cy="78" r="3.5" fill="#F2B25C" className="animate-candle-flicker" />
          {/* Center Candle */}
          <rect x="865" y="74" width="5" height="16" fill="#FAF3E8" />
          <circle cx="867.5" cy="70" r="4.5" fill="#F2B25C" className="animate-candle-flicker" />
          {/* Atmospheric Glow */}
          <circle cx="867" cy="85" r="75" fill={`url(#glow-${id})`} />
        </g>
      )}
    </svg>
  );
};

/**
 * First-Person Seated Window & Interior View (looking out from your seat into the room)
 */
export const FirstPersonRoomBackdrop: React.FC<{
  room: CafeRoomDefinition;
  lampLit: boolean;
  demoPatrons: DemoNpcPatron[];
}> = ({ room, lampLit, demoPatrons }) => {
  const { id, palette } = room;

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background: `linear-gradient(180deg, ${palette.windowSkyTop} 0%, ${palette.wallBottom} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pixel-crisp"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`fp-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.windowSkyTop} />
            <stop offset="100%" stopColor={palette.windowSkyBottom} />
          </linearGradient>
          <radialGradient id={`fp-lamp-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={palette.lampGlow} stopOpacity={lampLit ? '0.42' : '0.06'} />
            <stop offset="100%" stopColor={palette.lampGlow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Room Walls */}
        <rect x="0" y="0" width="1200" height="640" fill={palette.wallTop} />

        {/* Grand Center Window View (First-Person Sightline) */}
        {id === 'athenaeum' && (
          <g>
            {/* Overhead Heavy Arched Oak Vaulting */}
            <path
              d="M0 0 Q600 68 1200 0 L1200 42 Q600 112 0 42 Z"
              fill="#2A1B12"
              stroke="#160E08"
              strokeWidth="4"
            />

            {/* Left & Right Towering Double-Height Bookshelves framing the window */}
            <rect x="0" y="0" width="235" height="520" fill="#17100B" stroke="#4D3524" strokeWidth="6" />
            {[110, 220, 330, 440].map(y => (
              <rect key={y} x="12" y={y} width="210" height="10" fill="#5A3E2B" />
            ))}
            {[28, 52, 76, 102, 128, 152, 178].map((bx, i) => (
              <rect
                key={`fp-l-${bx}`}
                x={bx}
                y={135 + (i % 3) * 8}
                width="18"
                height={85 - (i % 3) * 8}
                fill={['#6E3E44', '#3A4435', '#8C6239', '#2B3A4A'][i % 4]}
              />
            ))}
            {[32, 60, 86, 114, 140, 170].map((bx, i) => (
              <rect
                key={`fp-l2-${bx}`}
                x={bx}
                y={245 + (i % 2) * 10}
                width="20"
                height={85 - (i % 2) * 10}
                fill={['#3A4435', '#7A4950', '#5A3E2B', '#A0784E'][i % 4]}
              />
            ))}

            {/* Right Bookshelf & Distant Hearth Glow */}
            <rect x="965" y="0" width="235" height="520" fill="#17100B" stroke="#4D3524" strokeWidth="6" />
            {[110, 220, 330, 440].map(y => (
              <rect key={y} x="978" y={y} width="210" height="10" fill="#5A3E2B" />
            ))}
            {[990, 1018, 1046, 1072, 1102, 1130].map((bx, i) => (
              <rect
                key={`fp-r-${bx}`}
                x={bx}
                y={135 + (i % 3) * 8}
                width="20"
                height={85 - (i % 3) * 8}
                fill={['#2B3A4A', '#6E3E44', '#8C6239', '#3A4435'][i % 4]}
              />
            ))}

            {/* Arched Library Window */}
            <path
              d="M275 495 L275 185 Q275 35 600 35 Q925 35 925 185 L925 495 Z"
              fill={`url(#fp-sky-${id})`}
              stroke="#463020"
              strokeWidth="14"
            />
            {/* Distant rooftops + glowing street lamps */}
            <path
              d="M275 495 L275 385 L360 355 L440 390 L535 340 L650 375 L765 335 L860 372 L925 352 L925 495 Z"
              fill="#101722"
            />
            <circle cx="465" cy="395" r="8" fill="#E8AC56" opacity="0.7" />
            <circle cx="725" cy="378" r="8" fill="#E8AC56" opacity="0.65" />
            <line x1="600" y1="35" x2="600" y2="495" stroke="#463020" strokeWidth="10" />
            <line x1="275" y1="255" x2="925" y2="255" stroke="#463020" strokeWidth="8" />
            <line x1="275" y1="375" x2="925" y2="375" stroke="#463020" strokeWidth="6" />

            {/* Foreground Reading Desk Banker Lamp */}
            <g transform="translate(195, 410)">
              <rect x="0" y="0" width="8" height="42" fill="#C9985A" stroke="#7A5626" strokeWidth="1.5" />
              <ellipse cx="4" cy="42" rx="20" ry="7" fill="#C9985A" stroke="#7A5626" strokeWidth="1.5" />
              <path d="M-28 0 Q4 -14 36 0 L32 14 Q4 7 -24 14 Z" fill="#1C6B43" stroke="#0E3B24" strokeWidth="2" />
              <path d="M-24 2 Q4 -10 32 2 L30 6 Q4 0 -22 6 Z" fill="#34A86A" opacity="0.9" />
              <polygon points="-20,14 28,14 75,95 -65,95" fill="#F5D078" opacity="0.32" />
            </g>
          </g>
        )}

        {id === 'conservatory' && (
          <g>
            {/* Sloped Glass-and-Iron Greenhouse Skylight Truss */}
            <polygon
              points="60,135 600,20 1140,135 1140,495 60,495"
              fill={`url(#fp-sky-${id})`}
              stroke="#263A32"
              strokeWidth="12"
            />
            {/* Sloped iron rafters */}
            <line x1="600" y1="20" x2="60" y2="135" stroke="#263A32" strokeWidth="12" />
            <line x1="600" y1="20" x2="1140" y2="135" stroke="#263A32" strokeWidth="12" />
            <line x1="600" y1="20" x2="600" y2="495" stroke="#2F423B" strokeWidth="10" />

            {[240, 420, 780, 960].map(gx => (
              <line key={gx} x1={gx} y1={gx < 600 ? 135 - ((gx - 60) * 0.21) : 20 + ((gx - 600) * 0.21)} x2={gx} y2="495" stroke="#2F423B" strokeWidth="6" />
            ))}
            <line x1="60" y1="240" x2="1140" y2="240" stroke="#2F423B" strokeWidth="8" />
            <line x1="60" y1="380" x2="1140" y2="380" stroke="#2F423B" strokeWidth="6" />

            {/* Misty Overgrown Garden Silhouettes Outside */}
            <path
              d="M60 495 L60 340 Q180 285 310 345 Q450 265 600 338 Q760 270 910 340 Q1030 295 1140 342 L1140 495 Z"
              fill="#111E22"
              opacity="0.88"
            />

            {/* Hanging Ferns & Trailing Vines inside Conservatory */}
            <g className="animate-foliage-sway">
              <circle cx="155" cy="145" r="68" fill="#254733" />
              <circle cx="215" cy="180" r="52" fill="#325D42" />
              <circle cx="1045" cy="155" r="72" fill="#254733" />
              <circle cx="980" cy="188" r="50" fill="#325D42" />
              {/* Dangling trailing ivy vines */}
              <path d="M150 180 Q130 260 160 320" stroke="#2F6647" strokeWidth="4" fill="none" />
              <path d="M210 200 Q235 270 200 340" stroke="#437E5A" strokeWidth="3.5" fill="none" />
              <path d="M990 200 Q970 280 1000 350" stroke="#2F6647" strokeWidth="4" fill="none" />
              <path d="M1040 180 Q1065 260 1030 330" stroke="#437E5A" strokeWidth="3.5" fill="none" />

              {/* Hanging Lanterns */}
              <line x1="330" y1="0" x2="330" y2="110" stroke="#22302A" strokeWidth="3" />
              <circle cx="330" cy="118" r="12" fill="#F5C77E" className="animate-candle-flicker" />
              <line x1="870" y1="0" x2="870" y2="110" stroke="#22302A" strokeWidth="3" />
              <circle cx="870" cy="118" r="12" fill="#F5C77E" className="animate-candle-flicker" />
            </g>
          </g>
        )}

        {id === 'nocturne' && (
          <g>
            {/* Theatrical Velvet Drapery Swags & Side Cascades */}
            {/* Top Swags */}
            <path
              d="M0 0 Q300 95 600 35 Q900 95 1200 0 L1200 65 Q900 135 600 75 Q300 135 0 65 Z"
              fill="#3B1425"
              stroke="#1E0A13"
              strokeWidth="4"
            />
            {/* Bullion Tassel Fringe */}
            <path
              d="M0 65 Q300 135 600 75 Q900 135 1200 65"
              fill="none"
              stroke="#C9985A"
              strokeWidth="3.5"
              strokeDasharray="6 4"
            />
            {/* Left & Right Velvet Curtain Flanks */}
            <rect x="0" y="0" width="220" height="520" fill="#2B131D" />
            <line x1="170" y1="280" x2="215" y2="295" stroke="#C9985A" strokeWidth="5" />
            <rect x="980" y="0" width="220" height="520" fill="#2B131D" />
            <line x1="1030" y1="280" x2="985" y2="295" stroke="#C9985A" strokeWidth="5" />

            {/* Tall Moonlit Casement Window */}
            <rect x="235" y="40" width="730" height="440" fill={`url(#fp-sky-${id})`} stroke="#36222B" strokeWidth="12" />
            <line x1="600" y1="40" x2="600" y2="480" stroke="#36222B" strokeWidth="9" />
            <line x1="235" y1="210" x2="965" y2="210" stroke="#36222B" strokeWidth="7" />
            <line x1="235" y1="355" x2="965" y2="355" stroke="#36222B" strokeWidth="6" />

            {/* Crescent Moon & Night Sky */}
            <circle cx="775" cy="128" r="34" fill="#F2DFB4" />
            <circle cx="788" cy="120" r="30" fill={palette.windowSkyTop} />
            <rect x="335" y="95" width="4" height="4" fill="#F2DFB4" opacity="0.85" />
            <rect x="440" y="145" width="3" height="3" fill="#F2DFB4" opacity="0.7" />
            <rect x="675" y="88" width="4" height="4" fill="#F2DFB4" opacity="0.8" />
            <rect x="865" y="175" width="3" height="3" fill="#F2DFB4" opacity="0.75" />

            {/* Distant Midnight Skyline */}
            <path
              d="M235 480 L235 390 L330 370 L420 400 L520 365 L660 395 L790 360 L965 390 L965 480 Z"
              fill="#0A0F1A"
            />
            <rect x="360" y="408" width="10" height="12" fill="#E8AC56" opacity="0.65" />
            <rect x="820" y="395" width="10" height="14" fill="#E8AC56" opacity="0.7" />

            {/* Carved Walnut Boiserie Wainscot Below Sill */}
            <rect x="235" y="480" width="730" height="40" fill="#22141A" stroke="#3D222E" strokeWidth="2" />

            {/* Background Candlesticks on Sill */}
            <rect x="290" y="440" width="10" height="40" fill="#FAF3E8" />
            <circle cx="295" cy="434" r="6" fill="#F2B25C" className="animate-candle-flicker" />
            <rect x="895" y="444" width="10" height="36" fill="#FAF3E8" />
            <circle cx="900" cy="438" r="6" fill="#F2B25C" className="animate-candle-flicker" />
          </g>
        )}

        {/* Ambient Lamp Halo */}
        <circle cx="320" cy="420" r="280" fill={`url(#fp-lamp-${id})`} />
      </svg>

      {/* Atmospheric Weather Overlay */}
      <CafeWeatherCanvas roomId={id} lampLit={lampLit} intensity="first_person" />

      {/* Distant Fellow Readers Sitting in the Room (Ambient Co-Presence) */}
      <div className="absolute bottom-[135px] inset-x-0 flex items-end justify-around px-16 sm:px-32 pointer-events-none z-10 opacity-85">
        {demoPatrons.slice(0, 2).map((npc, idx) => (
          <div
            key={npc.id}
            className="flex flex-col items-center transform scale-75 sm:scale-90"
            style={{
              marginBottom: idx === 0 ? '14px' : '4px',
            }}
          >
            <div className="px-2 py-0.5 mb-1 rounded bg-[#140F0C]/75 border border-[#DFC9AA]/30 text-[10px] font-sans font-medium text-[#DFC9AA]">
              {npc.name} · <span className="font-mono text-[9px]">reading</span>
            </div>
            <PixelAvatar
              config={npc.avatarConfig}
              viewMode="seated"
              customWidth={68}
              facing={npc.facing}
              animateIdle={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

