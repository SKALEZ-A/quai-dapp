/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B1E3F',
        secondary: '#6C3B9E',
        background: '#0D0D0D',
        surface: '#1A1A1A',
        text: {
          primary: '#EDEDED',
          secondary: '#A0A0A0',
        },
        border: '#2a2a2a',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #8B1E3F, #6C3B9E)',
      },
    },
  },
  plugins: [],
}
