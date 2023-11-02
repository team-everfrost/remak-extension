/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./**/*.vue"],
  theme: {
    extend: {
      colors: {
        'remak-blue': '#1F8CE6',
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          '"Pretendard"',
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
  plugins: [],
}

