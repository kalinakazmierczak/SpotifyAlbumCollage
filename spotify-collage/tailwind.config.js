const { fontFamily } = require('html2canvas/dist/types/css/property-descriptors/font-family');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 6s linear infinite',
      },
    },
  },
  theme: {
  extend: {
    fontFamily: {
      sink: ['Sink', 'sans-serif'],
    },
  },
},

  plugins: [],
}
