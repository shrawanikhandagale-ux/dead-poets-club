/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRD Draft v2 Specification Palette (Light Academia + Library Vibes)
        linen: {
          light: '#FFFDF9',
          DEFAULT: '#FFF9F3',
          dark: '#F5ECE1',
        },
        latte: {
          light: '#E6D5BE',
          DEFAULT: '#DBC4A5',
          dark: '#CCA982',
        },
        cafenoir: {
          light: '#5D4532',
          DEFAULT: '#443223',
          dark: '#2E2116',
        },
        clockwork: {
          light: '#8C6E51',
          DEFAULT: '#72583E',
          dark: '#58432D',
        },
        deepolive: {
          light: '#5B583E',
          DEFAULT: '#44422D',
          dark: '#302F1F',
        },
        mauve: {
          light: '#8E6767',
          DEFAULT: '#755151',
          dark: '#5A3D3D',
        },
        cedar: {
          light: '#939074',
          DEFAULT: '#7C7960',
          dark: '#636049',
        },
        weathered: {
          light: '#B7A08C',
          DEFAULT: '#A08670',
          dark: '#856C57',
        },
        // Legacy mapping backwards compatibility
        paper: {
          light: '#FFF9F3',
          DEFAULT: '#FFF9F3',
          dark: '#141210',
          card: '#DBC4A5',
          'card-hover': '#CCA982',
          border: '#A08670',
          'border-strong': '#443223',
        },
        ink: {
          dark: '#443223',
          DEFAULT: '#443223',
          light: '#FFF9F3',
          muted: '#72583E',
          faint: '#A08670',
        },
        wine: {
          DEFAULT: '#755151',
          dark: '#5A3D3D',
          light: '#8E6767',
          glow: 'rgba(117, 81, 81, 0.35)',
        },
        moss: {
          DEFAULT: '#7C7960',
          dark: '#44422D',
          light: '#939074',
          glow: 'rgba(124, 121, 96, 0.3)',
        },
        amber: {
          DEFAULT: '#DBC4A5',
          dark: '#72583E',
          light: '#E6D5BE',
          glow: 'rgba(219, 196, 165, 0.35)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        editorial: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['Courier Prime', 'Courier', 'monospace'],
        typewriter: ['Courier Prime', 'Courier', 'monospace'],
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
      boxShadow: {
        parchment: '0 4px 20px -2px rgba(68, 50, 35, 0.12), 0 2px 6px -1px rgba(68, 50, 35, 0.08)',
        book: '6px 10px 24px -2px rgba(68, 50, 35, 0.35), 0 2px 6px rgba(68, 50, 35, 0.2)',
        stamped: '3px 3px 0px #443223',
        'stamped-lg': '5px 5px 0px #443223',
        'glow-mauve': '0 0 25px rgba(117, 81, 81, 0.25)',
      },
    },
  },
  plugins: [],
}
