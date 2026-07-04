/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        rwanda: {
          green: '#00A550',
          yellow: '#FAD201',
          blue: '#20603D',
          sky: '#1A73E8',
        },
        brand: {
          primary: '#1A73E8',
          dark: '#0D1B2A',
          accent: '#00A550',
          light: '#F8FAFC',
        }
      },
    },
  },
  plugins: [],
}
