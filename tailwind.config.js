/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#E9E0CE',
          DEFAULT: '#E9E0CE',
          dark: '#141210',
          card: '#1c1815',
          'card-hover': '#26211d',
          border: 'rgba(211, 166, 109, 0.22)',
          'border-strong': 'rgba(211, 166, 109, 0.45)',
        },
        ink: {
          dark: '#2B2620',
          DEFAULT: '#2B2620',
          light: '#F0EAE1',
          muted: '#A39B8F',
          faint: '#6A6258',
        },
        wine: {
          DEFAULT: '#784743',
          dark: '#4F2D2A',
          light: '#9B5E59',
          glow: 'rgba(120, 71, 67, 0.35)',
        },
        moss: {
          DEFAULT: '#75816A',
          dark: '#4B5542',
          light: '#8E9C82',
          glow: 'rgba(117, 129, 106, 0.3)',
        },
        amber: {
          DEFAULT: '#D3A66D',
          dark: '#9E743F',
          light: '#E8C18E',
          glow: 'rgba(211, 166, 109, 0.35)',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        editorial: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
      boxShadow: {
        parchment: '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        book: '8px 12px 28px -4px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)',
        'glow-amber': '0 0 25px rgba(211, 166, 109, 0.25)',
        'glow-wine': '0 0 25px rgba(120, 71, 67, 0.35)',
      },
    },
  },
  plugins: [],
}
