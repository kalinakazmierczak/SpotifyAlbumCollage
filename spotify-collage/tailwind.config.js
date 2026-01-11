const { fontFamily } = require('html2canvas/dist/types/css/property-descriptors/font-family');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Courier New', 'monospace'],
        sink: ['Sink', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        spotify: '#1DB954',
      },
    },
  },
  plugins: [],
}
