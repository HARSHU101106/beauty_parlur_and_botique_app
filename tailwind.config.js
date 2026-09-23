/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F4519A',
          dark: '#D6357E',
          light: '#FFC2DD',
          soft: '#FFF0F6',
        },
        secondary: {
          DEFAULT: '#A66CFF',
          dark: '#8A4DEC',
          light: '#E7D8FF',
          soft: '#F5EEFF',
        },
        admin: {
          DEFAULT: '#6B2F8A',
          dark: '#542373',
          light: '#C9A9DE',
        },
        accent: {
          peach: '#FF9E80',
          mint: '#3FD1A8',
          sky: '#5FC6FF',
          sunny: '#FFD166',
          coral: '#FF7A8A',
        },
        surface: '#FFF7FB',
        muted: '#7A7287',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '26px',
      },
    },
  },
  plugins: [],
};
