/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f5e6c8',
          200: '#edd4a0',
          300: '#e0b868',
          400: '#d4a03a',
          500: '#b8862d',
          600: '#946b24',
          700: '#70511b',
          800: '#4c3612',
          900: '#2d2009',
        },
        fantasy: {
          red: '#8B0000',
          gold: '#DAA520',
          green: '#2E5A3E',
          blue: '#1B3A5C',
          purple: '#4A1A6B',
          brown: '#3D1F0A',
        },
      },
      fontFamily: {
        medieval: ['"MedievalSharp"', 'Georgia', 'serif'],
        body: ['"Crimson Text"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'parchment-texture': "url('/assets/parchment-bg.png')",
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'dice-roll': 'diceRoll 0.6s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        diceRoll: {
          '0%': { transform: 'rotateX(720deg) rotateY(720deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0) rotateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
