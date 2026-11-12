import React from 'react';

/**
 * Bespoke Abstract Graphic Editorial SVG Artworks for the 7 Literary Genres
 * Designed strictly adhering to editorial abstract art direction:
 * - Poetry: lyrical ink curves, rhythmic wave-like curves, stippled ink spray, sun focal point.
 * - Philosophy: geometric tension & balance, overlapping slate monoliths, balancing marble sphere.
 * - Romance: intimate warm organic paper forms, two curved painterly forms gently overlapping (NO hearts).
 * - Mystery & Thriller: chiaroscuro raking shadows & slit of warm amber light (NO magnifying glasses/skulls).
 * - Classics: classical fluted columns, pediment geometry, architectural proportion lines.
 * - Fantasy: celestial horizon rings, shifting crescent geometries, floating crystalline shards (NO castles).
 * - Literary Fiction: psychological contour ripples, open leaf dissolving into reflective lines.
 */

interface GenreArtworkProps {
  className?: string;
}

export const GenreArtworkPoetry: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Poetry: Lyrical ink curves and rhythm"
  >
    {/* Sun / focal ink circle */}
    <circle cx="72" cy="28" r="9" fill="#6E3E44" fillOpacity="0.85" />
    <circle cx="72" cy="28" r="14" stroke="#6E3E44" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.5" />

    {/* Primary lyrical calligraphic ink stroke */}
    <path
      d="M12 78 C 24 78, 32 34, 52 38 C 68 42, 60 76, 88 56"
      stroke="#6E3E44"
      strokeWidth="2.8"
      strokeLinecap="round"
    />

    {/* Counter-rhythm echo curves */}
    <path
      d="M18 84 C 28 84, 38 48, 54 50 C 70 54, 72 82, 92 68"
      stroke="#9E5D65"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
    <path
      d="M26 89 C 38 89, 46 64, 58 64 C 74 64, 82 86, 96 78"
      stroke="#6E3E44"
      strokeWidth="0.75"
      strokeDasharray="1.5 2"
      strokeOpacity="0.55"
    />

    {/* Ink spray / stippled rhythm */}
    <circle cx="38" cy="26" r="1.5" fill="#6E3E44" />
    <circle cx="44" cy="20" r="1.1" fill="#6E3E44" fillOpacity="0.7" />
    <circle cx="50" cy="25" r="0.9" fill="#9E5D65" />
    <circle cx="78" cy="74" r="1.3" fill="#6E3E44" fillOpacity="0.8" />
    <circle cx="84" cy="79" r="1.0" fill="#9E5D65" fillOpacity="0.6" />
    <circle cx="89" cy="73" r="0.75" fill="#6E3E44" fillOpacity="0.5" />
  </svg>
);

export const GenreArtworkPhilosophy: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Philosophy: Geometric tension and balance"
  >
    {/* Ground baseline */}
    <line x1="16" y1="84" x2="84" y2="84" stroke="#3A4435" strokeWidth="1.5" strokeOpacity="0.75" />

    {/* Balancing fulcrum sphere */}
    <circle cx="50" cy="66" r="12" fill="#3A4435" fillOpacity="0.9" />
    <circle cx="47" cy="63" r="3.5" fill="#EFF2EC" fillOpacity="0.45" />

    {/* Cantilevered monolith slate bar perched in tension */}
    <g transform="rotate(-7 50 54)">
      <rect
        x="20"
        y="50"
        width="60"
        height="8"
        rx="1"
        fill="#5E6E57"
        stroke="#3A4435"
        strokeWidth="1.2"
      />
      {/* Precision ratio tick */}
      <line x1="50" y1="46" x2="50" y2="50" stroke="#3A4435" strokeWidth="1.2" />
    </g>

    {/* Counter-balanced floating geometric shard */}
    <polygon points="76,34 84,46 68,46" fill="#3A4435" fillOpacity="0.7" />

    {/* Labyrinth fragment / golden ratio guide lines */}
    <path
      d="M24 22 H42 V38 H30 V30 H36"
      stroke="#5E6E57"
      strokeWidth="1.1"
      strokeLinecap="square"
      strokeOpacity="0.6"
    />
    <line x1="50" y1="16" x2="50" y2="34" stroke="#3A4435" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.4" />
  </svg>
);

export const GenreArtworkRomance: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Romance: Intimate warm organic paper forms"
  >
    {/* Primary left warm organic silhouette */}
    <path
      d="M32 20 C 46 20, 56 32, 54 52 C 52 70, 36 82, 24 76 C 14 70, 18 36, 32 20 Z"
      fill="#8C4F5E"
      fillOpacity="0.75"
    />

    {/* Secondary right overlapping silhouette gently leaning in */}
    <path
      d="M66 28 C 78 34, 82 54, 74 70 C 66 84, 46 80, 48 62 C 50 46, 56 22, 66 28 Z"
      fill="#D98A96"
      fillOpacity="0.65"
    />

    {/* Shared overlapping locus contour */}
    <path
      d="M44 32 C 54 44, 52 64, 46 74"
      stroke="#5E2835"
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    {/* Fine tactile contour echoes */}
    <path
      d="M28 26 C 38 26, 44 36, 42 52 C 40 66, 30 74, 22 70"
      stroke="#5E2835"
      strokeWidth="0.8"
      strokeOpacity="0.5"
    />
    <path
      d="M70 34 C 78 40, 78 54, 72 66"
      stroke="#8C4F5E"
      strokeWidth="0.8"
      strokeDasharray="2 2"
      strokeOpacity="0.6"
    />

    {/* Subtle amber resonance bead */}
    <circle cx="50" cy="52" r="2.5" fill="#FAF0F2" fillOpacity="0.9" />
  </svg>
);

export const GenreArtworkMystery: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Mystery: Chiaroscuro raking shadows and light sliver"
  >
    {/* Deep midnight ground plane */}
    <rect x="14" y="16" width="72" height="68" fill="#152130" rx="2" />

    {/* Angular shadow wedge cutting across */}
    <polygon points="14,16 62,16 38,84 14,84" fill="#0C141D" />

    {/* Raking sliver of amber light cast through doorway void */}
    <polygon
      points="62,16 66,16 54,84 46,84"
      fill="#E5B25D"
      fillOpacity="0.92"
    />

    {/* Secondary soft penumbra gradient reflection */}
    <polygon
      points="66,16 78,16 70,84 54,84"
      fill="#8B9EB5"
      fillOpacity="0.22"
    />

    {/* Razor threshold line */}
    <line x1="62" y1="16" x2="46" y2="84" stroke="#FFF7E6" strokeWidth="1" strokeOpacity="0.8" />

    {/* Suspended atmospheric dust speck */}
    <circle cx="58" cy="40" r="1.2" fill="#FFF7E6" />
    <circle cx="54" cy="56" r="0.9" fill="#FFF7E6" fillOpacity="0.75" />
    <circle cx="50" cy="68" r="0.7" fill="#E5B25D" />
  </svg>
);

export const GenreArtworkClassics: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Classics: Fluted columns and classical pediment geometry"
  >
    {/* Classical pediment triangle apex */}
    <polygon points="50,18 20,34 80,34" stroke="#443223" strokeWidth="1.5" fill="#FAF6F0" />
    <line x1="26" y1="31" x2="74" y2="31" stroke="#825E40" strokeWidth="0.75" />
    <circle cx="50" cy="27" r="2.2" fill="#C99742" />

    {/* Entablature frieze block */}
    <rect x="22" y="34" width="56" height="5" fill="#443223" />

    {/* Fluted column array */}
    {/* Left Column */}
    <rect x="26" y="39" width="10" height="40" fill="#EFE8DD" stroke="#443223" strokeWidth="1" />
    <line x1="29.5" y1="41" x2="29.5" y2="77" stroke="#825E40" strokeWidth="0.8" />
    <line x1="32.5" y1="41" x2="32.5" y2="77" stroke="#825E40" strokeWidth="0.8" />

    {/* Center Left Column */}
    <rect x="40" y="39" width="7" height="40" fill="#EFE8DD" stroke="#443223" strokeWidth="1" />
    <line x1="43.5" y1="41" x2="43.5" y2="77" stroke="#825E40" strokeWidth="0.8" />

    {/* Center Right Column */}
    <rect x="53" y="39" width="7" height="40" fill="#EFE8DD" stroke="#443223" strokeWidth="1" />
    <line x1="56.5" y1="41" x2="56.5" y2="77" stroke="#825E40" strokeWidth="0.8" />

    {/* Right Column */}
    <rect x="64" y="39" width="10" height="40" fill="#EFE8DD" stroke="#443223" strokeWidth="1" />
    <line x1="67.5" y1="41" x2="67.5" y2="77" stroke="#825E40" strokeWidth="0.8" />
    <line x1="70.5" y1="41" x2="70.5" y2="77" stroke="#825E40" strokeWidth="0.8" />

    {/* Stylobate stepped plinth base */}
    <rect x="20" y="79" width="60" height="4" fill="#443223" />
    <rect x="16" y="83" width="68" height="3" fill="#825E40" />
  </svg>
);

export const GenreArtworkFantasy: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Fantasy: Celestial horizon rings and crystal shards"
  >
    {/* Tilted orbital celestial ellipse */}
    <ellipse
      cx="50"
      cy="52"
      rx="38"
      ry="15"
      transform="rotate(-18 50 52)"
      stroke="#4D3C5C"
      strokeWidth="1.3"
      strokeDasharray="4 2"
    />
    <ellipse
      cx="50"
      cy="52"
      rx="28"
      ry="10"
      transform="rotate(-18 50 52)"
      stroke="#8F73A6"
      strokeWidth="0.8"
      strokeOpacity="0.6"
    />

    {/* Central suspended crystal lozenge */}
    <polygon
      points="50,22 62,50 50,78 38,50"
      fill="#4D3C5C"
      fillOpacity="0.85"
      stroke="#8F73A6"
      strokeWidth="1"
    />
    <polygon points="50,22 62,50 50,78" fill="#755B8B" fillOpacity="0.4" />
    <line x1="50" y1="22" x2="50" y2="78" stroke="#FAF0F7" strokeWidth="0.75" strokeOpacity="0.75" />

    {/* Floating crystalline orbital shards */}
    <polygon points="74,30 78,38 72,40 68,34" fill="#A890BF" />
    <polygon points="26,62 30,68 24,72 20,66" fill="#8F73A6" fillOpacity="0.7" />

    {/* Stippled starfield constellation */}
    <circle cx="28" cy="28" r="1.2" fill="#4D3C5C" />
    <circle cx="78" cy="68" r="1.4" fill="#4D3C5C" />
    <circle cx="34" cy="36" r="0.8" fill="#8F73A6" />
    <circle cx="68" cy="22" r="0.9" fill="#8F73A6" />
    <circle cx="50" cy="14" r="1.5" fill="#4D3C5C" />
  </svg>
);

export const GenreArtworkLiteraryFiction: React.FC<GenreArtworkProps> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Literary Fiction: Psychological contour ripples"
  >
    {/* Concentric topographic interior mind ripples */}
    <path
      d="M16 66 C 26 44, 44 42, 50 54 C 56 66, 74 64, 84 46"
      stroke="#7C7960"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M18 56 C 28 36, 44 34, 50 44 C 56 54, 72 52, 82 36"
      stroke="#5A5844"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
    <path
      d="M22 46 C 30 28, 44 26, 50 34 C 56 42, 70 40, 78 26"
      stroke="#7C7960"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
    <path
      d="M26 36 C 34 22, 44 20, 50 26 C 56 32, 66 30, 74 18"
      stroke="#7C7960"
      strokeWidth="0.75"
      strokeDasharray="2 2"
      strokeOpacity="0.5"
    />

    {/* Dissolving leaf / reflective page stratum */}
    <path
      d="M30 76 Q 50 68 70 76"
      stroke="#444333"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M36 82 Q 50 75 64 82"
      stroke="#7C7960"
      strokeWidth="1"
      strokeOpacity="0.75"
    />

    {/* Luminous halo focal droplet */}
    <circle cx="50" cy="54" r="3.2" fill="#7C7960" fillOpacity="0.85" />
    <circle cx="50" cy="54" r="6" stroke="#7C7960" strokeWidth="0.6" strokeDasharray="1.5 1.5" strokeOpacity="0.5" />
  </svg>
);

export const GENRE_ARTWORK_MAP: Record<string, React.FC<GenreArtworkProps>> = {
  Poetry: GenreArtworkPoetry,
  Philosophy: GenreArtworkPhilosophy,
  Romance: GenreArtworkRomance,
  'Mystery & Thriller': GenreArtworkMystery,
  Classics: GenreArtworkClassics,
  Fantasy: GenreArtworkFantasy,
  'Literary Fiction': GenreArtworkLiteraryFiction,
};

