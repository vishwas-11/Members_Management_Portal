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
          50:  '#f4fbf7',
          100: '#e6f3ec',
          200: '#c2dec9',
          400: '#40916c',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#143225',
          800: '#0d2119',
        },
        cream: {
          50:  '#fafdfb',
          100: '#eaf4ee',
          200: '#d8e7dd',
        },
        gold: {
          400: '#40916c',
          600: '#1b4332',
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
