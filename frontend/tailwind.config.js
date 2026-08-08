/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120',
          900: '#131A2C',
        },
        gold: {
          50: '#FDF6E9',
          200: '#F0DBA8',
          500: '#C9974D',
          600: '#B8860B',
          700: '#96690A',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};