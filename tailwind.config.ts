import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f0',
          100: '#d8ecd8',
          200: '#b2d9b3',
          400: '#5ea661',
          600: '#2e6130',
          800: '#1a3c1b',
        },
        cream: {
          50:  '#fdfaf4',
          100: '#f7f0e0',
          200: '#ede0c4',
        },
        gold: {
          400: '#c9952a',
          600: '#a37820',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
